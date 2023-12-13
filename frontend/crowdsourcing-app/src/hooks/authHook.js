import { useState, useEffect } from "react";
import { isAuthenticated } from "../utils/loginUtil";

export default function useAuthStatus() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticatedVar, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (isLoading) { // Once it's loaded (authenticated), we don't want to check again.
            isAuthenticated().then(authenticated => {
                setIsAuthenticated(authenticated);
                setIsLoading(false);
            });
        }
    }, []);

    return [isLoading, isAuthenticatedVar];
}