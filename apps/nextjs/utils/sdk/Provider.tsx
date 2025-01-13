"use client";

import {useEffect} from "react";

export const AuthdogProvider = ({
    children
}: { children: React.ReactNode }) => {

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get("token");
        if (token) {
            localStorage.setItem("token", token);
            window.history.replaceState({}, document.title, "/");
        }
    }, [])

    return (
        <>
            {children}        
        </>
    );
};
