import { ImageResponse } from "next/og";

export const alt = "Draidly — l'assistant IA pour PME";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded social-share card generated at the edge. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #6d5cf0 0%, #a855f7 55%, #4f46e5 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: 700,
            }}
          >
            D
          </div>
          <div style={{ fontSize: "52px", fontWeight: 700 }}>Draidly</div>
        </div>

        <div
          style={{
            marginTop: "48px",
            fontSize: "68px",
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: "900px",
          }}
        >
          L&apos;assistant IA pour PME
        </div>

        <div
          style={{
            marginTop: "28px",
            fontSize: "34px",
            opacity: 0.92,
            maxWidth: "920px",
          }}
        >
          Résume vos emails, prépare vos réponses, crée vos tâches et retrouve
          vos informations.
        </div>
      </div>
    ),
    { ...size },
  );
}
