import { NextResponse } from "next/server";
import { getDbConnection } from "../../../../../lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const procenaId = parseInt(id);
        const { selections } = await req.json();

        if (!procenaId || !selections || selections.length === 0) {
            return NextResponse.json({ error: "Nedostaju potrebni podaci" }, { status: 400 });
        }

        const pool = await getDbConnection();

        // Check if procena exists
        const procenaCheck = await pool.request()
            .input('procenaId', procenaId)
            .query('SELECT id FROM ProcenaRizika WHERE id = @procenaId');

        if (procenaCheck.recordset.length === 0) {
            return NextResponse.json({ error: "Procena ne postoji" }, { status: 404 });
        }

        // Generate risk register based on selections
        const riskRegister = selections.map((selection: any) => ({
            riskId: selection.risk_id,
            description: selection.description,
            dangerLevel: selection.danger_level,
            exposure: calculateExposure(selection.danger_level),
            vulnerability: calculateVulnerability(selection.danger_level),
            consequences: calculateConsequences(selection.danger_level),
            probability: calculateProbability(selection.danger_level),
            riskLevel: calculateRiskLevel(selection.danger_level)
        }));

        // Update procena status to completed
        await pool.request()
            .input('procenaId', procenaId)
            .query('UPDATE ProcenaRizika SET status = \'zavrsena\' WHERE id = @procenaId');

        // Create/update risk register entries
        for (const risk of riskRegister) {
            // Check if risk register entry exists
            const existingRisk = await pool.request()
                .input('procenaId', procenaId)
                .input('riskId', risk.riskId)
                .query('SELECT id FROM RiskRegister WHERE procenaId = @procenaId AND riskId = @riskId');

            if (existingRisk.recordset.length > 0) {
                // Update existing
                await pool.request()
                    .input('procenaId', procenaId)
                    .input('riskId', risk.riskId)
                    .input('description', risk.description)
                    .input('dangerLevel', risk.dangerLevel)
                    .input('exposure', risk.exposure)
                    .input('vulnerability', risk.vulnerability)
                    .input('consequences', risk.consequences)
                    .input('probability', risk.probability)
                    .input('riskLevel', risk.riskLevel)
                    .input('category', getRiskCategory(risk.riskLevel))
                    .input('acceptability', getRiskAcceptability(risk.riskLevel))
                    .input('recommendedMeasures', getRecommendedMeasures(risk.riskLevel))
                    .query(`
                        UPDATE RiskRegister SET 
                            description = @description,
                            dangerLevel = @dangerLevel,
                            exposure = @exposure,
                            vulnerability = @vulnerability,
                            consequences = @consequences,
                            probability = @probability,
                            riskLevel = @riskLevel,
                            category = @category,
                            acceptability = @acceptability,
                            recommendedMeasures = @recommendedMeasures,
                            updatedAt = GETDATE()
                        WHERE procenaId = @procenaId AND riskId = @riskId
                    `);
            } else {
                // Create new
                await pool.request()
                    .input('procenaId', procenaId)
                    .input('riskId', risk.riskId)
                    .input('description', risk.description)
                    .input('dangerLevel', risk.dangerLevel)
                    .input('exposure', risk.exposure)
                    .input('vulnerability', risk.vulnerability)
                    .input('consequences', risk.consequences)
                    .input('probability', risk.probability)
                    .input('riskLevel', risk.riskLevel)
                    .input('category', getRiskCategory(risk.riskLevel))
                    .input('acceptability', getRiskAcceptability(risk.riskLevel))
                    .input('recommendedMeasures', getRecommendedMeasures(risk.riskLevel))
                    .query(`
                        INSERT INTO RiskRegister (
                            procenaId, riskId, description, dangerLevel, exposure, vulnerability,
                            consequences, probability, riskLevel, category, acceptability,
                            recommendedMeasures, createdAt, updatedAt
                        ) VALUES (
                            @procenaId, @riskId, @description, @dangerLevel, @exposure, @vulnerability,
                            @consequences, @probability, @riskLevel, @category, @acceptability,
                            @recommendedMeasures, GETDATE(), GETDATE()
                        )
                    `);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Матрица ризика је успешно генерисана",
            riskRegister
        });
    } catch (error) {
        console.error("Greška pri generisanju matrice rizika:", error);
        return NextResponse.json({ error: "Greška pri генерисању матрице" }, { status: 500 });
    }
}

// Pomoćne funkcije za kalkulaciju parametara rizika
function calculateExposure(dangerLevel: number): number {
    // Simulacija kalkulacije izloženosti na osnovu nivoa opasnosti
    return Math.min(dangerLevel + Math.floor(Math.random() * 2), 5);
}

function calculateVulnerability(dangerLevel: number): number {
    // Simulacija kalkulacije ranjivosti
    return Math.min(dangerLevel + Math.floor(Math.random() * 2), 5);
}

function calculateConsequences(dangerLevel: number): number {
    // Simulacija kalkulacije posledica
    return Math.min(dangerLevel + Math.floor(Math.random() * 2), 5);
}

function calculateProbability(dangerLevel: number): number {
    // Simulacija kalkulacije verovatnoće
    const exposure = calculateExposure(dangerLevel);
    const vulnerability = calculateVulnerability(dangerLevel);
    return Math.min(Math.ceil((exposure + vulnerability) / 2), 5);
}

function calculateRiskLevel(dangerLevel: number): number {
    // Kalkulacija nivoa rizika: Verovatnoća × Posledice
    const probability = calculateProbability(dangerLevel);
    const consequences = calculateConsequences(dangerLevel);
    return Math.min(probability * consequences, 25);
}

function getRiskCategory(riskLevel: number): string {
    if (riskLevel >= 20) return "КРИТИЧАН";
    if (riskLevel >= 15) return "ВИСОК";
    if (riskLevel >= 10) return "УМЕРЕН";
    if (riskLevel >= 5) return "НИЗАК";
    return "ЗАНЕМАРЉИВ";
}

function getRiskAcceptability(riskLevel: number): string {
    if (riskLevel >= 15) return "НЕПРИХВАТЉИВ";
    if (riskLevel >= 10) return "УСЛОВНО ПРИХВАТЉИВ";
    return "ПРИХВАТЉИВ";
}

function getRecommendedMeasures(riskLevel: number): string {
    if (riskLevel >= 20) return "Хитне мере - заустављање активности до отклањања ризика";
    if (riskLevel >= 15) return "Неопходне мере превенције и заштите";
    if (riskLevel >= 10) return "Препоручене мере за смањење ризика";
    if (riskLevel >= 5) return "Мониторинг и периодична провера";
    return "Редовно праћење";
}