'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Korisnik {
    id: number;
    email: string;
    ime: string;
    prezime: string;
    je_admin: boolean;
}

export default function Profil() {
    const [korisnik, setKorisnik] = useState<Korisnik | null>(null);
    const [formData, setFormData] = useState({
        ime: '',
        prezime: '',
        email: '',
        trenutnaLozinka: '',
        novaLozinka: '',
        potvrdaLozinke: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('osnovni');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const korisnikData = localStorage.getItem('korisnik');

        if (!token || !korisnikData) {
            router.push('/prijava');
            return;
        }

        const korisnikObj = JSON.parse(korisnikData);
        setKorisnik(korisnikObj);
        setFormData({
            ime: korisnikObj.ime,
            prezime: korisnikObj.prezime,
            email: korisnikObj.email,
            trenutnaLozinka: '',
            novaLozinka: '',
            potvrdaLozinke: ''
        });
    }, [router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/profil', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ime: formData.ime,
                    prezime: formData.prezime,
                    email: formData.email
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Ažuriraj localStorage
                const updatedKorisnik = { ...korisnik, ...data.korisnik };
                localStorage.setItem('korisnik', JSON.stringify(updatedKorisnik));
                setKorisnik(updatedKorisnik);
                setSuccess('Profil je uspešno ažuriran!');
            } else {
                setError(data.greška || 'Došlo je do greške');
            }
        } catch {
            setError('Došlo je do greške pri slanju zahteva');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.novaLozinka !== formData.potvrdaLozinke) {
            setError('Nova lozinka i potvrda se ne poklapaju');
            return;
        }

        if (formData.novaLozinka.length < 6) {
            setError('Nova lozinka mora imati najmanje 6 karaktera');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/profil/lozinka', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    trenutnaLozinka: formData.trenutnaLozinka,
                    novaLozinka: formData.novaLozinka
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Lozinka je uspešno promenjena!');
                setFormData({
                    ...formData,
                    trenutnaLozinka: '',
                    novaLozinka: '',
                    potvrdaLozinke: ''
                });
            } else {
                setError(data.greška || 'Došlo je do greške');
            }
        } catch {
            setError('Došlo je do greške pri slanju zahteva');
        } finally {
            setLoading(false);
        }
    };

    if (!korisnik) {
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
            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">
                                    {korisnik.ime.charAt(0)}{korisnik.prezime.charAt(0)}
                                </span>
                            </div>
                            <div className="text-white">
                                <h1 className="text-2xl font-bold">{korisnik.ime} {korisnik.prezime}</h1>
                                <p className="text-blue-100">{korisnik.email}</p>
                                {korisnik.je_admin && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white mt-2">
                                        Administrator
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-8">
                            <button
                                onClick={() => setActiveTab('osnovni')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'osnovni'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Osnovni podaci
                            </button>
                            <button
                                onClick={() => setActiveTab('lozinka')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'lozinka'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Promena lozinke
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* Messages */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-green-700">{success}</p>
                                </div>
                            </div>
                        )}

                        {/* Osnovni podaci tab */}
                        {activeTab === 'osnovni' && (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="ime" className="block text-sm font-semibold text-gray-700">
                                            Ime
                                        </label>
                                        <input
                                            id="ime"
                                            type="text"
                                            required
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            value={formData.ime}
                                            onChange={(e) => setFormData({ ...formData, ime: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="prezime" className="block text-sm font-semibold text-gray-700">
                                            Prezime
                                        </label>
                                        <input
                                            id="prezime"
                                            type="text"
                                            required
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            value={formData.prezime}
                                            onChange={(e) => setFormData({ ...formData, prezime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                        Email adresa
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {loading ? 'Čuvanje...' : 'Sačuvaj izmene'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Promena lozinke tab */}
                        {activeTab === 'lozinka' && (
                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="trenutnaLozinka" className="block text-sm font-semibold text-gray-700">
                                        Trenutna lozinka
                                    </label>
                                    <input
                                        id="trenutnaLozinka"
                                        type="password"
                                        required
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={formData.trenutnaLozinka}
                                        onChange={(e) => setFormData({ ...formData, trenutnaLozinka: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="novaLozinka" className="block text-sm font-semibold text-gray-700">
                                        Nova lozinka
                                    </label>
                                    <input
                                        id="novaLozinka"
                                        type="password"
                                        required
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={formData.novaLozinka}
                                        onChange={(e) => setFormData({ ...formData, novaLozinka: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500">Minimalno 6 karaktera</p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="potvrdaLozinke" className="block text-sm font-semibold text-gray-700">
                                        Potvrda nove lozinke
                                    </label>
                                    <input
                                        id="potvrdaLozinke"
                                        type="password"
                                        required
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={formData.potvrdaLozinke}
                                        onChange={(e) => setFormData({ ...formData, potvrdaLozinke: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {loading ? 'Menjanje...' : 'Promeni lozinku'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}