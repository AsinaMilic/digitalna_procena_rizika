import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: procenaId } = await params;
        const { getDbConnection } = await import('../../../../../lib/db');
        const pool = await getDbConnection();

        const result = await pool.query(`
            SELECT * FROM prilog_s 
            WHERE procena_id = $1
            ORDER BY item_id
        `, [procenaId]);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Greška pri dohvatanju Prilog S podataka:', error);
        return NextResponse.json({ error: 'Greška pri dohvatanju podataka' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: procenaId } = await params;
        const { itemId, vrednost } = await request.json();
        const { getDbConnection } = await import('../../../../../lib/db');
        const pool = await getDbConnection();

        // Proveri da li već postoji zapis
        const existingResult = await pool.query(`
            SELECT id FROM prilog_s 
            WHERE procena_id = $1 AND item_id = $2
        `, [procenaId, itemId]);

        if (existingResult.rows.length > 0) {
            // Ažuriraj postojeći zapis
            await pool.query(`
                UPDATE prilog_s 
                SET vrednost = $1, updated_at = CURRENT_TIMESTAMP
                WHERE procena_id = $2 AND item_id = $3
            `, [vrednost, procenaId, itemId]);
        } else {
            // Kreiraj novi zapis
            await pool.query(`
                INSERT INTO prilog_s (procena_id, item_id, vrednost, created_at, updated_at)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [procenaId, itemId, vrednost]);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Greška pri čuvanju Prilog S podataka:', error);
        return NextResponse.json({ error: 'Greška pri čuvanju podataka' }, { status: 500 });
    }
}