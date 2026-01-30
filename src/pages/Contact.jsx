import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert(`Thank you, ${formData.name}! We have received your message.`);
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                alert("Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("An error occurred. Please try again later.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Get in Touch</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Contact Info & Map */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Contact Information</h2>
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4 shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Our Location</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                                        University Campus<br />
                                        Academic Building 1, Room 901<br />
                                        North Western University, Khulna
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mr-4 shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Email Us</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">hmh.nwu@gmail.com</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mr-4 shrink-0">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Call Us</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1 mb-3">+880 1648 291385</p>
                                    <a
                                        href="tel:+8801648291385"
                                        className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Simple Map Placeholder */}
                    <div className="bg-gray-100 dark:bg-slate-800 h-64 rounded-2xl overflow-hidden relative">
                        <iframe
                            src="https://maps.google.com/maps?q=RH83%2BRC%20Khulna&t=&z=15&ie=UTF8&iwloc=&output=embed"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            title="Map"
                        ></iframe>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                        Send a Message
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors dark:text-white"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors dark:text-white"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors dark:text-white"
                                placeholder="Regarding..."
                                value={formData.subject}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                            <textarea
                                name="message"
                                required
                                rows="5"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors dark:text-white resize-none"
                                placeholder="How can we help you?"
                                value={formData.message}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-blue-600/20"
                        >
                            <Send className="w-5 h-5 mr-2" />
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
