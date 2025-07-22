'use client';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

interface Korisnik {
    id: number;
    email: string;
    ime: string;
    prezime: string;
    je_admin: boolean;
}

export default function Home() {
    const [korisnik, setKorisnik] = useState<Korisnik | null>(null);
    const router = useRouter();



    useEffect(() => {
        const token = localStorage.getItem('token');
        const korisnikData = localStorage.getItem('korisnik');

        if (token && korisnikData) {
            setKorisnik(JSON.parse(korisnikData));
        } else {
            // Ako nema tokena, preusmeri na prijavu
            router.push('/prijava');
        }
    }, [router]);

    // Dodaj listener za promene u localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const korisnikData = localStorage.getItem('korisnik');
            if (korisnikData) {
                setKorisnik(JSON.parse(korisnikData));
            }
        };

        // Slušaj promene u localStorage
        window.addEventListener('storage', handleStorageChange);
        
        // Takođe proveravaj kada se komponenta fokusira (vraćaš se sa druge stranice)
        window.addEventListener('focus', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('korisnik');
        setKorisnik(null);
        router.push('/prijava');
    };

    if (!korisnik) {
        // Prikaži loading dok se proverava auth status
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Učitavanje...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
            {/* Modern Navigation */}
            <nav className="bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Digitalni Registar</h1>
                                <p className="text-xs text-gray-500 -mt-1">Procena Rizika</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/profil')}
                                className="hidden md:flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors duration-200"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                        {korisnik.ime.charAt(0)}{korisnik.prezime.charAt(0)}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">{korisnik.ime} {korisnik.prezime}</p>
                                    <p className="text-gray-500 text-xs">{korisnik.email}</p>
                                </div>
                            </button>
                            
                            <button
                                onClick={() => router.push('/profil')}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 md:hidden"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                                Profil
                            </button>

                            {korisnik.je_admin && (
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                    Admin
                                </button>
                            )}
                            
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                                Odjava
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        SRPS A.L2.003:2025 Sertifikovano
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        Дигитални регистар<br/>
                        <span className="text-blue-600">процене ризика</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                        Професионални систем за процену и управљање ризицима у складу са најновијим стандардима. 
                        Обезбедите безбедност вашег радног окружења кроз систематичну анализу и праћење ризика.
                    </p>
                </div>

                {/* Action Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-200">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold text-gray-900">Нова процена ризика</h3>
                                <p className="text-gray-600">Започните детаљну анализу</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Креирајте нову процену ризика користећи наш напредни систем који вас води кроз све неопходне кораке анализе.
                        </p>
                        <button
                            onClick={() => router.push('/optimized-risk')}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                        >
                            Започни процену
                        </button>
                    </div>

                    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-purple-200">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold text-gray-900">Правна лица</h3>
                                <p className="text-gray-600">Управљајте правним лицима</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Прегледајте сва правна лица и њихове процене ризика. Креирајте нове процене за постојећа правна лица.
                        </p>
                        <button
                            onClick={() => router.push('/pravna-lica')}
                            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                        >
                            Прегледај правна лица
                        </button>
                    </div>

                    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-green-200">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold text-gray-900">Историја процена</h3>
                                <p className="text-gray-600">Прегледајте претходне анализе</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Приступите свим претходним проценама ризика, анализирајте трендове и пратите напредак у управљању ризицима.
                        </p>
                        <button
                            onClick={() => router.push('/procena-history')}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                        >
                            Прегледај историју
                        </button>
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Кључне функционалности</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Стандардизована процена</h3>
                            <p className="text-gray-600">У складу са SRPS A.L2.003:2025 стандардом</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Брза анализа</h3>
                            <p className="text-gray-600">Ефикасан процес процене са аутоматским извештајима</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Детаљно праћење</h3>
                            <p className="text-gray-600">Комплетна историја и аналитика свих процена</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
