import React, { useState } from "react";
import "./Login.css";
import "../../App.css";
import { generateOTP } from "../../utils/loginUtil"
import { toast } from "react-toastify";

export default function Login() {
    const [email, setEmail] = useState("");
    const [isGoDisabled, setGoDisabled] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleGo = async (event) => {
        event.preventDefault();

        try {
            setGoDisabled(true);
            await generateOTP(email);
            setGoDisabled(false);
            setIsSent(true);
        } catch (error) {
            setGoDisabled(false);
            toast.error(`Failed to generate OTP: ${error}`);
        }
    };

    return (
        <div>
            <picture>
                <source srcSet="/logo192.png" media="(max-width: 1023px)" />
                <img src="/logo512.png" alt="Logo" className="logo-image" />
            </picture>
            <form onSubmit={handleGo} className="login-container">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-corners big-textfield margin"
                    placeholder="Email Address"
                    disabled={isGoDisabled}
                />
                <button
                    type="submit"
                    disabled={isGoDisabled}
                    className="blue-button long-button">
                    Go
                </button>
                {isSent && <p className="notification-text">Email sent! Please check your inbox or spam folder.</p>}
            </form>
        </div>
    );
}