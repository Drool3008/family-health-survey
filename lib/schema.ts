// Question schema for the 22-question Family Health survey (family-health-survey-20.md).
// Same form for every respondent — no roles, no branching. Randomization + pins per B.5.

export type QType = "single" | "multi" | "dropdown" | "text";
export type Answers = Record<string, any>;

export interface Opt {
  id: string;
  label: string;
  pinned?: boolean; // keep last when options are randomized (None / Nobody / I don't know)
}

export interface Question {
  id: string;
  type: QType;
  prompt: string;
  help?: string;
  options?: Opt[];
  randomize?: boolean;
  optional?: boolean;
  noProgress?: boolean; // hide the progress bar on this question's screen (peak Q10–12, attention check)
  attention?: string; // marks the attention check; value = the correct option id
}

// plain label -> option (id === label; option ids are only storage keys now)
const O = (label: string, pinned?: boolean): Opt => ({ id: label, label, pinned });

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata",
  "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik",
  "Faridabad", "Meerut", "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad",
  "Amritsar", "Allahabad", "Ranchi", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada",
  "Jodhpur", "Madurai", "Raipur", "Kota", "Chandigarh", "Guwahati", "Solapur",
  "Mysuru", "Kochi", "Thiruvananthapuram", "Dehradun", "Noida", "Gurugram",
];

