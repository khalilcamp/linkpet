import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 14,
            height: 23,
            borderRadius: 7,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
          }}
        >
          <div style={{ width: 3.4, height: 4.6, borderRadius: "50%", background: "#f97316" }} />
          <div style={{ width: 3.4, height: 4.6, borderRadius: "50%", background: "#f97316" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
