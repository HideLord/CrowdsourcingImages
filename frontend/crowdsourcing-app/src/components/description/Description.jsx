import React, { useContext, useRef, useState } from "react";
import ReactLoading from "react-loading";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { toast } from "react-toastify";
import "../../App.css";
import { DescriptionContext, State } from "../../contexts/DescriptionContext/DescriptionContext";
import { OptionsContext } from "../../contexts/OptionsContext/OptionsContext";
import { getImageUrls, storePair } from "../../utils/dbUtil";
import checkFundsAndSend from "../../utils/fundsManager";
import { Detail, calculateGPT4VPrice, estimateGPT4VPrice, sendGPT4VInstruction } from "../../utils/openAi";
import Authentication from "../authentication/Authentication";
import Image from "../image/Image";
import { CheckBox, NumberInput, TextField } from "../misc/miscComponents";
import ProgressBar from "../progressBar/ProgressBar";
import "./Description.css";

const INSTRUCTION = "Describe the image in detail.";


function parseTextArea(imageUrls) {
    return imageUrls.split(",").map(s => s.trim()).filter(Boolean);
}


function Options({ data }) {
    return (
        <div className="options-div">
            <label style={{marginLeft: '10px'}}>API Key:
                <TextField
                    placeholder="Enter Your API Key Here"
                    value={data.apiKey}
                    onChange={e => data.setApiKey(e.target.value)}
                />
            </label>
            <NumberInput
                label="Threads:"
                value={data.numThreads}
                onChange={e => data.setNumThreads(parseInt(e.target.value, 10))}
            />
            <NumberInput
                label="Max Tokens:"
                value={data.maxTokens}
                onChange={e => data.setMaxTokens(parseInt(e.target.value, 10))}
            />
            <CheckBox
                checked={data.highRes}
                onChange={e => data.setHighRes(e.target.checked)}
                label="High Res."
            />
        </div>
    )
}


function createStorePairData(instruction, highRes, response) {
    let data = {};
    data.type = "description";
    data.instruction = instruction;
    data.detail = highRes ? Detail.HIGH : Detail.LOW;
    data.response = response.choices[0].message.content;
    data.promptTokens = response.usage.prompt_tokens;
    data.completionTokens = response.usage.completion_tokens;

    return data;
}


async function send(data) {
    data.setSendDisabled(true);

    const pool = [];

    let totalSpent = data.cashSpentThisSession; // totalSpent should have the latest value of the cashSpentThisSession because of run-to-completion.

    const processImage = async (i) => {
        if (data.images[i].state !== State.PENDING && data.images[i].state !== State.FAILURE) {
            return;
        }

        const estimatedPrice = estimateGPT4VPrice(data.highRes ? Detail.HIGH : Detail.LOW);
        if (data.cashLimitThisSession && totalSpent + estimatedPrice > data.cashLimitThisSession) {
            return;
        }

        data.setCashSpentThisSession(prev => {
            const spent = prev + estimatedPrice;
            totalSpent = spent;
            return spent;
        });

        const imageUrl = data.images[i].url;

        data.setImages(prevImages => {
            const updatedImages = [...prevImages];
            updatedImages[i] = {
                ...updatedImages[i],
                state: State.SENDING,
                tooltip: "Sending...",
            };
            return updatedImages;
        });

        try {
            const response = await checkFundsAndSend(calculateGPT4VPrice, sendGPT4VInstruction, [data.apiKey, imageUrl, INSTRUCTION, data.highRes ? Detail.HIGH : Detail.LOW]);
            const storeData = createStorePairData(INSTRUCTION, data.highRes, response);

            data.setCashSpentThisSession(prev => {
                const spent = prev - estimatedPrice + calculateGPT4VPrice(response);
                totalSpent = spent;
                return spent;
            });

            storePair(imageUrl, storeData);

            data.setImages(prevImages => {
                const updatedImages = [...prevImages];
                updatedImages[i] = {
                    ...updatedImages[i],
                    state: State.SUCCESS,
                    tooltip: response.choices[0].message.content,
                };
                return updatedImages;
            });
        } catch (error) {
            console.error("Error occurred in sendGPT4VInstruction:", error);

            data.setCashSpentThisSession(prev => {
                const spent = prev - estimatedPrice;
                totalSpent = spent;
                return spent;
            });

            data.setImages(prevImages => {
                const updatedImages = [...prevImages];
                updatedImages[i] = {
                    ...updatedImages[i],
                    state: State.FAILURE,
                    tooltip: error,
                };
                return updatedImages;
            });
        }
    };

    for (let i = 0; i < data.images.length; ++i) {
        if (pool.length >= data.numThreads) {
            await Promise.race(pool);
        }

        const currentPromise = processImage(i).finally(() => {
            pool.splice(pool.indexOf(currentPromise), 1);
        });

        pool.push(currentPromise);
    }

    await Promise.all(pool);

    data.setCashSpentThisSession(0.00);
    data.setSendDisabled(false);
}

