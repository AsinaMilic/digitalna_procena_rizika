'use client';

import { useState } from 'react';
import OptimizedRiskAssessment from '../components/OptimizedRiskAssessment';

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
    
    // Form state za pravno lice
    const [naziv, setNaziv] = useState('');
    const [pib, setPib] = useState('');
    const [adresa, setAdresa] = useState('');
    const [loading, setLoading] = useState(false);

    // Funkcija za čuvanje pravnog lica i kreiranje procene
    const handleSubmitPravnoLice = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await fetch('/api/pravno-lice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    naziv,
                    pib,
                    adresa
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // Sačuvaj podatke o pravnom licu
                setPravnoLice({
                    id: data.pravnoLiceId,
                    naziv,
                    pib,
                    adresa
                });
                
                // Postavi procena ID i pređi na sledeći korak
                setProcenaId(data.procenaId.toString());
                setStep('procena');
            } else {
                alert(data.error || 'Greška pri čuvanju podataka');
            }
        } catch (error) {
            console.error('Greška:', error);
            alert('Greška pri komunikaciji sa serverom');
        } finally {
            setLoading(false);
        }
    };

    // Korak 1: Unos pravnog lica
    if (step === 'pravno-lice') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-2">
                <form
                    onSubmit={handleSubmitPravnoLice}
                    className="relative bg-white p-12 rounded-2xl shadow-xl border border-slate-200 space-y-8 w-full max-w-xl flex flex-col items-center"
                >
                    {/* Hero ikona */}
                    <div className="-mt-14 mb-2 flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full shadow-lg border-4 border-white">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                    </div>
                    
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            Процена ризика
                        </h2>
                        <p className="text-slate-600 text-sm">
                            Унесите податке о правном лицу за започињање процене
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 w-full">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="naziv" className="text-sm font-medium text-slate-700">
                                Назив правног лица
                            </label>
                            <input
                                id="naziv"
                                type="text"
                                placeholder="Унесите назив правног лица..."
                                value={naziv}
                                onChange={e => setNaziv(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                                required
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label htmlFor="pib" className="text-sm font-medium text-slate-700">
                                ПИБ
                            </label>
                            <input
                                id="pib"
                                type="text"
                                placeholder="Унесите ПИБ..."
                                value={pib}
                                onChange={e => setPib(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                                required
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label htmlFor="adresa" className="text-sm font-medium text-slate-700">
                                Адреса
                            </label>
                            <input
                                id="adresa"
                                type="text"
                                placeholder="Унесите адресу..."
                                value={adresa}
                                onChange={e => setAdresa(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Сачекајте..." : "Започни процену ризика"}
                    </button>

                    {/* Security note */}
                    <div className="pt-2 w-full text-center text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                            <svg className='inline w-4 h-4 text-slate-400' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'/>
                            </svg>
                            Ваши подаци су заштићени и биће коришћени само за потребе процене ризика
                        </span>
                    </div>
                </form>
            </div>
        );
    }

    // Korak 2: Optimizovana procena rizika
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header sa podacima o pravnom licu */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">
                                    🚀 Optimizovana Procena Rizika
                                </h1>
                                {pravnoLice && (
                                    <p className="text-sm text-gray-600">
                                        {pravnoLice.naziv} | PIB: {pravnoLice.pib} | Procena ID: {procenaId}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        <button
                            onClick={() => {
                                setStep('pravno-lice');
                                setProcenaId('');
                                setPravnoLice(null);
                                setNaziv('');
                                setPib('');
                                setAdresa('');
                            }}
                            className="text-green-600 hover:text-green-800 font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Novo pravno lice
                        </button>
                    </div>
                </div>
            </div>

            {/* Optimizovana procena rizika */}
            <OptimizedRiskAssessment procenaId={procenaId} pravnoLice={pravnoLice} />
        </div>
    );
}