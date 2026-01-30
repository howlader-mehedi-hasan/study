import React, { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';

const NewsTicker = ({ notices = [], customMessage = "", bgColor = "", textColor = "", isRounded = false }) => {
    const scrollRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const animationRef = useRef(null);

    // Determine source of content
    let newsItems = [];

    if (customMessage && customMessage.trim() !== "") {
        newsItems = customMessage.split("///").map((text, index) => ({
            id: `custom-${index}`,
            text: text.trim(),
            date: "Breaking",
            link: null
        })).filter(item => item.text !== "");
    } else if (notices && notices.length > 0) {
        newsItems = notices.map(notice => ({
            id: notice.id,
            text: notice.description || notice.title,
            date: notice.date,
            link: `/notices?id=${notice.id}`
        }));
    }

    // Duplicate items for seamless scrolling
    const displayItems = [...newsItems, ...newsItems];

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || newsItems.length === 0) return;

        let scrollSpeed = 0.5; // Adjust speed as needed (pixels per frame)

        const scroll = () => {
            if (!isPaused && scrollContainer) {
                if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
                    scrollContainer.scrollLeft = 0;
                } else {
                    scrollContainer.scrollLeft += scrollSpeed;
                }
            }
            animationRef.current = requestAnimationFrame(scroll);
        };

        animationRef.current = requestAnimationFrame(scroll);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [newsItems, isPaused]);

    if (newsItems.length === 0) return null;

    // Default styles if not provided
    const containerStyle = {
        backgroundColor: bgColor || '#DC2626', // red-600
        color: textColor || '#FFFFFF',
        borderRadius: isRounded ? '0.75rem' : '0' // rounded-xl vs none
    };

    const labelStyle = {
        backgroundColor: bgColor ? 'rgba(0,0,0,0.2)' : 'rgb(153 27 27)', // slightly darker than bg or red-800
        color: textColor || '#FFFFFF'
    };

    // Helper to determine border color (slightly darker than bg)
    // For simplicity, we'll rely on the shadow/border trick or just use the inline style

    return (
        <div
            className="overflow-hidden shadow-sm relative flex items-center h-10 md:h-12 mb-6 md:mb-8"
            style={containerStyle}
        >
            {/* Label */}
            <div
                className="z-20 px-3 md:px-4 h-full flex items-center font-bold uppercase tracking-wider text-[10px] md:text-sm shadow-md whitespace-nowrap"
                style={labelStyle}
            >
                <Bell className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 animate-pulse" />
                <span className="hidden md:inline">Breaking News</span>
                <span className="md:hidden">News</span>
            </div>

            {/* Ticker Content */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-x-auto relative h-full flex items-center whitespace-nowrap no-scrollbar"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar for Firefox/IE
            >
                <div className="flex items-center py-2 pr-4">
                    {displayItems.map((item, index) => (
                        <span key={`${item.id}-${index}`} className="inline-flex items-center mr-8 md:mr-12 text-xs md:text-base font-medium flex-shrink-0">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-2 md:mr-3" style={{ backgroundColor: textColor || '#FBBF24' }}></span>
                            {item.text}
                            {item.date !== "Breaking" && (
                                <span className="opacity-70 text-[10px] md:text-xs ml-1.5 md:ml-2 font-light">({item.date})</span>
                            )}
                            <span className="ml-8 md:ml-12 opacity-50">///</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Inline CSS to hide scrollbar for Webkit */}
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default NewsTicker;
