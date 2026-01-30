import React, { createContext, useContext, useState, useEffect } from "react";
import usersData from "../data/users.json";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("auth_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem("auth_user", JSON.stringify(data.user));
                return { success: true };
            } else {
                return { success: false, error: data.error || "Login failed" };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: "Server error during login" };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("auth_user");
    };

    const hasPermission = (permission) => {
        if (!user) return false;
        if (user.role === 'admin') return true; // Admin has all permissions
        return user.permissions && user.permissions[permission] === true;
    };

    const value = {
        user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        loading,
        hasPermission
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
