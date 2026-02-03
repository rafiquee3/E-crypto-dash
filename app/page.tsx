'use client';

import { AssetList } from "@/components/AssetList";
import { Profiler } from "react";
import { onRenderCallback } from "@/utils/performance";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 font-sans dark:bg-black pt-24 pb-12 px-8">
      <div className="max-w-7xl mx-auto">
        <Profiler id="AssetList" onRender={onRenderCallback}>
          <AssetList/>
        </Profiler>
      </div>
    </main>
  );
}
