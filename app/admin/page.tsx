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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-purple-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium mb-6">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                        Administratorski panel
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        Управљање <span className="text-purple-600">корисницима</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                        Преглед, одобравање и управљање свим регистрованим корисницима система за процену ризика.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Укупно корисника</p>
                                <p className="text-2xl font-bold text-gray-900">{korisnici.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">На чекању</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {korisnici.filter(k => k.status === 'na_cekanju').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Одобрени</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {korisnici.filter(k => k.status === 'odobren').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900">Листа корисника</h3>
                        <p className="text-sm text-gray-600 mt-1">Управљајте статусом корисничких налога</p>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                        {korisnici.map((korisnik) => (
                            <div key={korisnik.id} className="p-6 hover:bg-gray-50 transition-all duration-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <span className="text-white font-semibold">
                                                {korisnik.ime.charAt(0)}{korisnik.prezime.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900">
                                                {korisnik.ime} {korisnik.prezime}
                                            </h4>
                                            <p className="text-sm text-gray-600">{korisnik.email}</p>
                                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"/>
                                                </svg>
                                                Регистрован: {new Date(korisnik.datum_kreiranja).toLocaleDateString('sr-RS')}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(korisnik.status)}`}>
                                            {korisnik.status === 'na_cekanju' && (
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                </svg>
                                            )}
                                            {korisnik.status === 'odobren' && (
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                </svg>
                                            )}
                                            {korisnik.status === 'odbačen' && (
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                                </svg>
                                            )}
                                            {getStatusText(korisnik.status)}
                                        </span>
                                        
                                        {korisnik.status === 'na_cekanju' && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleStatusChange(korisnik.id, 'odobren')}
                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                                    </svg>
                                                    Одобри
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(korisnik.id, 'odbačen')}
                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                                    </svg>
                                                    Одбаци
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Нема корисника</h3>
                            <p className="text-gray-500">Тренутно нема регистрованих корисника за приказ.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
