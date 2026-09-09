// Do-not-translate glossary. Brand / product names stay in Latin form in every language.
// They are injected as interpolation tokens ({{b_xxx}}) so a translator physically cannot
// alter them: the token resolves to the value below at render time, in all languages.
//
// To add a protected term: add it to GLOSSARY (token -> Latin form) and to
// BRAND_REPLACEMENTS (surface text -> token), then re-run scripts/extract-i18n.ts.

export const GLOSSARY: Record<string, string> = {
  b_whatsapp: "WhatsApp",
  b_googledrive: "Google Drive",
  b_upi: "UPI",
  b_abha: "ABHA",
  b_1mg: "1mg",
  b_pharmeasy: "PharmEasy",
  b_apollo: "Apollo",
  b_netmeds: "Netmeds",
  b_zeno: "Zeno",
  b_zepto: "Zepto",
  b_blinkit: "Blinkit",
  b_instamart: "Instamart",
  b_practo: "Practo",
  b_youtube: "YouTube",
};

// Longest surfaces first so "Google Drive" is matched before "Drive", etc.
export const BRAND_REPLACEMENTS: [string, string][] = [
  ["Google Drive", "{{b_googledrive}}"],
  ["PharmEasy", "{{b_pharmeasy}}"],
  ["Instamart", "{{b_instamart}}"],
  ["WhatsApp", "{{b_whatsapp}}"],
  ["Netmeds", "{{b_netmeds}}"],
  ["Blinkit", "{{b_blinkit}}"],
  ["Practo", "{{b_practo}}"],
  ["YouTube", "{{b_youtube}}"],
  ["Apollo", "{{b_apollo}}"],
  ["Zepto", "{{b_zepto}}"],
  ["ABHA", "{{b_abha}}"],
  ["1mg", "{{b_1mg}}"],
  ["Zeno", "{{b_zeno}}"],
  ["UPI", "{{b_upi}}"],
];

// Also preserved but handled by rendering raw (not via tokens): Indian city names
// (proper nouns) and the ₹ currency symbol. City option labels are shown verbatim.
