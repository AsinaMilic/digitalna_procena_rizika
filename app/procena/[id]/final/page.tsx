"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FinalRiskTable from "../../../components/FinalRiskTable";

interface ProcenaData {
    procena: {
        id: number;
        datum: string;
        status: string;
        pravnoLice: {
            naziv: string;
            pib: string;
            adresa?: string;
        };
    };
    riskSelections: Array<{
        riskId: string;
        dangerLevel: number;
        description: string;
    }>;
    riskRegister: Array<{
        riskId: string;
        description: string;
        dangerLevel: number;
        exposure: number;
        vulnerability: number;
        consequences: number;
        probability: number;
        riskLevel: number;
        category: string;
        acceptability: string;
        recommendedMeasures: string;
    }>;
}

export default function FinalnaTabelaPage() {
    const params = useParams();
    const [data, setData] = useState<ProcenaData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/procena/${params.id}/final`);
                const result = await response.json();

                if (response.ok) {
                    setData(result);
                } else {
                    setError(result.error || 'Greška pri dohvatanju podataka');
                }
            } catch (err) {
                setError('Greška pri komunikaciji sa serverom');
            } finally {
                setLoading(false);
            }
        }

        if (params.id) {
            fetchData();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-600 font-medium">Učitavam podatke...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100">
                <div className="bg-white rounded-lg p-8 shadow-xl max-w-md text-center border border-red-200">
                    <div className="text-red-600 text-xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-red-700 mb-2">Greška</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                        Pokušaj ponovo
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header sa informacijama o pravnom licu */}
                <div className="bg-white rounded-2xl p-8 shadow-xl mb-8 border border-blue-100">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-blue-800 mb-2">Finalna procena rizika</h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-semibold text-blue-700">Pravno lice:</span>
                                <span className="text-gray-800">{data.procena.pravnoLice.naziv}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-blue-700">PIB:</span>
                                <span className="text-gray-800">{data.procena.pravnoLice.pib}</span>
                            </div>
                            {data.procena.pravnoLice.adresa && (
                                <div className="flex justify-between">
                                    <span className="font-semibold text-blue-700">Adresa:</span>
                                    <span className="text-gray-800">{data.procena.pravnoLice.adresa}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-semibold text-blue-700">Datum procene:</span>
                                <span className="text-gray-800">{new Date(data.procena.datum).toLocaleDateString('sr-RS')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-blue-700">Status:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${data.procena.status === 'zavrsena'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {data.procena.status === 'zavrsena' ? 'Završena' : 'U toku'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-blue-700">ID procene:</span>
                                <span className="text-gray-800">#{data.procena.id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registar rizika - Prilog Lj */}
                {data.riskRegister && data.riskRegister.length > 0 ? (
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100 mb-8">
                        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
                            Регистар ризика - Прилог Љ
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-blue-200 rounded-lg overflow-hidden text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-50 to-purple-50">
                                        <th className="border border-blue-200 px-3 py-2 text-left font-semibold text-blue-700">Ризик ID</th>
                                        <th className="border border-blue-200 px-3 py-2 text-left font-semibold text-blue-700">Опис</th>
                                        <th className="border border-blue-200 px-3 py-2 text-center font-semibold text-blue-700">Величина опасности</th>
                                        <th className="border border-blue-200 px-3 py-2 text-center font-semibold text-blue-700">Изложеност</th>
                                        <th className="border border-blue-200 px-3 py-2 text-center font-semibold text-blue-700">Рањивост</th>
                                        <th className="border border-blue-200 px-3 py-2 text-center font-semibold text-blue-700">Последице</th>
                                        <th className="border border-blue-200 px-3 py-2 text-center font-semibold text-blue-700">Вероватноћа</th>
                                        <th className="border border-blue-200 px-3 py-2 text-center font-semibold text-blue-700">Ниво ризика</th>
                                        <th className="border border-blue-200 px-3 py-2 text-center font-semibold text-blue-700">Категорија</th>
                                        <th className="border border-blue-200 px-3 py-2 text-center font-semibold text-blue-700">Прихватљивост</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.riskRegister.map((risk, index) => (
                                        <tr key={risk.riskId} className={index % 2 === 0 ? "bg-blue-25" : "bg-white"}>
                                            <td className="border border-blue-200 px-3 py-2 font-medium text-gray-800">
                                                {risk.riskId}
                                            </td>
                                            <td className="border border-blue-200 px-3 py-2 text-gray-700 max-w-xs">
                                                <div className="truncate" title={risk.description}>
                                                    {risk.description.length > 50
                                                        ? `${risk.description.substring(0, 50)}...`
                                                        : risk.description}
                                                </div>
                                            </td>
                                            <td className="border border-blue-200 px-3 py-2 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${risk.dangerLevel >= 4 ? 'bg-red-100 text-red-800' :
                                                    risk.dangerLevel >= 3 ? 'bg-yellow-100 text-yellow-800' :
                                                        risk.dangerLevel >= 2 ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'
                                                    }`}>
                                                    {risk.dangerLevel}
                                                </span>
                                            </td>
                                            <td className="border border-blue-200 px-3 py-2 text-center">{risk.exposure}</td>
                                            <td className="border border-blue-200 px-3 py-2 text-center">{risk.vulnerability}</td>
                                            <td className="border border-blue-200 px-3 py-2 text-center">{risk.consequences}</td>
                                            <td className="border border-blue-200 px-3 py-2 text-center">{risk.probability}</td>
                                            <td className="border border-blue-200 px-3 py-2 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${risk.riskLevel >= 20 ? 'bg-red-100 text-red-800' :
                                                    risk.riskLevel >= 15 ? 'bg-orange-100 text-orange-800' :
                                                        risk.riskLevel >= 10 ? 'bg-yellow-100 text-yellow-800' :
                                                            risk.riskLevel >= 5 ? 'bg-blue-100 text-blue-800' :
                                                                'bg-green-100 text-green-800'
                                                    }`}>
                                                    {risk.riskLevel}
                                                </span>
                                            </td>
                                            <td className="border border-blue-200 px-3 py-2 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${risk.category === 'КРИТИЧАН' ? 'bg-red-100 text-red-800' :
                                                    risk.category === 'ВИСОК' ? 'bg-orange-100 text-orange-800' :
                                                        risk.category === 'УМЕРЕН' ? 'bg-yellow-100 text-yellow-800' :
                                                            risk.category === 'НИЗАК' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-green-100 text-green-800'
                                                    }`}>
                                                    {risk.category}
                                                </span>
                                            </td>
                                            <td className="border border-blue-200 px-3 py-2 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${risk.acceptability === 'НЕПРИХВАТЉИВ' ? 'bg-red-100 text-red-800' :
                                                    risk.acceptability === 'УСЛОВНО ПРИХВАТЉИВ' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {risk.acceptability}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100 mb-8">
                        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Регистар ризика</h2>
                        <div className="text-center text-gray-600">
                            <p>Регистар ризика није генерисан.</p>
                            <p className="text-sm mt-2">Молимо вас да се вратите на процену и генеришете матрицу ризика.</p>
                        </div>
                    </div>
                )}

                {/* Препоручене мере */}
                {data.riskRegister && data.riskRegister.length > 0 && (
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100 mb-8">
                        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
                            Препоручене мере за управљање ризицима
                        </h2>

                        <div className="space-y-4">
                            {data.riskRegister.map((risk, index) => (
                                <div key={risk.riskId} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-gray-800">
                                            {risk.riskId} - {risk.category} ризик
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${risk.acceptability === 'НЕПРИХВАТЉИВ' ? 'bg-red-100 text-red-800' :
                                            risk.acceptability === 'УСЛОВНО ПРИХВАТЉИВ' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {risk.acceptability}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">
                                        {risk.description}
                                    </p>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-blue-800 font-medium text-sm">
                                            📋 {risk.recommendedMeasures}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Komponenta za finalnu tabelu rizika */}
                <div className="mt-8">
                    <FinalRiskTable />
                </div>

                {/* Akcije */}
                <div className="mt-8 text-center space-x-4">
                    <button
                        onClick={() => window.print()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        📄 Eksportuj izveštaj
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        ← Nazad
                    </button>
                </div>
            </div>
        </div>
    );
}
