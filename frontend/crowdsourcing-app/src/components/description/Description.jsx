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
        <div className="row-div">
            <TextField
                className="margin-no-top"
                placeholder="Enter Your API KEY Here"
                value={data.apiKey}
                onChange={e => data.setApiKey(e.target.value)}
            />
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
        if (data.states[i] !== State.PENDING && data.states[i] !== State.FAILURE) {
            return;
        }

        const estimatedPrice = estimateGPT4VPrice(data.highRes ? Detail.HIGH : Detail.LOW);
        if (totalSpent + estimatedPrice > data.cashLimitThisSession) {
            return;
        }

        data.setCashSpentThisSession(prev => { 
            const spent = prev + estimatedPrice;
            totalSpent = spent;
            return spent;
        });

        const imageUrl = data.images[i];

        data.setStates(prevStates => {
            const newStates = [...prevStates];
            newStates[i] = State.SENDING;
            return newStates;
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

            data.setStates(prevStates => {
                const newStates = [...prevStates];
                newStates[i] = State.SUCCESS;
                return newStates;
            });
        } catch (error) {
            console.error("Error occurred in sendGPT4VInstruction:", error);

            data.setCashSpentThisSession(prev => { 
                const spent = prev - estimatedPrice;
                totalSpent = spent;
                return spent;
            });

            data.setStates(prevStates => {
                const newStates = [...prevStates];
                newStates[i] = State.FAILURE;
                return newStates;
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

    data.setSendDisabled(false);
}


function Method({ data }) {
    const prevNumImages = useRef(null);
    const [formattedUrls, setFormattedUrls] = useState(data.images.join(",\n\n"));

    return (
        <div className="margin">
            <Tabs defaultIndex={2}>
                <TabList>
                    <Tab>Auto-Choose</Tab>
                    <Tab>Cost Limit</Tab>
                    <Tab>Custom</Tab>
                </TabList>

                <TabPanel>
                    <p className="margin-no-top">
                        Enter the number of images you'd like to caption, and the system will auto-choose them for you.
                    </p>
                    <input
                        className="rounded-corners margin-no-top"
                        type="number"
                        placeholder="Number of images"
                        min="1"
                        max="10000"
                        disabled={data.isSendDisabled}
                        onBlur={async (e) => {
                            if (prevNumImages.current == e.target.value) {
                                return;
                            }

                            try {
                                prevNumImages.current = e.target.value;
                                const image_urls = await getImageUrls(e.target.value);

                                data.setImages(image_urls);
                                data.setStates(new Array(image_urls.length).fill(State.PENDING));
                            } catch (error) {
                                toast.error(`Could not retrieve the image urls: ${error}`);
                            }
                        }} />
                    <Options data={data} />
                </TabPanel>
                <TabPanel>
                    <p className="margin-no-top">
                        Enter the amount of money you'd like to spend captioning images, and the system will automatically caption images until it hits the limit.<br />
                        <span class="nb-label">
                            <span class="warning-icon"></span>
                            The cost is approximated before we send the API request. As such, it might go over the limit by little.
                        </span>
                    </p>
                    <input
                        className="rounded-corners margin-no-top"
                        type="number"
                        placeholder="Amount of money"
                        min="0"
                        step="0.01"
                        disabled={data.isSendDisabled}
                        value={data.cashLimitThisSession}
                        onChange={(e) => { data.setCashLimitThisSession(parseFloat(e.target.value)); }}
                        onBlur={async (e) => {
                            if (prevNumImages.current == 10000) {
                                return;
                            }

                            try {
                                prevNumImages.current = 10000;
                                const image_urls = await getImageUrls(10000);

                                data.setImages(image_urls);
                                data.setStates(new Array(image_urls.length).fill(State.PENDING));
                            } catch (error) {
                                prevNumImages.current = null;
                                toast.error(`Could not retrieve the image urls: ${error}`);
                            }
                        }} />
                    {data.isSendDisabled && data.cashLimitThisSession &&
                        <div className="margin-no-top go-button">
                            <ProgressBar
                                width='100%'
                                ratio={Math.min(1.0, data.cashSpentThisSession / data.cashLimitThisSession)}
                                barColor={'#77DD77'}
                                text={`${data.cashSpentThisSession.toFixed(2)}/${data.cashLimitThisSession.toFixed(2)}`}
                            />
                        </div>
                    }
                    <Options data={data} />
                </TabPanel>
                <TabPanel>
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
                            data.setImages(image_urls);
                            data.setStates(new Array(image_urls.length).fill(State.PENDING));
                        }}>
                    </textarea>
                    <Options data={data} />
                </TabPanel>
            </Tabs>
            <button
                className="blue-button margin-no-top go-button"
                onClick={async () => send(data)}
                disabled={data.isSendDisabled}>
                Send
            </button>
        </div>
    )
}


function DescriptionBody() {
    const [isSendDisabled, setSendDisabled] = useState(false);
    const IMAGES_PER_PAGE = 50 - (50 % Math.floor(window.innerWidth / 272)); // Trying to estimate before hand how many picture will fit perfectly.

    const {
        apiKey, setApiKey,
        highRes, setHighRes,
        maxTokens, setMaxTokens,
    } = useContext(OptionsContext);

    const {
        images, setImages,
        states, setStates,
        numThreads, setNumThreads,
        currentPage, setCurrentPage,
        cashLimitThisSession, setCashLimitThisSession,
        cashSpentThisSession, setCashSpentThisSession,
    } = useContext(DescriptionContext);

    const imagesToShow = images.slice(
        currentPage * IMAGES_PER_PAGE,
        (currentPage + 1) * IMAGES_PER_PAGE
    );

    const data = {
        images, setImages,
        states, setStates,
        apiKey, setApiKey,
        highRes, setHighRes,
        maxTokens, setMaxTokens,
        numThreads, setNumThreads,
        isSendDisabled, setSendDisabled,
        cashLimitThisSession, setCashLimitThisSession,
        cashSpentThisSession, setCashSpentThisSession,
    }

    return (
        <div className="column-div hide-scrollbar">
            <Method data={data}></Method>
            <div className="column-div image-grid margin-no-top">
                {imagesToShow.map((imageUrl, index) => (
                    <div key={index} style={{ position: "relative" }}>
                        {data.states[index] === State.SENDING && <><div className="overlay" /><div className="sending-spinner"><ReactLoading type={"spin"} color={"DarkSeaGreen"} height={50} width={50} /></div></>}
                        {data.states[index] === State.SUCCESS && <><div className="overlay" /><div className="check"><label>✔️</label></div></>}
                        {data.states[index] === State.FAILURE && <><div className="overlay" /><div className="cross"><label>❌</label></div></>}
                        <Image imageUrl={imageUrl} imageClass="image-256" wrapperClass="image-wrapper" />
                    </div>
                ))}
            </div>
            <div className="page-control">
                <button
                    onClick={() => {
                        setCurrentPage((prev) => (prev > 0 ? prev - 1 : 0));
                    }}
                    disabled={currentPage === 0}
                >
                    &lt;
                </button>
                <button
                    onClick={() => {
                        setCurrentPage((prev) => (prev + 1) < Math.ceil(data.images.length / IMAGES_PER_PAGE) ? prev + 1 : prev);
                    }}
                    disabled={currentPage >= Math.ceil(data.images.length / IMAGES_PER_PAGE) - 1}
                >
                    &gt;
                </button>
            </div>
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