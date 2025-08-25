import { useState, useEffect, useCallback } from "react";
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
    onPrilogMUpdate?: (prilogMData: PrilogMData[]) => void,
    allPrilogMData?: Map<string, PrilogMData[]> // Dodaj prosleđene podatke
) {
    const [selections, setSelections] = useState<Map<string, RiskSelection>>(new Map());
    const [prilogMData, setPrilogMData] = useState<Map<string, PrilogMData>>(new Map());
    const [initialLoading, setInitialLoading] = useState(true);
    const [hasValidFinancialData, setHasValidFinancialData] = useState(false);
    const [currentFinancialData, setCurrentFinancialData] = useState<FinancialData | null>(null);

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

    // Load existing data on mount
    useEffect(() => {
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

                // Load Prilog M data - koristi prosleđene podatke ili učitaj iz API-ja
                if (allPrilogMData) {
                    // Koristi prosleđene podatke
                    const prilogMMap = new Map<string, PrilogMData>();
                    
                    // Konvertuj iz Map<string, PrilogMData[]> u Map<string, PrilogMData>
                    allPrilogMData.forEach((groupData) => {
                        groupData.forEach(item => {
                            prilogMMap.set(item.id, item);
                        });
                    });



                    setPrilogMData(prilogMMap);

                    // Za callback, pošalji samo podatke trenutne grupe
                    if (onPrilogMUpdate) {
                        const currentGroupData = Array.from(prilogMMap.values()).filter(item => 
                            item.groupId === riskGroupData.id
                        );
                        onPrilogMUpdate(currentGroupData);
                    }
                } else {
                    // Učitaj iz API-ja kao fallback
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
                                prihvatljivost: dbItem.prihvatljivost
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

        if (procenaId && riskGroupData) {
            loadExistingData();
        }
    }, [procenaId, riskGroupData, onSelectionChange, onPrilogMUpdate, loadFinancialData, allPrilogMData]);

    // Listen for financial data saved events
    useEffect(() => {
        const handleFinancialDataSaved = async (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail.procenaId === procenaId) {
                await loadFinancialData();
            }
        };

        window.addEventListener('financialDataSaved', handleFinancialDataSaved);

        return () => {
            window.removeEventListener('financialDataSaved', handleFinancialDataSaved);
        };
    }, [procenaId, loadFinancialData]);

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