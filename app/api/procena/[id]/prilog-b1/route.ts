import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../../../../lib/db';
import { ProcenaRouteContext } from '../../../types';

export async function GET(
    request: NextRequest,
    context: ProcenaRouteContext
) {
    try {
        const { id: procenaId } = await context.params;

        const pool = await getDbConnection();

        const result = await pool.query(`
            SELECT * FROM prilog_b1 
            WHERE procena_id = $1
            ORDER BY group_id
        `, [procenaId]);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Greška pri dohvatanju Prilog B1 podataka:', error);
        return NextResponse.json({ error: 'Greška pri dohvatanju podataka' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    context: ProcenaRouteContext
) {
    try {
        const { id: procenaId } = await context.params;
        const { groupId, uticaj } = await request.json();

        const pool = await getDbConnection();

        // Server-side calculation
        const iud = uticaj / 100;

        // Calculate K (Criticality Degree) - Inverse of impact
        // Logic: Higher impact -> Lower K (Higher Criticality)
        // K=1 (Vrlo velika), K=5 (Minimalna)
        let k = 5;
        if (uticaj > 20) k = 1;
        else if (uticaj > 15) k = 2;
        else if (uticaj > 10) k = 3;
        else if (uticaj > 5) k = 4;
        else k = 5;

        // Calculate VK (Criticality Magnitude) - Inverse of K
        // Logic: VK is inversely proportional to K
        // If K=1, VK=5. If K=5, VK=1.
        const vk = 6 - k;

        // Proveri da li već postoji zapis
        const existingResult = await pool.query(`
            SELECT id FROM prilog_b1 
            WHERE procena_id = $1 AND group_id = $2
        `, [procenaId, groupId]);

        if (existingResult.rows.length > 0) {
            // Ažuriraj postojeći zapis
            await pool.query(`
                UPDATE prilog_b1 
                SET uticaj = $1, iud = $2, vk = $3, k = $4, updated_at = CURRENT_TIMESTAMP
                WHERE procena_id = $5 AND group_id = $6
            `, [uticaj, iud, vk, k, procenaId, groupId]);
        } else {
            // Kreiraj novi zapis
            await pool.query(`
                INSERT INTO prilog_b1 (procena_id, group_id, uticaj, iud, vk, k, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [procenaId, groupId, uticaj, iud, vk, k]);
        }

        return NextResponse.json({ success: true, iud, vk, k });
    } catch (error) {
        console.error('Greška pri čuvanju Prilog B1 podataka:', error);
        return NextResponse.json({ error: 'Greška pri čuvanju podataka' }, { status: 500 });
    }
}
