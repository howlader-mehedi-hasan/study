import React from "react";
import { Link } from "react-router-dom";
import { Github, Mail, MessageSquare, AlertCircle, Globe, Linkedin, Twitter, Heart, Facebook } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative mt-auto bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-950 border-t border-gray-100 dark:border-slate-800 transition-colors duration-300">
            {/* Decorative Top Border Gradient */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                ClassMaterials
                            </h2>
                            <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
                                Your central hub for academic resources, notes, and course updates. Helping students succeed, one click at a time.
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <SocialLink href="https://www.facebook.com/nwu.ac.bd" icon={Facebook} label="Facebook" />
                            <SocialLink href="https://www.linkedin.com/school/nwukhulna/" icon={Linkedin} label="LinkedIn" />
                            <SocialLink href="https://nwu.ac.bd/" icon={Globe} label="Website" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-6">Explore</h3>
                        <ul className="space-y-4">
                            <FooterLink to="/" label="Home" />
                            <FooterLink to="/courses" label="Courses" />
                            <FooterLink to="/about" label="About Us" icon={AlertCircle} />
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-6">Support</h3>
                        <ul className="space-y-4">
                            <FooterLink to="/contact" label="Contact" icon={Mail} />
                            <FooterLink to="/complaints" label="Complaints" icon={AlertCircle} />
                            <FooterLink to="/opinions" label="Feedback" icon={MessageSquare} />
                        </ul>
                    </div>

                    {/* Developer Info */}
                    <div className="lg:text-right">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-6">Developer</h3>
                        <div className="flex flex-col lg:items-end space-y-4">
                            <a
                                href="https://howlader-mehedi-hasan.github.io/portfoleo/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center space-x-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-4 py-3 rounded-xl hover:shadow-lg hover:border-blue-500/30 transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                                    H
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-gray-400 font-medium">Built by</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        Howlader Mehedi Hasan
                                    </p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-gray-100 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-500">
                    <p>© {currentYear} HMH-CourseMaterials. All rights reserved.</p>
                    <div className="flex items-center mt-4 md:mt-0 space-x-1">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-red-500 animate-pulse fill-current" />
                        <span>for students.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// Helper Components for Cleaner Code
function SocialLink({ href, icon: Icon, label }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400 transition-all duration-300"
        >
            <Icon className="w-5 h-5" />
        </a>
    );
}

function FooterLink({ to, label, icon: Icon }) {
    return (
        <li>
            <Link
                to={to}
                className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
                {Icon && <Icon className="w-4 h-4 mr-2 opacity-75 group-hover:opacity-100" />}
                <span className="group-hover:translate-x-1 transition-transform duration-200">{label}</span>
            </Link>
        </li>
    );
}
