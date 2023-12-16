import React, { useState, useRef, useContext } from "react";
import "./Description.css"
import "../../App.css"
import Authentication from "../authentication/Authentication";
import Image from "../image/Image";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { Detail, calculateGPT4VPrice, sendGPT4VInstruction } from "../../utils/openAi"
import { NumberInput, CheckBox, TextField } from "../misc/miscComponents";
import checkFundsAndSend from "../../utils/fundsManager";
import { storePair, getImageUrls } from "../../utils/dbUtil"
import ReactLoading from "react-loading";
import { State, DescriptionContext } from "../../contexts/DescriptionContext/DescriptionContext";
import { OptionsContext } from "../../contexts/OptionsContext/OptionsContext";

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

    const processImage = async (i) => {
        if (data.states[i] !== State.PENDING && data.states[i] !== State.FAILURE) {
            return;
        }

        const imageUrl = data.images[i];

        data.setStates(prevStates => {
            const newStates = [...prevStates];
            newStates[i] = State.SENDING;
            return newStates;
        });

        try {
            const response = await checkFundsAndSend(calculateGPT4VPrice, sendGPT4VInstruction, [data.apiKey, imageUrl, INSTRUCTION, data.highRes ? Detail.HIGH : Detail.LOW]);
            const storeData = createStorePairData(INSTRUCTION, data.highRes, response);

            storePair(imageUrl, storeData);

            data.setStates(prevStates => {
                const newStates = [...prevStates];
                newStates[i] = State.SUCCESS;
                return newStates;
            });
        } catch (error) {
            console.error("Error occurred in sendGPT4VInstruction:", error);

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

    return (
        <div className="margin">
            <Tabs>
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
                        onBlur={async (e) => {
                            if (prevNumImages.current == e.target.value) {
                                return;
                            }

                            try {
                                prevNumImages.current = e.target.value;
                                const image_urls = await getImageUrls(e.target.value);

                                data.setImages(image_urls);
                                data.setStates(new Array(image_urls.length).fill(State.PENDING));
                            } catch(error) {
                                console.error("Could not retrieve the image urls: ", error);
                            }
                        }} />
                    <Options data={data} />
                </TabPanel>
                <TabPanel>
                    <p className="margin-no-top">
                        Enter the amount of money you'd like to spend captioning images, and the system will automatically caption images until it hits the limit.
                    </p>
                    <input className="rounded-corners margin-no-top" type="number" placeholder="Amount of money" min="0" step="0.01" />
                    <Options data={data} />
                </TabPanel>
                <TabPanel>
                    <p className="margin-no-top">
                        Enter comma-separated image URLs into the textbox below.
                    </p>
                    <textarea
                        className="rounded-corners margin-no-top textarea long-textarea"
                        placeholder="Enter image URLs, separated by commas"
                        value={data.images.join(",\n\n")}
                        onChange={(e) => {
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

    const {
        apiKey, setApiKey,
        highRes, setHighRes,
        maxTokens, setMaxTokens,
    } = useContext(OptionsContext);

    const {
        images, setImages,
        states, setStates,
        numThreads, setNumThreads,
    } = useContext(DescriptionContext);

    const data = {
        images, setImages,
        states, setStates,
        apiKey, setApiKey,
        highRes, setHighRes,
        maxTokens, setMaxTokens,
        numThreads, setNumThreads,
        isSendDisabled, setSendDisabled
    }

    return (
        <div className="column-div">
            <Method data={data}></Method>
            <div className="column-div image-grid margin-no-top">
                {images.map((imageUrl, index) => (
                    <div key={index} style={{ position: "relative" }}>
                        {data.states[index] === State.SENDING && <><div className="overlay" /><div className="sending-spinner"><ReactLoading type={"spin"} color={"DarkSeaGreen"} height={50} width={50} /></div></>}
                        {data.states[index] === State.SUCCESS && <><div className="overlay" /><div className="check"><label>✔️</label></div></>}
                        {data.states[index] === State.FAILURE && <><div className="overlay" /><div className="cross"><label>❌</label></div></>}
                        <Image imageUrl={imageUrl} imageClass="image-256" wrapperClass="image-wrapper" />
                    </div>
                ))}
            </div>
        </div>
    )
}


export default function Description() {
    return (
        <Authentication>
            <DescriptionBody />
        </Authentication>
    );
};