import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const procenaId = id;
        const pool = await getDbConnection();

        // Dobij procenu sa podacima o pravnom licu
        const result = await pool.query(`
                SELECT 
                    pr.id,
                    pr.createdAt as datum,
                    pr.status,
                    pl.id as pravnoLiceId,
                    pl.naziv,
                    pl.pib,
                    pl.adresa
                FROM ProcenaRizika pr
                INNER JOIN PravnoLice pl ON pr.pravnoLiceId = pl.id
                WHERE pr.id = $1
            `, [procenaId]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Procena nije pronađena' },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Greška pri dobijanju procene:', error);
        return NextResponse.json(
            { error: 'Greška pri dobijanju procene' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const procenaId = id;
        const pool = await getDbConnection();

        // Start transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Delete related data (PrilogM has CASCADE delete, so it will be deleted automatically)
            await client.query('DELETE FROM RiskSelection WHERE procenaId = $1', [procenaId]);

            // Delete main assessment
            const result = await client.query('DELETE FROM ProcenaRizika WHERE id = $1', [procenaId]);

            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: 'Procena nije pronađena' },
                    { status: 404 }
                );
            }

            await client.query('COMMIT');

            return NextResponse.json({
                success: true,
                message: 'Procena je uspešno obrisana'
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Greška pri brisanju procene:', error);
        return NextResponse.json(
            { error: 'Greška pri brisanju procene' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { status } = await request.json();
        const { id } = await params;
        const procenaId = id;

        if (!status) {
            return NextResponse.json(
                { error: 'Status je obavezan' },
                { status: 400 }
            );
        }

        const pool = await getDbConnection();

        const result = await pool.query(`
                UPDATE ProcenaRizika 
                SET status = $1
                WHERE id = $2
            `, [status, procenaId]);

        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: 'Procena nije pronađena' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Procena je uspešno ažurirana'
        });

    } catch (error) {
        console.error('Greška pri ažuriranju procene:', error);
        return NextResponse.json(
            { error: 'Greška pri ažuriranju procene' },
            { status: 500 }
        );
    }
}