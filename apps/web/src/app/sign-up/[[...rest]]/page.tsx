"use client";  // ✅ Forces client-side rendering

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SignUpPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;  // ✅ Prevents SSR mismatch

    return (
        <div className="flex justify-center items-center min-h-screen">
            <SignUp routing="path" path="/sign-up" />
        </div>
    );
}
