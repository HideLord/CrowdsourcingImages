import "./Instruction.css";
import React, { useState } from 'react';

export default function Instruction() {
    const [imageUrl, setImageUrl] = useState("");
    const [highRes, setHighRes] = useState(false);
    const [includeMetadata, setIncludeMetadata] = useState(false);

    return (
        <div className="row-div">
            <div className="column-div">
                <textarea 
                    placeholder="Instruction Goes Here" 
                    className="rounded-corners textarea margin"
                />
                <div className="row-div margin">
                    <label>
                        <input 
                            className="margin"
                            type="checkbox" 
                            checked={highRes} 
                            onChange={e => setHighRes(e.target.checked)} 
                        />
                        High Res.
                    </label>
                    <label>
                        <input 
                            className="margin"
                            type="checkbox" 
                            checked={includeMetadata} 
                            onChange={e => setIncludeMetadata(e.target.checked)} 
                        />
                        Include Metadata
                    </label>
                </div>
            </div>
            
            <div className="column-div">
                <img src={imageUrl} alt="Your Chosen Picture" className="image margin" />
                <input 
                    className="rounded-corners margin"
                    type="text" 
                    placeholder="Enter image URL" 
                    value={imageUrl} 
                    onChange={e => setImageUrl(e.target.value)} 
                />
            </div>
        </div>
    );
}