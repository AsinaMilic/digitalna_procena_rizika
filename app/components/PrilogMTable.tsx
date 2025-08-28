"use client";
import { useState } from "react";
import { PrilogMData } from "../data/riskDataLoader";
import Image from "next/image";

interface PrilogMTableProps {
    prilogMData: Map<string, PrilogMData>;
    onShowDetails: (item: PrilogMData) => void;
    onUpdateItem?: (itemId: string, field: 'posledice' | 'steta', value: number) => void;
    readOnly?: boolean;
}

export default function PrilogMTable({ prilogMData, onShowDetails, onUpdateItem, readOnly = false }: PrilogMTableProps) {
    const [editingCell, setEditingCell] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [showImageModal, setShowImageModal] = useState<string | null>(null);

    // Mapiranje kolona na slike
    const columnImages: { [key: string]: { src: string; title: string } } = {
        'vo': { src: '/images/vo-scale.png', title: 'Величина опасности - скала вредности' },
        'izl': { src: '/images/izl-scale.png', title: 'Изложеност - скала вредности' },
        'ranj': { src: '/images/ranj-scale.png', title: 'Рањивост - скала вредности' },
        'ver': { src: '/images/ver-scale.png', title: 'Вероватноћа - скала вредности' },
        'posl': { src: '/images/posl-scale.png', title: 'Последице - скала вредности' },
        'stet': { src: '/images/stet-scale.png', title: 'Штета - скала вредности' },
        'krit': { src: '/images/krit-scale.png', title: 'Критичност - скала вредности' },
        'nivo': { src: '/images/nivo-scale.png', title: 'Ниво ризика - скала вредности' },
        'kat': { src: '/images/kat-scale.png', title: 'Категорија ризика - скала вредности' },
        'prihv': { src: '/images/prihv-scale.png', title: 'Прихватљивост - скала вредности' }
    };

    if (prilogMData.size === 0) {
        return null;
    }

    const handleCellClick = (itemId: string, field: 'posledice' | 'steta', currentValue: number | null) => {
        if (readOnly) return; // Disable editing in read-only mode
        
        const cellKey = `${itemId}-${field}`;
        setEditingCell(cellKey);
        setEditValue(currentValue?.toString() || '');
    };

    const handleInputChange = (value: string) => {
        // Dozvoli samo brojeve 1-5
        if (value === '' || (/^[1-5]$/.test(value))) {
            setEditValue(value);
        }
    };

    const handleInputBlur = (itemId: string, field: 'posledice' | 'steta') => {
        const numValue = parseInt(editValue);
        if (numValue >= 1 && numValue <= 5 && onUpdateItem) {
            onUpdateItem(itemId, field, numValue);
        }
        setEditingCell(null);
        setEditValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent, itemId: string, field: 'posledice' | 'steta') => {
        if (e.key === 'Enter') {
            handleInputBlur(itemId, field);
        } else if (e.key === 'Escape') {
            setEditingCell(null);
            setEditValue('');
        }
    };

    return (
        <div className="p-6 bg-white border-2 border-gray-800 rounded-lg">
            <h2 className="font-bold text-gray-800 mb-6 text-center text-lg">
                Прилoг М
            </h2>
            <h4 className="font-bold text-gray-800 mb-6 text-center text-lg">
                НИВО АГРЕГАТНОГ РИЗИКА, КАТЕГОРИЈА И ПРИХВАТЉИВОСТИ РИЗИКА
            </h4>
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
                            <th
                                className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800 cursor-pointer hover:bg-gray-300 transition-colors"
                                style={{ width: '50px' }}
                                onClick={() => setShowImageModal('vo')}
                                title="Кликните да видите скалу вредности"
                            >
                                ВО
                            </th>
                            <th
                                className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800 cursor-pointer hover:bg-gray-300 transition-colors"
                                style={{ width: '50px' }}
                                onClick={() => setShowImageModal('izl')}
                                title="Кликните да видите скалу вредности"
                            >
                                Изл.
                            </th>
                            <th
                                className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800 cursor-pointer hover:bg-gray-300 transition-colors"
                                style={{ width: '50px' }}
                                onClick={() => setShowImageModal('ranj')}
                                title="Кликните да видите скалу вредности"
                            >
                                Рањ.
                            </th>
                            <th
                                className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800 cursor-pointer hover:bg-gray-300 transition-colors"
                                style={{ width: '50px' }}
                                onClick={() => setShowImageModal('ver')}
                                title="Кликните да видите скалу вредности"
                            >
                                Вер.
                            </th>
                            <th
                                className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800 cursor-pointer hover:bg-gray-300 transition-colors"
                                style={{ width: '50px' }}
                                onClick={() => setShowImageModal('posl')}
                                title="Кликните да видите скалу вредности"
                            >
                                Посл.
                            </th>
                            <th
                                className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800 cursor-pointer hover:bg-gray-300 transition-colors"
                                style={{ width: '50px' }}
                                onClick={() => setShowImageModal('stet')}
                                title="Кликните да видите скалу вредности"
                            >
                                Штет.
                            </th>
                            <th
                                className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800 cursor-pointer hover:bg-gray-300 transition-colors"
                                style={{ width: '50px' }}
                                onClick={() => setShowImageModal('krit')}
                                title="Кликните да видите скалу вредности"
                            >
                                Крит.
                            </th>
                            <th
                                className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800 cursor-pointer hover:bg-gray-300 transition-colors"
                                style={{ width: '60px' }}
                                onClick={() => setShowImageModal('nivo')}
                                title="Кликните да видите скалу вредности"
                            >
                                Ниво<br />риз.
                            </th>
                            <th
                                className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800 cursor-pointer hover:bg-gray-300 transition-colors"
                                style={{ width: '70px' }}
                                onClick={() => setShowImageModal('kat')}
                                title="Кликните да видите скалу вредности"
                            >
                                Кат.<br />риз.
                            </th>
                            <th
                                className="border border-gray-800 px-1 py-2 text-center font-bold text-gray-800 cursor-pointer hover:bg-gray-300 transition-colors"
                                style={{ width: '80px' }}
                                onClick={() => setShowImageModal('prihv')}
                                title="Кликните да видите скалу вредности"
                            >
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
                                        {editingCell === `${item.id}-posledice` ? (
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => handleInputChange(e.target.value)}
                                                onBlur={() => handleInputBlur(item.id, 'posledice')}
                                                onKeyDown={(e) => handleKeyPress(e, item.id, 'posledice')}
                                                className="w-6 h-6 text-center text-xs border-2 border-blue-500 rounded bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                maxLength={1}
                                                autoFocus
                                            />
                                        ) : (
                                            <span
                                                className={`inline-block w-6 h-6 rounded-full text-white font-bold text-xs leading-6 ${readOnly ? '' : 'cursor-pointer hover:opacity-80'} ${(item.posledice || 0) >= 4 ? 'bg-red-600' :
                                                    (item.posledice || 0) === 3 ? 'bg-yellow-600' :
                                                        (item.posledice || 0) === 2 ? 'bg-blue-600' :
                                                            'bg-green-600'
                                                    }`}
                                                onClick={() => handleCellClick(item.id, 'posledice', item.posledice)}
                                                title={readOnly ? 'Режим прегледа - измене нису дозвољене' : 'Кликните да измените вредност (1-5)'}
                                            >
                                                {item.posledice || 0}
                                            </span>
                                        )}
                                    </td>
                                    <td className="border border-gray-800 px-1 py-2 text-center">
                                        {editingCell === `${item.id}-steta` ? (
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => handleInputChange(e.target.value)}
                                                onBlur={() => handleInputBlur(item.id, 'steta')}
                                                onKeyDown={(e) => handleKeyPress(e, item.id, 'steta')}
                                                className="w-6 h-6 text-center text-xs border-2 border-blue-500 rounded bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                maxLength={1}
                                                autoFocus
                                            />
                                        ) : (
                                            <span
                                                className={`inline-block w-6 h-6 rounded-full text-white font-bold text-xs leading-6 ${readOnly ? '' : 'cursor-pointer hover:opacity-80'} ${(item.steta || 0) >= 4 ? 'bg-red-600' :
                                                    (item.steta || 0) === 3 ? 'bg-yellow-600' :
                                                        (item.steta || 0) === 2 ? 'bg-blue-600' :
                                                            'bg-green-600'
                                                    }`}
                                                onClick={() => handleCellClick(item.id, 'steta', item.steta)}
                                                title={readOnly ? 'Режим прегледа - измене нису дозвољене' : 'Кликните да измените вредност (1-5)'}
                                            >
                                                {item.steta || 0}
                                            </span>
                                        )}
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

            {/* Modal za prikaz slika */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowImageModal(null)}>
                    <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                {columnImages[showImageModal]?.title}
                            </h3>
                            <button
                                onClick={() => setShowImageModal(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <div className="flex justify-center">
                            <Image
                                src={columnImages[showImageModal]?.src || ''}
                                alt={columnImages[showImageModal]?.title || ''}
                                width={800}
                                height={600}
                                className="max-w-full h-auto"
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}