import React, { useState } from "react";
import "./Login.css";
import "../../App.css";
import { generateOTP } from '../../utils/loginUtil'

export default function Login() {
    const [email, setEmail] = useState("");
    const [isGoDisabled, setGoDisabled] = useState(false);
    const [isSent, setIsSent] = useState(false);
    
    const handleGo = async () => {
        try {
            setGoDisabled(true);
            const result = await generateOTP(email);
            setGoDisabled(false);
            setIsSent(true);
            console.log(result);
        } catch (error) {
            setGoDisabled(false);
            console.error(error);
        }
    };

    return (
        <div className="login-container">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-corners big-textfield margin"
                placeholder="Email Address"
            />
            <button 
                onClick={handleGo} 
                disabled={isGoDisabled}
                className="blue-button long-button">
                    Go
            </button>
            {isSent && <p className="notification-text">Email sent! Please check your inbox or spam folder.</p>}
        </div>
    );
}