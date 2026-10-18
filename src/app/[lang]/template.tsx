"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Transición entre páginas: cortina roja que se retira + fade del contenido.
 * Es CSS puro (clases en globals.css) para que la página nunca quede tapada
 * si el JavaScript tarda en cargar o falla. El template se vuelve a montar en
 * cada navegación, así que la animación se repite al cambiar de página.
 */
export default function Template({ children }: { children: ReactNode }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div aria-hidden className="page-curtain" />
      <div className="page-enter">{children}</div>
    </>
  );
}
