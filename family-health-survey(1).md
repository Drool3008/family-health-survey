# Family Health Coordination — Survey

**Study:** Managing the family's health — The Ken Case Competition 2026
**Mode:** Self-hosted web form, self-administered. No interviewer present.
**Sample:** 5 families × up to 4 members each (~20 respondents)
**Design:** Every question is closed-ended with options. 5W1H sits underneath and is never named. The three rails (money, delivery, calls) are asked about as ordinary daily events, never as categories.

---

## PART A — HOW TO FIELD THIS

### A.1 Setup

1. **Assign each family a code** — F1 through F5. Send every member of that family the same code. Q0.1 captures it. Without this, cross-member comparison is impossible and the whole design collapses.
2. **Send to each member separately**, not to the family group. If they fill it together you get one sanitised story instead of four accounts.
3. **Force a response** on every question except those marked optional.
4. **Randomise option order** where marked `[RANDOMISE]`. Keep "Other", "None of these" and "Don't know" pinned last.
5. **Do not label sections** in the live form. Section headings here are for your build only. Respondents see a continuous flow.

### A.2 Four forms, not one

Q0.4 routes each respondent to a distinct form. Do not build this as a single form with show/hide rules — a peripheral family member answers "I don't know" through four whole sections by definition of being peripheral, and that isn't data, it's fifteen minutes of noise that costs you their completion.

| Role | Who they are | Questions | Time |
|---|---|---|---|
| **A** | Primary coordinator | 72 core, up to 78 | 15–18 min |
| **B** | Secondary helper | 57 core, up to 61 | 12–14 min |
| **C** | Care recipient | 40 core, up to 41 | 9–11 min |
| **D** | Peripheral member | 22 core, up to 23 | 5–6 min |

90 distinct questions across the four forms (94 items counting the four role-mirrored variants, marked `-C`). A full 4-member family produces roughly 197 answers.

### A.3 Trigger rules

| # | Fires when | Effect |
|---|---|---|
| T1 | Q6.1 = "Nobody" | Skip Q6.2, Q6.3, Q6.4, Q6.5, Q6.6, Q6.7, Q13.2 |
| T2 | Q1.2 = "Not applicable" | Skip Q1.3, Q1.4, Q3.3, Q7.2, Q8.1, Q10.3 |
| T3 | Q1.2 ≠ different state / outside India | Skip Q1.3 |
| T4 | Q10.1 has no "tried and stopped" | Skip Q10.2 |
| T5 | Q10.1 shows no online pharmacy | Skip Q6.7 |
| T6 | Q3.2 has no digital location | Skip Q3.7 |
| T7 | Q5.1 = "No" **and** Q2.8 has no bill overrun | Skip Q5.3 |
| T8 | Q6.1 = "Three or more" | **Show** Q6.2 |
| T9 | Q9.8 includes "Passwords and OTPs" | **Show** Q9.9 |

**Trigger questions must be answered before what they gate.** Q1.2, Q2.8, Q3.2, Q5.1, Q6.1, Q9.8 and Q10.1 all sit upstream of a rule. Q5.1 in particular has been placed at the top of its section for this reason — moving it back to a natural-feeling position at the end of Section 5 breaks T7 silently.

### A.4 Branch-exempt questions — never skip these

Every question named in the contradiction table (D.4) is exempt from all trigger rules. If a trigger gates one side out, that comparison returns nothing and you will not notice until you are building the summary sheet the week of the deadline.

`Q3.4` `Q5.4` `Q5.7` `Q5.7-C` `Q5.8` `Q6.8` `Q6.9` `Q7.4` `Q7.6` `Q7.6-C` `Q8.2` `Q8.2-C` `Q9.3` `Q9.4` `Q9.6` `Q9.8` `Q12.1` `Q12.2` `Q12.5` `Q13.3` `Q13.6` `Q13.7` `Q13.8`

Four of these need explicit handling because a trigger would otherwise catch them:

- **T1 must not skip Q6.8 or Q6.9** even when nobody in the family takes monthly medicine. Both carry contradiction pairs. Each has a "doesn't apply to us" option so you can tell a real answer from a gated one.
- **T2 must not skip Q7.4 or Q13.3.**

### A.5 Cap the form at 78 questions

Trigger rules fire on *absence*, so the shortest form goes to the family with the least going on — and the longest to the coordinator with three people on chronic medication and a parent living alone in another state. That person is your best respondent, and the one whose answers make the contradiction analysis fire. If a Role A path exceeds 78 questions, drop in this order: Q6.2, Q3.7, Q5.3, Q13.2, Q4.1.

### A.6 Build notes

- **Progress indicator:** step-based ("Part 4 of 12"), never a percentage. A bar that jumps forward after a negative answer teaches people that "Nobody" and "Never" are shorter, and the rest of the form gets flattened.
- **Save and resume**, keyed to family code plus email. This matters most for Role C, who is usually the oldest respondent and the one you can least afford to lose halfway.
- **Log `time_on_question` server-side** for every item. This is your data-quality check — see D.3.

---

## PART B — THE FORMS

Role tags: **[A] [B] [C] [D]**. Conditional questions carry their trigger, e.g. **[T3]**. Questions that must never be skipped carry **[EXEMPT]**.

---

## SECTION 0 — CONSENT AND ROUTING · all roles

**Consent (checkbox, required)**

> Your answers may be quoted in a public competition submission. If quoted, only your age range and your city will appear — never your name, never your family's name, never your doctor or hospital. You can close this form at any time.

- [ ] I agree
- [ ] I do not agree *(→ end survey)*

**Q0.1 — Family code** *(given to you along with this link)* · **[A][B][C][D]**
- [ ] F1  - [ ] F2  - [ ] F3  - [ ] F4  - [ ] F5

**Q0.2 — Your age** · **[A][B][C][D]**
- [ ] 18–24  - [ ] 25–34  - [ ] 35–44  - [ ] 45–54  - [ ] 55–64  - [ ] 65–74  - [ ] 75 or above

