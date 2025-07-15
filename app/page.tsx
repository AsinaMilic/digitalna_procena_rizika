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

    // Novi state za unos
    const [pravnoLiceUneto, setPravnoLiceUneto] = useState(false);
    const [prikaziRizik, setPrikaziRizik] = useState(false);

    // Rizik polja
    const [nazivRizika, setNazivRizika] = useState("");
    const [opisRizika, setOpisRizika] = useState("");
    const [verovatnoca, setVerovatnoca] = useState("");
    const [uticaj, setUticaj] = useState("");

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
                <div className="space-y-12">
                    {/* Prva kartica - Unos pravnog lica */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-blue-100 hover:shadow-3xl transition-all duration-300 max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h4"/>
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Unos pravnog lica</h2>
                            <p className="text-gray-600">Registrujte novo pravno lice u sistemu</p>
                        </div>
                        <form
                            className="space-y-6"
                            onSubmit={e => {
                                e.preventDefault();
                                // @ts-expect-error pristup input polju po imenu nije tipizovan u TS-u
                                const naziv = e.target.naziv.value;
                                // @ts-expect-error pristup input polju po imenu nije tipizovan u TS-u
                                const pib = e.target.pib.value;
                                // @ts-expect-error pristup input polju po imenu nije tipizovan u TS-u
                                const adresa = e.target.adresa.value;
                                setPravnoLiceUneto(true);
                                alert(`Naziv: ${naziv}\nPIB: ${pib}\nAdresa: ${adresa}`);
                            }}
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 pl-1">Naziv pravnog lica</label>
                                <input
                                    type="text"
                                    name="naziv"
                                    placeholder="Unesite naziv pravnog lica..."
                                    className="w-full p-4 border-2 border-blue-100 rounded-xl text-gray-900 placeholder-blue-300 bg-blue-50/50 focus:border-indigo-400 focus:ring-4 focus:ring-blue-100 focus:outline-none shadow-sm transition-all duration-200"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 pl-1">PIB</label>
                                <input
                                    type="text"
                                    name="pib"
                                    placeholder="Unesite PIB..."
                                    className="w-full p-4 border-2 border-blue-100 rounded-xl text-gray-900 placeholder-blue-300 bg-blue-50/50 focus:border-indigo-400 focus:ring-4 focus:ring-blue-100 focus:outline-none shadow-sm transition-all duration-200"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 pl-1">Adresa</label>
                                <input
                                    type="text"
                                    name="adresa"
                                    placeholder="Unesite adresu..."
                                    className="w-full p-4 border-2 border-blue-100 rounded-xl text-gray-900 placeholder-blue-300 bg-blue-50/50 focus:border-indigo-400 focus:ring-4 focus:ring-blue-100 focus:outline-none shadow-sm transition-all duration-200"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200"
                            >
                                Sačuvaj
                            </button>
                        </form>
                        {pravnoLiceUneto && !prikaziRizik && (
                            <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                        </svg>
                                    </div>
                                    <p className="text-emerald-700 font-medium mb-4">Pravno lice je uspešno registrovano!</p>
                                    <button
                                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                                        onClick={() => setPrikaziRizik(true)}
                                    >
                                        Kreiraj novi rizik
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Druga kartica - Unos rizika */}
                    {prikaziRizik && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-orange-100 hover:shadow-3xl transition-all duration-300 w-full">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800 mb-2">Unos rizika</h3>
                                <p className="text-gray-600">Definiši i oceni novi rizik</p>
                            </div>
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                    alert(
                                        `Naziv rizika: ${nazivRizika}\nOpis: ${opisRizika}\nVerovatnoća: ${verovatnoca}\nUticaj: ${uticaj}`
                                    );
                                    // Čišćenje forme
                                    setNazivRizika("");
                                    setOpisRizika("");
                                    setVerovatnoca("");
                                    setUticaj("");
                                }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 pl-1">Naziv rizika</label>
                                    <input
                                        type="text"
                                        placeholder="Unesite naziv rizika..."
                                        value={nazivRizika}
                                        onChange={e => setNazivRizika(e.target.value)}
                                        className="w-full p-4 border-2 border-orange-100 rounded-xl text-gray-900 placeholder-orange-300 bg-orange-50/50 focus:border-red-400 focus:ring-4 focus:ring-orange-100 focus:outline-none shadow-sm transition-all duration-200"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 pl-1">Opis rizika</label>
                                    <textarea
                                        placeholder="Detaljno opišite rizik..."
                                        value={opisRizika}
                                        onChange={e => setOpisRizika(e.target.value)}
                                        className="w-full p-4 border-2 border-orange-100 rounded-xl text-gray-900 placeholder-orange-300 bg-orange-50/50 focus:border-red-400 focus:ring-4 focus:ring-orange-100 focus:outline-none shadow-sm transition-all duration-200 resize-none"
                                        rows={4}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 pl-1">Verovatnoća (1-10)</label>
                                        <input
                                            type="number"
                                            placeholder="1-10"
                                            value={verovatnoca}
                                            onChange={e => setVerovatnoca(e.target.value)}
                                            min={1}
                                            max={10}
                                            className="w-full p-4 border-2 border-orange-100 rounded-xl text-gray-900 placeholder-orange-300 bg-orange-50/50 focus:border-red-400 focus:ring-4 focus:ring-orange-100 focus:outline-none shadow-sm transition-all duration-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 pl-1">Uticaj (1-10)</label>
                                        <input
                                            type="number"
                                            placeholder="1-10"
                                            value={uticaj}
                                            onChange={e => setUticaj(e.target.value)}
                                            min={1}
                                            max={10}
                                            className="w-full p-4 border-2 border-orange-100 rounded-xl text-gray-900 placeholder-orange-300 bg-orange-50/50 focus:border-red-400 focus:ring-4 focus:ring-orange-100 focus:outline-none shadow-sm transition-all duration-200"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-200"
                                >
                                    Sačuvaj rizik
                                </button>
                            </form>
                        </div>
                    )}
                </div>
      </main>
    </div>
  );
}
