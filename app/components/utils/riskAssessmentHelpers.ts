interface RiskSelection {
    risk_id: string;
    danger_level: number;
    description: string;
}

export function getCellClass(
    riskId: string, 
    level: number, 
    hasContent: boolean, 
    selections: Map<string, RiskSelection>
) {
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
}