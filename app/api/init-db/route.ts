import { NextResponse } from 'next/server';
import { initializeDatabase } from '../../../lib/db';

export async function GET() {
    // Disable in production for security
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'Endpoint disabled in production' },
            { status: 403 }
        );
    }

    try {
        await initializeDatabase();

        return NextResponse.json({
            success: true,
            message: '✅ Baza je uspešno inicijalizovana! Svi postojeći podaci su obrisani. Admin: admin@admin.com / admin123'
        });

    } catch (error) {
        console.error('Greška pri inicijalizaciji baze:', error);
        return NextResponse.json(
            { error: 'Greška pri inicijalizaciji baze podataka: ' + error },
            { status: 500 }
        );
    }
}