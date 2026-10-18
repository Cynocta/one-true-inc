"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import s from "@/components/pages/pages.module.css";
import { useI18n } from "@/components/providers/I18nProvider";

export function ContactForm() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) return form.reportValidity();
    // TODO: conectar con backend o servicio de correo (Resend, Formspree, etc.)
    setSent(true);
    form.reset();
  };

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate>
      <label><span>{t("c.name")}</span><input name="name" required autoComplete="name" /></label>
      <label><span>{t("c.email")}</span><input name="email" type="email" required autoComplete="email" /></label>
      <label className={s.full}>
        <span>{t("c.subject")}</span>
        <select name="subject">
          {(["c.subj.tickets", "c.subj.press", "c.subj.sponsor", "c.subj.fighter"] as const).map((k) => <option key={k}>{t(k)}</option>)}
        </select>
      </label>
      <label className={s.full}><span>{t("c.message")}</span><textarea name="message" rows={6} required /></label>
      <motion.button whileTap={{ scale: 0.97 }} className="btn btn-red" type="submit">{t("c.send")}</motion.button>
      <AnimatePresence>
        {sent && (
          <motion.p className={s.ok} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {t("c.sent")}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
