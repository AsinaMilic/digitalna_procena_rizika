"use client";

export default function FinalRiskTable() {
    return (
        <div className="overflow-x-auto mt-6">
            <table className="min-w-full border border-gray-300 bg-white rounded-lg shadow-sm">
                <thead>
                <tr className="bg-gray-100">
                    <th className="px-4 py-2 border-b text-left">Naziv rizika</th>
                    <th className="px-4 py-2 border-b text-left">Automatska kolona</th>
                    <th className="px-4 py-2 border-b text-left">Ručna kolona</th>
                    <th className="px-4 py-2 border-b text-left">Ukupni rezultat</th>
                </tr>
                </thead>
                <tbody>
                {/* Ovaj deo zameni kasnije dinamičkim renderovanjem podataka */}
                <tr>
                    <td className="px-4 py-2 border-b">(primer) Rizik br. 1</td>
                    <td className="px-4 py-2 border-b">Automatska vrednost</td>
                    <td className="px-4 py-2 border-b"><input type="text" className="p-1 border rounded w-full"
                                                              placeholder="Unesi"/></td>
                    <td className="px-4 py-2 border-b">Generisano</td>
                </tr>
                </tbody>
            </table>
        </div>
    );
}
