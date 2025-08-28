import {NextResponse} from "next/server";
import {getDbConnection} from "../../../lib/db";

export async function POST(req: Request) {
    try {
        const {
            naziv, 
            skraceno_poslovno_ime,
            pib, 
            maticni_broj,
            adresa_sediste,
            adresa_ostala,
            sifra_delatnosti,
            lice_zastupanje,
            lice_komunikacija,
            tim_procena_rizika,
            telefon_faks,
            internet_adresa,
            // Zadržavamo staru adresu za kompatibilnost
            adresa
        } = await req.json();
        
        if (!naziv || !pib) {
            return NextResponse.json({error: "Naziv i PIB su obavezni"}, {status: 400});
        }

        const pool = await getDbConnection();

        // Check if legal entity with this PIB already exists
        const existingEntity = await pool.query('SELECT id, naziv FROM PravnoLice WHERE pib = $1', [pib]);
        
        if (existingEntity.rows.length > 0) {
            return NextResponse.json({
                error: `Pravno lice sa PIB ${pib} već postoji (${existingEntity.rows[0].naziv})`
            }, {status: 400});
        }

        // Check if legal entity with this matični broj already exists (if provided)
        if (maticni_broj) {
            const existingMaticni = await pool.query('SELECT id, naziv FROM PravnoLice WHERE maticni_broj = $1', [maticni_broj]);
            if (existingMaticni.rows.length > 0) {
                return NextResponse.json({
                    error: `Pravno lice sa matičnim brojem ${maticni_broj} već postoji (${existingMaticni.rows[0].naziv})`
                }, {status: 400});
            }
        }

        // Insert pravno lice
        const pravnoLiceResult = await pool.query(`
                INSERT INTO PravnoLice (
                    naziv, 
                    skraceno_poslovno_ime,
                    pib, 
                    maticni_broj,
                    adresa,
                    adresa_sediste,
                    adresa_ostala,
                    sifra_delatnosti,
                    lice_zastupanje,
                    lice_komunikacija,
                    tim_procena_rizika,
                    telefon,
                    telefon_faks,
                    internet_adresa,
                    email
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING id
            `, [
                naziv, 
                skraceno_poslovno_ime || null,
                pib, 
                maticni_broj || null,
                adresa || adresa_sediste || null, // Kompatibilnost sa starom adresom
                adresa_sediste || null,
                adresa_ostala || null,
                sifra_delatnosti || null,
                lice_zastupanje || null,
                lice_komunikacija || null,
                tim_procena_rizika || null,
                telefon_faks || null, // Stara kolona telefon
                telefon_faks || null,
                internet_adresa || null,
                null // email - zadržavamo null za sada
            ]);

        const pravnoLiceId = pravnoLiceResult.rows[0].id;

        // Create new risk assessment for this legal entity
        const procenaResult = await pool.query(`
                INSERT INTO ProcenaRizika (naziv, pravnoLiceId, status) 
                VALUES ($1, $2, $3)
                RETURNING id
            `, [`Procena rizika - ${naziv}`, pravnoLiceId, 'u_toku']);

        const procenaId = procenaResult.rows[0].id;

        return NextResponse.json({
            success: true, 
            pravnoLiceId: pravnoLiceId,
            procenaId: procenaId
        });
    } catch (error) {
        console.error("Greška pri kreiranju pravnog lica:", error);
        
        // Handle specific PostgreSQL errors
        if (error && typeof error === 'object' && 'code' in error) {
            const pgError = error as { code: string; constraint?: string };
            
            if (pgError.code === '23505' && pgError.constraint === 'pravnolice_pib_key') {
                return NextResponse.json({
                    error: "Pravno lice sa ovim PIB brojem već postoji"
                }, {status: 400});
            }
        }
        
        return NextResponse.json({
            error: "Greška pri čuvanju podataka"
        }, {status: 500});
    }
}

