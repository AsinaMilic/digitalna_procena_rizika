import {NextResponse} from "next/server";
import {getDbConnection} from "../../../../../lib/db";

export async function POST(req: Request, {params}: {params: Promise<{id: string}>}) {
    try {
        const {id} = await params;
        const procenaId = parseInt(id);
        const {grupe} = await req.json();

        if (!procenaId || !grupe) {
            return NextResponse.json({error: "Nedostaju potrebni podaci"}, {status: 400});
        }

        const pool = await getDbConnection();

        // Check if procena exists
        const procenaCheck = await pool.request()
            .input('procenaId', procenaId)
            .query('SELECT id FROM ProcenaRizika WHERE id = @procenaId');

        if (procenaCheck.recordset.length === 0) {
            return NextResponse.json({error: "Procena ne postoji"}, {status: 404});
        }

        // Delete existing entries for this procena
        await pool.request()
            .input('procenaId', procenaId)
            .query('DELETE FROM UnosRizika WHERE procenaId = @procenaId');

        // Get risk groups from database
        const grupeRizikaResult = await pool.request()
            .query('SELECT * FROM GrupaRizika ORDER BY redosled ASC');
        
        const grupeRizika = grupeRizikaResult.recordset;

        // Create new entries
        for (let i = 0; i < grupe.length && i < grupeRizika.length; i++) {
            const grupa = grupe[i];
            const grupaRizika = grupeRizika[i];
            
            if (grupa.field1) {
                await pool.request()
                    .input('procenaId', procenaId)
                    .input('grupaId', grupaRizika.id)
                    .input('polje', 'field1')
                    .input('vrednost', grupa.field1)
                    .query('INSERT INTO UnosRizika (procenaId, grupaId, polje, vrednost) VALUES (@procenaId, @grupaId, @polje, @vrednost)');
            }
            if (grupa.field2) {
                await pool.request()
                    .input('procenaId', procenaId)
                    .input('grupaId', grupaRizika.id)
                    .input('polje', 'field2')
                    .input('vrednost', grupa.field2)
                    .query('INSERT INTO UnosRizika (procenaId, grupaId, polje, vrednost) VALUES (@procenaId, @grupaId, @polje, @vrednost)');
            }
        }

        // Update procena status
        await pool.request()
            .input('procenaId', procenaId)
            .query('UPDATE ProcenaRizika SET status = \'zavrsena\' WHERE id = @procenaId');

        return NextResponse.json({success: true, message: "Podaci su uspešno sačuvani"});
    } catch (error) {
        console.error("Greška pri čuvanju unosa rizika:", error);
        return NextResponse.json({error: "Greška pri čuvanju podataka"}, {status: 500});
    }
}

export async function GET(req: Request, {params}: {params: Promise<{id: string}>}) {
    try {
        const {id} = await params;
        const procenaId = parseInt(id);

        if (!procenaId) {
            return NextResponse.json({error: "Nevaljan ID procene"}, {status: 400});
        }

        const pool = await getDbConnection();

        // Get procena with pravno lice
        const procenaResult = await pool.request()
            .input('procenaId', procenaId)
            .query(`
                SELECT 
                    pr.id, pr.datum, pr.status, pr.pravnoLiceId,
                    pl.naziv, pl.pib, pl.adresa
                FROM ProcenaRizika pr
                JOIN PravnoLice pl ON pr.pravnoLiceId = pl.id
                WHERE pr.id = @procenaId
            `);

        if (procenaResult.recordset.length === 0) {
            return NextResponse.json({error: "Procena ne postoji"}, {status: 404});
        }

        const procenaData = procenaResult.recordset[0];

        // Get unosi with grupa data
        const unosiResult = await pool.request()
            .input('procenaId', procenaId)
            .query(`
                SELECT 
                    ur.id, ur.procenaId, ur.grupaId, ur.polje, ur.vrednost,
                    gr.naziv as grupaNaziv, gr.redosled
                FROM UnosRizika ur
                JOIN GrupaRizika gr ON ur.grupaId = gr.id
                WHERE ur.procenaId = @procenaId
                ORDER BY gr.redosled ASC
            `);

        const procena = {
            id: procenaData.id,
            datum: procenaData.datum,
            status: procenaData.status,
            pravnoLiceId: procenaData.pravnoLiceId,
            pravnoLice: {
                id: procenaData.pravnoLiceId,
                naziv: procenaData.naziv,
                pib: procenaData.pib,
                adresa: procenaData.adresa
            },
            unosi: unosiResult.recordset.map(unos => ({
                id: unos.id,
                procenaId: unos.procenaId,
                grupaId: unos.grupaId,
                polje: unos.polje,
                vrednost: unos.vrednost,
                grupa: {
                    id: unos.grupaId,
                    naziv: unos.grupaNaziv,
                    redosled: unos.redosled
                }
            }))
        };

        return NextResponse.json(procena);
    } catch (error) {
        console.error("Greška pri dohvatanju procene:", error);
        return NextResponse.json({error: "Greška pri dohvatanju podataka"}, {status: 500});
    }
}