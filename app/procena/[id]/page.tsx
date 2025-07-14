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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2">
            <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-2xl border border-gray-200">
                <Stepper step={isFinalStep ? step - 1 : step} setStep={setStep} labels={GRUPE}/>
                {!isFinalStep ? (
                    <>
                        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3 text-center">
                            {GRUPE[step]}
                        </h2>
                        <form className="flex flex-col gap-4 items-center justify-center py-4">
                            <input
                                className="w-full p-2 border border-gray-400 rounded text-gray-800 placeholder-gray-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                                placeholder={`Polje 1 za ovu grupu...`}
                                value={grupe[step]?.field1 || ""}
                                onChange={e => handleInputChange("field1", e.target.value)}
                            />
                            <input
                                className="w-full p-2 border border-gray-400 rounded text-gray-800 placeholder-gray-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                                placeholder={`Polje 2 za ovu grupu...`}
                                value={grupe[step]?.field2 || ""}
                                onChange={e => handleInputChange("field2", e.target.value)}
                            />
                        </form>
                        <div className="flex justify-between mt-6">
                            <button
                                disabled={step === 0}
                                onClick={() => setStep(prev => Math.max(prev - 1, 0))}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                Nazad
                            </button>
                            <button
                                onClick={() => setStep(prev => prev + 1)}
                                disabled={step === GRUPE.length - 1 && !(grupe[step]?.field1 || grupe[step]?.field2)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold disabled:bg-blue-300"
                            >
                                {step === GRUPE.length - 1 ? "Pregled" : "Dalje"}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3 text-center">Pregled unetih podataka
                            (dummy)</h2>
                        <table className="min-w-full border border-gray-300 bg-white rounded-lg shadow-sm my-6">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 border-b">Grupa</th>
                                <th className="px-4 py-2 border-b">Polje 1</th>
                                <th className="px-4 py-2 border-b">Polje 2</th>
                            </tr>
                            </thead>
                            <tbody>
                            {GRUPE.map((g, idx) => (
                                <tr key={g}>
                                    <td className="px-4 py-2 border-b text-left font-medium">{g}</td>
                                    <td className="px-4 py-2 border-b text-left">{grupe[idx].field1}</td>
                                    <td className="px-4 py-2 border-b text-left">{grupe[idx].field2}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <button
                            className="mt-8 w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-green-300"
                            onClick={handleSubmitToBackend}
                            disabled={loading}
                        >
                            {loading ? "Čuvanje..." : "Završi i prikaži finalnu tabelu"}
                        </button>
                        {apiMsg && (
                            <div
                                className={`mt-6 p-3 rounded-lg text-center ${apiMsg.startsWith('Uspe') ? "bg-green-100 text-green-900" : "bg-red-100 text-red-700"}`}>
                                {apiMsg}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
