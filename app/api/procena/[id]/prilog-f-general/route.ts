import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../../../../lib/db';
import { ProcenaRouteContext } from '../../../types';

export async function GET(
    request: NextRequest,
    context: ProcenaRouteContext
) {
    try {
        const { params } = context;
        const { id: procenaId } = await params;
        const pool = await getDbConnection();

        const result = await pool.query(
            'SELECT * FROM prilog_f_data WHERE procena_id = $1',
            [procenaId]
        );

        return NextResponse.json({
            fData: result.rows[0] || null
        });

    } catch (error) {
        console.error('Error fetching Prilog F data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    context: ProcenaRouteContext
) {
    try {
        const { params } = context;
        const { id: procenaId } = await params;
        const body = await request.json();
        const pool = await getDbConnection();

        await pool.query(
            `INSERT INTO prilog_f_data (
                procena_id, 
                f1_podaci_o_organizaciji, f1_menadzer_rizika,
                f2_podaci_o_posmatranoj_org, f2_sifra_delatnosti, f2_odgovorno_lice, f2_podaci_o_licima,
                f3_eksterni_kontekst, f3_interni_kontekst,
                f4_identifikacija, f4_analiza, f4_vrednovanje,
                f6_zakljucak,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
            ON CONFLICT (procena_id) DO UPDATE SET
                f1_podaci_o_organizaciji = EXCLUDED.f1_podaci_o_organizaciji,
                f1_menadzer_rizika = EXCLUDED.f1_menadzer_rizika,
                f2_podaci_o_posmatranoj_org = EXCLUDED.f2_podaci_o_posmatranoj_org,
                f2_sifra_delatnosti = EXCLUDED.f2_sifra_delatnosti,
                f2_odgovorno_lice = EXCLUDED.f2_odgovorno_lice,
                f2_podaci_o_licima = EXCLUDED.f2_podaci_o_licima,
                f3_eksterni_kontekst = EXCLUDED.f3_eksterni_kontekst,
                f3_interni_kontekst = EXCLUDED.f3_interni_kontekst,
                f4_identifikacija = EXCLUDED.f4_identifikacija,
                f4_analiza = EXCLUDED.f4_analiza,
                f4_vrednovanje = EXCLUDED.f4_vrednovanje,
                f6_zakljucak = EXCLUDED.f6_zakljucak,
                updated_at = NOW()`,
            [
                procenaId,
                body.f1_podaci_o_organizaciji,
                body.f1_menadzer_rizika,
                body.f2_podaci_o_posmatranoj_org,
                body.f2_sifra_delatnosti,
                body.f2_odgovorno_lice,
                body.f2_podaci_o_licima,
                JSON.stringify(body.f3_eksterni_kontekst),
                JSON.stringify(body.f3_interni_kontekst),
                JSON.stringify(body.f4_identifikacija),
                JSON.stringify(body.f4_analiza),
                JSON.stringify(body.f4_vrednovanje),
                JSON.stringify(body.f6_zakljucak)
            ]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error saving Prilog F data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
