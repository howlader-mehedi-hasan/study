import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { X, ExternalLink, Download, ArrowLeft } from "lucide-react";

export default function DocumentViewer() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const fileUrl = searchParams.get("url");
    const fileType = searchParams.get("type");
    const fileName = searchParams.get("name") || "Document";

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Quick artificial delay for smooth iframe transition if needed
        const timer = setTimeout(() => setLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    if (!fileUrl) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 text-center p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Document Available</h2>
                <p className="text-gray-500 max-w-sm mb-6">The document URL was not provided or is invalid.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </button>
            </div>
        );
    }

    const isOfficeDoc = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'].includes(fileType?.toLowerCase());
    const isImage = fileType === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileType?.toLowerCase());
    const isPdf = fileType === 'pdf';

    const renderContent = () => {
        if (isImage) {
            return (
                <div className="flex items-center justify-center w-full h-full p-4 bg-gray-800/20">
                    <img
                        src={fileUrl}
                        alt={fileName || 'Document'}
                        className="max-w-full max-h-full object-contain rounded drop-shadow-lg"
                    />
                </div>
            );
        }

        if (isPdf) {
            return (
                <iframe
                    src={`${fileUrl}#toolbar=0`}
                    title={fileName || 'PDF Viewer'}
                    className="w-full h-full border-none bg-white dark:bg-slate-800"
                />
            );
        }

        if (isOfficeDoc) {
            const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
            return (
                <iframe
                    src={officeViewerUrl}
                    title={fileName || 'Office Document Viewer'}
                    className="w-full h-full border-none bg-white dark:bg-slate-800"
                    frameBorder="0"
                />
            );
        }

        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <Download className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Preview not available</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                        This file type '{fileType}' cannot be viewed directly in the browser. You must download it to view its contents.
                    </p>
                    <a
                        href={fileUrl}
                        download
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download File
                    </a>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen w-full bg-gray-900 overflow-hidden">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900 shadow-lg border-b border-gray-800 z-10 w-full shrink-0">
                <div className="flex items-center">
                    <button
                        onClick={() => window.close()}
                        className="mr-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors hidden sm:flex items-center group"
                        title="Close Tab"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <h3 className="text-white font-medium truncate max-w-[200px] sm:max-w-md md:max-w-lg lg:max-w-2xl">
                        {fileName}
                    </h3>
                </div>

                <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
                    <a
                        href={fileUrl}
                        download
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center group"
                        title="Download"
                    >
                        <Download className="w-5 h-5 sm:group-hover:scale-110 transition-transform" />
                    </a>
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center group"
                        title="Open Source URL"
                    >
                        <ExternalLink className="w-5 h-5 sm:group-hover:scale-110 transition-transform" />
                    </a>
                    <div className="hidden sm:block w-px h-6 bg-gray-700 mx-1"></div>
                    <button
                        onClick={() => window.close()}
                        className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors flex items-center group"
                        title="Close Viewer"
                    >
                        <X className="w-6 h-6 sm:group-hover:rotate-90 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 w-full bg-black/50 relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-50">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                <div className="w-full h-full text-white">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
