export const fetchProducts = async (filters: { name?: string; minPrice?: number; maxPrice?: number; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (filters.name) queryParams.append("name", filters.name);
    if (filters.minPrice) queryParams.append("min_price", filters.minPrice.toString());
    if (filters.maxPrice) queryParams.append("max_price", filters.maxPrice.toString());
    if (filters.category) queryParams.append("category", filters.category);

    try {
        const response = await fetch(`http://127.0.0.1:8000/products?${queryParams.toString()}`);
        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

export const fetchUser = async (clerkId: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/user/${clerkId}`);
        if (!response.ok) {
            throw new Error("User not found");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};



