import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FileText, ArrowLeft, Download, Eye, HelpCircle, Upload, Check, Loader2, Plus, Trash2, Clock, Calendar, Pencil, BookOpen } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

import { supabase } from "../lib/supabaseClient";

const safeDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
};

export default function CourseView() {
    const { courseId } = useParams();
    const { user, isAdmin, hasPermission } = useAuth();


    // Upload State
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [syllabus, setSyllabus] = useState(null);

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseData = async () => {
            setLoading(true);
            try {
                // Fetch Course & Files & Exams
                const { data, error } = await supabase
                    .from('courses')
                    .select('*, files:course_files(*), exams(*)')
                    .eq('id', courseId)
                    .single();

                if (error) throw error;
                setCourse(data);

                // Fetch Syllabus (independent table)
                const { data: sylData } = await supabase
                    .from('syllabus')
                    .select('*')
                    .eq('code', courseId)
                    .single();

                setSyllabus(sylData);

            } catch (err) {
                console.error("Course fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) fetchCourseData();
    }, [courseId]);

    const refreshCourse = async () => {
        const { data } = await supabase
            .from('courses')
            .select('*, files:course_files(*), exams(*)')
            .eq('id', courseId)
            .single();
        if (data) setCourse(data);
    };

    const [isAddingExam, setIsAddingExam] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingExamId, setEditingExamId] = useState(null);
    const [newExam, setNewExam] = useState({ title: '', date: '', time: '', syllabus: '' });

    const resetExamForm = () => {
        setIsAddingExam(false);
        setIsEditing(false);
        setEditingExamId(null);
        setNewExam({ title: '', date: '', time: '', syllabus: '' });
    };

    const handleEditClick = (exam) => {
        setIsEditing(true);
        setEditingExamId(exam.id);
        setNewExam({
            title: exam.title || '',
            date: exam.date || '',
            time: exam.time || '',
            syllabus: exam.syllabus || ''
        });
        setIsAddingExam(true); // Open the form
    };

    const handleSaveExam = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...newExam, course_id: courseId };
            if (isEditing) payload.id = editingExamId;

            const { error } = await supabase.from('exams').upsert(payload);
            if (error) throw error;

            alert(isEditing ? 'Exam updated successfully!' : 'Exam added successfully!');
            resetExamForm();
            refreshCourse();
        } catch (error) {
            console.error(error);
            alert('Error saving exam');
        }
    };

    const handleDeleteExam = async (examId) => {
        if (!isAdmin) {
            if (!window.confirm("Send deletion request for this exam?")) return;

            try {
                // Find exam details for the request
                const exam = course.exams.find(e => e.id === examId);
                const { error } = await supabase.from('deletion_requests').insert({
                    type: 'exam',
                    resource_id: examId,
                    details: { name: exam ? exam.title : 'Unknown Exam' },
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

        if (!window.confirm('Are you sure?')) return;
        try {
            const { error } = await supabase.from('exams').delete().eq('id', examId);
            if (error) throw error;
            alert('Exam deleted successfully');
            refreshCourse();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (fileId) => {
        if (!isAdmin) {
            if (!window.confirm("Send deletion request for this file?")) return;

            try {
                // Find file details
                const file = course.files.find(f => f.id === fileId);
                const { error } = await supabase.from('deletion_requests').insert({
                    type: 'file',
                    resource_id: fileId,
                    details: { name: file ? file.name : 'Unknown File' },
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

        if (!window.confirm("Are you sure you want to delete this file? This cannot be undone.")) {
            return;
        }

        try {
            const { error } = await supabase.from('course_files').delete().eq('id', fileId);
            if (error) throw error;

            alert("File deleted successfully");
            refreshCourse();
        } catch (error) {
            console.error(error);
            alert("Error deleting file");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (uploadFiles.length === 0) return;

        setUploading(true);
        try {
            const uploadedFiles = [];
            for (let i = 0; i < uploadFiles.length; i++) {
                const file = uploadFiles[i];
                const fileName = `${courseId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

                const { error: uploadError } = await supabase.storage
                    .from('materials')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(fileName);

                const ext = file.name.split('.').pop().toLowerCase();
                const type = ['jpg', 'jpeg', 'png'].includes(ext) ? 'image' : 'pdf';

                uploadedFiles.push({
                    course_id: courseId,
                    name: file.name,
                    type: type,
                    path: publicUrl,
                    uploaded_by: user.username,
                    size: (file.size / 1024).toFixed(1) + ' KB'
                });
            }

            const { error: dbError } = await supabase.from('course_files').insert(uploadedFiles);
            if (dbError) throw dbError;

            setUploadFiles([]);
            alert("Files uploaded successfully!");
            refreshCourse();

        } catch (error) {
            console.error(error);
            alert(`Error uploading files: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };


    if (loading) {
        return <div className="p-12 text-center text-gray-500">Loading course...</div>;
    }

    if (!course) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">The course you are looking for does not exist or has been removed.</p>
                <Link to="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    &larr; Return to Home
                </Link>
            </div>
        );
    }



    // Countdown Helper
    const getTimeRemaining = (date, time) => {
        const examDate = safeDate(`${date}T${time}`);
        if (!examDate) return null;

        const now = new Date();
        const diff = examDate - now;

        if (diff <= 0) return null;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return { days, hours, minutes };
    };

    // Sort exams by date
    const upcomingExams = course.exams ? [...course.exams].sort((a, b) => {
        const dateA = safeDate(a.date) || new Date(0);
        const dateB = safeDate(b.date) || new Date(0);
        return dateA - dateB;
    }) : [];

    // Find next upcoming exam cleanly
    const nextExam = upcomingExams.find(ex => {
        const d = safeDate(`${ex.date}T${ex.time}`);
        return d && d > new Date();
    });
    const countdown = nextExam ? getTimeRemaining(nextExam.date, nextExam.time) : null;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <Link to="/courses" className="inline-flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-8 transition-colors group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Courses
            </Link>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 mb-8 relative overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{course.name}</h1>
                    {course.instructor && <p className="text-xl text-gray-500 dark:text-gray-400">{course.instructor}</p>}
                </div>
            </div>

            {/* Syllabus Info Section */}
            {syllabus && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-8 transition-colors">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Syllabus & Info
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {syllabus.description}
                            </p>
                        </div>
                        <div className="space-y-4 bg-gray-50 dark:bg-slate-700/30 p-4 rounded-xl">
                            <div>
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Course Type</span>
                                <p className="font-medium text-gray-900 dark:text-white capitalize">{syllabus.type}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Credits</span>
                                    <p className="font-medium text-gray-900 dark:text-white">{syllabus.credit}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Hours/Week</span>
                                    <p className="font-medium text-gray-900 dark:text-white">{syllabus.hours}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Exam Schedule Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Exam Schedule
                    </h2>
                    {hasPermission('exams_edit') && (
                        <button
                            onClick={() => {
                                if (isAddingExam) resetExamForm();
                                else setIsAddingExam(true);
                            }}
                            className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                            {isAddingExam ? 'Cancel' : 'Add Exam'}
                        </button>
                    )}
                </div>

                {/* Countdown Banner */}
                {nextExam && countdown && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                            <div className="mb-4 md:mb-0">
                                <span className="inline-block bg-white/20 px-2 py-0.5 rounded text-xs font-semibold mb-2 uppercase tracking-wider">Upcoming Exam</span>
                                <h3 className="text-2xl font-bold">{nextExam.title}</h3>
                                <div className="flex items-center mt-1 text-blue-100">
                                    <Calendar className="w-4 h-4 mr-1.5" />
                                    <span className="mr-4">{safeDate(nextExam.date)?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) || 'Date TBD'}</span>
                                    <Clock className="w-4 h-4 mr-1.5" />
                                    <span>{nextExam.time}</span>
                                </div>
                            </div>
                            <div className="flex space-x-4 text-center">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 w-20">
                                    <div className="text-2xl font-bold">{countdown.days}</div>
                                    <div className="text-xs uppercase opacity-75">Days</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 w-20">
                                    <div className="text-2xl font-bold">{countdown.hours}</div>
                                    <div className="text-xs uppercase opacity-75">Hours</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 w-20">
                                    <div className="text-2xl font-bold">{countdown.minutes}</div>
                                    <div className="text-xs uppercase opacity-75">Minutes</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Exam List */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingExams.map(exam => (
                        <div key={exam.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm relative group hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">{exam.title}</h4>
                            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-3">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                    {safeDate(exam.date)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || 'Date TBD'}
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                    {exam.time}
                                </div>
                            </div>
                            {exam.syllabus && (
                                <div className="text-xs bg-gray-50 dark:bg-slate-700/50 p-2 rounded text-gray-600 dark:text-gray-300">
                                    <strong>Syllabus:</strong> {exam.syllabus}
                                </div>
                            )}

                            {hasPermission('exams_edit') && (
                                <div className="absolute top-4 right-4 flex space-x-1">
                                    <button
                                        onClick={() => handleEditClick(exam)}
                                        className="text-gray-300 hover:text-blue-500 transition-colors p-1"
                                        title="Edit Exam"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteExam(exam.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                        title="Delete Exam"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add Exam Form Card */}
                    {hasPermission('exams_edit') && isAddingExam && (
                        <div className="bg-blue-50 dark:bg-slate-900/50 rounded-xl p-5 border-2 border-dashed border-blue-200 dark:border-blue-800/50">
                            <form onSubmit={handleSaveExam} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Exam Title (e.g., CT-1)"
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                    value={newExam.title || ''}
                                    onChange={e => setNewExam({ ...newExam, title: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                        value={newExam.date || ''}
                                        onChange={e => setNewExam({ ...newExam, date: e.target.value })}
                                    />
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                        value={newExam.time || ''}
                                        onChange={e => setNewExam({ ...newExam, time: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Syllabus (optional)"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                    value={newExam.syllabus || ''}
                                    onChange={e => setNewExam({ ...newExam, syllabus: e.target.value })}
                                />
                                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                    {isEditing ? 'Update Exam' : 'Save Exam'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {(hasPermission('courses_edit') || hasPermission('course_materials_edit')) && (
                <div className="bg-blue-50 dark:bg-slate-800/50 rounded-xl p-6 border border-blue-100 dark:border-slate-700 mb-8 transition-colors">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-4 flex items-center">
                        <Plus className="w-5 h-5 mr-2" />
                        Quick Upload (Admin)
                    </h3>
                    <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1 w-full">
                            <div className="relative bg-white dark:bg-slate-800 border-2 border-dashed border-blue-200 dark:border-slate-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer group p-3 flex items-center justify-center">
                                <input
                                    type="file"
                                    multiple
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => setUploadFiles(e.target.files)}
                                    accept="application/pdf,image/*"
                                />
                                {uploadFiles.length > 0 ? (
                                    <div className="flex items-center text-green-600 dark:text-green-400">
                                        <Check className="w-5 h-5 mr-2" />
                                        <span className="font-medium">{uploadFiles.length} file(s) selected</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300">
                                        <Upload className="w-5 h-5 mr-2" />
                                        <span className="font-medium">Choose files</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={uploadFiles.length === 0 || uploading}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center w-full sm:w-auto"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-500" />
                    Course Materials
                </h2>

                {!course.files || course.files.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                        <p className="text-gray-500 dark:text-gray-400">No materials uploaded yet.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
                        <ul className="divide-y divide-gray-50 dark:divide-slate-700">
                            {course.files.map((file) => (
                                <li key={file.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center space-x-4 min-w-0">
                                        <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 dark:text-red-400 flex-shrink-0 shadow-sm">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate pr-4 text-base">{file.name}</p>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400 dark:text-gray-500 mt-1">
                                                <span className="uppercase text-xs font-bold bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">{file.type || 'PDF'}</span>
                                                {file.size && <span>• {file.size}</span>}
                                                {file.uploaded_by && (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                        by <span className="font-medium text-gray-600 dark:text-gray-300">{file.uploaded_by}</span>
                                                        {file.created_at && ` on ${safeDate(file.created_at)?.toLocaleDateString() || ''}`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <a
                                            href={file.path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 hover:border-gray-300 transition-all shadow-sm text-sm font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span className="hidden sm:inline">Open</span>
                                        </a>
                                        <a
                                            href={file.path}
                                            download
                                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-5 h-5" />
                                        </a>
                                        {(hasPermission('courses_edit') || hasPermission('course_materials_edit')) && (
                                            <button
                                                onClick={() => handleDelete(file.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="Delete File"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>


        </div>
    );
}
