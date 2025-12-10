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
        if (isValidUser(user)) return;

        const controller = new AbortController(); // For cancelling fetch on unmount
        const signal = controller.signal; // To pass to axios

        const fetchUser = async () => {
            try {
                const res = await axios.get("/api/user/me", { signal });

                const userData = res.data?.data ?? null;
                console.log("Fetched user:", userData);
                setUser(userData);

                sessionStorage.setItem("currentUser", JSON.stringify(userData));
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

    const isValidUser = (u) => u && typeof u === "object" && u.username;

    const clearUser = () => {
        setUser(null);
        sessionStorage.removeItem("currentUser");
    };

    return { user, loading, error, setUser, clearUser };
}
