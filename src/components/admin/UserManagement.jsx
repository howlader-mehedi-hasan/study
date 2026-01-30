import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Pencil, Trash, X, Save, Shield, Key, Check } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);

    // Create User State
    const [newUserUsername, setNewUserUsername] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newName, setNewName] = useState("");
    const [newRole, setNewRole] = useState("editor");
    const [newPermissions, setNewPermissions] = useState({
        courses_edit: false,
        syllabus_edit: false,
        schedule_edit: false,
        welcome_message_edit: false,
        notices_edit: false,
        class_cancellation_edit: false,
        deletion_requests_edit: false,
        messages_view: false,
        complaints_view: false,
        opinions_view: false,
        exams_edit: false,
        exams_edit: false,
        course_materials_edit: false,
        breaking_news_edit: false
    });

    // Edit/Feedback State
    const [userMessage, setUserMessage] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editUserForm, setEditUserForm] = useState({ name: "", username: "", password: "" });
    const [permissionsModalUser, setPermissionsModalUser] = useState(null);
    const [permissionsToEdit, setPermissionsToEdit] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/users");
            if (response.ok) {
                setUsers(await response.json());
            }
        } catch (error) {
            console.error("Failed to fetch users");
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: newUserUsername,
                    password: newUserPassword,
                    name: newName,
                    role: newRole,
                    permissions: newRole === 'admin' ? null : newPermissions
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setUserMessage({ type: "success", text: "User created successfully!" });
                setNewUserUsername("");
                setNewUserPassword("");
                setNewName("");
                fetchUsers();
                setTimeout(() => setUserMessage(null), 3000);
            } else {
                setUserMessage({ type: "error", text: data.error });
            }
        } catch (error) {
            setUserMessage({ type: "error", text: "Failed to create user" });
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        try {
            const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
            if (response.ok) fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditUserForm({ name: user.name, username: user.username, password: user.password });
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/users/${editingUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editUserForm)
            });

            if (res.ok) {
                setEditingUser(null);
                fetchUsers();
                setUserMessage({ type: "success", text: "User updated successfully" });
                setTimeout(() => setUserMessage(null), 3000);
            }
        } catch (error) {
            console.error("Error updating user", error);
        }
    };

    const handlePermissionsClick = (user) => {
        setPermissionsModalUser(user);
        setPermissionsToEdit(user.permissions || {
            courses_edit: false,
            syllabus_edit: false,
            schedule_edit: false,
            welcome_message_edit: false,
            notices_edit: false,
            class_cancellation_edit: false,
            deletion_requests_edit: false,
            messages_view: false,
            complaints_view: false,
            opinions_view: false,
            exams_edit: false,
            exams_edit: false,
            course_materials_edit: false,
            breaking_news_edit: false
        });
    };

    const handlePermissionsSave = async () => {
        if (!permissionsModalUser) return;
        try {
            const res = await fetch(`/api/users/${permissionsModalUser.id}/permissions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions: permissionsToEdit })
            });
            if (res.ok) {
                alert("Permissions updated successfully!");
                setPermissionsModalUser(null);
                fetchUsers();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Existing Users</h2>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                        {users.length} Users
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    {/* Mobile Card View (Visible < md) */}
                    <div className="md:hidden space-y-4 p-4">
                        {users.map(u => (
                            <div key={u.id} className="bg-white dark:bg-slate-700/50 p-4 rounded-xl border border-gray-100 dark:border-slate-600 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                        {u.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{u.name}</h4>
                                        <p className="text-xs text-gray-500">{u.username} • {u.role}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEditUser(u)} className="p-2 bg-gray-100 dark:bg-slate-600 rounded-lg text-blue-600">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View (Hidden < md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-slate-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="py-4 px-6">User</th>
                                    <th className="py-4 px-6">Role</th>
                                    <th className="py-4 px-6">Permissions</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                <AnimatePresence>
                                    {users.map(u => (
                                        <motion.tr
                                            key={u.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 font-bold">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                                                        <div className="text-xs text-gray-500">{u.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${u.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {u.role === 'editor' && (
                                                    <button onClick={() => handlePermissionsClick(u)} className="text-xs text-blue-600 hover:underline flex items-center">
                                                        <Shield className="w-3 h-3 mr-1" /> Manage
                                                    </button>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <button onClick={() => handleEditUser(u)} className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-lg text-gray-500 hover:text-blue-600 transition-colors shadow-sm border border-transparent hover:border-gray-200">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-lg text-gray-500 hover:text-red-600 transition-colors shadow-sm border border-transparent hover:border-gray-200">
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create / Edit Form Sidebar */}
            <motion.div variants={itemVariants} className="space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 sticky top-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                        <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                        Add New User
                    </h2>

                    {userMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-xl mb-4 text-sm ${userMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                        >
                            {userMessage.text}
                        </motion.div>
                    )}

                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full px-4 py-2 mt-1 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Username</label>
                            <input
                                type="text"
                                value={newUserUsername}
                                onChange={(e) => setNewUserUsername(e.target.value)}
                                className="w-full px-4 py-2 mt-1 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Password</label>
                            <input
                                type="text"
                                value={newUserPassword}
                                onChange={(e) => setNewUserPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-1 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Role</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="w-full px-4 py-2 mt-1 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {newRole === 'editor' && (
                            <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-xl space-y-2">
                                <label className="text-xs font-bold text-gray-500 block mb-2">INITIAL PERMISSIONS</label>
                                {Object.keys(newPermissions).map(perm => (
                                    <label key={perm} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={newPermissions[perm]}
                                            onChange={(e) => setNewPermissions({ ...newPermissions, [perm]: e.target.checked })}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>{perm.replace('_', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-500/20">
                            Create User
                        </button>
                    </form>
                </div>
            </motion.div>

            {/* Edit User Modal */}
            <AnimatePresence>
                {editingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold dark:text-white">Edit User</h3>
                                <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSaveUser} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Name</label>
                                    <input
                                        type="text"
                                        value={editUserForm.name}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">New Password (optional)</label>
                                    <input
                                        type="text"
                                        value={editUserForm.password}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white"
                                        placeholder="Leave blank to keep current"
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button onClick={() => setEditingUser(null)} type="button" className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg">Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Permissions Modal */}
            <AnimatePresence>
                {permissionsModalUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm p-8 shadow-2xl"
                        >
                            <h3 className="text-xl font-bold dark:text-white mb-2">Permissions</h3>
                            <p className="text-sm text-gray-500 mb-6">Manage access for {permissionsModalUser.name}</p>
                            <div className="space-y-3 mb-8">
                                {Object.keys(permissionsToEdit).map(perm => (
                                    <label key={perm} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 transition-colors cursor-pointer">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{perm.replace('_', ' ')}</span>
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${permissionsToEdit[perm] ? "bg-green-500" : "bg-gray-300"}`}>
                                            <input
                                                type="checkbox"
                                                checked={permissionsToEdit[perm]}
                                                onChange={(e) => setPermissionsToEdit({ ...permissionsToEdit, [perm]: e.target.checked })}
                                                className="hidden"
                                            />
                                            <motion.div
                                                layout
                                                className="w-4 h-4 bg-white rounded-full shadow-sm"
                                                animate={{ x: permissionsToEdit[perm] ? 24 : 0 }}
                                            />
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setPermissionsModalUser(null)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                                <button onClick={handlePermissionsSave} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg">Save</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default UserManagement;
