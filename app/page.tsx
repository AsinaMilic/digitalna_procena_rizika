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
      }
  }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('korisnik');
        setKorisnik(null);
        router.push('/prijava');
    };

    if (!korisnik) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100">
                <div className="bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-2xl text-center border border-blue-100 max-w-md w-full mx-4">
                    <div className="mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dobrodošli!</h1>
                        <p className="text-gray-600">Pristupite vašem nalogu ili se registrujte</p>
                    </div>
                    <div className="space-y-4">
                        <button
                            onClick={() => router.push('/prijava')}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            Prijava
                        </button>
                        <button
                            onClick={() => router.push('/registracija')}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            Registracija
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100">
            <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Digitalni Registar
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="hidden md:block">
                                <span className="text-gray-700 font-medium">
                                    Dobrodošli, <span className="text-blue-600 font-semibold">{korisnik.ime} {korisnik.prezime}</span>!
                                </span>
                            </div>
                            {korisnik.je_admin && (
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                                >
                                    Admin Panel
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Odjava
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-blue-100 hover:shadow-3xl transition-all duration-300 max-w-2xl mx-auto">
                        <div className="mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                                Дигитални регистар процене ризика
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                Систем за процену ризика према стандарду SRPS A.L2.003:2025
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <button
                                onClick={() => router.push('/optimized-risk')}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 text-lg"
                            >
                                🚀 Започни процену ризика
                            </button>
                            
                            <button
                                onClick={() => router.push('/procena-history')}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 text-lg"
                            >
                                📊 Историја процена ризика
                            </button>

                        </div>
                    </div>
                </div>
            </main>
    </div>
  );
}
