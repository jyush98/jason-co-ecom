const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const addToCart = async (productId: number, quantity: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: productId, quantity }),
    });

    return response.json();
};

export const getCart = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.json();
};

export const removeFromCart = async (productId: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.json();
};
