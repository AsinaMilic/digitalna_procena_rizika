"use client";
import {useState, useEffect} from "react";
import {useParams} from "next/navigation";
import RiskAssessmentTable from "../../components/RiskAssessmentTable";

interface RiskSelection {
    risk_id: string;
    danger_level: number;
    description: string;
}

export default function ProcenaPage() {
    const params = useParams();
    const [selections, setSelections] = useState<RiskSelection[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const procenaId = params.id as string;

    // Učitaj postojeće selekcije
    useEffect(() => {
        async function loadSelections() {
            try {
                const response = await fetch(`/api/procena/${procenaId}/risk-selection`);
                if (response.ok) {
                    const data = await response.json();
                    setSelections(data.map((item: any) => ({
                        risk_id: item.riskId,
                        danger_level: item.dangerLevel,
                        description: item.description
                    })));
                }
            } catch (error) {
                console.error('Greška pri učitavanju selekcija:', error);
            }
        }

        if (procenaId) {
            loadSelections();
        }
    }, [procenaId]);

    const handleSelectionChange = (newSelections: RiskSelection[]) => {
        setSelections(newSelections);
    };

    const handleGenerateRiskMatrix = async () => {
        if (selections.length === 0) {
            setMessage("Molimo vas da prvo izaberete vrednosti u tabeli.");
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/procena/${procenaId}/generate-matrix`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({selections})
            });

            const data = await response.json();
            
            if (data.success) {
                setMessage("Успешно генерисана матрица ризика!");
                // Preusmeri na finalnu stranu nakon 2 sekunde
                setTimeout(() => {
                    window.location.href = `/procena/${procenaId}/final`;
                }, 2000);
            } else {
                setMessage(data.error || "Greška pri generisanju matrice ризика");
            }
        } catch (error) {
            console.error('Greška:', error);
            setMessage("Greška pri komunikaciji sa serverom");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-800 mb-2">
                        Процена ризика - SRPS A.L2.003:2025
                    </h1>
                    <p className="text-blue-600">
                        Изаберите одговарајуће вредности величине опасности за сваки захтев
                    </p>
                </div>

                {/* Risk Assessment Table */}
                <RiskAssessmentTable 
                    procenaId={procenaId}
                    onSelectionChange={handleSelectionChange}
                />

                {/* Action Buttons */}
                <div className="mt-8 text-center space-y-4">
                    {message && (
                        <div className={`p-4 rounded-xl text-center text-lg shadow-lg ${
                            message.includes('Успешно') || message.includes('успешно') 
                                ? "bg-green-100 text-green-900" 
                                : "bg-red-100 text-red-700"
                        }`}>
                            {message}
                        </div>
                    )}

                    <div className="space-x-4">
                        <button
                            onClick={handleGenerateRiskMatrix}
                            disabled={loading || selections.length === 0}
                            className="bg-gradient-to-r from-green-500 via-lime-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 disabled:from-green-300 disabled:to-emerald-300 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? "Генерисање..." : "Генериши матрицу ризика и заврши"}
                        </button>

                        <button
                            onClick={() => window.history.back()}
                            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            ← Назад
                        </button>
                    </div>

                    {selections.length > 0 && (
                        <div className="mt-4 text-sm text-blue-600">
                            Изабрано је {selections.length} вредности
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