function SendButton({ data }) {
    return (
        <button
            className="blue-button margin-no-top go-button"
            onClick={async () => send(data)}
            disabled={data.isSendDisabled}>
            Send
        </button>
    )
}

function Method({ data }) {
    const prevNumImages = useRef(data.numImages);
    const [formattedUrls, setFormattedUrls] = useState(data.images.map(image => image.url).join(",\n\n"));

    return (
        <div className="margin">
            <Tabs defaultIndex={2}>
                <TabList>
                    <Tab>Auto-Choose</Tab>
                    <Tab>Cost Limit</Tab>
                    <Tab>Custom</Tab>
                </TabList>

                <TabPanel>
                    <div className="tab-panel">
                        <p className="margin-no-top">
                            Enter the number of images you'd like to caption, and the system will auto-choose them for you.
                        </p>
                        <label style={{marginLeft: '10px'}}>Image Count:
                            <input
                                className="rounded-corners margin-no-top"
                                type="number"
                                placeholder="Number of images"
                                min="1"
                                max="10000"
                                disabled={data.isSendDisabled}
                                value={data.numImages}
                                onChange={(e) => { data.setNumImages(e.target.value); }}
                                onBlur={async (e) => {
                                    if (prevNumImages.current == e.target.value) {
                                        return;
                                    }

                                    try {
                                        prevNumImages.current = e.target.value;
                                        const image_urls = await getImageUrls(e.target.value);

                                        data.setImages(image_urls.map(url => { return { url, state: State.PENDING, tooltip: url } }));
                                    } catch (error) {
                                        toast.error(`Could not retrieve the image urls: ${error}`);
                                    }
                                }} />
                            </label>
                        <Options data={data} />
                        <SendButton data={data} />
                    </div>
                </TabPanel>
                <TabPanel>
                    <div className="tab-panel">
                        <p className="margin-no-top">
                            Enter the amount of money you'd like to spend captioning images, and the system will automatically caption images until it hits the limit.<br />
                            <span className="nb-label rounded-corners">
                                <span className="warning-icon"></span>
                                The cost is approximated before sending the API request and then corrected. It might go over by a little.
                            </span>
                        </p>
                        <label style={{marginLeft: '10px'}}>Cash Limit:
                            <input
                                className="rounded-corners margin-no-top"
                                type="number"
                                placeholder="Amount of Money"
                                min="0"
                                step="0.01"
                                disabled={data.isSendDisabled}
                                value={data.cashLimitThisSession}
                                onChange={(e) => { data.setCashLimitThisSession(parseFloat(e.target.value)); }} />
                        </label>

                        {data.isSendDisabled && data.cashLimitThisSession &&
                            <div className="margin-no-top go-button">
                                <ProgressBar
                                    width="100%"
                                    ratio={Math.min(1.0, data.cashSpentThisSession / data.cashLimitThisSession)}
                                    barColor={"#77DD77"}
                                    text={`${data.cashSpentThisSession.toFixed(2)}/${data.cashLimitThisSession.toFixed(2)}`}
                                />
                            </div>
                        }
                        <Options data={data} />
                        <SendButton data={data} />
                    </div>
                </TabPanel>
                <TabPanel>
                    <div className="tab-panel">
                        <p className="margin-no-top">
                            Enter comma-separated image URLs into the textbox below.
                        </p>
                        <textarea
                            className="rounded-corners margin-no-top textarea long-textarea"
                            placeholder="Enter image URLs, separated by commas"
                            value={formattedUrls}
                            disabled={data.isSendDisabled}
                            onChange={(e) => {
                                setFormattedUrls(e.target.value.replace(/,(?!\n)/gm, ",\n\n"));
                            }}
                            onBlur={(e) => {
                                const image_urls = parseTextArea(e.target.value);
                                data.setImages(image_urls.map(url => { return { url, state: State.PENDING, tooltip: url } }));
                            }}>
                        </textarea>
                        <Options data={data} />
                        <SendButton data={data} />
                    </div>
                </TabPanel>
            </Tabs>
        </div>
    )
}


