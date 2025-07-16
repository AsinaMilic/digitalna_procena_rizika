"use client";
import { useState, useEffect } from "react";
import { RiskGroupData } from "../data/riskGroups";

interface RiskSelection {
    risk_id: string;
    danger_level: number;
    description: string;
}

interface RiskAssessmentTableProps {
    procenaId: string;
    riskGroupData: RiskGroupData;
    onSelectionChange?: (selections: RiskSelection[]) => void;
}



export default function RiskAssessmentTable({ procenaId, riskGroupData, onSelectionChange }: RiskAssessmentTableProps) {
    const [selections, setSelections] = useState<Map<string, RiskSelection>>(new Map());
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Učitaj postojeće selekcije pri učitavanju komponente
    useEffect(() => {
        async function loadExistingSelections() {
            try {
                const response = await fetch(`/api/procena/${procenaId}/risk-selection`);
                if (response.ok) {
                    const data = await response.json();
                    const selectionsMap = new Map<string, RiskSelection>();

                    data.forEach((item: any) => {
                        selectionsMap.set(item.riskId, {
                            risk_id: item.riskId,
                            danger_level: item.dangerLevel,
                            description: item.description
                        });
                    });

                    setSelections(selectionsMap);

                    // Pozovi callback sa učitanim podacima
                    if (onSelectionChange) {
                        onSelectionChange(Array.from(selectionsMap.values()));
                    }
                }
            } catch (error) {
                console.error('Greška pri učitavanju postojećih selekcija:', error);
            } finally {
                setInitialLoading(false);
            }
        }

        if (procenaId) {
            loadExistingSelections();
        }
    }, [procenaId, onSelectionChange]); // onSelectionChange is now stable thanks to useCallback

    const handleCellClick = async (riskId: string, dangerLevel: number, description: string) => {
        const newSelection: RiskSelection = {
            risk_id: riskId,
            danger_level: dangerLevel,
            description
        };

        // Ažuriraj lokalni state
        const newSelections = new Map(selections);
        newSelections.set(riskId, newSelection);
        setSelections(newSelections);

        // Pozovi callback ako postoji
        if (onSelectionChange) {
            onSelectionChange(Array.from(newSelections.values()));
        }

        // Pošalji na backend
        try {
            setLoading(true);
            const response = await fetch(`/api/procena/${procenaId}/risk-selection`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSelection)
            });

            if (!response.ok) {
                console.error('Greška pri čuvanju selekcije rizika');
            }
        } catch (error) {
            console.error('Greška pri komunikaciji sa serverom:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCellClass = (riskId: string, level: number, hasContent: boolean) => {
        const isSelected = selections.get(riskId)?.danger_level === level;
        const baseClass = "border border-gray-800 p-3 text-xs align-top cursor-pointer transition-colors text-black";

        if (!hasContent) {
            return `${baseClass} bg-gray-50`;
        }

        let hoverClass = "";
        switch (level) {
            case 5: hoverClass = "hover:bg-red-100"; break;
            case 4: hoverClass = "hover:bg-orange-100"; break;
            case 3: hoverClass = "hover:bg-yellow-100"; break;
            case 2: hoverClass = "hover:bg-blue-100"; break;
            case 1: hoverClass = "hover:bg-green-100"; break;
        }

        let selectedClass = "";
        if (isSelected) {
            switch (level) {
                case 5: selectedClass = "bg-red-200 border-red-500"; break;
                case 4: selectedClass = "bg-orange-200 border-orange-500"; break;
                case 3: selectedClass = "bg-yellow-200 border-yellow-500"; break;
                case 2: selectedClass = "bg-blue-200 border-blue-500"; break;
                case 1: selectedClass = "bg-green-200 border-green-500"; break;
            }
        }

        return `${baseClass} ${hoverClass} ${selectedClass}`;
    };

    if (initialLoading) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-600 font-medium">Учитавам табелу за процену ризика...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
                Табела за процену ризика - {riskGroupData.name}
            </h2>
            <p className="text-blue-600 text-center mb-6">
                {riskGroupData.description}
            </p>

            {loading && (
                <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg text-center">
                    Чување селекције...
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-800">
                    {/* Header */}
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-800 p-3 text-sm font-bold text-center w-20 text-black">
                                Р.<br />бр.
                            </th>
                            <th className="border border-gray-800 p-3 text-sm font-bold text-center w-60 text-black">
                                Захтев за процену<br />ризика
                            </th>
                            <th className="border border-gray-800 p-3 text-sm font-bold text-center bg-gray-300 text-black" colSpan={5}>
                                ВЕЛИЧИНА ОПАСНОСТИ
                            </th>
                        </tr>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-800 p-2"></th>
                            <th className="border border-gray-800 p-2"></th>
                            <th className="border border-gray-800 p-2 text-sm font-bold text-center w-40 text-black">
                                Максимална<br />5
                            </th>
                            <th className="border border-gray-800 p-2 text-sm font-bold text-center w-40 text-black">
                                Велика<br />4
                            </th>
                            <th className="border border-gray-800 p-2 text-sm font-bold text-center w-40 text-black">
                                Средња<br />3
                            </th>
                            <th className="border border-gray-800 p-2 text-sm font-bold text-center w-40 text-black">
                                Мала<br />2
                            </th>
                            <th className="border border-gray-800 p-2 text-sm font-bold text-center w-40 text-black">
                                Минимална<br />1
                            </th>
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {riskGroupData.risks.map((risk) => (
                            risk.items.map((item, itemIndex) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    {itemIndex === 0 && (
                                        <>
                                            <td
                                                className="border border-gray-800 p-3 text-sm font-semibold text-center align-top text-black"
                                                rowSpan={risk.items.length}
                                            >
                                                {risk.id}
                                            </td>
                                            <td
                                                className="border border-gray-800 p-3 text-sm align-top font-bold text-black"
                                                rowSpan={risk.items.length}
                                            >
                                                <div className="font-medium">
                                                    {risk.title}
                                                </div>
                                            </td>
                                        </>
                                    )}

                                    {/* Danger level cells */}
                                    {[5, 4, 3, 2, 1].map((level) => {
                                        const content = item.levels[level as keyof typeof item.levels];
                                        const hasContent = Boolean(content && String(content).trim() !== "");

                                        return (
                                            <td
                                                key={level}
                                                className={getCellClass(item.id, level, hasContent)}
                                                onClick={() => hasContent && handleCellClick(item.id, level, String(content))}
                                            >
                                                {content}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            {selections.size > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-bold text-blue-800 mb-2">Изабране вредности:</h3>
                    <div className="space-y-1 text-sm">
                        {Array.from(selections.values()).map((selection) => (
                            <div key={selection.risk_id} className="flex justify-between">
                                <span className="font-medium">{selection.risk_id}:</span>
                                <span className="text-blue-600">Ниво {selection.danger_level}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}