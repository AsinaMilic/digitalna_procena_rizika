import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const {pravnoLiceId} = await req.json();
        
        if (!pravnoLiceId) {
            return NextResponse.json({error: "pravnoLiceId je obavezan"}, {status: 400});
        }

        const procena = await prisma.procenaRizika.create({
            data: {
                pravnoLiceId,
                status: "u_toku"
            }
        });

        return NextResponse.json({success: true, id: procena.id});
    } catch (error) {
        console.error("Greška pri kreiranju procene:", error);
        return NextResponse.json({error: "Greška pri čuvanju podataka"}, {status: 500});
    }
}

export async function GET(req: Request) {
    try {
        const procene = await prisma.procenaRizika.findMany({
            include: {
                pravnoLice: true,
                unosi: {
                    include: {
                        grupa: true
                    }
                }
            }
        });
        return NextResponse.json(procene);
    } catch (error) {
        console.error("Greška pri dohvatanju procena:", error);
        return NextResponse.json({error: "Greška pri dohvatanju podataka"}, {status: 500});
    }
}
