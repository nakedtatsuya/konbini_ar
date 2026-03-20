"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const KonbiniAR = dynamic(() => import("@/components/KonbiniAR"), {
  ssr: false,
});

export default function Home() {
  const [started, setStarted] = useState(false);

  if (started) {
    return <KonbiniAR />;
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-green-900 via-green-800 to-green-950 flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <div className="mb-8">
        <div className="text-7xl mb-4">🏪</div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          コンビニAR
        </h1>
        <p className="text-green-300 text-sm mt-2 tracking-widest">
          KONBINI TRANSFORM
        </p>
      </div>

      {/* Description */}
      <div className="max-w-xs space-y-3 mb-10">
        <p className="text-green-100 text-base leading-relaxed">
          カメラをかざすと、身の回りのものが
          <br />
          <span className="font-bold text-white">コンビニの商品</span>
          に変わります
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          {["🍵 ドリンク", "🍙 食品", "📖 雑誌", "☂️ 日用品"].map((tag) => (
            <span
              key={tag}
              className="bg-green-700/50 text-green-200 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={() => setStarted(true)}
        className="group relative px-10 py-4 bg-white text-green-900 font-bold text-lg rounded-full shadow-xl active:scale-95 transition-transform"
      >
        <span className="relative z-10">カメラを起動する</span>
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 transition-opacity" />
      </button>

      <p className="text-green-400/60 text-xs mt-6">
        カメラへのアクセス許可が必要です
      </p>

      {/* How it works */}
      <div className="mt-12 max-w-xs">
        <h2 className="text-green-300 text-xs font-bold tracking-widest mb-4">
          HOW IT WORKS
        </h2>
        <div className="space-y-3">
          {[
            {
              step: "1",
              text: "カメラで周りのものを映す",
            },
            {
              step: "2",
              text: "AIがコンビニっぽい商品を検出",
            },
            {
              step: "3",
              text: "値札が出現！コンビニ度が上がる",
            },
            {
              step: "4",
              text: "目指せコンビニ度 100%！",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-center gap-3 text-left"
            >
              <div className="w-7 h-7 rounded-full bg-green-700 text-green-200 flex items-center justify-center text-sm font-bold shrink-0">
                {item.step}
              </div>
              <span className="text-green-200 text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
