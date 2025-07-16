import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const procenaId = parseInt(params.id);
        const { selections } = await req.json();

        if (!procenaId || !selections || selections.length === 0) {
            return NextResponse.json({ error: "Nedostaju potrebni podaci" }, { status: 400 });
        }

        // Proveri da li procena postoji
        const procena = await prisma.procenaRizika.findUnique({
            where: { id: procenaId }
        });

        if (!procena) {
            return NextResponse.json({ error: "Procena ne postoji" }, { status: 404 });
        }

        // Generiši registar rizika (Prilog Lj) na osnovu selekcija
        const riskRegister = selections.map((selection: any, index: number) => ({
            riskId: selection.risk_id,
            description: selection.description,
            dangerLevel: selection.danger_level,
            // Simulacija dodatnih parametara za analizu rizika
            exposure: calculateExposure(selection.danger_level),
            vulnerability: calculateVulnerability(selection.danger_level),
            consequences: calculateConsequences(selection.danger_level),
            probability: calculateProbability(selection.danger_level),
            riskLevel: calculateRiskLevel(selection.danger_level)
        }));

        // Sačuvaj generirani registar u bazu kao JSON
        await prisma.procenaRizika.update({
            where: { id: procenaId },
            data: {
                status: "zavrsena",
                // Možemo dodati polje za čuvanje registra rizika
            }
        });

        // Kreiraj unose u tabelu za registar rizika (možemo proširiti schema kasnije)
        for (const risk of riskRegister) {
            await prisma.riskRegister.upsert({
                where: {
                    procenaId_riskId: {
                        procenaId: procenaId,
                        riskId: risk.riskId
                    }
                },
                update: {
                    description: risk.description,
                    dangerLevel: risk.dangerLevel,
                    exposure: risk.exposure,
                    vulnerability: risk.vulnerability,
                    consequences: risk.consequences,
                    probability: risk.probability,
                    riskLevel: risk.riskLevel,
                    category: getRiskCategory(risk.riskLevel),
                    acceptability: getRiskAcceptability(risk.riskLevel),
                    recommendedMeasures: getRecommendedMeasures(risk.riskLevel)
                },
                create: {
                    procenaId: procenaId,
                    riskId: risk.riskId,
                    description: risk.description,
                    dangerLevel: risk.dangerLevel,
                    exposure: risk.exposure,
                    vulnerability: risk.vulnerability,
                    consequences: risk.consequences,
                    probability: risk.probability,
                    riskLevel: risk.riskLevel,
                    category: getRiskCategory(risk.riskLevel),
                    acceptability: getRiskAcceptability(risk.riskLevel),
                    recommendedMeasures: getRecommendedMeasures(risk.riskLevel)
                }
            });
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