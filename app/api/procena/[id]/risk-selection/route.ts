import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, {params}: {params: {id: string}}) {
    try {
        const procenaId = parseInt(params.id);
        const {risk_id, danger_level, description} = await req.json();

        if (!procenaId || !risk_id || !danger_level) {
            return NextResponse.json({error: "Nedostaju potrebni podaci"}, {status: 400});
        }

        // Proveri da li procena postoji
        const procena = await prisma.procenaRizika.findUnique({
            where: {id: procenaId}
        });

        if (!procena) {
            return NextResponse.json({error: "Procena ne postoji"}, {status: 404});
        }

        // Upsert risk selection - ažuriraj ako postoji, kreiraj ako ne postoji
        await prisma.riskSelection.upsert({
            where: {
                procenaId_riskId: {
                    procenaId: procenaId,
                    riskId: risk_id
                }
            },
            update: {
                dangerLevel: danger_level,
                description: description || ""
            },
            create: {
                procenaId: procenaId,
                riskId: risk_id,
                dangerLevel: danger_level,
                description: description || ""
            }
        });

        return NextResponse.json({success: true});
    } catch (error) {
        console.error("Greška pri čuvanju selekcije rizika:", error);
        return NextResponse.json({error: "Greška pri čuvanju podataka"}, {status: 500});
    }
}

export async function GET(req: Request, {params}: {params: {id: string}}) {
    try {
        const procenaId = parseInt(params.id);

        if (!procenaId) {
            return NextResponse.json({error: "Nevaljan ID procene"}, {status: 400});
        }

        const selections = await prisma.riskSelection.findMany({
            where: {procenaId: procenaId}
        });

        return NextResponse.json(selections);
    } catch (error) {
        console.error("Greška pri dohvatanju selekcija rizika:", error);
        return NextResponse.json({error: "Greška pri dohvatanju podataka"}, {status: 500});
    }
}