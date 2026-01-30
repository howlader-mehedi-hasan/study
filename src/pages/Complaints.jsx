import React, { useState } from "react";
import { AlertCircle, Shield, CheckCircle, Send, FileWarning } from "lucide-react";

export default function Complaints() {
    const [formData, setFormData] = useState({
        subject: "",
        department: "General",
        description: "",
        anonymous: false
    });
    const [status, setStatus] = useState(null); // 'success', 'error', or null

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ subject: "", department: "General", description: "", anonymous: false });
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full mb-6">
                    <FileWarning className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Submit a Complaint</h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    We take your grievances seriously. Use this form to report issues regarding facilities, harassment, or academic matters.
                    You can choose to remain anonymous.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 md:p-10">

                {status === 'success' && (
                    <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center text-green-700 dark:text-green-300">
                        <CheckCircle className="w-5 h-5 mr-3 shrink-0" />
                        <span>Your complaint has been submitted successfully. We will review it shortly.</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center text-red-700 dark:text-red-300">
                        <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                        <span>Something went wrong. Please try again later.</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-colors dark:text-white"
                                placeholder="e.g., Broken Projector in Room 304"
                                value={formData.subject}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department / Category</label>
                            <select
                                name="department"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-colors dark:text-white"
                                value={formData.department}
                                onChange={handleChange}
                            >
                                <option value="General">General Issue</option>
                                <option value="Academic">Academic / Grades</option>
                                <option value="Facility">Facilities / Maintenance</option>
                                <option value="Harassment">Harassment / Misconduct</option>
                                <option value="Tech">Technical Support</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea
                            name="description"
                            required
                            rows="6"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-colors dark:text-white resize-none"
                            placeholder="Please provide detailed information about the issue..."
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                        <p className="text-xs text-gray-500 mt-2">Please be as specific as possible to help us address the issue efficiently.</p>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                        <input
                            type="checkbox"
                            id="anonymous"
                            name="anonymous"
                            checked={formData.anonymous}
                            onChange={handleChange}
                            className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300 dark:border-slate-600 cursor-pointer"
                        />
                        <label htmlFor="anonymous" className="ml-3 flex items-center cursor-pointer select-none">
                            <span className="font-medium text-gray-900 dark:text-white">Submit Anonymously</span>
                            <Shield className="w-4 h-4 ml-2 text-gray-400" />
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-red-600/20"
                    >
                        <Send className="w-5 h-5 mr-2" />
                        Submit Complaint
                    </button>

                    {formData.anonymous && (
                        <p className="text-center text-xs text-gray-500">
                            * Your identity will be hidden from administrators.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
