"use client";  // ✅ Forces client-side rendering

import { SignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SignInPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;  // ✅ Prevents SSR mismatch

    return (
        <div className="flex justify-center items-center min-h-screen">
            <SignIn routing="path" path="/sign-in" />
        </div>
    );
}
