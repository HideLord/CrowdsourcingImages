import "./Instruction.css";
import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {Detail, getGPT4Vpayload, sendGPT4VInstruction} from '../../utils/openAi'

export default function Instruction() {
    const [imageUrl, setImageUrl] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [instruction, setInstruction] = useState("");
    const [highRes, setHighRes] = useState(false);
    const [maxTokens, setMaxTokens] = useState(300);
    const [formattedResponse, setResponse] = useState("");

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
                    <input 
                        className="rounded-corners margin-no-top"
                        type="text" 
                        placeholder="Enter Your API KEY here" 
                        value={apiKey} 
                        onChange={e => setApiKey(e.target.value)} 
                    />
                    <label htmlFor="maxTokens" className="margin-no-top">
                        Max Tokens:  
                        <input 
                            className="max-tokens rounded-corners"
                            id="maxTokens"
                            type="number" 
                            value={maxTokens} 
                            onChange={e => setMaxTokens(parseInt(e.target.value, 10))} 
                        />
                    </label>
                    <label>
                        <input 
                            className="margin-no-top"
                            type="checkbox" 
                            checked={highRes} 
                            onChange={e => setHighRes(e.target.checked)} 
                        />
                        High Res.
                    </label>
                </div>
                <button 
                    className="send-button margin-no-top" 
                    onClick={() => { 
                        sendGPT4VInstruction(apiKey, imageUrl, instruction, highRes? Detail.HIGH : Detail.LOW)
                            .then((result) => setResponse(JSON.stringify(result, null, 4)))
                            .catch(async (error) => {
                                console.error("Error occurred in sendGPT4VInstruction:", error);
                                let errorResponse = { status: error.message };
                                if (error.response) {
                                    errorResponse.body = await error.response.json();
                                }
                                setResponse(JSON.stringify(errorResponse, null, 4));
                            });
                    }}
                >
                    Send
                </button>
                
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
            </div>
            
            <div className="column-div">
                <img src={imageUrl} alt="Your Chosen Picture" className="image margin" />
                <input 
                    className="rounded-corners margin-no-top"
                    type="text" 
                    placeholder="Enter image URL" 
                    value={imageUrl} 
                    onChange={e => setImageUrl(e.target.value)} 
                />
                {
                    !highRes && imageUrl &&
                    <div className="image-preview-container margin-no-top">
                        <img 
                            src={imageUrl} 
                            alt="Image Preview" 
                            className="image-preview"
                        />
                        <div className="resolution-text">512x512</div>
                        <div className="preview-text">Preview</div>
                    </div>
                }
            </div>
        </div>
    );
}