function Pagination({ data }) {
    const pageChange = (e) => {
        let page = parseInt(e.target.value);
        if (page > Math.ceil(data.images.length / data.IMAGES_PER_PAGE)) {
            page = Math.ceil(data.images.length / data.IMAGES_PER_PAGE);
        }
        if (page <= 0 || !page) {
            page = 1;
        }
        data.setCurrentPage(page - 1);
    };

    return (
        <div className="page-control">
            <button
                onClick={() => {
                    data.setCurrentPage(0);
                }}
                disabled={data.currentPage === 0}
            >
                &lt;&lt;
            </button>
            <button
                onClick={() => {
                    data.setCurrentPage((prev) => (prev > 0 ? prev - 1 : 0));
                }}
                disabled={data.currentPage === 0}
            >
                &lt;
            </button>
            <input
                className="page-number rounded-corners"
                type="number"
                min="0"
                max={toString(Math.ceil(data.images.length / data.IMAGES_PER_PAGE))}
                value={data.currentPage + 1}
                onChange={pageChange}
                onBlur={pageChange}
            />
            <button
                onClick={() => {
                    data.setCurrentPage((prev) => (prev + 1) < Math.ceil(data.images.length / data.IMAGES_PER_PAGE) ? prev + 1 : prev);
                }}
                disabled={data.currentPage >= Math.ceil(data.images.length / data.IMAGES_PER_PAGE) - 1}
            >
                &gt;
            </button>
            <button
                onClick={() => {
                    data.setCurrentPage(Math.ceil(data.images.length / data.IMAGES_PER_PAGE) - 1);
                }}
                disabled={data.currentPage >= Math.ceil(data.images.length / data.IMAGES_PER_PAGE) - 1}
            >
                &gt;&gt;
            </button>
        </div>
    )
}


function DescriptionBody() {
    const [isSendDisabled, setSendDisabled] = useState(false);
    const [showBinIcon, setShowBinIcon] = useState(-1);
    const IMAGES_PER_PAGE = 50 - (50 % Math.floor(window.innerWidth / 272)); // Trying to estimate before hand how many picture will fit perfectly.

    const {
        apiKey, setApiKey,
        highRes, setHighRes,
        maxTokens, setMaxTokens,
    } = useContext(OptionsContext);

    const {
        images, setImages,
        numThreads, setNumThreads,
        currentPage, setCurrentPage,
        cashLimitThisSession, setCashLimitThisSession,
        cashSpentThisSession, setCashSpentThisSession,
        numImages, setNumImages,
    } = useContext(DescriptionContext);

    const getImagesToShow = () => {
        return images.slice(
            currentPage * IMAGES_PER_PAGE,
            (currentPage + 1) * IMAGES_PER_PAGE
        );
    }

    let imagesToShow = getImagesToShow();

    const data = {
        images, setImages,
        apiKey, setApiKey,
        highRes, setHighRes,
        maxTokens, setMaxTokens,
        numThreads, setNumThreads,
        isSendDisabled, setSendDisabled,
        cashLimitThisSession, setCashLimitThisSession,
        cashSpentThisSession, setCashSpentThisSession,
        numImages, setNumImages,
        currentPage, setCurrentPage,
        IMAGES_PER_PAGE
    }

    return (
        <div className="column-div hide-scrollbar">
            <Method data={data}></Method>
            <div className="column-div image-grid margin">
                {imagesToShow.map(({ url, state, tooltip }, index) => (
                    <div
                        key={url}
                        style={{ position: "relative" }}
                        data-tooltip-id="image-tooltip"
                        data-tooltip-html={`<div style='max-width:320px; word-wrap:break-word;'>${tooltip}</div>`}
                        onMouseEnter={() => setShowBinIcon(index)}
                        onMouseLeave={() => setShowBinIcon(-1)}
                    >
                        {state === State.SENDING && <><div className="overlay" /><div className="sending-spinner"><ReactLoading type={"spin"} color={"DarkSeaGreen"} height={50} width={50} /></div></>}
                        {state === State.SUCCESS && <><div className="overlay" /><div className="check"><label>✔️</label></div></>}
                        {state === State.FAILURE && <><div className="overlay" /><div className="cross"><label>❌</label></div></>}
                        {
                            (state === State.FAILURE || state === State.PENDING) && showBinIcon === index &&
                            <img
                                src="/bin.png"
                                alt="delete"
                                className="bin"
                                onClick={() => {
                                    const newImages = [...images];
                                    newImages.splice(index + IMAGES_PER_PAGE * currentPage, 1);
                                    setImages(newImages);
                                    imagesToShow = getImagesToShow();
                                }}
                            />
                        }
                        <Image imageUrl={url} imageClass="image-256" wrapperClass="image-wrapper" />
                    </div>
                ))}
            </div>
            <Pagination data={data} />
        </div >
    )
}


export default function Description() {
    return (
        <Authentication>
            <DescriptionBody />
        </Authentication>
    );
};