**Q0.3 — Your city** · **[A][B][C][D]**
- [ ] *(dropdown of Indian cities + "Outside India")*

**Q0.4 — Which of these is closest to your position in the family? [ROUTING]** · **[A][B][C][D]**
- [ ] I am usually the one who arranges doctors, medicines and reports for others → **ROLE A**
- [ ] I help with it, but someone else takes the lead → **ROLE B**
- [ ] Others mostly arrange these things for me → **ROLE C**
- [ ] I am part of the family but rarely involved in any of this → **ROLE D**

**Q0.5 — Your gender** · **[A][B][C][D]**
- [ ] Female  - [ ] Male  - [ ] Prefer not to say  - [ ] Other

> Context only. With roughly five Role A respondents there is no gender finding to report; do not build a segment on it.

---

## SECTION 1 — WHO IS IN THIS FAMILY

**Q1.1 — Who lives in your house right now? [SELECT ALL]** · **[A][B][C][D]**
- [ ] I live alone
- [ ] Husband / wife
- [ ] Children under 18
- [ ] Adult children
- [ ] My parents
- [ ] My in-laws
- [ ] Grandparents
- [ ] Brother / sister
- [ ] Other relatives
- [ ] Domestic help who stays in the house

**Q1.2 — The older family members whose health you are most involved with — where do they live?** · **[A][B][D]** · *TRIGGERS T2, T3*
- [ ] In the same house as me
- [ ] Same city, different house
- [ ] Different city, same state
- [ ] Different state
- [ ] Outside India
- [ ] Not applicable — no older family members I'm involved with

**Q1.3 — How long does it take you to physically reach them?** · **[A][B][D]** · **[T3]**
- [ ] Under 4 hours by road
- [ ] A flight or an overnight train
- [ ] More than a day

**Q1.4 — Do the older members of the family live on their own?** · **[A][B][D]** · **[T2]**
- [ ] They live with children or grandchildren
- [ ] Husband and wife only, no children in the house
- [ ] One person, living alone
- [ ] Living alone with a paid attendant or maid

**Q1.5 — When someone in your family suddenly falls seriously ill, whose phone rings first?** · **[A][B][C][D]**
- [ ] Mine
- [ ] My mother's
- [ ] My father's
- [ ] My brother's or sister's
- [ ] My husband's or wife's
- [ ] A relative who lives nearby
- [ ] A neighbour or family friend
- [ ] The family doctor's
- [ ] Nobody's — the person handles it themselves

---

## SECTION 2 — THE LAST TIME IT HAPPENED

> *Form text: Think of the most recent time someone in your family needed a doctor, a test, or a hospital. Keep that one occasion in mind for the next few questions.*

**Q2.1 — Who was it for?** · **[A][B][C][D]**
- [ ] My mother  - [ ] My father  - [ ] Grandparent  - [ ] Husband / wife  - [ ] Child  - [ ] Brother / sister  - [ ] Parent-in-law  - [ ] Myself  - [ ] Someone else in the family

**Q2.2 — How long ago was this?** · **[A][B][C][D]**
- [ ] This week  - [ ] This month  - [ ] 1–3 months ago  - [ ] 3–6 months ago  - [ ] 6–12 months ago  - [ ] More than a year ago

**Q2.3 — How did you first come to know something was wrong?** · **[A][B][C]**
- [ ] The person told someone themselves
- [ ] Someone else noticed and said something
- [ ] It came out during a routine test or check-up
- [ ] We found out late, after it had already got worse
- [ ] It was an emergency with no warning

**Q2.4 — What was the very first thing you did after you knew? [RANDOMISE]** · **[A]**
- [ ] Called a family member
- [ ] Called a doctor or clinic
- [ ] Searched on Google or asked an AI
- [ ] Asked in the family WhatsApp group
- [ ] Went to a chemist
- [ ] Went straight to a hospital
- [ ] Waited to see whether it settled on its own
- [ ] Started looking for old reports

**Q2.5 — How many days passed between knowing and actually seeing a doctor?** · **[A][B][C]**
- [ ] Same day  - [ ] 1–2 days  - [ ] 3–7 days  - [ ] More than a week  - [ ] More than a month  - [ ] It still hasn't happened

**Q2.6 — What mostly filled that gap? [RANDOMISE]** · **[A]**
- [ ] Trying to get an appointment
- [ ] Deciding which doctor or hospital to go to
- [ ] Convincing the person to agree to go
- [ ] Finding old reports and prescriptions
- [ ] Arranging money
- [ ] Waiting for someone to be free to take them
- [ ] Nothing — we went immediately

**Q2.7 — For each of these, tick what applies. [MATRIX — RANDOMISE ROWS]** · **[A]**

| | Didn't speak to them | Spoke to them | Spoke to them, and they were hard to reach |
|---|---|---|---|
| The doctor | ○ | ○ | ○ |
| A second doctor for another opinion | ○ | ○ | ○ |
| A clinic or hospital receptionist | ○ | ○ | ○ |
| A lab or diagnostic centre | ○ | ○ | ○ |
| A chemist | ○ | ○ | ○ |
| An insurance company or TPA | ○ | ○ | ○ |
| A relative who "knows someone" | ○ | ○ | ○ |
| A neighbour or friend | ○ | ○ | ○ |
| Hospital billing or admission counter | ○ | ○ | ○ |
| A delivery person | ○ | ○ | ○ |

- [ ] We spoke to nobody outside the family *(clears the matrix)*

> Institution count for the summary sheet = rows in columns 2 or 3. Hardest-to-reach = column 3.

**Q2.8 — What went wrong that you had not expected? [SELECT ALL — RANDOMISE]** · **[A][B][D]** · *TRIGGERS T7*
- [ ] The appointment slot shown online wasn't actually available
- [ ] Old reports could not be found
- [ ] The same information had to be repeated to many people
- [ ] The appointment was cancelled or moved at the last minute
- [ ] The doctor we wanted was not available any more
- [ ] Medicines were not in stock or arrived late
- [ ] Insurance did not cover what we thought it would
- [ ] The bill was much higher than expected
- [ ] The person refused to cooperate
- [ ] Nothing went wrong

