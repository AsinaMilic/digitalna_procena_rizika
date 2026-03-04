import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../lib/db';

export async function GET() {
    try {
        const pool = await getDbConnection();
        
        // Test basic connection
        const result = await pool.query<{current_time: Date; pg_version: string}>('SELECT GETDATE() as current_time, @@VERSION as pg_version');
        
        // Check if our tables exist
        const tablesCheck = await pool.query<{table_name: string}>(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_type = 'BASE TABLE' 
            AND table_schema = 'dbo'
            ORDER BY table_name
        `);
        
        // Get counts
        const procenaCount = await pool.query<{count: number}>('SELECT COUNT(*) as count FROM ProcenaRizika');
        const prilogMCount = await pool.query<{count: number}>('SELECT COUNT(*) as count FROM PrilogM');
        const riskSelectionCount = await pool.query<{count: number}>('SELECT COUNT(*) as count FROM RiskSelection');
        
        return NextResponse.json({
            success: true,
            message: 'Azure SQL Database connection successful',
            serverTime: result.rows[0].current_time,
            sqlVersion: result.rows[0].pg_version.split('\n')[0],
            existingTables: tablesCheck.rows.map(row => row.table_name),
            dataCounts: {
                procenaRizika: parseInt(String(procenaCount.rows[0].count)),
                prilogM: parseInt(String(prilogMCount.rows[0].count)),
                riskSelection: parseInt(String(riskSelectionCount.rows[0].count))
            },
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
