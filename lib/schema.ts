// Full question schema for the Family Health Coordination survey.
// Data-driven: visibility, randomization, roles and storage all read from here.
// Trigger rules (T1-T9), exempt list (A.4) and the 78-cap (A.5) live in lib/visibility.ts.

export type Role = "A" | "B" | "C" | "D";
export type QType = "single" | "multi" | "matrix" | "text" | "dropdown";
export type Answers = Record<string, any>;

export interface Opt {
  id: string;
  label: string;
  pinned?: boolean; // keep last when options are randomized (Other / None / Don't know)
  role?: Role; // only on the Q0.4 router options
  clearsMatrix?: boolean; // matrix "nobody / nothing" escape option
}

export interface MRow {
  id: string;
  label: string;
  group?: string; // for randomizeWithinGroups
  pharmacy?: boolean; // Q10.1 online-pharmacy rows (unused now, kept for reference)
}
export interface MCol {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  section: number;
  roles: Role[];
  type: QType;
  prompt: string;
  help?: string; // form-text shown to the respondent
  options?: Opt[];
  rows?: MRow[];
  cols?: MCol[];
  randomize?: boolean; // shuffle options (single/multi) or rows (matrix)
  randomizeWithinGroups?: boolean; // matrix: shuffle rows inside each group only
  optional?: boolean;
  exempt?: boolean; // never skipped by a trigger
  isRouter?: boolean; // Q0.4 sets the role
  pipeFrom?: string; // Q14.2: interpolate the chosen label of this question into the prompt
  pipedPerStopped?: string; // Q10.2: render one sub-question per "tried and stopped" row of this matrix
  visibleWhen?: (a: Answers) => boolean; // effective condition (triggers folded in)
}

// ---- helpers for predicates ------------------------------------------------
const one = (a: Answers, q: string): string | undefined => a[q];
const many = (a: Answers, q: string): string[] => (Array.isArray(a[q]) ? a[q] : []);
const cells = (a: Answers, q: string): Record<string, string> => a[q]?.cells ?? {};
const hasCol = (a: Answers, q: string, col: string) =>
  Object.values(cells(a, q)).includes(col);

// Q3.2 options treated as a "digital location" for T6.
const DIGITAL_LOC = ["phone_photos", "whatsapp", "email_drive", "hospital_app", "govt_abha"];

// ---- shared column sets ----------------------------------------------------
const COLS_SPOKE: MCol[] = [
  { id: "no", label: "Didn't speak to them" },
  { id: "yes", label: "Spoke to them" },
  { id: "hard", label: "Spoke to them, and they were hard to reach" },
];
const COLS_USE: MCol[] = [
  { id: "use", label: "Use it now" },
  { id: "stopped", label: "Tried it and stopped" },
  { id: "never", label: "Never used it" },
];

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata",
  "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik",
  "Faridabad", "Meerut", "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad",
  "Amritsar", "Allahabad", "Ranchi", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada",
  "Jodhpur", "Madurai", "Raipur", "Kota", "Chandigarh", "Guwahati", "Solapur",
  "Mysuru", "Kochi", "Thiruvananthapuram", "Dehradun", "Noida", "Gurugram",
];

