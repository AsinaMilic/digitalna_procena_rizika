import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../../../../lib/db';

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

        // Validacija statusa
        const validStatuses = ['u_toku', 'zavrsena', 'na_cekanju', 'otkazana'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Nevaljan status' },
                { status: 400 }
            );
        }

        const pool = await getDbConnection();
        
        // Ažuriraj status procene
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
            message: 'Status je uspešno ažuriran' 
        });

    } catch (error) {
        console.error('Greška pri ažuriranju statusa:', error);
        return NextResponse.json(
            { error: 'Greška pri ažuriranju statusa' },
            { status: 500 }
        );
    }
}