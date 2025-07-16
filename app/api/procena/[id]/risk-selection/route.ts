import {NextResponse} from "next/server";
import {getDbConnection} from "../../../../../lib/db";

export async function POST(req: Request, {params}: {params: Promise<{id: string}>}) {
    try {
        const {id} = await params;
        const procenaId = parseInt(id);
        const {risk_id, danger_level, description} = await req.json();

        if (!procenaId || !risk_id || !danger_level) {
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

        // Check if risk selection already exists
        const existingSelection = await pool.request()
            .input('procenaId', procenaId)
            .input('riskId', risk_id)
            .query('SELECT id FROM RiskSelection WHERE procenaId = @procenaId AND riskId = @riskId');

        if (existingSelection.recordset.length > 0) {
            // Update existing
            await pool.request()
                .input('procenaId', procenaId)
                .input('riskId', risk_id)
                .input('dangerLevel', danger_level)
                .input('description', description || '')
                .query(`
                    UPDATE RiskSelection 
                    SET dangerLevel = @dangerLevel, description = @description, updatedAt = GETDATE()
                    WHERE procenaId = @procenaId AND riskId = @riskId
                `);
        } else {
            // Create new
            await pool.request()
                .input('procenaId', procenaId)
                .input('riskId', risk_id)
                .input('dangerLevel', danger_level)
                .input('description', description || '')
                .query(`
                    INSERT INTO RiskSelection (procenaId, riskId, dangerLevel, description, createdAt, updatedAt)
                    VALUES (@procenaId, @riskId, @dangerLevel, @description, GETDATE(), GETDATE())
                `);
        }

        return NextResponse.json({success: true});
    } catch (error) {
        console.error("Greška pri čuvanju selekcije rizika:", error);
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
        const result = await pool.request()
            .input('procenaId', procenaId)
            .query('SELECT * FROM RiskSelection WHERE procenaId = @procenaId');

        return NextResponse.json(result.recordset);
    } catch (error) {
        console.error("Greška pri dohvatanju selekcija rizika:", error);
        return NextResponse.json({error: "Greška pri dohvatanju podataka"}, {status: 500});
    }
}