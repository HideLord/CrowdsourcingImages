import React, { useState } from "react";
import "./Settings.css";
import "../../App.css";
import Authentication from "../authentication/Authentication";
import useUserInfo from "../../hooks/userInfoHook";
import CenteredSpinner from "../centeredSpinner/CenteredSpinner";
import { updateUser } from "../../utils/dbUtil";

function SettingsBody() {
    const [isEditing, setIsEditing] = useState(false);

    let [isLoading, userInfo, setUserInfo] = useUserInfo();

    if (isLoading) {
        return <CenteredSpinner/>;
    }

    let setUsername = (newUserName) => {
        setUserInfo({
            ...userInfo,
            username: newUserName
        });
    };

    let submit = () => {
        if (isEditing) {
            updateUser(userInfo);
        }
        setIsEditing(!isEditing);
    }

    return (
        <div>
            <div className="settings-body">
                <div className="settings-field">
                    <h2>Username</h2>
                    {isEditing ? (
                        <input 
                            type="text" 
                            className="rounded-corners" 
                            value={userInfo.username} 
                            onChange={(e) => {setUsername(e.target.value)}}
                            id="username-input"
                        />
                    ) : (
                        <span>{userInfo.username}</span>
                    )}
                    <label htmlFor="username-input" role="img" aria-label="edit" onClick={submit}>✏️</label>
                </div>
                <div className="settings-field">
                    <h2>Email</h2>
                    <span>{userInfo.email}</span>
                </div>
            </div>
        </div>
    );
}


export default function Settings() {
    return (
        <Authentication>
            <SettingsBody/>
        </Authentication>
    );
}