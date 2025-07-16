import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, {params}: {params: {id: string}}) {
    try {
        const procenaId = parseInt(params.id);

        if (!procenaId) {
            return NextResponse.json({error: "Nevaljan ID procene"}, {status: 400});
        }

        const procena = await prisma.procenaRizika.findUnique({
            where: {id: procenaId},
            include: {
                pravnoLice: true,
                riskSelections: true,
                riskRegister: {
                    orderBy: {
                        riskId: 'asc'
                    }
                }
            }
        });

        if (!procena) {
            return NextResponse.json({error: "Procena ne postoji"}, {status: 404});
        }

        return NextResponse.json({
            procena: {
                id: procena.id,
                datum: procena.datum,
                status: procena.status,
                pravnoLice: procena.pravnoLice
            },
            riskSelections: procena.riskSelections,
            riskRegister: procena.riskRegister
        });
    } catch (error) {
        console.error("Greška pri dohvatanju finalne procene:", error);
        return NextResponse.json({error: "Greška pri dohvatanju podataka"}, {status: 500});
    }
}