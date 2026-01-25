import { CoinCapStream } from "@/components/CoinCapStream";

export default async function CoinDetailsPage({params, searchParams}: {params: Promise<{id: string}>, searchParams: Promise<{price?: string}>}) {
    const {id} = await params;
    const { price } = await searchParams;
    console.log('price', price)
    return (
        <div className="p-8 mt-16">
          <h1 className="text-2xl font-bold">Coin: {id}</h1>
          <CoinCapStream coinId={id.toLowerCase()} initialPrice={price}/>
        </div>
    );
}
