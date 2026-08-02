import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon da aba — BrandMark Contribly ({ · }). */
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
          background: "#eef3f8",
          borderRadius: 6,
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 6c-2.8 0-4.5 1.7-4.5 4.2v3.2c0 1.4-.7 2.3-2.2 2.6 1.5.3 2.2 1.2 2.2 2.6v3.2c0 2.5 1.7 4.2 4.5 4.2"
            stroke="#0969da"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 6c2.8 0 4.5 1.7 4.5 4.2v3.2c0 1.4.7 2.3 2.2 2.6-1.5.3-2.2 1.2-2.2 2.6v3.2c0 2.5-1.7 4.2-4.5 4.2"
            stroke="#0969da"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.2 16a3.2 3.2 0 0 1 2.8-1.6c1.2 0 2.2.7 2.8 1.6"
            stroke="#0969da"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M13.2 16a3.2 3.2 0 0 0 2.8 1.6c1.2 0 2.2-.7 2.8-1.6"
            stroke="#0969da"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
