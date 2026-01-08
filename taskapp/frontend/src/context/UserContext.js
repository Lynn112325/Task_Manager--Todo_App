// contexts/UserContext.js
import { createContext, useContext, useState } from "react";
import axios from "../axiosConfig";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Init user from sessionStorage to avoid flickering on refresh
        const stored = sessionStorage.getItem("currentUser");
        return stored ? JSON.parse(stored) : null;
    });

    const [loading, setLoading] = useState(!user);
    const [error, setError] = useState(null)

    const controller = new AbortController();

    const fetchUser = async () => {
        try {
            const res = await axios.get("/api/user/me", { signal: controller.signal });
            const userData = res.data?.data ?? null;

            setUser(userData);
            if (userData) {
                sessionStorage.setItem("currentUser", JSON.stringify(userData));
            }
        } catch (err) {
            if (!axios.isCancel(err)) {
                setError(err);
                setUser(null);
                sessionStorage.removeItem("currentUser");
            }
        } finally {
            setLoading(false);
        }
    };

    const clearUser = () => {
        setUser(null);
        sessionStorage.removeItem("currentUser");
    };

    const logout = async () => {
        try {
            await axios.post("/logout");
        } finally {
            clearUser()
            window.location.hash = "/login";
        }
    };


    return (
        <UserContext.Provider value={{ fetchUser, user, loading, error, setUser, clearUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook for easy access
export const useAuth = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useAuth must be used within a UserProvider");
    }
    return context;
};