import { useState } from "react";
import { RiskGroupData } from "../../data/riskGroups";
import { PrilogMData, calculatePrilogM } from "../../data/riskDataLoader";

interface RiskSelection {
    risk_id: string;
    danger_level: number;
    description: string;
}

// interface FinancialData {
//     poslovniPrihodi: number;
//     vrednostImovine: number;
//     delatnost: string;
//     stvarnaSteta: number;
// }

interface UseRiskAssessmentActionsProps {
    procenaId: string;
    riskGroupData: RiskGroupData;
    selections: Map<string, RiskSelection>;
    setSelections: (selections: Map<string, RiskSelection>) => void;
    prilogMData: Map<string, PrilogMData>;
    setPrilogMData: (data: Map<string, PrilogMData>) => void;
    onSelectionChange?: (selections: RiskSelection[]) => void;
    onPrilogMUpdate?: (prilogMData: PrilogMData[]) => void;
    setHasUnsavedChanges: (hasUnsaved: boolean) => void;
}

export function useRiskAssessmentActions({
    procenaId,
    riskGroupData,
    selections,
    setSelections,
    prilogMData,
    setPrilogMData,
    onSelectionChange,
    onPrilogMUpdate,
    setHasUnsavedChanges
}: UseRiskAssessmentActionsProps) {
    const [loading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [pendingRiskData, setPendingRiskData] = useState<{
        riskId: string;
        dangerLevel: number;
        description: string;
    } | null>(null);

    const handleCellClick = async (riskId: string, dangerLevel: number, description: string) => {
        if (loading) {
            return;
        }

        const existingSelection = selections.get(riskId);
        if (existingSelection && existingSelection.danger_level === dangerLevel) {
            console.log('Selection already exists with same danger level, skipping...');
            return;
        }

        setPendingRiskData({ riskId, dangerLevel, description });
        return { showParametersForm: true };
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

        const newSelections = new Map(selections);
        newSelections.set(riskId, newSelection);
        setSelections(newSelections);

        // Load financial data for accurate calculation
        let financialData = null;
        let usingDefaultValues = false;

        try {
            const finResponse = await fetch(`/api/procena/${procenaId}/financial-data`);
            if (finResponse.ok) {
                const finData = await finResponse.json();
                if ((!finData.poslovniPrihodi || finData.poslovniPrihodi === 0) &&
                    (!finData.vrednostImovine || finData.vrednostImovine === 0)) {
                    usingDefaultValues = true;
                }

                if (usingDefaultValues) {
                    financialData = {
                        poslovniPrihodi: 1000000,
                        vrednostImovine: 5000000,
                        delatnost: finData.delatnost || 'default',
                        stvarnaSteta: finData.stvarnaSteta ?? 0
                    };
                } else {
                    financialData = {
                        poslovniPrihodi: finData.poslovniPrihodi,
                        vrednostImovine: finData.vrednostImovine,
                        delatnost: finData.delatnost || 'default',
                        stvarnaSteta: finData.stvarnaSteta ?? 0
                    };
                }
            } else {
                usingDefaultValues = true;
                financialData = {
                    poslovniPrihodi: 1000000,
                    vrednostImovine: 5000000,
                    delatnost: 'default',
                    stvarnaSteta: 0
                };
            }
        } catch (error) {
            console.warn('Error loading financial data:', error);
            usingDefaultValues = true;
            financialData = {
                poslovniPrihodi: 1000000,
                vrednostImovine: 5000000,
                delatnost: 'default',
                stvarnaSteta: 0
            };
        }

        // Calculate Prilog M data according to SRPS A.L2.003:2025
        const calculatedData = calculatePrilogM(
            dangerLevel,
            params.stepenIzlozenosti,
            params.stepenRanjivosti,
            financialData.stvarnaSteta,
            financialData.poslovniPrihodi,
            financialData.vrednostImovine,
            financialData.delatnost,
            params.kriticnost,
            true
        );

        calculatedData.usingDefaultFinancialData = usingDefaultValues;

        console.log('🔍 Calculation completed for:', riskId, 'with result:', calculatedData);

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

        const newPrilogMData = new Map(prilogMData);
        newPrilogMData.set(riskId, prilogMItem);
        setPrilogMData(newPrilogMData);

        if (onSelectionChange) {
            onSelectionChange(Array.from(newSelections.values()));
        }

        if (onPrilogMUpdate) {
            onPrilogMUpdate(Array.from(newPrilogMData.values()));
        }

        setHasUnsavedChanges(true);
        setPendingRiskData(null);
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            const selectionsToSave = Array.from(selections.values());
            const prilogMToSave = Array.from(prilogMData.values());

            const [selectionResults, prilogMResults] = await Promise.allSettled([
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
                Promise.all(prilogMToSave.map(item =>
                    fetch(`/api/procena/${procenaId}/prilog-m`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item)
                    })
                ))
            ]);

            let hasErrors = false;

            if (selectionResults.status === 'rejected') {
                console.error('Error saving selections:', selectionResults.reason);
                hasErrors = true;
            }

            if (prilogMResults.status === 'rejected') {
                console.error('Error saving Prilog M data:', prilogMResults.reason);
                hasErrors = true;
            }

            if (!hasErrors) {
                setHasUnsavedChanges(false);
                const successDiv = document.createElement('div');
                successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                successDiv.textContent = '✅ Промене су успешно сачуване!';
                document.body.appendChild(successDiv);
                setTimeout(() => document.body.removeChild(successDiv), 3000);
            } else {
                throw new Error('Error saving data');
            }

        } catch (error) {
            console.error('Error saving:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            errorDiv.textContent = '❌ Greška pri čuvanju promena!';
            document.body.appendChild(errorDiv);
            setTimeout(() => document.body.removeChild(errorDiv), 3000);
        } finally {
            setSaving(false);
        }
    };

    return {
        loading,
        saving,
        pendingRiskData,
        setPendingRiskData,
        handleCellClick,
        handleParametersSet,
        handleSaveChanges
    };
}