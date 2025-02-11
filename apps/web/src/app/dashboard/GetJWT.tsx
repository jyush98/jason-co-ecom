"use-client";

import { useAuth } from "@clerk/nextjs";

function GetJWT() {
    const { getToken } = useAuth();

    async function fetchToken() {
        const token = await getToken();
        console.log("JWT Token:", token);
    }

    return <button onClick={fetchToken}>Get JWT</button>;
}

export default GetJWT;
