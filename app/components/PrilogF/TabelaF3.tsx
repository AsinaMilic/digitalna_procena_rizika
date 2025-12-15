"use client";
import React from "react";
import { PrilogFData } from "./PrilogTypes";

interface TabelaF3Props {
    data: PrilogFData;
    onChange: (field: keyof PrilogFData, value: PrilogFData[keyof PrilogFData]) => void;
    readOnly?: boolean;
}

export default function TabelaF3({ data, onChange, readOnly }: TabelaF3Props) {
    const updateEksterni = (key: keyof typeof data.f3_eksterni_kontekst, val: string) => {
        onChange('f3_eksterni_kontekst', { ...data.f3_eksterni_kontekst, [key]: val });
    };

    const updateInterni = (key: keyof typeof data.f3_interni_kontekst, val: string) => {
        onChange('f3_interni_kontekst', { ...data.f3_interni_kontekst, [key]: val });
    };

    return (
        <div className="mb-6 border-2 border-gray-800 rounded p-4 bg-white">
            <h5 className="font-bold text-center mb-4 text-gray-800">Табела Ф.3 – Контекст процене ризика</h5>
            <table className="w-full text-sm border-collapse border border-gray-800">
                <tbody>
                    {/* Extermal Context */}
                    <tr className="bg-gray-100">
                        <td colSpan={2} className="border border-gray-800 p-2 font-bold text-gray-900">1. Екстерни контекст</td>
                    </tr>
                    {[
                        { k: 'makrolokacija', l: 'а) макролокација' },
                        { k: 'mikrolokacija', l: 'б) микролокација' },
                        { k: 'konkurencija', l: 'в) конкуренција' },
                        { k: 'istorija_stetnih_dogadjaja', l: 'г) историја штетних догађаја' }
                    ].map((item) => (
                        <tr key={item.k}>
                            <td className="border border-gray-800 p-2 pl-6 w-1/3 align-top text-gray-900">{item.l}</td>
                            <td className="border border-gray-800 p-0">
                                <textarea
                                    className="w-full h-12 p-2 focus:outline-none resize-none text-gray-900 disabled:text-gray-900 disabled:opacity-100"
                                    value={data.f3_eksterni_kontekst[item.k as keyof typeof data.f3_eksterni_kontekst]}
                                    onChange={(e) => updateEksterni(item.k as keyof typeof data.f3_eksterni_kontekst, e.target.value)}
                                    disabled={readOnly}
                                />
                            </td>
                        </tr>
                    ))}

                    {/* Internal Context */}
                    <tr className="bg-gray-100">
                        <td colSpan={2} className="border border-gray-800 p-2 font-bold text-gray-900">2. Интерни контекст</td>
                    </tr>
                    {[
                        { k: 'istorija_stetnih_dogadjaja', l: 'а) историја штетних догађаја' },
                        { k: 'velicina_org_uticaj', l: 'б) величина организације и утицај природе делатности...' },
                        { k: 'nacin_organizovanja', l: 'в) начин организовања пословних процеса' },
                        { k: 'nacin_stepen_zastite', l: 'г) начин и степен заштите лица, имовине и пословања' },
                        { k: 'delovanje_zainteresovanih', l: 'д) деловање интерних заинтересованих страна' }
                    ].map((item) => (
                        <tr key={item.k}>
                            <td className="border border-gray-800 p-2 pl-6 w-1/3 align-top text-gray-900">{item.l}</td>
                            <td className="border border-gray-800 p-0">
                                <textarea
                                    className="w-full h-12 p-2 focus:outline-none resize-none text-gray-900 disabled:text-gray-900 disabled:opacity-100"
                                    value={data.f3_interni_kontekst[item.k as keyof typeof data.f3_interni_kontekst] || ''}
                                    onChange={(e) => updateInterni(item.k as keyof typeof data.f3_interni_kontekst, e.target.value)}
                                    disabled={readOnly}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
