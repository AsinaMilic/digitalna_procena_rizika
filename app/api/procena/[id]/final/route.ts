import {NextResponse} from "next/server";
import {getDbConnection} from "../../../../../lib/db";

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
                    pr.id, pr.datum, pr.status,
                    pl.id as pravnoLiceId, pl.naziv, pl.pib, pl.adresa
                FROM ProcenaRizika pr
                JOIN PravnoLice pl ON pr.pravnoLiceId = pl.id
                WHERE pr.id = @procenaId
            `);

        if (procenaResult.recordset.length === 0) {
            return NextResponse.json({error: "Procena ne postoji"}, {status: 404});
        }

        const procenaData = procenaResult.recordset[0];

        // Get risk selections
        const selectionsResult = await pool.request()
            .input('procenaId', procenaId)
            .query('SELECT * FROM RiskSelection WHERE procenaId = @procenaId');

        // Get risk register
        const registerResult = await pool.request()
            .input('procenaId', procenaId)
            .query('SELECT * FROM RiskRegister WHERE procenaId = @procenaId ORDER BY riskId');

        return NextResponse.json({
            procena: {
                id: procenaData.id,
                datum: procenaData.datum,
                status: procenaData.status,
                pravnoLice: {
                    id: procenaData.pravnoLiceId,
                    naziv: procenaData.naziv,
                    pib: procenaData.pib,
                    adresa: procenaData.adresa
                }
            },
            riskSelections: selectionsResult.recordset,
            riskRegister: registerResult.recordset
        });
    } catch (error) {
        console.error("Greška pri dohvatanju finalne procene:", error);
        return NextResponse.json({error: "Greška pri dohvatanju podataka"}, {status: 500});
    }
}