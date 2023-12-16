import { useState, useEffect } from "react";
import { getCurrentUserInfo } from "../utils/dbUtil";
import { toast } from "react-toastify";

export default function useUserInfo() {
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        if (isLoading) {
            getCurrentUserInfo().then(info => {
                setUserInfo(info);
                setIsLoading(false);
            }).catch(error => {
                toast.error(`Failed to fetch user info: ${error}`);
                setIsLoading(false);
            });
        }
    }); // No dependencies. We want to fetch every time we re-render in case the info has changed. The limits are in the backend.

    return [isLoading, userInfo, setUserInfo];
}