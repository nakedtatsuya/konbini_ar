"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  KONBINI_ITEMS,
  SPECIAL_DETECTIONS,
  CATEGORY_COLORS,
  formatPrice,
  isKonbiniItem,
  isSpecialDetection,
  calculateKonbiniScore,
  type KonbiniItem,
} from "@/lib/konbini";
import { getDominantHSL, classifyBrand } from "@/lib/colorAnalysis";
import KonbiniOverlay from "./KonbiniOverlay";
import KonbiniUniform, { type KonbiniBrand } from "./KonbiniUniform";
import PaymentModal from "./PaymentModal";

interface Detection {
  id: string;
  label: string;
  score: number;
  bbox: [number, number, number, number];
  videoBbox: [number, number, number, number];
  konbiniItem: KonbiniItem | null;
  specialMessage: string | null;
  brand: KonbiniBrand | null;
}

interface CartItem {
  name: string;
  price: number;
  category: string;
}

interface DragState {
  item: KonbiniItem;
  label: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

// ドロップ判定: 座標が person bbox 内か
function isOverPerson(
  x: number,
  y: number,
  detections: Detection[]
): boolean {
  return detections.some((d) => {
    if (d.label !== "person") return false;
    const [bx, by, bw, bh] = d.bbox;
    return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
  });
}

export default function KonbiniAR() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<any>(null);
  const animationRef = useRef<number>(0);
  const lastDetectionTime = useRef<number>(0);
  const audioSevenRef = useRef<HTMLAudioElement | null>(null);
  const audioLawsonRef = useRef<HTMLAudioElement | null>(null);
  const audioFamimaRef = useRef<HTMLAudioElement | null>(null);
  const playedThresholds = useRef<Set<number>>(new Set());
  const isAudioPlaying = useRef(false);
  const detectionsRef = useRef<Detection[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState("カメラを起動中...");
  const [detections, setDetections] = useState<Detection[]>([]);
  const [konbiniScore, setKonbiniScore] = useState(0);
  const [smoothScore, setSmoothScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [totalDetected, setTotalDetected] = useState(0);

  // カート & ドラッグ & 決済
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState<{
    x: number;
    y: number;
    name: string;
  } | null>(null);

  // detections を ref にも保持（タッチイベントから最新値を参照するため）
  useEffect(() => {
    detectionsRef.current = detections;
  }, [detections]);

  // フィードバックを一定時間で消す
  useEffect(() => {
    if (!addedFeedback) return;
    const t = setTimeout(() => setAddedFeedback(null), 1200);
    return () => clearTimeout(t);
  }, [addedFeedback]);

  // Smooth score animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSmoothScore((prev) => {
        const diff = konbiniScore - prev;
        if (Math.abs(diff) < 0.5) return konbiniScore;
        return prev + diff * 0.15;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [konbiniScore]);

  // Transform video coordinates to screen coordinates
  const transformBbox = useCallback(
    (
      videoBbox: number[],
      videoWidth: number,
      videoHeight: number
    ): [number, number, number, number] => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const videoAspect = videoWidth / videoHeight;
      const screenAspect = screenWidth / screenHeight;

      let scale: number, offsetX: number, offsetY: number;

      if (videoAspect > screenAspect) {
        scale = screenHeight / videoHeight;
        offsetX = (screenWidth - videoWidth * scale) / 2;
        offsetY = 0;
      } else {
        scale = screenWidth / videoWidth;
        offsetX = 0;
        offsetY = (screenHeight - videoHeight * scale) / 2;
      }

      return [
        videoBbox[0] * scale + offsetX,
        videoBbox[1] * scale + offsetY,
        videoBbox[2] * scale,
        videoBbox[3] * scale,
      ];
    },
    []
  );

