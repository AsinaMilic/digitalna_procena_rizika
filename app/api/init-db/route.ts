import { NextResponse } from 'next/server';
import { createUsersTable, createRiskAssessmentTables } from '../../../lib/db';

export async function POST() {
    try {
        console.log('🚀 Initializing database tables...');

        // Create users table first
        await createUsersTable();
        console.log('✅ Users table created/verified');

        // Create risk assessment tables
        await createRiskAssessmentTables();
        console.log('✅ Risk assessment tables created/verified');

        return NextResponse.json({
            success: true,
            message: 'Database initialization completed successfully!',
            tables: [
                'korisnici',
                'PravnoLice',
                'ProcenaRizika',
                'RiskSelection',
                'PrilogM',
                'FinancialData'
            ]
        });

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        return NextResponse.json({
            success: false,
            error: 'Database initialization failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST method to initialize database tables',
        endpoint: '/api/init-db',
        method: 'POST'
    });
}