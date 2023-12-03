import "./Instruction.css";
import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {Detail, getGPT4Vpayload, sendGPT4VInstruction} from '../../utils/openAi'


function TextField({ placeholder, value, onChange }) {
    return (
        <input 
            className="rounded-corners margin-no-top"
            type="text" 
            placeholder={placeholder} 
            value={value} 
            onChange={onChange} 
        />
    )
}

function MaxTokens({ maxTokens, onChange }) {
    return (
        <label htmlFor="maxTokens" className="margin-no-top">
            Max Tokens:  
            <input 
                className="max-tokens rounded-corners"
                id="maxTokens"
                type="number"
                value={maxTokens} 
                onChange={onChange} 
            />
        </label>
    )
}

function CheckBox({ checked, onChange, label }) {
    return (
        <label>
            <input 
                className="margin-no-top"
                type="checkbox" 
                checked={checked} 
                onChange={onChange} 
            />
            {label}
        </label>
    )
}

function SendButton( {isSendDisabled, setSendDisabled, apiKey, imageUrl, instruction, highRes, setResponse} ) {
    return (
        <button 
            className="send-button margin-no-top"
            disabled={isSendDisabled}
            onClick={() => { 
                setSendDisabled(true);
                sendGPT4VInstruction(apiKey, imageUrl, instruction, highRes? Detail.HIGH : Detail.LOW)
                    .then((result) => {
                        setResponse(JSON.stringify(result, null, 4));
                        setSendDisabled(false);
                    })
                    .catch(async (error) => {
                        console.error("Error occurred in sendGPT4VInstruction:", error);
                        let errorResponse = { status: error.message };
                        if (error.response) {
                            errorResponse.body = await error.response.json();
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

function RequestResponse( {formattedPayload, formattedResponse} ) {
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

function ImagePreview( {imageUrl} ) {
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

export default function Instruction() {
    const [imageUrl, setImageUrl] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [instruction, setInstruction] = useState("");
    const [highRes, setHighRes] = useState(false);
    const [maxTokens, setMaxTokens] = useState(300);
    const [formattedResponse, setResponse] = useState("");
    const [isSendDisabled, setSendDisabled] = useState(false);

    const formattedPayload = JSON.stringify(getGPT4Vpayload(imageUrl, instruction, highRes? Detail.HIGH : Detail.LOW, maxTokens), null, 4);

    return (
        <div className="row-div">
            <div className="column-div">
                <textarea 
                    placeholder="Instruction Goes Here" 
                    className="rounded-corners textarea margin"
                    value={instruction}
                    onChange={e => setInstruction(e.target.value)}
                />
                <div className="row-div">
                    <TextField 
                        className="margin-no-top"
                        placeholder="Enter Your API KEY here" 
                        value={apiKey} 
                        onChange={e => setApiKey(e.target.value)} 
                    />
                    <MaxTokens
                        maxTokens={maxTokens} 
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
            
            <div className="column-div">
                <img src={imageUrl} alt="Your Chosen Picture" className="image margin" />
                <TextField 
                    placeholder="Enter image URL" 
                    value={imageUrl} 
                    onChange={e => setImageUrl(e.target.value)} 
                />
                {
                    !highRes && imageUrl &&
                    <ImagePreview imageUrl={imageUrl}/>
                }
            </div>
        </div>
    );
}