import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest, {params}: { params: { id: string } }) {
    const id = params.id;
    const body = await req.json(); // body = { grupe: [...] }

    // Ovde ide backend logika za snimanje u bazu
    // npr. await saveProcenaUnosi(id, body.grupe)

    // For now, samo vraća podatak da je uspesno
    return NextResponse.json({success: true, saved: true, procenaId: id, received: body});
}
