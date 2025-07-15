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

        // Grupiši unose po grupama za lakše prikazivanje
        const grupeMap = new Map();
        procena.unosi.forEach(unos => {
            const grupaNaziv = unos.grupa.naziv;
            if (!grupeMap.has(grupaNaziv)) {
                grupeMap.set(grupaNaziv, {
                    naziv: grupaNaziv,
                    redosled: unos.grupa.redosled,
                    field1: '',
                    field2: ''
                });
            }
            const grupa = grupeMap.get(grupaNaziv);
            grupa[unos.polje] = unos.vrednost;
        });

        const finalniPodaci = Array.from(grupeMap.values()).sort((a, b) => a.redosled - b.redosled);

        return NextResponse.json({
            procena: {
                id: procena.id,
                datum: procena.datum,
                status: procena.status,
                pravnoLice: procena.pravnoLice
            },
            grupe: finalniPodaci
        });
    } catch (error) {
        console.error("Greška pri dohvatanju finalne procene:", error);
        return NextResponse.json({error: "Greška pri dohvatanju podataka"}, {status: 500});
    }
}