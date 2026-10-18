"use client";

/**
 * Últimos posts REALES de @onetrue.inc.
 *
 * Cómo se activa (lo hace alguien con acceso a la cuenta de Instagram de One True):
 *   1. Entrar a https://behold.so, conectar la cuenta de Instagram y crear un feed "JSON".
 *   2. Copiar la URL del feed y ponerla en .env.local:  NEXT_PUBLIC_INSTAGRAM_FEED_URL=https://feeds.behold.so/...
 *   3. Reiniciar el servidor (o volver a publicar el sitio).
 *
 * La URL de Behold es pública por diseño (no contiene llaves). NUNCA poner aquí un token de la API
 * de Instagram/Meta: eso iría en el servidor cuando exista el backend.
 * Sin URL, o si el feed falla, se muestran las imágenes de ejemplo (`fallback`).
 */
import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import s from "./home.module.css";

export interface IgPost {
  id: string;
  permalink: string;
  image: string;
  isVideo: boolean;
  caption: string;
}

const FEED_URL = process.env.NEXT_PUBLIC_INSTAGRAM_FEED_URL;

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Acepta el formato de Behold (posts[], camelCase) y el de la API de Instagram (data[], snake_case) */
export function normalizeFeed(json: unknown): IgPost[] {
  const list: Raw[] = Array.isArray(json) ? json : ((json as Raw)?.posts as Raw[]) ?? ((json as Raw)?.data as Raw[]) ?? [];
  return list
    .map((p) => {
      const type = str(p.mediaType ?? p.media_type).toUpperCase();
      const isVideo = type === "VIDEO";
      const sizes = p.sizes as Record<string, { mediaUrl?: string }> | undefined;
      const image = str(sizes?.medium?.mediaUrl) || (isVideo ? str(p.thumbnailUrl ?? p.thumbnail_url) : "") || str(p.mediaUrl ?? p.media_url);
      const permalink = str(p.permalink);
      return { id: str(p.id) || permalink, permalink, image, isVideo, caption: str(p.prunedCaption ?? p.caption) };
    })
    // solo links de instagram.com e imágenes https (no se aceptan URLs raras del feed)
    .filter((p) => p.image.startsWith("https://") && /^https:\/\/(www\.)?instagram\.com\//.test(p.permalink));
}

export function InstagramFeed({ fallback, staticPosts = [], count = 6 }: { fallback: ReactNode; staticPosts?: IgPost[]; count?: number }) {
  const [posts, setPosts] = useState<IgPost[] | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">(FEED_URL ? "loading" : "idle");

  useEffect(() => {
    if (!FEED_URL) return;
    const ctrl = new AbortController();
    fetch(FEED_URL, { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then((json) => {
        const list = normalizeFeed(json).slice(0, count);
        if (!list.length) throw new Error("empty");
        setPosts(list);
        setState("ok");
      })
      .catch((e) => { if (e.name !== "AbortError") setState("error"); });
    return () => ctrl.abort();
  }, [count]);

  // Sin feed automático (o si falla): posts guardados del perfil; si no hay, imágenes de ejemplo
  if (state === "idle" || state === "error") return staticPosts.length ? <PostGrid posts={staticPosts.slice(0, count)} /> : <>{fallback}</>;

  if (state === "loading" || !posts) {
    return (
      <div className={s.igGrid} aria-busy="true" aria-label="Cargando publicaciones de Instagram">
        {Array.from({ length: count }, (_, i) => <div key={i} className={`${s.igCell} ${s.igSkeleton}`} />)}
      </div>
    );
  }

  return <PostGrid posts={posts} />;
}

function PostGrid({ posts }: { posts: IgPost[] }) {
  return (
    <div className={`${s.igGrid} ${posts.length === 4 ? s.igGrid2 : ""}`}>
      {posts.map((p, i) => (
        <motion.a key={p.id} href={p.permalink} target="_blank" rel="noopener noreferrer" className={`${s.igCell} ${s.igPost}`}
          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06, duration: 0.4 }}
          aria-label={p.caption ? `Ver en Instagram: ${p.caption.slice(0, 80)}` : "Ver publicación en Instagram"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt={p.caption ? p.caption.slice(0, 120) : "Publicación de @onetrue.inc"} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
          {p.isVideo && <span className={s.igVideo} aria-hidden>▶</span>}
          <span className={s.igHover} aria-hidden>{p.caption ? p.caption.slice(0, 70) + (p.caption.length > 70 ? "…" : "") : "Ver en Instagram"}</span>
        </motion.a>
      ))}
    </div>
  );
}
