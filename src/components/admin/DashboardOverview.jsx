import React from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, AlertCircle, MessageSquare, ArrowUpRight, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardOverview = ({ user, stats }) => {
    const { totalUsers, totalMessages, totalComplaints, totalOpinions } = stats;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, link, delay }) => (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden group`}
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <Icon className={`w-24 h-24 text-${color}-500`} />
            </div>

            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
                <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold text-gray-800 dark:text-white">{value}</span>
                    <Link to={link || "#"} className={`flex items-center text-xs font-bold text-${color}-600 dark:text-${color}-400 hover:underline`}>
                        View Details <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Welcome Section */}
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
                    <p className="text-blue-100 max-w-xl">
                        Here's what's happening in your dashboard today. You have {totalMessages + totalComplaints} new notifications pending review.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4">
                        <Link to="/courses" className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors text-sm font-semibold border border-white/20">
                            Manage Courses
                        </Link>
                        <Link to="/schedule" className="px-5 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors text-sm font-bold shadow-lg">
                            View Schedule
                        </Link>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-indigo-500/30 rounded-full blur-3xl"></div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={totalUsers}
                    icon={Users}
                    color="blue"
                    link="?tab=users"
                />
                <StatCard
                    title="New Messages"
                    value={totalMessages}
                    icon={Mail}
                    color="purple"
                    link="?tab=messages"
                />
                <StatCard
                    title="Complaints"
                    value={totalComplaints}
                    icon={AlertCircle}
                    color="red"
                    link="?tab=complaints"
                />
                <StatCard
                    title="Feedback Received"
                    value={totalOpinions}
                    icon={MessageSquare}
                    color="amber"
                    link="?tab=opinions"
                />
            </div>

            {/* Recent Activity Mockup (Could be connected to real logs later) */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-gray-400" />
                        Recent System Activity
                    </h2>
                    <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">View All Logs</button>
                </div>

                <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0">
                                <Shield className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">System Backup completed successfully</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 hours ago • System</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DashboardOverview;
