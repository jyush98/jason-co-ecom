"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { fetchUser } from "../../utils/api";

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const [userData, setUserData] = useState<{ email: string } | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchUser(user.id).then(setUserData);
        }
    }, [user]);

    if (!isLoaded) return <p>Loading...</p>;
    if (!user) return <p>You must be signed in to view this page.</p>;

    return (
        <div>
            <h1>Welcome, {user.fullName}!</h1>
            {userData && (
                <p>Email from FastAPI: {userData.email}</p>
            )}
        </div>
    );
}
