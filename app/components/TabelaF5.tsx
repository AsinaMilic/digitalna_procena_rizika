"use client";
import React, { useState, useEffect, useMemo } from "react";

interface TabelaF5Data {
    id: number;
    grupa: string;
    mera: string;
    opisIObrazlozenje: string;
}

interface TabelaF5Props {
    procenaId: string;
    onUpdateItem?: (itemId: number, field: 'mera' | 'opisIObrazlozenje', value: string) => void;
    readOnly?: boolean;
}

export default function TabelaF5({ procenaId, onUpdateItem, readOnly = false }: TabelaF5Props) {
    const [editingCell, setEditingCell] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [tabelaF5Data, setTabelaF5Data] = useState<Map<number, TabelaF5Data>>(new Map());

    // Definišemo sve grupe rizika i mere prema slici
    const defaultMere: TabelaF5Data[] = useMemo(() => [
        // RIZICI OPŠTIH POSLOVNIH AKTIVNOSTI
        { id: 1, grupa: 'РИЗИЦИ ОПШТИХ ПОСЛОВНИХ АКТИВНОСТИ', mera: '', opisIObrazlozenje: '' },
        { id: 2, grupa: 'РИЗИЦИ ОПШТИХ ПОСЛОВНИХ АКТИВНОСТИ', mera: '', opisIObrazlozenje: '' },
        
        // RIZICI PO BEZBEDNOST I ZDRAVLJE NA RADU
        { id: 3, grupa: 'РИЗИЦИ ПО БЕЗБЕДНОСТ И ЗДРАВЉЕ НА РАДУ', mera: '', opisIObrazlozenje: '' },
        { id: 4, grupa: 'РИЗИЦИ ПО БЕЗБЕДНОСТ И ЗДРАВЉЕ НА РАДУ', mera: '', opisIObrazlozenje: '' },
        
        // PRAVNI RIZICI
        { id: 5, grupa: 'ПРАВНИ РИЗИЦИ', mera: '', opisIObrazlozenje: '' },
        { id: 6, grupa: 'ПРАВНИ РИЗИЦИ', mera: '', opisIObrazlozenje: '' },
        
        // RIZICI OD PROTIVPRAVNOG DELOVANJA
        { id: 7, grupa: 'РИЗИЦИ ОД ПРОТИВПРАВНОГ ДЕЛОВАЊА', mera: 'А.1 а) контрола приступа објекту и деловима објекта', opisIObrazlozenje: 'На главном улазу у објекат урадити 125 КХ1 портних семафора (онлајн и офлајн) за контролу приступа и свидењију радног времена (контролна јединица управљача), за 5.000 корисника и капацитет од око 25.000 догађаја у офлајн режиму...' },
        { id: 8, grupa: 'РИЗИЦИ ОД ПРОТИВПРАВНОГ ДЕЛОВАЊА', mera: 'А.1 б) контрола понашања и кретања у штићеном простору и објекту', opisIObrazlozenje: 'На стражарско место – главни улаз у објекат, пред постојећи 1 службеника обезбеђења у смени од 8 ч, увести још једног службеника обезбеђења у смени од 24 ч, који ће повремено вршити обилазак круг штићеног објекта...' },
        
        // RIZICI OD POŽARA
        { id: 9, grupa: 'РИЗИЦИ ОД ПОЖАРА', mera: '', opisIObrazlozenje: '' },
        { id: 10, grupa: 'РИЗИЦИ ОД ПОЖАРА', mera: '', opisIObrazlozenje: '' },
        
        // RIZICI OD ELEMENTARNIH NEPOGODA I DRUGIH NESREĆA
        { id: 11, grupa: 'РИЗИЦИ ОД ЕЛЕМЕНТАРНИХ НЕПОГОДА И ДРУГИХ НЕСРЕЋА', mera: '', opisIObrazlozenje: '' },
        { id: 12, grupa: 'РИЗИЦИ ОД ЕЛЕМЕНТАРНИХ НЕПОГОДА И ДРУГИХ НЕСРЕЋА', mera: '', opisIObrazlozenje: '' },
        
        // RIZICI OD NEUSAGLAŠENOSTI SA STANDARDIMA
        { id: 13, grupa: 'РИЗИЦИ ОД НЕУСАГЛАШЕНОСТИ СА СТАНДАРДИМА', mera: '', opisIObrazlozenje: '' },
        { id: 14, grupa: 'РИЗИЦИ ОД НЕУСАГЛАШЕНОСТИ СА СТАНДАРДИМА', mera: '', opisIObrazlozenje: '' },
        
        // RIZICI OD EKSPLOZIJA
        { id: 15, grupa: 'РИЗИЦИ ОД ЕКСПЛОЗИЈА', mera: '', opisIObrazlozenje: '' },
        { id: 16, grupa: 'РИЗИЦИ ОД ЕКСПЛОЗИЈА', mera: '', opisIObrazlozenje: '' },
        
        // RIZICI PO ŽIVOTNU SREDINU
        { id: 17, grupa: 'РИЗИЦИ ПО ЖИВОТНУ СРЕДИНУ', mera: '', opisIObrazlozenje: '' },
        { id: 18, grupa: 'РИЗИЦИ ПО ŽIVOTНУ СРЕДИНУ', mera: '', opisIObrazlozenje: '' },
        
        // RIZICI U UPRAVLJANJU LJUDSKIM RESURSIMA
        { id: 19, grupa: 'РИЗИЦИ У УПРАВЉАЊУ ЉУДСКИМ РЕСУРСИМА', mera: '', opisIObrazlozenje: '' },
        { id: 20, grupa: 'РИЗИЦИ У УПРАВЉАЊУ ЉУДСКИМ РЕСУРСИМА', mera: '', opisIObrazlozenje: '' },
        
        // RIZICI U OBLASTI IKT SISTEMA
        { id: 21, grupa: 'РИЗИЦИ У ОБЛАСТИ ИКТ СИСТЕМА', mera: '', opisIObrazlozenje: '' },
        { id: 22, grupa: 'РИЗИЦИ У ОБЛАСТИ ИКТ СИСТЕМА', mera: '', opisIObrazlozenje: '' }
    ], []);

    // Učitaj podatke iz baze
    useEffect(() => {
        async function loadTabelaF5Data() {
            try {
                const response = await fetch(`/api/procena/${procenaId}/tabela-f5`);
                if (response.ok) {
                    const data = await response.json();
                    const dataMap = new Map<number, TabelaF5Data>();
                    
                    // Prvo dodaj sve default mere
                    defaultMere.forEach(m => {
                        dataMap.set(m.id, { ...m });
                    });
                    
                    // Zatim ažuriraj sa podacima iz baze
                    data.forEach((item: { item_id: number; mera: string; opis_i_obrazlozenje: string }) => {
                        const existing = dataMap.get(item.item_id);
                        if (existing) {
                            dataMap.set(item.item_id, {
                                ...existing,
                                mera: item.mera || existing.mera,
                                opisIObrazlozenje: item.opis_i_obrazlozenje || existing.opisIObrazlozenje
                            });
                        }
                    });
                    
                    setTabelaF5Data(dataMap);
                } else {
                    throw new Error('Failed to fetch data');
                }
            } catch (error) {
                console.error('Greška pri učitavanju Tabela F.5 podataka:', error);
                // Ako nema podataka u bazi, koristi default mere
                const defaultMap = new Map<number, TabelaF5Data>();
                defaultMere.forEach(m => defaultMap.set(m.id, m));
                setTabelaF5Data(defaultMap);
            }
        }

        if (procenaId) {
            loadTabelaF5Data();
        } else {
            // Ako nema procenaId, učitaj default mere
            const defaultMap = new Map<number, TabelaF5Data>();
            defaultMere.forEach(m => defaultMap.set(m.id, m));
            setTabelaF5Data(defaultMap);
        }
    }, [procenaId, defaultMere]);

    const handleCellClick = (itemId: number, field: 'mera' | 'opisIObrazlozenje', currentValue: string) => {
        if (readOnly) return; // Disable editing in read-only mode
        
        const cellKey = `${itemId}-${field}`;
        setEditingCell(cellKey);
        setEditValue(currentValue);
    };

    const handleInputBlur = async (itemId: number, field: 'mera' | 'opisIObrazlozenje') => {
        // Ažuriraj lokalno stanje
        setTabelaF5Data(prev => {
            const newMap = new Map(prev);
            const item = newMap.get(itemId);
            if (item) {
                newMap.set(itemId, { 
                    ...item, 
                    [field]: editValue 
                });
            }
            return newMap;
        });

        // Pozovi callback funkciju
        if (onUpdateItem) {
            onUpdateItem(itemId, field, editValue);
        }

        // Sačuvaj u bazu
        try {
            await fetch(`/api/procena/${procenaId}/tabela-f5`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId: itemId,
                    field: field,
                    value: editValue
                }),
            });
        } catch (error) {
            console.error('Greška pri čuvanju Tabela F.5 podataka:', error);
        }

        setEditingCell(null);
        setEditValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent, itemId: number, field: 'mera' | 'opisIObrazlozenje') => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleInputBlur(itemId, field);
        } else if (e.key === 'Escape') {
            setEditingCell(null);
            setEditValue('');
        }
    };

    // Grupiši podatke po grupama
    const groupedData = useMemo(() => {
        const groups = new Map<string, TabelaF5Data[]>();
        Array.from(tabelaF5Data.values()).forEach(item => {
            if (!groups.has(item.grupa)) {
                groups.set(item.grupa, []);
            }
            groups.get(item.grupa)!.push(item);
        });
        return groups;
    }, [tabelaF5Data]);

    return (
        <div className="p-6 bg-white border-2 border-gray-800 rounded-lg mt-6">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Табела Ф.5 – Мере за поступање са ризицима</h2>
                <p className="text-xs text-gray-500 text-right">SRPS A.L2.003:2025</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-gray-800 text-xs">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-800 px-2 py-2 text-center font-bold text-gray-800" style={{ width: '40%' }}>
                                МЕРА
                            </th>
                            <th className="border border-gray-800 px-2 py-2 text-center font-bold text-gray-800" style={{ width: '60%' }}>
                                ОПИС И ОБРАЗЛОЖЕЊЕ
                            </th>
                        </tr>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">1</th>
                            <th className="border border-gray-800 px-1 py-1 text-center text-xs font-medium text-gray-600">2</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from(groupedData.entries()).map(([grupa, items]) => (
                            <React.Fragment key={grupa}>
                                {/* Zaglavlje grupe */}
                                <tr>
                                    <td colSpan={2} className="border border-gray-800 px-2 py-2 bg-gray-300 font-bold text-center text-xs text-gray-800">
                                        {grupa}
                                    </td>
                                </tr>
                                
                                {/* Stavke grupe */}
                                {items.sort((a, b) => a.id - b.id).map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="border border-gray-800 px-2 py-2 text-xs text-gray-800 align-top">
                                            {editingCell === `${item.id}-mera` && !readOnly ? (
                                                <textarea
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={() => handleInputBlur(item.id, 'mera')}
                                                    onKeyDown={(e) => handleKeyPress(e, item.id, 'mera')}
                                                    className="w-full h-20 text-xs border border-blue-500 rounded p-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                    placeholder="Унесите меру..."
                                                    autoFocus
                                                />
                                            ) : (
                                                <div
                                                    className={`min-h-[40px] p-1 rounded ${readOnly ? '' : 'cursor-pointer hover:bg-gray-50'}`}
                                                    onClick={() => handleCellClick(item.id, 'mera', item.mera)}
                                                    title={readOnly ? 'Режим прегледа - измене нису дозвољене' : 'Кликните да унесете меру'}
                                                >
                                                    {item.mera || (
                                                        <span className="text-gray-400 italic">{readOnly ? 'Нема података' : 'Кликните да унесете меру...'}</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="border border-gray-800 px-2 py-2 text-xs text-gray-800 align-top">
                                            {editingCell === `${item.id}-opisIObrazlozenje` && !readOnly ? (
                                                <textarea
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={() => handleInputBlur(item.id, 'opisIObrazlozenje')}
                                                    onKeyDown={(e) => handleKeyPress(e, item.id, 'opisIObrazlozenje')}
                                                    className="w-full h-32 text-xs border border-blue-500 rounded p-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                    placeholder="Унесите опис и образложење..."
                                                    autoFocus
                                                />
                                            ) : (
                                                <div
                                                    className={`min-h-[60px] p-1 rounded ${readOnly ? '' : 'cursor-pointer hover:bg-gray-50'}`}
                                                    onClick={() => handleCellClick(item.id, 'opisIObrazlozenje', item.opisIObrazlozenje)}
                                                    title={readOnly ? 'Режим прегледа - измене нису дозвољене' : 'Кликните да унесете опис и образложење'}
                                                >
                                                    {item.opisIObrazlozenje || (
                                                        <span className="text-gray-400 italic">{readOnly ? 'Нема података' : 'Кликните да унесете опис и образложење...'}</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Napomene */}
            <div className="mt-6 text-xs text-gray-600">
                <div className="mb-2">
                    <strong>НАПОМЕНА:</strong> Детаљно образложење према критеријумима у тачки 6.4
                </div>
                <div>
                    <strong>ПРИМЕР:</strong> Приказ примене метода вредновања ризика у Прилогу П, табела П.1 и табела П.2
                </div>
            </div>
        </div>
    );
}