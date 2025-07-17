import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';

export async function POST() {
    try {
        const pool = await getDbConnection();
        
        // Create a test legal entity first
        const pravnoLiceResult = await pool.request()
            .input('naziv', 'Test Kompanija d.o.o.')
            .input('pib', '123456789')
            .input('adresa', 'Test adresa 123, Beograd')
            .query(`
                IF NOT EXISTS (SELECT * FROM PravnaLica WHERE pib = @pib)
                BEGIN
                    INSERT INTO PravnaLica (naziv, pib, adresa, telefon, email)
                    OUTPUT INSERTED.id
                    VALUES (@naziv, @pib, @adresa, '+381 11 123 4567', 'test@test.com')
                END
                ELSE
                BEGIN
                    SELECT id FROM PravnaLica WHERE pib = @pib
                END
            `);
        
        const pravnoLiceId = pravnoLiceResult.recordset[0]?.id;
        
        // Get the admin user ID
        const adminUser = await pool.request()
            .query('SELECT TOP 1 id FROM korisnici WHERE je_admin = 1');
            
        if (adminUser.recordset.length === 0) {
            throw new Error('No admin user found. Please ensure the database is properly initialized.');
        }
        
        // Create a test risk assessment (without foreign key constraints for now)
        const procenaResult = await pool.request()
            .input('naziv', 'Test Procena Rizika')
            .input('opis', 'Ovo je test procena rizika kreirana automatski za testiranje sistema')
            .query(`
                INSERT INTO ProcenaRizika (naziv, opis, status)
                OUTPUT INSERTED.id
                VALUES (@naziv, @opis, 'u_toku')
            `);
        
        const procenaId = procenaResult.recordset[0].id;
        
        return NextResponse.json({
            success: true,
            message: 'Test risk assessment created successfully',
            data: {
                procenaId,
                pravnoLiceId,
                testUrl: `/optimized-risk/${procenaId}`
            }
        });
        
    } catch (error) {
        console.error('Failed to create test risk assessment:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create test risk assessment',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}