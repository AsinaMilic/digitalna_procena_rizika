"use client";
import { useState, useEffect } from "react";
import { RiskGroupData } from "../data/riskGroups";
import { PrilogMData, calculatePrilogM } from "../data/riskDataLoader";
import PrilogMDetails from "./PrilogMDetails";
import RiskAssessmentHeader from "./RiskAssessmentHeader";
import RiskAssessmentStatusMessages from "./RiskAssessmentStatusMessages";
import RiskAssessmentMainTable from "./RiskAssessmentMainTable";
import PrilogMTable from "./PrilogMTable";
import RiskParametersForm from "./RiskParametersForm";
import FinancialDataWarning from "./FinancialDataWarning";
import FinancialDataForm from "./FinancialDataForm";

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
    onUnsavedChanges?: (hasUnsaved: boolean) => void;
}



export default function RiskAssessmentTable({ procenaId, riskGroupData, onSelectionChange, onPrilogMUpdate, onUnsavedChanges }: RiskAssessmentTableProps) {
    const [selections, setSelections] = useState<Map<string, RiskSelection>>(new Map());
    const [prilogMData, setPrilogMData] = useState<Map<string, PrilogMData>>(new Map());
    const [loading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedItemForDetails, setSelectedItemForDetails] = useState<PrilogMData | null>(null);
    const [showParametersForm, setShowParametersForm] = useState(false);
    const [pendingRiskData, setPendingRiskData] = useState<{
        riskId: string;
        dangerLevel: number;
        description: string;
    } | null>(null);
    const [showFinancialForm, setShowFinancialForm] = useState(false);
    const [hasValidFinancialData, setHasValidFinancialData] = useState(false);
    const [currentFinancialData, setCurrentFinancialData] = useState<any>(null);

    // Učitaj postojeće selekcije i Prilog M podatke pri učitavanju komponente
    useEffect(() => {
        async function loadExistingData() {
            try {
                // Proverava finansijske podatke
                const finResponse = await fetch(`/api/procena/${procenaId}/financial-data`);
                if (finResponse.ok) {
                    const finData = await finResponse.json();
                    console.log('🔍 RiskAssessmentTable - loaded financial data:', finData);
                    const hasValid = finData.poslovniPrihodi > 0 && finData.vrednostImovine > 0;
                    setHasValidFinancialData(hasValid);
                    setCurrentFinancialData(finData);
                    console.log('🔍 RiskAssessmentTable - set currentFinancialData:', finData);
                }

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

    // Obavesti roditeljsku komponentu o promenama u nesačuvanim promenama
    useEffect(() => {
        if (onUnsavedChanges) {
            onUnsavedChanges(hasUnsavedChanges);
        }
    }, [hasUnsavedChanges, onUnsavedChanges]);

    // Reset nesačuvanih promena kada se komponenta mount-uje (nova grupa)
    useEffect(() => {
        setHasUnsavedChanges(false);
    }, [riskGroupData.id]);

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

        // Prikaži formu za unos parametara
        setPendingRiskData({ riskId, dangerLevel, description });
        setShowParametersForm(true);
    };

    const handleParametersSet = async (params: {
        stepenIzlozenosti: number;
        stepenRanjivosti: number;
        kriticnost: number;
    }) => {
        if (!pendingRiskData) return;

        const { riskId, dangerLevel, description } = pendingRiskData;

        const newSelection: RiskSelection = {
            risk_id: riskId,
            danger_level: dangerLevel,
            description
        };

        // Ažuriraj lokalni state za selekcije
        const newSelections = new Map(selections);
        newSelections.set(riskId, newSelection);
        setSelections(newSelections);

        // Učitaj finansijske podatke za tačnu kalkulaciju
        let financialData = null;
        let usingDefaultValues = false;

        try {
            const finResponse = await fetch(`/api/procena/${procenaId}/financial-data`);
            if (finResponse.ok) {
                const finData = await finResponse.json();
                // Proveri da li su podaci stvarno uneti ili su default/prazni
                if ((!finData.poslovniPrihodi || finData.poslovniPrihodi === 0) &&
                    (!finData.vrednostImovine || finData.vrednostImovine === 0)) {
                    usingDefaultValues = true;
                }

                // Ako su podaci prazni, koristi fallback vrednosti za kalkulaciju
                if (usingDefaultValues) {
                    financialData = {
                        poslovniPrihodi: 1000000, // Fallback vrednost
                        vrednostImovine: 5000000, // Fallback vrednost
                        delatnost: finData.delatnost || 'default',
                        stvarnaSteta: finData.stvarnaSteta ?? 0
                    };
                } else {
                    // Koristi stvarne podatke
                    financialData = {
                        poslovniPrihodi: finData.poslovniPrihodi,
                        vrednostImovine: finData.vrednostImovine,
                        delatnost: finData.delatnost || 'default',
                        stvarnaSteta: finData.stvarnaSteta ?? 0
                    };
                }
            } else {
                usingDefaultValues = true;
                // Fallback default vrednosti samo za kalkulaciju
                financialData = {
                    poslovniPrihodi: 1000000,
                    vrednostImovine: 5000000,
                    delatnost: 'default',
                    stvarnaSteta: 0
                };
            }
        } catch (error) {
            console.warn('Greška pri učitavanju finansijskih podataka:', error);
            usingDefaultValues = true;
            financialData = {
                poslovniPrihodi: 1000000,
                vrednostImovine: 5000000,
                delatnost: 'default',
                stvarnaSteta: 0
            };
        }

        // Automatski izračunaj Prilog M podatke PREMA STANDARDU SRPS A.L2.003:2025
        const calculatedData = calculatePrilogM(
            dangerLevel,                    // velicinaOpasnosti iz korisničkog klika
            params.stepenIzlozenosti,      // stepenIzlozenosti iz forme
            params.stepenRanjivosti,       // stepenRanjivosti iz forme
            financialData.stvarnaSteta,    // stvarnaSteta iz finansijskih podataka
            financialData.poslovniPrihodi, // poslovniPrihodi iz finansijskih podataka
            financialData.vrednostImovine, // vrednostImovine iz finansijskih podataka
            financialData.delatnost,       // delatnost iz finansijskih podataka
            params.kriticnost,             // kriticnost iz forme
            true                           // enableLogging - za debug
        );

        // Dodaj informaciju o tome da li se koriste default vrednosti
        calculatedData.usingDefaultFinancialData = usingDefaultValues;

        console.log('🔍 Kalkulacija završena za:', riskId, 'sa rezultatom:', calculatedData);

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

        // Zatvori formu
        setShowParametersForm(false);
        setPendingRiskData(null);
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

            {/* Upozorenje o nedostajućim finansijskim podacima ili dugme za editovanje */}
            {!hasValidFinancialData ? (
                <FinancialDataWarning onOpenForm={async () => {
                    // Ponovo učitaj finansijske podatke pre otvaranja forme
                    try {
                        const finResponse = await fetch(`/api/procena/${procenaId}/financial-data`);
                        if (finResponse.ok) {
                            const finData = await finResponse.json();
                            console.log('🔍 Opening form with fresh data:', finData);
                            setCurrentFinancialData(finData);
                            // Sačekaj malo da se state ažurira
                            setTimeout(() => {
                                setShowFinancialForm(true);
                            }, 50);
                        } else {
                            setShowFinancialForm(true);
                        }
                    } catch (error) {
                        console.error('Error loading financial data:', error);
                        setShowFinancialForm(true);
                    }
                }} />
            ) : (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">
                                    ✅ Финансијски подаци су унети
                                </h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>Пословни приходи: {currentFinancialData?.poslovniPrihodi?.toLocaleString()} РСД</p>
                                    <p>Вредност имовине: {currentFinancialData?.vrednostImovine?.toLocaleString()} РСД</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                // Ponovo učitaj finansijske podatke pre otvaranja forme
                                try {
                                    const finResponse = await fetch(`/api/procena/${procenaId}/financial-data`);
                                    if (finResponse.ok) {
                                        const finData = await finResponse.json();
                                        console.log('🔍 Opening form for editing with data:', finData);
                                        setCurrentFinancialData(finData);
                                        // Sačekaj malo da se state ažurira
                                        setTimeout(() => {
                                            setShowFinancialForm(true);
                                        }, 50);
                                    } else {
                                        setShowFinancialForm(true);
                                    }
                                } catch (error) {
                                    console.error('Error loading financial data:', error);
                                    setShowFinancialForm(true);
                                }
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                        >
                            Измени податке
                        </button>
                    </div>
                </div>
            )}

            <RiskAssessmentMainTable
                riskGroupData={riskGroupData}
                onCellClick={handleCellClick}
                getCellClass={getCellClass}
            />

            {/* Summary sa Prilog M podacima */}
            {(selections.size > 0 || prilogMData.size > 0) && (
                <div className="mt-6 space-y-4">
                    {/* Upozorenje o default finansijskim podacima */}
                    {Array.from(prilogMData.values()).some(item => item.usingDefaultFinancialData) && (
                        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-orange-800">
                                        Упозорење: Користе се default финансијски подаци
                                    </h3>
                                    <div className="mt-2 text-sm text-orange-700">
                                        <p>
                                            Резултати процене ризика могу бити нетачни јер се користе default вредности:
                                        </p>
                                        <ul className="list-disc list-inside mt-1">
                                            <li>Пословни приходи: 1.000.000 РСД</li>
                                            <li>Вредност имовине: 5.000.000 РСД</li>
                                            <li>Делатност: default (Iud = 0.15)</li>
                                        </ul>
                                        <p className="mt-2">
                                            <strong>Препорука:</strong> Унесите стварне финансијске податке за тачну процену ризика према стандарду SRPS A.L2.003:2025.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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

            {/* Modal za unos parametara */}
            {showParametersForm && pendingRiskData && (
                <RiskParametersForm
                    riskId={pendingRiskData.riskId}
                    riskDescription={pendingRiskData.description}
                    onParametersSet={handleParametersSet}
                    onCancel={() => {
                        setShowParametersForm(false);
                        setPendingRiskData(null);
                    }}
                />
            )}

            {/* Modal za unos finansijskih podataka */}
            {showFinancialForm && (
                <FinancialDataForm
                    procenaId={procenaId}
                    initialData={currentFinancialData}
                    onSave={(data) => {
                        setHasValidFinancialData(data.poslovniPrihodi > 0 && data.vrednostImovine > 0);
                        setCurrentFinancialData(data);
                        setShowFinancialForm(false);
                        // Ponovo učitaj podatke nakon čuvanja
                        setTimeout(async () => {
                            try {
                                const finResponse = await fetch(`/api/procena/${procenaId}/financial-data`);
                                if (finResponse.ok) {
                                    const finData = await finResponse.json();
                                    setCurrentFinancialData(finData);
                                    setHasValidFinancialData(finData.poslovniPrihodi > 0 && finData.vrednostImovine > 0);
                                }
                            } catch (error) {
                                console.error('Error reloading financial data:', error);
                            }
                        }, 100);
                    }}
                    onClose={() => setShowFinancialForm(false)}
                />
            )}
        </div>
    );
}