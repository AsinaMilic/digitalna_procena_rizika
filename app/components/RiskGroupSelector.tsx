"use client";
import { useState } from "react";
import { RISK_GROUPS } from "../data/riskGroups";

interface RiskGroupSelectorProps {
    onGroupSelect: (groupId: string) => void;
    selectedGroup?: string;
}

export default function RiskGroupSelector({ onGroupSelect, selectedGroup }: RiskGroupSelectorProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-100 mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">
                Изаберите групу ризика
            </h2>
            <p className="text-blue-600 text-center mb-6">
                Кликните на групу ризика за коју желите да извршите процену
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {RISK_GROUPS.map((group) => (
                    <button
                        key={group.id}
                        onClick={() => onGroupSelect(group.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 text-left ${
                            selectedGroup === group.id
                                ? "border-blue-500 bg-blue-50 shadow-lg"
                                : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                        }`}
                    >
                        <h3 className="font-bold text-lg text-black mb-2">
                            {group.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                            {group.description}
                        </p>
                    </button>
                ))}
            </div>
            
            {selectedGroup && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-800 text-center font-medium">
                        ✓ Изабрана је {RISK_GROUPS.find(g => g.id === selectedGroup)?.name} - {RISK_GROUPS.find(g => g.id === selectedGroup)?.description}
                    </p>
                </div>
            )}
        </div>
    );
}