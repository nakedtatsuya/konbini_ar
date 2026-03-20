import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a1628 0%, #1a1a2e 50%, #0f3443 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 蛍光灯グロー */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            width: "80%",
            height: "60px",
            background: "linear-gradient(180deg, rgba(200,220,255,0.15) 0%, transparent 100%)",
            display: "flex",
          }}
        />

        {/* 左棚 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "80px",
            bottom: "80px",
            width: "80px",
            background: "linear-gradient(90deg, rgba(180,175,165,0.3) 0%, transparent 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            padding: "10px",
          }}
        >
          {[0,1,2,3,4].map((i) => (
            <div key={i} style={{ display: "flex", gap: "3px", alignItems: "flex-end" }}>
              {["#E8430B","#00A0E9","#008C44","#F58220"].map((c, j) => (
                <div key={j} style={{ width: "12px", height: `${20+j*8}px`, background: c, borderRadius: "2px", opacity: 0.6 }} />
              ))}
            </div>
          ))}
        </div>

        {/* 右棚 */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "80px",
            bottom: "80px",
            width: "80px",
            background: "linear-gradient(270deg, rgba(180,175,165,0.3) 0%, transparent 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            padding: "10px",
            alignItems: "flex-end",
          }}
        >
          {[0,1,2,3,4].map((i) => (
            <div key={i} style={{ display: "flex", gap: "3px", alignItems: "flex-end" }}>
              {["#1D2088","#E4007F","#F58220","#009944"].map((c, j) => (
                <div key={j} style={{ width: "12px", height: `${24+j*6}px`, background: c, borderRadius: "2px", opacity: 0.6 }} />
              ))}
            </div>
          ))}
        </div>

        {/* 3色ストライプ看板 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
            borderRadius: "16px",
            padding: "16px 40px",
            boxShadow: "0 0 40px rgba(232,67,11,0.3), 0 0 80px rgba(0,140,68,0.2)",
            marginBottom: "30px",
          }}
        >
          <div style={{ display: "flex", gap: "4px", marginBottom: "8px", width: "100%" }}>
            <div style={{ flex: 1, height: "8px", background: "#E8430B", borderRadius: "4px" }} />
            <div style={{ flex: 1, height: "8px", background: "#F58220", borderRadius: "4px" }} />
            <div style={{ flex: 1, height: "8px", background: "#008C44", borderRadius: "4px" }} />
          </div>
          <div style={{ fontSize: "48px", fontWeight: 900, color: "#333", letterSpacing: "4px" }}>
            コンビニAR
          </div>
          <div style={{ fontSize: "16px", color: "#888", letterSpacing: "6px", marginTop: "4px" }}>
            24H OPEN
          </div>
          <div style={{ display: "flex", gap: "4px", marginTop: "8px", width: "100%" }}>
            <div style={{ flex: 1, height: "8px", background: "#E8430B", borderRadius: "4px" }} />
            <div style={{ flex: 1, height: "8px", background: "#F58220", borderRadius: "4px" }} />
            <div style={{ flex: 1, height: "8px", background: "#008C44", borderRadius: "4px" }} />
          </div>
        </div>

        {/* サブタイトル */}
        <div
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            marginBottom: "20px",
            fontWeight: 600,
          }}
        >
          カメラをかざすと、目の前がコンビニになる
        </div>

        {/* 技術タグ */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {["TensorFlow.js", "COCO-SSD", "Next.js", "SVG AR", "PayPay決済"].map((tag) => (
            <div
              key={tag}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "20px",
                padding: "6px 16px",
                fontSize: "14px",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* レジ風の下部バー */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50px",
            background: "linear-gradient(0deg, rgba(80,75,68,0.5) 0%, transparent 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <div style={{ color: "rgba(0,255,100,0.5)", fontSize: "12px", fontFamily: "monospace" }}>
            TOTAL: ¥---
          </div>
          <div style={{ background: "#FF0033", borderRadius: "6px", padding: "4px 12px", color: "white", fontSize: "12px", fontWeight: 700 }}>
            PayPay
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