export async function GET() {
    try {
        const pool = await getDbConnection();
        
        const result = await pool.query(`
            SELECT 
                pl.id,
                pl.naziv,
                pl.skraceno_poslovno_ime,
                pl.pib,
                pl.maticni_broj,
                pl.adresa,
                pl.adresa_sediste,
                pl.adresa_ostala,
                pl.sifra_delatnosti,
                pl.lice_zastupanje,
                pl.lice_komunikacija,
                pl.tim_procena_rizika,
                pl.telefon,
                pl.telefon_faks,
                pl.internet_adresa,
                pl.email,
                pr.id as procenaId,
                pr.createdAt as datum,
                pr.status,
                u.id as uslugaId,
                u.naziv_usluge,
                u.datum_izrade,
                u.opis as usluga_opis
            FROM PravnoLice pl
            LEFT JOIN ProcenaRizika pr ON pl.id = pr.pravnoLiceId
            LEFT JOIN Usluge u ON pl.id = u.pravnoLiceId
            ORDER BY pl.id, pr.createdAt DESC, u.createdAt DESC
        `);

        // Group the results by pravno lice
        const pravnaLicaMap = new Map();
        
        result.rows.forEach(row => {
            if (!pravnaLicaMap.has(row.id)) {
                pravnaLicaMap.set(row.id, {
                    id: row.id,
                    naziv: row.naziv,
                    skraceno_poslovno_ime: row.skraceno_poslovno_ime,
                    pib: row.pib,
                    maticni_broj: row.maticni_broj,
                    adresa: row.adresa,
                    adresa_sediste: row.adresa_sediste,
                    adresa_ostala: row.adresa_ostala,
                    sifra_delatnosti: row.sifra_delatnosti,
                    lice_zastupanje: row.lice_zastupanje,
                    lice_komunikacija: row.lice_komunikacija,
                    tim_procena_rizika: row.tim_procena_rizika,
                    telefon: row.telefon,
                    telefon_faks: row.telefon_faks,
                    internet_adresa: row.internet_adresa,
                    email: row.email,
                    procene: [],
                    usluge: []
                });
            }
            
            const pravnoLice = pravnaLicaMap.get(row.id);
            
            // Dodaj procenu ako postoji i nije već dodana
            if (row.procenaid && !pravnoLice.procene.find((p: { id: number }) => p.id === row.procenaid)) {
                pravnoLice.procene.push({
                    id: row.procenaid,
                    datum: row.datum,
                    status: row.status,
                    pravnoLiceId: row.id
                });
            }
            
            // Dodaj uslugu ako postoji i nije već dodana
            if (row.uslugaid && !pravnoLice.usluge.find((u: { id: number }) => u.id === row.uslugaid)) {
                pravnoLice.usluge.push({
                    id: row.uslugaid,
                    naziv_usluge: row.naziv_usluge,
                    datum_izrade: row.datum_izrade,
                    opis: row.usluga_opis
                });
            }
        });

        const pravnaLica = Array.from(pravnaLicaMap.values());
        return NextResponse.json(pravnaLica);
    } catch (error) {
        console.error("Greška pri dohvatanju pravnih lica:", error);
        return NextResponse.json({error: "Greška pri dohvatanju podataka"}, {status: 500});
    }
}

export async function PUT(req: Request) {
    try {
        const { pravnoLiceId, naziv_usluge, datum_izrade, opis } = await req.json();
        
        if (!pravnoLiceId || !naziv_usluge) {
            return NextResponse.json({error: "ID pravnog lica i naziv usluge su obavezni"}, {status: 400});
        }

        const pool = await getDbConnection();

        // Dodaj novu uslugu
        const result = await pool.query(`
            INSERT INTO Usluge (pravnoLiceId, naziv_usluge, datum_izrade, opis)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, [pravnoLiceId, naziv_usluge, datum_izrade || new Date().toISOString().split('T')[0], opis || null]);

        return NextResponse.json({
            success: true, 
            message: "Usluga je uspešno dodana",
            uslugaId: result.rows[0].id
        });
    } catch (error) {
        console.error("Greška pri dodavanju usluge:", error);
        return NextResponse.json({error: "Greška pri dodavanju usluge"}, {status: 500});
    }
}

export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({error: "ID pravnog lica je obavezan"}, {status: 400});
        }

        const pool = await getDbConnection();

        // Prvo obriši sve povezane procene rizika i njihove podatke
        // Koristi CASCADE DELETE koji je definisan u tabeli
        await pool.query('DELETE FROM FinancialData WHERE procenaId IN (SELECT id FROM ProcenaRizika WHERE pravnoLiceId = $1)', [id]);
        await pool.query('DELETE FROM PrilogM WHERE procenaId IN (SELECT id FROM ProcenaRizika WHERE pravnoLiceId = $1)', [id]);
        await pool.query('DELETE FROM RiskSelection WHERE procenaId IN (SELECT id FROM ProcenaRizika WHERE pravnoLiceId = $1)', [id]);
        
        // Obriši procene rizika
        await pool.query('DELETE FROM ProcenaRizika WHERE pravnoLiceId = $1', [id]);
        
        // Zatim obriši pravno lice
        const result = await pool.query('DELETE FROM PravnoLice WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({error: "Pravno lice nije pronađeno"}, {status: 404});
        }

        return NextResponse.json({success: true, message: "Pravno lice je uspešno obrisano"});
    } catch (error) {
        console.error("Greška pri brisanju pravnog lica:", error);
        return NextResponse.json({error: "Greška pri brisanju pravnog lica"}, {status: 500});
    }
}
