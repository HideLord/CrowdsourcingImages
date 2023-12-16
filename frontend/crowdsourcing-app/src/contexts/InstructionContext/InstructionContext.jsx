import React, { createContext, useState } from 'react';

export const InstructionContext = createContext();

export function InstructionProvider({ children }) {
    const [imageUrl, setImageUrl] = useState("");
    const [instruction, setInstruction] = useState("");
    const [formattedResponse, setResponse] = useState("");

    const value = {
        imageUrl, setImageUrl,
        instruction, setInstruction,
        formattedResponse, setResponse,
    };

    return (
        <InstructionContext.Provider value = {value}>
            {children}
        </InstructionContext.Provider>
    );
}