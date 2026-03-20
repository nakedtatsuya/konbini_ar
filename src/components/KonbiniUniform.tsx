"use client";

export type KonbiniBrand = "seven" | "lawson" | "famima";

interface KonbiniUniformProps {
  brand: KonbiniBrand;
  bbox: [number, number, number, number]; // [x, y, w, h]
}

const BRAND_CONFIG = {
  seven: {
    name: "セブン-イレブン",
    greeting: "いらっしゃいませ〜！",
    // Colors
    apronFill: "#ffffff",
    apronStroke: "#d4d4d4",
    stripes: ["#E8430B", "#F58220", "#008C44"],
    logoPrimary: "#E8430B",
    logoSecondary: "#008C44",
    logoText: "7",
    logoSubText: "ELEVEN",
    tagBg: "#008C44",
    tagText: "#fff",
    bubbleBg: "#E8430B",
    bubbleText: "#fff",
    pocketStroke: "#e0e0e0",
  },
  lawson: {
    name: "ローソン",
    greeting: "いらっしゃいませ〜！",
    apronFill: "#005AAA",
    apronStroke: "#004488",
    stripes: ["#005AAA", "#0078D4", "#005AAA"],
    logoPrimary: "#fff",
    logoSecondary: "#005AAA",
    logoText: "L",
    logoSubText: "LAWSON",
    tagBg: "#005AAA",
    tagText: "#fff",
    bubbleBg: "#005AAA",
    bubbleText: "#fff",
    pocketStroke: "rgba(255,255,255,0.3)",
  },
  famima: {
    name: "ファミリーマート",
    greeting: "いらっしゃいませ〜！",
    apronFill: "#00845E",
    apronStroke: "#006644",
    stripes: ["#008C6E", "#00A0E9", "#008C6E"],
    logoPrimary: "#fff",
    logoSecondary: "#00A0E9",
    logoText: "F",
    logoSubText: "FamilyMart",
    tagBg: "#008C6E",
    tagText: "#fff",
    bubbleBg: "#008C6E",
    bubbleText: "#fff",
    pocketStroke: "rgba(255,255,255,0.3)",
  },
} as const;