---

## SECTION 3 — WHERE THE PAPERS ARE

**Q3.1 — If a doctor asked you right now for the last blood test of the older person in your family, what would you actually do first?** · **[A][B][C][D]**
- [ ] Open my phone gallery and scroll through photos
- [ ] Search the family WhatsApp chat
- [ ] Open a folder in Google Drive or my email
- [ ] Go to a physical file or almirah at home
- [ ] Call someone at home and ask them to look
- [ ] Ask the person themselves
- [ ] Call the lab or hospital and ask for a copy
- [ ] Get the test done again — it would be faster
- [ ] I honestly wouldn't know where to start

**Q3.2 — Where is that report right now? [SELECT ALL]** · **[A][B][C]** · *TRIGGERS T6*
- [ ] In a proper file or folder at home
- [ ] Loose papers in a drawer, almirah or plastic bag
- [ ] Photos in someone's phone gallery
- [ ] Inside a WhatsApp chat
- [ ] Email or Google Drive
- [ ] A hospital's app or website
- [ ] A government health app or ABHA
- [ ] Only with the doctor
- [ ] I don't know where it is

> Fragmentation count = number of boxes ticked. Do not ask this as a separate question.

**Q3.3 — Are the reports and prescriptions in a language the person they belong to can read?** · **[A][B][C]** · **[T2]**
- [ ] Yes, they can read all of it
- [ ] They can read some of it
- [ ] No — it's in English and they can't read it
- [ ] No — it's in a language they don't know
- [ ] I've never thought about this

**Q3.4 — Other than you, who in the family could find that report without calling you?** · **[A][B][C][D]** · **[EXEMPT]**
- [ ] Anyone in the family could
- [ ] One other person could
- [ ] Only the person it belongs to
- [ ] Nobody — they would all have to call me
- [ ] I am not the one who keeps them

**Q3.5 — Has a report ever been asked for and simply not found?** · **[A][B][C]**
- [ ] Yes, and we managed without it
- [ ] Yes, and the test had to be done again
- [ ] Yes, and the appointment was wasted
- [ ] Yes, and the doctor got annoyed
- [ ] No, this has never happened

**Q3.6 — When a new report comes in, what usually happens to it?** · **[A]**
- [ ] It's photographed and sent to the family group
- [ ] It's kept in a file at home
- [ ] It's left wherever it was put down
- [ ] It's uploaded to a drive or app
- [ ] It stays in the hospital's system only
- [ ] It varies every time

**Q3.7 — Has anyone in your family made an ABHA number or used a government health app?** · **[A][B]** · **[T6]**
- [ ] Yes, and we use it
- [ ] Yes, made it once and never opened it again
- [ ] It was made at a hospital and I'm not sure what it does
- [ ] No
- [ ] I don't know what that is

**Q3.8 — Is there anything about the family's medical history that only one person remembers — an allergy, an old surgery, a bad reaction to a medicine?** · **[A][B][C]**
- [ ] Yes, and only I know it
- [ ] Yes, and only my mother knows it
- [ ] Yes, and only the person themselves knows it
- [ ] Yes, and only one other family member knows it
- [ ] No, it's all written down somewhere
- [ ] I don't know

---

## SECTION 4 — THE FAMILY GROUP

**Q4.1 — Have you ever had to scroll far back in a chat to find something medical?** · **[A][B][C]**
- [ ] Yes, and I found it in under a minute
- [ ] Yes, it took several minutes
- [ ] Yes, it took more than ten minutes
- [ ] Yes, and I gave up and asked someone to send it again
- [ ] No, this hasn't happened

---

## SECTION 5 — WHEN THE BILL HAS TO BE PAID

**Q5.1 — Has money ever been the reason something medical got delayed?** · **[A][B]** · *TRIGGERS T7*
- [ ] Yes, a test or scan was postponed
- [ ] Yes, a treatment or surgery was postponed
- [ ] Yes, medicines were bought in smaller quantities
- [ ] No
- [ ] Prefer not to say

**Q5.2 — The last time a bill had to be paid at a clinic, hospital or chemist, how did the money reach there? [RANDOMISE]** · **[A][B][C]**
- [ ] Cash handed over in person
- [ ] UPI paid by whoever was standing there
- [ ] Money sent to a family member, who then paid
- [ ] Debit or credit card
- [ ] Bank transfer
- [ ] Insurance paid directly (cashless)
- [ ] Someone outside the household paid
- [ ] We borrowed from a relative

**Q5.3 — Roughly what did that whole episode cost, including tests, travel and medicines?** · **[A][B]** · **[T7]**
- [ ] Under ₹2,000  - [ ] ₹2,000 – ₹10,000  - [ ] ₹10,000 – ₹50,000  - [ ] ₹50,000 – ₹2,00,000  - [ ] Over ₹2,00,000  - [ ] Prefer not to say

> Placed behind T7 deliberately. Asked cold this question draws "prefer not to say" and risks drop-off; asked immediately after someone has told you money postponed a scan, they answer it, because they raised it themselves.

**Q5.4 — Can anyone in your family spend on your behalf, or you on theirs, without asking each time?** · **[A][B][C]** · **[EXEMPT]**
- [ ] Yes, a proper arrangement exists
- [ ] Not formally, but they know my UPI PIN or have my card
- [ ] Cash is kept at home for this purpose
- [ ] No — I've never thought about setting it up
- [ ] No — I don't know how to set it up
- [ ] No — I don't want them spending without me knowing
- [ ] No — they wouldn't be comfortable using it
- [ ] No — it would feel like taking away their independence
- [ ] No — sending money each time is easy enough

> Options 1–3 mean an arrangement exists; 4–9 mean it doesn't, with the reason attached.

**Q5.5 — Has money ever needed to reach someone urgently and it didn't go smoothly? [SELECT ALL]** · **[A][B]**
- [ ] The transfer limit was too low
- [ ] The payment failed at the counter
- [ ] The person couldn't operate the app at their end
- [ ] It happened at night and nobody was awake to send it
- [ ] The hospital only accepted cash
- [ ] This has never happened

