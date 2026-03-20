export interface KonbiniItem {
  jaName: string;
  price: number;
  category: string;
}

export const KONBINI_ITEMS: Record<string, KonbiniItem> = {
  bottle: { jaName: "お〜いお茶 500ml", price: 150, category: "ドリンク" },
  "wine glass": { jaName: "グラスワイン", price: 500, category: "ドリンク" },
  cup: { jaName: "セブンカフェ", price: 120, category: "ドリンク" },
  banana: { jaName: "朝バナナ", price: 130, category: "食品" },
  apple: { jaName: "サンふじりんご", price: 180, category: "食品" },
  orange: { jaName: "みかん 1個", price: 100, category: "食品" },
  sandwich: { jaName: "ミックスサンド", price: 280, category: "食品" },
  "hot dog": {
    jaName: "ビッグフランク",
    price: 150,
    category: "ホットスナック",
  },
  pizza: { jaName: "ピザまん", price: 160, category: "ホットスナック" },
  donut: { jaName: "オールドファッション", price: 120, category: "スイーツ" },
  cake: { jaName: "ショートケーキ", price: 350, category: "スイーツ" },
  book: { jaName: "週刊少年ジャンプ", price: 300, category: "雑誌" },
  "cell phone": {
    jaName: "モバイルバッテリー",
    price: 1980,
    category: "日用品",
  },
  umbrella: { jaName: "ビニール傘", price: 550, category: "日用品" },
  scissors: { jaName: "はさみ", price: 330, category: "文房具" },
  toothbrush: { jaName: "歯ブラシセット", price: 200, category: "日用品" },
  bowl: { jaName: "カップヌードル", price: 220, category: "食品" },
  backpack: { jaName: "エコバッグ", price: 300, category: "日用品" },
  handbag: { jaName: "トートバッグ", price: 500, category: "日用品" },
  remote: { jaName: "単3電池 4本", price: 298, category: "日用品" },
  mouse: { jaName: "ワイヤレスマウス", price: 980, category: "日用品" },
  keyboard: { jaName: "コンパクトキーボード", price: 1280, category: "日用品" },
  laptop: { jaName: "ノートPC充電器", price: 2980, category: "日用品" },
  chair: { jaName: "折りたたみ椅子", price: 980, category: "日用品" },
  clock: { jaName: "目覚まし時計", price: 880, category: "日用品" },
  vase: { jaName: "花瓶", price: 550, category: "日用品" },
  potted_plant: { jaName: "観葉植物", price: 498, category: "日用品" },
  pen: { jaName: "ボールペン 3色", price: 150, category: "文房具" },
};

// person/cat/dog は特別扱い（値札なし、別演出）
export const SPECIAL_DETECTIONS: Record<
  string,
  { jaName: string; message: string }
> = {
  person: { jaName: "お客様", message: "いらっしゃいませ！" },
  cat: { jaName: "看板猫", message: "にゃーん 🐱" },
  dog: { jaName: "看板犬", message: "わんわん 🐶" },
};

export const CATEGORY_COLORS: Record<string, string> = {
  ドリンク: "#00A0E9",
  食品: "#E60012",
  ホットスナック: "#F39800",
  スイーツ: "#E4007F",
  雑誌: "#009944",
  日用品: "#1D2088",
  文房具: "#920783",
};

export function isKonbiniItem(label: string): boolean {
  return label in KONBINI_ITEMS;
}

export function isSpecialDetection(label: string): boolean {
  return label in SPECIAL_DETECTIONS;
}

export function formatPrice(price: number): string {
  return `¥${price}（税込）`;
}

export function calculateKonbiniScore(
  items: { label: string; score: number }[]
): number {
  const konbiniItems = items.filter((i) => isKonbiniItem(i.label));
  if (konbiniItems.length === 0) return 0;

  const uniqueCategories = new Set(
    konbiniItems.map((i) => KONBINI_ITEMS[i.label].category)
  );

  // アイテム数スコア（最大60点）+ カテゴリ多様性スコア（最大40点）
  const itemScore = Math.min(konbiniItems.length * 15, 60);
  const categoryScore = Math.min(uniqueCategories.size * 15, 40);

  return Math.min(itemScore + categoryScore, 100);
}
