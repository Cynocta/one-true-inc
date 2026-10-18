import type { NextConfig } from "next";

// Exportación estática: `npm run build` genera la carpeta /out lista para subir a cualquier hosting.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
