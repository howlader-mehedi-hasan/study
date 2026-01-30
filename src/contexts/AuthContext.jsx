import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";


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
            // Updated to query Supabase 'users' table
            // Note: This matches the previous logic of simple password comparison.
            // Ideally, switch to Supabase Auth or hashed passwords in production.
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();

            if (error || !data) {
                return { success: false, error: "Invalid username or password" };
            }

            setUser(data);
            localStorage.setItem("auth_user", JSON.stringify(data));
            return { success: true };

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
