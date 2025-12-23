import { NextResponse } from "next/server";

interface PgError extends Error {
    code: string;
    constraint?: string;
    detail?: string;
    table?: string;
    column?: string;
}

export function handleApiError(error: unknown, context: string = "action") {
    console.error(`Greška u API-ju (${context}):`, error);

    if (error && typeof error === 'object') {
        // PostgreSQL errors
        if ('code' in error) {
            const pgError = error as PgError;

            // 22001: String Data Right Truncation (Value too long)
            if (pgError.code === '22001') {
                return NextResponse.json({
                    error: "Uneti podatak je predugačak. Molimo proverite dužinu unosa.",
                    details: pgError.detail || undefined
                }, { status: 400 });
            }

            // 23505: Unique Violation
            if (pgError.code === '23505') {
                // Pokušaj da izvučeš korisnije informacije iz constraint-a
                let message = "Podatak već postoji u bazi.";
                if (pgError.constraint?.includes('email')) message = "Korisnik sa ovom email adresom već postoji.";
                if (pgError.constraint?.includes('pib')) message = "Pravno lice sa ovim PIB-om već postoji.";
                if (pgError.constraint?.includes('maticni_broj')) message = "Pravno lice sa ovim matičnim brojem već postoji.";

                return NextResponse.json({
                    error: message,
                    constraint: pgError.constraint
                }, { status: 400 });
            }

            // 23502: Not Null Violation
            if (pgError.code === '23502') {
                return NextResponse.json({
                    error: `Nedostaje obavezan podatak: ${pgError.column || 'nepoznato'}`,
                }, { status: 400 });
            }

            // 23503: Foreign Key Violation
            if (pgError.code === '23503') {
                return NextResponse.json({
                    error: "Pokušavate da povežete podatak sa nepostojećim entitetom (strani ključ nije validan).",
                    detail: pgError.detail
                }, { status: 400 });
            }
        }
    }

    // Default error
    return NextResponse.json({
        error: "Došlo je do greške na serveru. Molimo pokušajte ponovo kasnije."
    }, { status: 500 });
}
