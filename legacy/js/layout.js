/* ==========================================================================
   ONE TRUE INC — Layout compartido (header, footer, búsqueda) + utilidades
   ========================================================================== */

/* ---------- Utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const param = (k) => new URLSearchParams(location.search).get(k);

const fighter = (id) => FIGHTERS.find((f) => f.id === id);
const event = (id) => EVENTS.find((e) => e.id === id);
const fullName = (f) => `${f.first} ${f.last}`;
const record = (f) => `${f.w}-${f.l}-${f.d}`;
const divName = (k) => tx(DIVISIONS[k]);
const isWomen = (f) => f.div === "flyw";
const upcomingEvents = () => EVENTS.filter((e) => e.status === "upcoming").sort((a, b) => new Date(a.date) - new Date(b.date));
const pastEvents = () => EVENTS.filter((e) => e.status === "past").sort((a, b) => new Date(b.date) - new Date(a.date));
const nextEvent = () => upcomingEvents()[0];

function fmtDate(iso, opts = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) {
  return new Date(iso).toLocaleDateString(LANG === "en" ? "en-US" : "es-CO", opts).replace(/\./g, "");
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString(LANG === "en" ? "en-US" : "es-CO", { hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" }) + " COT";
}
function fmtMoney(n) {
  return "$" + n.toLocaleString("es-CO") + " COP";
}

/* Silueta genérica de boxeador (placeholder de foto). side = "l" | "r" voltea la imagen */
function silhouette(side = "l", tone = "") {
  return `<svg class="sil ${side === "r" ? "flip" : ""} ${tone}" viewBox="0 0 200 260" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    <defs><linearGradient id="silg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".95"/><stop offset="1" stop-color="currentColor" stop-opacity=".55"/></linearGradient></defs>
    <path fill="url(#silg)" d="M100 22c19 0 32 15 32 35 0 15-7 27-17 33l1 10c22 4 40 14 48 34l10 30c6 18 9 38 9 96H17c0-58 3-78 9-96l10-30c8-20 26-30 48-34l1-10C75 84 68 72 68 57c0-20 13-35 32-35z"/>  </svg>`;
}

/* Placeholder de imagen con etiqueta de tamaño sugerido */
function ph(label = "IMG", cls = "") {
  return `<div class="ph ${cls}"><span class="ph-label">${esc(label)}</span></div>`;
}

/* Logo provisional en HTML/CSS (reemplazar por assets/logo.svg cuando exista el oficial) */
function logo(cls = "") {
  return `<span class="logo ${cls}" aria-label="One True"><span class="logo-mark"></span><span class="logo-word"><span>one</span><span>true<sup>®</sup></span></span></span>`;
}

function brandBadge(brand) {
  return brand === "trueknuckles"
    ? `<span class="brand-badge tk">True<b>Knuckles</b></span>`
    : `<span class="brand-badge tb">True<b>Boxing</b></span>`;
}

/* ---------- Header ---------- */
const NAV_LEFT = [
  { href: "eventos.html", key: "nav.events", page: "events" },
  { href: "rankings.html", key: "nav.rankings", page: "rankings" },
  { href: "peleadores.html", key: "nav.fighters", page: "fighters" },
  { href: "noticias.html", key: "nav.news", page: "news" },
];
const NAV_RIGHT = [
  { href: "boletas.html", key: "nav.tickets", page: "tickets" },
  { href: "contacto.html", key: "nav.contact", page: "contact" },
];

