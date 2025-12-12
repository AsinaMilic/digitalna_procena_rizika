"use client";
import React from "react";
import { PrilogFData } from "./PrilogTypes";

interface TabelaF1Props {
    data: PrilogFData;
    onChange: (field: keyof PrilogFData, value: string) => void;
    readOnly?: boolean;
}

export default function TabelaF1({ data, onChange, readOnly }: TabelaF1Props) {
    return (
        <div className="mb-6 border-2 border-gray-800 rounded p-4 bg-white">
            <h5 className="font-bold text-center mb-4 text-gray-800">Табела Ф.1 – Подаци о организацији која врши процену ризика</h5>
            <table className="w-full text-sm border-collapse border border-gray-800">
                <tbody>
                    <tr>
                        <td className="border border-gray-800 p-2 w-1/3 align-top font-semibold text-gray-900">
                            1. Пословно име (назив), адреса седишта, матични број (МБ), порески идентификациони број (ПИБ)
                        </td>
                        <td className="border border-gray-800 p-0">
                            <textarea
                                className="w-full h-24 p-2 focus:outline-none resize-none text-gray-900 disabled:text-gray-900 disabled:opacity-100"
                                value={data.f1_podaci_o_organizaciji || ''}
                                onChange={(e) => onChange('f1_podaci_o_organizaciji', e.target.value)}
                                disabled={readOnly}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-800 p-2 align-top font-semibold text-gray-900">
                            2. Име и презиме менаџера ризика, број лиценце
                        </td>
                        <td className="border border-gray-800 p-0">
                            <textarea
                                className="w-full h-16 p-2 focus:outline-none resize-none text-gray-900 disabled:text-gray-900 disabled:opacity-100"
                                value={data.f1_menadzer_rizika || ''}
                                onChange={(e) => onChange('f1_menadzer_rizika', e.target.value)}
                                disabled={readOnly}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
