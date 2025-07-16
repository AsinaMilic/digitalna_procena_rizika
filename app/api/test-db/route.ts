import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Test osnovne konekcije
        await prisma.$connect();
        console.log("✅ Prisma connection successful");
        
        // Test jednostavnog query-ja
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log("✅ Database query successful:", result);
        
        // Test da li tabele postoje
        const tables = await prisma.$queryRaw`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        `;
        console.log("✅ Tables found:", tables);
        
        return NextResponse.json({
            success: true,
            message: "Database connection successful",
            testQuery: result,
            tables: tables
        });
        
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            details: error
        }, {status: 500});
    } finally {
        await prisma.$disconnect();
    }
}