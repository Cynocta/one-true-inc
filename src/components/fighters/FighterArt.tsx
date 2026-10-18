/**
 * Ilustración placeholder de un peleador (busto en guardia).
 * Se arma con los rasgos de `fighter.look`. Cuando el peleador tenga `photo`,
 * se muestra la foto real en su lugar — no hay que tocar ningún otro componente.
 */
import { useId } from "react";
import type { Fighter } from "@/types";
import styles from "./FighterArt.module.css";

const SKINS = [
  ["#f3cfae", "#e2b08a", "#b9825e"],
  ["#e8b991", "#d09a6c", "#a06a43"],
  ["#d6a072", "#bb8053", "#8a5634"],
  ["#b47e52", "#98633c", "#6a4026"],
  ["#8f5c39", "#764727", "#4d2b16"],
  ["#6c432a", "#57341f", "#351d10"],
] as const;

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => {
    const c = (n >> s) & 255;
    return Math.max(0, Math.min(255, Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt))));
  };
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
}

const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 160;
};

interface Props {
  fighter: Fighter;
  corner?: "red" | "blue" | "none";
  flip?: boolean;
  className?: string;
  priority?: boolean;
}

export function FighterArt({ fighter, corner = "none", flip = false, className = "" }: Props) {
  const uid = useId().replace(/:/g, "");
  const cls = `${styles.art} ${styles[corner]} ${flip ? styles.flipped : ""} ${className}`;

  if (fighter.photo) {
    // Las URLs de Unsplash aceptan parámetros de tamaño; las fotos locales se usan tal cual.
    const src = fighter.photo.includes("images.unsplash.com") ? `${fighter.photo}?w=900&q=75&auto=format&fit=crop&crop=faces` : fighter.photo;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${fighter.first} ${fighter.last}`}
        className={`${styles.photo} ${styles[`photo_${corner}`] ?? ""} ${flip ? styles.flip : ""} ${className}`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  const { skin, hair, hairColor = "#16100c", beard, trunks, gloves = trunks } = fighter.look;
  const [sL, sB, sD] = SKINS[skin];
  const women = fighter.division === "flyw";
  const glove = gloves === "#ffffff" ? "#e9e9ec" : gloves;
  const trim = isLight(trunks) ? "#0d0d0f" : "#ffffff";
  const id = (n: string) => `${n}-${uid}`;
  const u = (n: string) => `url(#${id(n)})`;

  const arm = (
    <g>
      {/* brazo */}
      <path fill={u("skinV")} d="M70 262c-20 40-21 100 2 142 16 18 46 12 56-8 5-44 2-94-8-134z" />
      {/* antebrazo */}
      <path fill={u("skin")} d="M82 402c12-48 30-100 44-142l46 4c-14 48-30 98-46 140-12 18-38 16-44-2z" />
      <path fill="none" stroke={sD} strokeOpacity=".45" strokeWidth="3" d="M122 300c-8 30-18 62-26 92" />
      {/* puño / venda */}
      <rect x="120" y="244" width="58" height="30" rx="8" transform="rotate(14 149 259)" fill={shade(glove, -0.35)} />
      <rect x="122" y="252" width="54" height="7" rx="3" transform="rotate(14 149 259)" fill={trim} opacity=".85" />
      {/* guante */}
      <ellipse cx="150" cy="200" rx="44" ry="52" transform="rotate(-10 150 200)" fill={u("glove")} />
      <ellipse cx="184" cy="222" rx="15" ry="24" transform="rotate(-22 184 222)" fill={shade(glove, -0.12)} />
      <path d="M118 214c10 20 34 30 56 24" stroke={shade(glove, -0.45)} strokeWidth="3" fill="none" opacity=".6" />
      <ellipse cx="134" cy="176" rx="12" ry="20" transform="rotate(-20 134 176)" fill="#fff" opacity=".28" />
    </g>
  );

  return (
    <svg className={cls} viewBox="0 0 400 500" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`${fighter.first} ${fighter.last}`}>
      <defs>
        <linearGradient id={id("skin")} x1="0" x2="1" y1="0" y2="0">
          <stop offset=".1" stopColor={sL} />
          <stop offset=".55" stopColor={sB} />
          <stop offset="1" stopColor={sD} />
        </linearGradient>
        <linearGradient id={id("skinV")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={sL} />
          <stop offset="1" stopColor={sD} />
        </linearGradient>
        <radialGradient id={id("torso")} cx=".42" cy=".25" r=".8">
          <stop offset="0" stopColor={sL} />
          <stop offset=".55" stopColor={sB} />
          <stop offset="1" stopColor={sD} />
        </radialGradient>
        <radialGradient id={id("glove")} cx=".35" cy=".3" r=".75">
          <stop offset="0" stopColor={shade(glove, 0.25)} />
          <stop offset=".6" stopColor={glove} />
          <stop offset="1" stopColor={shade(glove, -0.45)} />
        </radialGradient>
        <linearGradient id={id("fade")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".55" />
        </linearGradient>
      </defs>

      <g transform={flip ? "translate(400 0) scale(-1 1)" : undefined}>
      {/* pelo detrás */}
      {hair === "ponytail" && <path fill={hairColor} d="M236 90c34 8 40 62 24 104-6 14-16 10-14-2 8-34 4-70-18-88z" />}
      {hair === "braids" && (
        <g fill={hairColor}>
          <path d="M160 110c-14 30-12 80-2 110 4 10 14 8 14-2-4-30-6-70 2-104z" />
          <path d="M240 110c14 30 12 80 2 110-4 10-14 8-14-2 4-30 6-70-2-104z" />
        </g>
      )}
      {hair === "bun" && <circle cx="200" cy="60" r="22" fill={hairColor} />}

      {/* torso */}
      <path fill={u("torso")} d="M120 220c30-18 56-14 80-14s50-4 80 14c40 12 64 30 72 70l8 210H40l8-210c8-40 32-58 72-70z" />
      <g fill="none" stroke={sD} strokeLinecap="round" opacity=".4" strokeWidth="3">
        <path d="M128 332c24 18 52 18 70 4M272 332c-24 18-52 18-70 4" />
        <path d="M200 344v110M178 392c8 4 16 4 22 2M222 392c-8 4-16 4-22 2M180 428c8 3 14 3 20 1M220 428c-8 3-14 3-20 1" />
      </g>
      {women && (
        <g>
          <path fill={trunks} d="M92 298c40-16 76-10 108 0 32-10 68-16 108 0l4 72c-44 16-180 16-224 0z" />
          <path stroke={trunks} strokeWidth="14" strokeLinecap="round" d="M146 300l18-74M254 300l-18-74" />
          <path fill={trim} opacity=".85" d="M90 360c44 14 176 14 220 0v8c-44 16-176 16-220 0z" />
        </g>
      )}

      {/* pantaloneta */}
      <rect x="36" y="452" width="328" height="48" fill={trunks} />
      <rect x="36" y="452" width="328" height="9" fill={trim} opacity=".9" />

      {/* cuello */}
      <path fill={u("skin")} d="M174 156h52l12 64c-24 14-52 14-76 0z" />
      <ellipse cx="200" cy="180" rx="28" ry="12" fill={sD} opacity=".55" />

      {/* cabeza */}
      <ellipse cx="153" cy="126" rx="9" ry="14" fill={sB} />
      <ellipse cx="247" cy="126" rx="9" ry="14" fill={sD} />
      <ellipse cx="200" cy="118" rx="47" ry="58" fill={u("skin")} />
      <ellipse cx="200" cy="124" rx="36" ry="9" fill={sD} opacity=".5" />
      <path d="M176 113l18 3M224 113l-18 3" stroke={hairColor} strokeWidth="5" strokeLinecap="round" />
      <path d="M201 124l-5 22c3 4 8 4 12 1" fill="none" stroke={sD} strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
      <path d="M188 158c8 3 16 3 24 0" fill="none" stroke={sD} strokeWidth="3" strokeLinecap="round" opacity=".75" />

      {/* pelo */}
      {(hair === "buzz" || hair === "ponytail" || hair === "braids" || hair === "bun") && (
        <path fill={hairColor} opacity={hair === "buzz" ? 0.88 : 1} d="M152 112c-4-40 20-62 48-62s52 22 48 62c-8-20-26-30-48-30s-40 10-48 30z" />
      )}
      {hair === "short" && <path fill={hairColor} d="M150 116c-8-46 18-72 50-72 34 0 60 24 50 72-6-24-22-38-36-40-12 8-40 10-52 2-6 10-10 24-12 38z" />}
      {hair === "mohawk" && (
        <g fill={hairColor}>
          <path d="M184 64c2-26 30-30 32 0l-2 26h-28z" />
          <path opacity=".35" d="M152 112c-4-40 20-62 48-62s52 22 48 62c-8-20-26-30-48-30s-40 10-48 30z" />
        </g>
      )}
      {hair === "curly" && (
        <g fill={hairColor}>
          {[[160, 92], [172, 72], [190, 62], [210, 62], [228, 72], [240, 92], [200, 76], [180, 84], [220, 84]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={i < 6 ? 18 : 16} />
          ))}
        </g>
      )}
      {hair === "bald" && <ellipse cx="184" cy="82" rx="14" ry="8" fill="#fff" opacity=".18" transform="rotate(-20 184 82)" />}
      {beard && <path fill={hairColor} opacity=".85" d="M156 136c2 34 22 54 44 54s42-20 44-54c-8 22-24 32-44 32s-36-10-44-32z" />}

      {/* brazos en guardia */}
      {arm}
      <g transform="translate(400 0) scale(-1 1)">{arm}</g>

      </g>
      <text x="200" y="490" textAnchor="middle" fontSize="20" fontWeight="800" fontStyle="italic" fill={trim} opacity=".9" style={{ fontFamily: "var(--font-display)", letterSpacing: "1px" }}>
        ONE TRUE
      </text>
      <rect x="0" y="380" width="400" height="120" fill={u("fade")} />
    </svg>
  );
}
