import {NextResponse} from "next/server";
import {getDbConnection} from "../../../lib/db";

export async function POST(req: Request) {
    try {
        const {naziv, pib, adresa} = await req.json();
        
        if (!naziv || !pib) {
            return NextResponse.json({error: "Naziv i PIB su obavezni"}, {status: 400});
        }

        const pool = await getDbConnection();

        // Insert pravno lice
        const pravnoLiceResult = await pool.request()
            .input('naziv', naziv)
            .input('pib', pib)
            .input('adresa', adresa || null)
            .query(`
                INSERT INTO PravnoLice (naziv, pib, adresa) 
                OUTPUT INSERTED.id
                VALUES (@naziv, @pib, @adresa)
            `);

        const pravnoLiceId = pravnoLiceResult.recordset[0].id;

        // Create new risk assessment for this legal entity
        const procenaResult = await pool.request()
            .input('pravnoLiceId', pravnoLiceId)
            .input('status', 'u_toku')
            .query(`
                INSERT INTO ProcenaRizika (pravnoLiceId, datum, status) 
                OUTPUT INSERTED.id
                VALUES (@pravnoLiceId, GETDATE(), @status)
            `);

        const procenaId = procenaResult.recordset[0].id;

        return NextResponse.json({
            success: true, 
            pravnoLiceId: pravnoLiceId,
            procenaId: procenaId
        });
    } catch (error) {
        console.error("Greška pri kreiranju pravnog lica:", error);
        return NextResponse.json({error: "Greška pri čuvanju podataka"}, {status: 500});
    }
}

export async function GET(req: Request) {
    try {
        const pool = await getDbConnection();
        
        const result = await pool.request().query(`
            SELECT 
                pl.id,
                pl.naziv,
                pl.pib,
                pl.adresa,
                pr.id as procenaId,
                pr.datum,
                pr.status
            FROM PravnoLice pl
            LEFT JOIN ProcenaRizika pr ON pl.id = pr.pravnoLiceId
            ORDER BY pl.id
        `);

        // Group the results by pravno lice
        const pravnaLicaMap = new Map();
        
        result.recordset.forEach(row => {
            if (!pravnaLicaMap.has(row.id)) {
                pravnaLicaMap.set(row.id, {
                    id: row.id,
                    naziv: row.naziv,
                    pib: row.pib,
                    adresa: row.adresa,
                    procene: []
                });
            }
            
            if (row.procenaId) {
                pravnaLicaMap.get(row.id).procene.push({
                    id: row.procenaId,
                    datum: row.datum,
                    status: row.status,
                    pravnoLiceId: row.id
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
