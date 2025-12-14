import { fetchMarketData } from "@/src/services/cryptoService";
import { CoinsMarketParamsSchema } from "@/src/types/yup";
import { NextResponse } from 'next/server';

export async function GET(req: Request & {guery: {[key: string]: string | string[]}}) {
    try {
        const url =  new URL(req.url);
        const {searchParams, search} = url;
   
        const rawParams = Object.fromEntries(searchParams);
        console.log('par', rawParams)
        const validatedData = await CoinsMarketParamsSchema.validate(rawParams, {
            abortEarly: false,
            strict: false
        }); 

        const data = await fetchMarketData(validatedData as any); 
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.log(error)
        return NextResponse.json({ message: "Internal Server Error during transaction." }, { status: 500 });
    }
}
