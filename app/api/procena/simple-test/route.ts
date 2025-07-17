import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';

export async function POST() {
    try {
        const pool = await getDbConnection();
        
        // Simple insert without foreign key constraints
        const result = await pool.request()
            .query(`
                INSERT INTO ProcenaRizika (naziv, opis, status, createdAt, updatedAt)
                OUTPUT INSERTED.id
                VALUES ('Test Procena Rizika', 'Test opis', 'u_toku', GETDATE(), GETDATE())
            `);
        
        const procenaId = result.recordset[0].id;
        
        return NextResponse.json({
            success: true,
            message: 'Simple test risk assessment created',
            procenaId: procenaId,
            testUrl: `http://localhost:3000/optimized-risk/${procenaId}`
        });
        
    } catch (error) {
        console.error('Error creating simple test:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}