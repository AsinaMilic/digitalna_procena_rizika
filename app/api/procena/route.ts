import {NextResponse} from "next/server";
import {getDbConnection} from "../../../lib/db";

export async function POST(req: Request) {
    try {
        const {pravnoLiceId} = await req.json();
        
        if (!pravnoLiceId) {
            return NextResponse.json({error: "pravnoLiceId je obavezan"}, {status: 400});
        }

        const pool = await getDbConnection();

        const result = await pool.request()
            .input('pravnoLiceId', pravnoLiceId)
            .input('status', 'u_toku')
            .query(`
                INSERT INTO ProcenaRizika (pravnoLiceId, datum, status) 
                OUTPUT INSERTED.id
                VALUES (@pravnoLiceId, GETDATE(), @status)
            `);

        const procenaId = result.recordset[0].id;

        return NextResponse.json({success: true, id: procenaId});
    } catch (error) {
        console.error("Greška pri kreiranju procene:", error);
        return NextResponse.json({error: "Greška pri čuvanju podataka"}, {status: 500});
    }
}

export async function GET(req: Request) {
    try {
        const pool = await getDbConnection();

        const result = await pool.request().query(`
            SELECT 
                pr.id, pr.datum, pr.status, pr.pravnoLiceId,
                pl.naziv, pl.pib, pl.adresa,
                ur.id as unosId, ur.grupaId, ur.polje, ur.vrednost,
                gr.naziv as grupaNaziv, gr.redosled
            FROM ProcenaRizika pr
            JOIN PravnoLice pl ON pr.pravnoLiceId = pl.id
            LEFT JOIN UnosRizika ur ON pr.id = ur.procenaId
            LEFT JOIN GrupaRizika gr ON ur.grupaId = gr.id
            ORDER BY pr.id, gr.redosled
        `);

        // Group the results by procena
        const proceneMap = new Map();
        
        result.recordset.forEach(row => {
            if (!proceneMap.has(row.id)) {
                proceneMap.set(row.id, {
                    id: row.id,
                    datum: row.datum,
                    status: row.status,
                    pravnoLiceId: row.pravnoLiceId,
                    pravnoLice: {
                        id: row.pravnoLiceId,
                        naziv: row.naziv,
                        pib: row.pib,
                        adresa: row.adresa
                    },
                    unosi: []
                });
            }
            
            if (row.unosId) {
                proceneMap.get(row.id).unosi.push({
                    id: row.unosId,
                    procenaId: row.id,
                    grupaId: row.grupaId,
                    polje: row.polje,
                    vrednost: row.vrednost,
                    grupa: {
                        id: row.grupaId,
                        naziv: row.grupaNaziv,
                        redosled: row.redosled
                    }
                });
            }
        });

        const procene = Array.from(proceneMap.values());
        return NextResponse.json(procene);
    } catch (error) {
        console.error("Greška pri dohvatanju procena:", error);
        return NextResponse.json({error: "Greška pri dohvatanju podataka"}, {status: 500});
    }
}
