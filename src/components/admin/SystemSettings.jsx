import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, FileText, Check, Layout, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const SystemSettings = ({ user, isAdmin }) => {
    // Global Settings State
    const [welcomeMessage, setWelcomeMessage] = useState("");
    const [visibleDays, setVisibleDays] = useState([]);
    const [defaultScheduleView, setDefaultScheduleView] = useState("classic");
    const [routineSwitchTime, setRoutineSwitchTime] = useState("18:00");
    const [breakingNews, setBreakingNews] = useState("");
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsMessage, setSettingsMessage] = useState(null);

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch("/api/settings");
            if (response.ok) {
                const data = await response.json();
                setWelcomeMessage(data.welcomeMessage || "");
                setVisibleDays(data.visibleDays || []);
                setDefaultScheduleView(data.defaultScheduleView || "classic");
                setRoutineSwitchTime(data.routineSwitchTime || "18:00");
                setBreakingNews(data.breakingNews || "");
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSettingsLoading(true);
        setSettingsMessage(null);

        try {
            const response = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    welcomeMessage,
                    visibleDays,
                    defaultScheduleView,
                    routineSwitchTime,
                    breakingNews
                }),
            });

            if (response.ok) {
                setSettingsMessage({ type: "success", text: "Settings saved successfully!" });
                setTimeout(() => setSettingsMessage(null), 3000);
            } else {
                throw new Error("Failed to save settings");
            }
        } catch (error) {
            setSettingsMessage({ type: "error", text: error.message });
        } finally {
            setSettingsLoading(false);
        }
    };

    const toggleDay = (day) => {
        setVisibleDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

            {settingsMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 rounded-xl flex items-center shadow-lg ${settingsMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                >
                    {settingsMessage.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <div className="w-5 h-5 mr-2" />}
                    {settingsMessage.text}
                </motion.div>
            )}

            {/* Course Management Card */}
            <motion.div variants={cardVariants} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-8 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center mb-2">
                        <FileText className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                        Course Materials
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-lg">Manage courses, upload files, and organize content for students. This is your content hub.</p>
                </div>
                <Link
                    to="/courses"
                    className="relative z-10 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center group"
                >
                    Manage Courses
                    <Check className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                </Link>
                {/* Decorative Elements */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Site Configuration */}
                <motion.div variants={cardVariants} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h2 className="text-lg font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                        <Layout className="w-5 h-5 mr-2 text-gray-400" />
                        Site Configuration
                    </h2>

                    {(isAdmin || user?.permissions?.welcome_message_edit || user?.permissions?.breaking_news_edit) ? (
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            {(isAdmin || user?.permissions?.welcome_message_edit) && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Welcome Message</label>
                                        <input
                                            type="text"
                                            value={welcomeMessage}
                                            onChange={(e) => setWelcomeMessage(e.target.value)}
                                            placeholder="e.g. Welcome to ClassMaterials"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Routine Switch Time (24H)</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="time"
                                                value={routineSwitchTime}
                                                onChange={(e) => setRoutineSwitchTime(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            After this time, "Today's Routine" will automatically show tomorrow's classes.
                                        </p>
                                    </div>
                                </>
                            )}

                            {(isAdmin || user?.permissions?.breaking_news_edit) && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Breaking News / Ticker</label>
                                    <textarea
                                        value={breakingNews}
                                        onChange={(e) => setBreakingNews(e.target.value)}
                                        placeholder="Enter news text. Separate multiple headlines with '///'. Leave empty to show automatic recent notices."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Use '///' to separate multiple news items (e.g., "Exam Cancelled /// New Routine Published")
                                    </p>
                                </div>
                            )}
                            <div className="pt-4">
                                <button type="submit" disabled={settingsLoading} className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-3 rounded-xl hover:opacity-90 transition-opacity font-bold shadow-lg flex justify-center items-center">
                                    {settingsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-gray-500 text-sm italic border border-gray-100 dark:border-slate-600">
                            You do not have permission to edit site configuration.
                        </div>
                    )}
                </motion.div>

                {/* Schedule Visibility */}
                <motion.div variants={cardVariants} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h2 className="text-lg font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-gray-400" />
                        Schedule Settings
                    </h2>

                    {(isAdmin || user?.permissions?.schedule_edit) ? (
                        <>
                            <div className="space-y-2 mb-8">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Visible Days</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {daysOfWeek.map(day => (
                                        <label key={day} className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer border transition-all ${visibleDays.includes(day) ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" : "bg-white border-transparent hover:bg-gray-50 dark:bg-slate-800/50 dark:hover:bg-slate-700"}`}>
                                            <input
                                                type="checkbox"
                                                checked={visibleDays.includes(day)}
                                                onChange={() => toggleDay(day)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className={`font-medium text-sm ${visibleDays.includes(day) ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>{day}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Default View Mode</label>
                                <div className="bg-gray-100 dark:bg-slate-700/50 p-1 rounded-xl flex">
                                    <button
                                        type="button"
                                        onClick={() => setDefaultScheduleView("classic")}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${defaultScheduleView === 'classic' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`}
                                    >
                                        Classic Cards
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDefaultScheduleView("precision")}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${defaultScheduleView === 'precision' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`}
                                    >
                                        Precision Timeline
                                    </button>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleSaveSettings}
                                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 text-sm"
                                    >
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-gray-500 text-sm italic border border-gray-100 dark:border-slate-600">
                            You do not have permission to edit schedule visibility.
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SystemSettings;
