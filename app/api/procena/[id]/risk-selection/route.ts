import {NextResponse} from "next/server";
import {getDbConnection} from "../../../../../lib/db";

async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            console.log(`Attempt ${attempt} failed:`, error.message);
            
            if (attempt < maxRetries && (error.code === 'ECONNCLOSED' || error.code === 'ENOTOPEN')) {
                console.log(`Retrying in ${attempt * 1000}ms...`);
                await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                continue;
            }
            break;
        }
    }
    
    throw lastError;
}

export async function POST(req: Request, {params}: {params: Promise<{id: string}>}) {
    try {
        const {id} = await params;
        const procenaId = parseInt(id);
        const {risk_id, danger_level, description} = await req.json();

        if (!procenaId || !risk_id || !danger_level) {
            return NextResponse.json({error: "Nedostaju potrebni podaci"}, {status: 400});
        }

        await executeWithRetry(async () => {
            const pool = await getDbConnection();

            // Check if procena exists
            const procenaCheck = await pool.request()
                .input('procenaId', procenaId)
                .query('SELECT id FROM ProcenaRizika WHERE id = @procenaId');

            if (procenaCheck.recordset.length === 0) {
                throw new Error("Procena ne postoji");
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
        });

        return NextResponse.json({success: true});
    } catch (error: any) {
        console.error("Greška pri čuvanju selekcije rizika:", error);
        
        if (error.message === "Procena ne postoji") {
            return NextResponse.json({error: "Procena ne postoji"}, {status: 404});
        }
        
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

        const result = await executeWithRetry(async () => {
            const pool = await getDbConnection();
            return await pool.request()
                .input('procenaId', procenaId)
                .query('SELECT * FROM RiskSelection WHERE procenaId = @procenaId');
        });

        return NextResponse.json(result.recordset);
    } catch (error) {
        console.error("Greška pri dohvatanju selekcija rizika:", error);
        return NextResponse.json({error: "Greška pri dohvatanju podataka"}, {status: 500});
    }
}