import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) return savedTheme;

        // Then check system preference
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
        return "light";
    });

    useEffect(() => {
        const root = window.document.documentElement;

        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