// ---------------------------------------------------------------------------
export const QUESTIONS: Question[] = [
  // ===================== SECTION 0 — CONSENT AND ROUTING ====================
  {
    id: "Q0.1", section: 0, roles: ["A", "B", "C", "D"], type: "single",
    prompt: "Family code",
    help: "Given to you along with this link.",
    options: [
      { id: "F1", label: "F1" }, { id: "F2", label: "F2" }, { id: "F3", label: "F3" },
      { id: "F4", label: "F4" }, { id: "F5", label: "F5" },
    ],
  },
  {
    id: "Q0.2", section: 0, roles: ["A", "B", "C", "D"], type: "single",
    prompt: "Your age",
    options: ["18–24", "25–34", "35–44", "45–54", "55–64", "65–74", "75 or above"]
      .map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q0.3", section: 0, roles: ["A", "B", "C", "D"], type: "dropdown",
    prompt: "Your city",
    options: [...INDIAN_CITIES, "Outside India"].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q0.4", section: 0, roles: ["A", "B", "C", "D"], type: "single", isRouter: true,
    prompt: "Which of these is closest to your position in the family?",
    options: [
      { id: "A", label: "I am usually the one who arranges doctors, medicines and reports for others", role: "A" },
      { id: "B", label: "I help with it, but someone else takes the lead", role: "B" },
      { id: "C", label: "Others mostly arrange these things for me", role: "C" },
      { id: "D", label: "I am part of the family but rarely involved in any of this", role: "D" },
    ],
  },
  {
    id: "Q0.5", section: 0, roles: ["A", "B", "C", "D"], type: "single",
    prompt: "Your gender",
    options: ["Female", "Male", "Prefer not to say", "Other"].map((l) => ({ id: l, label: l })),
  },

  // ===================== SECTION 1 — WHO IS IN THIS FAMILY ==================
  {
    id: "Q1.1", section: 1, roles: ["A", "B", "C", "D"], type: "multi",
    prompt: "Who lives in your house right now?",
    help: "Select all that apply.",
    options: [
      "I live alone", "Husband / wife", "Children under 18", "Adult children",
      "My parents", "My in-laws", "Grandparents", "Brother / sister",
      "Other relatives", "Domestic help who stays in the house",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q1.2", section: 1, roles: ["A", "B", "D"], type: "single",
    prompt: "The older family members whose health you are most involved with — where do they live?",
    options: [
      { id: "same_house", label: "In the same house as me" },
      { id: "same_city", label: "Same city, different house" },
      { id: "diff_city_state", label: "Different city, same state" },
      { id: "diff_state", label: "Different state" },
      { id: "outside_india", label: "Outside India" },
      { id: "not_applicable", label: "Not applicable — no older family members I'm involved with" },
    ],
  },
  {
    id: "Q1.3", section: 1, roles: ["A", "B", "D"], type: "single",
    prompt: "How long does it take you to physically reach them?",
    options: [
      { id: "under_4h", label: "Under 4 hours by road" },
      { id: "flight_train", label: "A flight or an overnight train" },
      { id: "more_day", label: "More than a day" },
    ],
    // T3: only when they live in a different state / outside India
    visibleWhen: (a) => ["diff_state", "outside_india"].includes(one(a, "Q1.2") ?? ""),
  },
  {
    id: "Q1.4", section: 1, roles: ["A", "B", "D"], type: "single",
    prompt: "Do the older members of the family live on their own?",
    options: [
      { id: "with_kids", label: "They live with children or grandchildren" },
      { id: "couple_only", label: "Husband and wife only, no children in the house" },
      { id: "alone", label: "One person, living alone" },
      { id: "alone_paid", label: "Living alone with a paid attendant or maid" },
    ],
    // T2
    visibleWhen: (a) => one(a, "Q1.2") !== "not_applicable",
  },
  {
    id: "Q1.5", section: 1, roles: ["A", "B", "C", "D"], type: "single",
    prompt: "When someone in your family suddenly falls seriously ill, whose phone rings first?",
    options: [
      "Mine", "My mother's", "My father's", "My brother's or sister's",
      "My husband's or wife's", "A relative who lives nearby", "A neighbour or family friend",
      "The family doctor's", "Nobody's — the person handles it themselves",
    ].map((l) => ({ id: l, label: l })),
  },

  // ===================== SECTION 2 — THE LAST TIME IT HAPPENED ==============
  {
    id: "Q2.1", section: 2, roles: ["A", "B", "C", "D"], type: "single",
    prompt: "Who was it for?",
    help: "Think of the most recent time someone in your family needed a doctor, a test, or a hospital. Keep that one occasion in mind for the next few questions.",
    options: [
      "My mother", "My father", "Grandparent", "Husband / wife", "Child",
      "Brother / sister", "Parent-in-law", "Myself", "Someone else in the family",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q2.2", section: 2, roles: ["A", "B", "C", "D"], type: "single",
    prompt: "How long ago was this?",
    options: ["This week", "This month", "1–3 months ago", "3–6 months ago", "6–12 months ago", "More than a year ago"]
      .map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q2.3", section: 2, roles: ["A", "B", "C"], type: "single",
    prompt: "How did you first come to know something was wrong?",
    options: [
      "The person told someone themselves", "Someone else noticed and said something",
      "It came out during a routine test or check-up", "We found out late, after it had already got worse",
      "It was an emergency with no warning",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q2.4", section: 2, roles: ["A"], type: "single", randomize: true,
    prompt: "What was the very first thing you did after you knew?",
    options: [
      "Called a family member", "Called a doctor or clinic", "Searched on Google or asked an AI",
      "Asked in the family WhatsApp group", "Went to a chemist", "Went straight to a hospital",
      "Waited to see whether it settled on its own", "Started looking for old reports",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q2.5", section: 2, roles: ["A", "B", "C"], type: "single",
    prompt: "How many days passed between knowing and actually seeing a doctor?",
    options: ["Same day", "1–2 days", "3–7 days", "More than a week", "More than a month", "It still hasn't happened"]
      .map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q2.6", section: 2, roles: ["A"], type: "single", randomize: true,
    prompt: "What mostly filled that gap?",
    options: [
      { id: "appt", label: "Trying to get an appointment" },
      { id: "decide", label: "Deciding which doctor or hospital to go to" },
      { id: "convince", label: "Convincing the person to agree to go" },
      { id: "reports", label: "Finding old reports and prescriptions" },
      { id: "money", label: "Arranging money" },
      { id: "free", label: "Waiting for someone to be free to take them" },
      { id: "none", label: "Nothing — we went immediately", pinned: true },
    ],
  },
  {
    id: "Q2.7", section: 2, roles: ["A"], type: "matrix", randomize: true,
    prompt: "For each of these, tick what applies.",
    cols: COLS_SPOKE,
    rows: [
      "The doctor", "A second doctor for another opinion", "A clinic or hospital receptionist",
      "A lab or diagnostic centre", "A chemist", "An insurance company or TPA",
      "A relative who \"knows someone\"", "A neighbour or friend",
      "Hospital billing or admission counter", "A delivery person",
    ].map((l, i) => ({ id: "r" + i, label: l })),
    options: [{ id: "nobody_outside", label: "We spoke to nobody outside the family", clearsMatrix: true }],
  },
  {
    id: "Q2.8", section: 2, roles: ["A", "B", "D"], type: "multi", randomize: true,
    prompt: "What went wrong that you had not expected?",
    help: "Select all that apply.",
    options: [
      { id: "slot", label: "The appointment slot shown online wasn't actually available" },
      { id: "reports", label: "Old reports could not be found" },
      { id: "repeat", label: "The same information had to be repeated to many people" },
      { id: "cancelled", label: "The appointment was cancelled or moved at the last minute" },
      { id: "doctor_gone", label: "The doctor we wanted was not available any more" },
      { id: "meds_late", label: "Medicines were not in stock or arrived late" },
      { id: "insurance", label: "Insurance did not cover what we thought it would" },
      { id: "bill_higher", label: "The bill was much higher than expected" },
      { id: "refused", label: "The person refused to cooperate" },
      { id: "nothing", label: "Nothing went wrong", pinned: true },
    ],
  },

  // ===================== SECTION 3 — WHERE THE PAPERS ARE ===================
  {
    id: "Q3.1", section: 3, roles: ["A", "B", "C", "D"], type: "single",
    prompt: "If a doctor asked you right now for the last blood test of the older person in your family, what would you actually do first?",
    options: [
      "Open my phone gallery and scroll through photos", "Search the family WhatsApp chat",
      "Open a folder in Google Drive or my email", "Go to a physical file or almirah at home",
      "Call someone at home and ask them to look", "Ask the person themselves",
      "Call the lab or hospital and ask for a copy", "Get the test done again — it would be faster",
      "I honestly wouldn't know where to start",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q3.2", section: 3, roles: ["A", "B", "C"], type: "multi",
    prompt: "Where is that report right now?",
    help: "Select all that apply.",
    options: [
      { id: "file_folder", label: "In a proper file or folder at home" },
      { id: "loose", label: "Loose papers in a drawer, almirah or plastic bag" },
      { id: "phone_photos", label: "Photos in someone's phone gallery" },
      { id: "whatsapp", label: "Inside a WhatsApp chat" },
      { id: "email_drive", label: "Email or Google Drive" },
      { id: "hospital_app", label: "A hospital's app or website" },
      { id: "govt_abha", label: "A government health app or ABHA" },
      { id: "only_doctor", label: "Only with the doctor" },
      { id: "dont_know", label: "I don't know where it is", pinned: true },
    ],
  },
  {
    id: "Q3.3", section: 3, roles: ["A", "B", "C"], type: "single",
    prompt: "Are the reports and prescriptions in a language the person they belong to can read?",
    options: [
      "Yes, they can read all of it", "They can read some of it",
      "No — it's in English and they can't read it", "No — it's in a language they don't know",
      "I've never thought about this",
    ].map((l) => ({ id: l, label: l })),
    // T2 (source Q1.2 not asked to role C -> undefined -> shows for C)
    visibleWhen: (a) => one(a, "Q1.2") !== "not_applicable",
  },
  {
    id: "Q3.4", section: 3, roles: ["A", "B", "C", "D"], type: "single", exempt: true,
    prompt: "Other than you, who in the family could find that report without calling you?",
    options: [
      "Anyone in the family could", "One other person could", "Only the person it belongs to",
      "Nobody — they would all have to call me", "I am not the one who keeps them",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q3.5", section: 3, roles: ["A", "B", "C"], type: "single",
    prompt: "Has a report ever been asked for and simply not found?",
    options: [
      "Yes, and we managed without it", "Yes, and the test had to be done again",
      "Yes, and the appointment was wasted", "Yes, and the doctor got annoyed",
      "No, this has never happened",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q3.6", section: 3, roles: ["A"], type: "single",
    prompt: "When a new report comes in, what usually happens to it?",
    options: [
      "It's photographed and sent to the family group", "It's kept in a file at home",
      "It's left wherever it was put down", "It's uploaded to a drive or app",
      "It stays in the hospital's system only", "It varies every time",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q3.7", section: 3, roles: ["A", "B"], type: "single",
    prompt: "Has anyone in your family made an ABHA number or used a government health app?",
    options: [
      "Yes, and we use it", "Yes, made it once and never opened it again",
      "It was made at a hospital and I'm not sure what it does", "No", "I don't know what that is",
    ].map((l) => ({ id: l, label: l })),
    // T6: only if a digital location was ticked in Q3.2
    visibleWhen: (a) => many(a, "Q3.2").some((x) => DIGITAL_LOC.includes(x)),
  },
  {
    id: "Q3.8", section: 3, roles: ["A", "B", "C"], type: "single",
    prompt: "Is there anything about the family's medical history that only one person remembers — an allergy, an old surgery, a bad reaction to a medicine?",
    options: [
      "Yes, and only I know it", "Yes, and only my mother knows it",
      "Yes, and only the person themselves knows it", "Yes, and only one other family member knows it",
      "No, it's all written down somewhere", "I don't know",
    ].map((l) => ({ id: l, label: l })),
  },

  // ===================== SECTION 4 — THE FAMILY GROUP ======================
  {
    id: "Q4.1", section: 4, roles: ["A", "B", "C"], type: "single",
    prompt: "Have you ever had to scroll far back in a chat to find something medical?",
    options: [
      "Yes, and I found it in under a minute", "Yes, it took several minutes",
      "Yes, it took more than ten minutes", "Yes, and I gave up and asked someone to send it again",
      "No, this hasn't happened",
    ].map((l) => ({ id: l, label: l })),
  },

  // ===================== SECTION 5 — WHEN THE BILL HAS TO BE PAID ==========
  {
    id: "Q5.1", section: 5, roles: ["A", "B"], type: "single",
    prompt: "Has money ever been the reason something medical got delayed?",
    options: [
      { id: "test_postponed", label: "Yes, a test or scan was postponed" },
      { id: "treat_postponed", label: "Yes, a treatment or surgery was postponed" },
      { id: "meds_smaller", label: "Yes, medicines were bought in smaller quantities" },
      { id: "no", label: "No" },
      { id: "prefer_not", label: "Prefer not to say", pinned: true },
    ],
  },
  {
    id: "Q5.2", section: 5, roles: ["A", "B", "C"], type: "single", randomize: true,
    prompt: "The last time a bill had to be paid at a clinic, hospital or chemist, how did the money reach there?",
    options: [
      "Cash handed over in person", "UPI paid by whoever was standing there",
      "Money sent to a family member, who then paid", "Debit or credit card",
      "Bank transfer", "Insurance paid directly (cashless)",
      "Someone outside the household paid", "We borrowed from a relative",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q5.3", section: 5, roles: ["A", "B"], type: "single",
    prompt: "Roughly what did that whole episode cost, including tests, travel and medicines?",
    options: [
      { id: "u2k", label: "Under ₹2,000" }, { id: "2k_10k", label: "₹2,000 – ₹10,000" },
      { id: "10k_50k", label: "₹10,000 – ₹50,000" }, { id: "50k_2l", label: "₹50,000 – ₹2,00,000" },
      { id: "o2l", label: "Over ₹2,00,000" }, { id: "prefer_not", label: "Prefer not to say", pinned: true },
    ],
    // T7: skip only if money never delayed anything AND no bill overrun
    visibleWhen: (a) => one(a, "Q5.1") !== "no" || many(a, "Q2.8").includes("bill_higher"),
  },
  {
    id: "Q5.4", section: 5, roles: ["A", "B", "C"], type: "single", exempt: true,
    prompt: "Can anyone in your family spend on your behalf, or you on theirs, without asking each time?",
    options: [
      "Yes, a proper arrangement exists", "Not formally, but they know my UPI PIN or have my card",
      "Cash is kept at home for this purpose", "No — I've never thought about setting it up",
      "No — I don't know how to set it up", "No — I don't want them spending without me knowing",
      "No — they wouldn't be comfortable using it", "No — it would feel like taking away their independence",
      "No — sending money each time is easy enough",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q5.5", section: 5, roles: ["A", "B"], type: "multi",
    prompt: "Has money ever needed to reach someone urgently and it didn't go smoothly?",
    help: "Select all that apply.",
    options: [
      { id: "limit", label: "The transfer limit was too low" },
      { id: "failed", label: "The payment failed at the counter" },
      { id: "cant_operate", label: "The person couldn't operate the app at their end" },
      { id: "night", label: "It happened at night and nobody was awake to send it" },
      { id: "cash_only", label: "The hospital only accepted cash" },
      { id: "never", label: "This has never happened", pinned: true },
    ],
  },
  {
    id: "Q5.6", section: 5, roles: ["A", "B"], type: "single",
    prompt: "Was insurance involved the last time?",
    options: [
      "Yes, cashless, and it worked", "Yes, but we paid first and claimed later",
      "Yes, and part of it was refused", "We have insurance but didn't use it",
      "A government scheme was used", "No insurance at all", "I don't know whether we have any",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q5.7", section: 5, roles: ["A"], type: "single", exempt: true,
    prompt: "Your parent needs to pay ₹4,000 at a chemist right now and you are in a meeting. What happens?",
    options: [
      "They pay it themselves without any trouble", "They pay from cash kept at home",
      "They wait until I am free", "The chemist lets them take it and settle later",
      "They call someone else in the family", "It simply doesn't get bought that day",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q5.7-C", section: 5, roles: ["C"], type: "single", exempt: true,
    prompt: "You need to pay ₹4,000 at a chemist right now and the person who usually helps is busy. What happens?",
    options: [
      "I pay it myself without any trouble", "I pay from cash kept at home",
      "I wait until they are free", "The chemist lets me take it and settle later",
      "I call someone else in the family", "It simply doesn't get bought that day",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q5.8", section: 5, roles: ["A"], type: "single", exempt: true,
    prompt: "Same situation, but ₹40,000 at a hospital admission counter at 11 at night. What happens?",
    options: [
      "I can transfer it immediately, no limit problem", "I'd hit a transfer limit and have to split it or wait",
      "I'd have to call the bank or use someone else's account", "A relative nearby would pay and we'd settle later",
      "Insurance would handle it", "I don't know what we would do",
    ].map((l) => ({ id: l, label: l })),
  },

  // ===================== SECTION 6 — MEDICINES THAT HAVE TO ARRIVE =========
  {
    id: "Q6.1", section: 6, roles: ["A", "B", "C", "D"], type: "single",
    prompt: "How many people in your family take a medicine every single month without a break?",
    options: [
      { id: "nobody", label: "Nobody" }, { id: "one", label: "One person" },
      { id: "two", label: "Two people" }, { id: "three_plus", label: "Three or more" },
    ],
  },
  {
    id: "Q6.2", section: 6, roles: ["A", "B"], type: "single",
    prompt: "How many years has that been going on?",
    options: ["Under a year", "1–3 years", "3–10 years", "More than 10 years"].map((l) => ({ id: l, label: l })),
    // T8: shown only at "Three or more"
    visibleWhen: (a) => one(a, "Q6.1") === "three_plus",
  },
  {
    id: "Q6.3", section: 6, roles: ["A"], type: "single", randomize: true,
    prompt: "How does the family know when the medicine is about to run out?",
    options: [
      "Someone physically checks the strip or bottle", "Someone keeps the date in their head",
      "A phone reminder or alarm", "Written on a calendar or diary", "The chemist reminds us",
      "An app reminder or automatic refill", "We find out when it finishes",
    ].map((l) => ({ id: l, label: l })),
    visibleWhen: (a) => one(a, "Q6.1") !== "nobody", // T1
  },
  {
    id: "Q6.4", section: 6, roles: ["A"], type: "single",
    prompt: "Who places the order, and who receives it at the door?",
    options: [
      "Same person does both", "I order, someone at their end receives it", "They order, they receive",
      "Someone else orders, they receive", "It's bought in person at a shop, not delivered",
    ].map((l) => ({ id: l, label: l })),
    visibleWhen: (a) => one(a, "Q6.1") !== "nobody", // T1
  },
  {
    id: "Q6.5", section: 6, roles: ["A"], type: "multi",
    prompt: "Where do the medicines usually come from?",
    help: "Select all that apply.",
    options: [
      { id: "local_walkin", label: "Local chemist, walked in" },
      { id: "local_phone", label: "Local chemist, ordered by phone or WhatsApp" },
      { id: "online_pharmacy", label: "Online pharmacy app" },
      { id: "quick_delivery", label: "Quick-delivery app" },
      { id: "hospital_pharmacy", label: "Hospital pharmacy" },
      { id: "sent_family", label: "Sent from another city by a family member" },
    ],
    visibleWhen: (a) => one(a, "Q6.1") !== "nobody", // T1
  },
  {
    id: "Q6.6", section: 6, roles: ["A"], type: "multi",
    prompt: "Has a medicine ever arrived late, wrong, or not at all?",
    help: "Select all that apply.",
    options: [
      { id: "late_no_miss", label: "Delivered late, but no doses were missed" },
      { id: "late_1_2", label: "Delivered late, and doses were missed for a day or two" },
      { id: "late_several", label: "Delivered late, and doses were missed for several days" },
      { id: "late_week", label: "Delivered late, and doses were missed for more than a week" },
      { id: "wrong", label: "Wrong medicine or wrong strength" },
      { id: "cancelled", label: "Out of stock, order cancelled" },
      { id: "never_delivered", label: "Never delivered, no explanation" },
      { id: "prescription", label: "Held up because a prescription was needed" },
      { id: "never", label: "This has never happened", pinned: true },
    ],
    visibleWhen: (a) => one(a, "Q6.1") !== "nobody", // T1
  },
  {
    id: "Q6.7", section: 6, roles: ["A"], type: "single",
    prompt: "When ordering online, does anyone ever call to confirm the prescription before it ships?",
    options: [
      "Yes, and it's fine", "Yes, and it's irritating — they call at odd times",
      "Yes, and orders have been held up because we missed the call", "No, it just gets delivered",
    ].map((l) => ({ id: l, label: l })),
    // T5 via Q6.5 proxy: only if they order online, and only if someone takes monthly meds (T1)
    visibleWhen: (a) =>
      one(a, "Q6.1") !== "nobody" &&
      many(a, "Q6.5").some((x) => x === "online_pharmacy" || x === "quick_delivery"),
  },
  {
    id: "Q6.8", section: 6, roles: ["A", "B", "D"], type: "single", exempt: true,
    prompt: "If the person who normally orders the medicines was travelling for two weeks with no phone, what would happen?",
    options: [
      "Someone else would step in without any problem", "Someone else would manage, but would have to ask a lot of questions",
      "The person taking the medicine would order it themselves", "It would be arranged in advance before leaving",
      "It would probably be missed", "Doesn't apply — nobody in our family takes regular medicine",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q6.9", section: 6, roles: ["A"], type: "single", exempt: true,
    prompt: "Does the person who takes the medicine know how to reorder it themselves?",
    options: [
      "Yes, they do it alone", "They could, but they never do", "No, they can't",
      "I've never checked", "Doesn't apply — nobody in our family takes regular medicine",
    ].map((l) => ({ id: l, label: l })),
  },

  // ===================== SECTION 7 — THE PHONE CALLS ======================
  {
    id: "Q7.1", section: 7, roles: ["A", "B"], type: "single",
    prompt: "How was the last appointment booked, and by whom?",
    options: [
      "I called the clinic", "I booked on an app or website", "A family member called the clinic",
      "A family member booked on an app", "The person who needed it called themselves",
      "The person who needed it booked on an app themselves", "An attendant or domestic staff member called",
      "Through someone we know at the hospital", "Walked in without booking",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q7.2", section: 7, roles: ["A", "B"], type: "single",
    prompt: "Which language does the older person in your family speak to a clinic receptionist in?",
    options: [
      "Their mother tongue, and the receptionist replies in it",
      "Their mother tongue, and the receptionist replies in another language",
      "Hindi", "English", "They don't make these calls themselves",
    ].map((l) => ({ id: l, label: l })),
    visibleWhen: (a) => one(a, "Q1.2") !== "not_applicable", // T2
  },
  {
    id: "Q7.2-C", section: 7, roles: ["C"], type: "single",
    prompt: "Which language do you speak to a clinic receptionist in?",
    options: [
      "My mother tongue, and they reply in it", "My mother tongue, and they reply in another language",
      "Hindi", "English", "I don't make these calls myself",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q7.3", section: 7, roles: ["A", "B"], type: "single",
    prompt: "Have you ever booked through an app and then still had to call?",
    options: [
      "Yes — the slot shown wasn't actually available", "Yes — the booking didn't get confirmed",
      "Yes — the doctor's timing had changed", "Yes — we had to check something the app didn't say",
      "No, the app worked properly", "We never use apps for this",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q7.4", section: 7, roles: ["A", "B"], type: "multi", randomize: true, exempt: true,
    prompt: "When the older person has to call a clinic alone, what usually goes wrong?",
    help: "Select all that apply.",
    options: [
      { id: "busy", label: "They can't get through, the line is busy" },
      { id: "hold", label: "They're put on hold too long and give up" },
      { id: "menu", label: "They can't follow the automated menu" },
      { id: "language", label: "Language problem" },
      { id: "forget", label: "They forget to ask the important thing" },
      { id: "agree", label: "They agree to whatever they're told" },
      { id: "fine", label: "Nothing goes wrong, they manage fine", pinned: true },
      { id: "never_alone", label: "They never call alone", pinned: true },
    ],
  },
  {
    id: "Q7.5", section: 7, roles: ["A"], type: "single",
    prompt: "How much time went into calling, holding and calling back?",
    options: ["Barely any", "15–30 minutes", "An hour or more", "Spread across several days"]
      .map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q7.6", section: 7, roles: ["A", "B"], type: "single", exempt: true,
    prompt: "Have you made a call on someone's behalf while they were sitting right next to you?",
    options: [
      "Yes, because they'd take too long", "Yes, because of the language", "Yes, because they get flustered",
      "Yes, because the clinic responds better to me", "No, they make their own calls",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q7.6-C", section: 7, roles: ["C"], type: "single", exempt: true,
    prompt: "Has someone in your family made a call to a clinic for you while you were sitting right there?",
    options: [
      "Yes, because I'd take too long", "Yes, because of the language", "Yes, because I get flustered",
      "Yes, because the clinic responds better to them", "Yes, and I'd rather they didn't", "No, I make my own calls",
    ].map((l) => ({ id: l, label: l })),
  },

  // ===================== SECTION 8 — GETTING PEOPLE TO AGREE ===============
  {
    id: "Q8.1", section: 8, roles: ["A", "B"], type: "single",
    prompt: "How many reminders does it usually take before an older family member agrees to see a doctor?",
    options: ["They agree the first time", "Two or three reminders", "More than three", "They still haven't agreed"]
      .map((l) => ({ id: l, label: l })),
    visibleWhen: (a) => one(a, "Q1.2") !== "not_applicable", // T2
  },
  {
    id: "Q8.2", section: 8, roles: ["A", "B"], type: "single", randomize: true, exempt: true,
    prompt: "What finally works?",
    options: [
      { id: "firm", label: "Being firm about it" },
      { id: "another", label: "Getting another family member to say the same thing" },
      { id: "book_tell", label: "Booking the appointment and telling them afterwards" },
      { id: "go_with", label: "Going with them physically" },
      { id: "emotional", label: "An emotional appeal" },
      { id: "nothing", label: "Nothing reliably works", pinned: true },
    ],
  },
  {
    id: "Q8.2-C", section: 8, roles: ["C"], type: "single", randomize: true, exempt: true,
    prompt: "When your family wants you to see a doctor and you're not keen, what finally makes you go?",
    options: [
      { id: "firm", label: "They're firm about it" },
      { id: "another", label: "Another family member says the same thing" },
      { id: "book_tell", label: "They book it and tell me afterwards" },
      { id: "go_with", label: "They come with me" },
      { id: "emotional", label: "They make an emotional appeal" },
      { id: "nothing", label: "Nothing really — I go when I decide to", pinned: true },
    ],
  },
  {
    id: "Q8.3", section: 8, roles: ["A", "B", "C"], type: "single",
    prompt: "Is there something medical the family knows is due and keeps postponing?",
    options: [
      { id: "checkup", label: "Yes, a routine check-up" },
      { id: "test", label: "Yes, a specific test or scan" },
      { id: "specialist", label: "Yes, a specialist consultation" },
      { id: "procedure", label: "Yes, a procedure or surgery" },
      { id: "none", label: "No, nothing pending", pinned: true },
    ],
  },
  {
    id: "Q8.4", section: 8, roles: ["A", "B"], type: "single",
    prompt: "Has anyone in the family kept a symptom or a report to themselves?",
    options: [
      "Yes, and we found out later", "Yes, and it caused a delay in treatment",
      "I suspect so, but don't know", "No, everything is shared",
    ].map((l) => ({ id: l, label: l })),
  },

  // ===================== SECTION 9 — BEING ON THE OTHER SIDE (C only) ======
  {
    id: "Q9.1", section: 9, roles: ["C"], type: "single",
    prompt: "When you go to a doctor, who normally comes with you?",
    options: [
      "I go alone", "My son or daughter", "My husband or wife", "Another relative", "A maid, driver or attendant",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q9.2", section: 9, roles: ["C"], type: "single",
    prompt: "During the consultation, who does most of the talking?",
    options: [
      "I do", "The person who came with me", "Both of us equally", "The doctor speaks mainly to them, not to me",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q9.3", section: 9, roles: ["C"], type: "single", exempt: true,
    prompt: "Has a decision about your health ever been taken without asking you?",
    options: [
      "Yes, and I didn't like it", "Yes, and it was fine", "Yes, and I prefer it that way", "No, I'm always asked",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q9.4", section: 9, roles: ["C"], type: "single", exempt: true,
    prompt: "Is there anything you would rather handle yourself, but someone else has taken over?",
    options: [
      "Yes, booking appointments", "Yes, ordering my medicines", "Yes, talking to the doctor",
      "Yes, paying the bills", "No, I'm happy with the arrangement",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q9.5", section: 9, roles: ["C"], type: "single",
    prompt: "Do you know what each of your medicines is for?",
    options: ["All of them", "Most of them", "A few of them", "I just take what I'm given"].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q9.6", section: 9, roles: ["C"], type: "single", exempt: true,
    prompt: "When your children call to ask how you are, what do you usually say?",
    options: [
      "Exactly how I am", "\"I'm fine\" even when I'm not, so they don't worry",
      "\"I'm fine\", because they'd overreact", "\"I'm fine\", because they're already busy",
      "I mention only the big things", "They don't really ask",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q9.7", section: 9, roles: ["C"], type: "single",
    prompt: "If you needed help right now and your usual person didn't pick up, what would you do?",
    options: [
      "Call someone else in the family", "Call a neighbour", "Go to the local doctor or chemist myself",
      "Wait until they call back", "I wouldn't know what to do",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q9.8", section: 9, roles: ["C"], type: "multi", exempt: true,
    prompt: "What do you find hardest about phones and apps?",
    help: "Select all that apply.",
    options: [
      { id: "small", label: "The letters are too small" },
      { id: "which_button", label: "I don't know which button to press" },
      { id: "afraid", label: "I'm afraid of pressing something wrong" },
      { id: "language", label: "It's not in my language" },
      { id: "passwords_otps", label: "Passwords and OTPs" },
      { id: "nothing", label: "Nothing, I manage fine", pinned: true },
    ],
  },
  {
    id: "Q9.9", section: 9, roles: ["C"], type: "single",
    prompt: "Has anyone ever called and asked you for an OTP?",
    options: [
      "Yes, and I gave it", "Yes, and I refused", "Yes, and I called my son or daughter first",
      "No, this hasn't happened", "I don't know what an OTP is",
    ].map((l) => ({ id: l, label: l })),
    // T9
    visibleWhen: (a) => many(a, "Q9.8").includes("passwords_otps"),
  },

  // ===================== SECTION 10 — WHAT YOU USE TODAY ===================
  {
    id: "Q10.1", section: 10, roles: ["A", "B", "C"], type: "matrix", randomizeWithinGroups: true,
    prompt: "For each of these, tick what applies.",
    cols: COLS_USE,
    rows: [
      { id: "r_wa_family", label: "WhatsApp chats with family", group: "storage" },
      { id: "r_wa_doctor", label: "WhatsApp directly with a doctor", group: "storage" },
      { id: "r_folder", label: "A proper file or folder at home", group: "storage" },
      { id: "r_loose", label: "Loose papers, no folder", group: "storage" },
      { id: "r_photos", label: "Photos in the phone gallery", group: "storage" },
      { id: "r_drive", label: "Google Drive or email to myself", group: "storage" },
      { id: "r_notes", label: "Notes app or a written diary", group: "storage" },
      { id: "r_calendar", label: "Calendar reminders", group: "storage" },
      { id: "r_1mg", label: "Tata 1mg", group: "pharmacy" },
      { id: "r_pharmeasy", label: "PharmEasy", group: "pharmacy" },
      { id: "r_apollo", label: "Apollo 24/7", group: "pharmacy" },
      { id: "r_netmeds", label: "Netmeds", group: "pharmacy" },
      { id: "r_quick", label: "Zepto / Blinkit / Instamart", group: "pharmacy" },
      { id: "r_practo", label: "Practo or a similar booking app", group: "booking" },
      { id: "r_hospapp", label: "A hospital's own app or portal", group: "booking" },
      { id: "r_abha", label: "ABHA or a government health app", group: "booking" },
      { id: "r_insurance", label: "The insurance company's app", group: "booking" },
      { id: "r_eldercare", label: "A paid elder-care service", group: "service" },
      { id: "r_chemist", label: "A local chemist who knows the family", group: "service" },
    ],
    options: [{ id: "nothing", label: "Nothing at all — there's no system", clearsMatrix: true }],
  },
  {
    id: "Q10.2", section: 10, roles: ["A", "B"], type: "single", randomize: true, pipedPerStopped: "Q10.1",
    prompt: "Why did you stop?",
    options: [
      "Too much effort to keep updating", "It didn't have what I needed",
      "It kept sending unnecessary notifications", "The older person couldn't use it",
      "It was slower than just calling", "I forgot it existed",
    ].map((l) => ({ id: l, label: l })),
    // T4: at least one row marked "tried and stopped"
    visibleWhen: (a) => hasCol(a, "Q10.1", "stopped"),
  },
  {
    id: "Q10.3", section: 10, roles: ["A", "B"], type: "multi",
    prompt: "Which of these does the older person in your family use on their own, without help?",
    help: "Select all that apply.",
    options: [
      { id: "whatsapp", label: "WhatsApp" }, { id: "calls", label: "Phone calls" },
      { id: "med_app", label: "A medicine ordering app" }, { id: "hosp_app", label: "A hospital app" },
      { id: "upi", label: "UPI or a payment app" },
      { id: "none", label: "None of these", pinned: true },
      { id: "no_smartphone", label: "They don't use a smartphone", pinned: true },
    ],
    visibleWhen: (a) => one(a, "Q1.2") !== "not_applicable", // T2
  },

  // ===================== SECTION 11 — PAID HELP (A/B) =====================
  {
    id: "Q11.1", section: 11, roles: ["A", "B"], type: "single",
    prompt: "Have you come across services where someone is paid to check on elderly parents or take them to appointments?",
    options: [
      "Never heard of them", "Heard of them, never considered it", "Considered it — too expensive",
      "Considered it — didn't trust an outsider with the family", "Considered it — the parents refused",
      "Considered it — not available in their city", "Tried one and stopped — it didn't actually reduce my work",
      "Tried one and stopped — too expensive", "Currently paying for one",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q11.2", section: 11, roles: ["A"], type: "single",
    prompt: "Is there someone you already pay who ends up helping with health matters?",
    options: [
      { id: "maid", label: "Yes, the maid or cook" }, { id: "driver", label: "Yes, the driver" },
      { id: "attendant", label: "Yes, a full-time attendant" },
      { id: "neighbour", label: "Yes, a neighbour we compensate informally" },
      { id: "no", label: "No", pinned: true },
    ],
  },
  {
    id: "Q11.3", section: 11, roles: ["A"], type: "single", randomize: true,
    prompt: "If a service handled every appointment, refill and report for the family, what would you need before trusting it?",
    options: [
      { id: "see", label: "Seeing exactly what it did each time" },
      { id: "approve_money", label: "Being able to approve anything involving money" },
      { id: "parents_agree", label: "My parents agreeing to it first" },
      { id: "real_person", label: "A real person I could call when it went wrong" },
      { id: "recommendation", label: "A recommendation from someone I know" },
      { id: "never", label: "I wouldn't hand this over at all", pinned: true },
    ],
  },

  // ===================== SECTION 12 — WHEN THE USUAL PERSON ISN'T THERE ====
  {
    id: "Q12.1", section: 12, roles: ["A", "B", "C", "D"], type: "single", exempt: true,
    prompt: "If the person who normally handles all this were unreachable for a week, who would take over?",
    options: [
      { id: "sibling", label: "My brother or sister" }, { id: "spouse", label: "My husband or wife" },
      { id: "self", label: "The person themselves would manage" }, { id: "relative", label: "A relative living nearby" },
      { id: "nobody", label: "Nobody — it would simply wait" }, { id: "dont_know", label: "I don't know", pinned: true },
    ],
  },
  {
    id: "Q12.2", section: 12, roles: ["A", "B", "D"], type: "multi", exempt: true,
    prompt: "If they took over tomorrow, what would they already know?",
    help: "Select all that apply.",
    options: [
      { id: "reports", label: "Where the reports are kept" }, { id: "doctor", label: "Which doctor to call" },
      { id: "problems", label: "What the ongoing problems are" }, { id: "meds", label: "What medicines are being taken" },
      { id: "insurance", label: "Which insurance we have" },
      { id: "none", label: "None of it — they'd have to be told everything from the start", pinned: true },
    ],
  },
  {
    id: "Q12.3", section: 12, roles: ["A", "B"], type: "single",
    prompt: "Has this actually happened?",
    options: [
      "Yes, and it went fine", "Yes, and things got delayed", "Yes, and something was missed", "No, it hasn't come up",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q12.4", section: 12, roles: ["A", "B"], type: "single",
    prompt: "Has handling this ever cost you at work or in your studies?",
    options: [
      "No", "Occasional leave or late arrival", "Regular disruption to my week",
      "I turned down or delayed something because of it", "I changed or left a job or a course",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q12.5", section: 12, roles: ["A", "B"], type: "single", randomize: true, exempt: true,
    prompt: "When you're not thinking about anything in particular, is there something about the family's health sitting at the back of your mind?",
    options: [
      { id: "missed", label: "That something is being missed without anyone noticing" },
      { id: "unreachable", label: "That I won't be reachable when it matters" },
      { id: "not_telling", label: "That they aren't telling me everything" },
      { id: "money", label: "Money, if something big happens" },
      { id: "not_there", label: "That I'm not physically there" },
      { id: "nothing", label: "Nothing in particular", pinned: true },
    ],
  },
  {
    id: "Q12.6", section: 12, roles: ["D"], type: "single", randomize: true,
    prompt: "Why is it that person and not you?",
    options: [
      { id: "closer", label: "They live closer" }, { id: "better", label: "They're better at it" },
      { id: "took_on", label: "They took it on and it stayed that way" },
      { id: "work", label: "My work doesn't allow it" },
      { id: "parents_prefer", label: "The parents prefer dealing with them" },
      { id: "just_happened", label: "Nobody ever decided, it just happened", pinned: true },
    ],
  },

  // ===================== SECTION 13 — COULD SOMETHING ELSE DO THIS? ========
  {
    id: "Q13.1", section: 13, roles: ["A", "B"], type: "single", randomize: true,
    prompt: "Something could call the clinic for you, wait through the hold music, and ring you only once a person picked up. Would you use it?",
    options: [
      "Yes — it would save the most annoying part",
      "Only for routine bookings; I'd worry it would say the wrong thing on anything serious",
      "Only if I could listen in", "No — I'd rather hear the tone of the reply myself",
      "No — the clinic wouldn't take it seriously", "No — I don't make many such calls anyway",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q13.2", section: 13, roles: ["A", "B"], type: "single",
    prompt: "Something notices your father's tablets will finish in four days and orders them without asking you. Relief or worry?",
    options: [
      "Complete relief", "Relief, if it tells me afterwards", "Relief, only if it asks me first",
      "Worry — it might order the wrong thing", "Worry — I want to be the one deciding",
    ].map((l) => ({ id: l, label: l })),
    visibleWhen: (a) => one(a, "Q6.1") !== "nobody", // T1
  },
  {
    id: "Q13.3", section: 13, roles: ["A", "B"], type: "single", randomize: true, exempt: true,
    prompt: "Your mother asks a question out loud in her own language and it reads her last report back to her. Would she do it?",
    options: [
      "Yes, she'd use it herself — she's comfortable with her phone",
      "She'd try once and then call me anyway — she'd rather hear it from a person",
      "She'd try once and then call me anyway — she wants the excuse to call me",
      "She'd still just call me — she wouldn't trust the answer",
      "She wouldn't try at all — she'd be afraid of doing something wrong",
      "She doesn't need this — she reads them herself",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q13.4", section: 13, roles: ["A"], type: "single",
    prompt: "Something could pay a chemist bill up to ₹5,000 on your behalf without disturbing you, and ask you for anything larger. Would you switch it on?",
    options: [
      { id: "yes_right", label: "Yes, ₹5,000 is about right" },
      { id: "yes_lower", label: "Yes, but at a lower limit" },
      { id: "yes_higher", label: "Yes, and I'd want a higher limit" },
      { id: "only_chemist", label: "Only for the chemist, nothing else" },
      { id: "no", label: "No", pinned: true },
    ],
  },
  {
    id: "Q13.5", section: 13, roles: ["A", "B", "C"], type: "single",
    prompt: "Something keeps a running record of every visit, medicine and report for the whole family. Who should be allowed to see it?",
    options: [
      { id: "only_me", label: "Only me" }, { id: "me_person", label: "Me and the person it's about" },
      { id: "all_adults", label: "All the adults in the family" },
      { id: "whoever", label: "Whoever is handling things at that moment" },
      { id: "nobody", label: "Nobody — I wouldn't want this to exist", pinned: true },
    ],
  },
  {
    id: "Q13.6", section: 13, roles: ["A", "B"], type: "single", exempt: true,
    prompt: "Something tells you your mother hasn't taken her evening tablet for three days. Would you want to know?",
    options: [
      "Yes, immediately", "Yes, but she should be told first", "Only if it goes on longer than that", "No, that's her business",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q13.7", section: 13, roles: ["C"], type: "single", exempt: true,
    prompt: "If a machine called you in your own language to remind you about your tablets, would you pick up?",
    options: [
      "Yes, every time", "Once or twice, then I'd ignore it", "No, I'd rather my family called", "I don't need reminding",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q13.8", section: 13, roles: ["C"], type: "single", exempt: true,
    prompt: "Would you rather a machine handled these things, or your children?",
    options: [
      "The machine — my children are busy", "The machine, but my children should know what it did",
      "My children — I'd rather it stayed personal", "I'd rather handle it myself",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q13.9", section: 13, roles: ["A", "B", "C"], type: "single", randomize: true,
    prompt: "What is the one thing here you would never let something else do for you?",
    options: [
      { id: "talk_doctor", label: "Talk to the doctor" }, { id: "decide", label: "Decide on a treatment" },
      { id: "spend", label: "Spend money" }, { id: "share", label: "Share reports with anyone" },
      { id: "bad_news", label: "Tell my parent bad news" }, { id: "order_meds", label: "Order medicines" },
      { id: "all_ok", label: "I'd be comfortable with all of it", pinned: true },
    ],
  },

  // ===================== SECTION 14 — WHAT WENT WRONG, AND WHY =============
  {
    id: "Q14.1", section: 14, roles: ["A", "B", "C", "D"], type: "single", randomize: true,
    prompt: "Of everything you've described, what was the single worst part?",
    options: [
      { id: "reports", label: "Not being able to find old reports" },
      { id: "appointment", label: "Not getting an appointment in time" },
      { id: "repeat", label: "Repeating the same information again and again" },
      { id: "agree", label: "Getting the person to agree to go" },
      { id: "meds", label: "Medicines not reaching in time" },
      { id: "money", label: "Arranging the money" },
      { id: "not_there", label: "Not being there physically" },
      { id: "missed", label: "Not knowing whether something was being missed" },
    ],
  },
  {
    id: "Q14.2", section: 14, roles: ["A", "B"], type: "single", randomize: true, pipeFrom: "Q14.1",
    prompt: "Why did that happen?",
    options: [
      "Nobody had kept it in order beforehand", "Only one person knows how it all works",
      "The people we needed were hard to reach", "The person it concerns doesn't cooperate",
      "We were doing it at the last minute", "The system at the hospital or app didn't work as promised",
      "We were in different cities",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q14.3", section: 14, roles: ["A", "B"], type: "single", randomize: true,
    prompt: "And behind that, what's the underlying reason?",
    options: [
      { id: "no_job", label: "Nobody was ever given the job, so it fell to one person" },
      { id: "reactive", label: "We only deal with health when something goes wrong" },
      { id: "wont_use", label: "The older generation won't use the tools that would help" },
      { id: "someone_free", label: "Everything depends on someone being free at that exact moment" },
      { id: "no_one_place", label: "There's no one place where the family's health information lives" },
      { id: "distance", label: "Distance makes everything slower" },
      { id: "dont_know", label: "Honestly, I don't know", pinned: true },
    ],
  },
  {
    id: "Q14.4", section: 14, roles: ["A", "B"], type: "single",
    prompt: "If the exact same thing happened next month, would it go differently?",
    options: [
      "Yes, we've fixed it since", "Slightly better, we'd be faster", "No, exactly the same", "Probably worse",
    ].map((l) => ({ id: l, label: l })),
  },
  {
    id: "Q14.5", section: 14, roles: ["A", "B", "C", "D"], type: "text", optional: true,
    prompt: "If you want to describe that worst moment in your own words, write it here. Two or three lines is plenty.",
    help: "Optional.",
  },

  // ===================== SECTION 15 — CLOSING ==============================
  {
    id: "Q15.1", section: 15, roles: ["A", "B", "C", "D"], type: "single",
    prompt: "Would you be willing to answer a few follow-up questions if needed?",
    options: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }],
  },
  {
    id: "Q15.1c", section: 15, roles: ["A", "B", "C", "D"], type: "text", optional: true,
    prompt: "How can we reach you? (email or phone)",
    visibleWhen: (a) => one(a, "Q15.1") === "yes",
  },
];

// Stable, ordered list of every question id — used as the sheet header order.
export const ALL_QIDS = QUESTIONS.map((q) => q.id);

export const QBYID: Record<string, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

export const CONSENT_TEXT =
  "Your answers may be quoted in a public competition submission. If quoted, only your age range and your city will appear — never your name, never your family's name, never your doctor or hospital. You can close this form at any time.";