function renderHeader() {
  const page = document.body.dataset.page;
  const link = (n) => `<a href="${n.href}" class="${n.page === page ? "active" : ""}">${t(n.key)}</a>`;
  const ICON_IG = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM21.9 7.3c-.1-1.7-.4-3.2-1.7-4.5S17.4 1.2 15.7 1.1C14 1 10 1 8.3 1.1 6.6 1.2 5.1 1.5 3.8 2.8S2.2 5.6 2.1 7.3C2 9 2 15 2.1 16.7c.1 1.7.4 3.2 1.7 4.5s2.8 1.6 4.5 1.7c1.7.1 5.7.1 7.4 0 1.7-.1 3.2-.4 4.5-1.7s1.6-2.8 1.7-4.5c.1-1.7.1-7.7 0-9.4zM19.8 18.5a3.3 3.3 0 0 1-1.8 1.8c-1.3.5-4.3.4-5.7.4s-4.4.1-5.7-.4a3.3 3.3 0 0 1-1.8-1.8c-.5-1.3-.4-4.3-.4-5.7s-.1-4.4.4-5.7a3.3 3.3 0 0 1 1.8-1.8C7.9 4.8 10.9 4.9 12.3 4.9s4.4-.1 5.7.4a3.3 3.3 0 0 1 1.8 1.8c.5 1.3.4 4.3.4 5.7s.1 4.4-.4 5.7z"/></svg>`;

  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="ph-strip">${t("ph.note")}</div>
    <div class="hdr">
      <button class="hdr-burger" aria-label="${t("nav.menu")}" aria-expanded="false"><span></span><span></span><span></span></button>
      <nav class="hdr-nav hdr-left">${NAV_LEFT.map(link).join("")}</nav>
      <a href="index.html" class="hdr-logo">${logo()}</a>
      <nav class="hdr-nav hdr-right">
        ${NAV_RIGHT.map(link).join("")}
        <a href="${SOCIAL.instagram}" target="_blank" rel="noopener" class="hdr-icon" aria-label="Instagram">${ICON_IG}</a>
        <div class="lang-switch" role="group" aria-label="${t("foot.lang")}">
          <button data-lang="es" class="${LANG === "es" ? "on" : ""}">ES</button><button data-lang="en" class="${LANG === "en" ? "on" : ""}">EN</button>
        </div>
        <button class="hdr-icon hdr-search" aria-label="${t("nav.search")}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" d="M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15zM16 16l5 5"/></svg></button>
      </nav>
    </div>
    <div class="drawer" hidden>
      <nav>${[{ href: "index.html", key: "nav.home", page: "home" }, ...NAV_LEFT, ...NAV_RIGHT].map(link).join("")}</nav>
      <div class="drawer-foot">
        <div class="lang-switch"><button data-lang="es" class="${LANG === "es" ? "on" : ""}">ES</button><button data-lang="en" class="${LANG === "en" ? "on" : ""}">EN</button></div>
        <a href="${SOCIAL.instagram}" target="_blank" rel="noopener">@onetrue.inc</a>
      </div>
    </div>`;
  document.body.prepend(header);

  $$("[data-lang]", header).forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  const burger = $(".hdr-burger", header), drawer = $(".drawer", header);
  burger.addEventListener("click", () => {
    const open = drawer.hidden;
    drawer.hidden = !open;
    burger.setAttribute("aria-expanded", open);
    burger.classList.toggle("open", open);
    document.body.classList.toggle("no-scroll", open);
  });

  $(".hdr-search", header).addEventListener("click", openSearch);
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Búsqueda ---------- */
function openSearch() {
  let ov = $(".search-ov");
  if (!ov) {
    ov = document.createElement("div");
    ov.className = "search-ov";
    ov.innerHTML = `
      <div class="search-box">
        <div class="search-row">
          <input type="search" data-i18n-ph="search.placeholder" autocomplete="off">
          <button class="search-close" aria-label="Cerrar">✕</button>
        </div>
        <div class="search-results"></div>
      </div>`;
    document.body.appendChild(ov);
    applyI18n(ov);
    const input = $("input", ov), res = $(".search-results", ov);
    const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    input.addEventListener("input", () => {
      const q = norm(input.value.trim());
      if (!q) { res.innerHTML = ""; return; }
      const fs = FIGHTERS.filter((f) => norm(`${fullName(f)} ${f.nick}`).includes(q)).slice(0, 6);
      const es = EVENTS.filter((e) => norm(e.name + " " + e.venue).includes(q)).slice(0, 4);
      const ns = NEWS.filter((n) => norm(tx(n.title)).includes(q)).slice(0, 4);
      const group = (title, items) => items.length ? `<h4>${title}</h4>${items.join("")}` : "";
      res.innerHTML =
        group(t("search.fighters"), fs.map((f) => `<a href="peleador.html?id=${f.id}"><b>${esc(fullName(f))}</b> <span>"${esc(f.nick)}" · ${divName(f.div)}</span></a>`)) +
        group(t("search.events"), es.map((e) => `<a href="evento.html?id=${e.id}"><b>${esc(e.name)}</b> <span>${fmtDate(e.date)}</span></a>`)) +
        group(t("search.news"), ns.map((n) => `<a href="noticia.html?id=${n.id}"><b>${esc(tx(n.title))}</b></a>`)) ||
        `<p class="search-empty">${t("search.empty")}</p>`;
    });
    const close = () => ov.classList.remove("open");
    $(".search-close", ov).addEventListener("click", close);
    ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }
  ov.classList.add("open");
  setTimeout(() => $("input", ov).focus(), 50);
}

/* ---------- Footer ---------- */
function renderFooter() {
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="wrap foot-grid">
      <div class="foot-brand">
        <a href="index.html">${logo("logo-lg")}</a>
        <p>${t("foot.tagline")}</p>
        <div class="foot-brands">${brandBadge("trueboxing")}${brandBadge("trueknuckles")}</div>
      </div>
      <div>
        <h5>${t("foot.explore")}</h5>
        ${[...NAV_LEFT, ...NAV_RIGHT].map((n) => `<a href="${n.href}">${t(n.key)}</a>`).join("")}
      </div>
      <div>
        <h5>${t("foot.company")}</h5>
        <a href="contacto.html">${t("foot.about")}</a>
        <a href="contacto.html">${t("nav.contact")}</a>
        <a href="#">${t("foot.terms")}</a>
        <a href="#">${t("foot.privacy")}</a>
      </div>
      <div>
        <h5>${t("foot.follow")}</h5>
        <a href="${SOCIAL.instagram}" target="_blank" rel="noopener">Instagram</a>
        <a href="${SOCIAL.threads}" target="_blank" rel="noopener">Threads</a>
        <a href="${SOCIAL.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
        <h5 class="mt">${t("foot.lang")}</h5>
        <div class="lang-switch"><button data-lang="es" class="${LANG === "es" ? "on" : ""}">Español</button><button data-lang="en" class="${LANG === "en" ? "on" : ""}">English</button></div>
      </div>
    </div>
    <div class="foot-bottom"><div class="wrap">© ${new Date().getFullYear()} One True Inc. ${t("foot.rights")}</div></div>`;
  document.body.appendChild(footer);
  $$("[data-lang]", footer).forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
}

