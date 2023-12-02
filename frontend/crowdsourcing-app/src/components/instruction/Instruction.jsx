import "./Instruction.css";
import React, { useState } from 'react';
import {Detail, getGPT4Vpayload, sendGPT4VInstruction} from '../../utils/openAi'

export default function Instruction() {
    const [imageUrl, setImageUrl] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [instruction, setInstruction] = useState("");
    const [highRes, setHighRes] = useState(false);
    const [includeMetadata, setIncludeMetadata] = useState(false);

    const formattedPayload = JSON.stringify(getGPT4Vpayload(imageUrl, instruction, highRes? Detail.HIGH : Detail.LOW), null, 4);

    return (
        <div className="row-div">
            <div className="column-div">
                <textarea 
                    placeholder="Instruction Goes Here" 
                    className="rounded-corners textarea margin"
                    value={instruction}
                    onChange={e => setInstruction(e.target.value)}
                />
                <input 
                    className="rounded-corners margin-no-top"
                    type="text" 
                    placeholder="Enter Your API KEY here" 
                    value={apiKey} 
                    onChange={e => setApiKey(e.target.value)} 
                />
                <div className="row-div margin-no-top">
                    <label>
                        <input 
                            className="margin-no-top"
                            type="checkbox" 
                            checked={highRes} 
                            onChange={e => setHighRes(e.target.checked)} 
                        />
                        High Res.
                    </label>
                    <label>
                        <input 
                            className="margin-no-top"
                            type="checkbox" 
                            checked={includeMetadata} 
                            onChange={e => setIncludeMetadata(e.target.checked)} 
                        />
                        Include Metadata
                    </label>
                </div>
                <div className="overflow-div">
                    <pre className="gray-text margin-no-top">
                        <code>
                            {formattedPayload}
                        </code>
                    </pre>
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