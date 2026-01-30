import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Send, ThumbsUp } from "lucide-react";

export default function Opinions() {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [feed, setFeed] = useState([]);
    const [status, setStatus] = useState(null);

    // Fetch existing opinions
    useEffect(() => {
        fetchOpinions();
    }, []);

    const fetchOpinions = async () => {
        try {
            const res = await fetch('/api/opinions');
            if (res.ok) {
                const data = await res.json();
                setFeed(data);
            }
        } catch (error) {
            console.error("Failed to fetch opinions", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a rating star.");
            return;
        }

        try {
            const response = await fetch('/api/opinions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, feedback })
            });

            if (response.ok) {
                setStatus('success');
                setRating(0);
                setFeedback("");
                fetchOpinions(); // Refresh feed
                setTimeout(() => setStatus(null), 3000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">

            {/* Header */}
            <div className="text-center mb-16">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Student Opinions</h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Your feedback helps us improve. Share your thoughts on the courses, materials, or general campus life.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Feedback Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Leave Feedback</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rate your experience</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star
                                                className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300 dark:text-slate-600"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Thoughts</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors dark:text-white resize-none"
                                    rows="5"
                                    placeholder="Share your honest feedback..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-blue-600/20"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Submit Feedback
                            </button>

                            {status === 'success' && (
                                <p className="text-green-600 dark:text-green-400 text-sm text-center animate-pulse">Thanks for your feedback!</p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Feedback Feed */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                        Recent Raves & Rants
                    </h2>

                    {feed.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                            <p className="text-gray-500 dark:text-gray-400">No opinions yet. Be the first to share one!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {feed.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < item.rating
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-200 dark:text-slate-700"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-400">{item.date}</span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        "{item.feedback}"
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-700 flex justify-end">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            Anonymous
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
