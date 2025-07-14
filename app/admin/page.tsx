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
        return <div className="flex justify-center items-center h-screen">Učitavanje...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold">Admin Panel</h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => router.push('/')}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                            >
                                Početna
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    router.push('/prijava');
                                }}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Odjava
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <h2 className="text-2xl font-bold mb-6">Upravljanje korisnicima</h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {korisnici.map((korisnik) => (
                                <li key={korisnik.id} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div
                                                        className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {korisnik.ime[0]}{korisnik.prezime[0]}
                            </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {korisnik.ime} {korisnik.prezime}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{korisnik.email}</div>
                                                    <div className="text-xs text-gray-400">
                                                        Registrovan: {new Date(korisnik.datum_kreiranja).toLocaleDateString('sr-RS')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                      <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(korisnik.status)}`}>
                        {getStatusText(korisnik.status)}
                      </span>
                                            {korisnik.status === 'na_cekanju' && (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleStatusChange(korisnik.id, 'odobren')}
                                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                                                    >
                                                        Odobri
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(korisnik.id, 'odbačen')}
                                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                                                    >
                                                        Odbaci
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {korisnici.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                Nema korisnika za prikaz
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
