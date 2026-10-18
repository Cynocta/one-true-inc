"use client";

import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { FighterArt } from "@/components/fighters/FighterArt";
import { FIGHTERS } from "@/data/fighters";
import { HBars } from "../charts";
import { useAdmin } from "../store";
import { Card, Drawer, Stat } from "../ui";
import { cop, type View } from "../useView";
import s from "../admin.module.css";

export function Fighters({ view }: { view: View }) {
  const { toast } = useAdmin();
  const { data, orders, slug } = view;
  const [origin, setOrigin] = useState("https://onetrue.co");
  const [qrFor, setQrFor] = useState<string | null>(null);
  const [qr, setQr] = useState("");

  useEffect(() => { setOrigin(window.location.origin); }, []);

  const onCard = useMemo(() => {
    const ids = [...new Set([...data.event.main, ...data.event.prelims].flatMap((b) => [b.a, b.b]))];
    return ids.map((id) => FIGHTERS.find((f) => f.slug === id)!).filter(Boolean);
  }, [data]);

  const stats = useMemo(() => onCard.map((f) => {
    const os = orders.filter((o) => o.ref === f.slug);
    return { f, orders: os.length, tickets: os.reduce((a, o) => a + o.people, 0), revenue: os.reduce((a, o) => a + o.total, 0) };
  }).sort((a, b) => b.tickets - a.tickets), [onCard, orders]);

  const link = (fs: string) => `${origin}/es/boletas/?evento=${slug}&ref=${fs}`;
  const viaLinks = orders.filter((o) => o.ref);
  const share = orders.length ? (viaLinks.length / orders.length) * 100 : 0;

  const copy = async (fs: string) => {
    try { await navigator.clipboard.writeText(link(fs)); toast("Link copiado al portapapeles"); }
    catch { toast("No se pudo copiar: selecciona el link manualmente", "err"); }
  };

  useEffect(() => {
    if (!qrFor) return;
    QRCode.toDataURL(link(qrFor), { errorCorrectionLevel: "M", margin: 2, width: 360 }).then(setQr);
  }, [qrFor]); // eslint-disable-line react-hooks/exhaustive-deps

  const qrFighter = qrFor ? FIGHTERS.find((f) => f.slug === qrFor) : null;

  return (
    <>
      <div className={s.kpis4}>
        <Stat label="Ventas por links de peleadores" value={viaLinks.reduce((a, o) => a + o.people, 0)} sub="boletas en el periodo" />
        <Stat label="Recaudo por links" value={cop(viaLinks.reduce((a, o) => a + o.total, 0))} delay={0.05} />
        <Stat label="Participación" value={`${share.toFixed(0)}%`} sub="de las órdenes llegan por un peleador" delay={0.1} />
        <Stat label="Peleadores en cartelera" value={onCard.length} delay={0.15} />
      </div>

      <div className={s.grid}>
        <Card title="Ranking" sub="Boletas vendidas con el link de cada peleador" className={s.span4}>
          <HBars rows={stats.slice(0, 8).map((x) => ({ label: `${x.f.first} ${x.f.last}`, value: x.tickets }))} format={(n) => `${n}`} />
        </Card>

        <Card title="Links de venta" sub="Cada peleador comparte su link; la venta queda a su nombre" className={s.span8} delay={0.05}>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Peleador</th><th className={s.num}>Órdenes</th><th className={s.num}>Boletas</th><th className={s.num}>Recaudo</th><th>Link</th></tr></thead>
              <tbody>
                {stats.map(({ f, orders: n, tickets, revenue }) => (
                  <tr key={f.slug}>
                    <td>
                      <div className={s.fighterCell}>
                        <span className={s.avatar}><FighterArt fighter={f} /></span>
                        <div><b>{f.first} {f.last}</b><small className={s.muted}>&ldquo;{f.nick}&rdquo;</small></div>
                      </div>
                    </td>
                    <td className={s.num}>{n}</td>
                    <td className={s.num}>{tickets}</td>
                    <td className={s.num}>{cop(revenue)}</td>
                    <td>
                      <div className={s.linkCell}>
                        <code title={link(f.slug)}>?ref={f.slug}</code>
                        <button className={s.tinyBtn} onClick={() => copy(f.slug)}>Copiar</button>
                        <button className={s.tinyBtn} onClick={() => setQrFor(f.slug)}>QR</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Drawer open={!!qrFor} onClose={() => { setQrFor(null); setQr(""); }} title={qrFighter ? `QR de ${qrFighter.first} ${qrFighter.last}` : ""}>
        {qrFor && (
          <div className={s.qrPanel}>
            {qr ? <img src={qr} alt="QR del link de venta" /> : <div className={s.qrPh} />}
            <code>{link(qrFor)}</code>
            <div className={s.actionsRow}>
              <a className="btn btn-red btn-sm" href={qr} download={`qr-${qrFor}.png`}>⤓ Descargar PNG</a>
              <button className={s.ghostBtn} onClick={() => copy(qrFor)}>Copiar link</button>
            </div>
            <p className={s.note}>Para historias de Instagram, flyers o la camiseta del peleador.</p>
          </div>
        )}
      </Drawer>
    </>
  );
}
