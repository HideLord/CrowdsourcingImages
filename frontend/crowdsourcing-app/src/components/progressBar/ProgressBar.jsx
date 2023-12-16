import React from "react";
import "./ProgressBar.css";

export default function ProgressBar( {ratio, barColor, text} ) {
    return (
        <div className="progress-bar-background">
            <div className="progress-bar-fill" style={{ width: `${ratio * 100}%`, backgroundColor: barColor }} />
            <div className="progress-bar-text">{text} $</div>
        </div>
    );
}