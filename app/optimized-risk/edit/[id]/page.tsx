'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import OptimizedRiskAssessment from '../../../components/OptimizedRiskAssessment';

interface PravnoLice {
    id: number;
    naziv: string;
    pib: string;
    adresa: string;
}

export default function EditOptimizedRiskPage() {
    const params = useParams();
    const procenaId = params.id as string;
    const [pravnoLice, setPravnoLice] = useState<PravnoLice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProcenaData() {
            try {
                // Try to load the procena data to get associated pravno lice
                const response = await fetch(`/api/procena/${procenaId}`);
                if (response.ok) {
                    const data = await response.json();
                    // API vraća podatke direktno, ne u pravnoLice objektu
                    setPravnoLice({
                        id: data.pravnoLiceId,
                        naziv: data.naziv,
                        pib: data.pib,
                        adresa: data.adresa
                    });
                }
            } catch (error) {
                console.log('Could not load procena data:', error);
                // This is not critical, we can still show the risk assessment
            } finally {
                setLoading(false);
            }
        }

        if (procenaId) {
            loadProcenaData();
        } else {
            setError('Invalid procena ID');
            setLoading(false);
        }
    }, [procenaId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-600 font-medium">Učitavam procenu rizika...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-red-800 mb-2">Greška</h1>
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link
                        href="/procena-history"
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Nazad na istoriju
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">
                                    ✏️ Уређивање Процене Ризика
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {pravnoLice ? `${pravnoLice.naziv} | PIB: ${pravnoLice.pib} | ` : ''}
                                    Procena ID: {procenaId}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href={`/optimized-risk/${procenaId}`}
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Прегледај
                            </Link>
                            <Link
                                href="/procena-history"
                                className="text-green-600 hover:text-green-800 font-medium flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Историја процена
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Assessment Component - NOT read-only */}
            <OptimizedRiskAssessment procenaId={procenaId} pravnoLice={pravnoLice} readOnly={false} />
        </div>
    );
}