**Q5.6 — Was insurance involved the last time?** · **[A][B]**
- [ ] Yes, cashless, and it worked
- [ ] Yes, but we paid first and claimed later
- [ ] Yes, and part of it was refused
- [ ] We have insurance but didn't use it
- [ ] A government scheme was used
- [ ] No insurance at all
- [ ] I don't know whether we have any

**Q5.7 — Your parent needs to pay ₹4,000 at a chemist right now and you are in a meeting. What happens?** · **[A]** · **[EXEMPT]**
- [ ] They pay it themselves without any trouble
- [ ] They pay from cash kept at home
- [ ] They wait until I am free
- [ ] The chemist lets them take it and settle later
- [ ] They call someone else in the family
- [ ] It simply doesn't get bought that day

**Q5.7-C — You need to pay ₹4,000 at a chemist right now and the person who usually helps is busy. What happens?** · **[C]** · **[EXEMPT]**
- [ ] I pay it myself without any trouble
- [ ] I pay from cash kept at home
- [ ] I wait until they are free
- [ ] The chemist lets me take it and settle later
- [ ] I call someone else in the family
- [ ] It simply doesn't get bought that day

**Q5.8 — Same situation, but ₹40,000 at a hospital admission counter at 11 at night. What happens?** · **[A]** · **[EXEMPT]**
- [ ] I can transfer it immediately, no limit problem
- [ ] I'd hit a transfer limit and have to split it or wait
- [ ] I'd have to call the bank or use someone else's account
- [ ] A relative nearby would pay and we'd settle later
- [ ] Insurance would handle it
- [ ] I don't know what we would do

> Q5.7 and Q5.8 exist as a pair. The gap between them is where the current arrangement breaks. Never merge them.

---

## SECTION 6 — MEDICINES THAT HAVE TO ARRIVE

**Q6.1 — How many people in your family take a medicine every single month without a break?** · **[A][B][C][D]** · *TRIGGERS T1, T8*
- [ ] Nobody  - [ ] One person  - [ ] Two people  - [ ] Three or more

**Q6.2 — How many years has that been going on?** · **[A][B]** · **[T8]**
- [ ] Under a year  - [ ] 1–3 years  - [ ] 3–10 years  - [ ] More than 10 years

**Q6.3 — How does the family know when the medicine is about to run out? [RANDOMISE]** · **[A]** · **[T1]**
- [ ] Someone physically checks the strip or bottle
- [ ] Someone keeps the date in their head
- [ ] A phone reminder or alarm
- [ ] Written on a calendar or diary
- [ ] The chemist reminds us
- [ ] An app reminder or automatic refill
- [ ] We find out when it finishes

**Q6.4 — Who places the order, and who receives it at the door?** · **[A]** · **[T1]**
- [ ] Same person does both
- [ ] I order, someone at their end receives it
- [ ] They order, they receive
- [ ] Someone else orders, they receive
- [ ] It's bought in person at a shop, not delivered

**Q6.5 — Where do the medicines usually come from? [SELECT ALL]** · **[A]** · **[T1]**
- [ ] Local chemist, walked in
- [ ] Local chemist, ordered by phone or WhatsApp
- [ ] Online pharmacy app
- [ ] Quick-delivery app
- [ ] Hospital pharmacy
- [ ] Sent from another city by a family member

**Q6.6 — Has a medicine ever arrived late, wrong, or not at all? [SELECT ALL]** · **[A]** · **[T1]**
- [ ] Delivered late, but no doses were missed
- [ ] Delivered late, and doses were missed for a day or two
- [ ] Delivered late, and doses were missed for several days
- [ ] Delivered late, and doses were missed for more than a week
- [ ] Wrong medicine or wrong strength
- [ ] Out of stock, order cancelled
- [ ] Never delivered, no explanation
- [ ] Held up because a prescription was needed
- [ ] This has never happened

**Q6.7 — When ordering online, does anyone ever call to confirm the prescription before it ships?** · **[A]** · **[T5]**
- [ ] Yes, and it's fine
- [ ] Yes, and it's irritating — they call at odd times
- [ ] Yes, and orders have been held up because we missed the call
- [ ] No, it just gets delivered

**Q6.8 — If the person who normally orders the medicines was travelling for two weeks with no phone, what would happen?** · **[A][B][D]** · **[EXEMPT — ask even under T1]**
- [ ] Someone else would step in without any problem
- [ ] Someone else would manage, but would have to ask a lot of questions
- [ ] The person taking the medicine would order it themselves
- [ ] It would be arranged in advance before leaving
- [ ] It would probably be missed
- [ ] Doesn't apply — nobody in our family takes regular medicine

**Q6.9 — Does the person who takes the medicine know how to reorder it themselves?** · **[A]** · **[EXEMPT — ask even under T1]**
- [ ] Yes, they do it alone
- [ ] They could, but they never do
- [ ] No, they can't
- [ ] I've never checked
- [ ] Doesn't apply — nobody in our family takes regular medicine

---

## SECTION 7 — THE PHONE CALLS

**Q7.1 — How was the last appointment booked, and by whom?** · **[A][B]**
- [ ] I called the clinic
- [ ] I booked on an app or website
- [ ] A family member called the clinic
- [ ] A family member booked on an app
- [ ] The person who needed it called themselves
- [ ] The person who needed it booked on an app themselves
- [ ] An attendant or domestic staff member called
- [ ] Through someone we know at the hospital
- [ ] Walked in without booking

**Q7.2 — Which language does the older person in your family speak to a clinic receptionist in?** · **[A][B]** · **[T2]**
- [ ] Their mother tongue, and the receptionist replies in it
- [ ] Their mother tongue, and the receptionist replies in another language
- [ ] Hindi
- [ ] English
- [ ] They don't make these calls themselves

