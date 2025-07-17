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
        const result = await pool.request()
            .input('procenaId', procenaId)
            .query(`
                SELECT 
                    pr.id,
                    pr.datum,
                    pr.status,
                    pl.id as pravnoLiceId,
                    pl.naziv,
                    pl.pib,
                    pl.adresa
                FROM ProcenaRizika pr
                INNER JOIN PravnoLice pl ON pr.pravnoLiceId = pl.id
                WHERE pr.id = @procenaId
            `);

        if (result.recordset.length === 0) {
            return NextResponse.json(
                { error: 'Procena nije pronađena' },
                { status: 404 }
            );
        }

        return NextResponse.json(result.recordset[0]);
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

        // Počni transakciju
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            // Obriši povezane podatke
            await transaction.request()
                .input('procenaId', procenaId)
                .query('DELETE FROM RiskSelection WHERE procenaId = @procenaId');

            await transaction.request()
                .input('procenaId', procenaId)
                .query('DELETE FROM RiskRegister WHERE procenaId = @procenaId');

            await transaction.request()
                .input('procenaId', procenaId)
                .query('DELETE FROM UnosRizika WHERE procenaId = @procenaId');

            // Obriši glavnu procenu
            const result = await transaction.request()
                .input('procenaId', procenaId)
                .query('DELETE FROM ProcenaRizika WHERE id = @procenaId');

            if (result.rowsAffected[0] === 0) {
                await transaction.rollback();
                return NextResponse.json(
                    { error: 'Procena nije pronađena' },
                    { status: 404 }
                );
            }

            await transaction.commit();

            return NextResponse.json({
                success: true,
                message: 'Procena je uspešno obrisana'
            });

        } catch (error) {
            await transaction.rollback();
            throw error;
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

        const result = await pool.request()
            .input('procenaId', procenaId)
            .input('status', status)
            .query(`
                UPDATE ProcenaRizika 
                SET status = @status
                WHERE id = @procenaId
            `);

        if (result.rowsAffected[0] === 0) {
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