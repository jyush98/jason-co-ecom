export interface User {
    id: number;
    clerk_id: string; // Clerk user ID
    email: string;
    first_name?: string;
    last_name?: string;
    created_at: string; // ISO 8601 format
}
