'use client';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

interface Korisnik {
    id: number;
    email: string;
    ime: string;
    prezime: string;
    status: string;
    datum_kreiranja: string;
}

export default function AdminPage() {
    const [korisnici, setKorisnici] = useState<Korisnik[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const korisnikData = localStorage.getItem('korisnik');

        if (!token || !korisnikData) {
            router.push('/prijava');
            return;
        }

        const korisnik = JSON.parse(korisnikData);
        if (!korisnik.je_admin) {
            router.push('/');
            return;
        }

        fetchKorisnici();
    }, [router]);

    const fetchKorisnici = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/korisnici', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setKorisnici(data);
            }
        } catch (error) {
            console.error('Greška pri učitavanju korisnika:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (korisnikId: number, status: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/korisnici', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({korisnikId, status}),
            });
            if (response.ok) {
                fetchKorisnici(); // Osvežava listu
            }
        } catch (error) {
            console.error('Greška pri ažuriranju statusa:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'na_cekanju':
                return 'bg-yellow-100 text-yellow-800';
            case 'odobren':
                return 'bg-green-100 text-green-800';
            case 'odbačen':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'na_cekanju':
                return 'Na čekanju';
            case 'odobren':
                return 'Odobren';
            case 'odbačen':
                return 'Odbačen';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-purple-100">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-blue-100">
                    <div className="flex items-center space-x-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-lg font-medium text-gray-700">Učitavanje...</span>
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
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Admin Panel
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/')}
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Početna
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    router.push('/prijava');
                                }}
                                className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Odjava
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                            </svg>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-800 mb-2">Upravljanje korisnicima</h2>
                        <p className="text-gray-600">Pregled i upravljanje registrovanim korisnicima</p>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
                        <div className="divide-y divide-purple-100">
                            {korisnici.map((korisnik) => (
                                <div key={korisnik.id} className="p-6 hover:bg-purple-50/50 transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                                        <span className="text-lg font-bold text-white">
                                                            {korisnik.ime[0]}{korisnik.prezime[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-6">
                                                    <div className="text-lg font-semibold text-gray-900">
                                                        {korisnik.ime} {korisnik.prezime}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">{korisnik.email}</div>
                                                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"/>
                                                        </svg>
                                                        Registrovan: {new Date(korisnik.datum_kreiranja).toLocaleDateString('sr-RS')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-xl shadow-sm ${getStatusColor(korisnik.status)}`}>
                                                {getStatusText(korisnik.status)}
                                            </span>
                                            {korisnik.status === 'na_cekanju' && (
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => handleStatusChange(korisnik.id, 'odobren')}
                                                        className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                                                    >
                                                        Odobri
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(korisnik.id, 'odbačen')}
                                                        className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                                                    >
                                                        Odbaci
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {korisnici.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-lg">Nema korisnika za prikaz</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
