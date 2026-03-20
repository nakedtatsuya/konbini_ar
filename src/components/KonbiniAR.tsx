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

export default function KonbiniAR() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<any>(null);
  const animationRef = useRef<number>(0);
  const lastDetectionTime = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedThresholds = useRef<Set<number>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState("カメラを起動中...");
  const [detections, setDetections] = useState<Detection[]>([]);
  const [konbiniScore, setKonbiniScore] = useState(0);
  const [smoothScore, setSmoothScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [totalDetected, setTotalDetected] = useState(0);

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

  // Initialize camera and model
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // Camera
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

        // 色解析用キャンバス
        if (!canvasRef.current) {
          canvasRef.current = document.createElement("canvas");
        }

        setLoadingStep("AIモデルを読み込み中...");

        // TensorFlow.js + COCO-SSD
        const [tf, cocoSsd] = await Promise.all([
          import("@tensorflow/tfjs"),
          import("@tensorflow-models/coco-ssd"),
        ]);

        await tf.ready();

        if (cancelled) return;

        setLoadingStep("物体認識モデルを準備中...");

        const model = await cocoSsd.load({
          base: "lite_mobilenet_v2",
        });

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

  // Detection loop
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

              // 人物検出時に服の色からブランド判定
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

          // Update scores
          const rawScore = calculateKonbiniScore(
            newDetections.map((d) => ({ label: d.label, score: d.score }))
          );
          setKonbiniScore(rawScore);
          setTotalDetected(
            newDetections.filter((d) => isKonbiniItem(d.label)).length
          );

          // スコアが閾値を超えたらサウンド再生
          const thresholds = [20, 50, 80];
          for (const t of thresholds) {
            if (rawScore >= t && !playedThresholds.current.has(t)) {
              playedThresholds.current.add(t);
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => {});
              }
            }
          }
          // スコアが下がったら閾値をリセット（再度鳴らせるように）
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
    <div className="fixed inset-0 overflow-hidden bg-black select-none">
      {/* サウンド */}
      <audio ref={audioRef} src="/download.mp3" preload="auto" />

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

      {/* Detection overlays - Price tags */}
      {detections.map((det) => {
        if (!det.konbiniItem) return null;
        const [x, y, w, h] = det.bbox;
        const categoryColor =
          CATEGORY_COLORS[det.konbiniItem.category] || "#333";

        return (
          <div
            key={det.id}
            className="absolute pointer-events-none"
            style={{
              left: x,
              top: y,
              width: w,
              height: h,
            }}
          >
            {/* Detection border */}
            <div
              className="absolute inset-0 rounded-sm"
              style={{
                border: `2px solid ${categoryColor}`,
                boxShadow: `0 0 8px ${categoryColor}44`,
              }}
            />

            {/* Price tag */}
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full"
              style={{ minWidth: 100 }}
            >
              <div className="bg-white rounded shadow-lg overflow-hidden">
                {/* Category stripe */}
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
              </div>
              {/* Tag pointer */}
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

      {/* Konbini score meter */}
      <div className="absolute bottom-6 left-4 right-4 pointer-events-none">
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

          {/* Progress bar */}
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

          {/* Status label */}
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
      `}</style>
    </div>
  );
}
