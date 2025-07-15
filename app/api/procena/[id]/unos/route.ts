import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, {params}: {params: {id: string}}) {
    try {
        const procenaId = parseInt(params.id);
        const {grupe} = await req.json();

        if (!procenaId || !grupe) {
            return NextResponse.json({error: "Nedostaju potrebni podaci"}, {status: 400});
        }

        // Proveri da li procena postoji
        const procena = await prisma.procenaRizika.findUnique({
            where: {id: procenaId}
        });

        if (!procena) {
            return NextResponse.json({error: "Procena ne postoji"}, {status: 404});
        }

        // Obriši postojeće unose za ovu procenu
        await prisma.unosRizika.deleteMany({
            where: {procenaId}
        });

        // Dohvati grupe rizika iz baze
        const grupeRizika = await prisma.grupaRizika.findMany({
            orderBy: {redosled: 'asc'}
        });

        // Kreiraj nove unose
        const unosiData = [];
        for (let i = 0; i < grupe.length && i < grupeRizika.length; i++) {
            const grupa = grupe[i];
            const grupaRizika = grupeRizika[i];
            
            if (grupa.field1) {
                unosiData.push({
                    procenaId,
                    grupaId: grupaRizika.id,
                    polje: "field1",
                    vrednost: grupa.field1
                });
            }
            if (grupa.field2) {
                unosiData.push({
                    procenaId,
                    grupaId: grupaRizika.id,
                    polje: "field2",
                    vrednost: grupa.field2
                });
            }
        }

        if (unosiData.length > 0) {
            await prisma.unosRizika.createMany({
                data: unosiData
            });
        }

        // Ažuriraj status procene
        await prisma.procenaRizika.update({
            where: {id: procenaId},
            data: {status: "zavrsena"}
        });

        return NextResponse.json({success: true, message: "Podaci su uspešno sačuvani"});
    } catch (error) {
        console.error("Greška pri čuvanju unosa rizika:", error);
        return NextResponse.json({error: "Greška pri čuvanju podataka"}, {status: 500});
    }
}

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
                unosi: {
                    include: {
                        grupa: true
                    },
                    orderBy: {
                        grupa: {
                            redosled: 'asc'
                        }
                    }
                }
            }
        });

        if (!procena) {
            return NextResponse.json({error: "Procena ne postoji"}, {status: 404});
        }

        return NextResponse.json(procena);
    } catch (error) {
        console.error("Greška pri dohvatanju procene:", error);
        return NextResponse.json({error: "Greška pri dohvatanju podataka"}, {status: 500});
    }
}