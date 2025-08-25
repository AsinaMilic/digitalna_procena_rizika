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
    
    // Stilovi za input polja
    const inputStyle = "w-full p-4 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 text-base";
    const textareaStyle = "w-full p-4 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 resize-none text-base";
    
    // Form state za pravno lice
    const [naziv, setNaziv] = useState('');
    const [skraceno_poslovno_ime, setSkracenoPoslovnoIme] = useState('');
    const [pib, setPib] = useState('');
    const [maticni_broj, setMaticniBroj] = useState('');
    const [adresa_sediste, setAdresaSediste] = useState('');
    const [adresa_ostala, setAdresaOstala] = useState('');
    const [sifra_delatnosti, setSifraDelatnosti] = useState('');
    const [lice_zastupanje, setLiceZastupanje] = useState('');
    const [lice_komunikacija, setLiceKomunikacija] = useState('');
    const [tim_procena_rizika, setTimProcenaRizika] = useState('');
    const [telefon_faks, setTelefonFaks] = useState('');
    const [internet_adresa, setInternetAdresa] = useState('');
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
                    skraceno_poslovno_ime,
                    pib,
                    maticni_broj,
                    adresa_sediste,
                    adresa_ostala,
                    sifra_delatnosti,
                    lice_zastupanje,
                    lice_komunikacija,
                    tim_procena_rizika,
                    telefon_faks,
                    internet_adresa,
                    adresa: adresa_sediste // Za kompatibilnost
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // Sačuvaj podatke o pravnom licu
                setPravnoLice({
                    id: data.pravnoLiceId,
                    naziv,
                    pib,
                    adresa: adresa_sediste
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <form
                        onSubmit={handleSubmitPravnoLice}
                        className="relative bg-white p-12 rounded-2xl shadow-xl border border-slate-200 space-y-8"
                    >
                        {/* Header */}
                        <div className="text-center border-b border-slate-200 pb-8 mb-2">
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full shadow-lg mx-auto mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">
                                Процена ризика
                            </h2>
                            <p className="text-slate-600">
                                Унесите детaljне податке о правном лицу за започињање процене ризика
                            </p>
                        </div>

                    <div className="flex flex-col gap-8 w-full">
                        {/* Основни подаци */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3">
                                📋 Основни подаци
                            </h3>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="naziv" className="text-base font-semibold text-slate-700">
                                        Пословно име (пун назив) *
                                    </label>
                                    <input
                                        id="naziv"
                                        type="text"
                                        placeholder="Унесите пун назив правног лица..."
                                        value={naziv}
                                        onChange={e => setNaziv(e.target.value)}
                                        className={inputStyle}
                                        required
                                    />
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="skraceno_poslovno_ime" className="text-base font-semibold text-slate-700">
                                        Скраћено пословно име
                                    </label>
                                    <input
                                        id="skraceno_poslovno_ime"
                                        type="text"
                                        placeholder="Скраћени назив..."
                                        value={skraceno_poslovno_ime}
                                        onChange={e => setSkracenoPoslovnoIme(e.target.value)}
                                        className={inputStyle}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="pib" className="text-base font-semibold text-slate-700">
                                        ПИБ *
                                    </label>
                                    <input
                                        id="pib"
                                        type="text"
                                        placeholder="Унесите ПИБ..."
                                        value={pib}
                                        onChange={e => setPib(e.target.value)}
                                        className={inputStyle}
                                        required
                                    />
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="maticni_broj" className="text-base font-semibold text-slate-700">
                                        Матични број
                                    </label>
                                    <input
                                        id="maticni_broj"
                                        type="text"
                                        placeholder="Унесите матични број..."
                                        value={maticni_broj}
                                        onChange={e => setMaticniBroj(e.target.value)}
                                        className={inputStyle}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="sifra_delatnosti" className="text-base font-semibold text-slate-700">
                                    Шифра делатности
                                </label>
                                <input
                                    id="sifra_delatnosti"
                                    type="text"
                                    placeholder="Унесите шифру делатности..."
                                    value={sifra_delatnosti}
                                    onChange={e => setSifraDelatnosti(e.target.value)}
                                    className={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Адресе */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3">
                                🏢 Адресе
                            </h3>
                            
                            <div className="flex flex-col gap-2">
                                <label htmlFor="adresa_sediste" className="text-base font-semibold text-slate-700">
                                    Адреса седишта
                                </label>
                                <input
                                    id="adresa_sediste"
                                    type="text"
                                    placeholder="Унесите адресу седишта..."
                                    value={adresa_sediste}
                                    onChange={e => setAdresaSediste(e.target.value)}
                                    className={inputStyle}
                                />
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label htmlFor="adresa_ostala" className="text-base font-semibold text-slate-700">
                                    Адресе огранака и осталих функционалних целина
                                </label>
                                <textarea
                                    id="adresa_ostala"
                                    placeholder="Унесите адресе огранака, издвојених места и осталих функционалних целина које нису на истој адреси као седиште..."
                                    value={adresa_ostala}
                                    onChange={e => setAdresaOstala(e.target.value)}
                                    rows={3}
                                    className={textareaStyle}
                                />
                            </div>
                        </div>

                        {/* Контакт подаци */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3">
                                📞 Контакт подаци
                            </h3>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="telefon_faks" className="text-base font-semibold text-slate-700">
                                        Број телефона / факса
                                    </label>
                                    <input
                                        id="telefon_faks"
                                        type="text"
                                        placeholder="Унесите број телефона/факса..."
                                        value={telefon_faks}
                                        onChange={e => setTelefonFaks(e.target.value)}
                                        className={inputStyle}
                                    />
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="internet_adresa" className="text-base font-semibold text-slate-700">
                                        Интернет адреса
                                    </label>
                                    <input
                                        id="internet_adresa"
                                        type="url"
                                        placeholder="https://www.example.com"
                                        value={internet_adresa}
                                        onChange={e => setInternetAdresa(e.target.value)}
                                        className={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Одговорна лица */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3">
                                👥 Одговорна лица
                            </h3>
                            
                            <div className="flex flex-col gap-2">
                                <label htmlFor="lice_zastupanje" className="text-base font-semibold text-slate-700">
                                    Лице одговорно за заступање
                                </label>
                                <input
                                    id="lice_zastupanje"
                                    type="text"
                                    placeholder="Име, презиме и функција лица одговорног за заступање..."
                                    value={lice_zastupanje}
                                    onChange={e => setLiceZastupanje(e.target.value)}
                                    className={inputStyle}
                                />
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label htmlFor="lice_komunikacija" className="text-base font-semibold text-slate-700">
                                    Лице овлашћено за комуникацију у вези процене ризика
                                </label>
                                <input
                                    id="lice_komunikacija"
                                    type="text"
                                    placeholder="Име, презиме и контакт лица за комуникацију..."
                                    value={lice_komunikacija}
                                    onChange={e => setLiceKomunikacija(e.target.value)}
                                    className={inputStyle}
                                />
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label htmlFor="tim_procena_rizika" className="text-base font-semibold text-slate-700">
                                    Тим за процену ризика
                                </label>
                                <textarea
                                    id="tim_procena_rizika"
                                    placeholder="Подаци о лицима из организације која учествују у тиму за процену ризика (име, презиме, стручна спрема)..."
                                    value={tim_procena_rizika}
                                    onChange={e => setTimProcenaRizika(e.target.value)}
                                    rows={4}
                                    className={textareaStyle}
                                />
                            </div>
                        </div>
                    </div>

                        {/* Submit button */}
                        <div className="border-t border-slate-200 pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 px-8 rounded-xl shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                            >
                                {loading ? "⏳ Сачекајте..." : "🚀 Започни процену ризика"}
                            </button>

                            {/* Security note */}
                            <div className="mt-4 text-center text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                    <svg className='inline w-4 h-4 text-slate-400' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'/>
                                    </svg>
                                    Ваши подаци су заштићени и биће коришћени само за потребе процене ризика
                                </span>
                            </div>
                        </div>
                    </form>
                </div>
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
                                setSkracenoPoslovnoIme('');
                                setPib('');
                                setMaticniBroj('');
                                setAdresaSediste('');
                                setAdresaOstala('');
                                setSifraDelatnosti('');
                                setLiceZastupanje('');
                                setLiceKomunikacija('');
                                setTimProcenaRizika('');
                                setTelefonFaks('');
                                setInternetAdresa('');
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
