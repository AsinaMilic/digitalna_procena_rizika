"use client";
import ProcenaHistoryTable from "../components/ProcenaHistoryTable";
import Link from "next/link";

export default function ProcenaHistoryPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                📊 Историја Процена Ризика
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Преглед свих правних лица и њихових процена ризика са могућношћу уређивања
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <Link
                                href="/"
                                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                            >
                                🏠 Почетна
                            </Link>
                            <Link
                                href="/admin"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                            >
                                ⚙️ Админ панел
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-l-4 border-blue-500">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                        🔍 Како користити овај интерфејс
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <h3 className="font-medium text-gray-800 mb-2">Преглед и претрага:</h3>
                            <ul className="space-y-1">
                                <li>• Претражујте по називу правног лица или ПИБ-у</li>
                                <li>• Сортирајте по датуму или називу</li>
                                <li>• Видите статистике ризика за сваку процену</li>
                                <li>• Експортујте извештај у PDF формат</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-800 mb-2">Акције:</h3>
                            <ul className="space-y-1">
                                <li>• <span className="text-blue-600 font-medium">Прегледај</span> - Отвори процену у режиму прегледа</li>
                                <li>• <span className="text-green-600 font-medium">Уреди</span> - Отвори процену за уређивање</li>
                                <li>• Видите ниво ризика на основу анализе</li>
                                <li>• Обришите процену ако је потребно</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <ProcenaHistoryTable />
                
            </div>
        </div>
    );
}