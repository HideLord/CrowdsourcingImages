import { useState, useEffect } from "react";
import { isAuthenticated } from "../utils/loginUtil";
import { toast } from "react-toastify";

export default function useAuthStatus() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticatedVar, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (isLoading) { // Once it"s loaded (authenticated), we don"t want to check again.
            isAuthenticated().then(authenticated => {
                setIsAuthenticated(authenticated);
                setIsLoading(false);
            }).catch(error => {
                toast.error(`Failed to check authentication: ${error}`);
                setIsLoading(false);
            });
        }
    }, []);

    return [isLoading, isAuthenticatedVar];
}