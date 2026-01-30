import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(username, password);
        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-slate-800">
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">Admin Login</h2>
                {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md dark:bg-red-900/30">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            required
                            autoComplete="off"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white pr-10"
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 cursor-pointer hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
