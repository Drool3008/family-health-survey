"use client";

import { useTranslation } from "react-i18next";
import { LANGS } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const set = (code: string) => {
    i18n.changeLanguage(code);
    try { localStorage.setItem("fhs_lng", code); } catch {}
  };
  return (
    <div className="langbar" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          className={"langbtn" + (i18n.language === l.code ? " on" : "")}
          onClick={() => set(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
