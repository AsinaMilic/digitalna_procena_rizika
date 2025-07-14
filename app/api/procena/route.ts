import {NextResponse} from "next/server";

export async function POST(req: Request) {
    // TODO: Kreiranje procene
    return NextResponse.json({success: true, id: 1});
}

export async function GET(req: Request) {
    // TODO: Dohvati sve procene
    return NextResponse.json([]);
}
