import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash, Check, X, Inbox } from 'lucide-react';

const DeletionRequests = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/admin/deletion-requests");
            if (res.ok) setRequests(await res.json());
        } catch (error) {
            console.error("Failed to fetch requests", error);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Approve this deletion? This item will be permanently deleted.")) return;
        try {
            const res = await fetch(`/api/admin/deletion-requests/${id}/approve`, { method: "POST" });
            if (res.ok) {
                fetchRequests();
            }
        } catch (error) {
            alert("Error approving request");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Reject this request?")) return;
        try {
            const res = await fetch(`/api/admin/deletion-requests/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchRequests();
            }
        } catch (error) {
            alert("Error rejecting request");
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <Inbox className="w-6 h-6 mr-2 text-blue-600" />
                Deletion Requests
            </h2>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                {requests.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p>No pending deletion requests.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                        <AnimatePresence>
                            {requests.map(req => (
                                <motion.div
                                    key={req.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                                >
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 uppercase">{req.type}</span>
                                            <span className="text-sm text-gray-500">{new Date(req.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="font-medium text-gray-800 dark:text-white">{req.reason || "No reason provided"}</p>
                                        <p className="text-sm text-gray-500">Requested by: {req.requestedBy}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleReject(req.id)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleApprove(req.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                                            <Check className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DeletionRequests;
