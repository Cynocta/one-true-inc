import type { ReactNode } from "react";

export const metadata = { title: "One True" };

export default function RootRedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: "#0a0a0b" }}>{children}</body>
    </html>
  );
}
