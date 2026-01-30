import React, { useState, useEffect } from "react";
import { BookOpen, FlaskConical, FileText, ChevronDown, ChevronUp, Clock, GraduationCap, Plus, Edit, Trash2, X, Save } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";

const CourseCard = ({ course, isAdmin, hasPermission, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            onClick={(e) => {
                // Prevent toggle when clicking admin buttons
                if (e.target.closest('button')) return;
                setIsOpen(!isOpen);
            }}
            className={`group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 relative overflow-hidden cursor-pointer ${isOpen ? 'ring-2 ring-blue-500/50 dark:ring-blue-500/30' : ''}`}
        >
            <div className={`absolute top-0 left-0 w-2 h-full transition-colors duration-300 ${course.type === 'lab' ? 'bg-purple-500' :
                course.type === 'project' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>

            <div className="flex justify-between items-start mb-4 pl-4">
                <div className={`p-3 rounded-lg ${course.type === 'lab' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                    course.type === 'project' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                        'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                    {course.type === 'lab' ? <FlaskConical className="w-6 h-6" /> :
                        course.type === 'project' ? <FileText className="w-6 h-6" /> :
                            <BookOpen className="w-6 h-6" />}
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-sm font-mono font-bold text-gray-400 dark:text-gray-500">
                        {course.code}
                    </span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400 mt-2" /> : <ChevronDown className="w-5 h-5 text-gray-400 mt-2" />}
                </div>
            </div>

            <div className="pl-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                </h3>

                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <div className="flex items-center">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        {course.credit} Cr
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.hours}
                    </div>
                </div>

                {/* Content Section - Animated/Toggled */}
                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] mt-4 pt-4 border-t border-gray-50 dark:border-slate-700' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                            {course.description}
                        </p>
                        {hasPermission('syllabus_edit') && (
                            <div className="flex justify-end space-x-2 mt-4 pt-2 border-t border-gray-100 dark:border-slate-700">
                                <button
                                    onClick={() => onEdit(course)}
                                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(course.code)}
                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Syllabus() {
    const { user, isAdmin, hasPermission } = useAuth();
    const [syllabusData, setSyllabusData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        code: "",
        title: "",
        type: "theory",
        credit: "3.00",
        hours: "3 hrs/week",
        description: ""
    });

    useEffect(() => {
        fetchSyllabus();
    }, []);

    const fetchSyllabus = async () => {
        try {
            const { data, error } = await supabase.from('syllabus').select('*').order('code', { ascending: true });
            if (error) throw error;
            setSyllabusData(data);
        } catch (error) {
            console.error("Failed to fetch syllabus:", error);
        }
    };

    const handleDelete = async (code) => {
        if (!isAdmin) {
            if (!window.confirm("Send deletion request for this course?")) return;
            try {
                // Find course details
                const course = syllabusData.find(c => c.code === code);
                const { error } = await supabase.from('deletion_requests').insert({
                    type: 'syllabus',
                    resource_id: code,
                    details: {
                        name: course ? course.title : 'Unknown Course',
                        code: code
                    },
                    requested_by: user.username,
                    status: 'pending',
                    date: new Date().toISOString()
                });

                if (error) throw error;
                alert("Deletion request sent successfully!");
            } catch (err) {
                console.error("Error sending deletion request:", err);
                alert("Failed to send deletion request.");
            }
            return;
        }

        if (!window.confirm("Are you sure you want to delete this course from the syllabus?")) return;

        try {
            const { error } = await supabase.from('syllabus').delete().eq('code', code);
            if (error) throw error;
            fetchSyllabus();
        } catch (error) {
            console.error("Error deleting course:", error);
            alert(`Error deleting: ${error.message}`);
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData(course);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingCourse(null);
        setFormData({
            code: "",
            title: "",
            type: "theory",
            credit: "3.00",
            hours: "3 hrs/week",
            description: ""
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('syllabus').upsert({
                code: formData.code,
                title: formData.title,
                type: formData.type,
                credit: formData.credit,
                hours: formData.hours,
                description: formData.description
            });

            if (error) throw error;

            setIsModalOpen(false);
            fetchSyllabus();
        } catch (error) {
            console.error("Error saving course:", error);
            alert("Failed to save course");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
            <div className="text-center mb-12 relative">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    Course Syllabus
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
                    CSE 4th Year 1st Semester (4-1)
                </p>

                {hasPermission('syllabus_edit') && (
                    <div className="absolute right-0 top-0 mt-2 mr-2 md:mr-0 flex flex-col space-y-2">
                        <button
                            onClick={handleAddNew}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Course
                        </button>
                    </div>
                )}

                <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                    Click on any course card to view full syllabus details
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
                {syllabusData.map((course, index) => (
                    <CourseCard
                        key={index}
                        course={course}
                        isAdmin={isAdmin}
                        hasPermission={hasPermission}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {/* Download Resources Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Syllabus Downloads</h2>
                <div className="flex flex-wrap justify-center gap-6">
                    {/* CSE-41 PDF */}
                    <div className="flex flex-col space-y-3 items-center">
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">CSE 4-1 Syllabus</span>
                        <div className="flex space-x-2">
                            <a
                                href="/syllabus-4-1.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-md shadow-indigo-200 dark:shadow-none text-sm"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                View
                            </a>
                            <a
                                href="/syllabus-4-1.pdf"
                                download="Syllabus_NWU_CSE_4-1.pdf"
                                className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors font-medium text-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download
                            </a>
                        </div>
                        {hasPermission('syllabus_edit') && (
                            <label className="inline-flex items-center px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium cursor-pointer text-xs mt-1">
                                <Edit className="w-3 h-3 mr-1.5" />
                                Update PDF
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={async (e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            if (!window.confirm(`Update CSE 4-1 syllabus PDF with "${file.name}"?`)) return;

                                            try {
                                                const { error } = await supabase.storage
                                                    .from('materials')
                                                    .upload('syllabus/syllabus-4-1.pdf', file, { upsert: true });

                                                if (error) throw error;
                                                alert('Syllabus PDF updated successfully!');
                                                // Ideally verify URL works
                                            } catch (err) {
                                                console.error(err);
                                                alert('Error uploading PDF');
                                            }
                                        }
                                    }}
                                />
                            </label>
                        )}
                    </div>

                    {/* NWU-CSE PDF */}
                    <div className="flex flex-col space-y-3 items-center">
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Complete NWU CSE Syllabus</span>
                        <div className="flex space-x-2">
                            <a
                                href="/syllabus.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium shadow-md shadow-teal-200 dark:shadow-none text-sm"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                View
                            </a>
                            <a
                                href="/syllabus.pdf"
                                download="NWU_CSE_Syllabus.pdf"
                                className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors font-medium text-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download
                            </a>
                        </div>
                        {hasPermission('syllabus_edit') && (
                            <label className="inline-flex items-center px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium cursor-pointer text-xs mt-1">
                                <Edit className="w-3 h-3 mr-1.5" />
                                Update PDF
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={async (e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            if (!window.confirm(`Update Complete CSE syllabus PDF with "${file.name}"?`)) return;

                                            try {
                                                const { error } = await supabase.storage
                                                    .from('materials')
                                                    .upload('syllabus/syllabus-full.pdf', file, { upsert: true });

                                                if (error) throw error;
                                                alert('Syllabus PDF updated successfully!');
                                            } catch (err) {
                                                console.error(err);
                                                alert('Error uploading PDF');
                                            }
                                        }
                                    }}
                                />
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                {editingCourse ? "Edit Syllabus" : "Add New Course"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        // Disable code editing for updates if desired, but allowing it for now
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="CSE-41XX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="theory">Theory</option>
                                        <option value="lab">Laboratory</option>
                                        <option value="project">Project/Thesis</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credit</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.credit}
                                        onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hours/Week</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.hours}
                                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
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
                                    Save Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
