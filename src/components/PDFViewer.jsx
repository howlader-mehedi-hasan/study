import React from "react";
import { X } from "lucide-react";

export default function PDFViewer({ file, onClose }) {
    if (!file) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full h-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
                    <div>
                        <h3 className="font-semibold text-gray-800 truncate max-w-md">{file.name}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 bg-gray-50 relative">
                    <iframe
                        src={file.url}
                        className="w-full h-full border-0"
                        title={file.name}
                    />
                </div>
            </div>
        </div>
    );
}
