import React, { createContext, useState } from "react";

export const OptionsContext = createContext();

export function OptionsProvider({ children }) {
    const [apiKey, setApiKey] = useState("");
    const [highRes, setHighRes] = useState(false);
    const [maxTokens, setMaxTokens] = useState(300);

    const value = {
        apiKey, setApiKey,
        highRes, setHighRes,
        maxTokens, setMaxTokens,
    };

    return (
        <OptionsContext.Provider value = {value}>
            {children}
        </OptionsContext.Provider>
    );
}