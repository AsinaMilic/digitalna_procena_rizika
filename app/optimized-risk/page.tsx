'use client';

import { useState, useEffect } from 'react';
import OptimizedRiskAssessment from '../components/OptimizedRiskAssessment';
import LegalEntityForm from '../components/LegalEntityForm';

interface PravnoLice {
    id: number;
    naziv: string;
    pib: string;
    adresa: string;
}

export default function OptimizedRiskPage() {
    const [step, setStep] = useState<'pravno-lice' | 'procena'>('pravno-lice');
    const [procenaId, setProcenaId] = useState<string>('');
    const [pravnoLice, setPravnoLice] = useState<PravnoLice | null>(null);
    const [existingPravnaLica, setExistingPravnaLica] = useState<PravnoLice[]>([]);
    const [loadingEntities, setLoadingEntities] = useState(true);
    const [selectionMode, setSelectionMode] = useState<'select' | 'new'>('select');
    const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
    const [creatingProcena, setCreatingProcena] = useState(false);

    // Fetch existing entities on mount
    useEffect(() => {
        const fetchEntities = async () => {
            try {
                const response = await fetch('/api/pravno-lice');
                if (response.ok) {
                    const result = await response.json();
                    setExistingPravnaLica(result.data);
                }
            } catch (error) {
                console.error('Error fetching entities:', error);
            } finally {
                setLoadingEntities(false);
            }
        };
        fetchEntities();
    }, []);

    const handleSelectExisting = async () => {
        if (!selectedEntityId) return;
        setCreatingProcena(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/procena', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    pravnoLiceId: selectedEntityId
                })
            });

            if (response.ok) {
                const data = await response.json();
                const selectedEntity = existingPravnaLica.find(p => p.id === selectedEntityId);

                if (selectedEntity) {
                    setPravnoLice(selectedEntity);
                }

                setProcenaId(data.procenaId.toString());
                setStep('procena');
            } else {
                const errorData = await response.json();
                if (errorData.existingProcenaId) {
                    const selectedEntity = existingPravnaLica.find(p => p.id === selectedEntityId);
                    if (selectedEntity) setPravnoLice(selectedEntity);

                    setProcenaId(errorData.existingProcenaId.toString());
                    setStep('procena');
                } else {
                    alert(errorData.error || 'Greška pri kreiranju procene');
                }
            }
        } catch (error) {
            console.error('Error creating assessment:', error);
            alert('Greška pri komunikaciji sa serverom');
        } finally {
            setCreatingProcena(false);
        }
    };

    // Korak 1: Unos pravnog lica
    if (step === 'pravno-lice') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    {selectionMode === 'select' ? (
                        <div className="bg-white p-12 rounded-2xl shadow-xl border border-slate-200">
                            <div className="text-center border-b border-slate-200 pb-8 mb-8">
                                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full shadow-lg mx-auto mb-6">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                                    Избор правног лица
                                </h2>
                                <p className="text-slate-600">
                                    Изаберите постојеће правно лице или креирајте ново
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                {/* Option 1: Select Existing */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-2 text-sm">1</span>
                                        Постојеће правно лице
                                    </h3>
                                    <div className="space-y-3">
                                        <select
                                            value={selectedEntityId || ''}
                                            onChange={(e) => setSelectedEntityId(Number(e.target.value))}
                                            className="w-full p-4 border border-slate-300 rounded-xl text-black bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 text-base font-medium appearance-none cursor-pointer hover:border-blue-400"
                                            disabled={loadingEntities || existingPravnaLica.length === 0}
                                        >
                                            <option value="">
                                                {loadingEntities ? 'Учитавање...' : existingPravnaLica.length === 0 ? 'Нема постојећих правних лица' : 'Изаберите правно лице...'}
                                            </option>
                                            {existingPravnaLica.map(pl => (
                                                <option key={pl.id} value={pl.id}>
                                                    {pl.naziv}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleSelectExisting}
                                            disabled={!selectedEntityId || creatingProcena}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center"
                                        >
                                            {creatingProcena ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Креирање...
                                                </>
                                            ) : (
                                                <>
                                                    Настави са изабраним
                                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="flex items-center justify-center md:hidden">
                                    <div className="w-full h-px bg-slate-200"></div>
                                    <span className="px-4 text-slate-500 font-medium">ИЛИ</span>
                                    <div className="w-full h-px bg-slate-200"></div>
                                </div>

                                {/* Option 2: Create New */}
                                <div className="space-y-4 border-l border-slate-200 pl-0 md:pl-8">
                                    <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 mr-2 text-sm">2</span>
                                        Ново правно лице
                                    </h3>
                                    <p className="text-slate-600 text-sm mb-4">
                                        Уколико правно лице не постоји у регистру, можете га креирати овде.
                                    </p>
                                    <button
                                        onClick={() => setSelectionMode('new')}
                                        className="w-full bg-white border-2 border-dashed border-green-500 hover:bg-green-50 text-green-600 font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center group"
                                    >
                                        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Креирај ново правно лице
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <button
                                onClick={() => setSelectionMode('select')}
                                className="flex items-center text-slate-600 hover:text-blue-600 transition-colors font-medium"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Назад на избор
                            </button>
                            <LegalEntityForm
                                onSuccess={(data) => {
                                    // Sačuvaj podatke o pravnom licu
                                    setPravnoLice({
                                        id: data.pravnoLiceId,
                                        naziv: data.pravnoLice.naziv,
                                        pib: data.pravnoLice.pib,
                                        adresa: data.pravnoLice.adresa
                                    });

                                    // Postavi procena ID i pređi na sledeći korak
                                    setProcenaId(data.procenaId.toString());
                                    setStep('procena');
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Korak 2: Optimizovana procena rizika
    return (
        <OptimizedRiskAssessment
            procenaId={procenaId}
            pravnoLice={pravnoLice}
            onNewAssessment={() => {
                setStep('pravno-lice');
                setProcenaId('');
                setPravnoLice(null);
                setSelectionMode('select');
                setSelectedEntityId(null);
            }}
        />
    );
}
