/* ==========================================================================
   ONE TRUE INC — Traducciones ES / EN
   Uso en HTML: <span data-i18n="clave"></span>
   Uso en JS:   t("clave")   ·   tx({es, en})
   ========================================================================== */

const I18N = {
  es: {
    "nav.events": "Eventos", "nav.rankings": "Rankings", "nav.fighters": "Peleadores", "nav.news": "Noticias",
    "nav.tickets": "Boletas", "nav.contact": "Contacto", "nav.search": "Buscar", "nav.home": "Inicio", "nav.menu": "Menú",
    "search.placeholder": "Busca peleadores, eventos o noticias…", "search.empty": "Sin resultados", "search.fighters": "Peleadores", "search.events": "Eventos", "search.news": "Noticias",

    "home.topStories": "Lo más visto", "home.watchNow": "Ver cartelera", "home.howToWatch": "Comprar boletas",
    "home.liveNow": "Boletas ya", "home.dontMiss": "No te puedes perder", "home.featured": "Destacado",
    "home.upcoming": "Próximas carteleras", "home.spotlight": "En la mira", "home.recent": "Noticias recientes",
    "home.followIg": "Síguenos en Instagram", "home.followIgText": "Fotos, videos y anuncios de cada cartelera, primero en @onetrue.inc.",
    "home.followBtn": "Ver perfil", "home.moreContent": "Más contenido", "home.brands": "Nuestras marcas",
    "home.tbText": "La casa del verdadero boxeo. Carteleras profesionales con el mejor talento de Colombia.",
    "home.tkText": "La casa del verdadero nudillo. Boxeo a puño limpio, sin guantes, sin excusas.",

    "cd.days": "Días", "cd.hours": "Horas", "cd.min": "Min", "cd.sec": "Seg",

    "ev.upcoming": "Próximos", "ev.past": "Pasados", "ev.main": "Cartelera estelar", "ev.prelims": "Preliminares",
    "ev.tickets": "Boletas", "ev.details": "Ver cartelera", "ev.results": "Resultados", "ev.venue": "Lugar",
    "ev.date": "Fecha", "ev.title": "Pelea de campeonato", "ev.rounds": "asaltos", "ev.round": "Asalto", "ev.time": "Tiempo",
    "ev.method": "Método", "ev.win": "Gana", "ev.vs": "vs", "ev.all": "Todos los eventos", "ev.headerTitle": "Eventos",
    "ev.headerSub": "Todas las carteleras de TrueBoxing y TrueKnuckles", "ev.map": "Mapa de zonas", "ev.back": "Volver a eventos",
    "ev.notFound": "Evento no encontrado", "ev.mainEvent": "Pelea estelar", "ev.ended": "Evento finalizado", "ev.info": "Información del evento",

    "f.headerTitle": "Peleadores", "f.headerSub": "El roster de One True", "f.all": "Todos", "f.search": "Buscar peleador…",
    "f.record": "Récord", "f.wld": "(G-P-E)", "f.champion": "Campeón", "f.championF": "Campeona", "f.profile": "Ver perfil",
    "f.division": "División", "f.age": "Edad", "f.height": "Estatura", "f.reach": "Alcance", "f.stance": "Guardia",
    "f.hometown": "Ciudad", "f.ko": "KOs", "f.koRate": "% de KO", "f.acc": "Precisión de golpes", "f.def": "Defensa",
    "f.ppr": "Golpes por asalto", "f.wins": "Victorias", "f.losses": "Derrotas", "f.draws": "Empates",
    "f.lastFight": "Última pelea", "f.nextFight": "Próxima pelea", "f.history": "Historial de peleas", "f.stats": "Estadísticas",
    "f.info": "Información", "f.orthodox": "Diestro", "f.southpaw": "Zurdo", "f.rank": "Ranking", "f.notFound": "Peleador no encontrado",
    "f.back": "Volver a peleadores", "f.noHistory": "Sin peleas registradas en One True", "f.related": "Noticias relacionadas",
    "f.active": "Activo", "f.opponent": "Rival", "f.event": "Evento", "f.result": "Resultado", "f.W": "G", "f.L": "P",

    "r.headerTitle": "Rankings", "r.headerSub": "Clasificación oficial de One True por división", "r.p4p": "Libra por libra",
    "r.updated": "Actualizado", "r.champ": "Campeón",

    "n.headerTitle": "Noticias", "n.headerSub": "Lo último de One True", "n.read": "Leer más", "n.back": "Volver a noticias",
    "n.notFound": "Noticia no encontrada", "n.more": "Más noticias", "n.share": "Compartir",
    "n.body": "Este es un texto de ejemplo para la nota. Aquí irá el contenido completo de la noticia: declaraciones de los peleadores, contexto de la cartelera, resultados y fotografías del evento. Reemplazar con el texto real desde el panel de contenido o editando js/data.js.",

    "t.headerTitle": "Boletas", "t.headerSub": "Elige tu zona y vive la noche desde el ring", "t.buy": "Comprar",
    "t.from": "Desde", "t.event": "Evento", "t.zones": "Zonas y precios", "t.howTo": "¿Cómo comprar?",
    "t.step1": "Elige el evento y la zona.", "t.step2": "Escríbenos por WhatsApp con la zona y cantidad.", "t.step3": "Recibe tu boleta digital y preséntala en la entrada.",
    "t.note": "Precios de ejemplo en pesos colombianos (COP). Sujetos a cambio por etapa de venta.", "t.ring": "Ring", "t.featured": "Mejor experiencia",

    "c.headerTitle": "Contacto", "c.headerSub": "Prensa, patrocinios, peleadores y boletería",
    "c.name": "Nombre", "c.email": "Correo", "c.subject": "Asunto", "c.message": "Mensaje", "c.send": "Enviar mensaje",
    "c.sent": "¡Gracias! Te responderemos pronto. (Formulario de demostración: aún no envía datos.)",
    "c.whatsapp": "Escríbenos por WhatsApp", "c.subj.tickets": "Boletería", "c.subj.press": "Prensa", "c.subj.sponsor": "Patrocinios", "c.subj.fighter": "Quiero pelear en One True",
    "c.channels": "Canales directos",

    "foot.tagline": "La casa del verdadero boxeo.", "foot.follow": "Síguenos", "foot.company": "Compañía",
    "foot.about": "Nosotros", "foot.terms": "Términos y condiciones", "foot.privacy": "Política de privacidad",
    "foot.rights": "Todos los derechos reservados.", "foot.explore": "Explora", "foot.lang": "Idioma",
    "ph.note": "Sitio en construcción — contenido de ejemplo",
  },
  en: {
    "nav.events": "Events", "nav.rankings": "Rankings", "nav.fighters": "Fighters", "nav.news": "News",
    "nav.tickets": "Tickets", "nav.contact": "Contact", "nav.search": "Search", "nav.home": "Home", "nav.menu": "Menu",
    "search.placeholder": "Search fighters, events or news…", "search.empty": "No results", "search.fighters": "Fighters", "search.events": "Events", "search.news": "News",

    "home.topStories": "Top stories", "home.watchNow": "See fight card", "home.howToWatch": "Buy tickets",
    "home.liveNow": "Tickets now", "home.dontMiss": "Don't miss", "home.featured": "Featured",
    "home.upcoming": "Upcoming fight cards", "home.spotlight": "In the spotlight", "home.recent": "Recent news",
    "home.followIg": "Follow us on Instagram", "home.followIgText": "Photos, videos and every fight card announcement, first on @onetrue.inc.",
    "home.followBtn": "View profile", "home.moreContent": "More content", "home.brands": "Our brands",
    "home.tbText": "The home of true boxing. Professional fight cards with Colombia's best talent.",
    "home.tkText": "The home of the true knuckle. Bare-knuckle boxing, no gloves, no excuses.",

    "cd.days": "Days", "cd.hours": "Hours", "cd.min": "Min", "cd.sec": "Sec",

    "ev.upcoming": "Upcoming", "ev.past": "Past", "ev.main": "Main card", "ev.prelims": "Prelims",
    "ev.tickets": "Tickets", "ev.details": "See fight card", "ev.results": "Results", "ev.venue": "Venue",
    "ev.date": "Date", "ev.title": "Title fight", "ev.rounds": "rounds", "ev.round": "Round", "ev.time": "Time",
    "ev.method": "Method", "ev.win": "Win", "ev.vs": "vs", "ev.all": "All events", "ev.headerTitle": "Events",
    "ev.headerSub": "Every TrueBoxing and TrueKnuckles fight card", "ev.map": "Seating map", "ev.back": "Back to events",
    "ev.notFound": "Event not found", "ev.mainEvent": "Main event", "ev.ended": "Event ended", "ev.info": "Event information",

    "f.headerTitle": "Fighters", "f.headerSub": "The One True roster", "f.all": "All", "f.search": "Search fighter…",
    "f.record": "Record", "f.wld": "(W-L-D)", "f.champion": "Champion", "f.championF": "Champion", "f.profile": "View profile",
    "f.division": "Division", "f.age": "Age", "f.height": "Height", "f.reach": "Reach", "f.stance": "Stance",
    "f.hometown": "Hometown", "f.ko": "KOs", "f.koRate": "KO rate", "f.acc": "Striking accuracy", "f.def": "Defense",
    "f.ppr": "Punches per round", "f.wins": "Wins", "f.losses": "Losses", "f.draws": "Draws",
    "f.lastFight": "Last fight", "f.nextFight": "Next fight", "f.history": "Fight history", "f.stats": "Stats",
    "f.info": "Bio", "f.orthodox": "Orthodox", "f.southpaw": "Southpaw", "f.rank": "Ranking", "f.notFound": "Fighter not found",
    "f.back": "Back to fighters", "f.noHistory": "No fights on record with One True", "f.related": "Related news",
    "f.active": "Active", "f.opponent": "Opponent", "f.event": "Event", "f.result": "Result", "f.W": "W", "f.L": "L",

    "r.headerTitle": "Rankings", "r.headerSub": "Official One True rankings by division", "r.p4p": "Pound for pound",
    "r.updated": "Updated", "r.champ": "Champion",

    "n.headerTitle": "News", "n.headerSub": "The latest from One True", "n.read": "Read more", "n.back": "Back to news",
    "n.notFound": "Article not found", "n.more": "More news", "n.share": "Share",
    "n.body": "This is placeholder text for the article. The full story goes here: fighter quotes, fight card context, results and event photos. Replace it with real copy from the content panel or by editing js/data.js.",

    "t.headerTitle": "Tickets", "t.headerSub": "Pick your zone and live the night from ringside", "t.buy": "Buy",
    "t.from": "From", "t.event": "Event", "t.zones": "Zones & prices", "t.howTo": "How to buy",
    "t.step1": "Choose the event and zone.", "t.step2": "Message us on WhatsApp with the zone and quantity.", "t.step3": "Get your digital ticket and show it at the door.",
    "t.note": "Sample prices in Colombian pesos (COP). Subject to change by sales phase.", "t.ring": "Ring", "t.featured": "Best experience",

    "c.headerTitle": "Contact", "c.headerSub": "Press, sponsorships, fighters and ticketing",
    "c.name": "Name", "c.email": "Email", "c.subject": "Subject", "c.message": "Message", "c.send": "Send message",
    "c.sent": "Thanks! We'll get back to you soon. (Demo form: it doesn't send data yet.)",
    "c.whatsapp": "Message us on WhatsApp", "c.subj.tickets": "Ticketing", "c.subj.press": "Press", "c.subj.sponsor": "Sponsorships", "c.subj.fighter": "I want to fight for One True",
    "c.channels": "Direct channels",

    "foot.tagline": "The home of true boxing.", "foot.follow": "Follow us", "foot.company": "Company",
    "foot.about": "About us", "foot.terms": "Terms & conditions", "foot.privacy": "Privacy policy",
    "foot.rights": "All rights reserved.", "foot.explore": "Explore", "foot.lang": "Language",
    "ph.note": "Site under construction — sample content",
  },
};

const LANG = (() => {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "es" || q === "en") { localStorage.setItem("ot-lang", q); return q; }
    const s = localStorage.getItem("ot-lang");
    if (s === "es" || s === "en") return s;
  } catch (e) {}
  return (navigator.language || "es").toLowerCase().startsWith("en") ? "en" : "es";
})();
document.documentElement.lang = LANG;

function t(key) { return (I18N[LANG] && I18N[LANG][key]) || I18N.es[key] || key; }
function tx(obj) { return obj == null ? "" : typeof obj === "string" ? obj : obj[LANG] || obj.es; }

function setLang(lang) {
  try { localStorage.setItem("ot-lang", lang); } catch (e) {}
  const url = new URL(location.href);
  url.searchParams.delete("lang");
  location.href = url.toString();
}

function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
}
