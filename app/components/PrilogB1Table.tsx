"use client";
import React, { useState, useEffect, useMemo } from "react";

interface PrilogB1Data {
    id?: number;
    groupId: number;
    groupName: string;
    uticaj: number;
    iud: number | null;
    vk: number | null;
    k: number | null;
}

interface PrilogB1TableProps {
    procenaId: string;
    readOnly?: boolean;
}

const RISK_GROUPS: { [key: number]: string } = {
    1: 'ОПШТЕ ПОСЛОВНЕ АКТИВНОСТИ',
    2: 'БЕЗБЕДНОСТ И ЗДРАВЉЕ НА РАДУ',
    3: 'ПРАВНИ РИЗИЦИ',
    4: 'РИЗИЦИ ОД ПРОТИВПРАВНОГ ДЕЛОВАЊА',
    5: 'РИЗИЦИ ОД ПОЖАРА',
    6: 'РИЗИЦИ ОД ЕЛЕМЕНТАРНИХ НЕПОГОДА И ДРУГИХ НЕСРЕЋА',
    7: 'РИЗИЦИ ОД ЕКСПЛОЗИЈЕ',
    8: 'РИЗИЦИ ОД НЕПРИМЕНЕ СТАНДАРДА',
    9: 'РИЗИЦИ ПО ЖИВОТНУ СРЕДИНУ',
    10: 'РИЗИЦИ У УПРАВЉАЊУ ЉУДСКИМ РЕСУРСИМА',
    11: 'ИКТ РИЗИЦИ (заштита података)'
};

