import {NextResponse} from 'next/server';
import {getDbConnection} from '../../../lib/db';

export async function GET() {
    try {
        const pool = await getDbConnection();
        
        // Test basic connection
        const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
        
        // Check if our tables exist
        const tablesCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        // Check data in key tables
        const procenaCount = await pool.query('SELECT COUNT(*) as count FROM ProcenaRizika');
        const pravnoLiceCount = await pool.query('SELECT COUNT(*) as count FROM PravnoLice');
        const prilogMCount = await pool.query('SELECT COUNT(*) as count FROM PrilogM');

        // Sample data from ProcenaRizika
        const sampleProcena = await pool.query('SELECT * FROM ProcenaRizika LIMIT 3');
        const samplePravnoLice = await pool.query('SELECT * FROM PravnoLice LIMIT 3');
        
        return NextResponse.json({
            success: true,
            message: 'Xata PostgreSQL connection successful',
            serverTime: result.rows[0].current_time,
            pgVersion: result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1],
            existingTables: tablesCheck.rows.map(row => row.table_name),
            dataCounts: {
                procenaRizika: parseInt(procenaCount.rows[0].count),
                pravnoLice: parseInt(pravnoLiceCount.rows[0].count),
                prilogM: parseInt(prilogMCount.rows[0].count)
            },
            sampleData: {
                procenaRizika: sampleProcena.rows,
                pravnoLice: samplePravnoLice.rows
            },
            connectionInfo: {
                database: 'Xata PostgreSQL',
                ssl: 'enabled'
            }
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        }, {status: 500});
    }
}
