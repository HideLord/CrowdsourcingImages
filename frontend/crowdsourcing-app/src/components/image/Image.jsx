import "./Image.css";
import "../../App.css";
import React from "react";

export default function Image({ imageUrl }) {
    return (
        <div className="image-container margin">
            <img src={imageUrl} alt="Your Chosen Picture" className="image" />
        </div>
    );
}