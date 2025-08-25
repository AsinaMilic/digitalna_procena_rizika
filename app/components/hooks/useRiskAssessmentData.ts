import { useState, useEffect, useCallback, useRef } from "react";
import { RiskGroupData } from "../../data/riskGroups";
import { PrilogMData } from "../../data/riskDataLoader";

interface RiskSelection {
    risk_id: string;
    danger_level: number;
    description: string;
}

interface FinancialData {
    poslovniPrihodi: number;
    vrednostImovine: number;
    delatnost: string;
    stvarnaSteta: number;
}

export function useRiskAssessmentData(
    procenaId: string,
    riskGroupData: RiskGroupData,
    onSelectionChange?: (selections: RiskSelection[]) => void,
    onPrilogMUpdate?: (prilogMData: PrilogMData[]) => void
) {
    const [selections, setSelections] = useState<Map<string, RiskSelection>>(new Map());
    const [prilogMData, setPrilogMData] = useState<Map<string, PrilogMData>>(new Map());
    const [initialLoading, setInitialLoading] = useState(true);
    const [hasValidFinancialData, setHasValidFinancialData] = useState(false);
    const [currentFinancialData, setCurrentFinancialData] = useState<FinancialData | null>(null);
    const loadedRef = useRef(false); // Koristi ref umesto state da se izbegnu rerenderovanja

    // Load financial data
    const loadFinancialData = useCallback(async () => {
        try {
            const finResponse = await fetch(`/api/procena/${procenaId}/financial-data`);
            if (finResponse.ok) {
                const finData = await finResponse.json();
                const hasValid = finData.poslovniPrihodi > 0 && finData.vrednostImovine > 0;
                setHasValidFinancialData(hasValid);
                setCurrentFinancialData(finData);
                return hasValid;
            }
        } catch (error) {
            console.error('Error loading financial data:', error);
        }
        return false;
    }, [procenaId]);

    // Load existing data on mount - SAMO JEDNOM
    useEffect(() => {
        if (loadedRef.current) return; // Ako su podaci već učitani, ne radi ništa
        loadedRef.current = true; // Označi da su podaci učitani
        
        async function loadExistingData() {
            try {
                // Check financial data
                await loadFinancialData();

                // Load selections
                const selectionsResponse = await fetch(`/api/procena/${procenaId}/risk-selection`);
                if (selectionsResponse.ok) {
                    const selectionsData = await selectionsResponse.json();
                    const selectionsMap = new Map<string, RiskSelection>();

                    selectionsData.forEach((item: { riskId?: string; riskid?: string; dangerLevel?: number; dangerlevel?: number; description?: string }) => {
                        // Handle different field name cases from database
                        const riskId = item.riskId || item.riskid;
                        const dangerLevel = item.dangerLevel || item.dangerlevel;
                        const description = item.description || '';

                        if (riskId && dangerLevel) {
                            selectionsMap.set(riskId, {
                                risk_id: riskId,
                                danger_level: dangerLevel,
                                description: description
                            });
                        }
                    });

                    setSelections(selectionsMap);

                    if (onSelectionChange) {
                        onSelectionChange(Array.from(selectionsMap.values()));
                    }
                }

                // Load Prilog M data - uvek učitaj iz API-ja da dobiješ najnovije podatke uključujući sekcijske ID-jeve
                {
                    // Učitaj iz API-ja
                    const prilogMResponse = await fetch(`/api/procena/${procenaId}/prilog-m`);
                    if (prilogMResponse.ok) {
                        const prilogMData = await prilogMResponse.json();
                        const prilogMMap = new Map<string, PrilogMData>();

                        // Učitaj SVE podatke, ne filtriraj po grupi
                        prilogMData.forEach((item: unknown) => {
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
                                opisidentifikovanihrizika?: string;
                                opisIdentifikovanihRizika?: string;
                            };

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
                                prihvatljivost: dbItem.prihvatljivost,
                                opisIdentifikovanihRizika: dbItem.opisidentifikovanihrizika || dbItem.opisIdentifikovanihRizika || null
                            };
                            prilogMMap.set(mappedItem.id, mappedItem);
                        });

                        setPrilogMData(prilogMMap);

                        // Za callback, pošalji samo podatke trenutne grupe
                        if (onPrilogMUpdate) {
                            const currentGroupData = Array.from(prilogMMap.values()).filter(item =>
                                item.groupId === riskGroupData.id
                            );
                            onPrilogMUpdate(currentGroupData);
                        }
                    }
                }

            } catch (error) {
                console.error('Error loading existing data:', error);
            } finally {
                setInitialLoading(false);
            }
        }

        if (procenaId && riskGroupData.id) {
            loadExistingData();
        }
    }, [procenaId, riskGroupData.id]); // Samo stabilni identifikatori

    // Listen for financial data saved events - UKLANJAM OVO JER NIJE POTREBNO
    // useEffect(() => {
    //     const handleFinancialDataSaved = async (event: Event) => {
    //         const customEvent = event as CustomEvent;
    //         if (customEvent.detail.procenaId === procenaId) {
    //             // Pozovi loadFinancialData direktno bez dependency
    //             try {
    //                 const finResponse = await fetch(`/api/procena/${procenaId}/financial-data`);
    //                 if (finResponse.ok) {
    //                     const finData = await finResponse.json();
    //                     const hasValid = finData.poslovniPrihodi > 0 && finData.vrednostImovine > 0;
    //                     setHasValidFinancialData(hasValid);
    //                     setCurrentFinancialData(finData);
    //                 }
    //             } catch (error) {
    //                 console.error('Error loading financial data:', error);
    //             }
    //         }
    //     };

    //     window.addEventListener('financialDataSaved', handleFinancialDataSaved);

    //     return () => {
    //         window.removeEventListener('financialDataSaved', handleFinancialDataSaved);
    //     };
    // }, [procenaId]); // Uklonio loadFinancialData iz dependencies

    return {
        selections,
        setSelections,
        prilogMData,
        setPrilogMData,
        initialLoading,
        hasValidFinancialData,
        setHasValidFinancialData,
        currentFinancialData,
        setCurrentFinancialData,
        loadFinancialData
    };
}