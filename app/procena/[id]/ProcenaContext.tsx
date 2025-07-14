"use client";
import React, {createContext, useContext, useState} from "react";

// Dummy field structure za svaku grupu
export interface GrupaRizikaData {
    [key: string]: string;
}

interface ProcenaContextState {
    grupe: GrupaRizikaData[];
    setGrupaData: (idx: number, data: GrupaRizikaData) => void;
    reset: () => void;
}

const ProcenaContext = createContext<ProcenaContextState | undefined>(undefined);

export function useProcena() {
    const ctx = useContext(ProcenaContext);
    if (!ctx) throw new Error("useProcena mora biti unutar ProcenaProvider!");
    return ctx;
}

const GRUPE_COUNT = 11;

export function ProcenaProvider({children}: { children: React.ReactNode }) {
    // Svaka grupa je jedan objekat
    const [grupe, setGrupe] = useState<GrupaRizikaData[]>(
        Array.from({length: GRUPE_COUNT}, () => ({field1: "", field2: ""}))
    );

    function setGrupaData(idx: number, data: GrupaRizikaData) {
        setGrupe(arr => arr.map((g, i) => i === idx ? data : g));
    }

    function reset() {
        setGrupe(Array.from({length: GRUPE_COUNT}, () => ({field1: "", field2: ""})));
    }

    return (
        <ProcenaContext.Provider value={{grupe, setGrupaData, reset}}>
            {children}
        </ProcenaContext.Provider>
    );
}
