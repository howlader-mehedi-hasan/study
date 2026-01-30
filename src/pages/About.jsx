import React from "react";
import { BookOpen, Users, Globe, Shield, Code } from "lucide-react";

export default function About() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12">

            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                    Empowering <span className="text-blue-600 dark:text-blue-400">Education</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    HMH-CourseMaterials is a centralized platform designed to bridge the gap between students and academic resources.
                    We believe in making learning materials accessible, organized, and available to everyone, anytime.
                </p>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-8 md:p-12">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                        <Globe className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                        To simplify academic life by providing a single, reliable hub for course outlines, lecture notes, exam schedules, and important notices.
                        We aim to reduce the hassle of scavenging for materials so students can focus on what matters most—learning.
                    </p>
                </div>
                <div className="space-y-8">
                    <div className="flex items-start">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 shrink-0 mr-6">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Centralized Resources</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                No more lost files or scattered links. Everything from syllabus to slides is stored in one secure place.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 mr-6">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Community Driven</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Built with the student community in mind, incorporating feedback and needs directly into the platform's evolution.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 mr-6">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Reliable & Secure</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Ensuring that the information you get is official, up-to-date, and safe to access.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Developer Section */}
            <div className="bg-gray-900 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <Code className="w-10 h-10 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Built by Students, for Students</h2>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
                        This platform is a testament to the power of student innovation. Designed and developed with passion and precision.
                    </p>
                    <a
                        href="https://howlader-mehedi-hasan.github.io/portfoleo/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        Meet the Developer
                    </a>
                </div>

                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
            </div>

        </div>
    );
}
