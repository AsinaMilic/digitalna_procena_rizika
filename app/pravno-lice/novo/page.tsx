"use client";
import {useRouter} from "next/navigation";
import {useState} from "react";

export default function PravnoLiceForm() {
    const router = useRouter();
    const [naziv, setNaziv] = useState("");
    const [pib, setPib] = useState("");
    const [adresa, setAdresa] = useState("");
    const [loading, setLoading] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        // Mock API poziv (kasnije: slati na backend/API)
        setTimeout(() => {
            setLoading(false);
            router.push("/procena/123"); // kasnije zameni pravim ID procene
        }, 700);
    }

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 py-12 px-2">
            <form
                onSubmit={handleSubmit}
                className="relative bg-white/60 backdrop-blur-md p-12 rounded-3xl shadow-2xl shadow-blue-200 space-y-10 w-full max-w-xl border border-blue-100 flex flex-col items-center"
            >
                {/* Hero ikona */}
                <div
                    className="-mt-14 mb-2 flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full shadow-lg border-4 border-white">
                    <svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' fill='none' stroke='currentColor'
                         className='text-blue-700' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2'
                              d='M7.5 7.5v0A4.5 4.5 0 0 1 12 3a4.5 4.5 0 0 1 4.5 4.5v0M12 15.25a7 7 0 0 0-6.53 4.19.75.75 0 0 0 .67 1.06h11.72a.75.75 0 0 0 .67-1.06A7 7 0 0 0 12 15.25ZM8 10h.01M16 10h.01'/>
                    </svg>
                </div>
                <h2 className="text-3xl font-extrabold text-center text-blue-700 tracking-tight uppercase drop-shadow-sm">
                    Unos pravnog lica
                </h2>
                <p className="text-center text-blue-400 text-base mb-2 -mt-4">Popunite sve podatke za novu
                    registraciju</p>
                <div className="flex flex-col gap-7 w-full">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="naziv" className="text-sm font-semibold text-blue-700 pl-1">Naziv pravnog
                            lica</label>
                        <input
                            id="naziv"
                            type="text"
                            placeholder="Unesite naziv..."
                            value={naziv}
                            onChange={e => setNaziv(e.target.value)}
                            className="w-full p-4 border-2 border-blue-100 rounded-xl text-gray-900 placeholder-blue-300 bg-blue-50 focus:border-purple-400 focus:ring-2 focus:ring-blue-200 focus:outline-none shadow transition-all duration-200"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="pib" className="text-sm font-semibold text-blue-700 pl-1">PIB</label>
                        <input
                            id="pib"
                            type="text"
                            placeholder="Unesite PIB..."
                            value={pib}
                            onChange={e => setPib(e.target.value)}
                            className="w-full p-4 border-2 border-blue-100 rounded-xl text-gray-900 placeholder-blue-300 bg-blue-50 focus:border-purple-400 focus:ring-2 focus:ring-blue-200 focus:outline-none shadow transition-all duration-200"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="adresa" className="text-sm font-semibold text-blue-700 pl-1">Adresa</label>
                        <input
                            id="adresa"
                            type="text"
                            placeholder="Unesite adresu..."
                            value={adresa}
                            onChange={e => setAdresa(e.target.value)}
                            className="w-full p-4 border-2 border-blue-100 rounded-xl text-gray-900 placeholder-blue-300 bg-blue-50 focus:border-purple-400 focus:ring-2 focus:ring-blue-200 focus:outline-none shadow transition-all duration-200"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 hover:from-blue-700 hover:via-indigo-600 hover:to-purple-700 text-white font-bold py-4 rounded-2xl shadow drop-shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:from-blue-200 disabled:to-purple-200 disabled:cursor-not-allowed"
                >
                    {loading ? "Sačekajte..." : "Sačuvaj i započni procenu"}
                </button>
                {/* Security note */}
                <div className="pt-2 w-full text-center text-xs text-blue-400 select-none">
                    <span className="inline-flex items-center gap-1"><svg className='inline w-4 h-4 text-blue-300'
                                                                          fill='none' stroke='currentColor'
                                                                          strokeWidth='2' viewBox='0 0 24 24'><path
                        strokeLinecap='round'
                        d='M12 3v2m6.364 1.636l-1.414 1.414M21 12h-2M6.364 4.636l1.414 1.414M3 12h2m1.636 6.364l1.414-1.414M12 21v-2m6.364-1.636l-1.414-1.414M4.636 17.364l1.414-1.414'/></svg>Vaši podaci su zaštićeni i biće korišćeni samo za potrebe procene rizika</span>
                </div>
            </form>
        </div>
    );
}