/* ---------- Cuenta regresiva ---------- */
function mountCountdown(el, iso) {
  if (!el) return;
  el.innerHTML = ["days", "hours", "min", "sec"].map((k) => `<div class="cd-cell"><b data-k="${k}">00</b><span>${t("cd." + k)}</span></div>`).join("");
  const target = new Date(iso).getTime();
  const tick = () => {
    let d = Math.max(0, target - Date.now()) / 1000;
    const v = { days: Math.floor(d / 86400), hours: Math.floor((d % 86400) / 3600), min: Math.floor((d % 3600) / 60), sec: Math.floor(d % 60) };
    for (const k in v) $(`[data-k="${k}"]`, el).textContent = String(v[k]).padStart(2, "0");
  };
  tick();
  setInterval(tick, 1000);
}

/* ---------- Carruseles horizontales ---------- */
function mountCarousels() {
  $$("[data-carousel]").forEach((wrap) => {
    const track = $(".car-track", wrap);
    $$(".car-btn", wrap).forEach((b) => b.addEventListener("click", () => {
      track.scrollBy({ left: (b.dataset.dir === "next" ? 1 : -1) * track.clientWidth * 0.8, behavior: "smooth" });
    }));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  applyI18n();
  if (typeof renderPage === "function") renderPage();
  mountCarousels();
  const TITLES = { home: "nav.home", events: "nav.events", fighters: "nav.fighters", rankings: "nav.rankings", news: "nav.news", tickets: "nav.tickets", contact: "nav.contact" };
  const tk = TITLES[document.body.dataset.page];
  if (tk) document.title = `${t(tk)} | One True`;
});
