import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '../../../../../lib/db';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const pravnoLiceId = parseInt(id);

        if (!pravnoLiceId) {
            return NextResponse.json(
                { error: 'Neispravan ID pravnog lica' },
                { status: 400 }
            );
        }

        const pool = await getDbConnection();

        // Učitaj podatke o organizaciji
        const orgResult = await pool.query(
            `SELECT * FROM OrganizacijaProceneRizika WHERE pravnoLiceId = $1`,
            [pravnoLiceId]
        );

        let organizacija = orgResult.rows[0];

        // Ako ne postoji, kreiraj sa default vrednostima
        if (!organizacija) {
            const createResult = await pool.query(
                `INSERT INTO OrganizacijaProceneRizika (pravnoLiceId) 
         VALUES ($1) 
         RETURNING *`,
                [pravnoLiceId]
            );
            organizacija = createResult.rows[0];

            // Dodaj default članove tima
            await pool.query(
                `INSERT INTO ClanoviTimaProceneRizika (organizacijaId, ime, broj_licence, redni_broj)
         VALUES 
           ($1, 'Ivana Stanković, spec. strukovni ssc', '03.27 broj 34147 od 14.07.2023. godine', 1),
           ($1, 'Mihajlo Milošević, master inž. ZKS', '03.27 broj 21445 od 06.07.2022. godine', 2)`,
                [organizacija.id]
            );
        }

        // Učitaj članove tima
        const clanoviResult = await pool.query(
            `SELECT * FROM ClanoviTimaProceneRizika 
       WHERE organizacijaId = $1 
       ORDER BY redni_broj`,
            [organizacija.id]
        );

        return NextResponse.json({
            organizacija,
            clanoviTima: clanoviResult.rows
        });
    } catch (error) {
        console.error('Greška pri učitavanju podataka o organizaciji:', error);
        return NextResponse.json(
            { error: 'Greška pri učitavanju podataka' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const pravnoLiceId = parseInt(id);
        const data = await request.json();

        if (!pravnoLiceId) {
            return NextResponse.json(
                { error: 'Neispravan ID pravnog lica' },
                { status: 400 }
            );
        }

        const pool = await getDbConnection();

        // Ažuriraj ili kreiraj organizaciju
        const orgResult = await pool.query(
            `INSERT INTO OrganizacijaProceneRizika (
        pravnoLiceId, poslovno_ime, adresa_sediste, maticni_broj, pib, 
        broj_licence, menadzer_ime, menadzer_licence
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (pravnoLiceId) DO UPDATE SET
        poslovno_ime = $2,
        adresa_sediste = $3,
        maticni_broj = $4,
        pib = $5,
        broj_licence = $6,
        menadzer_ime = $7,
        menadzer_licence = $8,
        updatedAt = CURRENT_TIMESTAMP
      RETURNING *`,
            [
                pravnoLiceId,
                data.organizacija.poslovno_ime,
                data.organizacija.adresa_sediste,
                data.organizacija.maticni_broj,
                data.organizacija.pib,
                data.organizacija.broj_licence,
                data.organizacija.menadzer_ime,
                data.organizacija.menadzer_licence
            ]
        );

        const organizacija = orgResult.rows[0];

        // Obriši postojeće članove tima
        await pool.query(
            `DELETE FROM ClanoviTimaProceneRizika WHERE organizacijaId = $1`,
            [organizacija.id]
        );

        // Dodaj nove članove tima
        if (data.clanoviTima && data.clanoviTima.length > 0) {
            for (let i = 0; i < data.clanoviTima.length; i++) {
                const clan = data.clanoviTima[i];
                await pool.query(
                    `INSERT INTO ClanoviTimaProceneRizika (organizacijaId, ime, broj_licence, redni_broj)
           VALUES ($1, $2, $3, $4)`,
                    [organizacija.id, clan.ime, clan.broj_licence, i + 1]
                );
            }
        }

        // Učitaj sve članove
        const clanoviResult = await pool.query(
            `SELECT * FROM ClanoviTimaProceneRizika 
       WHERE organizacijaId = $1 
       ORDER BY redni_broj`,
            [organizacija.id]
        );

        return NextResponse.json({
            success: true,
            organizacija,
            clanoviTima: clanoviResult.rows
        });
    } catch (error) {
        console.error('Greška pri čuvanju podataka o organizaciji:', error);
        return NextResponse.json(
            { error: 'Greška pri čuvanju podataka' },
            { status: 500 }
        );
    }
}
