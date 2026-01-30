import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash, MessageSquare, Star, Pencil, X, Save } from 'lucide-react';
import { supabase } from "../../lib/supabaseClient";

const Opinions = () => {
    const [opinions, setOpinions] = useState([]);
    const [editingOpinion, setEditingOpinion] = useState(null);
    const [editForm, setEditForm] = useState({ rating: 0, feedback: "", date: "" });

    useEffect(() => {
        fetchOpinions();
    }, []);

    const fetchOpinions = async () => {
        try {
            const { data, error } = await supabase.from('opinions').select('*').order('date', { ascending: false });
            if (error) throw error;
            setOpinions(data);
        } catch (error) {
            console.error("Failed to fetch opinions", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this feedback?")) return;
        try {
            const { error } = await supabase.from('opinions').delete().eq('id', id);
            if (error) throw error;
            fetchOpinions();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (op) => {
        setEditingOpinion(op);
        setEditForm({ rating: op.rating, feedback: op.feedback, date: op.date });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('opinions').update({
                rating: editForm.rating,
                feedback: editForm.feedback
            }).eq('id', editingOpinion.id);

            if (error) throw error;

            setEditingOpinion(null);
            fetchOpinions();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-amber-500" />
                User Feedback
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {opinions.map(op => (
                        <motion.div
                            key={op.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col"
                        >
                            {editingOpinion?.id === op.id ? (
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500">Rating</label>
                                        <input
                                            type="number" min="1" max="5"
                                            value={editForm.rating}
                                            onChange={e => setEditForm({ ...editForm, rating: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500">Feedback</label>
                                        <textarea
                                            value={editForm.feedback}
                                            onChange={e => setEditForm({ ...editForm, feedback: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white min-h-[100px]"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setEditingOpinion(null)} className="flex-1 py-2 bg-gray-100 rounded-lg text-sm font-medium">Cancel</button>
                                        <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < op.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                                            ))}
                                        </div>
                                        <div className="flex space-x-1">
                                            <button onClick={() => handleEdit(op)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(op.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 italic mb-4 flex-grow">"{op.feedback}"</p>
                                    <p className="text-xs text-gray-400 text-right">{new Date(op.date || Date.now()).toLocaleDateString()}</p>
                                </>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Opinions;
