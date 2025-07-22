"use client";

interface RiskAssessmentStatusMessagesProps {
    hasUnsavedChanges: boolean;
    saving: boolean;
    loading: boolean;
}

export default function RiskAssessmentStatusMessages({
    hasUnsavedChanges,
    saving,
    loading
}: RiskAssessmentStatusMessagesProps) {
    return (
        <>
            {/* Status poruke */}
            {hasUnsavedChanges && !saving && (
                <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-center border border-yellow-300">
                    ⚠️ Имате несачуване промене. Кликните &quot;Сачувај промене&quot; да их сачувате.
                </div>
            )}

            {loading && (
                <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg text-center">
                    Чување селекције...
                </div>
            )}
        </>
    );
}