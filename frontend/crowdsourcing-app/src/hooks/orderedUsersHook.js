import { useState, useEffect } from "react";
import { getOrderedUsers } from "../utils/dbUtil";
import { toast } from "react-toastify";

export default function useOrderedUsers() {
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (isLoading) {
            getOrderedUsers().then(info => {
                setUsers(info.users);
                setIsLoading(false);
            }).catch(error => {
                toast.error(`Failed to fetch user info: ${error}`);
                setIsLoading(false);
            });
        }
    }); // No dependencies. We want to fetch every time we re-render in case the info has changed. The limits are in the backend.

    return [isLoading, users, setUsers];
}