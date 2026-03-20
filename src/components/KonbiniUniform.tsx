"use client";

export type KonbiniBrand = "seven" | "lawson" | "famima";

interface KonbiniUniformProps {
  brand: KonbiniBrand;
  bbox: [number, number, number, number]; // [x, y, w, h]
}

const BRAND_CONFIG: Record<
  KonbiniBrand,
  {
    name: string;
    greeting: string;
    apronBg: string;
    apronBorder: string;
    logoBg: string;
    logoText: string;
    logoTextColor: string;
    stripes?: string[];
    tagColor: string;
    tagTextColor: string;
  }
> = {
  seven: {
    name: "セブン-イレブン",
    greeting: "いらっしゃいませ〜！",
    apronBg: "rgba(255,255,255,0.75)",
    apronBorder: "rgba(0,130,70,0.6)",
    logoBg: "#fff",
    logoText: "7-11",
    logoTextColor: "#E8430B",
    stripes: ["#E8430B", "#F58220", "#008C44"],
    tagColor: "#008C44",
    tagTextColor: "#fff",
  },
  lawson: {
    name: "ローソン",
    greeting: "いらっしゃいませ〜！",
    apronBg: "rgba(0,90,170,0.7)",
    apronBorder: "rgba(0,60,130,0.6)",
    logoBg: "#005AAA",
    logoText: "LAWSON",
    logoTextColor: "#fff",
    tagColor: "#005AAA",
    tagTextColor: "#fff",
  },
  famima: {
    name: "ファミリーマート",
    greeting: "いらっしゃいませ〜！",
    apronBg: "rgba(0,120,90,0.7)",
    apronBorder: "rgba(0,90,60,0.6)",
    logoBg: "#fff",
    logoText: "FamiMa",
    logoTextColor: "#008C6E",
    stripes: ["#008C6E", "#00A0E9"],
    tagColor: "#008C6E",
    tagTextColor: "#fff",
  },
};

export default function KonbiniUniform({ brand, bbox }: KonbiniUniformProps) {
  const [x, y, w, h] = bbox;
  const config = BRAND_CONFIG[brand];

  // エプロン領域: 人物bboxの上半身〜腰あたり
  const apronTop = y + h * 0.2;
  const apronLeft = x + w * 0.1;
  const apronWidth = w * 0.8;
  const apronHeight = h * 0.5;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* エプロン本体 */}
      <div
        className="absolute rounded-md overflow-hidden"
        style={{
          left: apronLeft,
          top: apronTop,
          width: apronWidth,
          height: apronHeight,
          background: config.apronBg,
          border: `2px solid ${config.apronBorder}`,
          backdropFilter: "blur(2px)",
        }}
      >
        {/* 上部ストライプ */}
        {config.stripes && (
          <div className="flex h-2">
            {config.stripes.map((color, i) => (
              <div key={i} className="flex-1" style={{ background: color }} />
            ))}
          </div>
        )}

        {/* ロゴ */}
        <div className="flex justify-center mt-2">
          <div
            className="px-3 py-1 rounded shadow-sm"
            style={{
              background: config.logoBg,
              border: `1px solid ${config.apronBorder}`,
            }}
          >
            <span
              className="font-black text-sm tracking-wide"
              style={{ color: config.logoTextColor }}
            >
              {config.logoText}
            </span>
          </div>
        </div>

        {/* ポケット */}
        <div className="flex justify-center mt-2 gap-2">
          <div
            className="w-8 h-6 rounded-b-sm border-t-0"
            style={{
              border: `1px solid ${config.apronBorder}`,
              background: "rgba(255,255,255,0.15)",
            }}
          />
          <div
            className="w-8 h-6 rounded-b-sm border-t-0"
            style={{
              border: `1px solid ${config.apronBorder}`,
              background: "rgba(255,255,255,0.15)",
            }}
          />
        </div>

        {/* 下部ストライプ */}
        {config.stripes && (
          <div className="absolute bottom-0 left-0 right-0 flex h-1.5">
            {config.stripes.map((color, i) => (
              <div key={i} className="flex-1" style={{ background: color }} />
            ))}
          </div>
        )}
      </div>

      {/* 名札 */}
      <div
        className="absolute"
        style={{
          left: apronLeft + apronWidth * 0.55,
          top: apronTop + 8,
          transform: "rotate(2deg)",
        }}
      >
        <div className="bg-white rounded shadow-md px-2 py-1 border border-gray-200">
          <div
            className="text-[7px] font-bold text-center rounded-sm px-1 mb-0.5"
            style={{
              background: config.tagColor,
              color: config.tagTextColor,
            }}
          >
            {config.name}
          </div>
          <div className="text-[10px] font-bold text-gray-800 text-center">
            店員
          </div>
          <div className="text-[7px] text-gray-500 text-center">STAFF</div>
        </div>
      </div>

      {/* 挨拶吹き出し */}
      <div
        className="absolute"
        style={{
          left: x + w / 2,
          top: y - 8,
          transform: "translate(-50%, -100%)",
        }}
      >
        <div
          className="relative px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap"
          style={{
            background: config.tagColor,
            color: config.tagTextColor,
          }}
        >
          <span className="font-bold text-sm">{config.greeting}</span>
          {/* 吹き出しの矢印 */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45"
            style={{ background: config.tagColor }}
          />
        </div>
      </div>

      {/* ブランド判定ラベル（足元） */}
      <div
        className="absolute flex justify-center"
        style={{
          left: x,
          top: y + h + 4,
          width: w,
        }}
      >
        <div
          className="px-2 py-0.5 rounded-full text-[9px] font-bold shadow"
          style={{
            background: config.tagColor,
            color: config.tagTextColor,
          }}
        >
          {config.name}スタッフ
        </div>
      </div>
    </div>
  );
}
