import "./Instruction.css";
import "../../App.css";
import React, { useState, useContext } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { Detail, calculateGPT4VPrice, getGPT4Vpayload, sendGPT4VInstruction } from "../../utils/openAi"
import { storePair } from "../../utils/dbUtil"
import Authentication from "../authentication/Authentication";
import checkFundsAndSend from "../../utils/fundsManager";
import Image from "../image/Image";
import { NumberInput, CheckBox, TextField } from "../misc/miscComponents";
import { OptionsContext } from "../../contexts/OptionsContext/OptionsContext";
import { InstructionContext } from "../../contexts/InstructionContext/InstructionContext";
import { toast } from "react-toastify";

function createStorePairData(instruction, highRes, response) {
    let data = {};
    data.type = "instruction";
    data.instruction = instruction;
    data.detail = highRes ? Detail.HIGH : Detail.LOW;
    data.response = response.choices[0].message.content;
    data.promptTokens = response.usage.prompt_tokens;
    data.completionTokens = response.usage.completion_tokens;

    return data;
}

function SendButton({ isSendDisabled, setSendDisabled, apiKey, imageUrl, instruction, highRes, setResponse }) {
    return (
        <button
            className="blue-button margin-no-top"
            disabled={isSendDisabled}
            onClick={() => {
                setSendDisabled(true);
                checkFundsAndSend(calculateGPT4VPrice, sendGPT4VInstruction, [apiKey, imageUrl, instruction, highRes ? Detail.HIGH : Detail.LOW])
                    .then((response) => {
                        setResponse(JSON.stringify(response, null, 4));
                        setSendDisabled(false);

                        let data = createStorePairData(instruction, highRes, response);
                        storePair(imageUrl, data);
                    })
                    .catch(async (error) => {
                        let errorResponse = { status: error.message };
                        if (error.response) {
                            errorResponse.body = await error.response.json();
                            toast.error(`Error occurred while sending image: ${errorResponse.body.error.message}`);
                        } else {
                            toast.error(`Error occurred while sending image: ${error}`);
                        }
                        setResponse(JSON.stringify(errorResponse, null, 4));
                        setSendDisabled(false);
                    });
            }}
        >
            Send
        </button>
    )
}

function RequestResponse({ formattedPayload, formattedResponse }) {
    return (
        <div className="margin-no-top">
            <Tabs>
                <TabList>
                    <Tab>Request</Tab>
                    <Tab>Response</Tab>
                </TabList>

                <TabPanel>
                    <pre className="gray-text margin-no-top">
                        <code>
                            {formattedPayload}
                        </code>
                    </pre>
                </TabPanel>
                <TabPanel>
                    <pre className="gray-text margin-no-top">
                        <code>
                            {formattedResponse}
                        </code>
                    </pre>
                </TabPanel>
            </Tabs>
        </div>
    )
}

function ImagePreview({ imageUrl }) {
    return (
        <div className="image-preview-container margin-no-top">
            <img
                src={imageUrl}
                alt="Image Preview"
                className="image-preview"
            />
            <div className="resolution-text">512x512</div>
            <div className="preview-text">Preview</div>
        </div>
    )
}


function InstructionBody() {
    const [isSendDisabled, setSendDisabled] = useState(false);

    const {
        apiKey, setApiKey,
        highRes, setHighRes,
        maxTokens, setMaxTokens,
    } = useContext(OptionsContext);

    const {
        imageUrl, setImageUrl,
        instruction, setInstruction,
        formattedResponse, setResponse,
    } = useContext(InstructionContext);

    const formattedPayload = JSON.stringify(getGPT4Vpayload(imageUrl, instruction, highRes ? Detail.HIGH : Detail.LOW, maxTokens), null, 4);

    return (
        <div className="row-div">
            <div className="column-div-half">
                <textarea
                    placeholder="Instruction Goes Here"
                    className="rounded-corners textarea margin"
                    value={instruction}
                    onChange={e => setInstruction(e.target.value)}
                />
                <div className="row-div">
                    <label style={{marginLeft: '10px'}}>API Key:
                        <TextField
                            className="margin-no-top"
                            placeholder="Enter Your API Key Here"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                        />
                    </label>
                    <NumberInput
                        label="Max Tokens:"
                        value={maxTokens}
                        onChange={e => setMaxTokens(parseInt(e.target.value, 10))}
                    />
                    <CheckBox
                        checked={highRes}
                        onChange={e => setHighRes(e.target.checked)}
                        label="High Res."
                    />
                </div>
                <SendButton
                    isSendDisabled={isSendDisabled}
                    setSendDisabled={setSendDisabled}
                    apiKey={apiKey}
                    highRes={highRes}
                    imageUrl={imageUrl}
                    instruction={instruction}
                    setResponse={setResponse}
                />
                <RequestResponse
                    formattedPayload={formattedPayload}
                    formattedResponse={formattedResponse}
                />
            </div>

            <div className="column-div-half">
                <div className="margin">
                    <Image imageUrl={imageUrl} />
                </div>
                <TextField
                    placeholder="Enter image URL"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                />
                {
                    !highRes && imageUrl &&
                    <ImagePreview imageUrl={imageUrl} />
                }
            </div>
        </div>
    );
}


export default function Instruction() {
    return (
        <Authentication>
            <InstructionBody />
        </Authentication>
    )
}