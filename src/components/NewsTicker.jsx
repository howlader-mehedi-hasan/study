import React from 'react';
import { Bell, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewsTicker = ({ notices = [], customMessage = "" }) => {
    // Determine source of content
    let newsItems = [];

    if (customMessage && customMessage.trim() !== "") {
        // Use custom message
        newsItems = customMessage.split("///").map((text, index) => ({
            id: `custom-${index}`,
            text: text.trim(),
            date: "Breaking", // Or maybe omit date for custom?
            link: null
        })).filter(item => item.text !== "");
    } else if (notices && notices.length > 0) {
        // Use recent notices
        newsItems = notices.map(notice => ({
            id: notice.id,
            text: notice.description || notice.title,
            date: notice.date,
            link: `/notices?id=${notice.id}`
        }));
    }

    if (newsItems.length === 0) return null;

    return (
        <div className="bg-red-600 dark:bg-red-700 text-white overflow-hidden shadow-sm border-y border-red-700 dark:border-red-800 relative flex items-center h-12 mb-8">
            {/* Label */}
            <div className="bg-red-800 dark:bg-red-900 z-20 px-4 h-full flex items-center font-bold uppercase tracking-wider text-xs md:text-sm shadow-md whitespace-nowrap">
                <Bell className="w-4 h-4 mr-2 animate-pulse" />
                Breaking News
            </div>

            {/* Ticker Content */}
            <div className="flex-1 overflow-hidden relative h-full flex items-center">
                <div className="animate-marquee inline-block py-2 pr-4 absolute top-1/2 -translate-y-1/2 w-max">
                    {newsItems.map((item, index) => (
                        <span key={item.id} className="inline-flex items-center mr-12 text-sm md:text-base font-medium">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 mr-3"></span>
                            {item.text}
                            {item.date !== "Breaking" && (
                                <span className="opacity-70 text-xs ml-2 font-light">({item.date})</span>
                            )}
                            {index !== newsItems.length - 1 && (
                                <span className="ml-12 text-red-300">///</span>
                            )}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewsTicker;
