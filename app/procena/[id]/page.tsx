"use client";
import {useState} from "react";
import {ProcenaProvider, useProcena} from "./ProcenaContext";
import Stepper from "../../components/Stepper";

const GRUPE = [
    "Organizacija i rukovodstvo",
    "Radno okruženje",
    "Radni procesi",
    "Tehnička sredstva",
    "Fizička sigurnost",
    "Zdravlje na radu",
    "Ekologija",
    "Informaciona sigurnost",
    "Pravna usklađenost",
    "Finansijski rizici",
    "Reputacioni rizici"
];

export default function ProcenaWrapper() {
    return (
        <ProcenaProvider>
            <ProcenaWizard/>
        </ProcenaProvider>
    );
}

function ProcenaWizard() {
    const [step, setStep] = useState(0);
    const {grupe, setGrupaData} = useProcena();
    const isFinalStep = step === GRUPE.length;
    const [loading, setLoading] = useState(false);
    const [apiMsg, setApiMsg] = useState<string | null>(null);

    function handleInputChange(field: string, value: string) {
        // Izmeni state za tekuću grupu (korak)
        const data = {...grupe[step], [field]: value};
        setGrupaData(step, data);
    }

    async function handleSubmitToBackend() {
        setLoading(true);
        setApiMsg(null);
        try {
            // Dohvatanje ID iz url parametara
            const procenaId = window.location.pathname.split("/")[2];
            const res = await fetch(`/api/procena/${procenaId}/unos`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({grupe})
            });
            const data = await res.json();
            if (data.success) {
                setApiMsg("Uspešno ste sačuvali podatke!");
            } else {
                setApiMsg("Desila se greška u snimanju!");
            }
        } catch {
            setApiMsg("Greška u komunikaciji sa serverom!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100 px-2 py-10">
            <div className="bg-white rounded-2xl p-10 shadow-2xl w-full max-w-3xl border border-gray-100">
                <Stepper step={isFinalStep ? step - 1 : step} setStep={setStep} labels={GRUPE}/>
                {!isFinalStep ? (
                    <>
                        <h2 className="text-2xl font-extrabold text-blue-800 mt-8 mb-4 text-center tracking-tight drop-shadow">
                            {GRUPE[step]}
                        </h2>
                        <form className="flex flex-col gap-6 items-center justify-center py-6">
                            <input
                                className="w-full p-4 border border-blue-200 rounded-lg text-gray-900 placeholder-blue-400 outline-none bg-blue-50 focus:border-purple-400 focus:ring-2 focus:ring-blue-200 shadow transition"
                                placeholder={`Polje 1 za ovu grupu...`}
                                value={grupe[step]?.field1 || ""}
                                onChange={e => handleInputChange("field1", e.target.value)}
                            />
                            <input
                                className="w-full p-4 border border-blue-200 rounded-lg text-gray-900 placeholder-blue-400 outline-none bg-blue-50 focus:border-purple-400 focus:ring-2 focus:ring-blue-200 shadow transition"
                                placeholder={`Polje 2 za ovu grupu...`}
                                value={grupe[step]?.field2 || ""}
                                onChange={e => handleInputChange("field2", e.target.value)}
                            />
                        </form>
                        <div className="flex justify-between mt-8 gap-6">
                            <button
                                disabled={step === 0}
                                onClick={() => setStep(prev => Math.max(prev - 1, 0))}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 text-gray-600 rounded-xl font-semibold shadow transition hover:from-gray-300 hover:to-gray-400 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                            >
                                Nazad
                            </button>
                            <button
                                onClick={() => setStep(prev => prev + 1)}
                                disabled={step === GRUPE.length - 1 && !(grupe[step]?.field1 || grupe[step]?.field2)}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow transition hover:from-blue-600 hover:to-purple-600 disabled:from-blue-300 disabled:to-purple-400 disabled:cursor-not-allowed"
                            >
                                {step === GRUPE.length - 1 ? "Pregled" : "Dalje"}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-extrabold text-blue-800 mt-8 mb-4 text-center drop-shadow">Pregled
                            unetih podataka</h2>
                        <table
                            className="min-w-full border border-blue-200 bg-white rounded-xl shadow my-6 overflow-hidden">
                            <thead>
                            <tr className="bg-gradient-to-r from-blue-50 to-purple-50">
                                <th className="px-4 py-2 border-b text-blue-700 font-semibold">Grupa</th>
                                <th className="px-4 py-2 border-b text-blue-700 font-semibold">Polje 1</th>
                                <th className="px-4 py-2 border-b text-blue-700 font-semibold">Polje 2</th>
                            </tr>
                            </thead>
                            <tbody>
                            {GRUPE.map((g, idx) => (
                                <tr key={g} className="even:bg-blue-50">
                                    <td className="px-4 py-2 border-b text-left font-medium">{g}</td>
                                    <td className="px-4 py-2 border-b text-left">{grupe[idx].field1}</td>
                                    <td className="px-4 py-2 border-b text-left">{grupe[idx].field2}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <button
                            className="mt-8 w-full bg-gradient-to-r from-green-500 via-lime-500 to-emerald-500 text-white font-bold py-4 rounded-xl shadow hover:from-green-600 hover:to-emerald-600 transition focus:outline-none focus:ring-4 focus:ring-green-200 disabled:from-green-300 disabled:to-emerald-300 disabled:cursor-not-allowed"
                            onClick={handleSubmitToBackend}
                            disabled={loading}
                        >
                            {loading ? "Čuvanje..." : "Završi i prikaži finalnu tabelu"}
                        </button>
                        {apiMsg && (
                            <div
                                className={`mt-8 p-4 rounded-xl text-center text-lg shadow-lg ${apiMsg.startsWith('Uspe') ? "bg-green-100 text-green-900" : "bg-red-100 text-red-700"}`}>
                                {apiMsg}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
