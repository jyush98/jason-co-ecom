"use client";  // ✅ Ensure this is a client component

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { fetchUser } from "../../utils/api";
import GetJWT from "./GetJWT";

export default function Dashboard() {
    const { user, isLoaded } = useUser(); // ✅ Use `useUser()` to get user details
    const { getToken } = useAuth();
    const [userData, setUserData] = useState<{ email: string } | null>(null);

    useEffect(() => {
        if (isLoaded && user?.id) {
            getToken().then((token) => {
                if (token) {
                    fetchUser(user.id, token).then(setUserData);
                }
            });
        }
    }, [user, isLoaded, getToken]); // ✅ Added `isLoaded` for better reactivity

    if (!isLoaded) return <p>Loading...</p>;
    if (!user) return <p>You must be signed in to view this page.</p>;

    return (
        <div>
            <h1>Welcome, {user.fullName}!</h1>
            {userData && <p>Email from FastAPI: {userData.email}</p>}
            <GetJWT />
        </div>
    );
}
