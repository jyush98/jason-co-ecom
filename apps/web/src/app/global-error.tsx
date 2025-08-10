// apps/web/src/app/global-error.tsx
'use client';

export const dynamic = 'force-dynamic';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="max-w-lg mx-auto text-center">
                        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                        <button
                            onClick={() => reset()}
                            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}