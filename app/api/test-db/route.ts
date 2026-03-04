import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../lib/db';

export async function GET() {
    try {
        const pool = await getDbConnection();
        
        // Test basic connection
        const result = await pool.query<{currentTime: Date; version: string}>('SELECT GETDATE() as currentTime, @@VERSION as version');
        
        // Check if our tables exist
        const tablesCheck = await pool.query<{table_name: string}>(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_type = 'BASE TABLE' 
            AND table_schema = 'dbo'
            AND table_name IN ('korisnici', 'ProcenaRizika', 'RiskSelection', 'PrilogM', 'PravnoLice')
            ORDER BY table_name
        `);
        
        return NextResponse.json({
            success: true,
            message: 'Azure SQL Database connection successful',
            serverTime: result.rows[0].currentTime,
            sqlVersion: result.rows[0].version.split('\n')[0],
            existingTables: tablesCheck.rows.map(row => row.table_name),
            connectionInfo: 'Azure SQL Database'
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
