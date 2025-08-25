import {NextResponse} from "next/server";
import {getDbConnection} from "../../../lib/db";

export async function POST(req: Request) {
    try {
        const {naziv, pib, adresa} = await req.json();
        
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

        // Insert pravno lice
        const pravnoLiceResult = await pool.query(`
                INSERT INTO PravnoLice (naziv, pib, adresa) 
                VALUES ($1, $2, $3)
                RETURNING id
            `, [naziv, pib, adresa || null]);

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
                pl.pib,
                pl.adresa,
                pr.id as procenaId,
                pr.createdAt as datum,
                pr.status,
                pr.naziv_usluge,
                pr.datum_izrade,
                CASE 
                    WHEN pr.datum_izrade IS NOT NULL 
                    THEN pr.datum_izrade + INTERVAL '3 years'
                    ELSE NULL 
                END as rok_vazenja
            FROM PravnoLice pl
            LEFT JOIN ProcenaRizika pr ON pl.id = pr.pravnoLiceId
            ORDER BY pl.id, pr.createdAt DESC
        `);

        // Group the results by pravno lice
        const pravnaLicaMap = new Map();
        
        result.rows.forEach(row => {
            if (!pravnaLicaMap.has(row.id)) {
                pravnaLicaMap.set(row.id, {
                    id: row.id,
                    naziv: row.naziv,
                    pib: row.pib,
                    adresa: row.adresa,
                    procene: []
                });
            }
            
            if (row.procenaid) { // PostgreSQL vraća lowercase nazive kolona
                pravnaLicaMap.get(row.id).procene.push({
                    id: row.procenaid,
                    datum: row.datum,
                    status: row.status,
                    pravnoLiceId: row.id,
                    naziv_usluge: row.naziv_usluge,
                    datum_izrade: row.datum_izrade,
                    rok_vazenja: row.rok_vazenja
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