**Q7.2-C — Which language do you speak to a clinic receptionist in?** · **[C]**
- [ ] My mother tongue, and they reply in it
- [ ] My mother tongue, and they reply in another language
- [ ] Hindi
- [ ] English
- [ ] I don't make these calls myself

**Q7.3 — Have you ever booked through an app and then still had to call?** · **[A][B]**
- [ ] Yes — the slot shown wasn't actually available
- [ ] Yes — the booking didn't get confirmed
- [ ] Yes — the doctor's timing had changed
- [ ] Yes — we had to check something the app didn't say
- [ ] No, the app worked properly
- [ ] We never use apps for this

**Q7.4 — When the older person has to call a clinic alone, what usually goes wrong? [SELECT ALL — RANDOMISE]** · **[A][B]** · **[EXEMPT]**
- [ ] They can't get through, the line is busy
- [ ] They're put on hold too long and give up
- [ ] They can't follow the automated menu
- [ ] Language problem
- [ ] They forget to ask the important thing
- [ ] They agree to whatever they're told
- [ ] Nothing goes wrong, they manage fine
- [ ] They never call alone

**Q7.5 — How much time went into calling, holding and calling back?** · **[A]**
- [ ] Barely any  - [ ] 15–30 minutes  - [ ] An hour or more  - [ ] Spread across several days

**Q7.6 — Have you made a call on someone's behalf while they were sitting right next to you?** · **[A][B]** · **[EXEMPT]**
- [ ] Yes, because they'd take too long
- [ ] Yes, because of the language
- [ ] Yes, because they get flustered
- [ ] Yes, because the clinic responds better to me
- [ ] No, they make their own calls

**Q7.6-C — Has someone in your family made a call to a clinic for you while you were sitting right there?** · **[C]** · **[EXEMPT]**
- [ ] Yes, because I'd take too long
- [ ] Yes, because of the language
- [ ] Yes, because I get flustered
- [ ] Yes, because the clinic responds better to them
- [ ] Yes, and I'd rather they didn't
- [ ] No, I make my own calls

---

## SECTION 8 — GETTING PEOPLE TO AGREE

**Q8.1 — How many reminders does it usually take before an older family member agrees to see a doctor?** · **[A][B]** · **[T2]**
- [ ] They agree the first time
- [ ] Two or three reminders
- [ ] More than three
- [ ] They still haven't agreed

**Q8.2 — What finally works? [RANDOMISE]** · **[A][B]** · **[EXEMPT]**
- [ ] Being firm about it
- [ ] Getting another family member to say the same thing
- [ ] Booking the appointment and telling them afterwards
- [ ] Going with them physically
- [ ] An emotional appeal
- [ ] Nothing reliably works

**Q8.2-C — When your family wants you to see a doctor and you're not keen, what finally makes you go? [RANDOMISE]** · **[C]** · **[EXEMPT]**
- [ ] They're firm about it
- [ ] Another family member says the same thing
- [ ] They book it and tell me afterwards
- [ ] They come with me
- [ ] They make an emotional appeal
- [ ] Nothing really — I go when I decide to

**Q8.3 — Is there something medical the family knows is due and keeps postponing?** · **[A][B][C]**
- [ ] Yes, a routine check-up
- [ ] Yes, a specific test or scan
- [ ] Yes, a specialist consultation
- [ ] Yes, a procedure or surgery
- [ ] No, nothing pending

**Q8.4 — Has anyone in the family kept a symptom or a report to themselves?** · **[A][B]**
- [ ] Yes, and we found out later
- [ ] Yes, and it caused a delay in treatment
- [ ] I suspect so, but don't know
- [ ] No, everything is shared

---

## SECTION 9 — BEING ON THE OTHER SIDE · **[C] ONLY**

> The part nobody else can answer for them. Every question here is exempt from all triggers.

**Q9.1 — When you go to a doctor, who normally comes with you?**
- [ ] I go alone
- [ ] My son or daughter
- [ ] My husband or wife
- [ ] Another relative
- [ ] A maid, driver or attendant

**Q9.2 — During the consultation, who does most of the talking?**
- [ ] I do
- [ ] The person who came with me
- [ ] Both of us equally
- [ ] The doctor speaks mainly to them, not to me

**Q9.3 — Has a decision about your health ever been taken without asking you?** · **[EXEMPT]**
- [ ] Yes, and I didn't like it
- [ ] Yes, and it was fine
- [ ] Yes, and I prefer it that way
- [ ] No, I'm always asked

**Q9.4 — Is there anything you would rather handle yourself, but someone else has taken over?** · **[EXEMPT]**
- [ ] Yes, booking appointments
- [ ] Yes, ordering my medicines
- [ ] Yes, talking to the doctor
- [ ] Yes, paying the bills
- [ ] No, I'm happy with the arrangement

**Q9.5 — Do you know what each of your medicines is for?**
- [ ] All of them  - [ ] Most of them  - [ ] A few of them  - [ ] I just take what I'm given

**Q9.6 — When your children call to ask how you are, what do you usually say?** · **[EXEMPT]**
- [ ] Exactly how I am
- [ ] "I'm fine" even when I'm not, so they don't worry
- [ ] "I'm fine", because they'd overreact
- [ ] "I'm fine", because they're already busy
- [ ] I mention only the big things
- [ ] They don't really ask

**Q9.7 — If you needed help right now and your usual person didn't pick up, what would you do?**
- [ ] Call someone else in the family
- [ ] Call a neighbour
- [ ] Go to the local doctor or chemist myself
- [ ] Wait until they call back
- [ ] I wouldn't know what to do

**Q9.8 — What do you find hardest about phones and apps? [SELECT ALL]** · **[EXEMPT]** · *TRIGGERS T9*
- [ ] The letters are too small
- [ ] I don't know which button to press
- [ ] I'm afraid of pressing something wrong
- [ ] It's not in my language
- [ ] Passwords and OTPs
- [ ] Nothing, I manage fine

**Q9.9 — Has anyone ever called and asked you for an OTP?** · **[T9]**
- [ ] Yes, and I gave it
- [ ] Yes, and I refused
- [ ] Yes, and I called my son or daughter first
- [ ] No, this hasn't happened
- [ ] I don't know what an OTP is

