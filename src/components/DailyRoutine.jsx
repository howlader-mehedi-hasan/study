import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, BookOpen, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function DailyRoutine() {
    const { isAdmin, user, hasPermission } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAutoAdvanced, setIsAutoAdvanced] = useState(false);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Fetch Schedule Data & Settings
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // Fetch Settings
                const settingsRes = await fetch('/api/settings');
                const settings = await settingsRes.json();
                const switchTime = settings.routineSwitchTime || "18:00"; // Default 6 PM

                // Check Time for Auto-Advance
                const now = new Date();
                const [switchHour, switchMinute] = switchTime.split(':').map(Number);
                const switchDate = new Date();
                switchDate.setHours(switchHour, switchMinute, 0, 0);

                let initialDate = new Date();
                if (now >= switchDate) {
                    initialDate.setDate(initialDate.getDate() + 1);
                    setIsAutoAdvanced(true);
                }
                setSelectedDate(initialDate);

                // Fetch Schedule
                const scheduleRes = await fetch('/api/schedule');
                const schedule = await scheduleRes.json();
                setScheduleData(schedule);

            } catch (error) {
                console.error("Failed to initialize routine", error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const fetchSchedule = () => { // Keep for updates
        fetch('/api/schedule')
            .then(res => res.json())
            .then(data => setScheduleData(data))
            .catch(console.error);
    };

    // Helper: Go to previous day
    const prevDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    // Helper: Go to next day
    const nextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const handleToggleCancel = async (item) => {
        if (!isAdmin && !hasPermission('class_cancellation_edit')) return;

        const newStatus = !item.isCancelled;

        try {
            const res = await fetch(`/api/schedule/${item.id}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCancelled: newStatus, username: user?.username })
            });

            if (res.ok) {
                // Optimistic update or refetch
                fetchSchedule();
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating schedule", error);
        }
    };

    // Filter schedule for the selected day
    const todaysClasses = useMemo(() => {
        const dayName = days[selectedDate.getDay()];
        return scheduleData
            .filter(item => item.day === dayName)
            .sort((a, b) => {
                // Simple string comparison works for 24h format "09:00" vs "10:00"
                return a.startTime.localeCompare(b.startTime);
            });
    }, [selectedDate, scheduleData]);

    const isToday = new Date().toDateString() === selectedDate.toDateString();

    // Helper: Format time to 12H
    const formatTime = (time24) => {
        if (!time24) return "";
        const [hours, minutes] = time24.split(':');
        let h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; // the hour '0' should be '12'
        return `${h}:${minutes} ${ampm}`;
    };

    if (loading) return <div className="p-6 text-center text-gray-500">Loading routine...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        {isToday ? "Today's Routine" : (isAutoAdvanced && selectedDate.getDate() === new Date().getDate() + 1 ? "Tomorrow's Routine" : days[selectedDate.getDay()])}
                        {isAutoAdvanced && selectedDate.getDate() === new Date().getDate() + 1 && (
                            <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">Next Day</span>
                        )}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={prevDay}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                        title="Previous Day"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setSelectedDate(new Date())}
                        className="px-3 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextDay}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                        title="Next Day"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
                {todaysClasses.length > 0 ? (
                    todaysClasses.map(item => (
                        <div key={item.id} className="relative pl-4 border-l-2 border-gray-100 dark:border-slate-700 last:pb-0 pb-4">
                            {/* Dot indicator */}
                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${item.type === 'Lab' ? 'bg-purple-500' : 'bg-blue-500'} ${item.isCancelled ? 'opacity-50' : ''}`}></div>

                            <div className={`p-4 rounded-xl transition-colors border ${item.isCancelled
                                ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                                : 'bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/50 border-transparent'
                                }`}>

                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-start gap-3">
                                        {/* Admin/Permission Checkbox */}
                                        {(isAdmin || hasPermission('class_cancellation_edit')) && (
                                            <div className="mt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={!item.isCancelled}
                                                    onChange={() => handleToggleCancel(item)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <h3 className={`font-semibold text-sm line-clamp-2 leading-tight ${item.isCancelled ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`} title={item.courseName}>
                                                {item.courseName}
                                            </h3>
                                            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                                                <BookOpen className="w-3 h-3 mr-1" />
                                                {item.courseId}
                                            </div>
                                            {/* Cancelled Message */}
                                            {item.isCancelled && (
                                                <p className="text-xs font-bold text-red-500 mt-1">Cancelled</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0 ml-2 ${item.type === 'Lab'
                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        }`}>
                                        {item.type}
                                    </span>
                                </div>

                                <div className={`space-y-2 ${item.isCancelled ? 'opacity-50' : ''}`}>
                                    {item.instructor && (
                                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                            <User className="w-3 h-3 mr-2 text-gray-400" />
                                            <span className="line-clamp-1" title={item.instructor}>{item.instructor}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 pt-2 mt-2">
                                        <div className="flex items-center">
                                            <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
                                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                        </div>
                                        {item.room && (
                                            <div className="flex items-center">
                                                <MapPin className="w-3 h-3 mr-1.5 text-gray-400" />
                                                Room {item.room}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No classes today</p>
                        <p className="text-xs text-gray-400 mt-1">Enjoy your free time!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
