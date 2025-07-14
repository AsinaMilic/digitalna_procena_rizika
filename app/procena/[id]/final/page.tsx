"use client";

export default function FinalnaTabelaPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2">
            <div className="bg-white rounded-lg p-8 shadow-xl w-full max-w-3xl border border-gray-200 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Finalna tabela procene rizika</h2>
                <div className="mb-8 text-gray-600">Ovde će biti automatski izračunate i unosne kolone, tablice rezimea
                    rizika i sve za dalji rad.
                </div>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition">Eksportuj
                    izveštaj
                </button>
            </div>
        </div>
    );
}
