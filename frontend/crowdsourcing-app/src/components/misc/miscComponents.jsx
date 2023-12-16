import "../../App.css";
import "./miscComponents.css"
import React from "react";
import "react-tabs/style/react-tabs.css";

export function NumberInput({ label, value, onChange }) {
    const randId = Math.random();
    return (
        <label htmlFor={`number-input-${randId}`} className="margin-no-top">
            {label}
            <input
                className="number-input rounded-corners"
                id={`number-input-${randId}`}
                type="number"
                value={value}
                onChange={onChange}
            />
        </label>
    )
}

export function CheckBox({ checked, onChange, label }) {
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

export function TextField({ placeholder, value, onChange }) {
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