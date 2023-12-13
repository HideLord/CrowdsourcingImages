import "./Image.css";
import "../../App.css";
import React from "react";

export default function Image({ imageUrl, imageClass, wrapperClass }) {
    return (
        <div className={wrapperClass ? wrapperClass : "image-container"}>
            <img src={imageUrl} alt="Your Chosen Picture" className={imageClass ? imageClass : "image"} />
        </div>
    );
}