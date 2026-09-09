import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f97316",
        }}
      >
        <div
          style={{
            width: 78,
            height: 128,
            borderRadius: 39,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <div style={{ width: 19, height: 26, borderRadius: "50%", background: "#f97316" }} />
          <div style={{ width: 19, height: 26, borderRadius: "50%", background: "#f97316" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
