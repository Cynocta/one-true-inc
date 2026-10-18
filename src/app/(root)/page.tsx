"use client";

import { useEffect } from "react";

/** "/" → redirige a /es/ o /en/ según preferencia guardada o idioma del navegador */
export default function RootPage() {
  useEffect(() => {
    let lang = "es";
    try {
      const saved = localStorage.getItem("ot-lang");
      if (saved === "es" || saved === "en") lang = saved;
      else if (navigator.language.toLowerCase().startsWith("en")) lang = "en";
    } catch {}
    window.location.replace(`/${lang}/`);
  }, []);

  return (
    <noscript>
      <meta httpEquiv="refresh" content="0; url=/es/" />
    </noscript>
  );
}
