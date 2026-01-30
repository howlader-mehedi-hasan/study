import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';

const AdminLogin = ({ onLogin, loginError }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await onLogin(username, password);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl shadow-blue-900/10 text-center max-w-sm w-full border border-gray-100 dark:border-slate-700 relative overflow-hidden"
            >
                {/* Decorative background blob */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white dark:ring-slate-800 absolute -top-10 left-1/2 transform -translate-x-1/2 mt-8">
                    <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Admin Access</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Sign in to manage the system.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                    {loginError && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-center font-medium"
                        >
                            {loginError}
                        </motion.p>
                    )}

                    <div>
                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all mt-1"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Password</label>
                        <div className="relative mt-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                    >
                        {isLoading ? "Signing in..." : "Login to Dashboard"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
