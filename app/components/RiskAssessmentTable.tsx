"use client";
import { useState, useEffect } from "react";
import { RiskGroupData } from "../data/riskGroups";
import { PrilogMData } from "../data/riskDataLoader";
import { useRiskAssessmentData } from "./hooks/useRiskAssessmentData";
import { useRiskAssessmentActions } from "./hooks/useRiskAssessmentActions";
import { getCellClass } from "./utils/riskAssessmentHelpers";
import RiskAssessmentContent from "./RiskAssessmentContent";

interface RiskSelection {
    risk_id: string;
    danger_level: number;
    description: string;
}

interface RiskAssessmentTableProps {
    procenaId: string;
    riskGroupData: RiskGroupData;
    allPrilogMData?: Map<string, PrilogMData[]>; // Dodaj sve podatke kao prop
    onSelectionChange?: (selections: RiskSelection[]) => void;
    onPrilogMUpdate?: (prilogMData: PrilogMData[]) => void;
    onUnsavedChanges?: (hasUnsaved: boolean) => void;
}



export default function RiskAssessmentTable({ procenaId, riskGroupData, allPrilogMData, onSelectionChange, onPrilogMUpdate, onUnsavedChanges }: RiskAssessmentTableProps) {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Use custom hooks for data management
    const {
        selections,
        setSelections,
        prilogMData,
        setPrilogMData,
        initialLoading,
        hasValidFinancialData,
        setHasValidFinancialData,
        currentFinancialData,
        setCurrentFinancialData
    } = useRiskAssessmentData(procenaId, riskGroupData, onSelectionChange, onPrilogMUpdate, allPrilogMData);

    // Use custom hook for actions
    const {
        loading,
        saving,
        pendingRiskData,
        setPendingRiskData,
        handleCellClick,
        handleParametersSet,
        handleSaveChanges
    } = useRiskAssessmentActions({
        procenaId,
        riskGroupData,
        selections,
        setSelections,
        prilogMData,
        setPrilogMData,
        onSelectionChange,
        onPrilogMUpdate,
        setHasUnsavedChanges
    });



    // Notify parent component about unsaved changes
    useEffect(() => {
        if (onUnsavedChanges) {
            onUnsavedChanges(hasUnsavedChanges);
        }
    }, [hasUnsavedChanges, onUnsavedChanges]);

    // Reset unsaved changes when component mounts (new group)
    useEffect(() => {
        setHasUnsavedChanges(false);
    }, [riskGroupData.id]);

    // Create getCellClass function with current selections
    const getCellClassWithSelections = (riskId: string, level: number, hasContent: boolean) => {
        return getCellClass(riskId, level, hasContent, selections);
    };

    const handlePrilogMItemUpdate = (itemId: string, field: 'posledice' | 'steta', value: number) => {
        setPrilogMData(prevData => {
            const newData = new Map(prevData);
            const item = newData.get(itemId);
            if (item) {
                const updatedItem = { ...item, [field]: value };
                newData.set(itemId, updatedItem);
            }
            return newData;
        });
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
        <RiskAssessmentContent
            key={`${procenaId}-${riskGroupData.id}-${selections.size}`} // Force re-render when selections change
            procenaId={procenaId}
            riskGroupData={riskGroupData}
            selections={selections}
            prilogMData={prilogMData}
            hasUnsavedChanges={hasUnsavedChanges}
            saving={saving}
            loading={loading}
            hasValidFinancialData={hasValidFinancialData}
            currentFinancialData={currentFinancialData}
            setCurrentFinancialData={setCurrentFinancialData}
            setHasValidFinancialData={setHasValidFinancialData}
            pendingRiskData={pendingRiskData}
            setPendingRiskData={setPendingRiskData}
            onCellClick={handleCellClick}
            onParametersSet={handleParametersSet}
            onSaveChanges={handleSaveChanges}
            getCellClass={getCellClassWithSelections}
            onPrilogMUpdate={handlePrilogMItemUpdate}
        />
    );
}