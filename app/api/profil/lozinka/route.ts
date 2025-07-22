import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PUT(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ greška: 'Neautorizovan pristup' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as { id: number };
        } catch {
            return NextResponse.json({ greška: 'Nevažeći token' }, { status: 401 });
        }

        const { trenutnaLozinka, novaLozinka } = await request.json();

        if (!trenutnaLozinka || !novaLozinka) {
            return NextResponse.json({ greška: 'Trenutna i nova lozinka su obavezne' }, { status: 400 });
        }

        if (novaLozinka.length < 6) {
            return NextResponse.json({ greška: 'Nova lozinka mora imati najmanje 6 karaktera' }, { status: 400 });
        }

        const pool = await getDbConnection();

        // Pronađi korisnika
        const korisnikResult = await pool.query('SELECT id, lozinka FROM korisnici WHERE id = $1', [decoded.id]);

        if (korisnikResult.rows.length === 0) {
            return NextResponse.json({ greška: 'Korisnik nije pronađen' }, { status: 404 });
        }

        const korisnik = korisnikResult.rows[0];

        // Proveri trenutnu lozinku
        const isCurrentPasswordValid = await bcrypt.compare(trenutnaLozinka, korisnik.lozinka);
        if (!isCurrentPasswordValid) {
            return NextResponse.json({ greška: 'Trenutna lozinka nije tačna' }, { status: 400 });
        }

        // Hash nova lozinka
        const hashedNewPassword = await bcrypt.hash(novaLozinka, 10);

        // Ažuriraj lozinku
        await pool.query('UPDATE korisnici SET lozinka = $1 WHERE id = $2', [hashedNewPassword, decoded.id]);

        return NextResponse.json({
            poruka: 'Lozinka je uspešno promenjena'
        });

    } catch (error) {
        console.error('Greška pri promeni lozinke:', error);
        return NextResponse.json({ greška: 'Interna greška servera' }, { status: 500 });
    }
}