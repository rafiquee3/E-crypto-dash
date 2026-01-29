import { CoinCapStream } from "@/components/CoinCapStream";

export default async function CoinDetailsPage({params}: {params: Promise<{id: string}>}) {
    const {id} = await params;

    return (
        <div className="p-8 mt-16 mb-16">
          <h1 className="text-2xl font-bold mb-3">Coin: {id}</h1>
          <CoinCapStream coinId={id.toLowerCase()}/>
        </div>
    );
}