  // ============================================================
  // タッチドラッグハンドラ
  // ============================================================
  const handleTouchStart = useCallback(
    (item: KonbiniItem, label: string, e: React.TouchEvent) => {
      e.stopPropagation();
      const touch = e.touches[0];
      setDrag({
        item,
        label,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
      });
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!drag) return;
      const touch = e.touches[0];
      setDrag((prev) =>
        prev
          ? { ...prev, currentX: touch.clientX, currentY: touch.clientY }
          : null
      );
    },
    [drag]
  );

  const handleTouchEnd = useCallback(() => {
    if (!drag) return;
    const { item, currentX, currentY } = drag;

    if (isOverPerson(currentX, currentY, detectionsRef.current)) {
      // 店員にドロップ成功 → カートに追加
      setCart((prev) => [
        ...prev,
        { name: item.jaName, price: item.price, category: item.category },
      ]);
      setAddedFeedback({ x: currentX, y: currentY, name: item.jaName });
    }

    setDrag(null);
  }, [drag]);

  // ============================================================
  // Initialize camera and model
  // ============================================================
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if (!canvasRef.current) {
          canvasRef.current = document.createElement("canvas");
        }

        setLoadingStep("AIモデルを読み込み中...");

        const [tf, cocoSsd] = await Promise.all([
          import("@tensorflow/tfjs"),
          import("@tensorflow-models/coco-ssd"),
        ]);

        await tf.ready();
        if (cancelled) return;

        setLoadingStep("物体認識モデルを準備中...");

        const model = await cocoSsd.load({ base: "lite_mobilenet_v2" });
        if (cancelled) return;

        modelRef.current = model;
        setIsLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          console.error("Init error:", err);
          setError(
            err?.name === "NotAllowedError"
              ? "カメラへのアクセスが拒否されました。ブラウザの設定からカメラの許可を有効にしてください。"
              : "初期化に失敗しました。ページを再読み込みしてお試しください。"
          );
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, []);

  // ============================================================
  // Detection loop
  // ============================================================
  useEffect(() => {
    if (isLoading || !modelRef.current) return;

    let running = true;

    const detect = async () => {
      if (!running) return;

      const now = Date.now();

      if (
        now - lastDetectionTime.current > 400 &&
        videoRef.current &&
        modelRef.current
      ) {
        lastDetectionTime.current = now;

        try {
          const predictions = await modelRef.current.detect(videoRef.current);
          const video = videoRef.current;

          const newDetections: Detection[] = predictions
            .filter((p: any) => p.score > 0.35)
            .map((p: any, i: number) => {
              const bbox = transformBbox(
                p.bbox,
                video.videoWidth,
                video.videoHeight
              );
              const videoBbox: [number, number, number, number] = [
                p.bbox[0],
                p.bbox[1],
                p.bbox[2],
                p.bbox[3],
              ];
              const item = KONBINI_ITEMS[p.class] || null;
              const special = SPECIAL_DETECTIONS[p.class] || null;

              let brand: KonbiniBrand | null = null;
              if (p.class === "person" && canvasRef.current) {
                const hsl = getDominantHSL(
                  video,
                  canvasRef.current,
                  videoBbox
                );
                if (hsl) {
                  brand = classifyBrand(hsl);
                }
              }

              return {
                id: `${p.class}-${i}`,
                label: p.class,
                score: p.score,
                bbox,
                videoBbox,
                konbiniItem: item,
                specialMessage: special?.message || null,
                brand,
              };
            });

          setDetections(newDetections);

          const rawScore = calculateKonbiniScore(
            newDetections.map((d) => ({ label: d.label, score: d.score }))
          );
          setKonbiniScore(rawScore);
          setTotalDetected(
            newDetections.filter((d) => isKonbiniItem(d.label)).length
          );

          // サウンド
          const thresholds = [20, 50, 80];
          for (const t of thresholds) {
            if (
              rawScore >= t &&
              !playedThresholds.current.has(t) &&
              !isAudioPlaying.current
            ) {
              playedThresholds.current.add(t);
              const personDet = newDetections.find(
                (d) => d.label === "person" && d.brand
              );
              const pBrand = personDet?.brand;
              const audio =
                pBrand === "seven"
                  ? audioSevenRef.current
                  : pBrand === "famima"
                    ? audioFamimaRef.current
                    : audioLawsonRef.current;
              if (audio) {
                isAudioPlaying.current = true;
                audio.currentTime = 0;
                audio.play().catch(() => {
                  isAudioPlaying.current = false;
                });
              }
              break;
            }
          }
          for (const t of thresholds) {
            if (rawScore < t - 10) {
              playedThresholds.current.delete(t);
            }
          }
        } catch (err) {
          console.error("Detection error:", err);
        }
      }

      if (running) {
        animationRef.current = requestAnimationFrame(detect);
      }
    };

    detect();

    return () => {
      running = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLoading, transformBbox]);

  const scoreLevel =
    smoothScore >= 80
      ? "max"
      : smoothScore >= 50
        ? "high"
        : smoothScore >= 20
          ? "mid"
          : "low";

  const cartTotal = cart.reduce((s, i) => s + i.price, 0);
  const hasPerson = detections.some((d) => d.label === "person");

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-8">
        <div className="text-center text-white space-y-4">
          <div className="text-5xl">📷</div>
          <p className="text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-black rounded-full font-bold"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-black select-none"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* サウンド */}
      <audio
        ref={audioSevenRef}
        src={encodeURI("/セブン.mp3")}
        preload="auto"
        onEnded={() => (isAudioPlaying.current = false)}
      />
      <audio
        ref={audioLawsonRef}
        src="/download.mp3"
        preload="auto"
        onEnded={() => (isAudioPlaying.current = false)}
      />
      <audio
        ref={audioFamimaRef}
        src={encodeURI("/ファミリーマート.mp3")}
        preload="auto"
        onEnded={() => (isAudioPlaying.current = false)}
      />

      {/* Camera feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* コンビニ空間オーバーレイ */}
      <KonbiniOverlay smoothScore={smoothScore} />

      {/* ============================================================
          値札（ドラッグ可能）
          ============================================================ */}
      {detections.map((det) => {
        if (!det.konbiniItem) return null;
        const [x, y, w, h] = det.bbox;
        const categoryColor =
          CATEGORY_COLORS[det.konbiniItem.category] || "#333";

        return (
          <div
            key={det.id}
            className="absolute pointer-events-none"
            style={{ left: x, top: y, width: w, height: h }}
          >
            {/* Detection border */}
            <div
              className="absolute inset-0 rounded-sm"
              style={{
                border: `2px solid ${categoryColor}`,
                boxShadow: `0 0 8px ${categoryColor}44`,
              }}
            />

            {/* Price tag - ドラッグ可能 */}
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-auto touch-none"
              style={{ minWidth: 100 }}
              onTouchStart={(e) =>
                handleTouchStart(det.konbiniItem!, det.label, e)
              }
            >
              <div
                className="bg-white rounded shadow-lg overflow-hidden"
                style={{
                  boxShadow: hasPerson
                    ? `0 0 12px ${categoryColor}88, 0 2px 8px rgba(0,0,0,0.2)`
                    : undefined,
                }}
              >
                <div
                  className="h-1"
                  style={{ backgroundColor: categoryColor }}
                />
                <div className="px-2 py-1">
                  <div className="text-gray-800 text-xs font-bold truncate leading-tight">
                    {det.konbiniItem.jaName}
                  </div>
                  <div className="flex items-baseline justify-between gap-1">
                    <span
                      className="text-sm font-black"
                      style={{ color: categoryColor }}
                    >
                      {formatPrice(det.konbiniItem.price)}
                    </span>
                    <span className="text-gray-400 text-[8px]">
                      {det.konbiniItem.category}
                    </span>
                  </div>
                </div>
                {/* ドラッグヒント（人物がいるとき） */}
                {hasPerson && (
                  <div className="bg-green-500 text-white text-[7px] text-center py-0.5 font-bold">
                    👆 店員にドラッグして購入
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <div
                  className="w-2 h-2 rotate-45 -mt-1"
                  style={{ backgroundColor: "white" }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* ============================================================
          ドラッグ中のゴースト
          ============================================================ */}
      {drag && (
        <div
          className="fixed z-40 pointer-events-none"
          style={{
            left: drag.currentX,
            top: drag.currentY,
            transform: "translate(-50%, -50%) scale(1.1) rotate(-3deg)",
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-green-400 px-3 py-2">
            <div className="text-gray-800 text-xs font-bold">
              {drag.item.jaName}
            </div>
            <div className="text-green-600 text-sm font-black">
              {formatPrice(drag.item.price)}
            </div>
          </div>
          {/* ドロップターゲットヒント */}
          {hasPerson && (
            <div className="text-center mt-1">
              <span className="bg-green-500/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                店員にドロップ！
              </span>
            </div>
          )}
        </div>
      )}

      {/* ドラッグ中: 店員をハイライト */}
      {drag &&
        detections
          .filter((d) => d.label === "person")
          .map((det) => {
            const [px, py, pw, ph] = det.bbox;
            const isHovering = isOverPerson(
              drag.currentX,
              drag.currentY,
              [det]
            );
            return (
              <div
                key={`drop-${det.id}`}
                className="absolute pointer-events-none rounded-lg transition-all duration-150"
                style={{
                  left: px - 4,
                  top: py - 4,
                  width: pw + 8,
                  height: ph + 8,
                  border: isHovering
                    ? "3px solid #22c55e"
                    : "2px dashed rgba(34,197,94,0.5)",
                  backgroundColor: isHovering
                    ? "rgba(34,197,94,0.15)"
                    : "transparent",
                  boxShadow: isHovering
                    ? "0 0 20px rgba(34,197,94,0.3)"
                    : "none",
                }}
              />
            );
          })}

      {/* ============================================================
          カート追加フィードバック
          ============================================================ */}
      {addedFeedback && (
        <div
          className="fixed z-40 pointer-events-none"
          style={{
            left: addedFeedback.x,
            top: addedFeedback.y,
            transform: "translate(-50%, -50%)",
            animation: "cart-added 1s ease-out forwards",
          }}
        >
          <div className="bg-green-500 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
            ✓ {addedFeedback.name} をカゴに追加！
          </div>
        </div>
      )}

      {/* 人物にコンビニユニフォーム */}
      {detections
        .filter((d) => d.label === "person" && d.brand)
        .map((det) => (
          <KonbiniUniform
            key={`uniform-${det.id}`}
            brand={det.brand!}
            bbox={det.bbox}
          />
        ))}

      {/* Special detection messages (cat, dog) */}
      {detections
        .filter((d) => isSpecialDetection(d.label) && d.label !== "person")
        .map((det) => {
          const [x, y, w] = det.bbox;
          return (
            <div
              key={`special-${det.id}`}
              className="absolute pointer-events-none"
              style={{
                left: x + w / 2,
                top: y - 10,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="bg-yellow-400 text-black font-bold px-3 py-1 rounded-full text-sm shadow-lg whitespace-nowrap animate-bounce">
                {det.specialMessage}
              </div>
            </div>
          );
        })}

      {/* ============================================================
          カートパネル（アイテムがある場合）
          ============================================================ */}
      {cart.length > 0 && !showPayment && (
        <div className="absolute bottom-20 left-4 right-4 z-20">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🛒</span>
                <span className="text-sm font-bold text-gray-800">
                  カゴ ({cart.length}点)
                </span>
              </div>
              <span className="text-lg font-black text-gray-900">
                ¥{cartTotal.toLocaleString()}
              </span>
            </div>

            {/* アイテムリスト（コンパクト） */}
            <div className="flex flex-wrap gap-1 mb-2">
              {cart.map((item, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {item.name}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCart([])}
                className="flex-1 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-xl active:bg-gray-200"
              >
                クリア
              </button>
              <button
                onClick={() => setShowPayment(true)}
                className="flex-[2] py-2 text-sm font-bold text-white rounded-xl active:scale-[0.98] transition-transform"
                style={{
                  background:
                    "linear-gradient(135deg, #FF0033 0%, #CC0029 100%)",
                }}
              >
                お会計へ →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          コンビニ度メーター
          ============================================================ */}
      <div
        className="absolute left-4 right-4 pointer-events-none"
        style={{ bottom: cart.length > 0 && !showPayment ? 156 : 24 }}
      >
        <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white text-xs font-bold">コンビニ度</span>
            <span className="text-white text-xs">
              {totalDetected > 0 && (
                <span className="text-green-400 mr-2">
                  {totalDetected}個検出中
                </span>
              )}
              <span
                className="font-mono font-bold text-sm"
                style={{
                  color:
                    scoreLevel === "max"
                      ? "#FFD700"
                      : scoreLevel === "high"
                        ? "#00E676"
                        : scoreLevel === "mid"
                          ? "#FFC107"
                          : "#FFFFFF",
                }}
              >
                {Math.round(smoothScore)}%
              </span>
            </span>
          </div>

          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 relative"
              style={{
                width: `${smoothScore}%`,
                background:
                  scoreLevel === "max"
                    ? "linear-gradient(90deg, #FFD700, #FFA000)"
                    : scoreLevel === "high"
                      ? "linear-gradient(90deg, #00C853, #00E676)"
                      : scoreLevel === "mid"
                        ? "linear-gradient(90deg, #FF8F00, #FFC107)"
                        : "linear-gradient(90deg, #424242, #757575)",
              }}
            >
              {scoreLevel === "max" && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              )}
            </div>
          </div>

          <div className="mt-1 text-center">
            <span
              className="text-xs font-bold"
              style={{
                color:
                  scoreLevel === "max"
                    ? "#FFD700"
                    : scoreLevel === "high"
                      ? "#00E676"
                      : scoreLevel === "mid"
                        ? "#FFC107"
                        : "#999",
              }}
            >
              {scoreLevel === "max"
                ? "🏪 完全にコンビニです！"
                : scoreLevel === "high"
                  ? "🏪 かなりコンビニっぽい！"
                  : scoreLevel === "mid"
                    ? "コンビニ商品を発見！"
                    : totalDetected > 0
                      ? "コンビニっぽいものが..."
                      : "コンビニの商品を探してみよう"}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          PayPay決済モーダル
          ============================================================ */}
      {showPayment && (
        <PaymentModal
          cart={cart}
          onClose={() => setShowPayment(false)}
          onComplete={() => {
            setShowPayment(false);
            setCart([]);
          }}
        />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-4 z-50">
          <div className="text-6xl animate-bounce">🏪</div>
          <div className="text-white text-lg font-bold">{loadingStep}</div>
          <div className="w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full animate-loading-bar" />
          </div>
          <div className="text-gray-400 text-sm mt-2">
            初回読み込みには少し時間がかかります
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-loading-bar {
          animation: loading-bar 3s ease-in-out infinite;
        }
        @keyframes cart-added {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -120%) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
}
