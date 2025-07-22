import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../../lib/db';
import jwt from 'jsonwebtoken';

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

        const { ime, prezime, email } = await request.json();

        if (!ime || !prezime || !email) {
            return NextResponse.json({ greška: 'Sva polja su obavezna' }, { status: 400 });
        }

        const pool = await getDbConnection();

        // Proveri da li email već postoji (osim za trenutnog korisnika)
        const existingUserResult = await pool.query('SELECT id FROM korisnici WHERE email = $1 AND id != $2', [email, decoded.id]);

        if (existingUserResult.rows.length > 0) {
            return NextResponse.json({ greška: 'Email adresa već postoji' }, { status: 400 });
        }

        // Ažuriraj korisnika
        await pool.query('UPDATE korisnici SET ime = $1, prezime = $2, email = $3 WHERE id = $4', [ime, prezime, email, decoded.id]);

        // Vrati ažurirane podatke
        const updatedUserResult = await pool.query('SELECT id, email, ime, prezime, je_admin FROM korisnici WHERE id = $1', [decoded.id]);

        const updatedUser = updatedUserResult.rows[0];

        return NextResponse.json({
            poruka: 'Profil je uspešno ažuriran',
            korisnik: updatedUser
        });

    } catch (error) {
        console.error('Greška pri ažuriranju profila:', error);
        return NextResponse.json({ greška: 'Interna greška servera' }, { status: 500 });
    }
}