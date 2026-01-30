import React, { useState, useEffect } from "react";
import { Plus, Trash2, XCircle, CheckCircle, CalendarDays, Loader } from "lucide-react";

export default function Holidays() {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newHoliday, setNewHoliday] = useState({
        date: "",
        title: "",
        note: ""
    });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/holidays");
            if (res.ok) {
                const data = await res.json();
                setHolidays(data.sort((a, b) => new Date(a.date) - new Date(b.date)));
            }
        } catch (error) {
            console.error("Failed to fetch holidays", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddHoliday = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/holidays", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newHoliday)
            });
            if (res.ok) {
                setIsAdding(false);
                setNewHoliday({ date: "", title: "", note: "" });
                fetchHolidays();
            }
        } catch (error) {
            console.error("Failed to add holiday", error);
        }
    };

    const toggleCancellation = async (holiday) => {
        try {
            const res = await fetch(`/api/holidays/${holiday.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isCancelled: !holiday.isCancelled })
            });
            if (res.ok) {
                fetchHolidays();
            }
        } catch (error) {
            console.error("Failed to update holiday", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this holiday?")) return;
        try {
            const res = await fetch(`/api/holidays/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchHolidays();
            }
        } catch (error) {
            console.error("Failed to delete holiday", error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <CalendarDays className="w-6 h-6 text-purple-600" />
                    Holiday Management
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5 mr-1" />
                    Add Holiday
                </button>
            </div>

            {/* Add Holiday Form */}
            {isAdding && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Add New Holiday</h3>
                    <form onSubmit={handleAddHoliday} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                value={newHoliday.date}
                                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Eid-ul-Fitr"
                                value={newHoliday.title}
                                onChange={(e) => setNewHoliday({ ...newHoliday, title: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note (Optional)</label>
                            <input
                                type="text"
                                placeholder="Why is this a holiday?"
                                value={newHoliday.note}
                                onChange={(e) => setNewHoliday({ ...newHoliday, note: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex-1"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Holiday List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            ) : holidays.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Date</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Title</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Note</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Type</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="p-4 font-semibold text-right text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {holidays.map((holiday) => (
                                <tr key={holiday.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {formatDate(holiday.date)}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                                        {holiday.title}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                        {holiday.note || "-"}
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${holiday.type === 'default'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                            }`}>
                                            {holiday.type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded-full flex items-center w-fit gap-1 ${holiday.isCancelled
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                            {holiday.isCancelled ? (
                                                <><XCircle className="w-3 h-3" /> Inactive</>
                                            ) : (
                                                <><CheckCircle className="w-3 h-3" /> Active</>
                                            )}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2 text-sm text-gray-500">
                                        <button
                                            onClick={() => toggleCancellation(holiday)}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            {holiday.isCancelled ? "Activate" : "Cancel"}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(holiday.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                    <CalendarDays className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No holidays found.</p>
                </div>
            )}
        </div>
    );
}
