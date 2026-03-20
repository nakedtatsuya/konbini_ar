"use client";

import { useState, useEffect } from "react";

interface CartItem {
  name: string;
  price: number;
  category: string;
}

interface PaymentModalProps {
  cart: CartItem[];
  onClose: () => void;
  onComplete: () => void;
}

type Step = "confirm" | "scanning" | "success";

export default function PaymentModal({
  cart,
  onClose,
  onComplete,
}: PaymentModalProps) {
  const [step, setStep] = useState<Step>("confirm");
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // スキャン演出 → 成功
  useEffect(() => {
    if (step === "scanning") {
      const timer = setTimeout(() => setStep("success"), 2200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 背景オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step === "confirm" ? onClose : undefined}
      />

      {/* モーダル本体 */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl overflow-hidden animate-slide-up">
        {step === "confirm" && (
          <ConfirmStep
            cart={cart}
            total={total}
            onPay={() => setStep("scanning")}
            onClose={onClose}
          />
        )}
        {step === "scanning" && <ScanningStep total={total} />}
        {step === "success" && (
          <SuccessStep cart={cart} total={total} onDone={onComplete} />
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.35s ease-out;
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   ステップ1: 注文確認
   ============================================================ */
function ConfirmStep({
  cart,
  total,
  onPay,
  onClose,
}: {
  cart: CartItem[];
  total: number;
  onPay: () => void;
  onClose: () => void;
}) {
  return (
    <div className="p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">お会計</h2>
        <button
          onClick={onClose}
          className="text-gray-400 text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      {/* 商品リスト */}
      <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
        {cart.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-gray-100"
          >
            <div>
              <span className="text-sm text-gray-800 font-medium">
                {item.name}
              </span>
              <span className="text-xs text-gray-400 ml-2">
                {item.category}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-800">
              ¥{item.price}
            </span>
          </div>
        ))}
      </div>

      {/* 合計 */}
      <div className="flex items-center justify-between py-3 border-t-2 border-gray-800 mb-6">
        <span className="text-base font-bold text-gray-800">
          合計（税込）
        </span>
        <span className="text-2xl font-black text-gray-900">
          ¥{total.toLocaleString()}
        </span>
      </div>

      {/* PayPayボタン */}
      <button
        onClick={onPay}
        className="w-full py-4 rounded-xl font-bold text-lg text-white active:scale-[0.98] transition-transform"
        style={{
          background: "linear-gradient(135deg, #FF0033 0%, #CC0029 100%)",
          boxShadow: "0 4px 15px rgba(255,0,51,0.3)",
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <PayPayLogo />
          <span>で支払う</span>
        </div>
      </button>

      <p className="text-center text-gray-400 text-xs mt-3">
        ※ デモ用のモック決済です
      </p>
    </div>
  );
}

/* ============================================================
   ステップ2: QRスキャン演出
   ============================================================ */
function ScanningStep({ total }: { total: number }) {
  return (
    <div className="p-8 flex flex-col items-center">
      {/* PayPay ヘッダー */}
      <div className="mb-6">
        <PayPayLogo size="large" />
      </div>

      {/* QRコード（SVGモック） */}
      <div className="relative mb-6">
        <QRCodeSVG />
        {/* スキャンライン */}
        <div
          className="absolute left-0 right-0 h-1 bg-red-500"
          style={{
            animation: "scan-line 1.5s ease-in-out infinite",
            boxShadow: "0 0 10px rgba(255,0,0,0.5)",
          }}
        />
      </div>

      <div className="text-gray-600 font-medium mb-2">
        QRコードをスキャン中...
      </div>
      <div className="text-2xl font-black text-gray-800">
        ¥{total.toLocaleString()}
      </div>

      {/* ローディングドット */}
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-red-400"
            style={{
              animation: `bounce-dot 1s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes scan-line {
          0%,
          100% {
            top: 10%;
          }
          50% {
            top: 85%;
          }
        }
        @keyframes bounce-dot {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   ステップ3: 支払い完了
   ============================================================ */
function SuccessStep({
  cart,
  total,
  onDone,
}: {
  cart: CartItem[];
  total: number;
  onDone: () => void;
}) {
  const now = new Date();
  const timeStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="p-6">
      {/* 成功アイコン */}
      <div className="flex flex-col items-center mb-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
          style={{
            background: "linear-gradient(135deg, #00C853 0%, #00A843 100%)",
            boxShadow: "0 4px 15px rgba(0,200,83,0.3)",
            animation: "pop-in 0.4s ease-out",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M8 16 L14 22 L24 10"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">お支払い完了</h2>
        <p className="text-gray-400 text-sm mt-1">
          ありがとうございました！
        </p>
      </div>

      {/* レシート */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
        <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
          <div className="text-sm font-bold text-gray-700">
            コンビニAR 店
          </div>
          <div className="text-xs text-gray-400">{timeStr}</div>
        </div>

        <div className="space-y-1.5 mb-3">
          {cart.map((item, i) => (
            <div
              key={i}
              className="flex justify-between text-sm text-gray-600"
            >
              <span>{item.name}</span>
              <span>¥{item.price}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-300 pt-2">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-gray-700">
              合計（税込）
            </span>
            <span className="text-xl font-black text-gray-900">
              ¥{total.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>PayPay決済</span>
            <span>+{Math.floor(total * 0.005)}P 付与予定</span>
          </div>
        </div>
      </div>

      {/* 閉じるボタン */}
      <button
        onClick={onDone}
        className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold active:scale-[0.98] transition-transform"
      >
        閉じる
      </button>

      <style jsx>{`
        @keyframes pop-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          60% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   PayPayロゴ（SVG）
   ============================================================ */
function PayPayLogo({ size = "normal" }: { size?: "normal" | "large" }) {
  const scale = size === "large" ? 1.5 : 1;
  return (
    <svg
      width={80 * scale}
      height={24 * scale}
      viewBox="0 0 80 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="80" height="24" rx="4" fill="#FF0033" />
      <text
        x="40"
        y="16"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
        letterSpacing="0.5"
      >
        PayPay
      </text>
    </svg>
  );
}

/* ============================================================
   QRコード（SVGモック）
   ============================================================ */
function QRCodeSVG() {
  // 疑似QRコードパターンを生成
  const size = 160;
  const cellSize = 8;
  const cells = size / cellSize;

  const pattern: boolean[][] = [];
  for (let r = 0; r < cells; r++) {
    pattern[r] = [];
    for (let c = 0; c < cells; c++) {
      // 角の位置検出パターン
      const isCornerArea =
        (r < 4 && c < 4) ||
        (r < 4 && c >= cells - 4) ||
        (r >= cells - 4 && c < 4);
      const isCornerBorder =
        isCornerArea &&
        (r === 0 ||
          r === 3 ||
          c === 0 ||
          c === 3 ||
          c === cells - 1 ||
          c === cells - 4 ||
          (r >= cells - 4 && (r === cells - 1 || r === cells - 4)));
      const isCornerInner =
        isCornerArea &&
        ((r === 1 || r === 2) &&
          (c === 1 || c === 2 || c === cells - 3 || c === cells - 2)) ||
        ((r === cells - 3 || r === cells - 2) && (c === 1 || c === 2));

      if (isCornerBorder || isCornerInner) {
        pattern[r][c] = true;
      } else if (isCornerArea) {
        pattern[r][c] = false;
      } else {
        // ランダム風だが決定的なパターン
        pattern[r][c] = ((r * 7 + c * 13 + r * c) % 3) !== 0;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" rx="8" />
      {pattern.map((row, r) =>
        row.map(
          (filled, c) =>
            filled && (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#333"
              />
            )
        )
      )}
      {/* 中央にPayPayロゴ */}
      <rect
        x={size / 2 - 20}
        y={size / 2 - 8}
        width="40"
        height="16"
        rx="3"
        fill="#FF0033"
      />
      <text
        x={size / 2}
        y={size / 2 + 4}
        textAnchor="middle"
        fill="white"
        fontSize="8"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
      >
        PayPay
      </text>
    </svg>
  );
}
