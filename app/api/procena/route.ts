import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../../lib/db';

export async function GET() {
    try {
        const pool = await getDbConnection();
        
        // Dobij sve procene sa podacima o pravnom licu
        const result = await pool.request().query(`
            SELECT 
                pr.id,
                pr.datum,
                pr.status,
                pl.id as pravnoLiceId,
                pl.naziv,
                pl.pib,
                pl.adresa,
                -- Statistike za svaku procenu
                (SELECT COUNT(*) FROM RiskSelection rs WHERE rs.procenaId = pr.id) as ukupnoRizika,
                (SELECT COUNT(*) FROM RiskSelection rs WHERE rs.procenaId = pr.id AND rs.dangerLevel >= 4) as visokoRizicniRizici
            FROM ProcenaRizika pr
            INNER JOIN PravnoLice pl ON pr.pravnoLiceId = pl.id
            ORDER BY pr.datum DESC
        `);

        return NextResponse.json(result.recordset);
    } catch (error) {
        console.error('Greška pri dobijanju procena:', error);
        return NextResponse.json(
            { error: 'Greška pri dobijanju procena' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { pravnoLiceId } = await request.json();
        
        if (!pravnoLiceId) {
            return NextResponse.json(
                { error: 'pravnoLiceId je obavezan' },
                { status: 400 }
            );
        }

        const pool = await getDbConnection();
        
        // Kreiraj novu procenu
        const result = await pool.request()
            .input('pravnoLiceId', pravnoLiceId)
            .query(`
                INSERT INTO ProcenaRizika (pravnoLiceId, datum, status)
                OUTPUT INSERTED.id, INSERTED.datum, INSERTED.status
                VALUES (@pravnoLiceId, GETDATE(), 'u_toku')
            `);

        const novaProcena = result.recordset[0];

        return NextResponse.json({
            id: novaProcena.id,
            pravnoLiceId: pravnoLiceId,
            datum: novaProcena.datum,
            status: novaProcena.status
        });
    } catch (error) {
        console.error('Greška pri kreiranju procene:', error);
        return NextResponse.json(
            { error: 'Greška pri kreiranju procene' },
            { status: 500 }
        );
    }
}