import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const GRUPE = [
    "Organizacija i rukovodstvo",
    "Radno okruženje",
    "Radni procesi",
    "Tehnička sredstva",
    "Fizička sigurnost",
    "Zdravlje na radu",
    "Ekologija",
    "Informaciona sigurnost",
    "Pravna usklađenost",
    "Finansijski rizici",
    "Reputacioni rizici"
];

async function main() {
    // Prvo obriši postojeće grupe
    await prisma.grupaRizika.deleteMany({});
    
    // Kreiraj nove grupe
    for (let i = 0; i < GRUPE.length; i++) {
        await prisma.grupaRizika.create({
            data: {
                naziv: GRUPE[i], 
                redosled: i + 1
            }
        });
    }
    console.log('✔️ Seedovano 11 grupa rizika!');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
