"use client";

import { useTranslation } from "react-i18next";

export default function Progress({ step, total }: { step: number; total: number }) {
  const { t } = useTranslation();
  return (
    <div className="progress">
      <div className="label">{t("ui.progress", { step, total })}</div>
      <div className="bar" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={"seg" + (i < step ? " on" : "")} />
        ))}
      </div>
    </div>
  );
}