---

## SECTION 10 — WHAT YOU USE TODAY

**Q10.1 — For each of these, tick what applies. [MATRIX — RANDOMISE WITHIN GROUPS]** · **[A][B][C]** · *TRIGGERS T4, T5*

| | Use it now | Tried it and stopped | Never used it |
|---|---|---|---|
| WhatsApp chats with family | ○ | ○ | ○ |
| WhatsApp directly with a doctor | ○ | ○ | ○ |
| A proper file or folder at home | ○ | ○ | ○ |
| Loose papers, no folder | ○ | ○ | ○ |
| Photos in the phone gallery | ○ | ○ | ○ |
| Google Drive or email to myself | ○ | ○ | ○ |
| Notes app or a written diary | ○ | ○ | ○ |
| Calendar reminders | ○ | ○ | ○ |
| Tata 1mg | ○ | ○ | ○ |
| PharmEasy | ○ | ○ | ○ |
| Apollo 24/7 | ○ | ○ | ○ |
| Netmeds | ○ | ○ | ○ |
| Zepto / Blinkit / Instamart | ○ | ○ | ○ |
| Practo or a similar booking app | ○ | ○ | ○ |
| A hospital's own app or portal | ○ | ○ | ○ |
| ABHA or a government health app | ○ | ○ | ○ |
| The insurance company's app | ○ | ○ | ○ |
| A paid elder-care service | ○ | ○ | ○ |
| A local chemist who knows the family | ○ | ○ | ○ |

- [ ] Nothing at all — there's no system *(clears the matrix)*

> Column 2 triggers Q10.2. The four pharmacy rows trigger Q6.7.

**Q10.2 — Why did you stop? [RANDOMISE — piped per item marked "tried and stopped"]** · **[A][B]** · **[T4]**
- [ ] Too much effort to keep updating
- [ ] It didn't have what I needed
- [ ] It kept sending unnecessary notifications
- [ ] The older person couldn't use it
- [ ] It was slower than just calling
- [ ] I forgot it existed

> The single most useful question in the survey for the submission. Where a tool already exists and gets abandoned anyway is your design constraint.

**Q10.3 — Which of these does the older person in your family use on their own, without help? [SELECT ALL]** · **[A][B]** · **[T2]**
- [ ] WhatsApp
- [ ] Phone calls
- [ ] A medicine ordering app
- [ ] A hospital app
- [ ] UPI or a payment app
- [ ] None of these
- [ ] They don't use a smartphone

---

## SECTION 11 — PAID HELP · **[A][B]**

**Q11.1 — Have you come across services where someone is paid to check on elderly parents or take them to appointments?**
- [ ] Never heard of them
- [ ] Heard of them, never considered it
- [ ] Considered it — too expensive
- [ ] Considered it — didn't trust an outsider with the family
- [ ] Considered it — the parents refused
- [ ] Considered it — not available in their city
- [ ] Tried one and stopped — it didn't actually reduce my work
- [ ] Tried one and stopped — too expensive
- [ ] Currently paying for one

**Q11.2 — Is there someone you already pay who ends up helping with health matters?** · **[A]**
- [ ] Yes, the maid or cook
- [ ] Yes, the driver
- [ ] Yes, a full-time attendant
- [ ] Yes, a neighbour we compensate informally
- [ ] No

**Q11.3 — If a service handled every appointment, refill and report for the family, what would you need before trusting it? [RANDOMISE]** · **[A]**
- [ ] Seeing exactly what it did each time
- [ ] Being able to approve anything involving money
- [ ] My parents agreeing to it first
- [ ] A real person I could call when it went wrong
- [ ] A recommendation from someone I know
- [ ] I wouldn't hand this over at all

---

## SECTION 12 — WHEN THE USUAL PERSON ISN'T THERE

**Q12.1 — If the person who normally handles all this were unreachable for a week, who would take over?** · **[A][B][C][D]** · **[EXEMPT]**
- [ ] My brother or sister
- [ ] My husband or wife
- [ ] The person themselves would manage
- [ ] A relative living nearby
- [ ] Nobody — it would simply wait
- [ ] I don't know

**Q12.2 — If they took over tomorrow, what would they already know? [SELECT ALL]** · **[A][B][D]** · **[EXEMPT]**
- [ ] Where the reports are kept
- [ ] Which doctor to call
- [ ] What the ongoing problems are
- [ ] What medicines are being taken
- [ ] Which insurance we have
- [ ] None of it — they'd have to be told everything from the start

**Q12.3 — Has this actually happened?** · **[A][B]**
- [ ] Yes, and it went fine
- [ ] Yes, and things got delayed
- [ ] Yes, and something was missed
- [ ] No, it hasn't come up

**Q12.4 — Has handling this ever cost you at work or in your studies?** · **[A][B]**
- [ ] No
- [ ] Occasional leave or late arrival
- [ ] Regular disruption to my week
- [ ] I turned down or delayed something because of it
- [ ] I changed or left a job or a course

**Q12.5 — When you're not thinking about anything in particular, is there something about the family's health sitting at the back of your mind? [RANDOMISE]** · **[A][B]** · **[EXEMPT]**
- [ ] That something is being missed without anyone noticing
- [ ] That I won't be reachable when it matters
- [ ] That they aren't telling me everything
- [ ] Money, if something big happens
- [ ] That I'm not physically there
- [ ] Nothing in particular

**Q12.6 — Why is it that person and not you? [RANDOMISE]** · **[D]**
- [ ] They live closer
- [ ] They're better at it
- [ ] They took it on and it stayed that way
- [ ] My work doesn't allow it
- [ ] The parents prefer dealing with them
- [ ] Nobody ever decided, it just happened

---

## SECTION 13 — COULD SOMETHING ELSE DO THIS?

> Concrete task scenarios only. The words "AI" and "agent" appear nowhere.

