import { AssetList } from "@/components/AssetList";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 font-sans dark:bg-black pt-24 pb-12 px-8">
      <div className="max-w-7xl mx-auto">
        <AssetList/>
      </div>
    </main>
  );
}