export default function PrilogB1Table({ procenaId, readOnly = false }: PrilogB1TableProps) {
    const [data, setData] = useState<PrilogB1Data[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Initialize data
    useEffect(() => {
        const initialData: PrilogB1Data[] = [];
        Object.keys(RISK_GROUPS).forEach((key) => {
            const id = parseInt(key);
            initialData.push({
                groupId: id,
                groupName: RISK_GROUPS[id],
                uticaj: 0,
                iud: null,
                vk: null,
                k: null
            });
        });

        const fetchData = async () => {
            try {
                const response = await fetch(`/api/procena/${procenaId}/prilog-b1`);
                if (response.ok) {
                    const savedData = await response.json();
                    // Merge saved data
                    savedData.forEach((item: any) => {
                        const index = initialData.findIndex(d => d.groupId === item.group_id);
                        if (index !== -1) {
                            initialData[index] = {
                                ...initialData[index],
                                id: item.id,
                                uticaj: parseFloat(item.uticaj),
                                iud: parseFloat(item.iud),
                                vk: item.vk,
                                k: item.k
                            };
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setData(initialData);
                setLoading(false);
            }
        };

        if (procenaId) {
            fetchData();
        }
    }, [procenaId]);

    const handleCellClick = (groupId: number, currentValue: number) => {
        if (readOnly) return;
        setEditingId(groupId);
        setEditValue(currentValue.toString());
    };

    const handleInputBlur = async (groupId: number) => {
        const newValue = parseFloat(editValue) || 0;

        // Update local state temporarily for responsiveness
        setData(prev => prev.map(item =>
            item.groupId === groupId ? { ...item, uticaj: newValue } : item
        ));

        try {
            const response = await fetch(`/api/procena/${procenaId}/prilog-b1`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId, uticaj: newValue })
            });

            if (response.ok) {
                const result = await response.json();
                // Update with server calculated values
                setData(prev => prev.map(item =>
                    item.groupId === groupId ? {
                        ...item,
                        uticaj: newValue,
                        iud: result.iud,
                        vk: result.vk,
                        k: result.k
                    } : item
                ));
            }
        } catch (error) {
            console.error('Error saving data:', error);
        }

        setEditingId(null);
        setEditValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent, groupId: number) => {
        if (e.key === 'Enter') handleInputBlur(groupId);
        if (e.key === 'Escape') {
            setEditingId(null);
            setEditValue('');
        }
    };

    const totalUticaj = data.reduce((sum, item) => sum + item.uticaj, 0);

    if (loading) return <div>Учитавање података...</div>;

    return (
        <div className="p-6 bg-white border-2 border-gray-800 rounded-lg mt-6">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Прилог Б1</h2>
                <h3 className="text-lg font-bold text-gray-800 mb-2">(нормативан)</h3>
                <h4 className="text-lg font-bold text-gray-800 mb-4">Утицај делатности</h4>
                <p className="font-bold text-gray-800 mb-2">Табела Б1.1 – Дистрибуција утицаја делатности на наступање ризика</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-gray-800 text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-gray-900">
                            <th className="border border-gray-800 px-2 py-2 text-center" style={{ width: '50px' }}>Р. бр.</th>
                            <th className="border border-gray-800 px-2 py-2 text-center" style={{ width: '100px' }}>Утицај (%)</th>
                            <th className="border border-gray-800 px-2 py-2 text-center">Група ризика</th>
                            <th className="border border-gray-800 px-2 py-2 text-center" style={{ width: '100px' }}>Индекс утицаја делатности<br />(Иуд)</th>
                            <th className="border border-gray-800 px-2 py-2 text-center" style={{ width: '100px' }}>Величина критичности<br />(ВК)</th>
                            <th className="border border-gray-800 px-2 py-2 text-center" style={{ width: '100px' }}>Степен критичности<br />(К)</th>
                        </tr>
                        <tr className="bg-gray-50 text-xs text-gray-900 font-semibold">
                            <th className="border border-gray-800 px-1 py-1 text-center">1</th>
                            <th className="border border-gray-800 px-1 py-1 text-center">2</th>
                            <th className="border border-gray-800 px-1 py-1 text-center">3</th>
                            <th className="border border-gray-800 px-1 py-1 text-center">4</th>
                            <th className="border border-gray-800 px-1 py-1 text-center">5</th>
                            <th className="border border-gray-800 px-1 py-1 text-center">6</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.groupId} className="hover:bg-gray-50">
                                <td className="border border-gray-800 px-2 py-2 text-center font-medium bg-yellow-50 text-gray-900">{item.groupId}</td>
                                <td className="border border-gray-800 px-2 py-2 text-center bg-yellow-50 text-gray-900">
                                    {editingId === item.groupId ? (
                                        <input
                                            type="number"
                                            className="w-full p-1 border rounded text-center"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => handleInputBlur(item.groupId)}
                                            onKeyDown={(e) => handleKeyPress(e, item.groupId)}
                                            autoFocus
                                        />
                                    ) : (
                                        <div
                                            className={`${!readOnly ? 'cursor-pointer hover:bg-yellow-100' : ''} p-1 rounded text-gray-900`}
                                            onClick={() => handleCellClick(item.groupId, item.uticaj)}
                                        >
                                            {item.uticaj.toFixed(2)}%
                                        </div>
                                    )}
                                </td>
                                <td className="border border-gray-800 px-2 py-2 font-medium text-gray-900">{item.groupName}</td>
                                <td className="border border-gray-800 px-2 py-2 text-center text-gray-900 font-medium">{item.iud !== null ? item.iud.toFixed(4) : '-'}</td>
                                <td className="border border-gray-800 px-2 py-2 text-center text-gray-900 font-medium">{item.vk !== null ? item.vk : '-'}</td>
                                <td className="border border-gray-800 px-2 py-2 text-center text-gray-900 font-medium">{item.k !== null ? item.k : '-'}</td>
                            </tr>
                        ))}
                        <tr className="bg-green-100 font-bold">
                            <td className="border border-gray-800 px-2 py-2 text-center"></td>
                            <td className={`border border-gray-800 px-2 py-2 text-center ${Math.abs(totalUticaj - 100) > 0.01 ? 'text-red-600' : 'text-green-800'}`}>
                                {totalUticaj.toFixed(2)}%
                            </td>
                            <td className="border border-gray-800 px-2 py-2 text-center text-gray-900">АГРЕГАТНО</td>
                            <td className="border border-gray-800 px-2 py-2 text-center bg-gray-200"></td>
                            <td className="border border-gray-800 px-2 py-2 text-center bg-gray-200"></td>
                            <td className="border border-gray-800 px-2 py-2 text-center bg-gray-200"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {Math.abs(totalUticaj - 100) > 0.01 && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    <strong>УПОЗОРЕЊЕ:</strong> Збир могућег утицаја мора бити тачно 100%. Тренутни збир је {totalUticaj.toFixed(2)}%.
                </div>
            )}
        </div>
    );
}
