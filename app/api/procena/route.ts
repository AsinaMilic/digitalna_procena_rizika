import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../../lib/db';

export async function GET() {
    try {
        const pool = await getDbConnection();
        
        // Dobij sve procene sa podacima o pravnom licu
        const result = await pool.query(`
            SELECT 
                pr.id,
                pr.createdAt as datum,
                pr.status,
                pl.id as pravnoLiceId,
                pl.naziv,
                pl.pib,
                pl.adresa,
                -- Statistike za svaku procenu iz PrilogM tabele
                (SELECT COUNT(*)::integer FROM PrilogM pm WHERE pm.procenaId = pr.id) as ukupnoRizika,
                (SELECT COUNT(*)::integer FROM PrilogM pm WHERE pm.procenaId = pr.id AND pm.kategorijaRizika IN (1, 2)) as visokoRizicniRizici
            FROM ProcenaRizika pr
            INNER JOIN PravnoLice pl ON pr.pravnoLiceId = pl.id
            ORDER BY pr.createdAt DESC
        `);

        return NextResponse.json(result.rows);
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
        
        // Proveri da li već postoji aktivna procena za ovo pravno lice
        const existingAssessment = await pool.query(`
            SELECT id, status FROM ProcenaRizika 
            WHERE pravnoLiceId = $1 AND status = 'u_toku'
            ORDER BY createdAt DESC
            LIMIT 1
        `, [pravnoLiceId]);

        if (existingAssessment.rows.length > 0) {
            return NextResponse.json({
                error: 'Već postoji aktivna procena rizika za ovo pravno lice',
                existingProcenaId: existingAssessment.rows[0].id
            }, { status: 400 });
        }
        
        // Get the legal entity name for the assessment title
        const pravnoLiceResult = await pool.query('SELECT naziv FROM PravnoLice WHERE id = $1', [pravnoLiceId]);
        
        if (pravnoLiceResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Pravno lice sa datim ID ne postoji' },
                { status: 404 }
            );
        }
        
        const pravnoLiceNaziv = pravnoLiceResult.rows[0].naziv;
        
        // Kreiraj novu procenu
        const result = await pool.query(`
                INSERT INTO ProcenaRizika (naziv, pravnoLiceId, status)
                VALUES ($1, $2, 'u_toku')
                RETURNING id, createdAt, status
            `, [`Procena rizika - ${pravnoLiceNaziv}`, pravnoLiceId]);

        const novaProcena = result.rows[0];

        return NextResponse.json({
            success: true,
            procenaId: novaProcena.id,
            pravnoLiceId: pravnoLiceId,
            datum: novaProcena.createdAt,
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

export async function PUT(request: NextRequest) {
    try {
        const { procenaId, naziv_usluge, datum_izrade } = await request.json();
        
        if (!procenaId) {
            return NextResponse.json(
                { error: 'procenaId je obavezan' },
                { status: 400 }
            );
        }

        const pool = await getDbConnection();
        
        // Ažuriraj procenu sa novim podacima
        const result = await pool.query(`
            UPDATE ProcenaRizika 
            SET naziv_usluge = $1, datum_izrade = $2, updatedAt = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id, naziv_usluge, datum_izrade, 
                     datum_izrade + INTERVAL '3 years' as rok_vazenja
        `, [naziv_usluge, datum_izrade, procenaId]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Procena sa datim ID ne postoji' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Greška pri ažuriranju procene:', error);
        return NextResponse.json(
            { error: 'Greška pri ažuriranju procene' },
            { status: 500 }
        );
    }
}