/* ==========================================================================
   ONE TRUE INC — Componentes reutilizables (devuelven HTML)
   ========================================================================== */

function newsCard(n, cls = "") {
  return `<a class="card news-card ${cls}" href="noticia.html?id=${n.id}">
    <div class="card-media">${ph("1280×720", "ph-news")}${silhouette(n.id.length % 2 ? "l" : "r", "sil-card")}</div>
    <div class="card-body">
      <div class="card-tag"><span class="tag-icon"></span>${esc(n.cat)}</div>
      <h3>${esc(tx(n.title))}</h3>
    </div>
  </a>`;
}

function newsRow(n) {
  return `<a class="news-row" href="noticia.html?id=${n.id}">
    <div class="news-row-media">${ph("800×450")}${silhouette("l", "sil-card")}</div>
    <div class="news-row-body">
      <div class="card-tag"><span class="tag-icon"></span>${esc(n.cat)} · ${fmtDate(n.date, { day: "numeric", month: "short" })}</div>
      <h3>${esc(tx(n.title))}</h3>
      <p>${esc(tx(n.excerpt))}</p>
    </div>
  </a>`;
}

function fighterCard(f) {
  const champ = f.rank === 0;
  return `<a class="fighter-card" href="peleador.html?id=${f.id}" data-div="${f.div}">
    <div class="fc-media">
      ${champ ? `<span class="belt">${isWomen(f) ? t("f.championF") : t("f.champion")}</span>` : `<span class="fc-rank">#${f.rank}</span>`}
      ${silhouette("l", "sil-fighter")}
    </div>
    <div class="fc-body">
      <span class="fc-nick">"${esc(f.nick)}"</span>
      <h3>${esc(fullName(f))}</h3>
      <span class="fc-div">${divName(f.div)}</span>
      <span class="fc-rec">${record(f)} <small>${t("f.wld")}</small></span>
    </div>
  </a>`;
}

function eventCard(e) {
  const m = e.main[0], a = fighter(m.a), b = fighter(m.b);
  const past = e.status === "past";
  return `<article class="event-card ${e.brand}">
    <a class="ec-media" href="evento.html?id=${e.id}">
      <div class="ec-bg"></div>
      <div class="ec-fighters">${silhouette("l", "sil-red")}${silhouette("r", "sil-blue")}</div>
      <div class="ec-brand">${brandBadge(e.brand)}</div>
    </a>
    <div class="ec-body">
      <h3 class="ec-name">${esc(e.name)}</h3>
      <h4 class="ec-headline"><a href="evento.html?id=${e.id}">${esc(a.last)} <em>vs</em> ${esc(b.last)}</a></h4>
      <div class="ec-meta">
        <span>${fmtDate(e.date)} · ${fmtTime(e.date)}</span>
        <span>${esc(e.venue)} · ${esc(e.city)}</span>
      </div>
      <div class="ec-actions">
        <a class="btn btn-dark" href="evento.html?id=${e.id}">${past ? t("ev.results") : t("ev.details")}</a>
        ${past ? "" : `<a class="btn btn-red" href="boletas.html?evento=${e.id}">${t("ev.tickets")}</a>`}
      </div>
    </div>
  </article>`;
}

function fightRow(fight, isMain = false) {
  const a = fighter(fight.a), b = fighter(fight.b), r = fight.result;
  const side = (f, key, flip) => {
    const win = r && r.winner === key, lose = r && r.winner !== key;
    return `<a class="fr-side ${flip ? "fr-b" : "fr-a"} ${win ? "win" : ""} ${lose ? "lose" : ""}" href="peleador.html?id=${f.id}">
      <div class="fr-photo">${silhouette(flip ? "r" : "l", flip ? "sil-blue" : "sil-red")}${win ? `<span class="fr-win">${t("ev.win")}</span>` : ""}</div>
      <div class="fr-name">
        ${f.rank === 0 ? `<span class="fr-c">C</span>` : `<span class="fr-r">#${f.rank}</span>`}
        <b>${esc(f.first)}</b><strong>${esc(f.last)}</strong>
        <span class="fr-rec">${record(f)}</span>
      </div>
    </a>`;
  };
  return `<div class="fight-row ${isMain ? "fr-main" : ""}">
    ${side(a, "a", false)}
    <div class="fr-mid">
      <span class="fr-div">${divName(fight.div)}</span>
      ${fight.title ? `<span class="fr-title">${t("ev.title")}</span>` : ""}
      <span class="fr-vs">VS</span>
      ${r ? `<span class="fr-res">${r.method} · R${r.round} · ${r.time}</span>` : `<span class="fr-rounds">${fight.rounds} ${t("ev.rounds")}</span>`}
    </div>
    ${side(b, "b", true)}
  </div>`;
}

/* Historial de un peleador dentro de los eventos registrados */
function fighterHistory(id) {
  const rows = [];
  for (const e of EVENTS) {
    for (const f of [...e.main, ...e.prelims]) {
      if (f.a !== id && f.b !== id) continue;
      const me = f.a === id ? "a" : "b";
      rows.push({ e, f, opp: fighter(me === "a" ? f.b : f.a), res: f.result ? (f.result.winner === me ? "W" : "L") : null });
    }
  }
  return rows.sort((x, y) => new Date(y.e.date) - new Date(x.e.date));
}

function ring(pct, label) {
  const c = 2 * Math.PI * 42;
  return `<div class="ring">
    <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" class="ring-bg"/><circle cx="50" cy="50" r="42" class="ring-fg" stroke-dasharray="${(c * pct) / 100} ${c}"/></svg>
    <div class="ring-val"><b>${pct}%</b></div>
    <span>${label}</span>
  </div>`;
}
