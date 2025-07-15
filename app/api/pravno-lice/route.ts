import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const {naziv, pib, adresa} = await req.json();
        
        if (!naziv || !pib) {
            return NextResponse.json({error: "Naziv i PIB su obavezni"}, {status: 400});
        }

        const pravnoLice = await prisma.pravnoLice.create({
            data: {
                naziv,
                pib,
                adresa: adresa || null
            }
        });

        // Kreiraj novu procenu rizika za ovo pravno lice
        const procena = await prisma.procenaRizika.create({
            data: {
                pravnoLiceId: pravnoLice.id,
                status: "u_toku"
            }
        });

        return NextResponse.json({
            success: true, 
            pravnoLiceId: pravnoLice.id,
            procenaId: procena.id
        });
    } catch (error) {
        console.error("Greška pri kreiranju pravnog lica:", error);
        return NextResponse.json({error: "Greška pri čuvanju podataka"}, {status: 500});
    }
}

export async function GET(req: Request) {
    try {
        const pravnaLica = await prisma.pravnoLice.findMany({
            include: {
                procene: true
            }
        });
        return NextResponse.json(pravnaLica);
    } catch (error) {
        console.error("Greška pri dohvatanju pravnih lica:", error);
        return NextResponse.json({error: "Greška pri dohvatanju podataka"}, {status: 500});
    }
}