function ApronSVG({
  brand,
  width,
  height,
}: {
  brand: KonbiniBrand;
  width: number;
  height: number;
}) {
  const c = BRAND_CONFIG[brand];
  const w = 200;
  const h = 260;
  const isWhiteApron = brand === "seven";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* エプロンの影 */}
        <filter id={`shadow-${brand}`} x="-10%" y="-5%" width="120%" height="115%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.3" />
        </filter>
        {/* 布の質感グラデーション */}
        <linearGradient id={`fabric-${brand}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.15" />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.1" />
        </linearGradient>
        {/* ロゴ背景グラデーション */}
        <linearGradient id={`logo-bg-${brand}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.logoPrimary} stopOpacity="1" />
          <stop offset="100%" stopColor={c.logoPrimary} stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* === エプロン本体 === */}
      <g filter={`url(#shadow-${brand})`}>
        {/* 肩紐 - 左 */}
        <path
          d={`M 60 0 Q 55 20, 50 40 L 58 42 Q 63 22, 66 4 Z`}
          fill={c.apronFill}
          stroke={c.apronStroke}
          strokeWidth="1"
          opacity="0.9"
        />
        {/* 肩紐 - 右 */}
        <path
          d={`M 140 0 Q 145 20, 150 40 L 142 42 Q 137 22, 134 4 Z`}
          fill={c.apronFill}
          stroke={c.apronStroke}
          strokeWidth="1"
          opacity="0.9"
        />

        {/* エプロン胸部（台形） */}
        <path
          d={`M 45 38 L 155 38 L 165 120 Q 168 140, 160 145 L 40 145 Q 32 140, 35 120 Z`}
          fill={c.apronFill}
          stroke={c.apronStroke}
          strokeWidth="1.5"
          opacity="0.88"
        />

        {/* エプロン腰〜裾（広がる台形） */}
        <path
          d={`M 40 145 L 160 145 L 175 240 Q 178 252, 170 255 L 30 255 Q 22 252, 25 240 Z`}
          fill={c.apronFill}
          stroke={c.apronStroke}
          strokeWidth="1.5"
          opacity="0.88"
        />

        {/* 布の質感オーバーレイ */}
        <path
          d={`M 45 38 L 155 38 L 175 240 Q 178 252, 170 255 L 30 255 Q 22 252, 25 240 L 45 38 Z`}
          fill={`url(#fabric-${brand})`}
        />
      </g>

      {/* === 上部ストライプ === */}
      {c.stripes.map((color, i) => (
        <rect
          key={`top-${i}`}
          x={46 + i * 0.5}
          y={38 + i * 6}
          width={108 - i}
          height={5}
          fill={color}
          rx="1"
          opacity="0.95"
        />
      ))}

      {/* === ロゴエリア === */}
      <g transform="translate(100, 90)">
        {/* ロゴ背景サークル */}
        <circle
          r="22"
          fill={isWhiteApron ? c.logoPrimary : "rgba(255,255,255,0.2)"}
          stroke={isWhiteApron ? c.apronStroke : "rgba(255,255,255,0.3)"}
          strokeWidth="1.5"
        />
        {/* ロゴ文字 */}
        <text
          textAnchor="middle"
          dominantBaseline="central"
          y="-2"
          fill={isWhiteApron ? c.logoPrimary : "#fff"}
          fontSize="24"
          fontWeight="900"
          fontFamily="Arial, sans-serif"
        >
          {c.logoText}
        </text>
        {/* サブテキスト */}
        <text
          textAnchor="middle"
          dominantBaseline="central"
          y="14"
          fill={isWhiteApron ? c.logoSecondary : "rgba(255,255,255,0.8)"}
          fontSize="6.5"
          fontWeight="700"
          fontFamily="Arial, sans-serif"
          letterSpacing="0.5"
        >
          {c.logoSubText}
        </text>
      </g>

      {/* === ポケット左 === */}
      <rect
        x="52"
        y="155"
        width="38"
        height="30"
        rx="3"
        fill="none"
        stroke={c.pocketStroke}
        strokeWidth="1.5"
      />
      <line
        x1="52"
        y1="155"
        x2="90"
        y2="155"
        stroke={c.pocketStroke}
        strokeWidth="2"
      />

      {/* === ポケット右 === */}
      <rect
        x="110"
        y="155"
        width="38"
        height="30"
        rx="3"
        fill="none"
        stroke={c.pocketStroke}
        strokeWidth="1.5"
      />
      <line
        x1="110"
        y1="155"
        x2="148"
        y2="155"
        stroke={c.pocketStroke}
        strokeWidth="2"
      />

      {/* ポケットにペン */}
      <rect
        x="115"
        y="148"
        width="2.5"
        height="12"
        rx="1"
        fill={c.stripes[0]}
        opacity="0.7"
        transform="rotate(-5, 116, 154)"
      />

      {/* === 下部ストライプ === */}
      {c.stripes.map((color, i) => (
        <rect
          key={`bottom-${i}`}
          x={30 + i * 0.3}
          y={235 + i * 5}
          width={140 - i * 0.6}
          height={4}
          fill={color}
          rx="1"
          opacity="0.9"
        />
      ))}

      {/* === 腰紐 === */}
      <path
        d={`M 40 142 Q 20 138, 5 145 Q -2 148, 5 152 Q 15 155, 25 148`}
        fill="none"
        stroke={c.apronFill}
        strokeWidth="4"
        opacity="0.7"
      />
      <path
        d={`M 160 142 Q 180 138, 195 145 Q 202 148, 195 152 Q 185 155, 175 148`}
        fill="none"
        stroke={c.apronFill}
        strokeWidth="4"
        opacity="0.7"
      />
    </svg>
  );
}

