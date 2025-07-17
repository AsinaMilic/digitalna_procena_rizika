import {NextRequest, NextResponse} from 'next/server';
import jwt from 'jsonwebtoken';
import {getDbConnection} from '../../../../lib/db';

interface JWTPayload {
    id: number;
    je_admin: boolean;
}

// Dobijanje svih korisnika na čekanju (i ostalih, exkluduj admina)
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({greška: 'Nemate dozvolu'}, {status: 401});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        if (!decoded.je_admin) {
            return NextResponse.json({greška: 'Nemate admin dozvolu'}, {status: 403});
        }
        const pool = await getDbConnection();
        const result = await pool.request().query(`
      SELECT id, email, ime, prezime, status, datum_kreiranja 
      FROM korisnici 
      WHERE je_admin = 0
      ORDER BY datum_kreiranja DESC
    `);
        return NextResponse.json(result.recordset);
    } catch (error) {
        console.error('Greška:', error);
        return NextResponse.json({greška: 'Došlo je do greške'}, {status: 500});
    }
}

// Odobravanje/odbacivanje korisnika
export async function PUT(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({greška: 'Nemate dozvolu'}, {status: 401});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        if (!decoded.je_admin) {
            return NextResponse.json({greška: 'Nemate admin dozvolu'}, {status: 403});
        }
        const {korisnikId, status} = await request.json();
        const pool = await getDbConnection();
        await pool.request()
            .input('korisnikId', korisnikId)
            .input('status', status)
            .input('adminId', decoded.id)
            .query(`
        UPDATE korisnici 
        SET status = @status, 
            datum_odobrenja = GETDATE(),
            odobrio_admin = @adminId
        WHERE id = @korisnikId
      `);
        return NextResponse.json({poruka: 'Uspešno ažurirano'});
    } catch (error) {
        console.error('Greška:', error);
        return NextResponse.json({greška: 'Došlo je do greške'}, {status: 500});
    }
}
