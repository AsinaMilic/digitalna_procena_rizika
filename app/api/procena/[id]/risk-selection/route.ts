import {NextResponse} from "next/server";
import {getDbConnection} from "../../../../../lib/db";
import { handleOptions, createCorsResponse } from '../../../../../lib/cors';

async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error = new Error('Unknown error');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: unknown) {
            lastError = error as Error;
            const err = error as { code?: string; message: string };
            console.log(`Attempt ${attempt} failed:`, err.message);
            
            if (attempt < maxRetries && (err.code === 'ECONNCLOSED' || err.code === 'ENOTOPEN')) {
                console.log(`Retrying in ${attempt * 1000}ms...`);
                await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                continue;
            }
            break;
        }
    }
    
    throw lastError;
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
    return handleOptions();
}

export async function POST(req: Request, {params}: {params: Promise<{id: string}>}) {
    try {
        const {id} = await params;
        const procenaId = parseInt(id);
        const {risk_id, danger_level, description} = await req.json();

        if (!procenaId || !risk_id || !danger_level) {
            return createCorsResponse({error: "Nedostaju potrebni podaci"}, 400);
        }

        await executeWithRetry(async () => {
            const pool = await getDbConnection();

            // Check if procena exists
            const procenaCheck = await pool.query('SELECT id FROM ProcenaRizika WHERE id = $1', [procenaId]);

            if (procenaCheck.rows.length === 0) {
                throw new Error("Procena ne postoji");
            }

            // Check if risk selection already exists
            const existingSelection = await pool.query('SELECT id FROM RiskSelection WHERE procenaId = $1 AND riskId = $2', [procenaId, risk_id]);

            if (existingSelection.rows.length > 0) {
                // Update existing
                await pool.query(`
                        UPDATE RiskSelection 
                        SET dangerLevel = $1, description = $2, updatedAt = CURRENT_TIMESTAMP
                        WHERE procenaId = $3 AND riskId = $4
                    `, [danger_level, description || '', procenaId, risk_id]);
            } else {
                // Create new
                await pool.query(`
                        INSERT INTO RiskSelection (procenaId, riskId, dangerLevel, description, createdAt, updatedAt)
                        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    `, [procenaId, risk_id, danger_level, description || '']);
            }
        });

        return createCorsResponse({success: true});
    } catch (error: unknown) {
        console.error("Greška pri čuvanju selekcije rizika:", error);
        const err = error as Error;
        
        if (err.message === "Procena ne postoji") {
            return createCorsResponse({error: "Procena ne postoji"}, 404);
        }
        
        return createCorsResponse({error: "Greška pri čuvanju podataka"}, 500);
    }
}

export async function GET(req: Request, {params}: {params: Promise<{id: string}>}) {
    try {
        const {id} = await params;
        const procenaId = parseInt(id);

        if (!procenaId) {
            return createCorsResponse({error: "Nevaljan ID procene"}, 400);
        }

        const result = await executeWithRetry(async () => {
            const pool = await getDbConnection();
            return await pool.query('SELECT * FROM RiskSelection WHERE procenaId = $1', [procenaId]);
        });

        return createCorsResponse(result.rows);
    } catch (error) {
        console.error("Greška pri dohvatanju selekcija rizika:", error);
        return createCorsResponse({error: "Greška pri dohvatanju podataka"}, 500);
    }
}