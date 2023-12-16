import React, { useState } from "react";
import "./Settings.css";
import "../../App.css";
import Authentication from "../authentication/Authentication";
import useUserInfo from "../../hooks/userInfoHook";
import CenteredSpinner from "../centeredSpinner/CenteredSpinner";
import { updateUser } from "../../utils/dbUtil";
import { toast } from "react-toastify";

function SettingsBody() {
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingLimit, setIsEditingLimit] = useState(false);

    let [isLoading, userInfo, setUserInfo] = useUserInfo(true);

    if (isLoading) {
        return <CenteredSpinner />;
    }

    let setUsername = (newUserName) => {
        setUserInfo({
            ...userInfo,
            username: newUserName
        });
    };

    let submitUsername = () => {
        if (isEditingUsername) {
            updateUser(userInfo);
        }
        setIsEditingUsername(!isEditingUsername);
    }

    let setLimit = (newLimit) => {
        setUserInfo({
            ...userInfo,
            cash_limit: parseFloat(newLimit)
        });
    };

    let submitLimit = () => {
        if (isEditingLimit) {
            updateUser(userInfo);
        }
        setIsEditingLimit(!isEditingLimit);
    }

    const getBarColor = (spent, limit) => {
        const ratio = Math.min(1.0, limit ? spent / limit : 1);
        const hue = ((1 - ratio) * 120).toString(10);
        return [`hsl(${hue}, 100%, 50%)`, ratio];
    };

    const [barColor, spentRatio] = getBarColor(userInfo.cash_spent, userInfo.cash_limit);

    console.log(JSON.stringify(userInfo));

    return (
        <div>
            <div className="settings-body">
                <div className="settings-field">
                    <h2>Username</h2>
                    {isEditingUsername ? (
                        <input
                            type="text"
                            className="rounded-corners"
                            value={userInfo.username}
                            onChange={(e) => { setUsername(e.target.value) }}
                            onKeyUp={(e) => { if (e.key === "Enter") submitUsername() }}
                            onBlur={submitUsername}
                            id="username-input"
                        />
                    ) : (
                        <span>{userInfo.username}</span>
                    )}
                    <label htmlFor="username-input" aria-label="edit" onClick={submitUsername}>✏️</label>
                </div>
                <div className="settings-field">
                    <h2>Email</h2>
                    <span>{userInfo.email}</span>
                </div>
                <hr className="separator" />
                <div className="settings-field">
                    <h2>Cash Spent</h2>
                    {isEditingLimit ? (
                        <input
                            type="number"
                            className="rounded-corners"
                            value={userInfo.cash_limit}
                            min="0"
                            step="0.01"
                            onChange={(e) => { setLimit(e.target.value) }}
                            onKeyUp={(e) => { if (e.key === "Enter") submitLimit() }}
                            onBlur={submitLimit}
                            id="limit-input"
                        />
                    ) : (
                        <div className="progress-bar-background">
                            <div className="progress-bar-fill" style={{ width: `${spentRatio * 100}%`, backgroundColor: barColor }} />
                            <div className="progress-bar-text">{userInfo.cash_spent.toFixed(2)}/{userInfo.cash_limit.toFixed(2)} $</div>
                        </div>
                    )}
                    <label htmlFor="limit-input" aria-label="edit" onClick={submitLimit}>✏️</label>
                </div>
            </div>
        </div>
    );
}


export default function Settings() {
    return (
        <Authentication>
            <SettingsBody />
        </Authentication>
    );
}