**Q13.1 — Something could call the clinic for you, wait through the hold music, and ring you only once a person picked up. Would you use it? [RANDOMISE]** · **[A][B]**
- [ ] Yes — it would save the most annoying part
- [ ] Only for routine bookings; I'd worry it would say the wrong thing on anything serious
- [ ] Only if I could listen in
- [ ] No — I'd rather hear the tone of the reply myself
- [ ] No — the clinic wouldn't take it seriously
- [ ] No — I don't make many such calls anyway

**Q13.2 — Something notices your father's tablets will finish in four days and orders them without asking you. Relief or worry?** · **[A][B]** · **[T1]**
- [ ] Complete relief
- [ ] Relief, if it tells me afterwards
- [ ] Relief, only if it asks me first
- [ ] Worry — it might order the wrong thing
- [ ] Worry — I want to be the one deciding

**Q13.3 — Your mother asks a question out loud in her own language and it reads her last report back to her. Would she do it? [RANDOMISE]** · **[A][B]** · **[EXEMPT]**
- [ ] Yes, she'd use it herself — she's comfortable with her phone
- [ ] She'd try once and then call me anyway — she'd rather hear it from a person
- [ ] She'd try once and then call me anyway — she wants the excuse to call me
- [ ] She'd still just call me — she wouldn't trust the answer
- [ ] She wouldn't try at all — she'd be afraid of doing something wrong
- [ ] She doesn't need this — she reads them herself

**Q13.4 — Something could pay a chemist bill up to ₹5,000 on your behalf without disturbing you, and ask you for anything larger. Would you switch it on?** · **[A]**
- [ ] Yes, ₹5,000 is about right
- [ ] Yes, but at a lower limit
- [ ] Yes, and I'd want a higher limit
- [ ] Only for the chemist, nothing else
- [ ] No

**Q13.5 — Something keeps a running record of every visit, medicine and report for the whole family. Who should be allowed to see it?** · **[A][B][C]**
- [ ] Only me
- [ ] Me and the person it's about
- [ ] All the adults in the family
- [ ] Whoever is handling things at that moment
- [ ] Nobody — I wouldn't want this to exist

**Q13.6 — Something tells you your mother hasn't taken her evening tablet for three days. Would you want to know?** · **[A][B]** · **[EXEMPT — ask even under T1]**
- [ ] Yes, immediately
- [ ] Yes, but she should be told first
- [ ] Only if it goes on longer than that
- [ ] No, that's her business

**Q13.7 — If a machine called you in your own language to remind you about your tablets, would you pick up?** · **[C]** · **[EXEMPT]**
- [ ] Yes, every time
- [ ] Once or twice, then I'd ignore it
- [ ] No, I'd rather my family called
- [ ] I don't need reminding

**Q13.8 — Would you rather a machine handled these things, or your children?** · **[C]** · **[EXEMPT]**
- [ ] The machine — my children are busy
- [ ] The machine, but my children should know what it did
- [ ] My children — I'd rather it stayed personal
- [ ] I'd rather handle it myself

**Q13.9 — What is the one thing here you would never let something else do for you? [RANDOMISE]** · **[A][B][C]**
- [ ] Talk to the doctor
- [ ] Decide on a treatment
- [ ] Spend money
- [ ] Share reports with anyone
- [ ] Tell my parent bad news
- [ ] Order medicines
- [ ] I'd be comfortable with all of it

---

## SECTION 14 — WHAT WENT WRONG, AND WHY

> A three-step branching cascade — the 5 Whys, rebuilt so it works without an interviewer. Each answer pipes into the next; do not collapse these into one question.

**Q14.1 — Of everything you've described, what was the single worst part? [RANDOMISE]** · **[A][B][C][D]**
- [ ] Not being able to find old reports
- [ ] Not getting an appointment in time
- [ ] Repeating the same information again and again
- [ ] Getting the person to agree to go
- [ ] Medicines not reaching in time
- [ ] Arranging the money
- [ ] Not being there physically
- [ ] Not knowing whether something was being missed

**Q14.2 — Why did that happen? [PIPE FROM Q14.1 — RANDOMISE]** · **[A][B]**
- [ ] Nobody had kept it in order beforehand
- [ ] Only one person knows how it all works
- [ ] The people we needed were hard to reach
- [ ] The person it concerns doesn't cooperate
- [ ] We were doing it at the last minute
- [ ] The system at the hospital or app didn't work as promised
- [ ] We were in different cities

**Q14.3 — And behind that, what's the underlying reason? [RANDOMISE]** · **[A][B]**
- [ ] Nobody was ever given the job, so it fell to one person
- [ ] We only deal with health when something goes wrong
- [ ] The older generation won't use the tools that would help
- [ ] Everything depends on someone being free at that exact moment
- [ ] There's no one place where the family's health information lives
- [ ] Distance makes everything slower
- [ ] Honestly, I don't know

**Q14.4 — If the exact same thing happened next month, would it go differently?** · **[A][B]**
- [ ] Yes, we've fixed it since
- [ ] Slightly better, we'd be faster
- [ ] No, exactly the same
- [ ] Probably worse

**Q14.5 — [OPTIONAL — free text] If you want to describe that worst moment in your own words, write it here. Two or three lines is plenty.** · **[A][B][C][D]**

> The only open box in the survey, and the only source of a usable verbatim quote. Keep it optional so it doesn't cause drop-off, and place it here — immediately after the cascade, while the memory is active.

---

## SECTION 15 — CLOSING · all roles

**Q15.1 — Would you be willing to answer a few follow-up questions if needed?**
- [ ] Yes *(→ show contact field)*
- [ ] No

---

## PART C — CONSENT AND PUBLICATION

- Get consent from everyone who responds, and tell them their words may be published.
- Quotes are published as **age band and city only** — never a name, never the family's name, never a doctor or hospital.
- Parts of what you submit — a quote, a photograph, a line from a recording — may appear in the published map, credited to your team.

---

## PART D — ANALYSIS NOTES

### D.1 Hidden structure

