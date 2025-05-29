"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { fetchUser } from "../../utils/api";
import GetJWT from "./GetJWT";
import { User } from "../../types/user";

const DASHBOARD = process.env.NEXT_PUBLIC_SHOW_DASHBOARD == 'true';

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const [userData, setUserData] = useState<User | null>(null);

    useEffect(() => {
        if (isLoaded && user?.id) {
            getToken().then((token) => {
                if (token) {
                    fetchUser(user.id, token).then(setUserData);
                }
            });
        }
    }, [user, isLoaded, getToken]);

    if (!isLoaded) return <p className="text-center text-gray-400">Loading...</p>;
    if (!user) return <p>You must be signed in to view this page.</p>;

    console.log(process.env.NEXT_PUBLIC_SHOW_DASHBOARD);
    console.log(process.env.CLERK_SECRET_KEY);
    console.log(DASHBOARD);

    return (
        <div>
            <p>{DASHBOARD}</p>
            {
                DASHBOARD &&
                <div className="container mx-auto py-12">
                    <h1 className="text-4xl text-gold-400">Welcome, {user.fullName}!</h1>
                    {userData && <p className="text-lg text-gray-300">Email from FastAPI: {userData.email}</p>}
                    <GetJWT />
                </div>
            }
        </div>
    );
}
