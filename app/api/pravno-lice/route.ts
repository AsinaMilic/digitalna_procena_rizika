import {NextResponse} from "next/server";

export async function POST(req: Request) {
    // TODO: Upis u bazu
    return NextResponse.json({success: true, id: 1});
}

export async function GET(req: Request) {
    // TODO: Dohvati legal entities
    return NextResponse.json([]);
}
