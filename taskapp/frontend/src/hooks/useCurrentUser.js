// hooks/useCurrentUser.js
import { useEffect, useState } from "react";
import axios from "../axiosConfig";

export function useCurrentUser() {
    
    const [user, setUser] = useState(() => {
        // lazy initializer: only runs once
        const stored = sessionStorage.getItem("currentUser"); // Cache user in sessionStorage
        return stored ? JSON.parse(stored) : null;
    });

    const [loading, setLoading] = useState(!user); // Only load if no user
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && Object.keys(user).length > 0) return;

        const controller = new AbortController(); // For cancelling fetch on unmount
        const signal = controller.signal; // To pass to axios

        const fetchUser = async () => {
            try {
                const res = await axios.get("/api/user/me", { signal });
                // console.log("Fetched user:", res.data);
                setUser(res.data);
                sessionStorage.setItem("currentUser", JSON.stringify(res.data));
                setError(null);
            } catch (err) {
                if (!axios.isCancel(err)) {
                    setError(err);
                    setUser(null);
                    console.error("Failed to fetch user:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        return () => {
            controller.abort(); // Cleanup on unmount
        };
    }, [user]);

    const clearUser = () => {
        setUser(null);
        sessionStorage.removeItem("currentUser");
    };

    return { user, loading, error, setUser, clearUser };
}
