import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../lib/db';

export async function GET() {
    try {
        const pool = await getDbConnection();
        
        // Test basic connection
        const result = await pool.request().query('SELECT GETDATE() as currentTime, @@VERSION as version');
        
        // Check if our tables exist
        const tablesCheck = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' 
            AND TABLE_NAME IN ('korisnici', 'ProcenaRizika', 'RiskSelection', 'PrilogM', 'PravnaLica')
            ORDER BY TABLE_NAME
        `);
        
        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            serverTime: result.recordset[0].currentTime,
            sqlVersion: result.recordset[0].version.split('\n')[0], // First line only
            existingTables: tablesCheck.recordset.map(row => row.TABLE_NAME),
            connectionStatus: pool.connected ? 'Connected' : 'Disconnected'
        });
        
    } catch (error) {
        console.error('Database connection test failed:', error);
        return NextResponse.json({
            success: false,
            error: 'Database connection failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}