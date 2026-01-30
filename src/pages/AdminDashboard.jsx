import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";

// Import Admin Sub-components
import Sidebar from "../components/admin/Sidebar";
import AdminLogin from "../components/admin/AdminLogin";
import DashboardOverview from "../components/admin/DashboardOverview";
import UserManagement from "../components/admin/UserManagement";
import SystemSettings from "../components/admin/SystemSettings";
import Profile from "../components/admin/Profile";
import ActivityLogs from "../components/admin/ActivityLogs";
import DeletionRequests from "../components/admin/DeletionRequests";
import Messages from "../components/admin/Messages";
import Complaints from "../components/admin/Complaints";
import Opinions from "../components/admin/Opinions";

export default function AdminDashboard() {
    const { user, isAdmin, login, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // State
    const [activeTab, setActiveTab] = useState("overview");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loginError, setLoginError] = useState("");

    // Dashboard Stats State
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalMessages: 0,
        totalComplaints: 0,
        totalOpinions: 0
    });

    // Handle URL Params for Tabs
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");
        if (tab) {
            setActiveTab(tab);
        }
    }, [location]);

    // Fetch Stats for Overview
    useEffect(() => {
        if (user && activeTab === 'overview') {
            fetchStats();
        }
    }, [user, activeTab]);

    const fetchStats = async () => {
        try {
            // Parallel fetch for dashboard stats
            const [usersRes, msgsRes, complaintsRes, opinionsRes] = await Promise.all([
                fetch("/api/users"),
                fetch("/api/admin/messages"),
                fetch("/api/admin/complaints"),
                fetch("/api/opinions")
            ]);

            setStats({
                totalUsers: usersRes.ok ? (await usersRes.json()).length : 0,
                totalMessages: msgsRes.ok ? (await msgsRes.json()).length : 0,
                totalComplaints: complaintsRes.ok ? (await complaintsRes.json()).length : 0,
                totalOpinions: opinionsRes.ok ? (await opinionsRes.json()).length : 0
            });
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        }
    };

    const handleLogin = async (username, password) => {
        setLoginError("");
        const result = await login(username, password);
        if (!result.success) {
            setLoginError(result.error || "Login failed");
        }
    };

    // If not logged in, show login screen
    if (!user) {
        return <AdminLogin onLogin={handleLogin} loginError={loginError} />;
    }

    // Main Dashboard Layout
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setActiveTab(tab);
                    navigate(`?tab=${tab}`, { replace: true });
                }}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                isAdmin={isAdmin}
                permissions={user?.permissions}
                logout={logout}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Header (Mobile & Desktop) */}
                <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-700 h-16 flex items-center justify-between px-4 lg:px-8 z-20 sticky top-0">
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 mr-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Admin
                        </h1>
                    </div>
                    <div className="hidden lg:block text-sm text-gray-400">
                        / dashboard / <span className="text-gray-800 dark:text-white font-medium capitalize">{activeTab.replace('-', ' ')}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-800 dark:text-white leading-none">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-[2px]">
                            <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                                {user.name.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === "overview" && <DashboardOverview user={user} stats={stats} />}
                                {activeTab === "settings" && <SystemSettings user={user} isAdmin={isAdmin} />}
                                {activeTab === "users" && <UserManagement />}
                                {activeTab === "profile" && <Profile user={user} />}
                                {activeTab === "requests" && <DeletionRequests />}
                                {activeTab === "messages" && <Messages />}
                                {activeTab === "complaints" && <Complaints />}
                                {activeTab === "opinions" && <Opinions />}
                                {activeTab === "logs" && <ActivityLogs />}
                                {activeTab === "system" && (
                                    <div className="flex items-center justify-center h-64 text-gray-400">
                                        <div className="text-center">
                                            <p>System Maintenance Mode</p>
                                            {/* You can re-enable the cleanup logic here if needed */}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