export const QUESTIONS: Question[] = [
  // ---- About you (family code captured separately by the code gate) ----
  {
    id: "age", type: "single", prompt: "Your age",
    options: ["18–24", "25–34", "35–44", "45–54", "55–64", "65–74", "75+"].map((l) => O(l)),
  },
  {
    id: "city", type: "dropdown", prompt: "Your city",
    options: [...INDIAN_CITIES, "Outside India"].map((l) => O(l)),
  },
  {
    id: "gender", type: "single", prompt: "Your gender",
    options: ["Female", "Male", "Prefer not to say"].map((l) => O(l)),
  },

  // ---- The 22 questions ----
  {
    id: "Q1", type: "single",
    prompt: "In your family, who arranges doctor visits, medicines and reports for the others?",
    options: [
      O("I do"), O("My mother"), O("My father"), O("My son or daughter"),
      O("My brother or sister"), O("My husband or wife"),
      O("Nobody — each person does their own", true),
    ],
  },
  {
    id: "Q2", type: "single",
    prompt: "That person, and the oldest person in the family who needs care — where do they live?",
    options: [
      O("In the same house"), O("Same city, different house"), O("Different city, same state"),
      O("Different state"), O("One of them is outside India"),
    ],
  },
  {
    id: "Q3", type: "single",
    prompt: "How many people in your family take a medicine every month without missing a month?",
    options: [O("Nobody"), O("One person"), O("Two people"), O("Three or more")],
  },
  {
    id: "Q4", type: "single", randomize: true,
    prompt: "Think of the last time someone in your family had to see a doctor. What started it?",
    options: [
      O("The person said they were feeling unwell"),
      O("Someone else in the family noticed something"),
      O("A test result came back and needed checking"),
      O("The medicine was finishing and a prescription was needed"),
      O("The doctor had asked them to come back on a date"),
      O("It was a sudden emergency"),
    ],
  },
  {
    id: "Q5", type: "single",
    prompt: "That time — how many days passed between knowing and actually seeing the doctor?",
    options: [
      O("The same day"), O("1 to 2 days"), O("3 to 7 days"), O("More than a week"),
      O("More than a month"), O("It still has not happened"),
    ],
  },
  {
    id: "Q6", type: "single", randomize: true,
    prompt: "A doctor asks you today for the oldest person's last blood test report. What is the first thing you would do?",
    options: [
      O("Scroll through the photos in my phone"),
      O("Search for it in a WhatsApp chat"),
      O("Open a folder in email or Google Drive"),
      O("Go to a file or almirah at home"),
      O("Phone someone at home and ask them to look for it"),
      O("Ask the hospital or lab for another copy"),
      O("Get the test done again — that would be faster"),
    ],
  },
  {
    id: "Q7", type: "single",
    prompt: "To collect all the reports of one person, how many different places would you have to look?",
    options: [
      O("One place, everything is together"), O("Two places"), O("Three places"),
      O("Four or more"), O("I would not be able to collect all of it"),
    ],
  },
  {
    id: "Q8", type: "single",
    prompt: "Apart from the person who arranges things, who else could find that report without phoning them?",
    options: [
      O("Anyone in the family could"), O("One other person could"),
      O("Only the person whose report it is"),
      O("Nobody — everyone would have to phone that one person", true),
    ],
  },
  {
    id: "Q9", type: "single",
    prompt: "If that person could not be reached for one full week, what would happen to the medicines and appointments?",
    options: [
      O("Someone else would take over easily"),
      O("Someone else would manage, but would have to ask a lot of questions"),
      O("The person who needs the medicine would handle it themselves"),
      O("It would be arranged in advance before they left"),
      O("Something would be missed"),
    ],
  },
  {
    id: "Q10", type: "single", noProgress: true,
    prompt: "When the oldest person in the family sits with a doctor, who does most of the talking?",
    options: [
      O("They do"), O("Their son or daughter"), O("Their husband or wife"),
      O("The doctor talks mainly to whoever came along, not to them"),
      O("They go alone, so only they talk"),
    ],
  },
  {
    id: "Q11", type: "single", noProgress: true,
    prompt: "Has a decision about someone's health been taken without asking that person first?",
    options: [
      O("Yes, and that person did not like it"), O("Yes, and that person was fine with it"),
      O("Yes, and that person prefers it that way"), O("No, the person is always asked"),
      O("I don't know", true),
    ],
  },
  {
    id: "Q12", type: "single", noProgress: true,
    prompt: "Does anyone in your family keep health problems to themselves instead of telling the others?",
    options: [
      O("Yes, so that the others do not worry"), O("Yes, because the others are busy"),
      O("Yes, because the others would make too much of it"),
      O("I think so, but I am not certain"), O("No, everything gets told"),
    ],
  },
  {
    id: "Q13", type: "single", randomize: true,
    prompt: "When you are not busy with anything, does something about the family's health stay in your mind?",
    options: [
      O("Yes — that something is being missed and nobody has noticed"),
      O("Yes — that I will not be reachable when I am needed"),
      O("Yes — that I am not being told everything"),
      O("Yes — money, if something big happens"),
      O("Yes — that I am not there in person"),
      O("No, nothing stays in my mind", true),
    ],
  },
  {
    id: "Q14", type: "single",
    prompt: "The last time a bill had to be paid at a clinic, hospital or chemist, how did the money get there?",
    options: [
      O("Cash, handed over on the spot"), O("UPI, paid by whoever was standing there"),
      O("Money was sent to a family member, who then paid"), O("Card"),
      O("Insurance paid the hospital directly"), O("Someone outside the household paid"),
    ],
  },
  {
    id: "Q15", type: "single",
    prompt: "The chemist needs ₹4,000 right now, and the person who arranges things is in a meeting. What happens?",
    options: [
      O("The person at the shop pays it themselves, no problem"),
      O("They pay from cash kept at home"), O("They wait until the meeting is over"),
      O("The chemist gives the medicine and takes money later"),
      O("They phone someone else in the family"), O("The medicine does not get bought that day"),
    ],
  },
  {
    id: "attn", type: "single", noProgress: true, attention: "Twice",
    prompt: "This question checks that the page has loaded correctly. Please choose “Twice”.",
    options: [O("Once"), O("Twice"), O("Three times"), O("Not at all")],
  },
  {
    id: "Q16", type: "single", randomize: true,
    prompt: "How does your family know a monthly medicine is about to finish?",
    options: [
      O("Someone opens the box and counts what is left"), O("Someone keeps the date in their head"),
      O("A reminder on a phone"), O("The chemist tells us"), O("An app orders it automatically"),
      O("We find out on the day it finishes"),
    ],
  },
  {
    id: "Q17", type: "single", randomize: true,
    prompt: "When the oldest person in the family phones a clinic on their own, what usually happens?",
    options: [
      O("They get through and it is done"), O("Nobody picks up, or the line stays busy"),
      O("They are kept on hold and put the phone down"),
      O("They cannot follow the recorded menu of options"),
      O("The person at the clinic speaks a language they are not comfortable in"),
      O("They forget to ask the main thing"),
      O("They never phone a clinic on their own", true),
    ],
  },
  {
    id: "Q18", type: "multi",
    prompt: "Which of these does your family actually use for health matters?",
    help: "Select all that apply.",
    options: [
      O("WhatsApp messages between family members"), O("WhatsApp directly with a doctor"),
      O("Phone calls only"), O("A file or folder kept at home"),
      O("Loose papers in a drawer or almirah"), O("Photos in a phone"),
      O("Google Drive or email"), O("A medicine app — 1mg, PharmEasy, Apollo, Netmeds, Zeno"),
      O("Zepto, Blinkit or Instamart"), O("A hospital's own app"),
      O("ABHA or a government health app"), O("A paid service that looks after elderly parents"),
      O("The local chemist, who knows the family"),
      O("Nothing — there is no system", true),
    ],
  },
  {
    id: "Q19", type: "multi", randomize: true,
    prompt: "Which of these would you be willing to let a phone service do on its own, without asking you each time?",
    help: "Select all that apply.",
    options: [
      O("Phone the clinic, wait on hold, and ring you only when a person picks up"),
      O("Order the monthly medicine when it is about to finish"),
      O("Read out the last report aloud, in the language the person is comfortable in"),
      O("Pay a chemist bill up to ₹5,000"),
      O("Send old reports to a doctor when the doctor asks for them"),
      O("Tell you if a tablet has not been taken for three days"),
      O("None of these — I would want to be asked every time", true),
    ],
  },
  {
    id: "Q20", type: "single", randomize: true,
    prompt: "Imagine you had one wish, and one of these jobs was taken off your family completely — done from beginning to end, correctly, every time, without anyone having to check on it. Which one would you hand over?",
    options: [
      O("Keeping every report of every family member in order and ready when a doctor asks"),
      O("Getting appointments — finding the slot, booking it, and confirming it is real"),
      O("Making sure the monthly medicines never run out"),
      O("Reminding the older people and getting them to actually go for check-ups"),
      O("Handling the money — bills, chemist payments and insurance claims"),
      O("Telling the doctor the full history, so nobody has to repeat it again"),
      O("I would not hand over any of these", true),
    ],
  },
  {
    id: "Q21", type: "multi", randomize: true,
    prompt: "Same wish, but this time it works directly with the oldest person in your family, without going through you. Which of these would you be willing to let it do with them?",
    help: "Select all that apply.",
    options: [
      O("Phone them in their own language and remind them about a tablet"),
      O("Read their report out to them when they ask for it"),
      O("Book their appointment after checking with them, not with you"),
      O("Let them order their own medicine by just speaking to it"),
      O("Let them pay a chemist up to ₹2,000 through it"),
      O("Answer their health questions when they cannot reach you"),
      O("Nothing — anything to do with their health should come through me first", true),
    ],
  },
  {
    id: "Q22", type: "single", randomize: true,
    prompt: "If one thing about all of this could be different, what would you pick?",
    options: [
      O("All the reports in one place, found in a few seconds"),
      O("Appointment times that are actually available when shown"),
      O("Medicine that arrives without anyone chasing it"),
      O("Not being the only person who knows everything"),
      O("The older people agreeing without being asked ten times"),
      O("Not having to tell the same story to every new person"),
      O("Being able to sort it out from another city"),
    ],
  },

  // ---- Optional free text + follow-up ----
  {
    id: "worst_text", type: "text", optional: true,
    prompt: "If you want to describe the worst part of that experience in your own words, write two or three lines here.",
    help: "Optional — you may skip this.",
  },
  {
    id: "followup", type: "single",
    prompt: "Would you answer a few more questions later if needed?",
    options: [O("Yes"), O("No")],
  },
];

export const QBYID: Record<string, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
export const ALL_QIDS = QUESTIONS.map((q) => q.id);

export const CONSENT_TEXT =
  "Your answers may be used in a public competition entry. If anything is quoted, only your age range and your city will be shown. Your name, your family's name and your doctor's name will never appear.";
