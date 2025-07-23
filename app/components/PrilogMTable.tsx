"use client";
import { PrilogMData } from "../data/riskDataLoader";

interface PrilogMTableProps {
    prilogMData: Map<string, PrilogMData>;
    onShowDetails: (item: PrilogMData) => void;
}

export default function PrilogMTable({ prilogMData, onShowDetails }: PrilogMTableProps) {
    if (prilogMData.size === 0) {
        return null;
    }

    return (
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
                            <th className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800" style={{ width: '60px' }}>
                                Детаљи
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
                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">13</th>
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
                                                (item.velicinaOpasnosti || 0) === 2 ? 'bg-blue-600' :
                                                    'bg-green-600'
                                            }`}>
                                            {item.velicinaOpasnosti || 0}
                                        </span>
                                    </td>
                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                        <span className={`inline-block w-6 h-6 rounded-full text-white font-bold text-xs leading-6 ${(item.izlozenost || 0) >= 4 ? 'bg-red-600' :
                                            (item.izlozenost || 0) === 3 ? 'bg-yellow-600' :
                                                (item.izlozenost || 0) === 2 ? 'bg-blue-600' :
                                                    'bg-green-600'
                                            }`}>
                                            {item.izlozenost || 0}
                                        </span>
                                    </td>
                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                        <span className={`inline-block w-6 h-6 rounded-full text-white font-bold text-xs leading-6 ${(item.ranjivost || 0) >= 4 ? 'bg-red-600' :
                                            (item.ranjivost || 0) === 3 ? 'bg-yellow-600' :
                                                (item.ranjivost || 0) === 2 ? 'bg-blue-600' :
                                                    'bg-green-600'
                                            }`}>
                                            {item.ranjivost || 0}
                                        </span>
                                    </td>
                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                        <span className={`inline-block w-6 h-6 rounded-full text-white font-bold text-xs leading-6 ${(item.verovatnoca || 0) >= 4 ? 'bg-red-600' :
                                            (item.verovatnoca || 0) === 3 ? 'bg-yellow-600' :
                                                (item.verovatnoca || 0) === 2 ? 'bg-blue-600' :
                                                    'bg-green-600'
                                            }`}>
                                            {item.verovatnoca || 0}
                                        </span>
                                    </td>
                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                        <span className={`inline-block w-6 h-6 rounded-full text-white font-bold text-xs leading-6 ${(item.posledice || 0) >= 4 ? 'bg-red-600' :
                                            (item.posledice || 0) === 3 ? 'bg-yellow-600' :
                                                (item.posledice || 0) === 2 ? 'bg-blue-600' :
                                                    'bg-green-600'
                                            }`}>
                                            {item.posledice || 0}
                                        </span>
                                    </td>
                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                        <span className={`inline-block w-6 h-6 rounded-full text-white font-bold text-xs leading-6 ${(item.steta || 0) >= 4 ? 'bg-red-600' :
                                            (item.steta || 0) === 3 ? 'bg-yellow-600' :
                                                (item.steta || 0) === 2 ? 'bg-blue-600' :
                                                    'bg-green-600'
                                            }`}>
                                            {item.steta || 0}
                                        </span>
                                    </td>
                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                        <span className={`inline-block w-6 h-6 rounded-full text-white font-bold text-xs leading-6 ${(item.kriticnost || 0) >= 4 ? 'bg-red-600' :
                                            (item.kriticnost || 0) === 3 ? 'bg-yellow-600' :
                                                (item.kriticnost || 0) === 2 ? 'bg-blue-600' :
                                                    'bg-green-600'
                                            }`}>
                                            {item.kriticnost || 0}
                                        </span>
                                    </td>
                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                        <span className={`inline-block px-2 py-1 rounded text-white font-bold text-xs ${(item.nivoRizika || 0) >= 20 ? 'bg-red-700' :
                                            (item.nivoRizika || 0) >= 15 ? 'bg-red-600' :
                                                (item.nivoRizika || 0) >= 10 ? 'bg-orange-600' :
                                                    (item.nivoRizika || 0) >= 6 ? 'bg-yellow-600' :
                                                        'bg-green-600'
                                            }`}>
                                            {item.nivoRizika || 0}
                                        </span>
                                    </td>
                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                        <span className={`inline-block px-2 py-1 rounded text-white font-bold text-xs ${item.kategorijaRizika === 1 ? 'bg-red-700' :
                                            item.kategorijaRizika === 2 ? 'bg-orange-600' :
                                                item.kategorijaRizika === 3 ? 'bg-yellow-600' :
                                                    item.kategorijaRizika === 4 ? 'bg-blue-600' :
                                                        'bg-green-600'
                                            }`}>
                                            {item.kategorijaRizika || 5}
                                        </span>
                                    </td>
                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`inline-block px-2 py-1 rounded text-white font-bold text-xs ${item.prihvatljivost === 'NEPRIHVATLJIV' ? 'bg-red-600' : 'bg-green-600'
                                                }`}>
                                                {item.prihvatljivost === 'NEPRIHVATLJIV' ? 'NE' : 'DA'}
                                            </span>
                                            {item.usingDefaultFinancialData && (
                                                <span className="text-orange-600 text-xs mt-1" title="Koriste se default finansijski podaci - rezultat može biti netačan">
                                                    ⚠️
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                        <button
                                            onClick={() => onShowDetails(item)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded"
                                            title="Prikaži detaljne kalkulacije"
                                        >
                                            📊
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}