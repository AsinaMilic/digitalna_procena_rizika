import {NextRequest, NextResponse} from 'next/server';
import {getDbConnection} from '../../../lib/db';

export async function GET(request: NextRequest) {
    try {
        const pool = await getDbConnection();
        const result = await pool.request().query('SELECT 1 AS ok');
        return NextResponse.json({success: true, result: result.recordset});
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : error,
            stack: error?.stack
        }, {status: 500});
    }
}
