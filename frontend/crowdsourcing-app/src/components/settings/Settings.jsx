import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import ReactLoading from 'react-loading';  // make sure to import this
import "./Settings.css";
import "../../App.css";
import useAuthStatus from "../../hooks/authHook";

function SettingsBody() {
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState("Current Username");  // replace with actual username
    const [email, setEmail] = useState("user@example.com");  // replace with actual email

    return (
        <div className="settings-body">
            <div className="settings-field">
                <h2>Username</h2>
                {isEditing ? (
                    <input 
                        type="text" 
                        className="rounded-corners" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        id="username-input"
                    />
                ) : (
                    <span>{username}</span>
                )}
                <label htmlFor="username-input" role="img" aria-label="edit" onClick={() => setIsEditing(!isEditing)}>✏️</label>
            </div>
            <div className="settings-field">
                <h2>Email</h2>
                <span>{email}</span>
            </div>
        </div>
    )
}


export default function Settings() {
    let [isLoading, isAuthenticatedVar] = useAuthStatus();

    if (isLoading) {
        return (
            <div className="center-spinner">
              <ReactLoading type={'spin'} color={'#000'} height={50} width={50} />
            </div>
        );
    }

    if (!isAuthenticatedVar) {
        return <Navigate to="/" />;
    } else {
        return <SettingsBody/>;
    }
}