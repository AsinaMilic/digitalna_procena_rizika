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
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-lg shadow-lg space-y-6 w-full max-w-md border border-gray-200"
            >
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Unos pravnog lica
                </h2>
                <input
                    type="text"
                    placeholder="Naziv pravnog lica"
                    value={naziv}
                    onChange={e => setNaziv(e.target.value)}
                    className="w-full p-3 border border-gray-400 rounded text-gray-800 placeholder-gray-500 focus:border-blue-600 focus:outline-none"
                    required
                />
                <input
                    type="text"
                    placeholder="PIB"
                    value={pib}
                    onChange={e => setPib(e.target.value)}
                    className="w-full p-3 border border-gray-400 rounded text-gray-800 placeholder-gray-500 focus:border-blue-600 focus:outline-none"
                    required
                />
                <input
                    type="text"
                    placeholder="Adresa"
                    value={adresa}
                    onChange={e => setAdresa(e.target.value)}
                    className="w-full p-3 border border-gray-400 rounded text-gray-800 placeholder-gray-500 focus:border-blue-600 focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded disabled:bg-blue-300 transition"
                >
                    {loading ? "Sačekajte..." : "Sačuvaj i započni procenu"}
                </button>
            </form>
        </div>
    );
}
