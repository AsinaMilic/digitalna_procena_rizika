"use client";
import { useState, useEffect } from "react";
import { RiskGroupData } from "../data/riskGroups";
import { PrilogMData, calculatePrilogM } from "../data/riskDataLoader";

interface RiskSelection {
    risk_id: string;
    danger_level: number;
    description: string;
}

interface RiskAssessmentTableProps {
    procenaId: string;
    riskGroupData: RiskGroupData;
    onSelectionChange?: (selections: RiskSelection[]) => void;
    onPrilogMUpdate?: (prilogMData: PrilogMData[]) => void; // Novi callback za Prilog M
}



export default function RiskAssessmentTable({ procenaId, riskGroupData, onSelectionChange, onPrilogMUpdate }: RiskAssessmentTableProps) {
    const [selections, setSelections] = useState<Map<string, RiskSelection>>(new Map());
    const [prilogMData, setPrilogMData] = useState<Map<string, PrilogMData>>(new Map());
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    // Učitaj postojeće selekcije i Prilog M podatke pri učitavanju komponente
    useEffect(() => {
        async function loadExistingData() {
            try {
                // Učitaj selekcije
                const selectionsResponse = await fetch(`/api/procena/${procenaId}/risk-selection`);
                if (selectionsResponse.ok) {
                    const selectionsData = await selectionsResponse.json();
                    const selectionsMap = new Map<string, RiskSelection>();

                    selectionsData.forEach((item: any) => {
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

                // Učitaj Prilog M podatke za ovu grupu
                const prilogMResponse = await fetch(`/api/procena/${procenaId}/prilog-m`);
                if (prilogMResponse.ok) {
                    const prilogMData = await prilogMResponse.json();
                    const prilogMMap = new Map<string, PrilogMData>();

                    // Filtriraj podatke samo za trenutnu grupu
                    prilogMData
                        .filter((item: PrilogMData) => item.groupId === riskGroupData.id)
                        .forEach((item: PrilogMData) => {
                            prilogMMap.set(item.id, item);
                        });

                    setPrilogMData(prilogMMap);

                    // Pozovi callback sa učitanim Prilog M podacima
                    if (onPrilogMUpdate) {
                        onPrilogMUpdate(Array.from(prilogMMap.values()));
                    }
                }

            } catch (error) {
                console.error('Greška pri učitavanju postojećih podataka:', error);
            } finally {
                setInitialLoading(false);
            }
        }

        if (procenaId && riskGroupData) {
            loadExistingData();
        }
    }, [procenaId, riskGroupData.id]); // Dodaj riskGroupData.id kao dependency

    const handleCellClick = async (riskId: string, dangerLevel: number, description: string) => {
        // Prevent multiple clicks on the same cell while loading
        if (loading) {
            return;
        }

        // Check if this selection already exists with the same danger level
        const existingSelection = selections.get(riskId);
        if (existingSelection && existingSelection.danger_level === dangerLevel) {
            console.log('Selection already exists with same danger level, skipping...');
            return;
        }

        const newSelection: RiskSelection = {
            risk_id: riskId,
            danger_level: dangerLevel,
            description
        };

        // Ažuriraj lokalni state za selekcije
        const newSelections = new Map(selections);
        newSelections.set(riskId, newSelection);
        setSelections(newSelections);

        // 🚀 OPTIMIZOVANI TOK - Automatski izračunaj Prilog M podatke
        const calculatedData = calculatePrilogM(
            dangerLevel, // velicinaOpasnosti iz korisničkog klika
            3,           // stepenIzlozenosti (default - može se proširiti)
            3,           // stepenRanjivosti (default - može se proširiti)
            3,           // steta (default - može se proširiti)
            3            // kriticnost (default - može se proširiti)
        );

        const prilogMItem: PrilogMData = {
            id: riskId,
            groupId: riskGroupData.id,
            requirement: description,
            velicinaOpasnosti: calculatedData.velicinaOpasnosti ?? dangerLevel,
            izlozenost: calculatedData.izlozenost ?? 3,
            ranjivost: calculatedData.ranjivost ?? 3,
            verovatnoca: calculatedData.verovatnoca ?? 3,
            posledice: calculatedData.posledice ?? 3,
            steta: calculatedData.steta ?? 3,
            kriticnost: calculatedData.kriticnost ?? 3,
            nivoRizika: calculatedData.nivoRizika ?? 4,
            kategorijaRizika: calculatedData.kategorijaRizika ?? 3,
            prihvatljivost: calculatedData.prihvatljivost ?? 'PRIHVATLJIV'
        };

        // Ažuriraj Prilog M podatke
        const newPrilogMData = new Map(prilogMData);
        newPrilogMData.set(riskId, prilogMItem);
        setPrilogMData(newPrilogMData);

        // Pozovi callback-ove
        if (onSelectionChange) {
            onSelectionChange(Array.from(newSelections.values()));
        }

        if (onPrilogMUpdate) {
            onPrilogMUpdate(Array.from(newPrilogMData.values()));
        }

        // Označi da ima nesačuvanih promena
        setHasUnsavedChanges(true);
    };

    // Batch čuvanje svih promena
    const handleSaveChanges = async () => {
        if (!hasUnsavedChanges || saving) {
            return;
        }

        setSaving(true);
        try {
            // Pripremi podatke za batch čuvanje
            const selectionsToSave = Array.from(selections.values());
            const prilogMToSave = Array.from(prilogMData.values());

            // Pošalji sve podatke odjednom
            const [selectionResults, prilogMResults] = await Promise.allSettled([
                // Batch čuvanje selekcija
                Promise.all(selectionsToSave.map(selection =>
                    fetch(`/api/procena/${procenaId}/risk-selection`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            risk_id: selection.risk_id,
                            danger_level: selection.danger_level,
                            description: selection.description
                        })
                    })
                )),
                // Batch čuvanje Prilog M podataka
                Promise.all(prilogMToSave.map(item =>
                    fetch(`/api/procena/${procenaId}/prilog-m`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item)
                    })
                ))
            ]);

            // Proveri rezultate
            let hasErrors = false;
            
            if (selectionResults.status === 'rejected') {
                console.error('Greška pri čuvanju selekcija:', selectionResults.reason);
                hasErrors = true;
            }
            
            if (prilogMResults.status === 'rejected') {
                console.error('Greška pri čuvanju Prilog M podataka:', prilogMResults.reason);
                hasErrors = true;
            }

            if (!hasErrors) {
                setHasUnsavedChanges(false);
                // Prikaži poruku o uspešnom čuvanju
                const successDiv = document.createElement('div');
                successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                successDiv.textContent = '✅ Промене су успешно сачуване!';
                document.body.appendChild(successDiv);
                setTimeout(() => document.body.removeChild(successDiv), 3000);
            } else {
                throw new Error('Greška pri čuvanju podataka');
            }

        } catch (error) {
            console.error('Greška pri čuvanju:', error);
            // Prikaži poruku o grešci
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            errorDiv.textContent = '❌ Greška pri čuvanju promena!';
            document.body.appendChild(errorDiv);
            setTimeout(() => document.body.removeChild(errorDiv), 3000);
        } finally {
            setSaving(false);
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
            <div className="flex justify-between items-center mb-6">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-blue-800 text-center">
                        Табела за процену ризика - {riskGroupData.name}
                    </h2>
                    <p className="text-blue-600 text-center mt-2">
                        {riskGroupData.description}
                    </p>
                </div>
                
                {/* Dugme za čuvanje */}
                {hasUnsavedChanges && (
                    <div className="ml-4">
                        <button
                            onClick={handleSaveChanges}
                            disabled={saving}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                saving 
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

            {/* Status poruke */}
            {hasUnsavedChanges && !saving && (
                <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-center border border-yellow-300">
                    ⚠️ Имате несачуване промене. Кликните "Сачувај промене" да их сачувате.
                </div>
            )}

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

            {/* Summary sa Prilog M podacima */}
            {selections.size > 0 && (
                <div className="mt-6 space-y-4">
                    {/* Prilog M - Kompletna tabela */}
                    {prilogMData.size > 0 && (
                        <div className="p-6 bg-white border-2 border-gray-800 rounded-lg">
                            <h3 className="font-bold text-gray-800 mb-6 text-center text-lg">
                                НИВО АГРЕГАТНОГ РИЗИКА, КАТЕГОРИЈА И ПРИХВАТЉИВОСТИ РИЗИКА
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border-2 border-gray-800 text-xs">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800" style={{ width: '60px' }}>
                                                Р.<br />бр.
                                            </th>
                                            <th className="border border-gray-800 px-2 py-2 text-center font-bold text-gray-800" style={{ minWidth: '200px' }}>
                                                ЗАХТЕВИ ЗА ПРОЦЕНУ РИЗИКА
                                            </th>
                                            <th className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800" style={{ width: '50px' }}>
                                                ВО
                                            </th>
                                            <th className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800" style={{ width: '50px' }}>
                                                Изл.
                                            </th>
                                            <th className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800" style={{ width: '50px' }}>
                                                Рањ.
                                            </th>
                                            <th className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800" style={{ width: '50px' }}>
                                                Вер.
                                            </th>
                                            <th className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800" style={{ width: '50px' }}>
                                                Посл.
                                            </th>
                                            <th className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800" style={{ width: '50px' }}>
                                                Штет.
                                            </th>
                                            <th className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800" style={{ width: '50px' }}>
                                                Крит.
                                            </th>
                                            <th className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800" style={{ width: '60px' }}>
                                                Ниво<br />риз.
                                            </th>
                                            <th className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800" style={{ width: '70px' }}>
                                                Кат.<br />риз.
                                            </th>
                                            <th className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800" style={{ width: '80px' }}>
                                                Прихв.
                                            </th>
                                        </tr>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">1</th>
                                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">2</th>
                                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">3</th>
                                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">4</th>
                                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">5</th>
                                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">6</th>
                                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">7</th>
                                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">8</th>
                                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">9</th>
                                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">10</th>
                                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">11</th>
                                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">12</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from(prilogMData.values())
                                            .sort((a, b) => {
                                                // Natural sort for IDs like 1.1.1, 1.1.2, 1.2.1, etc.
                                                const aParts = a.id.split('.').map(Number);
                                                const bParts = b.id.split('.').map(Number);

                                                for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                                                    const aVal = aParts[i] || 0;
                                                    const bVal = bParts[i] || 0;
                                                    if (aVal !== bVal) {
                                                        return aVal - bVal;
                                                    }
                                                }
                                                return 0;
                                            })
                                            .map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="border border-gray-800 px-1 py-2 text-center font-medium text-gray-800 text-xs">
                                                        {item.id}
                                                    </td>
                                                    <td className="border border-gray-800 px-2 py-2 text-xs text-gray-800 align-top">
                                                        {item.requirement || 'Захтев за процену ризика'}
                                                    </td>
                                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                                        <span className={`inline-block w-6 h-6 rounded-full text-white font-bold text-xs leading-6 ${(item.velicinaOpasnosti || 0) >= 4 ? 'bg-red-600' :
                                                            (item.velicinaOpasnosti || 0) === 3 ? 'bg-yellow-600' :
                                                                'bg-green-600'
                                                            }`}>
                                                            {item.velicinaOpasnosti}
                                                        </span>
                                                    </td>
                                                    <td className="border border-gray-800 px-1 py-2 text-center font-medium text-gray-800 text-xs">
                                                        {item.izlozenost}
                                                    </td>
                                                    <td className="border border-gray-800 px-1 py-2 text-center font-medium text-gray-800 text-xs">
                                                        {item.ranjivost}
                                                    </td>
                                                    <td className="border border-gray-800 px-1 py-2 text-center font-medium text-gray-800 text-xs">
                                                        {item.verovatnoca}
                                                    </td>
                                                    <td className="border border-gray-800 px-1 py-2 text-center font-medium text-gray-800 text-xs">
                                                        {item.posledice}
                                                    </td>
                                                    <td className="border border-gray-800 px-1 py-2 text-center font-medium text-gray-800 text-xs">
                                                        {item.steta || '-'}
                                                    </td>
                                                    <td className="border border-gray-800 px-1 py-2 text-center font-medium text-gray-800 text-xs">
                                                        {item.kriticnost || '-'}
                                                    </td>
                                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                                        <span className={`inline-block px-2 py-1 rounded-full text-white font-bold text-xs ${(item.nivoRizika || 0) >= 15 ? 'bg-red-600' :
                                                            (item.nivoRizika || 0) >= 6 ? 'bg-yellow-600' :
                                                                'bg-green-600'
                                                            }`}>
                                                            {item.nivoRizika}
                                                        </span>
                                                    </td>
                                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                                        <span className={`inline-block px-1 py-1 rounded text-xs font-semibold ${item.kategorijaRizika === 1 ? 'bg-red-100 text-red-800' :
                                                            item.kategorijaRizika === 2 ? 'bg-orange-100 text-orange-800' :
                                                                item.kategorijaRizika === 3 ? 'bg-yellow-100 text-yellow-800' :
                                                                    item.kategorijaRizika === 4 ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-green-100 text-green-800'
                                                            }`}>
                                                            {item.kategorijaRizika === 1 ? 'I' :
                                                                item.kategorijaRizika === 2 ? 'II' :
                                                                    item.kategorijaRizika === 3 ? 'III' :
                                                                        item.kategorijaRizika === 4 ? 'IV' :
                                                                            'V'}
                                                        </span>
                                                    </td>
                                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                                        <span className={`inline-block px-1 py-1 rounded text-xs font-semibold ${item.prihvatljivost === 'NEPRIHVATLJIV'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {item.prihvatljivost === 'NEPRIHVATLJIV' ? 'НЕ' : 'ДА'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}