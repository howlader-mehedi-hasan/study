import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Reorder } from "framer-motion";
import { Folder, Search, BookOpen, Plus, Edit, Trash2, X, Save, Upload, Check, FileText, Loader2, GripVertical, List } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import coursesData from "../data/courses.json"; // Import JSON directly

export default function Courses() {
    const { user, isAdmin, hasPermission } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [syllabusData, setSyllabusData] = useState([]);
    const [localCourses, setLocalCourses] = useState(coursesData);
    const [isReordering, setIsReordering] = useState(false);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [courseId, setCourseId] = useState("");
    const [courseName, setCourseName] = useState("");
    const [instructor, setInstructor] = useState("");
    const [files, setFiles] = useState([]);

    // Refresh courses function
    const fetchCourses = async () => {
        try {
            const res = await fetch("/api/courses");
            if (res.ok) setLocalCourses(await res.json());
        } catch (err) {
            console.error("Failed to refresh courses", err);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchSyllabus = async () => {
            try {
                const res = await fetch('/api/syllabus');
                if (res.ok) setSyllabusData(await res.json());
            } catch (err) {
                console.error("Failed to fetch syllabus", err);
            }
        };
        fetchSyllabus();
    }, []);

    const filteredCourses = localCourses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append("courseId", courseId);
            formData.append("courseName", courseName);
            formData.append("instructor", instructor);

            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    formData.append("files", file);
                });
            }

            const response = await fetch("/api/courses", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: "Course saved successfully!" });
                setTimeout(() => {
                    setIsModalOpen(false);
                    setMessage(null);
                    setCourseId("");
                    setCourseName("");
                    setInstructor("");
                    setFiles([]);
                    fetchCourses();
                }, 1000);
            } else {
                throw new Error(result.error || "Failed to update course");
            }

        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: `Error: ${err.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (e, id) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();

        if (!isAdmin) {
            if (!window.confirm("You do not have permission to delete this directly. Send a deletion request to Admin?")) return;
            try {
                const response = await fetch("/api/deletion-requests", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "course",
                        resourceId: id,
                        details: { name: localCourses.find(c => c.id === id)?.name || id },
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

        if (!window.confirm("Are you sure you want to delete this ENTIRE course? This includes all its files and cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(`/api/courses/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Course deleted successfully!");
                fetchCourses();
            } else {
                alert("Failed to delete course");
            }
        } catch (error) {
            console.error("Delete request failed:", error);
            alert(`Error deleting course: ${error.message}`);
        }
    };

    const openEditModal = (e, course) => {
        e.preventDefault();
        e.stopPropagation();
        setCourseId(course.id);
        setCourseName(course.name);
        setInstructor(course.instructor);
        setFiles([]);
        setIsModalOpen(true);
    };

    const handleSyllabusSelect = (e) => {
        const code = e.target.value;
        if (!code) return;
        const selected = syllabusData.find(s => s.code === code);
        if (selected) {
            setCourseId(selected.code);
            setCourseName(selected.title);
        }
    };

    const handleSaveOrder = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/courses/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courses: localCourses }),
            });
            if (res.ok) {
                setIsReordering(false);
                // Optional: Show success toast
            } else {
                alert("Failed to save order");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-16 space-y-4 relative">
                <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Course Materials <span className="text-blue-600 dark:text-blue-400">Hub</span>
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Access all your class notes, assignments, and resources directly.
                </p>
                {hasPermission('courses_edit') && (
                    <div className="absolute top-0 right-0 flex space-x-3">
                        {isReordering ? (
                            <button
                                onClick={handleSaveOrder}
                                disabled={loading}
                                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-lg transition-all"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                <span>Save Order</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsReordering(true)}
                                className="flex items-center space-x-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 px-4 py-2 rounded-xl shadow-sm transition-all"
                            >
                                <List className="w-5 h-5" />
                                <span>Reorder</span>
                            </button>
                        )}

                        <button
                            onClick={() => {
                                setCourseId("");
                                setCourseName("");
                                setInstructor("");
                                setFiles([]);
                                setIsModalOpen(true);
                            }}
                            disabled={isReordering}
                            className={`flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg transition-all ${isReordering ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Course</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="flex justify-center mb-12">
                <div className="relative w-full max-w-lg group">
                    <input
                        type="text"
                        placeholder="Search courses or instructors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all shadow-sm text-lg group-hover:shadow-md"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
                </div>
            </div>

            {filteredCourses.length === 0 ? (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">No courses found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search terms.</p>
                </div>
            ) : isReordering ? (
                <Reorder.Group axis="y" values={localCourses} onReorder={setLocalCourses} className="space-y-4 max-w-3xl mx-auto">
                    {localCourses.map((course) => (
                        <Reorder.Item key={course.id} value={course}>
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center space-x-4 cursor-grab active:cursor-grabbing">
                                <GripVertical className="text-gray-400" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 dark:text-white">{course.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{course.id}</p>
                                </div>
                                <div className="text-sm text-gray-400 select-none">
                                    Drag to reorder
                                </div>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <Link key={course.id} to={`/course/${course.id}`}>
                            <div className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <BookOpen className="w-24 h-24 rotate-12 dark:text-white" />
                                </div>

                                {hasPermission('courses_edit') && (
                                    <div className="absolute top-4 right-4 z-20 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => openEditModal(e, course)}
                                            className="p-2 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg shadow-sm hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors"
                                            title="Edit Course"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteCourse(e, course.id)}
                                            className="p-2 bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 rounded-lg shadow-sm hover:bg-red-50 dark:hover:bg-slate-600 transition-colors"
                                            title="Delete Course"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10">
                                    <Folder className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors relative z-10">{course.name}</h3>
                                {course.instructor && (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 relative z-10">{course.instructor}</p>
                                )}

                                {(() => {
                                    const syl = syllabusData.find(s => s.code === course.id);
                                    if (syl) {
                                        return (
                                            <div className="mb-4 relative z-10 space-y-2">
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md font-medium border border-blue-100 dark:border-blue-800">
                                                        {syl.credit} Cr
                                                    </span>
                                                    <span className="bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md font-medium border border-purple-100 dark:border-purple-800">
                                                        {syl.hours}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                    {syl.description}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                <div className="mt-auto flex justify-between items-center text-sm relative z-10 border-t border-gray-50 dark:border-slate-700 pt-4">
                                    <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full font-medium text-xs">
                                        {course.files ? course.files.length : 0} Files
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                        Browse <span className="ml-1 text-lg leading-none">&rarr;</span>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}


            {/* Create/Edit Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {courseId && localCourses.some(c => c.id === courseId) ? "Edit Course" : "Add New Course"}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                {message && (
                                    <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                                        {message.text}
                                    </div>
                                )}

                                <form onSubmit={handleCreateCourse} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                            <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Autofill from Syllabus</label>
                                            <select
                                                onChange={handleSyllabusSelect}
                                                defaultValue=""
                                                className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                                            >
                                                <option value="">-- Select a Course --</option>
                                                {syllabusData.map(s => (
                                                    <option key={s.code} value={s.code}>
                                                        [{s.code}] {s.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course ID</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={courseId}
                                                    onChange={(e) => setCourseId(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                                                    placeholder="e.g. cs101"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={courseName}
                                                    onChange={(e) => setCourseName(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                                                    placeholder="Full Course Title"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructor</label>
                                            <input
                                                type="text"
                                                required
                                                value={instructor}
                                                onChange={(e) => setInstructor(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                                                placeholder="Faculty Name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Materials (Optional)</label>
                                            <div className="border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-xl p-8 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-center cursor-pointer relative group">
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={(e) => setFiles(e.target.files)}
                                                    accept="application/pdf,image/*"
                                                />
                                                <div className="flex flex-col items-center">
                                                    {files.length > 0 ? (
                                                        <>
                                                            <Check className="w-10 h-10 text-green-500 mb-2" />
                                                            <p className="text-gray-700 dark:text-gray-300 font-medium">{files.length} file(s) selected</p>
                                                            <ul className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                                                                {Array.from(files).map((f, i) => (
                                                                    <li key={i} className="flex items-center">
                                                                        <FileText className="w-3 h-3 mr-1" />
                                                                        {f.name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                                                            <p className="text-gray-600 dark:text-gray-300 font-medium">Click to upload files</p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">or drag and drop multiple files</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg font-medium flex items-center disabled:bg-blue-300"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Course
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
