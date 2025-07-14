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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Dobrodošli!</h1>
                    <div className="space-x-4">
                        <button
                            onClick={() => router.push('/prijava')}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Prijava
                        </button>
                        <button
                            onClick={() => router.push('/registracija')}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Registracija
                        </button>
                    </div>
        </div>
      </div>
    );
  }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold">Digitalni Registar</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span>Dobrodošli, {korisnik.ime} {korisnik.prezime}!</span>
                            {korisnik.je_admin && (
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Admin Panel
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
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
                    <div
                        className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-8 mt-8 flex flex-col items-center">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Unos pravnog lica</h2>
                        <form
                            className="space-y-4 w-80"
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
                            <input
                                type="text"
                                name="naziv"
                                placeholder="Naziv pravnog lica"
                                className="w-full p-2 border border-gray-400 rounded text-gray-800 placeholder-gray-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                                required
                            />
                            <input
                                type="text"
                                name="pib"
                                placeholder="PIB"
                                className="w-full p-2 border border-gray-400 rounded text-gray-800 placeholder-gray-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                                required
                            />
                            <input
                                type="text"
                                name="adresa"
                                placeholder="Adresa"
                                className="w-full p-2 border border-gray-400 rounded text-gray-800 placeholder-gray-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                            />
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white rounded p-2 font-semibold hover:bg-blue-700 transition"
                            >
                                Sačuvaj
                            </button>
                        </form>
                        {pravnoLiceUneto && !prikaziRizik && (
                            <button
                                className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded w-full transition"
                                onClick={() => setPrikaziRizik(true)}
                            >
                                Kreiraj te rizik
                            </button>
                        )}
                        {prikaziRizik && (
                            <div
                                className="mt-10 w-full max-w-xl bg-gray-50 border border-gray-300 rounded-lg shadow-md p-8">
                                <h3 className="text-xl font-bold mb-4 text-gray-800">Unos rizika</h3>
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
                                    className="space-y-4"
                                >
                                    <input
                                        type="text"
                                        placeholder="Naziv rizika"
                                        value={nazivRizika}
                                        onChange={e => setNazivRizika(e.target.value)}
                                        className="w-full p-2 border border-gray-400 rounded text-gray-800 placeholder-gray-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                                        required
                                    />
                                    <textarea
                                        placeholder="Opis rizika"
                                        value={opisRizika}
                                        onChange={e => setOpisRizika(e.target.value)}
                                        className="w-full p-2 border border-gray-400 rounded text-gray-800 placeholder-gray-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                                        rows={3}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Verovatnoća (1-10)"
                                        value={verovatnoca}
                                        onChange={e => setVerovatnoca(e.target.value)}
                                        min={1}
                                        max={10}
                                        className="w-full p-2 border border-gray-400 rounded text-gray-800 placeholder-gray-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Uticaj (1-10)"
                                        value={uticaj}
                                        onChange={e => setUticaj(e.target.value)}
                                        min={1}
                                        max={10}
                                        className="w-full p-2 border border-gray-400 rounded text-gray-800 placeholder-gray-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full mt-2 bg-blue-600 text-white rounded p-2 font-semibold hover:bg-blue-700 transition"
                                    >
                                        Sačuvaj rizik
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
      </main>
    </div>
  );
}
