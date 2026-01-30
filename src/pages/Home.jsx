import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, FileText, Bell, Clock, ArrowRight, Activity, Edit, Check, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import DailyRoutine from "../components/DailyRoutine";
import NewsTicker from "../components/NewsTicker";

export default function Home() {
    const { isAdmin, hasPermission } = useAuth();
    const today = new Date();
    const [welcomeMessage, setWelcomeMessage] = useState("Welcome to ClassMaterials Dashboard");
    const [isEditingMessage, setIsEditingMessage] = useState(false);
    const [tempMessage, setTempMessage] = useState("");
    const [settings, setSettings] = useState({});

    const [coursesCount, setCoursesCount] = useState(0);
    const [totalFiles, setTotalFiles] = useState(0);
    const [recentNotices, setRecentNotices] = useState([]);
    const [nextExam, setNextExam] = useState(null);

    // Fetch All Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Settings
                const { data: settingsData } = await supabase.from('settings').select('*').single();
                if (settingsData) {
                    setSettings(settingsData);
                    if (settingsData.welcome_message) {
                        setWelcomeMessage(settingsData.welcome_message);
                    }
                }

                // 2. Counts
                const { count: cCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
                setCoursesCount(cCount || 0);

                const { count: fCount } = await supabase.from('course_files').select('*', { count: 'exact', head: true });
                setTotalFiles(fCount || 0);

                // 3. Recent Notices
                const { data: noticesData } = await supabase
                    .from('notices')
                    .select('*')
                    .order('date', { ascending: false })
                    .limit(3);

                if (noticesData) {
                    setRecentNotices(noticesData.map(n => ({ ...n, validUntil: n.valid_until, pdfPath: n.pdf_path })));
                }

                // 4. Next Exam
                const todayStr = new Date().toISOString().split('T')[0];
                const { data: examsData } = await supabase
                    .from('exams')
                    .select('*, courses(name)')
                    .gte('date', todayStr)
                    .order('date', { ascending: true })
                    .limit(1);

                if (examsData && examsData.length > 0) {
                    const exam = examsData[0];
                    const examDate = new Date(`${exam.date}T${exam.time}`);
                    setNextExam({
                        ...exam,
                        examDate,
                        courseName: exam.courses?.name,
                        courseId: exam.course_id
                    });
                } else {
                    setNextExam(null);
                }

            } catch (err) {
                console.error("Failed to load dashboard data", err);
            }
        };

        fetchData();
    }, []);

    const handleSaveMessage = async () => {
        const newSettings = { ...settings, welcome_message: tempMessage };
        try {
            const { error } = await supabase.from('settings').upsert({
                id: 1,
                welcome_message: tempMessage
            });

            if (error) throw error;

            setWelcomeMessage(tempMessage);
            setSettings(newSettings);
            setIsEditingMessage(false);

        } catch (error) {
            console.error("Failed to save settings", error);
        }
    };

    // Logic replaced by Supabase fetch


    return (
        <div className="max-w-7xl mx-auto px-4 py-8">

            {/* Hero Section */}
            <div className="mb-12 text-center md:text-left md:flex md:justify-between md:items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2 group">
                        {isEditingMessage ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={tempMessage}
                                    onChange={(e) => setTempMessage(e.target.value)}
                                    className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none w-full min-w-[300px]"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSaveMessage}
                                    className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsEditingMessage(false)}
                                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <span dangerouslySetInnerHTML={{
                                    __html: welcomeMessage.replace(/ClassMaterials/g, '<span class="text-blue-600 dark:text-blue-400">ClassMaterials</span>')
                                }} />
                                {hasPermission('welcome_message_edit') && (
                                    <button
                                        onClick={() => {
                                            setTempMessage(welcomeMessage);
                                            setIsEditingMessage(true);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-gray-400"
                                        title="Edit Welcome Message"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                )}
                            </h1>
                        )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                        {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{coursesCount} Courses</span>
                    </div>
                    <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-green-500" />
                        <span>{totalFiles} Resources</span>
                    </div>
                </div>
            </div>

            {/* News Ticker */}
            <NewsTicker
                notices={recentNotices}
                customMessage={settings.breaking_news}
                bgColor={settings.news_bg_color}
                textColor={settings.news_text_color}
                isRounded={settings.news_is_rounded}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Quick Actions & Notices */}
                <div className="contents lg:block lg:col-span-2 space-y-8">

                    {/* Quick Links Grid */}
                    <div className="order-4 lg:order-none grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/courses" className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all group text-center">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Courses</h3>
                        </Link>
                        <Link to="/syllabus" className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800 transition-all group text-center">
                            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Syllabus</h3>
                        </Link>
                        <Link to="/notices" className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800 transition-all group text-center">
                            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <Bell className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Notices</h3>
                        </Link>
                        <Link to="/schedule" className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-green-200 dark:hover:border-green-800 transition-all group text-center">
                            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Schedule</h3>
                        </Link>
                    </div>

                    {/* Recent Notices */}
                    <div className="order-3 lg:order-none bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-orange-500" />
                                Recent Updates
                            </h2>
                            <Link to="/notices" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {recentNotices.length > 0 ? recentNotices.map(notice => (
                                <div key={notice.id} className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-orange-500 mr-4"></div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{notice.title}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notice.date} • {notice.category}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-sm">No recent notices.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="contents lg:block space-y-8">
                    {/* Next Exam Card */}
                    <div className="order-2 lg:order-none bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                        <h2 className="text-lg font-semibold mb-4 flex items-center relative z-10">
                            <Clock className="w-5 h-5 mr-2" />
                            Up Next
                        </h2>

                        {nextExam ? (
                            <div className="relative z-10">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4 border border-white/10">
                                    <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded uppercase tracking-wide mb-2 inline-block">
                                        {nextExam.courseName}
                                    </span>
                                    <h3 className="text-2xl font-bold mb-1">{nextExam.title}</h3>
                                    <p className="text-blue-100 text-sm mb-3">
                                        {nextExam.examDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                        <br />
                                        at {nextExam.time}
                                    </p>
                                    <Link to={`/course/${nextExam.courseId}`} className="inline-flex items-center text-sm font-semibold hover:text-blue-200 transition-colors">
                                        View Syllabus <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-blue-200 opacity-80">Make sure to prepare well!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-blue-100">
                                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Calendar className="w-8 h-8" />
                                </div>
                                <p className="font-medium">No upcoming exams.</p>
                                <p className="text-xs opacity-75 mt-1">Enjoy your free time!</p>
                            </div>
                        )}
                    </div>

                    {/* Today's Routine Widget */}
                    <div className="order-1 lg:order-none">
                        <DailyRoutine />
                    </div>
                </div>
            </div>
        </div>
    );
}
