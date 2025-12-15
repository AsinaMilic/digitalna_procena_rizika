"use client";
import React, { useState, useEffect } from "react";
import { PrilogFData, INITIAL_PRILOG_F_DATA } from "./PrilogTypes";
import TabelaF1 from "./TabelaF1";
import TabelaF2 from "./TabelaF2";
import TabelaF3 from "./TabelaF3";
import TabelaF4 from "./TabelaF4";
import TabelaF5 from "./TabelaF5";
import TabelaF6 from "./TabelaF6";

interface PrilogFContainerProps {
    procenaId: string;
    readOnly?: boolean;
}

export default function PrilogFContainer({ procenaId, readOnly = false }: PrilogFContainerProps) {
    const [data, setData] = useState<PrilogFData>(INITIAL_PRILOG_F_DATA);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/procena/${procenaId}/prilog-f-general`);
                if (res.ok) {
                    const result = await res.json();
                    if (result.fData) {
                        // Merge with initial to ensure all fields exist even if DB has partial
                        // Note: PrilogFData has flat fields except f3/f4 which are objects (jsonb)
                        // The DB returns flat columns: f1_..., f3_eksterni_kontekst (object), etc.

                        setData(prev => ({
                            ...prev,
                            f1_podaci_o_organizaciji: result.fData.f1_podaci_o_organizaciji || '',
                            f1_menadzer_rizika: result.fData.f1_menadzer_rizika || '',
                            f2_podaci_o_posmatranoj_org: result.fData.f2_podaci_o_posmatranoj_org || '',
                            f2_sifra_delatnosti: result.fData.f2_sifra_delatnosti || '',
                            f2_odgovorno_lice: result.fData.f2_odgovorno_lice || '',
                            f2_podaci_o_licima: result.fData.f2_podaci_o_licima || '',
                            f3_eksterni_kontekst: result.fData.f3_eksterni_kontekst || prev.f3_eksterni_kontekst,
                            f3_interni_kontekst: result.fData.f3_interni_kontekst || prev.f3_interni_kontekst,
                            f4_identifikacija: result.fData.f4_identifikacija || '',
                            f4_analiza: result.fData.f4_analiza || '',
                            f4_vrednovanje: result.fData.f4_vrednovanje || '',
                            f6_zakljucak: result.fData.f6_zakljucak || prev.f6_zakljucak
                        }));
                    }
                }
            } catch (err) {
                console.error("Error fetching Prilog F general data", err);
            } finally {
                setLoading(false);
            }
        };
        if (procenaId) fetchData();
    }, [procenaId]);

    const handleChange = async (field: keyof PrilogFData, value: PrilogFData[keyof PrilogFData]) => {
        const newData = { ...data, [field]: value };
        setData(newData);

        // Debounce or just save
        // For simplicity, save immediately (optimistic update in UI, async save)
        try {
            await fetch(`/api/procena/${procenaId}/prilog-f-general`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
        } catch (err) {
            console.error("Error saving data", err);
        }
    };

    if (loading) return <div>Учитавање Прилог Ф...</div>;

    return (
        <div className="space-y-8 mt-12">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Прилог Ф</h2>
                <h3 className="text-lg font-bold text-gray-900 mb-2">(нормативан)</h3>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Акт о процени ризика у заштити лица, имовине и пословања</h4>
            </div>

            <TabelaF1 data={data} onChange={handleChange} readOnly={readOnly} />
            <TabelaF2 data={data} onChange={handleChange} readOnly={readOnly} />
            <TabelaF3 data={data} onChange={handleChange} readOnly={readOnly} />
            <TabelaF4 data={data} onChange={handleChange} readOnly={readOnly} />
            <TabelaF5 procenaId={procenaId} readOnly={readOnly} />
            <TabelaF6 data={data} onChange={handleChange} readOnly={readOnly} />
        </div>
    );
}
