import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Plus, Calendar, Clock, FileText, Download, Trash2, Edit, X, Save, AlertCircle } from "lucide-react";

const NoticeCard = ({ notice, isAdmin, hasPermission, onEdit, onDelete }) => {
    const isExpired = new Date(notice.validUntil) < new Date();

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all relative group ${isExpired ? 'opacity-70' : ''}`}>
            {isExpired && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 text-xs rounded-md font-medium">
                    Archived
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full mb-3">
                        {notice.category || 'General'}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                        {notice.title}
                    </h3>
                </div>
                {(isAdmin || hasPermission('notices_edit')) && (
                    <div className="flex space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit(notice)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(notice.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                {notice.description}
            </p>

            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4 space-x-4">
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    Posted: {notice.date}
                </div>
                <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    Valid until: {notice.validUntil}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
                {notice.pdfPath ? (
                    <a
                        href={notice.pdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        View Attachment
                    </a>
                ) : (
                    <span className="text-sm text-gray-400 italic">No attachment</span>
                )}

                {notice.pdfPath && (
                    <a
                        href={notice.pdfPath}
                        download
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <Download className="w-4 h-4" />
                    </a>
                )}
            </div>
        </div>
    );
};

export default function Notices() {
    const { user, isAdmin, hasPermission } = useAuth();
    const [notices, setNotices] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [file, setFile] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        id: "",
        title: "",
        date: new Date().toISOString().split('T')[0],
        validUntil: "",
        category: "General",
        description: "",
        content: "",
        pdfPath: ""
    });

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const res = await fetch('/api/notices');
            const data = await res.json();
            // Sort by date descending
            setNotices(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (error) {
            console.error("Error fetching notices:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!isAdmin) {
            if (!window.confirm("Send deletion request for this notice?")) return;
            try {
                const response = await fetch("/api/deletion-requests", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "notice",
                        resourceId: id,
                        details: { title: notices.find(n => n.id === id)?.title || "Notice" },
                        requestedBy: user.username
                    })
                });
                if (response.ok) alert("Deletion request sent to Admin.");
                else alert("Failed to send request.");
            } catch (err) {
                alert("Failed to send request.");
            }
            return;
        }

        if (!window.confirm("Are you sure you want to delete this notice?")) return;
        try {
            await fetch(`/api/notices/${id}`, { method: 'DELETE' });
            fetchNotices();
        } catch (error) {
            console.error("Error deleting notice:", error);
        }
    };

    const handleEdit = (notice) => {
        setEditingNotice(notice);
        setFormData(notice);
        setFile(null);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingNotice(null);
        setFile(null);
        const today = new Date().toISOString().split('T')[0];
        // Default valid for 30 days
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);

        setFormData({
            id: `notice-${Date.now()}`,
            title: "",
            date: today,
            validUntil: nextMonth.toISOString().split('T')[0],
            category: "General",
            description: "",
            content: "",
            pdfPath: ""
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let finalPdfPath = formData.pdfPath;

        // Upload file if selected
        if (file) {
            const uploadData = new FormData();
            uploadData.append('file', file);
            try {
                const res = await fetch('/api/notices/pdf', {
                    method: 'POST',
                    body: uploadData
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Server returned ${res.status}: ${text}`);
                }

                const data = await res.json();
                if (data.success) {
                    finalPdfPath = data.filePath;
                } else {
                    throw new Error(data.error || "Unknown upload error");
                }
            } catch (error) {
                console.error("File upload failed:", error);
                alert(`Failed to upload PDF: ${error.message}`);
                return;
            }
        }

        // Save Notice
        const noticeToSave = { ...formData, pdfPath: finalPdfPath, username: user.username };

        try {
            const res = await fetch('/api/notices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noticeToSave)
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchNotices();
            } else {
                alert("Failed to save notice");
            }
        } catch (error) {
            console.error("Error saving notice:", error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-slate-700 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Notices Board</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Stay updated with the latest announcements and schedules.
                    </p>
                </div>
                {(isAdmin || hasPermission('notices_edit')) && (
                    <button
                        onClick={handleAddNew}
                        className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-200 dark:shadow-none"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Post Notice
                    </button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {notices.length > 0 ? (
                    notices.map((notice) => (
                        <NoticeCard
                            key={notice.id}
                            notice={notice}
                            isAdmin={isAdmin}
                            hasPermission={hasPermission}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No notices found</p>
                        <p className="text-sm">Check back later for updates</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {editingNotice ? "Edit Notice" : "New Notice"}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Enter notice title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="General">General</option>
                                            <option value="Exam">Exam</option>
                                            <option value="Class">Class</option>
                                            <option value="Event">Event</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Publish Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid Until</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.validUntil}
                                            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Description</label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        placeholder="Brief summary shown on the card"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detailed Content (Optional)</label>
                                    <textarea
                                        rows={4}
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        placeholder="Full details of the notice..."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachment (PDF/Image)</label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Download className="w-8 h-8 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold">{file ? file.name : "Click to upload"}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">PDF or Image (MAX. 5MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="application/pdf,image/*"
                                            onChange={(e) => e.target.files && setFile(e.target.files[0])}
                                        />
                                    </label>
                                    {formData.pdfPath && !file && (
                                        <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center">
                                            <FileText className="w-4 h-4 mr-1" />
                                            Current file attached
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 dark:border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-200 dark:shadow-none transition-colors font-medium flex items-center"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingNotice ? "Update Notice" : "Post Notice"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
