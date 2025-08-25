"use client";
import React, { useState, useEffect, useMemo } from "react";

interface PrilogSData {
    id: number;
    karakteristika: string;
    vrednost: string;
    grupa: 'pocetno' | 'zavrsno';
}

interface PrilogSTableProps {
    procenaId: string;
    onUpdateItem?: (itemId: number, vrednost: string) => void;
}

export default function PrilogSTable({ procenaId, onUpdateItem }: PrilogSTableProps) {
    const [editingCell, setEditingCell] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [prilogSData, setPrilogSData] = useState<Map<number, PrilogSData>>(new Map());

    // Definišemo sve karakteristike prema slici
    const karakteristike: PrilogSData[] = useMemo(() => [
        // Početno stanje - po izvršenoj proceni rizika (redovi 1-9)
        { id: 1, karakteristika: 'Време идентификације', vrednost: '', grupa: 'pocetno' },
        { id: 2, karakteristika: 'Штићени објекат', vrednost: '', grupa: 'pocetno' },
        { id: 3, karakteristika: 'Макролокација', vrednost: '', grupa: 'pocetno' },
        { id: 4, karakteristika: 'Микролокација', vrednost: '', grupa: 'pocetno' },
        { id: 5, karakteristika: 'Угрожене штићене вредности', vrednost: '', grupa: 'pocetno' },
        { id: 6, karakteristika: 'Величина опасности', vrednost: '', grupa: 'pocetno' },
        { id: 7, karakteristika: 'Предузете почетне мере', vrednost: '', grupa: 'pocetno' },
        { id: 8, karakteristika: 'Вероватна максимална штета (ВМШ)', vrednost: '', grupa: 'pocetno' },
        { id: 9, karakteristika: 'Постојеће мере заштите за ову групу ризика', vrednost: '', grupa: 'pocetno' },

        // Završno stanje - po izvršenom ažurirању (redovi 10-18)
        { id: 10, karakteristika: 'Време идентификације', vrednost: '', grupa: 'zavrsno' },
        { id: 11, karakteristika: 'Штићени објекат', vrednost: '', grupa: 'zavrsno' },
        { id: 12, karakteristika: 'Макролокација', vrednost: '', grupa: 'zavrsno' },
        { id: 13, karakteristika: 'Микролокација', vrednost: '', grupa: 'zavrsno' },
        { id: 14, karakteristika: 'Угрожене штићене вредности', vrednost: '', grupa: 'zavrsno' },
        { id: 15, karakteristika: 'Величина опасности', vrednost: '', grupa: 'zavrsno' },
        { id: 16, karakteristika: 'Предузете почетне мере', vrednost: '', grupa: 'zavrsno' },
        { id: 17, karakteristika: 'Вероватна максимална штета (ВМШ)', vrednost: '', grupa: 'zavrsno' },
        { id: 18, karakteristika: 'Постојеће мере заштите за ову групу ризика', vrednost: '', grupa: 'zavrsno' }
    ], []);

    // Učitaj podatke iz baze
    useEffect(() => {
        async function loadPrilogSData() {
            try {
                const response = await fetch(`/api/procena/${procenaId}/prilog-s`);
                if (response.ok) {
                    const data = await response.json();
                    const dataMap = new Map<number, PrilogSData>();

                    // Prvo dodaj sve karakteristike sa default vrednostima
                    karakteristike.forEach(k => {
                        dataMap.set(k.id, { ...k });
                    });

                    // Zatim ažuriraj sa podacima iz baze
                    data.forEach((item: { item_id: number; vrednost: string }) => {
                        const existing = dataMap.get(item.item_id);
                        if (existing) {
                            dataMap.set(item.item_id, {
                                ...existing,
                                vrednost: item.vrednost || ''
                            });
                        }
                    });

                    setPrilogSData(dataMap);
                } else {
                    throw new Error('Failed to fetch data');
                }
            } catch (error) {
                console.error('Greška pri učitavanju Prilog S podataka:', error);
                // Ako nema podataka u bazi, koristi default karakteristike
                const defaultMap = new Map<number, PrilogSData>();
                karakteristike.forEach(k => defaultMap.set(k.id, k));
                setPrilogSData(defaultMap);
            }
        }

        if (procenaId) {
            loadPrilogSData();
        } else {
            // Ako nema procenaId, učitaj default karakteristike
            const defaultMap = new Map<number, PrilogSData>();
            karakteristike.forEach(k => defaultMap.set(k.id, k));
            setPrilogSData(defaultMap);
        }
    }, [procenaId, karakteristike]);

    const handleCellClick = (itemId: number, currentValue: string) => {
        setEditingCell(itemId);
        setEditValue(currentValue);
    };

    const handleInputBlur = async (itemId: number) => {
        // Ažuriraj lokalno stanje
        setPrilogSData(prev => {
            const newMap = new Map(prev);
            const item = newMap.get(itemId);
            if (item) {
                newMap.set(itemId, { ...item, vrednost: editValue });
            }
            return newMap;
        });

        // Pozovi callback funkciju
        if (onUpdateItem) {
            onUpdateItem(itemId, editValue);
        }

        // Sačuvaj u bazu
        try {
            await fetch(`/api/procena/${procenaId}/prilog-s`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId: itemId,
                    vrednost: editValue
                }),
            });
        } catch (error) {
            console.error('Greška pri čuvanju Prilog S podataka:', error);
        }

        setEditingCell(null);
        setEditValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent, itemId: number) => {
        if (e.key === 'Enter') {
            handleInputBlur(itemId);
        } else if (e.key === 'Escape') {
            setEditingCell(null);
            setEditValue('');
        }
    };

    const pocetnoStanje = Array.from(prilogSData.values()).filter(item => item.grupa === 'pocetno').sort((a, b) => a.id - b.id);
    const zavrsnoStanje = Array.from(prilogSData.values()).filter(item => item.grupa === 'zavrsno').sort((a, b) => a.id - b.id);

    return (
        <div className="p-6 bg-white border-2 border-gray-800 rounded-lg mt-6">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Прилог С</h2>
                <h3 className="text-lg font-bold text-gray-800 mb-2">(нормативан)</h3>
                <h4 className="text-lg font-bold text-gray-800 mb-4">Карактеристике идентификованих ризика</h4>
                <p className="text-xs text-gray-500 text-right">Образац SRPS A.L2.003/3</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-gray-800 text-xs">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-800 px-2 py-2 text-center font-bold text-gray-800" style={{ width: '60px' }}>
                                Р.<br />бр.
                            </th>
                            <th className="border border-gray-800 px-2 py-2 text-center font-bold text-gray-800" style={{ width: '300px' }}>
                                Карактеристике идентификованог<br />ризика
                            </th>
                            <th className="border border-gray-800 px-2 py-2 text-center font-bold text-gray-800">
                                ОПШТИХ ПОСЛОВНИХ<br />АКТИВНОСТИ
                            </th>
                        </tr>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">1</th>
                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">2</th>
                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">3</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Početno stanje */}
                        {pocetnoStanje.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="border border-gray-800 px-2 py-2 text-center font-medium text-gray-800">
                                    {item.id}
                                </td>
                                <td className="border border-gray-800 px-2 py-2 text-xs text-gray-800">
                                    {item.karakteristika}
                                    {index === 0 && (
                                        <div className="mt-2 text-center">
                                            <span className="bg-yellow-200 px-2 py-1 rounded text-xs font-medium">
                                                Почетно стање –<br />по извршеној<br />процени ризика
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="border border-gray-800 px-2 py-2 text-xs text-gray-600">
                                    {editingCell === item.id ? (
                                        <textarea
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => handleInputBlur(item.id)}
                                            onKeyDown={(e) => handleKeyPress(e, item.id)}
                                            className="w-full h-16 text-xs border border-blue-500 rounded p-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            placeholder="Унесите вредност..."
                                            autoFocus
                                        />
                                    ) : (
                                        <div
                                            className="min-h-[40px] cursor-pointer hover:bg-gray-50 p-1 rounded"
                                            onClick={() => handleCellClick(item.id, item.vrednost)}
                                            title="Кликните да унесете вредност"
                                        >
                                            {item.vrednost || (
                                                <span className="text-gray-400 italic">Кликните да унесете...</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {/* Završno stanje */}
                        {zavrsnoStanje.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="border border-gray-800 px-2 py-2 text-center font-medium text-gray-800">
                                    {item.id}
                                </td>
                                <td className="border border-gray-800 px-2 py-2 text-xs text-gray-800">
                                    {item.karakteristika}
                                    {index === 0 && (
                                        <div className="mt-2 text-center">
                                            <span className="bg-blue-200 px-2 py-1 rounded text-xs font-medium">
                                                Завршно стање –<br />по извршеном<br />ажурирању
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="border border-gray-800 px-2 py-2 text-xs text-gray-600">
                                    {editingCell === item.id ? (
                                        <textarea
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => handleInputBlur(item.id)}
                                            onKeyDown={(e) => handleKeyPress(e, item.id)}
                                            className="w-full h-16 text-xs border border-blue-500 rounded p-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            placeholder="Унесите вредност..."
                                            autoFocus
                                        />
                                    ) : (
                                        <div
                                            className="min-h-[40px] cursor-pointer hover:bg-gray-50 p-1 rounded"
                                            onClick={() => handleCellClick(item.id, item.vrednost)}
                                            title="Кликните да унесете вредност"
                                        >
                                            {item.vrednost || (
                                                <span className="text-gray-400 italic">Кликните да унесете...</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Napomene */}
            <div className="mt-6 text-xs text-gray-600">
                <div className="mb-2">
                    <strong>НАПОМЕНА 1:</strong> Образац се користи као прилог Акту о процени ризика у заштити лица имовине и пословања.
                </div>
                <div>
                    <strong>НАПОМЕНА 2:</strong> Наведени подаци морају да буду уписани у Дигитални регистар процена ризика.
                </div>
            </div>
        </div>
    );
}