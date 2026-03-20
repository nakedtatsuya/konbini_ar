import type { KonbiniBrand } from "@/components/KonbiniUniform";

/**
 * 動画フレームの指定領域から主要な色のHSLを取得する
 */
export function getDominantHSL(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  bbox: [number, number, number, number]
): { h: number; s: number; l: number } | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const [bx, by, bw, bh] = bbox;

  // 服の部分（胴体中央）をサンプリング
  const sampleX = Math.max(0, Math.floor(bx + bw * 0.25));
  const sampleY = Math.max(0, Math.floor(by + bh * 0.25));
  const sampleW = Math.max(1, Math.floor(bw * 0.5));
  const sampleH = Math.max(1, Math.floor(bh * 0.35));

  // 小さいキャンバスに描画してサンプリング
  canvas.width = sampleW;
  canvas.height = sampleH;

  try {
    ctx.drawImage(
      video,
      sampleX,
      sampleY,
      sampleW,
      sampleH,
      0,
      0,
      sampleW,
      sampleH
    );
  } catch {
    return null;
  }

  const imageData = ctx.getImageData(0, 0, sampleW, sampleH);
  const data = imageData.data;

  // ピクセルの平均色を計算（一定間隔でサンプリング）
  let totalR = 0,
    totalG = 0,
    totalB = 0;
  let count = 0;
  const step = Math.max(1, Math.floor(data.length / 4 / 200)); // 最大200ピクセルサンプル

  for (let i = 0; i < data.length; i += step * 4) {
    totalR += data[i];
    totalG += data[i + 1];
    totalB += data[i + 2];
    count++;
  }

  if (count === 0) return null;

  const avgR = totalR / count;
  const avgG = totalG / count;
  const avgB = totalB / count;

  return rgbToHSL(avgR, avgG, avgB);
}

function rgbToHSL(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * HSL色からコンビニブランドを判定
 *
 * - 赤/オレンジ系 (h: 0-40, 340-360) → セブン-イレブン
 * - 青系 (h: 200-260) → ローソン
 * - 緑系 (h: 80-170) → ファミリーマート
 * - 無彩色(s < 15)で明るい → セブン（白ベース）
 * - 無彩色(s < 15)で暗い → ローソン（ダーク）
 * - その他 → 色相で最寄りを判定
 */
export function classifyBrand(hsl: {
  h: number;
  s: number;
  l: number;
}): KonbiniBrand {
  const { h, s, l } = hsl;

  // 無彩色（白/グレー/黒）
  if (s < 15) {
    if (l > 60) return "seven"; // 白っぽい → セブン
    if (l < 35) return "lawson"; // 暗い → ローソン
    return "famima"; // 中間グレー → ファミマ
  }

  // 赤〜オレンジ (セブン-イレブン)
  if (h <= 40 || h >= 340) return "seven";

  // 黄色〜黄緑 (ファミマ寄り)
  if (h > 40 && h <= 80) return "famima";

  // 緑 (ファミリーマート)
  if (h > 80 && h <= 170) return "famima";

  // 青緑〜シアン (ローソン寄り)
  if (h > 170 && h <= 200) return "lawson";

  // 青 (ローソン)
  if (h > 200 && h <= 260) return "lawson";

  // 紫〜マゼンタ (ローソン寄り)
  if (h > 260 && h <= 300) return "lawson";

  // ピンク (セブン寄り)
  if (h > 300 && h < 340) return "seven";

  return "seven";
}
