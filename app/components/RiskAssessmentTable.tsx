"use client";
import { useState, useEffect } from "react";

interface RiskSelection {
    risk_id: string;
    danger_level: number;
    description: string;
}

interface RiskAssessmentTableProps {
    procenaId: string;
    onSelectionChange?: (selections: RiskSelection[]) => void;
}

const RISK_DATA = [
    {
        id: "1.1",
        title: "Постојање правилника о организацији и систематизацији послова",
        items: [
            {
                id: "1.1.1",
                levels: {
                    5: "1. Организација има више од 10 запослених и не поседује Правилник о организацији и систематизацији послова.",
                    4: "",
                    3: "",
                    2: "",
                    1: "1. Организација има више од 10 запослених и има Правилник о организацији и систематизацији радних места са тачно утврђеним одговорностима и радним задацима запослених."
                }
            },
            {
                id: "1.1.2",
                levels: {
                    5: "",
                    4: "",
                    3: "",
                    2: "2. Правилник се делимично ажурира сходно изменама радних позиција.",
                    1: "2. Правилник се ажурира сходно изменама радних позиција."
                }
            },
            {
                id: "1.1.3",
                levels: {
                    5: "",
                    4: "",
                    3: "",
                    2: "",
                    1: "3. Радне позиције из правилника су адекватне и у складу са делатношћу организације."
                }
            }
        ]
    },
    {
        id: "1.2",
        title: "Постојање плана набавки/план јавних набавки добара, радова и услуга са тачно утврђеним описима, роком реализације и финансијским износима",
        items: [
            {
                id: "1.2.1",
                levels: {
                    5: "1. Организација је обухваћена Законом о јавним набавкама и не поседује план набавки/план јавних набавки добара, радова и услуга.",
                    4: "1. План набавки постоји али није детаљан или се не поштује у потпуности.",
                    3: "1. План набавки постоји али се повремено мења током године.",
                    2: "1. План набавки постоји и углавном се поштује.",
                    1: "1. План набавки/јавних набавки постоји, детаљан је, редовно се ажурира и доследно спроводи."
                }
            }
        ]
    },
    {
        id: "1.3",
        title: "Постојање ажурне евиденције о насталим штетама као последицама техничких ризика у пословању",
        items: [
            {
                id: "1.3.1",
                levels: {
                    5: "1. Организација не поседује евиденцију о штетама као последицама техничких ризика из 'Извештаја ревизора'.",
                    4: "1. Организација поседује евиденцију о штетама као последицама техничких ризика из 'Извештаја ревизора'.",
                    3: "1. Организација поседује евиденцију о штетама као последицама техничких ризика из 'Извештаја ревизора'.",
                    2: "1. Организација поседује евиденцију о штетама као последицама техничких ризика из 'Извештаја ревизора'.",
                    1: "1. Организација поседује евиденцију о штетама као последицама техничких ризика из 'Извештаја ревизора'."
                }
            }
        ]
    }
];

export default function RiskAssessmentTable({ procenaId, onSelectionChange }: RiskAssessmentTableProps) {
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
    }, [procenaId, onSelectionChange]);

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
        const baseClass = "border border-gray-800 p-3 text-xs align-top cursor-pointer transition-colors";

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
                Табела за процену ризика - Прилог В
            </h2>

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
                            <th className="border border-gray-800 p-3 text-sm font-bold text-center w-20">
                                Р.<br />бр.
                            </th>
                            <th className="border border-gray-800 p-3 text-sm font-bold text-center w-60">
                                Захтев за процену<br />ризика
                            </th>
                            <th className="border border-gray-800 p-3 text-sm font-bold text-center bg-gray-300" colSpan={5}>
                                ВЕЛИЧИНА ОПАСНОСТИ
                            </th>
                        </tr>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-800 p-2"></th>
                            <th className="border border-gray-800 p-2"></th>
                            <th className="border border-gray-800 p-2 text-sm font-bold text-center w-40">
                                Максимална<br />5
                            </th>
                            <th className="border border-gray-800 p-2 text-sm font-bold text-center w-40">
                                Велика<br />4
                            </th>
                            <th className="border border-gray-800 p-2 text-sm font-bold text-center w-40">
                                Средња<br />3
                            </th>
                            <th className="border border-gray-800 p-2 text-sm font-bold text-center w-40">
                                Мала<br />2
                            </th>
                            <th className="border border-gray-800 p-2 text-sm font-bold text-center w-40">
                                Минимална<br />1
                            </th>
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {RISK_DATA.map((risk) => (
                            risk.items.map((item, itemIndex) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    {itemIndex === 0 && (
                                        <>
                                            <td
                                                className="border border-gray-800 p-3 text-sm font-semibold text-center align-top"
                                                rowSpan={risk.items.length}
                                            >
                                                {risk.id}
                                            </td>
                                            <td
                                                className="border border-gray-800 p-3 text-sm align-top font-bold"
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