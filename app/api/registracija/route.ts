import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDbConnection, createUsersTable } from '../../../lib/db';

export async function POST(request: NextRequest) {
    try {
        const { email, lozinka, ime, prezime } = await request.json();

        if (!email || !lozinka || !ime || !prezime) {
            return NextResponse.json(
                { greška: 'Sva polja su obavezna' },
                { status: 400 }
            );
        }

        // Kreiranje tabele ako ne postoji
        await createUsersTable();

        const pool = await getDbConnection();

        // Proverava da li korisnik već postoji
        const existingUser = await pool
            .request()
            .input('email', email)
            .query('SELECT * FROM korisnici WHERE email = @email');

        if (existingUser.recordset.length > 0) {
            return NextResponse.json(
                { greška: 'Korisnik sa ovim email-om već postoji' },
                { status: 400 }
            );
        }

        // Hashovanje lozinke
        const hashedPassword = await bcrypt.hash(lozinka, 10);

        // Kreiranje novog korisnika sa statusom na_cekanju
        await pool
            .request()
            .input('email', email)
            .input('lozinka', hashedPassword)
            .input('ime', ime)
            .input('prezime', prezime)
            .query(`
        INSERT INTO korisnici (email, lozinka, ime, prezime, status)
        VALUES (@email, @lozinka, @ime, @prezime, 'na_cekanju')
      `);

        return NextResponse.json(
            { poruka: 'Uspešno ste se registrovali! Sačekajte odobrenje administratora.' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Greška pri registraciji:', error);
        return NextResponse.json(
            { greška: 'Došlo je do greške pri registraciji' },
            { status: 500 }
        );
    }
}
