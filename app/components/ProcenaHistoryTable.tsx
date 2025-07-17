"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ProcenaData {
    id: number;
    datum: string;
    pravnoLiceId: number;
    naziv: string;
    pib: string;
    adresa: string;
    ukupnoRizika: number;
    visokoRizicniRizici: number;
}

interface ProcenaHistoryTableProps {
    onEditProcena?: (procenaId: number) => void;
}

export default function ProcenaHistoryTable({ onEditProcena }: ProcenaHistoryTableProps) {
    const [procene, setProocene] = useState<ProcenaData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'datum' | 'naziv'>('datum');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [exportingPDF, setExportingPDF] = useState(false);

    useEffect(() => {
        loadProocene();
    }, []);

    const loadProocene = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/procena');

            if (!response.ok) {
                throw new Error('Greška pri učitavanju procena');
            }

            const data = await response.json();
            setProocene(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Neočekivana greška');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (column: 'datum' | 'naziv') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const handleDeleteProcena = async (procenaId: number, naziv: string) => {
        if (!confirm(`Да ли сте сигурни да желите да обришете процену за "${naziv}"?\n\nОва акција је неповратна и обрисаће све повезане податке.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/procena/${procenaId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Ukloni procenu iz lokalnog state-a
                setProocene(prev => prev.filter(p => p.id !== procenaId));
                alert('Процена је успешно обрисана.');
            } else {
                const errorData = await response.json();
                alert(`Грешка при брисању: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Greška pri brisanju procene:', error);
            alert('Дошло је до грешке при брисању процене.');
        }
    };

    const handleExportToPDF = async () => {
        setExportingPDF(true);
        try {
            // Create a temporary div with the content to export
            const exportContent = document.createElement('div');
            exportContent.style.position = 'absolute';
            exportContent.style.left = '-9999px';
            exportContent.style.top = '0';
            exportContent.style.width = '800px';
            exportContent.style.backgroundColor = 'white';
            exportContent.style.padding = '20px';
            exportContent.style.fontFamily = 'Arial, sans-serif';

            const currentDate = new Date().toLocaleDateString('sr-RS');
            const totalHighRisks = filteredAndSortedProocene.reduce((sum, p) => sum + p.visokoRizicniRizici, 0);

            exportContent.innerHTML = `
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #1e40af; font-size: 24px; margin-bottom: 10px;">📊 Историја Процена Ризика</h1>
                    <p style="color: #374151; font-size: 14px;">Генерисано: ${currentDate}</p>
                </div>
                
                <div style="display: flex; justify-content: space-around; margin-bottom: 30px; background-color: #f9fafb; padding: 15px; border-radius: 8px;">
                    <div style="text-align: center;">
                        <div style="font-size: 20px; font-weight: bold; color: #2563eb;">${filteredAndSortedProocene.length}</div>
                        <div style="font-size: 12px; color: #374151;">Укупно процена</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 20px; font-weight: bold; color: #dc2626;">${totalHighRisks}</div>
                        <div style="font-size: 12px; color: #374151;">Високи ризици</div>
                    </div>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; color: #111827; font-weight: bold;">Правно лице</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; color: #111827; font-weight: bold;">ПИБ</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; color: #111827; font-weight: bold;">Датум</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; color: #111827; font-weight: bold;">Укупно ризика</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; color: #111827; font-weight: bold;">Високи ризици</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; color: #111827; font-weight: bold;">Ниво ризика</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredAndSortedProocene.map(procena => {
                const procenat = procena.ukupnoRizika > 0 ? (procena.visokoRizicniRizici / procena.ukupnoRizika) * 100 : 0;
                let nivoText = 'Безбедно';
                let nivoColor = '#059669';
                if (procenat >= 50) {
                    nivoText = 'Висок ризик';
                    nivoColor = '#dc2626';
                } else if (procenat >= 25) {
                    nivoText = 'Средњи ризик';
                    nivoColor = '#d97706';
                } else if (procenat > 0) {
                    nivoText = 'Низак ризик';
                    nivoColor = '#ca8a04';
                }

                return `
                                <tr>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; color: #111827;">${procena.naziv}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; color: #111827;">${procena.pib}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; color: #111827;">${new Date(procena.datum).toLocaleDateString('sr-RS')}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; color: #111827;">${procena.ukupnoRizika}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; color: #dc2626; font-weight: bold;">${procena.visokoRizicniRizici}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; color: ${nivoColor}; font-weight: bold;">${nivoText}</td>
                                </tr>
                            `;
            }).join('')}
                    </tbody>
                </table>
                
                <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #374151;">
                    <p>Систем за дигиталну процену ризика</p>
                </div>
            `;

            document.body.appendChild(exportContent);

            // Convert to canvas
            const canvas = await html2canvas(exportContent, {
                useCORS: true,
                allowTaint: true,
                background: '#ffffff'
            });

            // Remove temporary element
            document.body.removeChild(exportContent);

            // Create PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Save the PDF
            const fileName = `istorija_procena_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error('Greška pri eksportu u PDF:', error);
            alert('Дошло је до грешке при експорту у PDF.');
        } finally {
            setExportingPDF(false);
        }
    };

    const getRiskLevelBadge = (visokoRizicni: number, ukupno: number) => {
        if (ukupno === 0) {
            return <span className="text-gray-400 text-sm">Нема ризика</span>;
        }

        const procenat = (visokoRizicni / ukupno) * 100;

        if (procenat >= 50) {
            return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Висок ризик</span>;
        } else if (procenat >= 25) {
            return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Средњи ризик</span>;
        } else if (procenat > 0) {
            return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Низак ризик</span>;
        } else {
            return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Безбедно</span>;
        }
    };

    // Filtriranje i sortiranje
    const filteredAndSortedProocene = procene
        .filter(procena => {
            const matchesSearch = searchTerm === '' ||
                procena.naziv.toLowerCase().includes(searchTerm.toLowerCase()) ||
                procena.pib.includes(searchTerm);
            return matchesSearch;
        })
        .sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'datum':
                    comparison = new Date(a.datum).getTime() - new Date(b.datum).getTime();
                    break;
                case 'naziv':
                    comparison = a.naziv.localeCompare(b.naziv);
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-600 font-medium">Учитавам историју процена...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-red-100">
                <div className="text-center">
                    <div className="text-red-600 mb-4">⚠️</div>
                    <p className="text-red-600 font-medium">{error}</p>
                    <button
                        onClick={loadProocene}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Покушај поново
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-800">
                            📊 Историја Процена Ризика
                        </h2>
                        <p className="text-blue-600 mt-1">
                            Преглед свих правних лица и њихових процена ризика
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Претражи по називу или ПИБ-у..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                            />
                            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Export PDF Button */}
                        <button
                            onClick={handleExportToPDF}
                            disabled={exportingPDF || filteredAndSortedProocene.length === 0}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            {exportingPDF ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Експортујем...
                                </>
                            ) : (
                                <>
                                    📄 Експорт у PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{procene.length}</div>
                        <div className="text-sm text-gray-600">Укупно процена</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                            {procene.reduce((sum, p) => sum + p.visokoRizicniRizici, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Високи ризици</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <button
                                    onClick={() => handleSort('naziv')}
                                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                >
                                    Правно лице
                                    {sortBy === 'naziv' && (
                                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <button
                                    onClick={() => handleSort('datum')}
                                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                >
                                    Датум процене
                                    {sortBy === 'datum' && (
                                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </button>
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ризици
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ниво ризика
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Акције
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAndSortedProocene.map((procena) => (
                            <tr key={procena.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {procena.naziv}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            ПИБ: {procena.pib}
                                        </div>
                                        {procena.adresa && (
                                            <div className="text-xs text-gray-400 mt-1">
                                                {procena.adresa}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {new Date(procena.datum).toLocaleDateString('sr-RS')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(procena.datum).toLocaleTimeString('sr-RS', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {procena.ukupnoRizika} укупно
                                    </div>
                                    <div className="text-xs text-red-600">
                                        {procena.visokoRizicniRizici} високих
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getRiskLevelBadge(procena.visokoRizicniRizici, procena.ukupnoRizika)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/optimized-risk/${procena.id}`}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                                        >
                                            Прегледај
                                        </Link>
                                        {onEditProcena && (
                                            <button
                                                onClick={() => onEditProcena(procena.id)}
                                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors"
                                            >
                                                Уреди
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDeleteProcena(procena.id, procena.naziv)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
                                        >
                                            Обриши
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredAndSortedProocene.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Нема процена за приказ
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm
                            ? 'Покушајте са другачијим филтерима за претрагу.'
                            : 'Нема процена за приказ.'}
                    </p>
                </div>
            )}
        </div>
    );
}