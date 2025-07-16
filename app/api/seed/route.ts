import { NextResponse } from "next/server";
import { getDbConnection } from "../../../lib/db";

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

export async function POST() {
    try {
        const pool = await getDbConnection();
        
        // First delete existing groups
        await pool.request().query('DELETE FROM GrupaRizika');
        console.log('🗑️ Cleared existing risk groups');
        
        // Create new groups
        for (let i = 0; i < GRUPE.length; i++) {
            await pool.request()
                .input('naziv', GRUPE[i])
                .input('redosled', i + 1)
                .query('INSERT INTO GrupaRizika (naziv, redosled) VALUES (@naziv, @redosled)');
        }
        
        console.log('✔️ Seeded 11 risk groups successfully!');
        
        // Verify the data
        const result = await pool.request().query('SELECT COUNT(*) as count FROM GrupaRizika');
        console.log(`📊 Total risk groups in database: ${result.recordset[0].count}`);
        
        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${GRUPE.length} risk groups`,
            count: result.recordset[0].count
        });
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}