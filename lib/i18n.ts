"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { GLOSSARY } from "@/lib/glossary";
import en from "@/locales/en/survey.json";
import hi from "@/locales/hi/survey.json";
import mr from "@/locales/mr/survey.json";
import te from "@/locales/te/survey.json";
import as from "@/locales/as/survey.json";

// Endonyms shown in the switcher (safe, well-known native names).
export const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
  { code: "te", label: "తెలుగు" },
  { code: "as", label: "অসমীয়া" },
];

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
      te: { translation: te },
      as: { translation: as },
    },
    lng: "en",
    fallbackLng: "en", // any missing key falls back to English
    keySeparator: false, // keys are flat literals like "q.Q1.opt.I do"
    nsSeparator: false,
    returnEmptyString: false,
    interpolation: {
      escapeValue: false,
      defaultVariables: GLOSSARY, // {{b_*}} brand tokens resolve to Latin in every language
    },
  });
}

export default i18n;
