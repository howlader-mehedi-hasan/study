import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Users, Key, Inbox, Mail, AlertCircle, MessageSquare, FileText, HardDrive, X, Menu, LogOut } from 'lucide-react';

const Sidebar = ({
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isAdmin,
    permissions,
    logout
}) => {

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: Layout, show: true },
        { id: 'settings', label: 'Global Settings', icon: HardDrive, show: isAdmin || permissions?.welcome_message_edit || permissions?.schedule_edit || permissions?.breaking_news_edit },
        { id: 'users', label: 'User Management', icon: Users, show: isAdmin },
        { id: 'profile', label: 'My Profile', icon: Key, show: true },
        { id: 'requests', label: 'Deletion Requests', icon: Inbox, show: isAdmin || permissions?.deletion_requests_edit },
        { id: 'messages', label: 'Messages', icon: Mail, show: isAdmin || permissions?.messages_view },
        { id: 'complaints', label: 'Complaints', icon: AlertCircle, show: isAdmin || permissions?.complaints_view },
        { id: 'opinions', label: 'Feedback', icon: MessageSquare, show: isAdmin || permissions?.opinions_view },
        { id: 'logs', label: 'Activity Logs', icon: FileText, show: isAdmin },
        { id: 'system', label: 'System', icon: HardDrive, show: isAdmin },
    ];

    const sidebarVariants = {
        hidden: { x: '-100%', opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        },
        exit: {
            x: '-100%',
            opacity: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        }
    };

    const MenuItem = ({ item }) => (
        <motion.button
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
        >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"}`} />
            <span className="font-medium">{item.label}</span>
            {activeTab === item.id && (
                <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute left-0 w-1 h-8 bg-white rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            )}
        </motion.button>
    );

    return (
        <>
            {/* Mobile Menu Toggle - Removed in favor of Header Toggle */}

            {/* Sidebar Container */}
            <AnimatePresence>
                {(isMobileMenuOpen || window.innerWidth >= 1024) && (
                    <motion.div
                        initial={window.innerWidth < 1024 ? "hidden" : false}
                        animate="visible"
                        exit="exit"
                        variants={sidebarVariants}
                        className={`
                            fixed inset-y-0 left-0 z-40 w-72 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-gray-100 dark:border-slate-700
                            lg:static lg:bg-transparent lg:dark:bg-transparent lg:border-r-0 lg:w-64
                            ${isMobileMenuOpen ? "shadow-2xl" : ""}
                        `}
                    >
                        <div className="h-full flex flex-col p-4">
                            {/* Header for Mobile */}
                            <div className="lg:hidden flex items-center justify-between mb-8 p-2">
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Menu</span>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Menu Items */}
                            <div className="flex-1 overflow-y-auto space-y-1 py-4 no-scrollbar">
                                {menuItems.map(item => item.show && (
                                    <MenuItem key={item.id} item={item} />
                                ))}
                            </div>

                            {/* Logout Button */}
                            <div className="pt-4 mt-auto border-t border-gray-100 dark:border-slate-700">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={logout}
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Sign Out</span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
