import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Alex Morgan builds useful AI products.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const font = await readFile(
    join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf"),
  );

  return new ImageResponse(
    <div style={{
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      width: "100%", height: "100%", padding: "72px", background: "#f7f6f3",
      color: "#1e1d1b", fontFamily: "Geist", fontWeight: 700,
    }}>
      <div style={{ display: "flex", fontSize: 28 }}>Alex Morgan</div>
      <div style={{ display: "flex", fontSize: 80, lineHeight: 1.08, letterSpacing: "-2px", maxWidth: 950 }}>
        Builds useful AI products.
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "#64615b" }}>
        Full-stack engineer · Projects, experience & technical stack
      </div>
    </div>,
    { ...size, fonts: [{ name: "Geist", data: font, weight: 700, style: "normal" }] },
  );
}
