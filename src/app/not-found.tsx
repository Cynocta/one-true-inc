import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
      <div>
        <p style={{ font: "800 clamp(64px, 14vw, 160px)/.9 var(--font-display)", margin: 0, color: "var(--red)" }}>KO</p>
        <p style={{ font: "700 20px/1.3 var(--font-display)", textTransform: "uppercase", letterSpacing: ".08em", margin: "12px 0 28px" }}>
          Esta página no aguantó el primer asalto.
        </p>
        <Link href="/" style={{ font: "700 15px/1 var(--font-display)", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--gold)" }}>
          Volver al ring
        </Link>
      </div>
    </main>
  );
}
