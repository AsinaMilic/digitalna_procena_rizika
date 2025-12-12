"use client";
import React from "react";

interface CriteriaModalProps {
    onClose: () => void;
}

export default function CriteriaModal({ onClose }: CriteriaModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            Критеријуми за одређивање
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-4">
                        <img
                            src="/assets/prilog-f/criteria_1.png"
                            alt="Criteria 1"
                            className="w-full h-auto border border-gray-300 rounded"
                        />
                        <img
                            src="/assets/prilog-f/criteria_2.png"
                            alt="Criteria 2"
                            className="w-full h-auto border border-gray-300 rounded"
                        />
                    </div>

                    <div className="mt-4 text-center">
                        <button
                            onClick={onClose}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
                        >
                            Затвори
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
