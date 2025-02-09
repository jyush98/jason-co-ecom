import { auth } from "@clerk/nextjs/server";

export default async function Dashboard() {
    const { userId } = await auth();
    if (!userId) return <p>You must be signed in to view this page.</p>;

    return <h1>Welcome to your dashboard!</h1>;
}
