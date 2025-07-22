"use client";
import { useState, useEffect } from "react";
import { RiskGroupData } from "../data/riskGroups";
import { PrilogMData, calculatePrilogM } from "../data/riskDataLoader";
import PrilogMDetails from "./PrilogMDetails";
import RiskAssessmentHeader from "./RiskAssessmentHeader";
import RiskAssessmentStatusMessages from "./RiskAssessmentStatusMessages";
import RiskAssessmentMainTable from "./RiskAssessmentMainTable";
import PrilogMTable from "./PrilogMTable";

interface RiskSelection {
    risk_id: string;
    danger_level: number;
    description: string;
}

interface RiskAssessmentTableProps {
    procenaId: string;
    riskGroupData: RiskGroupData;
    onSelectionChange?: (selections: RiskSelection[]) => void;
    onPrilogMUpdate?: (prilogMData: PrilogMData[]) => void;
}



export default function RiskAssessmentTable({ procenaId, riskGroupData, onSelectionChange, onPrilogMUpdate }: RiskAssessmentTableProps) {
    const [selections, setSelections] = useState<Map<string, RiskSelection>>(new Map());
    const [prilogMData, setPrilogMData] = useState<Map<string, PrilogMData>>(new Map());
    const [loading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedItemForDetails, setSelectedItemForDetails] = useState<PrilogMData | null>(null);

    // Učitaj postojeće selekcije i Prilog M podatke pri učitavanju komponente
    useEffect(() => {
        async function loadExistingData() {
            try {
                // Učitaj selekcije
                const selectionsResponse = await fetch(`/api/procena/${procenaId}/risk-selection`);
                if (selectionsResponse.ok) {
                    const selectionsData = await selectionsResponse.json();
                    const selectionsMap = new Map<string, RiskSelection>();

                    selectionsData.forEach((item: { riskId: string; dangerLevel: number; description: string }) => {
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
                    console.log('🔍 RiskAssessmentTable - učitani Prilog M podaci:', prilogMData.length);
                    console.log('🔍 RiskAssessmentTable - tražim grupu:', riskGroupData.id);

                    prilogMData
                        .filter((item: unknown) => {
                            // Type assertion for database item
                            const dbItem = item as {
                                groupid?: string;
                                groupId?: string;
                            };
                            const groupId = dbItem.groupid || dbItem.groupId;
                            console.log('🔍 Item groupId:', groupId, 'vs expected:', riskGroupData.id);
                            return groupId === riskGroupData.id;
                        })
                        .forEach((item: unknown) => {
                            // Type assertion for database item
                            const dbItem = item as {
                                id: string;
                                groupid?: string;
                                groupId?: string;
                                requirement: string;
                                velicinaopasnosti?: number;
                                velicinaOpasnosti?: number;
                                izlozenost: number;
                                ranjivost: number;
                                verovatnoca: number;
                                posledice: number;
                                steta: number;
                                kriticnost: number;
                                nivorizika?: number;
                                nivoRizika?: number;
                                kategorijarizika?: number;
                                kategorijaRizika?: number;
                                prihvatljivost: 'PRIHVATLJIV' | 'NEPRIHVATLJIV' | null;
                            };

                            // Mapiranje polja iz baze na očekivani format
                            const mappedItem: PrilogMData = {
                                id: dbItem.id,
                                groupId: dbItem.groupid || dbItem.groupId || '',
                                requirement: dbItem.requirement,
                                velicinaOpasnosti: dbItem.velicinaopasnosti || dbItem.velicinaOpasnosti || null,
                                izlozenost: dbItem.izlozenost || null,
                                ranjivost: dbItem.ranjivost || null,
                                verovatnoca: dbItem.verovatnoca || null,
                                posledice: dbItem.posledice || null,
                                steta: dbItem.steta || null,
                                kriticnost: dbItem.kriticnost || null,
                                nivoRizika: dbItem.nivorizika || dbItem.nivoRizika || null,
                                kategorijaRizika: dbItem.kategorijarizika || dbItem.kategorijaRizika || null,
                                prihvatljivost: dbItem.prihvatljivost
                            };
                            prilogMMap.set(mappedItem.id, mappedItem);
                        });

                    console.log('🔍 RiskAssessmentTable - filtrirani podaci za grupu:', prilogMMap.size);

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
    }, [procenaId, riskGroupData, onSelectionChange, onPrilogMUpdate]);

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

        // Automatski izračunaj Prilog M podatke PREMA STANDARDU
        const calculatedData = calculatePrilogM(
            dangerLevel,    // velicinaOpasnosti iz korisničkog klika
            3,              // stepenIzlozenosti (default - može se proširiti kroz UI)
            3,              // stepenRanjivosti (default - može se proširiti kroz UI)
            0,              // stvarnaSteta (default - treba dodati unos)
            1000000,        // poslovniPrihodi (default 1M RSD - treba dodati unos)
            5000000,        // vrednostImovine (default 5M RSD - treba dodati unos)
            'default',      // delatnost (default - treba dodati izbor)
            3               // kriticnost (default - može se proširiti kroz UI)
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
            <RiskAssessmentHeader
                groupName={riskGroupData.name}
                groupDescription={riskGroupData.description}
                hasUnsavedChanges={hasUnsavedChanges}
                saving={saving}
                onSaveChanges={handleSaveChanges}
            />

            <RiskAssessmentStatusMessages
                hasUnsavedChanges={hasUnsavedChanges}
                saving={saving}
                loading={loading}
            />

            <RiskAssessmentMainTable
                riskGroupData={riskGroupData}
                onCellClick={handleCellClick}
                getCellClass={getCellClass}
            />

            {/* Summary sa Prilog M podacima */}
            {(selections.size > 0 || prilogMData.size > 0) && (
                <div className="mt-6 space-y-4">
                    <PrilogMTable
                        prilogMData={prilogMData}
                        onShowDetails={setSelectedItemForDetails}
                    />
                </div>
            )}

            {/* Modal za prikaz detalja */}
            {selectedItemForDetails && (
                <PrilogMDetails
                    data={selectedItemForDetails}
                    onClose={() => setSelectedItemForDetails(null)}
                />
            )}
        </div>
    );
}