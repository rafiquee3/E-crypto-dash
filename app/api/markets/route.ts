import { fetchMarketData } from "@/src/services/cryptoService";
import { NextResponse } from 'next/server';

export async function GET(req: Request & {guery: {[key: string]: string | string[]}}) {
    try {
        const url =  new URL(req.url);
        const {searchParams, search} = url;
        const rawParams = Object.fromEntries(searchParams);
        const data = await fetchMarketData(rawParams as any); 
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error("API Error:", error.message );
        return NextResponse.json({ message: "Internal Server Error during transaction." }, { status: 500 });
    }
}