| Section | 5W1H | Rail |
|---|---|---|
| 0, 1 | Who | — |
| 2 | What / When | — |
| 3, 4 | Where | — |
| 5 | How — money | Payments |
| 6 | How — supply | Logistics |
| 7 | How — contact | Voice |
| 8 | Why (social) | — |
| 9 | Who / Why (recipient's own account) | Voice |
| 10, 11 | How — current tools | — |
| 12 | What (failure mode) | — |
| 13 | How — future | All three |
| 14 | Why (root cause) | — |

### D.2 Segmentation variables — derive after fielding, do not ask

| Variable | Bands | From |
|---|---|---|
| S1 Distance | Same house / Same city / Different city / Different state / Abroad | Q1.2, Q1.3 |
| S2 Household geometry | Multi-generational / Couple only / Living alone / Alone with paid help | Q1.1, Q1.4 |
| S3 Chronic load | 0 / 1 / 2 / 3+ people on monthly medicines | Q6.1 |
| S4 Coordination concentration | Single thread / Two-person split / Distributed | Q3.4, Q12.1, Q12.2 |
| S5 Recipient digital confidence | Independent / Assisted / Cannot use / Refuses | Q9.8, Q10.3, Q10.1 (Role C) |
| S6 Language gap | None / Clinic mismatch / Cannot read own reports | Q3.3, Q7.2 |
| S7 Financing mode | Out-of-pocket / Private insurance / Govt scheme / Mixed | Q5.6 |
| S8 Money delegation | Own / Per-event transfer / Standing access / Cash at home | Q5.4, Q5.2 |
| S9 Refill mechanism | Physical check / Human memory / Reminder / Chemist / App / Reactive | Q6.3 |
| S10 Paid-service exposure | Never heard / Rejected / Dropped / Paying | Q11.1 |
| S11 Career cost | None / Occasional / Regular / Changed job | Q12.4 |

**Sampling:** vary S1 and S2 deliberately across the five families. At minimum: two families where the coordinator lives in a different city, one multi-generational household, and one where the elder lives alone or as a couple. Five families identical on S1 and S2 produce depth but no comparison.

### D.3 Data quality

Since the form is self-hosted, use timing rather than trick questions. A trap item reads differently to a respondent you recruited personally, and it costs you goodwill immediately before the most personal section.

- Log `time_on_question` for every item.
- **Flag a respondent if:** median time per question is under 2.5 seconds, or the same option position is selected six or more times consecutively, or total completion time falls under 40% of that role's median.
- **Report your n honestly:** respondents fielded, respondents passing the timing check, and families with at least three members responding.

### D.4 Cross-member contradictions — the analysis that matters

Because every member of a family shares a code, these pairs compare directly. **The disagreements are the finding, not the averages.**

Walk this table against your four forms before you build. Every question named here is on the exempt list; if a trigger gates one side out, the comparison returns nothing.

| # | Compare | Between | What a gap means |
|---|---|---|---|
| 1 | Q3.4 | A vs B/D | A says "anyone could find it", others say "we'd call them" → the single thread is invisible to the person carrying it |
| 2 | Q6.8 / Q12.1 / Q12.2 | A vs D | The handoff exists in theory only |
| 3 | Q6.9 vs Q9.4 | A vs C | A says the parent can't reorder; C says they'd rather do it themselves → over-delegation |
| 4 | Q8.2 vs Q9.3 | A vs C | A picks "book it and tell them after"; C picks "decided without asking me, didn't like it" → the consent problem, stated from both sides |
| 5 | Q9.6 vs Q12.5 | C vs A | C hides things so A won't worry; A's dread is "they aren't telling me everything" → the loop that feeds itself |
| 6 | Q13.3 vs Q13.7 / Q13.8 | A vs C | A predicts the parent won't use it; C says they would → A is designing for a parent who doesn't exist |
| 7 | Q13.6 vs Q9.3 | A vs C | A wants adherence alerts; C wants to be asked first |
| 8 | Q5.4 vs Q5.7 | within A | Claims an arrangement exists, but the ₹4,000 scenario still stalls |
| 9 | Q5.7 vs Q5.8 | within A | The exact amount at which the current arrangement breaks |
| 10 | Q7.4 vs Q9.8 | A vs C | What A thinks goes wrong on a call vs what C actually finds hard |
| 11 | Q5.7 vs Q5.7-C | A vs C | A predicts the parent copes; C says it doesn't get bought that day |
| 12 | Q7.6 vs Q7.6-C | A vs C | A calls "because they get flustered"; C picks "I'd rather they didn't" |

### D.5 Per-family summary sheet

| Field | Entry |
|---|---|
| Family code | |
| Members responding / roles covered | |
| Segmentation profile S1–S11 | |
| The single thread — who | |
| Institutions in the loop (count from Q2.7) | |
| Delay observed (Q2.5) | |
| Which rail breaks first | |
| Root cause chain (Q14.1 → Q14.2 → Q14.3) | |
| Sharpest contradiction (from D.4) | |
| Timing check | pass / fail |

### D.6 Cross-family questions to answer at the end

1. Does the root cause chain in Q14.1–14.3 differ by distance (S1) or by concentration (S4)?
2. In which families does the recipient's account contradict the coordinator's, and what do those families have in common?
3. Which rail breaks first in each family, and does that vary by segment?
4. Where does a tool already exist (Q10.1, column 1) and still get bypassed (Q7.3, Q3.1)? That bypass is the design constraint.
5. What did every family do identically despite having no reason to? That is the non-obvious insight candidate.

---

## PART E — WHAT THIS SURVEY CANNOT DO

The submission is scored on a non-obvious insight learned from people who live the problem, read first, with proof optional but scored. A closed-ended form administered to twenty people characterises the *shape* of the problem well. It cannot produce the quote.

Q14.5 is the only open box, and it is optional by design.

So treat this instrument as a **screener**. Field it, find the two or three families whose members contradict each other hardest in D.4, and then call those families. Twenty people answering a 40–78 question form, plus six people in a real conversation, is less total burden than a long form fielded flat — and it produces the thing that gets read first.
