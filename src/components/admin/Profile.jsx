import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Lock, Check, Loader2, User, Shield, Save } from 'lucide-react';

const Profile = ({ user }) => {
    // Initialize state with user data (with defensive checks)
    const [formData, setFormData] = useState({
        name: user?.name || "",
        username: user?.username || "",
        password: "" // Keep empty initially for security/optional update
    });

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Update state if user prop changes
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || "",
                username: user.username || ""
            }));
        }
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            // Prepare payload - only include password if it's set
            const payload = {
                name: formData.name,
                username: formData.username,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            const response = await fetch(`/api/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: "Profile updated successfully. Please re-login if username/password changed." });
                setFormData(prev => ({ ...prev, password: "" })); // Clear password field
            } else {
                setMessage({ type: "error", text: data.error || "Failed to update profile" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Error updating profile" });
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to render permission badges
    const renderPermissions = () => {
        if (user.role === 'admin') {
            return (
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium border border-purple-200">
                    Administrator (All Permissions)
                </span>
            );
        }

        if (!user.permissions) return <span className="text-gray-400 italic">No specific permissions</span>;

        return (
            <div className="flex flex-wrap gap-2">
                {Object.entries(user.permissions).map(([key, hasPerm]) =>
                    hasPerm && (
                        <span key={key} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 uppercase tracking-wide">
                            {key.replace('_', ' ')}
                        </span>
                    )
                )}
            </div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center mb-6">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                My Profile
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Edit Form */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                        <Key className="w-5 h-5 mr-2 text-gray-400" />
                        Account Details
                    </h3>

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl mb-6 text-sm flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                        >
                            {message.type === 'success' && <Check className="w-5 h-5 mr-3 flex-shrink-0" />}
                            {message.text}
                        </motion.div>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Your Full Name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">New Password (Optional)</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:bg-white dark:focus:bg-slate-800"
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2 ml-1">Only enter a password if you want to change it.</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center active:scale-95"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Identity Card & Permissions */}
                <div className="space-y-6">
                    {/* Identity Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 backdrop-blur-sm flex items-center justify-center text-3xl font-bold mb-4 shadow-xl">
                                {formData.name?.charAt(0) || "U"}
                            </div>
                            <h3 className="text-xl font-bold mb-1">{formData.name || "User"}</h3>
                            <p className="text-blue-100 text-sm mb-4">@{formData.username}</p>
                            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                {user.role}
                            </span>
                        </div>
                    </div>

                    {/* Permissions Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-green-600" />
                            Active Permissions
                        </h4>
                        <div className="min-h-[100px]">
                            {renderPermissions()}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
