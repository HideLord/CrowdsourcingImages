import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStatus from "../../hooks/authHook";
import CenteredSpinner from "../centeredSpinner/CenteredSpinner";

export default function Authentication({ children }) {
    let [isLoading, isAuthenticatedVar] = useAuthStatus();

    if (isLoading) {
        return (
            <CenteredSpinner/>
        );
    }

    if (!isAuthenticatedVar) {
        return <Navigate to="/" />;
    } else {
        return children;
    }
}