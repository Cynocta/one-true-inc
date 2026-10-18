import type { IgPost } from "@/components/home/InstagramFeed";

/**
 * Posts reales de @onetrue.inc guardados en /public/instagram (copiados del perfil público el 10 oct 2026).
 * Solo publicaciones PROPIAS de la cuenta: las colaboraciones de otras cuentas (peleadores, fotógrafos)
 * no se incluyen porque esas fotos son de ellos.
 * Se usan mientras no esté configurado NEXT_PUBLIC_INSTAGRAM_FEED_URL (feed automático de Behold).
 */
export const STATIC_IG_POSTS: IgPost[] = [
  { id: "DZ25u2ngUYe", permalink: "https://www.instagram.com/onetrue.inc/p/DZ25u2ngUYe/", image: "/instagram/post-DZ25u2ngUYe.jpg", isVideo: false, caption: "Publicación de @onetrue.inc · 21 de junio de 2026" },
  { id: "DZ0ygO0Ar3a", permalink: "https://www.instagram.com/onetrue.inc/p/DZ0ygO0Ar3a/", image: "/instagram/post-DZ0ygO0Ar3a.jpg", isVideo: false, caption: "Publicación de @onetrue.inc · 20 de junio de 2026" },
  { id: "DdComlfqs5g", permalink: "https://www.instagram.com/onetrue.inc/reel/DdComlfqs5g/", image: "/instagram/reel-DdComlfqs5g.jpg", isVideo: true, caption: "Reel de @onetrue.inc · 8 de septiembre de 2026" },
  { id: "Dc1ASI7xHea", permalink: "https://www.instagram.com/onetrue.inc/reel/Dc1ASI7xHea/", image: "/instagram/reel-Dc1ASI7xHea.jpg", isVideo: true, caption: "Reel de @onetrue.inc · 3 de septiembre de 2026" },
];
