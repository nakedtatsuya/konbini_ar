"use client";

interface KonbiniOverlayProps {
  smoothScore: number;
}

export default function KonbiniOverlay({ smoothScore }: KonbiniOverlayProps) {
  const op = (threshold: number, range = 20) =>
    Math.min(Math.max((smoothScore - threshold) / range, 0), 1);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* ============================================================
          蛍光灯（天井） - リアルな蛍光管＋拡散光
          ============================================================ */}
      {smoothScore > 12 && (
        <div
          className="absolute top-0 left-0 right-0 flex justify-around px-6"
          style={{ opacity: op(12) }}
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center">
              {/* 蛍光管SVG */}
              <svg width="80" height="10" viewBox="0 0 80 10">
                <defs>
                  <linearGradient
                    id={`tube-${i}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#e8f0ff" />
                    <stop offset="50%" stopColor="#fff" />
                    <stop offset="100%" stopColor="#d8e8ff" />
                  </linearGradient>
                  <filter id={`glow-${i}`}>
                    <feGaussianBlur stdDeviation="3" />
                  </filter>
                </defs>
                {/* グロー */}
                <rect
                  x="5"
                  y="1"
                  width="70"
                  height="8"
                  rx="4"
                  fill="rgba(200,220,255,0.5)"
                  filter={`url(#glow-${i})`}
                />
                {/* 管本体 */}
                <rect
                  x="5"
                  y="2"
                  width="70"
                  height="6"
                  rx="3"
                  fill={`url(#tube-${i})`}
                  stroke="rgba(200,210,230,0.4)"
                  strokeWidth="0.5"
                />
                {/* 端子 */}
                <rect x="2" y="3" width="5" height="4" rx="1" fill="#c0c0c0" />
                <rect
                  x="73"
                  y="3"
                  width="5"
                  height="4"
                  rx="1"
                  fill="#c0c0c0"
                />
              </svg>
              {/* 光の拡散 */}
              <div
                className="w-32 h-24 -mt-2"
                style={{
                  background:
                    "radial-gradient(ellipse at center top, rgba(210,225,255,0.2) 0%, transparent 70%)",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* ============================================================
          看板（セブン風3色ストライプ）- SVGネオンサイン
          ============================================================ */}
      {smoothScore > 18 && (
        <div
          className="absolute top-8 left-1/2 -translate-x-1/2 z-10"
          style={{
            opacity: op(18, 15),
            transform: `translate(-50%, ${Math.max(0, 15 - (smoothScore - 18))}px)`,
            transition: "transform 0.6s ease-out",
          }}
        >
          <svg width="160" height="60" viewBox="0 0 160 60">
            <defs>
              <filter id="sign-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="sign-bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f0f0f0" />
              </linearGradient>
            </defs>
            {/* 看板の影 */}
            <rect
              x="6"
              y="6"
              width="148"
              height="52"
              rx="8"
              fill="rgba(0,0,0,0.15)"
            />
            {/* 看板本体 */}
            <rect
              x="4"
              y="3"
              width="152"
              height="52"
              rx="8"
              fill="url(#sign-bg)"
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="1"
            />
            {/* 上部3色ストライプ */}
            <rect x="8" y="7" width="48" height="5" rx="2" fill="#E8430B" />
            <rect x="57" y="7" width="46" height="5" rx="2" fill="#F58220" />
            <rect x="104" y="7" width="48" height="5" rx="2" fill="#008C44" />
            {/* テキスト */}
            <text
              x="80"
              y="32"
              textAnchor="middle"
              fill="#333"
              fontSize="15"
              fontWeight="900"
              fontFamily="sans-serif"
              filter="url(#sign-glow)"
            >
              コンビニ AR
            </text>
            <text
              x="80"
              y="46"
              textAnchor="middle"
              fill="#888"
              fontSize="8"
              fontWeight="600"
              fontFamily="Arial, sans-serif"
              letterSpacing="3"
            >
              24H OPEN
            </text>
            {/* 下部3色ストライプ */}
            <rect x="8" y="50" width="48" height="3" rx="1.5" fill="#E8430B" />
            <rect
              x="57"
              y="50"
              width="46"
              height="3"
              rx="1.5"
              fill="#F58220"
            />
            <rect
              x="104"
              y="50"
              width="48"
              height="3"
              rx="1.5"
              fill="#008C44"
            />
          </svg>
          {/* ネオングロー */}
          <div
            className="absolute -inset-2 rounded-xl -z-10"
            style={{
              boxShadow:
                "0 0 25px rgba(232,67,11,0.25), 0 0 50px rgba(0,140,68,0.15), 0 0 80px rgba(245,130,32,0.1)",
            }}
          />
        </div>
      )}

      {/* ============================================================
          自動ドアフレーム（アルミサッシ風）
          ============================================================ */}
      {smoothScore > 8 && (
        <>
          <div
            className="absolute top-0 bottom-0 left-0"
            style={{ opacity: op(8, 12), width: 6 }}
          >
            <svg width="6" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sash-l" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(160,165,170,0.7)" />
                  <stop offset="40%" stopColor="rgba(200,205,210,0.5)" />
                  <stop offset="100%" stopColor="rgba(180,185,190,0.15)" />
                </linearGradient>
              </defs>
              <rect width="6" height="100%" fill="url(#sash-l)" />
            </svg>
          </div>
          <div
            className="absolute top-0 bottom-0 right-0"
            style={{ opacity: op(8, 12), width: 6 }}
          >
            <svg width="6" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sash-r" x1="1" y1="0" x2="0" y2="0">
                  <stop offset="0%" stopColor="rgba(160,165,170,0.7)" />
                  <stop offset="40%" stopColor="rgba(200,205,210,0.5)" />
                  <stop offset="100%" stopColor="rgba(180,185,190,0.15)" />
                </linearGradient>
              </defs>
              <rect width="6" height="100%" fill="url(#sash-r)" />
            </svg>
          </div>
          <div
            className="absolute top-0 left-0 right-0"
            style={{ opacity: op(8, 12), height: 4 }}
          >
            <div className="w-full h-full bg-gradient-to-b from-gray-400/50 to-transparent" />
          </div>
        </>
      )}

      {/* ============================================================
          左 商品棚 - SVGリアル棚
          ============================================================ */}
      {smoothScore > 25 && (
        <div
          className="absolute left-0 top-14 bottom-28"
          style={{
            opacity: op(25, 20),
            width: 56,
            transform: `translateX(${Math.max(-10, -(50 - smoothScore) * 0.4)}px)`,
            transition: "transform 0.8s ease-out",
          }}
        >
          <ShelfSVG side="left" />
        </div>
      )}

      {/* ============================================================
          右 商品棚
          ============================================================ */}
      {smoothScore > 25 && (
        <div
          className="absolute right-0 top-14 bottom-28"
          style={{
            opacity: op(25, 20),
            width: 56,
            transform: `translateX(${Math.min(10, (50 - smoothScore) * 0.4)}px)`,
            transition: "transform 0.8s ease-out",
          }}
        >
          <ShelfSVG side="right" />
        </div>
      )}

      {/* ============================================================
          レジカウンター
          ============================================================ */}
      {smoothScore > 35 && (
        <div
          className="absolute bottom-24 left-6 right-6"
          style={{ opacity: op(35, 20) }}
        >
          <RegisterSVG />
        </div>
      )}

      {/* ============================================================
          おでんケース（右下）
          ============================================================ */}
      {smoothScore > 45 && (
        <div
          className="absolute right-2 bottom-32"
          style={{ opacity: op(45, 18) }}
        >
          <OdenCaseSVG />
        </div>
      )}

      {/* ============================================================
          中華まんケース（左下）
          ============================================================ */}
      {smoothScore > 50 && (
        <div
          className="absolute left-2 bottom-32"
          style={{ opacity: op(50, 18) }}
        >
          <NikumanCaseSVG />
        </div>
      )}

      {/* ============================================================
          コーヒーマシン（右中央）
          ============================================================ */}
      {smoothScore > 60 && (
        <div
          className="absolute right-14 top-[40%]"
          style={{ opacity: op(60, 15) }}
        >
          <CoffeeMachineSVG />
        </div>
      )}

      {/* ============================================================
          ATM（左中央）
          ============================================================ */}
      {smoothScore > 62 && (
        <div
          className="absolute left-14 top-[38%]"
          style={{ opacity: op(62, 15) }}
        >
          <ATMSVG />
        </div>
      )}

      {/* ============================================================
          床タイル
          ============================================================ */}
      {smoothScore > 30 && (
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{ opacity: op(30, 25) * 0.3 }}
        >
          <svg width="100%" height="100%" preserveAspectRatio="none">
            <defs>
              <pattern
                id="floor-tile"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <rect width="40" height="40" fill="rgba(220,220,220,0.15)" />
                <rect
                  width="19"
                  height="19"
                  fill="rgba(200,200,200,0.25)"
                  rx="1"
                />
                <rect
                  x="21"
                  y="21"
                  width="19"
                  height="19"
                  fill="rgba(200,200,200,0.25)"
                  rx="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#floor-tile)" />
          </svg>
        </div>
      )}

      {/* ============================================================
          蛍光灯の全体照明ティント
          ============================================================ */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(210,225,255,0.07) 0%, transparent 15%, transparent 85%, rgba(210,225,255,0.04) 100%)",
          opacity: Math.min(smoothScore / 50, 1),
        }}
      />

      {/* ============================================================
          フル変身エフェクト（80%+）
          ============================================================ */}
      {smoothScore >= 80 && (
        <div
          className="absolute inset-0"
          style={{
            border: "3px solid rgba(255,215,0,0.4)",
            borderRadius: 8,
            animation: "konbini-glow 2s ease-in-out infinite",
          }}
        />
      )}

      <style jsx>{`
        @keyframes konbini-glow {
          0%,
          100% {
            box-shadow: inset 0 0 30px rgba(255, 215, 0, 0.1),
              0 0 15px rgba(255, 215, 0, 0.08);
          }
          50% {
            box-shadow: inset 0 0 50px rgba(255, 215, 0, 0.2),
              0 0 30px rgba(255, 215, 0, 0.12);
          }
        }
      `}</style>
    </div>
  );
}

