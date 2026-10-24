import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { LOGO_MARK_PATHS } from "@/components/Logo";

/** Tarjeta que se ve al compartir el enlace (WhatsApp, Instagram, X). Se genera en el build. */
export const dynamic = "force-static";
export const alt = "One True. El ring se está armando. Próximamente.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const dir = join(process.cwd(), "src/app/og");
  const [font, bg] = await Promise.all([readFile(join(dir, "BarlowCondensed-ExtraBold.ttf")), readFile(join(dir, "fondo.jpg"))]);
  const bgSrc = `data:image/jpeg;base64,${bg.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0a0a0b", fontFamily: "Barlow Condensed" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bgSrc} width={1200} height={630} alt="" style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(90deg, rgba(10,10,11,.96) 0%, rgba(10,10,11,.75) 45%, rgba(10,10,11,.05) 80%)" }} />
        {/* Cuerdas del ring */}
        {[548, 582, 616].map((y, i) => (
          <div key={y} style={{ position: "absolute", left: -10, right: -10, top: y, height: 9, background: i === 1 ? "#ece9e4" : "#ff2a35", boxShadow: "0 6px 10px rgba(0,0,0,.5)" }} />
        ))}
        <div style={{ position: "absolute", left: 72, top: 64, display: "flex", flexDirection: "column" }}>
          <svg width="44" height="90" viewBox="180 185 340 690" fill="#ffffff">
            {LOGO_MARK_PATHS.map((d) => <path key={d} d={d} />)}
          </svg>
          <div style={{ marginTop: 28, display: "flex", fontSize: 26, letterSpacing: 7, color: "#e3b341", border: "3px solid #e3b341", padding: "8px 16px 6px", alignSelf: "flex-start" }}>
            PRÓXIMAMENTE
          </div>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", fontSize: 112, lineHeight: 0.84, color: "#fff", textTransform: "uppercase" }}>
            <span>El ring</span>
            <span>se está</span>
            <span style={{ color: "#ff2a35" }}>armando</span>
          </div>
        </div>
        <div style={{ position: "absolute", right: 56, bottom: 40, display: "flex", fontSize: 30, letterSpacing: 6, color: "#fff" }}>ONE TRUE</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Barlow Condensed", data: font, weight: 800, style: "normal" }] },
  );
}
