import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../lib/db';

export async function GET() {
    try {
        const pool = await getDbConnection();
        
        // Test basic connection
        const result = await pool.query('SELECT NOW() as currentTime, version() as version');
        
        // Check if our tables exist
        const tablesCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_type = 'BASE TABLE' 
            AND table_schema = 'public'
            AND table_name IN ('korisnici', 'procenarizika', 'riskselection', 'prilogm', 'pravnolice')
            ORDER BY table_name
        `);
        
        return NextResponse.json({
            success: true,
            message: 'Xata PostgreSQL connection successful',
            serverTime: result.rows[0].currenttime,
            pgVersion: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1],
            existingTables: tablesCheck.rows.map(row => row.table_name),
            connectionInfo: 'Xata PostgreSQL Database'
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