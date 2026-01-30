import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash, AlertCircle } from 'lucide-react';
import { supabase } from "../../lib/supabaseClient";

const Complaints = () => {
    const [complaints, setComplaints] = useState([]);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const { data, error } = await supabase.from('complaints').select('*').order('date', { ascending: false });
            if (error) throw error;
            setComplaints(data);
        } catch (error) {
            console.error("Failed to fetch complaints", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this complaint?")) return;
        try {
            const { error } = await supabase.from('complaints').delete().eq('id', id);
            if (error) throw error;
            fetchComplaints();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <AlertCircle className="w-6 h-6 mr-2 text-red-600" />
                Complaints
            </h2>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {complaints.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                            <p>No complaints filed.</p>
                        </div>
                    ) : (
                        complaints.map(comp => (
                            <motion.div
                                key={comp.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-red-50/50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/20"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{comp.subject || "No Subject"}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            "{comp.description}"
                                        </p>
                                        <div className="flex gap-4 text-xs text-gray-500">
                                            <span>From: {comp.is_anonymous ? "Anonymous" : comp.name || "Unknown"}</span>
                                            <span>{new Date(comp.date || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(comp.id)} className="p-2 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                        <Trash className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Complaints;