/* ================================================================
   SVGサブコンポーネント
   ================================================================ */

function ShelfSVG({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  const products = isLeft ? PRODUCTS_LEFT : PRODUCTS_RIGHT;

  return (
    <div className="w-full h-full">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 56 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={`shelf-bg-${side}`}
            x1={isLeft ? "0" : "1"}
            y1="0"
            x2={isLeft ? "1" : "0"}
            y2="0"
          >
            <stop offset="0%" stopColor="rgba(180,175,165,0.5)" />
            <stop offset="100%" stopColor="rgba(200,195,185,0.15)" />
          </linearGradient>
        </defs>

        {/* 棚背板 */}
        <rect
          width="56"
          height="400"
          fill={`url(#shelf-bg-${side})`}
        />

        {/* 棚板×6段 + 商品 */}
        {[0, 1, 2, 3, 4, 5].map((row) => {
          const shelfY = 10 + row * 65;
          const rowProducts = products[row % products.length];
          return (
            <g key={row}>
              {/* 商品 */}
              {rowProducts.map((p, i) => {
                const px = isLeft ? 4 + i * (p.w + 2) : 52 - (i + 1) * (p.w + 2);
                return (
                  <g key={i}>
                    <rect
                      x={px}
                      y={shelfY + 65 - 4 - p.h}
                      width={p.w}
                      height={p.h}
                      rx={p.round ? p.w / 2 : 1}
                      fill={p.color}
                      opacity="0.8"
                    />
                    {/* ハイライト */}
                    <rect
                      x={px + 1}
                      y={shelfY + 65 - 4 - p.h}
                      width={Math.max(1, p.w * 0.3)}
                      height={p.h}
                      rx={p.round ? p.w / 6 : 0.5}
                      fill="rgba(255,255,255,0.3)"
                    />
                  </g>
                );
              })}
              {/* 棚板 */}
              <rect
                x="0"
                y={shelfY + 65 - 4}
                width="56"
                height="4"
                fill="rgba(160,155,145,0.6)"
              />
              <rect
                x="0"
                y={shelfY + 65 - 4}
                width="56"
                height="1.5"
                fill="rgba(200,195,185,0.4)"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function RegisterSVG() {
  return (
    <svg width="100%" height="52" viewBox="0 0 340 52">
      <defs>
        <linearGradient id="counter-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(120,115,105,0.6)" />
          <stop offset="100%" stopColor="rgba(80,75,68,0.5)" />
        </linearGradient>
      </defs>
      {/* カウンター天板 */}
      <rect width="340" height="52" rx="6" fill="url(#counter-top)" />
      <rect
        x="1"
        y="1"
        width="338"
        height="4"
        rx="2"
        fill="rgba(255,255,255,0.08)"
      />

      {/* レジ画面 */}
      <rect x="12" y="8" width="80" height="36" rx="4" fill="rgba(0,0,0,0.6)" />
      <rect
        x="15"
        y="11"
        width="74"
        height="30"
        rx="2"
        fill="rgba(0,20,10,0.8)"
      />
      <text
        x="52"
        y="25"
        textAnchor="middle"
        fill="#4ade80"
        fontSize="8"
        fontFamily="monospace"
        fontWeight="700"
      >
        いらっしゃいませ
      </text>
      <text
        x="52"
        y="36"
        textAnchor="middle"
        fill="#22c55e"
        fontSize="6.5"
        fontFamily="monospace"
      >
        TOTAL: ¥ ---
      </text>

      {/* バーコードリーダー */}
      <g transform="translate(110, 10)">
        <rect width="20" height="32" rx="3" fill="rgba(70,70,70,0.7)" />
        <rect
          x="2"
          y="4"
          width="16"
          height="10"
          rx="1"
          fill="rgba(40,40,40,0.8)"
        />
        {/* 赤い光 */}
        <line
          x1="4"
          y1="9"
          x2="16"
          y2="9"
          stroke="rgba(255,0,0,0.6)"
          strokeWidth="1"
        />
        <text
          x="10"
          y="26"
          textAnchor="middle"
          fill="rgba(255,255,255,0.5)"
          fontSize="4"
        >
          SCAN
        </text>
      </g>

      {/* ポイントカード */}
      <g transform="translate(148, 12)">
        <rect width="60" height="28" rx="4" fill="rgba(234,179,8,0.8)" />
        <text
          x="30"
          y="14"
          textAnchor="middle"
          fill="white"
          fontSize="6"
          fontWeight="700"
        >
          ポイントカード
        </text>
        <text
          x="30"
          y="23"
          textAnchor="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize="5"
        >
          はお持ちですか？
        </text>
      </g>

      {/* 袋 */}
      <g transform="translate(224, 10)">
        <rect
          width="24"
          height="32"
          rx="2"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
          strokeDasharray="3,2"
        />
        <text
          x="12"
          y="18"
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="10"
        >
          🛍
        </text>
        <text
          x="12"
          y="28"
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="4"
        >
          袋¥3
        </text>
      </g>

      {/* 電子マネー端末 */}
      <g transform="translate(264, 10)">
        <rect width="60" height="32" rx="4" fill="rgba(50,50,50,0.6)" />
        <rect
          x="4"
          y="4"
          width="52"
          height="16"
          rx="2"
          fill="rgba(30,30,30,0.8)"
        />
        <text
          x="30"
          y="14"
          textAnchor="middle"
          fill="rgba(100,200,255,0.7)"
          fontSize="5.5"
          fontFamily="monospace"
        >
          タッチしてください
        </text>
        {/* NFCマーク */}
        <g transform="translate(22, 24)">
          <path
            d="M4 0 Q8 2, 8 6 Q8 10, 4 12"
            fill="none"
            stroke="rgba(100,200,255,0.5)"
            strokeWidth="1"
          />
          <path
            d="M8 1 Q12 3, 12 6 Q12 9, 8 11"
            fill="none"
            stroke="rgba(100,200,255,0.4)"
            strokeWidth="1"
          />
          <circle cx="2" cy="6" r="1.5" fill="rgba(100,200,255,0.5)" />
        </g>
      </g>
    </svg>
  );
}

function OdenCaseSVG() {
  return (
    <svg width="72" height="68" viewBox="0 0 72 68">
      <defs>
        <linearGradient id="oden-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(120,70,20,0.65)" />
          <stop offset="100%" stopColor="rgba(90,50,10,0.6)" />
        </linearGradient>
        <filter id="steam">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>
      {/* ケース */}
      <rect width="72" height="68" rx="6" fill="url(#oden-bg)" />
      <rect
        x="1"
        y="1"
        width="70"
        height="12"
        rx="5"
        fill="rgba(160,100,30,0.4)"
      />
      <text
        x="36"
        y="10"
        textAnchor="middle"
        fill="rgba(255,220,150,0.9)"
        fontSize="8"
        fontWeight="700"
      >
        おでん 🍢
      </text>
      {/* 仕切り線 */}
      <line
        x1="36"
        y1="16"
        x2="36"
        y2="60"
        stroke="rgba(100,60,10,0.4)"
        strokeWidth="1"
      />
      <line
        x1="4"
        y1="38"
        x2="68"
        y2="38"
        stroke="rgba(100,60,10,0.4)"
        strokeWidth="1"
      />
      {/* おでんアイテム */}
      {ODEN_ITEMS.map((item, i) => (
        <text
          key={i}
          x={item.x}
          y={item.y}
          textAnchor="middle"
          fontSize="14"
        >
          {item.emoji}
        </text>
      ))}
      {/* 湯気 */}
      {[18, 36, 54].map((x, i) => (
        <g key={i} opacity="0.4">
          <path
            d={`M${x} 14 Q${x - 2} 8, ${x} 4 Q${x + 2} 0, ${x} -3`}
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            filter="url(#steam)"
            opacity="0.5"
          >
            <animate
              attributeName="d"
              values={`M${x} 14 Q${x - 2} 8, ${x} 4 Q${x + 2} 0, ${x} -3;M${x} 14 Q${x + 2} 8, ${x} 4 Q${x - 2} 0, ${x} -3;M${x} 14 Q${x - 2} 8, ${x} 4 Q${x + 2} 0, ${x} -3`}
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      ))}
      {/* 価格 */}
      <text
        x="36"
        y="66"
        textAnchor="middle"
        fill="rgba(255,200,100,0.8)"
        fontSize="6"
      >
        各 ¥90〜
      </text>
    </svg>
  );
}

function NikumanCaseSVG() {
  return (
    <svg width="68" height="68" viewBox="0 0 68 68">
      <defs>
        <linearGradient id="nikuman-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(240,240,240,0.6)" />
          <stop offset="100%" stopColor="rgba(220,220,220,0.55)" />
        </linearGradient>
        <filter id="nikuman-steam">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>
      {/* ケース */}
      <rect width="68" height="68" rx="6" fill="url(#nikuman-bg)" />
      <rect
        x="1"
        y="1"
        width="66"
        height="12"
        rx="5"
        fill="rgba(200,200,200,0.4)"
      />
      <text
        x="34"
        y="10"
        textAnchor="middle"
        fill="rgba(80,80,80,0.9)"
        fontSize="7.5"
        fontWeight="700"
      >
        中華まん
      </text>
      {/* 4つの中華まん */}
      {NIKUMAN_ITEMS.map((item, i) => (
        <g key={i} transform={`translate(${item.x}, ${item.y})`}>
          <circle r="11" fill={item.color} opacity="0.6" />
          <circle r="8" fill={item.color} opacity="0.3" />
          <text textAnchor="middle" dominantBaseline="central" fontSize="5" fill="rgba(60,60,60,0.8)" fontWeight="600">
            {item.label}
          </text>
        </g>
      ))}
      {/* 湯気 */}
      {[20, 48].map((x, i) => (
        <path
          key={i}
          d={`M${x} 16 Q${x - 1.5} 11, ${x} 7 Q${x + 1.5} 3, ${x} 0`}
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          filter="url(#nikuman-steam)"
          opacity="0.35"
        >
          <animate
            attributeName="d"
            values={`M${x} 16 Q${x - 1.5} 11, ${x} 7 Q${x + 1.5} 3, ${x} 0;M${x} 16 Q${x + 1.5} 11, ${x} 7 Q${x - 1.5} 3, ${x} 0;M${x} 16 Q${x - 1.5} 11, ${x} 7 Q${x + 1.5} 3, ${x} 0`}
            dur="2.5s"
            repeatCount="indefinite"
          />
        </path>
      ))}
      <text
        x="34"
        y="66"
        textAnchor="middle"
        fill="rgba(80,80,80,0.7)"
        fontSize="6"
      >
        各 ¥150
      </text>
    </svg>
  );
}

function CoffeeMachineSVG() {
  return (
    <svg width="44" height="56" viewBox="0 0 44 56">
      <defs>
        <linearGradient id="coffee-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(50,50,50,0.7)" />
          <stop offset="100%" stopColor="rgba(30,30,30,0.65)" />
        </linearGradient>
      </defs>
      {/* 本体 */}
      <rect width="44" height="56" rx="4" fill="url(#coffee-body)" />
      {/* ディスプレイ */}
      <rect x="4" y="4" width="36" height="14" rx="2" fill="rgba(0,0,0,0.5)" />
      <text
        x="22"
        y="13"
        textAnchor="middle"
        fill="rgba(100,200,255,0.8)"
        fontSize="6"
        fontWeight="700"
        fontFamily="sans-serif"
      >
        COFFEE
      </text>
      {/* ボタン */}
      <circle cx="12" cy="26" r="4" fill="rgba(139,90,43,0.7)" stroke="rgba(200,150,80,0.5)" strokeWidth="0.8" />
      <circle cx="26" cy="26" r="4" fill="rgba(60,60,60,0.6)" stroke="rgba(150,150,150,0.4)" strokeWidth="0.8" />
      <text x="12" y="28" textAnchor="middle" fill="white" fontSize="3.5">HOT</text>
      <text x="26" y="28" textAnchor="middle" fill="white" fontSize="3.5">ICE</text>
      {/* ノズル */}
      <rect x="18" y="32" width="8" height="3" rx="1" fill="rgba(100,100,100,0.6)" />
      <rect x="20" y="35" width="4" height="6" fill="rgba(80,80,80,0.5)" />
      {/* カップ位置 */}
      <rect
        x="13"
        y="42"
        width="18"
        height="10"
        rx="2"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.8"
        strokeDasharray="2,2"
      />
      <text
        x="22"
        y="50"
        textAnchor="middle"
        fill="rgba(255,255,255,0.3)"
        fontSize="5"
      >
        ☕
      </text>
    </svg>
  );
}

function ATMSVG() {
  return (
    <svg width="40" height="52" viewBox="0 0 40 52">
      <defs>
        <linearGradient id="atm-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(20,40,80,0.65)" />
          <stop offset="100%" stopColor="rgba(10,25,60,0.6)" />
        </linearGradient>
      </defs>
      <rect width="40" height="52" rx="4" fill="url(#atm-body)" />
      {/* ロゴバー */}
      <rect x="2" y="2" width="36" height="10" rx="3" fill="rgba(0,120,200,0.5)" />
      <text x="20" y="10" textAnchor="middle" fill="white" fontSize="7" fontWeight="800">
        ATM
      </text>
      {/* 画面 */}
      <rect x="4" y="14" width="32" height="16" rx="2" fill="rgba(0,30,10,0.7)" />
      <text x="20" y="24" textAnchor="middle" fill="rgba(0,200,100,0.7)" fontSize="5.5" fontFamily="monospace">
        24時間
      </text>
      <text x="20" y="29" textAnchor="middle" fill="rgba(0,200,100,0.5)" fontSize="3" fontFamily="monospace">
        お引き出し・お預け入れ
      </text>
      {/* カードスロット */}
      <rect x="10" y="33" width="20" height="3" rx="1" fill="rgba(0,0,0,0.4)" />
      {/* テンキー */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={10 + col * 8}
            y={39 + row * 4}
            width="6"
            height="3"
            rx="0.5"
            fill="rgba(200,200,200,0.3)"
          />
        ))
      )}
    </svg>
  );
}

/* ================================================================
   商品データ
   ================================================================ */

interface Product {
  w: number;
  h: number;
  color: string;
  round?: boolean;
}

const PRODUCTS_LEFT: Product[][] = [
  // ドリンク棚
  [
    { w: 7, h: 28, color: "#00A0E9", round: true },
    { w: 7, h: 30, color: "#E8430B", round: true },
    { w: 7, h: 28, color: "#008C44", round: true },
    { w: 7, h: 26, color: "#F58220", round: true },
    { w: 7, h: 30, color: "#fff", round: true },
  ],
  // スナック棚
  [
    { w: 10, h: 20, color: "#E4007F" },
    { w: 10, h: 22, color: "#F58220" },
    { w: 10, h: 18, color: "#1D2088" },
    { w: 10, h: 20, color: "#E8430B" },
  ],
  // カップ麺棚
  [
    { w: 11, h: 16, color: "#E8430B" },
    { w: 11, h: 16, color: "#009944" },
    { w: 11, h: 16, color: "#F58220" },
    { w: 11, h: 16, color: "#1D2088" },
  ],
  // お菓子棚
  [
    { w: 9, h: 24, color: "#920783" },
    { w: 9, h: 20, color: "#E4007F" },
    { w: 9, h: 22, color: "#F58220" },
    { w: 9, h: 18, color: "#00A0E9" },
    { w: 9, h: 24, color: "#008C44" },
  ],
  // 日用品棚
  [
    { w: 12, h: 14, color: "#fff" },
    { w: 12, h: 18, color: "#00A0E9" },
    { w: 12, h: 16, color: "#E4007F" },
    { w: 12, h: 14, color: "#009944" },
  ],
  // 調味料棚
  [
    { w: 8, h: 22, color: "#920783", round: true },
    { w: 8, h: 26, color: "#E8430B", round: true },
    { w: 8, h: 24, color: "#1D2088", round: true },
    { w: 8, h: 20, color: "#F58220", round: true },
    { w: 8, h: 22, color: "#008C44", round: true },
  ],
];

const PRODUCTS_RIGHT: Product[][] = [
  [
    { w: 7, h: 30, color: "#1D2088", round: true },
    { w: 7, h: 28, color: "#E4007F", round: true },
    { w: 7, h: 30, color: "#F58220", round: true },
    { w: 7, h: 26, color: "#00A0E9", round: true },
    { w: 7, h: 28, color: "#E8430B", round: true },
  ],
  [
    { w: 10, h: 22, color: "#009944" },
    { w: 10, h: 20, color: "#E8430B" },
    { w: 10, h: 24, color: "#F58220" },
    { w: 10, h: 18, color: "#E4007F" },
  ],
  [
    { w: 11, h: 16, color: "#F58220" },
    { w: 11, h: 16, color: "#E8430B" },
    { w: 11, h: 16, color: "#1D2088" },
    { w: 11, h: 16, color: "#009944" },
  ],
  [
    { w: 9, h: 20, color: "#00A0E9" },
    { w: 9, h: 24, color: "#E8430B" },
    { w: 9, h: 18, color: "#920783" },
    { w: 9, h: 22, color: "#F58220" },
    { w: 9, h: 20, color: "#E4007F" },
  ],
  [
    { w: 12, h: 16, color: "#E4007F" },
    { w: 12, h: 14, color: "#009944" },
    { w: 12, h: 18, color: "#fff" },
    { w: 12, h: 16, color: "#1D2088" },
  ],
  [
    { w: 8, h: 24, color: "#E8430B", round: true },
    { w: 8, h: 20, color: "#008C44", round: true },
    { w: 8, h: 26, color: "#F58220", round: true },
    { w: 8, h: 22, color: "#1D2088", round: true },
    { w: 8, h: 24, color: "#920783", round: true },
  ],
];

const ODEN_ITEMS = [
  { x: 16, y: 28, emoji: "🍢" },
  { x: 54, y: 28, emoji: "🥚" },
  { x: 16, y: 50, emoji: "🍥" },
  { x: 54, y: 50, emoji: "🍢" },
];

const NIKUMAN_ITEMS = [
  { x: 20, y: 30, color: "rgba(245,222,179,0.8)", label: "肉まん" },
  { x: 48, y: 30, color: "rgba(255,180,100,0.8)", label: "ピザ" },
  { x: 20, y: 52, color: "rgba(250,235,215,0.8)", label: "あん" },
  { x: 48, y: 52, color: "rgba(210,170,100,0.8)", label: "カレー" },
];
