import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash, RefreshCw, X, Shield, Search, Filter } from 'lucide-react';

const ActivityLogs = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLogs, setSelectedLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/logs");
            if (res.ok) setAuditLogs(await res.json());
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectLog = (id) => {
        setSelectedLogs(prev =>
            prev.includes(id) ? prev.filter(logId => logId !== id) : [...prev, id]
        );
    };

    const handleSelectAllLogs = () => {
        if (selectedLogs.length === auditLogs.length) {
            setSelectedLogs([]);
        } else {
            setSelectedLogs(auditLogs.map(l => l.id));
        }
    };

    const handleDeleteLog = async (id) => {
        if (!window.confirm("Delete this log entry?")) return;
        try {
            const res = await fetch(`/api/admin/logs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setAuditLogs(prev => prev.filter(l => l.id !== id));
                setSelectedLogs(prev => prev.filter(lId => lId !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteSelectedLogs = async () => {
        if (!window.confirm(`Delete ${selectedLogs.length} selected logs?`)) return;
        try {
            const res = await fetch('/api/admin/logs/batch-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedLogs })
            });
            if (res.ok) {
                fetchAuditLogs();
                setSelectedLogs([]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleClearLogs = async () => {
        if (!window.confirm("Clear ALL logs? This cannot be undone.")) return;
        const password = prompt("Please enter admin password to confirm:");
        if (password !== "admin123") return alert("Incorrect password"); // Simple check for MVP

        try {
            const res = await fetch('/api/admin/logs', { method: 'DELETE' });
            if (res.ok) {
                setAuditLogs([]);
                setSelectedLogs([]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredLogs = auditLogs.filter(log =>
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={fetchAuditLogs} className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors shadow-sm">
                        <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                    </button>

                    {selectedLogs.length > 0 && (
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={handleDeleteSelectedLogs}
                            className="flex items-center space-x-2 px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 font-medium transition-colors"
                        >
                            <Trash className="w-4 h-4" />
                            <span>Delete ({selectedLogs.length})</span>
                        </motion.button>
                    )}

                    <button onClick={handleClearLogs} className="px-4 py-3 bg-white dark:bg-slate-800 text-red-500 border border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors shadow-sm">
                        Clear All
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <th className="py-4 px-6 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedLogs.length === auditLogs.length && auditLogs.length > 0}
                                        onChange={handleSelectAllLogs}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="py-4 px-6">Timestamp</th>
                                <th className="py-4 px-6">User</th>
                                <th className="py-4 px-6">Action</th>
                                <th className="py-4 px-6">Details</th>
                                <th className="py-4 px-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            <AnimatePresence>
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-gray-500">
                                            No logs found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map(log => (
                                        <motion.tr
                                            key={log.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${selectedLogs.includes(log.id) ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
                                        >
                                            <td className="py-4 px-6">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLogs.includes(log.id)}
                                                    onChange={() => handleSelectLog(log.id)}
                                                    className="rounded text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-6 font-medium text-gray-800 dark:text-gray-200">
                                                {log.user || "System"}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold max-w-xs truncate block ${log.type === 'error' ? 'bg-red-100 text-red-700' :
                                                        log.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 max-w-md truncate" title={log.details}>
                                                {log.details}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button onClick={() => handleDeleteLog(log.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default ActivityLogs;
