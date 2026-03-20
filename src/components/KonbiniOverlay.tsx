"use client";

/**
 * コンビニ空間を演出するARオーバーレイ
 * smoothScore (0-100) に応じて段階的に要素が出現する
 */

interface KonbiniOverlayProps {
  smoothScore: number;
}

export default function KonbiniOverlay({ smoothScore }: KonbiniOverlayProps) {
  const opacity = (threshold: number, range = 20) =>
    Math.min(Math.max((smoothScore - threshold) / range, 0), 1);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* ===== 蛍光灯（天井） ===== */}
      {smoothScore > 15 && (
        <div
          className="absolute top-0 left-0 right-0 h-16 flex justify-around items-start px-8"
          style={{ opacity: opacity(15) }}
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className="w-24 h-2 rounded-sm"
                style={{
                  background:
                    "linear-gradient(180deg, #fff 0%, rgba(200,220,255,0.9) 50%, rgba(200,220,255,0.3) 100%)",
                  boxShadow:
                    "0 0 15px rgba(200,220,255,0.6), 0 0 40px rgba(200,220,255,0.2)",
                }}
              />
              <div
                className="w-28 h-8"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(200,220,255,0.15) 0%, transparent 100%)",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* ===== セブン風看板（上部） ===== */}
      {smoothScore > 20 && (
        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 z-10"
          style={{
            opacity: opacity(20),
            transform: `translate(-50%, ${Math.max(0, 20 - (smoothScore - 20))}px)`,
            transition: "transform 0.5s ease-out",
          }}
        >
          <div className="relative">
            {/* 3色ストライプ背景 */}
            <div
              className="px-5 py-2.5 rounded-lg shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #fff 0%, #f8f8f8 100%)",
                border: "2px solid rgba(0,0,0,0.1)",
              }}
            >
              {/* 3色ストライプ */}
              <div className="flex gap-0.5 mb-1">
                <div className="h-1.5 flex-1 rounded-sm bg-[#E8430B]" />
                <div className="h-1.5 flex-1 rounded-sm bg-[#F58220]" />
                <div className="h-1.5 flex-1 rounded-sm bg-[#008C44]" />
              </div>
              <div className="text-center">
                <div className="font-black text-sm tracking-wider text-gray-800">
                  コンビニAR
                </div>
                <div className="text-[9px] text-gray-500 tracking-[0.2em]">
                  24HOURS OPEN
                </div>
              </div>
              {/* 下部ストライプ */}
              <div className="flex gap-0.5 mt-1">
                <div className="h-1.5 flex-1 rounded-sm bg-[#E8430B]" />
                <div className="h-1.5 flex-1 rounded-sm bg-[#F58220]" />
                <div className="h-1.5 flex-1 rounded-sm bg-[#008C44]" />
              </div>
            </div>
            {/* 看板グロー */}
            <div
              className="absolute -inset-1 rounded-xl -z-10"
              style={{
                boxShadow:
                  "0 0 20px rgba(232,67,11,0.3), 0 0 40px rgba(0,140,68,0.2)",
              }}
            />
          </div>
        </div>
      )}

      {/* ===== 自動ドアフレーム ===== */}
      {smoothScore > 10 && (
        <>
          {/* 左枠 */}
          <div
            className="absolute top-0 bottom-0 left-0 w-3"
            style={{
              opacity: opacity(10, 15),
              background:
                "linear-gradient(90deg, rgba(180,180,180,0.6) 0%, rgba(200,200,200,0.3) 60%, transparent 100%)",
            }}
          />
          {/* 右枠 */}
          <div
            className="absolute top-0 bottom-0 right-0 w-3"
            style={{
              opacity: opacity(10, 15),
              background:
                "linear-gradient(270deg, rgba(180,180,180,0.6) 0%, rgba(200,200,200,0.3) 60%, transparent 100%)",
            }}
          />
          {/* 上枠 */}
          <div
            className="absolute top-0 left-0 right-0 h-2"
            style={{
              opacity: opacity(10, 15),
              background:
                "linear-gradient(180deg, rgba(160,160,160,0.5) 0%, transparent 100%)",
            }}
          />
        </>
      )}

      {/* ===== 左側 商品棚 ===== */}
      {smoothScore > 30 && (
        <div
          className="absolute left-0 top-16 bottom-32 w-16"
          style={{
            opacity: opacity(30, 25),
            transform: `translateX(${Math.max(-20, -(60 - smoothScore))}px)`,
            transition: "transform 0.8s ease-out",
          }}
        >
          {/* 棚本体 */}
          <div className="h-full bg-gray-200/40 backdrop-blur-[2px] border-r border-gray-300/30">
            {/* 棚板と商品を繰り返し */}
            {Array.from({ length: 6 }).map((_, row) => (
              <div key={row} className="relative" style={{ height: "16.66%" }}>
                {/* 棚板 */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-400/50" />
                {/* 商品（カラフルな四角） */}
                <div className="flex gap-[2px] p-[3px] h-full items-end">
                  {SHELF_PRODUCTS_LEFT[row % SHELF_PRODUCTS_LEFT.length].map(
                    (color, i) => (
                      <div
                        key={i}
                        className="rounded-[1px]"
                        style={{
                          backgroundColor: color,
                          width: `${8 + ((row + i) % 3) * 3}px`,
                          height: `${50 + ((row * 3 + i * 7) % 40)}%`,
                          opacity: 0.75,
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 右側 商品棚 ===== */}
      {smoothScore > 30 && (
        <div
          className="absolute right-0 top-16 bottom-32 w-16"
          style={{
            opacity: opacity(30, 25),
            transform: `translateX(${Math.max(0, Math.min(20, 60 - smoothScore))}px)`,
            transition: "transform 0.8s ease-out",
          }}
        >
          <div className="h-full bg-gray-200/40 backdrop-blur-[2px] border-l border-gray-300/30">
            {Array.from({ length: 6 }).map((_, row) => (
              <div key={row} className="relative" style={{ height: "16.66%" }}>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-400/50" />
                <div className="flex gap-[2px] p-[3px] h-full items-end justify-end">
                  {SHELF_PRODUCTS_RIGHT[row % SHELF_PRODUCTS_RIGHT.length].map(
                    (color, i) => (
                      <div
                        key={i}
                        className="rounded-[1px]"
                        style={{
                          backgroundColor: color,
                          width: `${8 + ((row + i + 2) % 3) * 3}px`,
                          height: `${45 + ((row * 5 + i * 3) % 45)}%`,
                          opacity: 0.75,
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== おでん / ホットスナックケース（右下） ===== */}
      {smoothScore > 50 && (
        <div
          className="absolute right-4 bottom-36"
          style={{ opacity: opacity(50, 20) }}
        >
          <div className="bg-amber-900/60 backdrop-blur-[2px] rounded-lg p-2 border border-amber-700/40">
            <div className="text-[8px] text-amber-200 font-bold text-center mb-1">
              おでん
            </div>
            <div className="grid grid-cols-3 gap-1">
              {["🍢", "🥚", "🍥", "🫘", "🥔", "🍢"].map((e, i) => (
                <div
                  key={i}
                  className="w-5 h-5 bg-amber-800/50 rounded-sm flex items-center justify-center text-[10px]"
                >
                  {e}
                </div>
              ))}
            </div>
            <div className="text-[7px] text-amber-300 text-center mt-1">
              各 ¥90〜
            </div>
          </div>
        </div>
      )}

      {/* ===== 肉まんケース（左下） ===== */}
      {smoothScore > 55 && (
        <div
          className="absolute left-4 bottom-36"
          style={{ opacity: opacity(55, 20) }}
        >
          <div className="bg-white/50 backdrop-blur-[2px] rounded-lg p-2 border border-gray-300/40">
            <div className="text-[8px] text-gray-700 font-bold text-center mb-1">
              中華まん
            </div>
            <div className="grid grid-cols-2 gap-1">
              {[
                { emoji: "🟡", label: "肉まん" },
                { emoji: "🟠", label: "ピザまん" },
                { emoji: "⚪", label: "あんまん" },
                { emoji: "🟤", label: "カレーまん" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center bg-gray-100/50 rounded-sm p-0.5"
                >
                  <span className="text-xs">{item.emoji}</span>
                  <span className="text-[6px] text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="text-[7px] text-gray-500 text-center mt-1">
              各 ¥150
            </div>
          </div>
        </div>
      )}

      {/* ===== レジカウンター（下部） ===== */}
      {smoothScore > 40 && (
        <div
          className="absolute bottom-24 left-8 right-8"
          style={{ opacity: opacity(40, 25) }}
        >
          <div className="bg-gray-800/50 backdrop-blur-[2px] rounded-t-lg border border-gray-600/30 border-b-0 px-3 py-2">
            <div className="flex items-center justify-between">
              {/* レジ画面 */}
              <div className="bg-black/60 rounded px-2 py-1 border border-gray-600/40">
                <div className="text-green-400 text-[10px] font-mono">
                  いらっしゃいませ
                </div>
                <div className="text-green-300 text-[8px] font-mono">
                  TOTAL: ¥---
                </div>
              </div>

              {/* バーコードリーダー */}
              <div className="flex items-center gap-1">
                <div className="w-6 h-8 bg-gray-600/60 rounded-sm border border-gray-500/30">
                  <div className="mt-1 mx-0.5 space-y-[1px]">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-[1px]"
                        style={{
                          backgroundColor: "rgba(255,0,0,0.5)",
                          width: `${60 + i * 10}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-[7px] text-gray-400">SCAN</div>
              </div>

              {/* Tポイントカード */}
              <div className="bg-yellow-500/70 rounded px-1.5 py-0.5">
                <div className="text-[7px] text-white font-bold">
                  ポイントカード
                </div>
                <div className="text-[6px] text-yellow-100">
                  はお持ちですか？
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 床タイル ===== */}
      {smoothScore > 35 && (
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{ opacity: opacity(35, 25) * 0.35 }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(200,200,200,0.3) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(200,200,200,0.3) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, rgba(200,200,200,0.3) 75%),
                linear-gradient(-45deg, transparent 75%, rgba(200,200,200,0.3) 75%)
              `,
              backgroundSize: "30px 30px",
              backgroundPosition: "0 0, 0 15px, 15px -15px, -15px 0px",
            }}
          />
        </div>
      )}

      {/* ===== 雑誌ラック（右側中央） ===== */}
      {smoothScore > 60 && (
        <div
          className="absolute right-1 top-1/3"
          style={{ opacity: opacity(60, 20) }}
        >
          <div className="bg-amber-100/40 backdrop-blur-[1px] rounded-sm p-1 border border-amber-200/30">
            <div className="text-[7px] text-amber-800 font-bold text-center mb-0.5">
              雑誌
            </div>
            {["📕", "📗", "📘", "📙", "📓"].map((e, i) => (
              <div
                key={i}
                className="text-[10px] leading-tight"
                style={{ opacity: 0.7 + i * 0.06 }}
              >
                {e}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== ATM（左側中央） ===== */}
      {smoothScore > 65 && (
        <div
          className="absolute left-2 top-1/3"
          style={{ opacity: opacity(65, 20) }}
        >
          <div className="bg-blue-900/50 backdrop-blur-[1px] rounded p-1.5 border border-blue-700/30">
            <div className="bg-blue-400/40 rounded-sm px-1 py-0.5 mb-1">
              <div className="text-[7px] text-white font-bold text-center">
                ATM
              </div>
            </div>
            <div className="bg-green-900/50 rounded-sm h-4 mb-1 flex items-center justify-center">
              <div className="text-[6px] text-green-300 font-mono">24h</div>
            </div>
            <div className="bg-gray-600/40 rounded-sm h-2 w-6 mx-auto" />
          </div>
        </div>
      )}

      {/* ===== コーヒーマシン ===== */}
      {smoothScore > 70 && (
        <div
          className="absolute left-14 top-[45%]"
          style={{ opacity: opacity(70, 20) }}
        >
          <div className="bg-gray-900/50 backdrop-blur-[1px] rounded p-1.5 border border-gray-700/30">
            <div className="text-[7px] text-white font-bold text-center">
              COFFEE
            </div>
            <div className="flex gap-0.5 mt-1 justify-center">
              <div className="w-3 h-4 bg-gray-700/60 rounded-sm" />
              <div className="w-3 h-4 bg-amber-800/60 rounded-sm" />
            </div>
            <div className="text-[6px] text-gray-400 text-center mt-0.5">
              ¥120〜
            </div>
          </div>
        </div>
      )}

      {/* ===== 全変身エフェクト ===== */}
      {smoothScore >= 80 && (
        <div
          className="absolute inset-0 border-[3px] border-yellow-400/40 rounded-lg"
          style={{
            animation: "konbini-glow 2s ease-in-out infinite",
          }}
        />
      )}

      {/* ===== 蛍光灯フリッカー（全体照明） ===== */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(200,220,255,0.08) 0%, transparent 20%, transparent 80%, rgba(200,220,255,0.05) 100%)",
          opacity: Math.min(smoothScore / 60, 1),
        }}
      />

      <style jsx>{`
        @keyframes konbini-glow {
          0%,
          100% {
            box-shadow: inset 0 0 30px rgba(255, 215, 0, 0.15),
              0 0 20px rgba(255, 215, 0, 0.1);
          }
          50% {
            box-shadow: inset 0 0 50px rgba(255, 215, 0, 0.25),
              0 0 40px rgba(255, 215, 0, 0.15);
          }
        }
      `}</style>
    </div>
  );
}

// 棚に並ぶ商品の色パターン
const SHELF_PRODUCTS_LEFT = [
  ["#E8430B", "#F58220", "#00A0E9", "#E8430B", "#fff"],
  ["#009944", "#E4007F", "#F58220", "#00A0E9"],
  ["#fff", "#E8430B", "#1D2088", "#F58220", "#009944"],
  ["#00A0E9", "#E4007F", "#fff", "#E8430B"],
  ["#F58220", "#009944", "#1D2088", "#E4007F", "#fff"],
  ["#E8430B", "#00A0E9", "#F58220", "#009944"],
];

const SHELF_PRODUCTS_RIGHT = [
  ["#1D2088", "#E4007F", "#F58220", "#fff"],
  ["#009944", "#E8430B", "#00A0E9", "#F58220", "#E4007F"],
  ["#fff", "#F58220", "#009944", "#1D2088"],
  ["#E8430B", "#00A0E9", "#E4007F", "#fff", "#F58220"],
  ["#F58220", "#1D2088", "#E8430B", "#009944"],
  ["#E4007F", "#fff", "#00A0E9", "#F58220", "#009944"],
];
