import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { LogIn, LogOut, Settings, GraduationCap, Sun, Moon, Menu, X, User, ChevronDown, LayoutDashboard, UserCircle, CircleHelp, Shield } from "lucide-react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const isActive = (path) => {
        return location.pathname === path
            ? "text-blue-600 dark:text-blue-400 font-bold"
            : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400";
    };

    const [isOpen, setIsOpen] = useState(false);

    // Close menu when location changes
    useEffect(() => {
        setIsOpen(false);
        setIsProfileOpen(false);
    }, [location]);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileRef]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="bg-blue-600 p-1.5 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            HMH-CourseMaterials
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-6">
                        <Link to="/" className={`${isActive('/')} transition-colors font-medium text-sm uppercase tracking-wide`}>Home</Link>
                        <Link to="/courses" className={`${isActive('/courses')} transition-colors font-medium text-sm uppercase tracking-wide`}>Courses</Link>
                        <Link to="/syllabus" className={`${isActive('/syllabus')} transition-colors font-medium text-sm uppercase tracking-wide`}>Syllabus</Link>
                        <Link to="/notices" className={`${isActive('/notices')} transition-colors font-medium text-sm uppercase tracking-wide`}>Notices</Link>
                        <Link to="/schedule" className={`${isActive('/schedule')} transition-colors font-medium text-sm uppercase tracking-wide`}>Schedule</Link>

                        {/* Direct Admin Access */}
                        <Link
                            to="/admin"
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Admin Panel"
                        >
                            <Settings className="w-5 h-5" />
                        </Link>

                        <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-2"></div>
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            aria-label="Toggle Dark Mode"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {user ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className={`flex items-center space-x-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border ${isProfileOpen ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30' : 'border-gray-200 dark:border-slate-700'} rounded-full px-2 py-1.5 pl-3 transition-all duration-200 outline-none`}
                                >
                                    <div className="flex flex-col items-end mr-1 hidden xl:block">
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-tight">
                                            {user.name || user.username}
                                        </span>
                                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider leading-tight">
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                                        <span className="font-bold text-sm">
                                            {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-blue-500' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">

                                        {/* Dropdown Header */}
                                        <div className="px-5 py-4 border-b border-gray-50 dark:border-slate-700/50">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                                        {user.name || user.username}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                                                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 uppercase tracking-wide border border-blue-100 dark:border-blue-900/50">
                                                        {user.role}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="p-2 space-y-0.5">
                                            <Link
                                                to="/admin" // Placeholder for Profile
                                                className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <div className="p-1.5 bg-gray-100 dark:bg-slate-700 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-600 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400 transition-colors shadow-sm">
                                                    <UserCircle className="w-4 h-4" />
                                                </div>
                                                <span>My Profile</span>
                                            </Link>

                                            <Link
                                                to="/admin"
                                                className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <div className="p-1.5 bg-gray-100 dark:bg-slate-700 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-600 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400 transition-colors shadow-sm">
                                                    <LayoutDashboard className="w-4 h-4" />
                                                </div>
                                                <span>Dashboard</span>
                                            </Link>

                                            <Link
                                                to="/admin?tab=settings"
                                                className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <div className="p-1.5 bg-gray-100 dark:bg-slate-700 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-600 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400 transition-colors shadow-sm">
                                                    <Settings className="w-4 h-4" />
                                                </div>
                                                <span>Settings</span>
                                            </Link>

                                            <button
                                                className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group text-left"
                                            >
                                                <div className="p-1.5 bg-gray-100 dark:bg-slate-700 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-600 text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400 transition-colors shadow-sm">
                                                    <CircleHelp className="w-4 h-4" />
                                                </div>
                                                <span>Help & Support</span>
                                            </button>
                                        </div>

                                        {/* Dropdown Footer */}
                                        <div className="p-2 border-t border-gray-50 dark:border-slate-700/50 mt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors group"
                                            >
                                                <div className="p-1.5 bg-red-100 dark:bg-red-900/20 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-800 text-red-500 group-hover:text-red-600 transition-colors shadow-sm">
                                                    <LogOut className="w-4 h-4" />
                                                </div>
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/admin" className="flex items-center space-x-2 bg-gray-300 dark:bg-slate-800 text-white px-4 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-slate-700 transition-all shadow hover:shadow-lg transform active:scale-95 duration-200 text-sm font-medium">
                                <LogIn className="w-4 h-4" />
                                <span className="whitespace-nowrap">A</span> {/* Admin Access */}
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link to="/" className={`block py-3 px-4 rounded-lg ${isActive('/')} font-medium`}>Home</Link>
                        <Link to="/courses" className={`block py-3 px-4 rounded-lg ${isActive('/courses')} font-medium`}>Courses</Link>
                        <Link to="/syllabus" className={`block py-3 px-4 rounded-lg ${isActive('/syllabus')} font-medium`}>Syllabus</Link>
                        <Link to="/notices" className={`block py-3 px-4 rounded-lg ${isActive('/notices')} font-medium`}>Notices</Link>
                        <Link to="/schedule" className={`block py-3 px-4 rounded-lg ${isActive('/schedule')} font-medium`}>Schedule</Link>

                        <div className="h-px bg-gray-100 dark:bg-slate-800 my-4"></div>

                        {user ? (
                            <>
                                <div className="px-4 py-2 flex items-center space-x-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name || user.username}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                                    </div>
                                </div>
                                <Link to="/admin" className={`block py-3 px-4 rounded-lg ${isActive('/admin')} font-medium flex items-center`}>
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Link>
                                <Link to="/admin" className={`block py-3 px-4 rounded-lg font-medium flex items-center text-gray-600 dark:text-gray-300`}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Settings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left py-3 px-4 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium flex items-center"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link to="/admin" className="block w-full text-center bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                ei khane tap korle kintu lock hoye jabe {/* Admin Access */}
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