function NameTagSVG({ brand }: { brand: KonbiniBrand }) {
  const c = BRAND_CONFIG[brand];
  return (
    <svg viewBox="0 0 70 40" width={56} height={32} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id={`tag-shadow-${brand}`}>
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* カード */}
      <rect
        x="2"
        y="2"
        width="66"
        height="36"
        rx="4"
        fill="white"
        stroke="#ddd"
        strokeWidth="1"
        filter={`url(#tag-shadow-${brand})`}
      />
      {/* ブランドバー */}
      <rect x="2" y="2" width="66" height="12" rx="4" fill={c.tagBg} />
      <rect x="2" y="10" width="66" height="4" fill={c.tagBg} />
      <text
        x="35"
        y="11"
        textAnchor="middle"
        fill={c.tagText}
        fontSize="7"
        fontWeight="700"
        fontFamily="sans-serif"
      >
        {c.name}
      </text>
      {/* 名前 */}
      <text
        x="35"
        y="27"
        textAnchor="middle"
        fill="#333"
        fontSize="10"
        fontWeight="900"
        fontFamily="sans-serif"
      >
        店員
      </text>
      <text
        x="35"
        y="36"
        textAnchor="middle"
        fill="#999"
        fontSize="5.5"
        fontWeight="600"
        fontFamily="sans-serif"
        letterSpacing="1"
      >
        STAFF
      </text>
      {/* ピン穴 */}
      <circle cx="35" cy="2" r="1.5" fill="#ccc" />
    </svg>
  );
}

export default function KonbiniUniform({ brand, bbox }: KonbiniUniformProps) {
  const [x, y, w, h] = bbox;
  const config = BRAND_CONFIG[brand];

  // エプロン: 胴体部分にフィット
  const apronWidth = w * 0.75;
  const apronHeight = h * 0.55;
  const apronLeft = x + (w - apronWidth) / 2;
  const apronTop = y + h * 0.18;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* エプロンSVG */}
      <div
        className="absolute"
        style={{
          left: apronLeft,
          top: apronTop,
          width: apronWidth,
          height: apronHeight,
          transition: "all 0.15s ease-out",
        }}
      >
        <ApronSVG brand={brand} width={apronWidth} height={apronHeight} />
      </div>

      {/* 名札 */}
      <div
        className="absolute"
        style={{
          left: apronLeft + apronWidth * 0.58,
          top: apronTop + apronHeight * 0.08,
          transform: "rotate(2deg)",
          transition: "all 0.15s ease-out",
        }}
      >
        <NameTagSVG brand={brand} />
      </div>

      {/* 挨拶吹き出し */}
      <div
        className="absolute"
        style={{
          left: x + w / 2,
          top: y - 12,
          transform: "translate(-50%, -100%)",
        }}
      >
        <div className="relative">
          <div
            className="px-4 py-2 rounded-2xl shadow-lg whitespace-nowrap"
            style={{
              background: config.bubbleBg,
              color: config.bubbleText,
              boxShadow: `0 4px 15px ${config.bubbleBg}66`,
            }}
          >
            <span className="font-bold text-sm">{config.greeting}</span>
          </div>
          {/* 吹き出し三角 */}
          <div className="flex justify-center">
            <div
              className="w-3 h-3 rotate-45 -mt-1.5"
              style={{ background: config.bubbleBg }}
            />
          </div>
        </div>
      </div>

      {/* 足元ブランドラベル */}
      <div
        className="absolute flex justify-center"
        style={{
          left: x,
          top: y + h + 6,
          width: w,
        }}
      >
        <div
          className="px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1"
          style={{
            background: config.tagBg,
            color: config.tagText,
            boxShadow: `0 2px 10px ${config.tagBg}44`,
          }}
        >
          <span className="text-xs">🏪</span>
          {config.name}スタッフ
        </div>
      </div>
    </div>
  );
}
