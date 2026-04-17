import React from "react";
import { X, ExternalLink, Download } from "lucide-react";

export default function DocumentViewer({ isOpen, onClose, fileUrl, fileType, fileName, downloadsEnabled = true }) {
    if (!isOpen || !fileUrl) return null;

    // Detect if this is a supported MS Office extension to use the Office web viewer
    const isOfficeDoc = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'].includes(fileType?.toLowerCase());
    const isImage = fileType === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileType?.toLowerCase());
    const isPdf = fileType === 'pdf';
    const isAudio = fileType === 'audio' || ['mp3', 'wav', 'ogg', 'opus', 'aac', 'flac', 'm4a'].includes(fileType?.toLowerCase());

    const renderContent = () => {
        if (isImage) {
            return (
                <div className="flex items-center justify-center w-full h-full p-4">
                    <img
                        src={fileUrl}
                        alt={fileName || 'Document'}
                        className="max-w-full max-h-full object-contain rounded drop-shadow-lg"
                    />
                </div>
            );
        }

        if (isAudio) {
            return (
                <div className="flex flex-col items-center justify-center w-full h-full p-8 space-y-6">
                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-4xl text-blue-500">🎵</span>
                    </div>
                    <h3 className="text-xl font-medium text-white truncate max-w-md text-center">{fileName}</h3>
                    <div className="w-full max-w-md bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl">
                        <audio
                            controls
                            controlsList={!downloadsEnabled ? "nodownload" : undefined}
                            src={fileUrl}
                            className="w-full outline-none"
                            autoPlay
                        >
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                </div>
            );
        }

        if (isPdf) {
            return (
                <iframe
                    src={`${fileUrl}#toolbar=0`}
                    title={fileName || 'PDF Viewer'}
                    className="w-full h-full border-none rounded bg-white dark:bg-slate-800"
                />
            );
        }

        if (isOfficeDoc) {
            // Encode the URL as required by the Office Live Viewer
            const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
            return (
                <iframe
                    src={officeViewerUrl}
                    title={fileName || 'Office Document Viewer'}
                    className="w-full h-full border-none rounded bg-white dark:bg-slate-800"
                    frameBorder="0"
                />
            );
        }

        // Fallback for unsupported inline viewing
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <Download className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Preview not available</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                        This file type '{fileType}' cannot be viewed directly in the browser. {downloadsEnabled ? 'You must download it to view its contents.' : 'Downloads are currently disabled.'}
                    </p>
                    {downloadsEnabled && (
                        <a
                            href={fileUrl}
                            download
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download File
                        </a>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-gray-900/95 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900 shadow-xl border-b border-gray-800 z-10 w-full">
                <h3 className="text-white font-medium truncate pr-4 max-w-[70%]">
                    {fileName || 'Document Viewer'}
                </h3>
                <div className="flex items-center space-x-3 flex-shrink-0">
                    {downloadsEnabled && (
                        <a
                            href={fileUrl}
                            download
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center group"
                            title="Download"
                        >
                            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </a>
                    )}
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center group"
                        title="Open in new tab"
                    >
                        <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </a>
                    <div className="w-px h-6 bg-gray-700 mx-1"></div>
                    <button
                        onClick={onClose}
                        className="p-2 text-red-400 hover:text-white hover:bg-red-500/80 rounded-lg transition-colors flex items-center group"
                        title="Close Viewer"
                    >
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative w-full p-2 md:p-6 pb-6 pt-2">
                <div className="w-full h-full bg-black/20 rounded shadow-2xl relative">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
