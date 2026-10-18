/* ==========================================================================
   ONE TRUE INC — Render de cada página (según <body data-page="...">)
   ========================================================================== */

function renderPage() {
  const p = document.body.dataset.page;
  const fn = PAGES[p];
  if (fn) fn($("#app"));
}

function pageHead(titleKey, subKey, extra = "") {
  return `<section class="page-head">
    <div class="page-head-bg"></div>
    <div class="wrap">
      <h1>${t(titleKey)}</h1>
      ${subKey ? `<p>${t(subKey)}</p>` : ""}
      ${extra}
    </div>
  </section>`;
}

function notFound(app, msgKey, backHref, backKey) {
  app.innerHTML = `<section class="wrap empty-state"><h1>${t(msgKey)}</h1><a class="btn btn-red" href="${backHref}">${t(backKey)}</a></section>`;
}

const PAGES = {
  /* ------------------------------------------------------------------ HOME */
  home(app) {
    const ev = nextEvent();
    const m = ev.main[0], a = fighter(m.a), b = fighter(m.b);
    const lead = NEWS[0];
    const spot = fighter("kevin-restrepo");
    const spotHist = fighterHistory(spot.id);
    const spotNext = spotHist.find((h) => !h.res);

    app.innerHTML = `
    <!-- HERO: nota principal + lo más visto -->
    <section class="hero">
      <div class="wrap hero-grid">
        <article class="hero-feature">
          <a class="hero-media" href="evento.html?id=${ev.id}">
            ${ph("1600×900 · FOTO PRINCIPAL", "ph-hero")}
            <div class="hero-sils">${silhouette("l", "sil-red")}${silhouette("r", "sil-blue")}</div>
          </a>
          <div class="hero-copy">
            <span class="red-bar"></span>
            <div class="card-tag"><span class="tag-icon"></span>${esc(ev.name)}</div>
            <h1><a href="noticia.html?id=${lead.id}">${esc(tx(lead.title))}</a></h1>
            <p>${esc(tx(lead.excerpt))} ${esc(ev.venue)}, ${esc(ev.city)} · ${fmtDate(ev.date, { day: "numeric", month: "long" })}.</p>
            <div class="hero-actions">
              <a class="btn btn-dark" href="evento.html?id=${ev.id}">${t("home.watchNow")}</a>
              <a class="btn btn-outline" href="boletas.html?evento=${ev.id}">${t("home.howToWatch")}</a>
            </div>
          </div>
        </article>
        <aside class="top-stories">
          <h2>${t("home.topStories")}</h2>
          <ol>
            ${NEWS.slice(1, 7).map((n, i) => `<li><a href="noticia.html?id=${n.id}"><span class="ts-num">${i + 1}</span><span class="ts-body"><span class="card-tag light"><span class="tag-icon"></span>${esc(n.cat)}</span><b>${esc(tx(n.title))}</b></span></a></li>`).join("")}
          </ol>
        </aside>
      </div>
    </section>

    <!-- BANNER PELEA ESTELAR -->
    <section class="main-event">
      <div class="me-bg"></div>
      <div class="wrap me-grid">
        <a class="me-fighter me-a" href="peleador.html?id=${a.id}">${silhouette("l", "sil-red sil-xl")}</a>
        <div class="me-center">
          ${brandBadge(ev.brand)}
          <span class="me-event">${esc(ev.name)} · ${esc(tx(ev.tagline))}</span>
          <h2 class="me-vs"><span>${esc(a.last)}</span><em>vs</em><span>${esc(b.last)}</span></h2>
          <span class="me-meta">${fmtDate(ev.date, { weekday: "long", day: "numeric", month: "long" })} · ${esc(ev.venue)}</span>
          <div class="countdown" id="cd-home"></div>
          <a class="live-badge" href="boletas.html?evento=${ev.id}">${t("home.liveNow")}</a>
        </div>
        <a class="me-fighter me-b" href="peleador.html?id=${b.id}">${silhouette("r", "sil-blue sil-xl")}</a>
      </div>
    </section>

    <!-- NO TE PUEDES PERDER -->
    <section class="sec sec-dark">
      <div class="wrap" data-carousel>
        <div class="sec-head">
          <h2>${t("home.dontMiss")}</h2>
          <div class="car-nav"><button class="car-btn" data-dir="prev" aria-label="Anterior">‹</button><button class="car-btn" data-dir="next" aria-label="Siguiente">›</button></div>
        </div>
        <div class="car-track">${NEWS.map((n) => newsCard(n, "card-tall")).join("")}</div>
      </div>
    </section>

    <!-- DESTACADO -->
    <section class="sec">
      <div class="wrap featured-grid">
        <div>
          <div class="sec-head"><h2>${t("home.featured")}</h2></div>
          <div class="featured-top">${NEWS.slice(0, 2).map((n) => newsCard(n)).join("")}</div>
          <div class="featured-list">${NEWS.slice(2, 6).map(newsRow).join("")}</div>
          <div class="center"><a class="btn btn-outline" href="noticias.html">— ${t("home.moreContent")} —</a></div>
        </div>
        <aside class="side-col">
          <div class="ig-card">
            <div class="ig-top">${logo("logo-sm logo-dark")}<div><b>onetrue.inc</b><span>Instagram</span></div></div>
            <div class="ig-grid">${Array.from({ length: 6 }, (_, i) => `<div class="ig-cell">${silhouette(i % 2 ? "r" : "l", "sil-card")}</div>`).join("")}</div>
            <h4>${t("home.followIg")}</h4>
            <p>${t("home.followIgText")}</p>
            <a class="btn btn-red btn-block" href="${SOCIAL.instagram}" target="_blank" rel="noopener">${t("home.followBtn")}</a>
          </div>
          <div class="brands-card">
            <h4>${t("home.brands")}</h4>
            <div class="brand-row">${brandBadge("trueboxing")}<p>${t("home.tbText")}</p></div>
            <div class="brand-row">${brandBadge("trueknuckles")}<p>${t("home.tkText")}</p></div>
          </div>
        </aside>
      </div>
    </section>

    <!-- PRÓXIMAS CARTELERAS -->
    <section class="sec sec-gray">
      <div class="wrap">
        <div class="sec-head"><h2>${t("home.upcoming")}</h2><a class="link-more" href="eventos.html">${t("ev.all")} ›</a></div>
        <div class="event-grid">${upcomingEvents().map(eventCard).join("")}</div>
      </div>
    </section>

    <!-- EN LA MIRA -->
    <section class="sec sec-dark spotlight">
      <div class="wrap">
        <div class="sec-head"><h2>${t("home.spotlight")}</h2></div>
        <div class="spot-grid">
          <a class="spot-photo" href="peleador.html?id=${spot.id}">${silhouette("l", "sil-red sil-xl")}</a>
          <div class="spot-info">
            <span class="spot-div">${divName(spot.div)} · <i class="dot"></i> ${t("f.active")}</span>
            <h3>${esc(fullName(spot))}</h3>
            <span class="spot-nick">"${esc(spot.nick)}"</span>
            <div class="spot-rec">${record(spot)} <small>${t("f.wld")}</small></div>
            ${spotNext ? `<div class="spot-next"><span>${t("f.nextFight")}</span><b>${esc(spotNext.e.name)} · vs ${esc(fullName(spotNext.opp))}</b><small>${fmtDate(spotNext.e.date)}</small></div>` : ""}
            <a class="btn btn-red" href="peleador.html?id=${spot.id}">${t("f.profile")}</a>
          </div>
          <div class="spot-stats">
            ${ring(spot.acc, t("f.acc"))}
            ${ring(Math.round((spot.ko / spot.w) * 100), t("f.koRate"))}
            <div class="stat-boxes">
              <div><b>${spot.ko}</b><span>${t("f.ko")}</span></div>
              <div><b>${spot.ppr}</b><span>${t("f.ppr")}</span></div>
              <div><b>${spot.reach}</b><span>${t("f.reach")}</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NOTICIAS RECIENTES -->
    <section class="sec">
      <div class="wrap" data-carousel>
        <div class="sec-head">
          <h2>${t("home.recent")}</h2>
          <div class="car-nav light"><button class="car-btn" data-dir="prev" aria-label="Anterior">‹</button><button class="car-btn" data-dir="next" aria-label="Siguiente">›</button></div>
        </div>
        <div class="car-track">${[...NEWS].reverse().map((n) => newsCard(n)).join("")}</div>
      </div>
    </section>`;

    mountCountdown($("#cd-home"), ev.date);
  },

  /* ---------------------------------------------------------------- EVENTOS */
  events(app) {
    app.innerHTML = `
      ${pageHead("ev.headerTitle", "ev.headerSub", `<div class="tabs" role="tablist">
        <button class="tab on" data-tab="upcoming">${t("ev.upcoming")}</button>
        <button class="tab" data-tab="past">${t("ev.past")}</button>
      </div>`)}
      <section class="sec sec-gray">
        <div class="wrap">
          <div class="event-list" data-panel="upcoming">${upcomingEvents().map(eventCard).join("")}</div>
          <div class="event-list" data-panel="past" hidden>${pastEvents().map(eventCard).join("")}</div>
        </div>
      </section>`;
    $$(".tab", app).forEach((b) => b.addEventListener("click", () => {
      $$(".tab", app).forEach((x) => x.classList.toggle("on", x === b));
      $$("[data-panel]", app).forEach((p) => (p.hidden = p.dataset.panel !== b.dataset.tab));
    }));
  },

  /* ----------------------------------------------------------------- EVENTO */
  event(app) {
    const e = event(param("id")) || nextEvent();
    if (!e) return notFound(app, "ev.notFound", "eventos.html", "ev.back");
    const m = e.main[0], a = fighter(m.a), b = fighter(m.b);
    const past = e.status === "past";
    document.title = `${e.name} | One True`;

    app.innerHTML = `
      <section class="event-hero ${e.brand}">
        <div class="eh-bg"></div>
        <div class="wrap eh-grid">
          <div class="eh-fighter">${silhouette("l", "sil-red sil-xl")}</div>
          <div class="eh-center">
            ${brandBadge(e.brand)}
            <span class="eh-name">${esc(e.name)}</span>
            <h1><span>${esc(a.last)}</span><em>vs</em><span>${esc(b.last)}</span></h1>
            <p class="eh-tag">${esc(tx(e.tagline))}</p>
            <div class="eh-meta">
              <div><span>${t("ev.date")}</span><b>${fmtDate(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</b><small>${fmtTime(e.date)}</small></div>
              <div><span>${t("ev.venue")}</span><b>${esc(e.venue)}</b><small>${esc(e.city)}</small></div>
            </div>
            ${past ? `<div class="ended">${t("ev.ended")}</div>` : `<div class="countdown" id="cd-ev"></div><a class="live-badge" href="boletas.html?evento=${e.id}">${t("ev.tickets")}</a>`}
          </div>
          <div class="eh-fighter">${silhouette("r", "sil-blue sil-xl")}</div>
        </div>
      </section>
      <nav class="sub-nav"><div class="wrap">
        <a href="#main">${t("ev.main")}</a>
        ${e.prelims.length ? `<a href="#prelims">${t("ev.prelims")}</a>` : ""}
        ${past ? "" : `<a href="boletas.html?evento=${e.id}">${t("ev.tickets")}</a>`}
        <a href="eventos.html">${t("ev.all")}</a>
      </div></nav>
      <section class="sec sec-gray">
        <div class="wrap narrow">
          <h2 class="card-title" id="main">${t("ev.main")}</h2>
          <div class="fight-list">${e.main.map((f, i) => fightRow(f, i === 0)).join("")}</div>
          ${e.prelims.length ? `<h2 class="card-title" id="prelims">${t("ev.prelims")}</h2><div class="fight-list">${e.prelims.map((f) => fightRow(f)).join("")}</div>` : ""}
        </div>
      </section>
      <section class="sec">
        <div class="wrap">
          <div class="sec-head"><h2>${past ? t("home.upcoming") : t("ev.all")}</h2></div>
          <div class="event-grid">${EVENTS.filter((x) => x.id !== e.id && x.status === "upcoming").slice(0, 3).map(eventCard).join("")}</div>
        </div>
      </section>`;
    if (!past) mountCountdown($("#cd-ev"), e.date);
  },

  /* ------------------------------------------------------------- PELEADORES */
  fighters(app) {
    const chips = [`<button class="chip on" data-div="all">${t("f.all")}</button>`, ...Object.keys(DIVISIONS).map((k) => `<button class="chip" data-div="${k}">${divName(k)}</button>`)];
    app.innerHTML = `
      ${pageHead("f.headerTitle", "f.headerSub", `<div class="search-inline"><input type="search" data-i18n-ph="f.search" id="f-q"></div>`)}
      <section class="sec sec-gray">
        <div class="wrap">
          <div class="chips">${chips.join("")}</div>
          <div class="fighter-grid">${FIGHTERS.map(fighterCard).join("")}</div>
          <p class="empty-inline" hidden>${t("search.empty")}</p>
        </div>
      </section>`;
    applyI18n(app);
    let div = param("div") || "all";
    const q = $("#f-q");
    const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const apply = () => {
      const s = norm(q.value.trim());
      let shown = 0;
      $$(".fighter-card", app).forEach((c) => {
        const ok = (div === "all" || c.dataset.div === div) && (!s || norm(c.textContent).includes(s));
        c.hidden = !ok; if (ok) shown++;
      });
      $$(".chip", app).forEach((c) => c.classList.toggle("on", c.dataset.div === div));
      $(".empty-inline", app).hidden = shown > 0;
    };
    $$(".chip", app).forEach((c) => c.addEventListener("click", () => { div = c.dataset.div; apply(); }));
    q.addEventListener("input", apply);
    apply();
  },

  /* --------------------------------------------------------------- PELEADOR */
  fighter(app) {
    const f = fighter(param("id"));
    if (!f) return notFound(app, "f.notFound", "peleadores.html", "f.back");
    document.title = `${fullName(f)} | One True`;
    const hist = fighterHistory(f.id);
    const next = hist.find((h) => !h.res);
    const related = NEWS.filter((n) => n.fighter === f.id);
    const total = f.w + f.l + f.d;

    app.innerHTML = `
      <section class="athlete-hero">
        <div class="ah-bg"></div>
        <div class="wrap ah-grid">
          <div class="ah-copy">
            <span class="ah-div">${divName(f.div)} · <i class="dot"></i> ${t("f.active")}</span>
            ${f.rank === 0 ? `<span class="belt big">${isWomen(f) ? t("f.championF") : t("f.champion")}</span>` : `<span class="ah-rank">#${f.rank} ${divName(f.div)}</span>`}
            <span class="ah-nick">"${esc(f.nick)}"</span>
            <h1>${esc(f.first)}<br><strong>${esc(f.last)}</strong></h1>
            <div class="ah-rec">${record(f)} <small>${t("f.wld")}</small></div>
          </div>
          <div class="ah-photo">${silhouette("l", "sil-red sil-xl")}</div>
        </div>
      </section>

      <section class="sec">
        <div class="wrap athlete-grid">
          <div>
            <h2 class="card-title">${t("f.stats")}</h2>
            <div class="stat-panel">
              ${ring(f.acc, t("f.acc"))}
              ${ring(f.def, t("f.def"))}
              ${ring(Math.round((f.ko / f.w) * 100), t("f.koRate"))}
            </div>
            <div class="stat-bars">
              ${[["f.wins", f.w], ["f.losses", f.l], ["f.draws", f.d]].map(([k, v]) => `<div class="sb"><span>${t(k)}</span><div class="sb-track"><i style="width:${total ? (v / total) * 100 : 0}%"></i></div><b>${v}</b></div>`).join("")}
              <div class="sb"><span>${t("f.ko")}</span><div class="sb-track"><i style="width:${total ? (f.ko / total) * 100 : 0}%"></i></div><b>${f.ko}</b></div>
            </div>

            <h2 class="card-title">${t("f.history")}</h2>
            ${hist.length ? `<div class="table-wrap"><table class="table">
              <thead><tr><th>${t("f.result")}</th><th>${t("f.opponent")}</th><th>${t("f.event")}</th><th>${t("ev.method")}</th><th>${t("ev.round")}</th></tr></thead>
              <tbody>${hist.map((h) => `<tr>
                <td>${h.res ? `<span class="res res-${h.res}">${t("f." + h.res)}</span>` : `<span class="res res-n">${fmtDate(h.e.date, { day: "numeric", month: "short" })}</span>`}</td>
                <td><a href="peleador.html?id=${h.opp.id}">${esc(fullName(h.opp))}</a></td>
                <td><a href="evento.html?id=${h.e.id}">${esc(h.e.name)}</a></td>
                <td>${h.f.result ? h.f.result.method : "—"}</td>
                <td>${h.f.result ? `R${h.f.result.round} · ${h.f.result.time}` : "—"}</td>
              </tr>`).join("")}</tbody></table></div>` : `<p class="muted">${t("f.noHistory")}</p>`}
          </div>
          <aside class="side-col">
            <div class="bio-card">
              <h4>${t("f.info")}</h4>
              <dl>
                <div><dt>${t("f.division")}</dt><dd>${divName(f.div)}<small>${DIVISIONS[f.div].limit}</small></dd></div>
                <div><dt>${t("f.hometown")}</dt><dd>${esc(f.city)}, ${f.country}</dd></div>
                <div><dt>${t("f.age")}</dt><dd>${f.age}</dd></div>
                <div><dt>${t("f.height")}</dt><dd>${f.height}</dd></div>
                <div><dt>${t("f.reach")}</dt><dd>${f.reach}</dd></div>
                <div><dt>${t("f.stance")}</dt><dd>${t("f." + f.stance)}</dd></div>
              </dl>
            </div>
            ${next ? `<a class="next-card" href="evento.html?id=${next.e.id}">
              <span>${t("f.nextFight")}</span>
              ${brandBadge(next.e.brand)}
              <b>${esc(next.e.name)}</b>
              <strong>vs ${esc(fullName(next.opp))}</strong>
              <small>${fmtDate(next.e.date)} · ${esc(next.e.venue)}</small>
            </a>` : ""}
          </aside>
        </div>
      </section>
      ${related.length ? `<section class="sec sec-gray"><div class="wrap"><div class="sec-head"><h2>${t("f.related")}</h2></div><div class="news-grid">${related.map((n) => newsCard(n)).join("")}</div></div></section>` : ""}`;
  },

  /* --------------------------------------------------------------- RANKINGS */
  rankings(app) {
    const block = (k) => {
      const list = FIGHTERS.filter((f) => f.div === k).sort((a, b) => a.rank - b.rank);
      const champ = list.find((f) => f.rank === 0);
      return `<div class="rank-card">
        <div class="rank-head"><h3>${divName(k)}</h3><small>${DIVISIONS[k].limit}</small></div>
        ${champ ? `<a class="rank-champ" href="peleador.html?id=${champ.id}">
          <div class="rc-photo">${silhouette("l", "sil-red")}</div>
          <div><span class="belt">${isWomen(champ) ? t("f.championF") : t("f.champion")}</span><b>${esc(fullName(champ))}</b><small>${record(champ)}</small></div>
        </a>` : ""}
        <ol class="rank-list">${list.filter((f) => f.rank > 0).map((f) => `<li><span class="rk">${f.rank}</span><a href="peleador.html?id=${f.id}">${esc(fullName(f))}</a><small>${record(f)}</small></li>`).join("")}</ol>
      </div>`;
    };
    app.innerHTML = `
      ${pageHead("r.headerTitle", "r.headerSub", `<p class="updated">${t("r.updated")}: ${fmtDate(NEWS[0].date, { day: "numeric", month: "long", year: "numeric" })}</p>`)}
      <section class="sec sec-gray">
        <div class="wrap rank-grid">
          <div class="rank-card p4p">
            <div class="rank-head"><h3>${t("r.p4p")}</h3></div>
            <ol class="rank-list">${P4P.map((id, i) => { const f = fighter(id); return `<li><span class="rk">${i + 1}</span><a href="peleador.html?id=${f.id}">${esc(fullName(f))}</a><small>${divName(f.div)}</small></li>`; }).join("")}</ol>
          </div>
          ${Object.keys(DIVISIONS).map(block).join("")}
        </div>
      </section>`;
  },

  /* --------------------------------------------------------------- NOTICIAS */
  news(app) {
    const cats = ["all", ...new Set(NEWS.map((n) => n.cat))];
    app.innerHTML = `
      ${pageHead("n.headerTitle", "n.headerSub")}
      <section class="sec sec-gray">
        <div class="wrap">
          <div class="chips">${cats.map((c, i) => `<button class="chip ${i ? "" : "on"}" data-cat="${esc(c)}">${c === "all" ? t("f.all") : esc(c)}</button>`).join("")}</div>
          <div class="news-lead">${newsCard(NEWS[0], "card-lead")}<div class="news-lead-side">${NEWS.slice(1, 3).map((n) => newsCard(n)).join("")}</div></div>
          <div class="news-grid">${NEWS.map((n) => newsCard(n).replace('class="card', `data-cat="${esc(n.cat)}" class="card`)).join("")}</div>
        </div>
      </section>`;
    $$(".chip", app).forEach((c) => c.addEventListener("click", () => {
      $$(".chip", app).forEach((x) => x.classList.toggle("on", x === c));
      const cat = c.dataset.cat;
      $(".news-lead", app).hidden = cat !== "all";
      $$(".news-grid .card", app).forEach((card) => (card.hidden = cat !== "all" && card.dataset.cat !== cat));
    }));
  },

  /* ---------------------------------------------------------------- NOTICIA */
  article(app) {
    const n = NEWS.find((x) => x.id === param("id"));
    if (!n) return notFound(app, "n.notFound", "noticias.html", "n.back");
    document.title = `${tx(n.title)} | One True`;
    const f = fighter(n.fighter);
    app.innerHTML = `
      <article class="article">
        <div class="wrap narrow">
          <a class="back-link" href="noticias.html">‹ ${t("n.back")}</a>
          <div class="card-tag"><span class="tag-icon"></span>${esc(n.cat)} · ${fmtDate(n.date, { day: "numeric", month: "long", year: "numeric" })}</div>
          <h1>${esc(tx(n.title))}</h1>
          <p class="lead">${esc(tx(n.excerpt))}</p>
        </div>
        <div class="wrap narrow article-media">${ph("1600×900 · FOTO / VIDEO", "ph-hero")}${silhouette("l", "sil-red sil-xl")}</div>
        <div class="wrap narrow article-body">
          <p>${t("n.body")}</p>
          <p>${t("n.body")}</p>
          ${f ? `<a class="inline-fighter" href="peleador.html?id=${f.id}"><div class="if-photo">${silhouette("l", "sil-red")}</div><div><span>"${esc(f.nick)}"</span><b>${esc(fullName(f))}</b><small>${divName(f.div)} · ${record(f)}</small></div><em>${t("f.profile")} ›</em></a>` : ""}
          <p>${t("n.body")}</p>
          <div class="share"><span>${t("n.share")}</span><a href="${SOCIAL.whatsapp}" target="_blank" rel="noopener">WhatsApp</a><a href="${SOCIAL.instagram}" target="_blank" rel="noopener">Instagram</a></div>
        </div>
      </article>
      <section class="sec sec-gray">
        <div class="wrap"><div class="sec-head"><h2>${t("n.more")}</h2></div>
        <div class="news-grid">${NEWS.filter((x) => x.id !== n.id).slice(0, 4).map((x) => newsCard(x)).join("")}</div></div>
      </section>`;
  },

  /* ---------------------------------------------------------------- BOLETAS */
  tickets(app) {
    const ups = upcomingEvents();
    let sel = event(param("evento")) || ups[0];
    app.innerHTML = `
      ${pageHead("t.headerTitle", "t.headerSub")}
      <section class="sec sec-gray">
        <div class="wrap">
          <div class="ticket-events">${ups.map((e) => `<button class="te ${e.id === sel.id ? "on" : ""}" data-id="${e.id}">${brandBadge(e.brand)}<b>${esc(e.name)}</b><small>${fmtDate(e.date)}</small></button>`).join("")}</div>
          <div class="tickets-grid">
            <div>
              <h2 class="card-title">${t("t.zones")}</h2>
              <div class="ticket-list">${TICKETS.map((z) => `<div class="ticket ${z.featured ? "featured" : ""}">
                ${z.featured ? `<span class="ticket-flag">${t("t.featured")}</span>` : ""}
                <div class="ticket-main"><h3>${esc(tx(z.name))}</h3><ul>${tx(z.perks).map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>
                <div class="ticket-buy"><small>${t("t.from")}</small><b>${fmtMoney(z.price)}</b><a class="btn btn-red" data-zone="${esc(tx(z.name))}" href="#">${t("t.buy")}</a></div>
              </div>`).join("")}</div>
              <p class="muted small">${t("t.note")}</p>
            </div>
            <aside class="side-col">
              <div class="venue-map">
                <h4>${t("ev.map")}</h4>
                <div class="vm">
                  <div class="vm-zone vm-gen">General</div>
                  <div class="vm-row">
                    <div class="vm-zone vm-pref">${tx(TICKETS[4].name)}</div>
                    <div class="vm-core">
                      <div class="vm-zone vm-vip">VIP</div>
                      <div class="vm-ring-wrap"><div class="vm-zone vm-palco">${tx(TICKETS[0].name)}</div><div class="vm-ring">${t("t.ring")}</div><div class="vm-zone vm-palco">${tx(TICKETS[1].name)}</div></div>
                      <div class="vm-zone vm-plat">${tx(TICKETS[2].name)}</div>
                    </div>
                    <div class="vm-zone vm-pref">${tx(TICKETS[4].name)}</div>
                  </div>
                  <div class="vm-zone vm-gen">General</div>
                </div>
              </div>
              <div class="howto">
                <h4>${t("t.howTo")}</h4>
                <ol><li>${t("t.step1")}</li><li>${t("t.step2")}</li><li>${t("t.step3")}</li></ol>
                <a class="btn btn-dark btn-block" href="${SOCIAL.whatsapp}" target="_blank" rel="noopener">${t("c.whatsapp")}</a>
              </div>
            </aside>
          </div>
        </div>
      </section>`;
    $$(".te", app).forEach((b) => b.addEventListener("click", () => {
      sel = event(b.dataset.id);
      $$(".te", app).forEach((x) => x.classList.toggle("on", x === b));
    }));
    $$("[data-zone]", app).forEach((a) => a.addEventListener("click", (ev) => {
      ev.preventDefault();
      // TODO: conectar con la pasarela / ticketera real. Por ahora abre WhatsApp.
      window.open(SOCIAL.whatsapp, "_blank", "noopener");
    }));
  },

  /* --------------------------------------------------------------- CONTACTO */
  contact(app) {
    app.innerHTML = `
      ${pageHead("c.headerTitle", "c.headerSub")}
      <section class="sec sec-gray">
        <div class="wrap contact-grid">
          <form class="contact-form" novalidate>
            <label><span>${t("c.name")}</span><input name="name" required></label>
            <label><span>${t("c.email")}</span><input name="email" type="email" required></label>
            <label><span>${t("c.subject")}</span><select name="subject">
              ${["tickets", "press", "sponsor", "fighter"].map((k) => `<option>${t("c.subj." + k)}</option>`).join("")}
            </select></label>
            <label class="full"><span>${t("c.message")}</span><textarea name="message" rows="6" required></textarea></label>
            <button class="btn btn-red" type="submit">${t("c.send")}</button>
            <p class="form-ok" hidden>${t("c.sent")}</p>
          </form>
          <aside class="side-col">
            <div class="bio-card">
              <h4>${t("c.channels")}</h4>
              <a class="channel" href="${SOCIAL.whatsapp}" target="_blank" rel="noopener"><b>WhatsApp</b><span>${t("c.whatsapp")}</span></a>
              <a class="channel" href="${SOCIAL.instagram}" target="_blank" rel="noopener"><b>Instagram</b><span>@onetrue.inc</span></a>
              <a class="channel" href="${SOCIAL.threads}" target="_blank" rel="noopener"><b>Threads</b><span>@onetrue.inc</span></a>
            </div>
            <div class="brands-card">
              <div class="brand-row">${brandBadge("trueboxing")}<p>${t("home.tbText")}</p></div>
              <div class="brand-row">${brandBadge("trueknuckles")}<p>${t("home.tkText")}</p></div>
            </div>
          </aside>
        </div>
      </section>`;
    $(".contact-form", app).addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      // TODO: conectar con backend / servicio de correo.
      $(".form-ok", form).hidden = false;
      form.reset();
    });
  },
};
