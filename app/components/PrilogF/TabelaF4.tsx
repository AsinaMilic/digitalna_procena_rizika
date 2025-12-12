"use client";
import React from "react";
import { PrilogFData } from "./PrilogTypes";

interface TabelaF4Props {
    data: PrilogFData;
    onChange: (field: keyof PrilogFData, value: string) => void;
    readOnly?: boolean;
}

export default function TabelaF4({ data, onChange, readOnly }: TabelaF4Props) {
    return (
        <div className="mb-6 border-2 border-gray-800 rounded p-4 bg-white">
            <h5 className="font-bold text-center mb-4 text-gray-800">Табела Ф.4 – Процена ризика</h5>
            <table className="w-full text-sm border-collapse border border-gray-800">
                <tbody>
                    <tr>
                        <td className="border border-gray-800 p-2 font-bold bg-gray-100 text-gray-900">1. Идентификација ризика</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-800 p-2 italic text-gray-800">
                            Одређивање величина опасности према критеријумима у тачки 6.2<br />
                            Приказ идентификације ризика и величина опасности у <strong>Прилогу Љ</strong>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-800 p-0">
                            <textarea
                                className="w-full h-16 p-2 focus:outline-none resize-none text-gray-900 disabled:text-gray-900 disabled:opacity-100"
                                placeholder="Додатни коментар (опционо)..."
                                value={data.f4_identifikacija || ''}
                                onChange={(e) => onChange('f4_identifikacija', e.target.value)}
                                disabled={readOnly}
                            />
                        </td>
                    </tr>

                    <tr>
                        <td className="border border-gray-800 p-2 font-bold bg-gray-100 text-gray-900">2. Анализа ризика</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-800 p-2 italic text-gray-800">
                            Детаљан опис анализе према критеријумима у тачки 6.3<br />
                            Приказ примене метода анализе ризика у <strong>прилозима М, Н, Њ и О</strong>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-800 p-0">
                            <textarea
                                className="w-full h-24 p-2 focus:outline-none resize-none text-gray-900 disabled:text-gray-900 disabled:opacity-100"
                                placeholder="Опис анализе..."
                                value={data.f4_analiza || ''}
                                onChange={(e) => onChange('f4_analiza', e.target.value)}
                                disabled={readOnly}
                            />
                        </td>
                    </tr>

                    <tr>
                        <td className="border border-gray-800 p-2 font-bold bg-gray-100 text-gray-900">3. Вредновање ризика</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-800 p-2 italic text-gray-800">
                            Детаљно образложење према критеријумима у тачки 6.4<br />
                            Приказ примене метода вредновања ризика у <strong>Прилогу П, табела П.1 и табела П.2</strong>
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-800 p-0">
                            <textarea
                                className="w-full h-24 p-2 focus:outline-none resize-none text-gray-900 disabled:text-gray-900 disabled:opacity-100"
                                placeholder="Опис вредновања..."
                                value={data.f4_vrednovanje || ''}
                                onChange={(e) => onChange('f4_vrednovanje', e.target.value)}
                                disabled={readOnly}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
