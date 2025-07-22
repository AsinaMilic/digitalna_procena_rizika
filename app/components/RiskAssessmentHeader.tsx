"use client";

interface RiskAssessmentHeaderProps {
    groupName: string;
    groupDescription: string;
    hasUnsavedChanges: boolean;
    saving: boolean;
    onSaveChanges: () => void;
}

export default function RiskAssessmentHeader({
    groupName,
    groupDescription,
    hasUnsavedChanges,
    saving,
    onSaveChanges
}: RiskAssessmentHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-6">
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-blue-800 text-center">
                    Табела за процену ризика - {groupName}
                </h2>
                <p className="text-blue-600 text-center mt-2">
                    {groupDescription}
                </p>
            </div>

            {/* Dugme za čuvanje */}
            {hasUnsavedChanges && (
                <div className="ml-4">
                    <button
                        onClick={onSaveChanges}
                        disabled={saving}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${saving
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {saving ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Чувам...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                💾 Сачувај промене
                            </div>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}