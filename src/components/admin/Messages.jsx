import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash, Mail } from 'lucide-react';
import { supabase } from "../../lib/supabaseClient";

const Messages = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase.from('messages').select('*').order('date', { ascending: false });
            if (error) throw error;
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this message?")) return;
        try {
            const { error } = await supabase.from('messages').delete().eq('id', id);
            if (error) throw error;
            fetchMessages();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <Mail className="w-6 h-6 mr-2 text-blue-600" />
                Messages
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {messages.length === 0 ? (
                        <div className="col-span-full p-12 text-center text-gray-500 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                            <p>No messages received.</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <motion.div
                                key={msg.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{msg.name}</h3>
                                        <p className="text-xs text-gray-500">{msg.email}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(msg.date || Date.now()).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow mb-4">
                                    "{msg.message}"
                                </p>
                                <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                                    <button onClick={() => handleDelete(msg.id)} className="text-sm text-red-500 hover:text-red-600 flex items-center font-medium">
                                        <Trash className="w-4 h-4 mr-1" /> Delete
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

export default Messages;
