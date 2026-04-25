import { useState, useEffect, useMemo } from "react";
import {
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Check,
  Plus,
  Trash2,
  MessageCircle,
  Users,
  Shield,
  ChevronDown,
  ChevronRight,
  Clock,
  Map as MapIcon,
  Calendar,
} from "lucide-react";

// ============================================================
// Static config
// ============================================================
const COURSES = [
  "BSc Physics",
  "BSc Computer Science",
  "BSc Mathematics",
  "BEng Mechanical",
  "BA Economics",
  "BCom",
  "Other",
];

// Each university: name, country, application deadline (ISO).
const UNIVERSITIES = [
  { name: "UBC — University of British Columbia", country: "Canada", deadline: "2027-01-15" },
  { name: "University of Toronto", country: "Canada", deadline: "2027-01-13" },
  { name: "McGill University", country: "Canada", deadline: "2027-01-15" },
  { name: "MIT", country: "USA", deadline: "2027-01-01" },
  { name: "Stanford University", country: "USA", deadline: "2027-01-05" },
  { name: "Imperial College London", country: "UK", deadline: "2027-01-26" },
  { name: "ETH Zürich", country: "Switzerland", deadline: "2026-12-15" },
  { name: "NUS — National University of Singapore", country: "Singapore", deadline: "2027-03-15" },
];

// Required items, grouped by tab. Used both for autosave totals and the
// "missing items" list that goes into the WhatsApp message.
const REQUIRED_ITEMS = {
  "Basic profile": [
    "Name",
    "Email",
    "Phone",
    "DOB",
    "Aadhar card",
    "Passport #",
    "Passport expiry",
  ],
  "Mandatory documents": [
    "Photo",
    "10th marksheet",
    "12th marksheet",
    "Passport scan",
  ],
  "Profile documents": ["LOR 1", "LOR 2", "SOP"],
  "Extra curricular": ["At least 1 activity"],
  University: ["Target country"],
};

const ALL_REQUIRED = Object.entries(REQUIRED_ITEMS).flatMap(([section, items]) =>
  items.map((item) => ({ section, item }))
);

const COUNSELLORS = [
  { id: "c1", name: "Anita Verma", phone: "919811001001", email: "anita@persona.in" },
  { id: "c2", name: "Rajiv Mehta", phone: "919811001002", email: "rajiv@persona.in" },
  { id: "c3", name: "Priya Singh", phone: "919811001003", email: "priya@persona.in" },
  { id: "c4", name: "Amit Kapoor", phone: "919811001004", email: "amit@persona.in" },
  { id: "c5", name: "Neha Sharma", phone: "919811001005", email: "neha@persona.in" },
];

// Helper to build student records.
const mkStudent = (id, name, parentName, parentPhone, paths, counsellorId, allFilled, rich = {}) => ({
  id,
  name,
  parentName,
  parentPhone, // wa.me format: country code + number, no '+'
  paths,
  counsellorId,
  submissionDeadline: "2026-04-28", // 3 days from "today" (2026-04-25)
  filled: allFilled
    ? Object.fromEntries(ALL_REQUIRED.map(({ item }) => [item, true]))
    : {},
  // Rich profile (used for CV)
  email: rich.email ?? `${name.toLowerCase().replace(/ /g, ".")}@example.com`,
  phone: rich.phone ?? "+91 98XXX XXX00",
  dob: rich.dob ?? "2007-06-15",
  city: rich.city ?? "Ludhiana, Punjab",
  bloodGroup: rich.bloodGroup ?? "B+",
  school: rich.school ?? "",
  marks10: rich.marks10 ?? null,
  marks12: rich.marks12 ?? null,
  testScores: rich.testScores ?? {},
  activities: rich.activities ?? [],
  internships: rich.internships ?? [],
  awards: rich.awards ?? [],
  summary: rich.summary ?? "",
});

const SEED_STUDENTS = [
  // 5 fully filled — 3 assigned, 2 unassigned
  mkStudent("s1", "Riya Sharma", "Mr. Sharma", "919876543210",
    [{ program: "BSc Computer Science", university: "MIT" }], "c1", true, {
      email: "riya.sharma@example.com",
      phone: "+91 98765 43210",
      school: "Sacred Heart Convent School, Ludhiana",
      marks10: 94, marks12: 91,
      testScores: { SAT: 1520, TOEFL: 110 },
      activities: [
        "Founder & President, School Computer Science Club (2024–25)",
        "Captain, School Robotics Team — built award-winning autonomous bot",
        "Volunteer math tutor — 80+ hours mentoring underprivileged students",
      ],
      internships: ["AI/ML Intern, Bangalore-based startup (2025) — shipped ML pipeline used in production"],
      awards: ["National Math Olympiad — top 5%", "Class 12 School Topper", "State Science Fair, 1st prize"],
      summary: "Aspiring computer scientist with focus on AI/ML. Strong math fundamentals, real engineering shipped, and a pattern of building communities around technical interests.",
    }),
  mkStudent("s2", "Arjun Patel", "Mr. Patel", "919876543211",
    [{ program: "BEng Mechanical", university: "ETH Zürich" }], "c2", true, {
      email: "arjun.patel@example.com", phone: "+91 98765 43211",
      school: "DPS Ludhiana", marks10: 89, marks12: 86,
      testScores: { SAT: 1450, IELTS: 7.5 },
      activities: [
        "Lead Engineer, School Solar Car Project — 3rd place at Nationals",
        "School Football Team — Vice Captain",
      ],
      internships: ["Workshop intern, local automotive parts manufacturer (2024)"],
      awards: ["Best Mechanical Design — Inter-school Engineering Olympiad 2024"],
      summary: "Hands-on mechanical engineering enthusiast with a track record of competitive engineering projects.",
    }),
  mkStudent("s3", "Ishita Gupta", "Mrs. Gupta", "919876543212",
    [{ program: "BA Economics", university: "Stanford University" }], "c3", true, {
      email: "ishita.gupta@example.com", phone: "+91 98765 43212",
      school: "Welham Girls' School, Dehradun", marks10: 96, marks12: 93,
      testScores: { SAT: 1560, TOEFL: 115 },
      activities: [
        "Editor-in-Chief, School Newspaper",
        "Founder, Economics Discussion Forum (300+ members)",
        "Model UN — Best Delegate, 4 conferences",
      ],
      internships: ["Research intern, NCAER (National Council of Applied Economic Research)"],
      awards: ["Class 12 School Topper", "National Economics Olympiad — Gold"],
      summary: "Future-focused economist drawn to development policy and behavioural economics.",
    }),
  mkStudent("s4", "Karan Singh", "Mr. Singh", "919876543213",
    [{ program: "BSc Physics", university: "Imperial College London" }], "c4", true, {
      email: "karan.singh@example.com", phone: "+91 98765 43213",
      school: "Mayo College, Ajmer", marks10: 91, marks12: 89,
      testScores: { SAT: 1490, IELTS: 8.0 },
      activities: ["Co-founded school Physics Society", "Senior Cricket Team"],
      internships: ["Summer research, IIT Roorkee (Quantum Optics lab, 2025)"],
      awards: ["INSPIRE Scholarship awardee"],
      summary: "Curious experimentalist drawn to fundamental physics, with hands-on lab exposure.",
    }),
  mkStudent("s5", "Meera Iyer", "Mrs. Iyer", "919876543214",
    [{ program: "BSc Mathematics", university: "University of Toronto" }], "c5", true, {
      email: "meera.iyer@example.com", phone: "+91 98765 43214",
      school: "PSBB Senior Secondary, Chennai", marks10: 95, marks12: 92,
      testScores: { SAT: 1530, TOEFL: 112 },
      activities: [
        "Captain, School Math Olympiad Team — qualified for INMO",
        "Bharatanatyam — Arangetram completed",
      ],
      internships: ["Summer research with IISc Mathematics dept (2025)"],
      awards: ["INMO finalist", "All India 1st in NMTC 2024"],
      summary: "Pure-math focused student with a strong olympiad record and creative outside-classroom interests.",
    }),
  // 5 with nothing filled — all unassigned
  mkStudent("s6", "Rohan Kapoor", "Mr. Kapoor", "919876543215",
    [{ program: "BCom", university: "NUS — National University of Singapore" }], null, false),
  mkStudent("s7", "Sneha Reddy", "Mrs. Reddy", "919876543216",
    [{ program: "BSc Computer Science", university: "UBC — University of British Columbia" }], null, false),
  mkStudent("s8", "Vikram Joshi", "Mr. Joshi", "919876543217",
    [{ program: "BSc Physics", university: "McGill University" }], null, false),
  mkStudent("s9", "Ananya Nair", "Mrs. Nair", "919876543218",
    [{ program: "BA Economics", university: "MIT" }], null, false),
  mkStudent("s10", "Aditya Khanna", "Mr. Khanna", "919876543219",
    [{ program: "BEng Mechanical", university: "Stanford University" }], null, false),
];

// Seed messages — counsellor → student threads
const SEED_MESSAGES = {
  s1: [
    { from: "counsellor", text: "Hi Riya! Welcome aboard. I've reviewed your profile and MIT is a strong target. Let's set up a call this week.", ts: "2026-04-23T10:30:00", channels: ["chat", "whatsapp"] },
    { from: "student", text: "Thank you Anita! I'm free Wednesday or Friday afternoon.", ts: "2026-04-23T14:12:00", channels: ["chat"] },
    { from: "counsellor", text: "Friday 4pm works. I'll send a calendar invite. Meanwhile, please make sure your SOP draft is ready by Thursday.", ts: "2026-04-23T15:45:00", channels: ["chat", "whatsapp"] },
  ],
  s2: [
    { from: "counsellor", text: "Hi Arjun, Rajiv here. Looking forward to working on your ETH application. Send me your draft SOP whenever you're ready.", ts: "2026-04-22T11:00:00", channels: ["chat", "whatsapp"] },
  ],
  s3: [],
  s4: [
    { from: "counsellor", text: "Hi Karan, Amit here. Just got assigned as your counsellor. Looking forward to working on Imperial — I went there for postgrad. Let's set up the intake call this week.", ts: "2026-04-24T09:15:00", channels: ["chat", "whatsapp"] },
  ],
  s5: [
    { from: "counsellor", text: "Hi Meera, Neha here. Toronto Math is a strong target with your INMO record. I've blocked time on Friday for our intake — please confirm.", ts: "2026-04-24T11:00:00", channels: ["chat", "whatsapp"] },
  ],
};

// ============================================================
// Intake conversation transcripts — captured by counsellor on first call
// ============================================================
const SEED_INTAKE_TRANSCRIPTS = {
  s1: {
    counsellorId: "c1",
    date: "2026-04-10",
    duration: "47 min",
    channel: "Video call",
    status: "complete",
    transcript: [
      { speaker: "counsellor", text: "Hi Riya, thanks for making time today. Walk me through what made you want to apply abroad — and specifically MIT?" },
      { speaker: "student", text: "I've been doing robotics since 9th grade and won the FIRST Tech Challenge regionals last year. Indian engineering colleges feel very theoretical from what my seniors say. MIT has the kind of hands-on lab culture I want." },
      { speaker: "counsellor", text: "Got it. And you've got two backup tracks running — Stanford and IIT Bombay. Are those equally important to you, or is MIT clearly the dream?" },
      { speaker: "student", text: "MIT is clearly first. IIT Bombay is the safety. Stanford is honestly because my dad keeps mentioning it." },
      { speaker: "counsellor", text: "Okay, that's useful context. What are you most worried about right now in the application?" },
      { speaker: "student", text: "Two things. The SOP — I don't know how to write about myself without sounding like every other Indian engineering applicant. And test scores — my SAT is 1480 which I think is borderline." },
      { speaker: "counsellor", text: "1480 is in MIT's range, just on the lower end. I wouldn't retake unless we have time. The SOP is very fixable. We'll do three iterations together. What's your funding plan?" },
      { speaker: "student", text: "My parents can do about 40 lakh per year. We're hoping for need-based aid at MIT." },
      { speaker: "counsellor", text: "MIT meets full demonstrated need for international students, that's manageable. Last thing — anything personal I should know about? Family situation, health, anything that affects your timeline?" },
      { speaker: "student", text: "My grandmother is unwell. I'm her primary caregiver in the evenings. It might affect my study hours over the next month." },
      { speaker: "counsellor", text: "Thanks for telling me. We'll plan the timeline around that. I'll send you a study schedule that works around her care hours." },
    ],
    summary: {
      headline: "Strong robotics-focused candidate, MIT primary, SOP is the main risk.",
      goals: ["MIT (primary)", "IIT Bombay (safety)", "Stanford (parental pressure track)"],
      strengths: ["FTC regionals winner", "Solid GPA (94.2%)", "Clear technical narrative"],
      concerns: ["SAT 1480 borderline for MIT", "SOP draft generic", "Grandmother caregiver duties may compress study time"],
      financialNotes: "Family budget ₹40L/yr, expecting MIT need-based aid.",
    },
    actionItems: [
      { id: "a1", text: "Submit polished SOP first draft to counsellor", owner: "student", due: "2026-04-26", done: false },
      { id: "a2", text: "Schedule 3 SOP iteration calls", owner: "counsellor", due: "2026-04-25", done: true },
      { id: "a3", text: "Confirm whether SAT retake is feasible given grandmother's care hours", owner: "counsellor", due: "2026-04-27", done: false },
      { id: "a4", text: "Upload latest 12th marksheet", owner: "student", due: "2026-04-28", done: false },
    ],
  },
  s2: {
    counsellorId: "c2",
    date: "2026-04-12",
    duration: "38 min",
    channel: "In-person",
    status: "complete",
    transcript: [
      { speaker: "counsellor", text: "Arjun, you're applying to ETH for mechanical engineering. Why ETH specifically?" },
      { speaker: "student", text: "I want to work on EV powertrains. ETH has the closest research ties to the European auto industry — Porsche, BMW, Daimler all sponsor PhDs there." },
      { speaker: "counsellor", text: "That's a sharper answer than I usually hear. Where are you on German language?" },
      { speaker: "student", text: "B1 right now, taking B2 exam in June. ETH master's is mostly English so it's nice-to-have." },
      { speaker: "counsellor", text: "Good. What's your GRE plan?" },
      { speaker: "student", text: "330 last attempt. Probably not retaking — it's enough for ETH." },
      { speaker: "counsellor", text: "Agreed. Documents-wise, I'm seeing the SOP and recommendation letters are still pending. Is your professor responsive?" },
      { speaker: "student", text: "Two of three. My third recommender has been ghosting me for three weeks." },
      { speaker: "counsellor", text: "Send me their email, I'll follow up. We have backup recommenders if needed." },
    ],
    summary: {
      headline: "Focused ETH candidate, technical strengths clear, recommendation letter risk.",
      goals: ["ETH Zurich MSc Mechanical (primary)", "TU Munich (backup)"],
      strengths: ["GRE 330", "Clear research-direction narrative", "B1 German with B2 in progress"],
      concerns: ["Third recommender unresponsive for 3 weeks", "SOP draft not started"],
      financialNotes: "Family-funded; ETH tuition is low (~₹1.2L/yr) so no aid needed.",
    },
    actionItems: [
      { id: "b1", text: "Email unresponsive recommender (Prof. Khurana, IIT-D)", owner: "counsellor", due: "2026-04-25", done: false },
      { id: "b2", text: "Identify backup recommender if no reply by 26 Apr", owner: "counsellor", due: "2026-04-26", done: false },
      { id: "b3", text: "Submit SOP first draft", owner: "student", due: "2026-04-27", done: false },
    ],
  },
  s3: {
    counsellorId: "c3",
    date: "2026-04-20",
    duration: "22 min",
    channel: "Video call",
    status: "complete",
    transcript: [
      { speaker: "counsellor", text: "Ishita, I want to understand the Stanford pivot. Last term you were leaning LSE." },
      { speaker: "student", text: "I went to a Stanford info session and the development economics department blew me away. Specifically the work coming out of SIEPR." },
      { speaker: "counsellor", text: "Okay, but Stanford economics is brutal to crack. Test scores hold up?" },
      { speaker: "student", text: "SAT 1560, TOEFL 115. National Economics Olympiad gold helped." },
      { speaker: "counsellor", text: "Strong. Recommenders?" },
      { speaker: "student", text: "Three teachers, all engaged. School topper helps." },
      { speaker: "counsellor", text: "What's your funding situation? Stanford undergrad is the big number." },
      { speaker: "student", text: "Need-blind for international, full need met. Family fills in any gap up to ₹50L/yr." },
      { speaker: "counsellor", text: "All clear. Risk is the essay tone — Stanford rewards specificity. We'll work on three drafts." },
    ],
    summary: {
      headline: "Strong all-round candidate, Stanford pivot is recent but well-justified.",
      goals: ["Stanford BA Economics (primary)", "LSE (backup)", "SRCC Delhi (safety)"],
      strengths: ["SAT 1560 / TOEFL 115", "National Olympiad gold", "School topper", "MUN best delegate ×4"],
      concerns: ["Pivot to Stanford only in March — application narrative needs to feel deliberate, not last-minute"],
      financialNotes: "Stanford need-blind; family supplements up to ₹50L/yr.",
    },
    actionItems: [
      { id: "d1", text: "Draft Stanford 'Why us' essay (650 words)", owner: "student", due: "2026-04-26", done: false },
      { id: "d2", text: "Confirm all three recommender submissions", owner: "counsellor", due: "2026-04-27", done: true },
      { id: "d3", text: "Compile additional research portfolio (Olympiad solutions)", owner: "student", due: "2026-04-28", done: false },
    ],
  },
  // s4 and s5 are assigned but intake not done yet — counsellor task is to do it
  s4: { status: "not_started", counsellorId: "c4" },
  s5: { status: "not_started", counsellorId: "c5" },
};

// ============================================================
// Storage (window.storage — persistent across sessions in this artifact)
// ============================================================
const STORAGE_KEY = "campus-connect-state-v1";

const loadState = async () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveState = async (state) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage failures (quota, private mode) are non-fatal — UI keeps working.
  }
};

// ============================================================
// Helpers
// ============================================================
const countryFor = (uni) => UNIVERSITIES.find((u) => u.name === uni)?.country ?? "";
const deadlineFor = (uni) => UNIVERSITIES.find((u) => u.name === uni)?.deadline ?? "";
const counsellorName = (id) => COUNSELLORS.find((c) => c.id === id)?.name ?? "Unassigned";

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const daysUntil = (iso) => {
  if (!iso) return null;
  const ms = new Date(iso) - new Date("2026-04-25");
  return Math.max(0, Math.ceil(ms / 86400000));
};

const completionFor = (student) => {
  const total = ALL_REQUIRED.length;
  const done = ALL_REQUIRED.filter(({ item }) => student.filled[item]).length;
  return { done, total, pct: Math.round((done / total) * 100) };
};

const missingItems = (student) =>
  ALL_REQUIRED.filter(({ item }) => !student.filled[item]);

const buildWhatsAppMessage = (student) => {
  const missing = missingItems(student);
  const earliestUni = student.paths
    .map((p) => ({ uni: p.university, deadline: deadlineFor(p.university) }))
    .filter((x) => x.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];

  const lines = [
    `Namaste ${student.parentName} 🙏`,
    ``,
    `This is from *Campus Connect* regarding *${student.name}'s* university applications.`,
    ``,
    `📋 Submission deadline with us: *${fmtDate(student.submissionDeadline)}* (${daysUntil(student.submissionDeadline)} days remaining)`,
  ];

  if (missing.length === 0) {
    lines.push(``, `✅ All documents have been submitted. Thank you!`);
  } else {
    lines.push(``, `⚠️ Pending items (${missing.length}):`);
    missing.slice(0, 12).forEach((m) => lines.push(`  • ${m.item} _(${m.section})_`));
    if (missing.length > 12) lines.push(`  • …and ${missing.length - 12} more`);
  }

  if (earliestUni) {
    lines.push(``, `🎓 University deadline: *${earliestUni.uni}* — ${fmtDate(earliestUni.deadline)}`);
  }

  lines.push(``, `Please remind ${student.name} to complete pending items. Thank you.`);
  return lines.join("\n");
};

const whatsAppLink = (student) =>
  `https://wa.me/${student.parentPhone}?text=${encodeURIComponent(buildWhatsAppMessage(student))}`;

// ---- Counsellor accountability helpers ----

const intakeFor = (studentId) => SEED_INTAKE_TRANSCRIPTS[studentId] || null;

const counsellorActionItems = (studentId) => {
  const intake = intakeFor(studentId);
  if (!intake?.actionItems) return [];
  return intake.actionItems.filter((a) => a.owner === "counsellor" && !a.done);
};

const studentActionItems = (studentId) => {
  const intake = intakeFor(studentId);
  if (!intake?.actionItems) return [];
  return intake.actionItems.filter((a) => a.owner === "student" && !a.done);
};

const buildCounsellorPromptMessage = (counsellor, students) => {
  const lines = [`Hi ${counsellor.name}, quick nudge from admin —`, ""];
  const myStudents = students.filter((s) => s.counsellorId === counsellor.id);

  const intakesPending = myStudents.filter(
    (s) => intakeFor(s.id)?.status !== "complete"
  );
  if (intakesPending.length) {
    lines.push(`📞 Intake calls still pending (${intakesPending.length}):`);
    intakesPending.forEach((s) => {
      lines.push(`  • ${s.name} (deadline ${fmtDate(s.submissionDeadline)})`);
    });
    lines.push("");
  }

  const myTasks = [];
  myStudents.forEach((s) => {
    counsellorActionItems(s.id).forEach((t) =>
      myTasks.push({ student: s.name, ...t })
    );
  });
  if (myTasks.length) {
    lines.push(`✅ Outstanding action items from intakes (${myTasks.length}):`);
    myTasks.slice(0, 5).forEach((t) => {
      lines.push(`  • [${t.student}] ${t.text} — due ${t.due}`);
    });
    if (myTasks.length > 5) lines.push(`  ... and ${myTasks.length - 5} more`);
    lines.push("");
  }

  const imminent = myStudents.filter(
    (s) => daysUntil(s.submissionDeadline) <= 1
  );
  if (imminent.length) {
    lines.push(`🔴 Students with submission deadlines in ≤1 day:`);
    imminent.forEach((s) => lines.push(`  • ${s.name}`));
    lines.push("");
  }

  if (lines.length === 2) {
    lines.push("Just checking in — let me know if anything is blocked.");
  } else {
    lines.push("Please update or ping me on Slack if blocked. Thanks!");
  }
  return lines.join("\n");
};

const counsellorPromptLink = (counsellor, students) =>
  `https://wa.me/${counsellor.phone}?text=${encodeURIComponent(buildCounsellorPromptMessage(counsellor, students))}`;

const counsellorWorkload = (counsellor, students) => {
  const mine = students.filter((s) => s.counsellorId === counsellor.id);
  const intakesPending = mine.filter(
    (s) => intakeFor(s.id)?.status !== "complete"
  ).length;
  let pendingTasks = 0;
  mine.forEach((s) => {
    pendingTasks += counsellorActionItems(s.id).length;
  });
  const imminent = mine.filter((s) => daysUntil(s.submissionDeadline) <= 1)
    .length;
  const incomplete = mine.filter((s) => completionFor(s).pct < 100).length;
  return {
    studentCount: mine.length,
    intakesPending,
    pendingTasks,
    imminent,
    incomplete,
    students: mine,
  };
};

// ============================================================
// Main app
// ============================================================
export default function CareerPlannerMockup() {
  // screen: persona | studentLogin | studyPath | dashboard | staffLogin | adminPanel | counsellorPanel
  const [screen, setScreen] = useState("persona");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [paths, setPaths] = useState([{ program: "", university: "" }]);

  // Staff side
  const [staffRole, setStaffRole] = useState("admin"); // admin | counsellor
  const [activeCounsellorId, setActiveCounsellorId] = useState("c1");
  const [students, setStudents] = useState(SEED_STUDENTS);
  const [messages, setMessages] = useState(SEED_MESSAGES);

  // Student identity (which seeded student is "logged in")
  const [currentStudentId, setCurrentStudentId] = useState(null);

  const [hydrated, setHydrated] = useState(false);

  // Hydrate from storage on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await loadState();
      if (!cancelled && data) {
        if (data.students) setStudents(data.students);
        if (data.messages) setMessages(data.messages);
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on change (debounced).
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      saveState({ students, messages });
    }, 400);
    return () => clearTimeout(t);
  }, [students, messages, hydrated]);

  // Update a single student record (used by both panels and dashboard).
  const updateStudent = (id, patch) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  // Add a message to a student's thread.
  const sendMessage = (studentId, msg) => {
    setMessages((prev) => ({
      ...prev,
      [studentId]: [...(prev[studentId] || []), msg],
    }));
  };

  // Teleport — used by the App Map to jump into any screen with sensible
  // default state. For data-driven screens (dashboard, counsellor panel)
  // it picks a representative pick or a true random one when asked.
  const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const teleport = (screenId, opts = {}) => {
    if (screenId === "dashboard") {
      const target =
        opts.studentId ||
        (opts.random ? randomFrom(students).id : currentStudentId || students[0].id);
      const student = students.find((s) => s.id === target);
      if (student) {
        setCurrentStudentId(student.id);
        setUsername(student.name);
        setPaths(student.paths);
      }
    } else if (screenId === "counsellorPanel") {
      const assigned = COUNSELLORS.filter((c) =>
        students.some((s) => s.counsellorId === c.id)
      );
      const pool = assigned.length > 0 ? assigned : COUNSELLORS;
      const target = opts.counsellorId || (opts.random ? randomFrom(pool).id : activeCounsellorId);
      setActiveCounsellorId(target);
    } else if (screenId === "studyPath") {
      // If a student is "logged in", show their actual paths; else fresh.
      if (currentStudentId) {
        const s = students.find((s) => s.id === currentStudentId);
        if (s) setPaths(s.paths);
      } else if (paths.length === 0 || !paths[0]?.program) {
        setPaths([{ program: "", university: "" }]);
      }
    }
    setScreen(screenId);
  };

  const courses = COURSES;
  const universities = UNIVERSITIES;

  const updatePath = (idx, key, value) =>
    setPaths(
      paths.map((p, i) => {
        if (i !== idx) return p;
        // Changing the program resets that row's university (and therefore country).
        if (key === "program") return { program: value, university: "" };
        return { ...p, [key]: value };
      })
    );

  const addPath = () =>
    setPaths([...paths, { program: "", university: "" }]);

  const removePath = (idx) =>
    setPaths(paths.length === 1 ? paths : paths.filter((_, i) => i !== idx));

  const allReady =
    paths.length > 0 && paths.every((p) => p.program && p.university);

  const Shell = ({ children, showAuthNav = true, wide = false }) => (
    <div
      className="min-h-screen w-full font-serif text-stone-900"
      style={{
        backgroundColor: "#f4f0e6",
        backgroundImage:
          "radial-gradient(circle at 20% 10%, rgba(120,80,40,0.05), transparent 40%), radial-gradient(circle at 80% 90%, rgba(40,40,80,0.05), transparent 40%)",
      }}
    >
      {/* Persistent design-mockup banner — visible on every screen except the map itself */}
      {screen !== "appMap" && (
        <button
          onClick={() => setScreen("appMap")}
          className="flex w-full items-center justify-between gap-6 border-b-4 border-dashed border-stone-900/50 bg-amber-50 px-8 py-6 text-left transition hover:bg-amber-100"
          title="Open the design map"
        >
          <div className="flex items-center gap-5">
            <MapIcon className="h-10 w-10 shrink-0 text-stone-700" strokeWidth={1.25} />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-stone-600">
                Design mockup · for client preview
              </p>
              <p className="mt-1 font-serif text-2xl leading-tight text-stone-900">
                Click here to see the map of how we are designing the site
              </p>
            </div>
          </div>
          <ArrowRight className="h-6 w-6 shrink-0 text-stone-700" strokeWidth={1.5} />
        </button>
      )}
      <div className={`mx-auto px-6 py-10 ${wide ? "max-w-6xl" : "max-w-4xl"}`}>
        <header className="mb-12 flex items-center justify-between border-b border-stone-400/40 pb-4">
          <button
            onClick={() => setScreen("appMap")}
            className="text-2xl tracking-tight transition hover:opacity-70"
            title="Open app map"
          >
            <span className="italic text-stone-500">the</span>{" "}
            <span className="font-semibold">Career Atlas</span>
          </button>
          {showAuthNav && (
            <nav className="flex items-center gap-1 text-xs uppercase tracking-[0.2em]">
              <button
                onClick={() => setScreen("studentLogin")}
                className="flex items-center gap-1.5 px-3 py-2 text-stone-700 transition hover:text-stone-900"
              >
                <GraduationCap className="h-3.5 w-3.5" strokeWidth={1.5} />
                Student
              </button>
              <span className="text-stone-400">·</span>
              <button
                onClick={() => setScreen("staffLogin")}
                className="flex items-center gap-1.5 px-3 py-2 text-stone-700 transition hover:text-stone-900"
              >
                <Briefcase className="h-3.5 w-3.5" strokeWidth={1.5} />
                Staff
              </button>
            </nav>
          )}
        </header>
        {children}
      </div>
    </div>
  );

  // ---------- Landing ----------
  if (screen === "persona") {
    return (
      <Shell wide>
        {/* Original hero — primary CTA */}
        <div className="mb-16">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-stone-500">
            Plan your next move
          </p>
          <h2 className="font-serif text-6xl leading-[1.05]">
            Map your <span className="italic">study path</span>,
            <br />
            one decision at a time.
          </h2>
          <p className="mt-6 max-w-md text-stone-600">
            Programs, universities, countries — pick what fits, change your mind, save it
            for later. Start by signing in as a student or staff member up top.
          </p>

          <button
            onClick={() => setScreen("studentLogin")}
            className="mt-10 inline-flex items-center gap-2 border border-stone-900 bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-stone-50 transition hover:bg-stone-800"
          >
            Book a free career planning session <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-3 text-xs italic text-stone-500">
            with our certified counsellors
          </p>
        </div>

        {/* Editorial magazine content — the educational/entertainment funnel */}
        <MagazineLanding onSignup={() => setScreen("studentLogin")} />
      </Shell>
    );
  }

  // ---------- Student Login ----------
  if (screen === "studentLogin") {
    return (
      <Shell>
        <button
          onClick={() => setScreen("persona")}
          className="mb-8 inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" /> back
        </button>

        <div className="mb-10">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-stone-500">Step 02</p>
          <h2 className="font-serif text-5xl leading-tight">Student Login</h2>
        </div>

        <div className="max-w-md">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-stone-500">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. j.singh"
              className="mt-2 w-full border-b border-stone-900/40 bg-transparent py-2 text-lg outline-none focus:border-stone-900"
            />
          </label>

          <label className="mt-8 block">
            <span className="text-xs uppercase tracking-[0.2em] text-stone-500">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full border-b border-stone-900/40 bg-transparent py-2 text-lg outline-none focus:border-stone-900"
            />
          </label>

          <button
            onClick={() => {
              setCurrentStudentId(null);
              setScreen("studyPath");
            }}
            className="mt-12 inline-flex items-center gap-2 border border-stone-900 bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-stone-50 transition hover:bg-stone-800"
          >
            Sign in <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-6 text-xs text-stone-500">
            (Click-through enabled — any input or none, both work.)
          </p>
        </div>

        {/* Demo logins */}
        <div className="mt-16 max-w-3xl border-t border-stone-900/20 pt-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
            Demo · log in as a seeded student
          </p>
          <p className="mt-1 text-xs italic text-stone-500">
            Skips the study-path selection and lands straight on the dashboard with their data.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {students.map((s) => {
              const { pct } = completionFor(s);
              const cName = counsellorName(s.counsellorId);
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentStudentId(s.id);
                    setUsername(s.name);
                    setPaths(s.paths);
                    setScreen("dashboard");
                  }}
                  className="flex items-center justify-between gap-3 border border-stone-900/20 bg-white/30 px-4 py-3 text-left transition hover:border-stone-900 hover:bg-white/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="truncate text-[10px] text-stone-500">
                      {s.paths[0]?.university} · Counsellor: {cName}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] uppercase tracking-[0.15em] ${
                      pct === 100 ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {pct === 100 ? "Complete" : `${pct}%`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Shell>
    );
  }

  // ---------- Study Path Selections ----------
  if (screen === "studyPath") {
    return (
      <Shell>
        <button
          onClick={() => setScreen("studentLogin")}
          className="mb-8 inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" /> back
        </button>

        <div className="mb-10">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-stone-500">Step 03</p>
          <h2 className="font-serif text-5xl leading-tight">Study Path Selections</h2>
          <p className="mt-3 max-w-2xl text-stone-600">
            Add as many paths as you're considering. For each one — pick a program, then
            a university. Country fills itself.
          </p>
        </div>

        {/* Column headers — always visible */}
        <div
          className="grid items-baseline gap-2 border-b border-stone-900/30 pb-3 text-[10px] uppercase tracking-[0.2em] text-stone-500"
          style={{ gridTemplateColumns: "1.25rem 1fr 1fr 1fr 1.5rem" }}
        >
          <span>#</span>
          <span>Program <span className="text-stone-400">· 01</span></span>
          <span>University <span className="text-stone-400">· 02</span></span>
          <span>Country <span className="text-stone-400">· auto</span></span>
          <span></span>
        </div>

        {/* Rows — three pickers stay side-by-side at every width */}
        <div className="divide-y divide-stone-900/15">
          {paths.map((p, idx) => {
            const country = countryFor(p.university);
            return (
              <div
                key={idx}
                className="grid items-center gap-2 py-5"
                style={{ gridTemplateColumns: "1.25rem 1fr 1fr 1fr 1.5rem" }}
              >
                <span className="font-serif text-base italic text-stone-500">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <PathSelect
                  value={p.program}
                  onChange={(v) => updatePath(idx, "program", v)}
                  options={courses}
                  placeholder="Select program"
                />

                <PathSelect
                  value={p.university}
                  onChange={(v) => updatePath(idx, "university", v)}
                  options={universities.map((u) => u.name)}
                  placeholder={p.program ? "Select university" : "Pick a program first"}
                  disabled={!p.program}
                />

                <div
                  className={`truncate border-l-2 px-2 py-2 text-xs ${
                    country
                      ? "border-stone-900 bg-stone-900 text-stone-50"
                      : "border-stone-900/15 italic text-stone-400"
                  }`}
                >
                  {country || "—"}
                </div>

                <button
                  onClick={() => removePath(idx)}
                  disabled={paths.length === 1}
                  aria-label="Remove path"
                  className="justify-self-end text-stone-400 transition enabled:hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add another */}
        <button
          onClick={addPath}
          className="mt-6 inline-flex items-center gap-2 border border-dashed border-stone-900/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-700 transition hover:border-stone-900 hover:bg-white/40"
        >
          <Plus className="h-3.5 w-3.5" /> Add another path
        </button>

        {/* Submit — bottom left */}
        <div className="mt-12 flex flex-col-reverse items-start gap-3 md:flex-row md:items-center md:justify-start md:gap-6">
          <button
            disabled={!allReady}
            onClick={() => setScreen("dashboard")}
            className="inline-flex items-center gap-2 border border-stone-900 bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-stone-50 transition enabled:hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Submit <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-xs text-stone-500">
            {allReady
              ? `${paths.length} ${paths.length === 1 ? "path" : "paths"} ready to submit.`
              : "Each row needs a program and a university."}
          </p>
        </div>
      </Shell>
    );
  }

  // ---------- Campus Connect Dashboard (post-submit) ----------
  if (screen === "dashboard") {
    const currentStudent = currentStudentId
      ? students.find((s) => s.id === currentStudentId)
      : null;
    return (
      <Shell>
        <Dashboard
          username={username}
          paths={paths}
          student={currentStudent}
          students={students}
          messages={currentStudent ? (messages[currentStudent.id] || []) : []}
          onSendMessage={(text) => {
            if (!currentStudent) return;
            sendMessage(currentStudent.id, {
              from: "student",
              text,
              ts: new Date().toISOString(),
              channels: ["chat"],
            });
          }}
          onUpdateStudent={(patch) => {
            if (!currentStudent) return;
            updateStudent(currentStudent.id, patch);
          }}
          onEdit={() => setScreen("studyPath")}
          onReset={() => {
            setScreen("persona");
            setUsername("");
            setPassword("");
            setPaths([{ program: "", university: "" }]);
            setCurrentStudentId(null);
          }}
        />
      </Shell>
    );
  }

  // ---------- Staff login ----------
  // ---------- App Map (sitemap / flow overview) ----------
  if (screen === "appMap") {
    return (
      <Shell>
        <AppMap
          onTeleport={teleport}
          students={students}
          messages={messages}
          currentStudentId={currentStudentId}
          activeCounsellorId={activeCounsellorId}
          paths={paths}
          updateStudent={updateStudent}
          sendMessage={sendMessage}
          setStudents={setStudents}
        />
      </Shell>
    );
  }

  // ---------- Staff login ----------
  if (screen === "staffLogin") {
    return (
      <Shell>
        <button
          onClick={() => setScreen("persona")}
          className="mb-8 inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" /> back
        </button>

        <div className="mb-10">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-stone-500">Staff sign-in</p>
          <h2 className="font-serif text-4xl leading-tight">Who are you?</h2>
        </div>

        <div className="grid max-w-2xl gap-3">
          <button
            onClick={() => setStaffRole("admin")}
            className={`flex items-start gap-4 border p-5 text-left transition ${
              staffRole === "admin"
                ? "border-stone-900 bg-stone-900 text-stone-50"
                : "border-stone-900/30 hover:border-stone-900 hover:bg-white/40"
            }`}
          >
            <Shield className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-base font-semibold">Admin</p>
              <p className={`mt-1 text-xs ${staffRole === "admin" ? "text-stone-300" : "text-stone-600"}`}>
                See all students, assign counsellors, message parents.
              </p>
            </div>
          </button>

          <button
            onClick={() => setStaffRole("counsellor")}
            className={`flex items-start gap-4 border p-5 text-left transition ${
              staffRole === "counsellor"
                ? "border-stone-900 bg-stone-900 text-stone-50"
                : "border-stone-900/30 hover:border-stone-900 hover:bg-white/40"
            }`}
          >
            <Users className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
            <div className="w-full">
              <p className="text-base font-semibold">Counsellor</p>
              <p className={`mt-1 text-xs ${staffRole === "counsellor" ? "text-stone-300" : "text-stone-600"}`}>
                See your assigned students and follow up with them.
              </p>
              {staffRole === "counsellor" && (
                <div className="mt-3 border-t border-stone-700 pt-3">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-300">
                    Sign in as
                  </label>
                  <select
                    value={activeCounsellorId}
                    onChange={(e) => {
                      e.stopPropagation();
                      setActiveCounsellorId(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 w-full bg-transparent py-1 text-sm text-stone-50 outline-none"
                  >
                    {COUNSELLORS.map((c) => (
                      <option key={c.id} value={c.id} className="text-stone-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </button>
        </div>

        <button
          onClick={() => setScreen(staffRole === "admin" ? "adminPanel" : "counsellorPanel")}
          className="mt-10 inline-flex items-center gap-2 border border-stone-900 bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-stone-50 transition hover:bg-stone-800"
        >
          Sign in <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-4 text-xs text-stone-500">(Click-through mock — no real auth.)</p>
      </Shell>
    );
  }

  // ---------- Admin panel ----------
  if (screen === "adminPanel") {
    return (
      <Shell>
        <AdminPanel
          students={students}
          setStudents={setStudents}
          messages={messages}
          onSendMessage={(studentId, text, fromCounsellorId) =>
            sendMessage(studentId, {
              from: "counsellor",
              fromCounsellorId,
              text,
              ts: new Date().toISOString(),
              channels: ["chat", "whatsapp"],
            })
          }
          onExit={() => setScreen("persona")}
        />
      </Shell>
    );
  }

  // ---------- Counsellor panel ----------
  if (screen === "counsellorPanel") {
    return (
      <Shell>
        <CounsellorPanel
          counsellorId={activeCounsellorId}
          students={students}
          messages={messages}
          onSendMessage={(studentId, text) =>
            sendMessage(studentId, {
              from: "counsellor",
              fromCounsellorId: activeCounsellorId,
              text,
              ts: new Date().toISOString(),
              channels: ["chat", "whatsapp"],
            })
          }
          onExit={() => setScreen("persona")}
        />
      </Shell>
    );
  }

  return null;
}

// ============================================================
// Dashboard
// ============================================================
function Dashboard({
  username,
  paths,
  student,
  messages,
  onSendMessage,
  onUpdateStudent,
  onEdit,
  onReset,
}) {
  const [tab, setTab] = useState("basic");
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const [savedAt, setSavedAt] = useState(null);

  const studentName = student?.name || username?.trim() || "there";
  const counsellor = student?.counsellorId
    ? COUNSELLORS.find((c) => c.id === student.counsellorId)
    : null;

  // Tasks derived from student state.
  const tasks = useMemo(() => {
    if (!student) {
      return [
        { id: "fill-form", label: "Complete your application form", done: false },
        { id: "upload-docs", label: "Upload mandatory documents", done: false },
        { id: "build-cv", label: "Add activities & internships for your CV", done: false },
      ];
    }
    const missingBySection = missingItems(student).reduce((acc, m) => {
      acc[m.section] = (acc[m.section] || 0) + 1;
      return acc;
    }, {});
    const t = [];
    if (missingBySection["Basic profile"])
      t.push({ id: "basic", label: `Fill basic profile (${missingBySection["Basic profile"]} fields pending)`, done: false, tab: "basic" });
    if (missingBySection["Mandatory documents"])
      t.push({ id: "mandatory", label: `Upload mandatory documents (${missingBySection["Mandatory documents"]} pending)`, done: false, tab: "mandatory" });
    if (missingBySection["Profile documents"])
      t.push({ id: "profile", label: `Upload LORs & SOP (${missingBySection["Profile documents"]} pending)`, done: false, tab: "profile" });
    if (missingBySection["Extra curricular"])
      t.push({ id: "extra", label: "Add at least one extra-curricular activity", done: false, tab: "extra" });
    if (missingBySection["University"])
      t.push({ id: "university", label: "Confirm your university targets", done: false, tab: "university" });

    // Unread counsellor message?
    const lastMsg = messages?.[messages.length - 1];
    if (lastMsg && lastMsg.from === "counsellor")
      t.push({ id: "reply", label: `Reply to ${counsellor?.name || "your counsellor"}`, done: false, tab: "messages" });

    if (t.length === 0)
      t.push({ id: "done", label: "All tasks complete — well done!", done: true });
    return t;
  }, [student, messages, counsellor]);

  // Autosave: triggered on any input change, debounced ~700ms.
  useEffect(() => {
    if (saveState !== "saving") return;
    const t = setTimeout(() => {
      setSaveState("saved");
      setSavedAt(new Date());
    }, 700);
    return () => clearTimeout(t);
  }, [saveState]);

  const handleAnyInput = () => {
    if (saveState !== "saving") setSaveState("saving");
  };

  const tabs = [
    { id: "basic", label: "Basic profile" },
    { id: "mandatory", label: "Mandatory documents" },
    { id: "profile", label: "Profile documents" },
    { id: "extra", label: "Extra curricular" },
    { id: "university", label: "University" },
    { id: "messages", label: counsellor ? `Messages · ${counsellor.name.split(" ")[0]}` : "Messages" },
  ];

  return (
    <div onInput={handleAnyInput} onChange={handleAnyInput}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
            Campus Connect Dashboard
          </p>
          <h2 className="mt-2 max-w-2xl font-serif text-2xl leading-snug">
            Hi <span className="italic">{studentName}</span>, you have{" "}
            <span className="font-semibold">3 days</span> to fill out the form and submit your
            documents.
          </h2>
        </div>

        {/* Autosave indicator */}
        <div className="shrink-0 pt-1 text-right">
          {saveState === "saving" && (
            <span className="inline-flex items-center gap-2 text-[11px] italic text-stone-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-stone-500" />
              Saving…
            </span>
          )}
          {saveState === "saved" && savedAt && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-600">
              <Check className="h-3 w-3" /> Saved {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {saveState === "idle" && (
            <span className="text-[11px] italic text-stone-400">Autosave on</span>
          )}
        </div>
      </div>

      {/* Tasks panel */}
      <div className="mt-8 border border-stone-900/20 bg-white/40 p-5">
        <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
          Your tasks
        </p>
        <ul className="mt-3 space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-3">
              <span
                className={`mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center border ${
                  task.done
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-stone-900/40"
                }`}
              >
                {task.done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
              </span>
              {task.tab ? (
                <button
                  onClick={() => setTab(task.tab)}
                  className="text-left text-sm text-stone-800 underline-offset-2 hover:underline"
                >
                  {task.label}
                </button>
              ) : (
                <span className={`text-sm ${task.done ? "text-stone-500" : "text-stone-800"}`}>
                  {task.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Tabs */}
      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-b border-stone-900/30">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 pb-3 text-xs uppercase tracking-[0.2em] transition ${
              tab === t.id
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Panels */}
      <div className="mt-10">
        {tab === "basic" && <BasicProfileTab />}
        {tab === "mandatory" && <MandatoryDocsTab />}
        {tab === "profile" && <ProfileDocsTab />}
        {tab === "extra" && <ExtraCurricularTab />}
        {tab === "university" && <UniversityTab paths={paths} countryFor={countryFor} />}
        {tab === "messages" && (
          <StudentMessagesTab
            student={student}
            counsellor={counsellor}
            messages={messages || []}
            onSend={onSendMessage}
          />
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-16 flex gap-4 border-t border-stone-900/20 pt-8">
        <button
          onClick={onEdit}
          className="border border-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] hover:bg-stone-900 hover:text-stone-50"
        >
          Edit paths
        </button>
        <button
          onClick={onReset}
          className="text-sm uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

// ---------- Tab: Messages (student-facing) ----------
function StudentMessagesTab({ student, counsellor, messages, onSend }) {
  if (!student) {
    return (
      <div className="border border-dashed border-stone-900/30 p-8 text-center">
        <p className="text-sm italic text-stone-600">
          Sign in as one of the demo students to see messages.
        </p>
      </div>
    );
  }
  if (!counsellor) {
    return (
      <div className="border border-dashed border-stone-900/30 p-8 text-center">
        <p className="text-sm italic text-stone-600">
          You haven't been assigned a counsellor yet.
        </p>
        <p className="mt-2 text-xs text-stone-500">
          Once an admin assigns one, you'll be able to message them here.
        </p>
      </div>
    );
  }
  return (
    <MessageThread
      messages={messages}
      currentUser="student"
      counterparty={counsellor.name}
      onSend={onSend}
      placeholder={`Message ${counsellor.name}…`}
    />
  );
}

// ---------- Tab: Basic profile ----------
function BasicProfileTab() {
  return (
    <div className="space-y-12">
      <Section title="Student details">
        <div className="grid gap-6 md:grid-cols-2">
          <Input label="Name of the student" />
          <Input label="Email" type="email" />
          <Input label="Phone" type="tel" />
          <Input label="Blood group" placeholder="e.g. O+" />
          <Input label="DOB" type="date" />
          <Input label="House address" />
          <Input label="Aadhar card #" />
          <Input label="PAN card #" hint="optional" />
          <Input label="Passport #" />
          <Input label="Passport expiry date" type="date" />
        </div>
      </Section>

      <Section title="School (undergraduate)">
        <div className="grid gap-6 md:grid-cols-2">
          <Input label="School name" />
          <Input label="School email id" type="email" />
          <Input label="School address" className="md:col-span-2" />
        </div>
      </Section>

      <Section title="University / college (post-graduate)">
        <div className="grid gap-6 md:grid-cols-2">
          <Input label="Univ or college" />
          <Input label="Uni email id" type="email" />
          <Input label="Address" />
        </div>
      </Section>

      <Section title="Father">
        <ParentFields prefix="Father" />
      </Section>

      <Section title="Mother">
        <ParentFields prefix="Mother" />
      </Section>
    </div>
  );
}

function ParentFields() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Input label="Name" />
      <Input label="DOB" type="date" />
      <Input label="Education" />
      <Input label="Educational institution" />
      <Input label="Aadhar card" />
      <Input label="Occupation" />
      <Input label="Position at workplace" />
      <Input label="Phone number" type="tel" />
      <Input label="Email id" type="email" />
      <Input label="Name of organisation" />
    </div>
  );
}

// ---------- Tab: Mandatory documents ----------
function MandatoryDocsTab() {
  const tests = ["IELTS", "TOEFL", "SAT / ACT", "AP", "Other (TUMA / TSA / etc.)"];

  return (
    <div className="space-y-12">
      <Section title="Identity & academics">
        <FileLink
          label="Photo"
          hint="white background, formals, 3.5×4.5 cm, JPG + PDF"
        />
        <FileLink label="10th marks & percentage" hint="enter % then upload sheet" />
        <FileLink label="11th marks per subject & percentage" />
        <FileLink label="Predicted scores (if 12th not yet available)" />
        <FileLink
          label="12th marks per subject & percentage"
          hint="best of 5, all compulsory subjects"
        />
      </Section>

      <Section title="Graduate (if applying for post-grad)">
        <Input label="CGPA" />
        <FileLink label="Transcript" />
        <FileLink label="Final degree" />
        <FileLink
          label="Transcript of all semesters (PDF)"
          hint="if degree not yet complete"
        />
      </Section>

      <Section title="Passport">
        <FileLink label="Passport — front & back" />
        <FileLink label="Passport — front page" />
        <FileLink label="Passport — last page" />
      </Section>

      <Section title="Tests taken">
        <div className="overflow-hidden border border-stone-900/20">
          <div
            className="grid gap-px bg-stone-900/20 text-[10px] uppercase tracking-[0.15em] text-stone-600"
            style={{ gridTemplateColumns: "1fr 5rem 5rem 1fr 8rem" }}
          >
            <div className="bg-[#f4f0e6] px-3 py-2">Test</div>
            <div className="bg-[#f4f0e6] px-3 py-2">Score</div>
            <div className="bg-[#f4f0e6] px-3 py-2">Booked</div>
            <div className="bg-[#f4f0e6] px-3 py-2">Booking #</div>
            <div className="bg-[#f4f0e6] px-3 py-2">Result</div>
          </div>
          {tests.map((t) => (
            <div
              key={t}
              className="grid gap-px border-t border-stone-900/20 bg-stone-900/20"
              style={{ gridTemplateColumns: "1fr 5rem 5rem 1fr 8rem" }}
            >
              <div className="bg-[#f4f0e6] px-3 py-2 text-sm">{t}</div>
              <input className="bg-[#f4f0e6] px-3 py-2 text-sm outline-none" />
              <input
                type="checkbox"
                className="m-auto h-3.5 w-3.5 bg-[#f4f0e6]"
              />
              <input className="bg-[#f4f0e6] px-3 py-2 text-sm outline-none" />
              <button className="bg-[#f4f0e6] px-3 py-2 text-left text-xs uppercase tracking-[0.15em] text-stone-700 hover:bg-white/60">
                Upload
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Other documents">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="grid items-baseline gap-4 border-b border-stone-900/15 py-2"
            style={{ gridTemplateColumns: "1fr 8rem" }}
          >
            <input
              placeholder={`Description ${i + 1}`}
              className="bg-transparent py-1 text-sm outline-none placeholder:italic placeholder:text-stone-400"
            />
            <button className="text-right text-xs uppercase tracking-[0.15em] text-stone-700 hover:underline">
              Upload
            </button>
          </div>
        ))}
        <FileLink label="Resume" hint="optional" />
      </Section>
    </div>
  );
}

// ---------- Tab: Profile documents ----------
function ProfileDocsTab() {
  const items = ["LOR 1", "LOR 2", "LOR 3", "Internship 1", "Internship 2", "Internship 3", "SOP"];
  return (
    <Section title="Profile documents">
      {items.map((it) => (
        <FileLink key={it} label={it} />
      ))}
    </Section>
  );
}

// ---------- Tab: Extra curricular ----------
function ExtraCurricularTab() {
  return (
    <Section title="Activities, achievements, certificates">
      <p className="mb-4 max-w-2xl text-sm text-stone-600">
        List any community service, art &amp; culture, leadership, sports, or other activities.
        Add up to 25 — leave the rest blank.
      </p>
      <div className="overflow-hidden border border-stone-900/20">
        <div
          className="grid gap-px bg-stone-900/20 text-[10px] uppercase tracking-[0.15em] text-stone-600"
          style={{ gridTemplateColumns: "2.5rem 1fr 2fr 8rem" }}
        >
          <div className="bg-[#f4f0e6] px-3 py-2">#</div>
          <div className="bg-[#f4f0e6] px-3 py-2">Name of activity</div>
          <div className="bg-[#f4f0e6] px-3 py-2">Description</div>
          <div className="bg-[#f4f0e6] px-3 py-2">Proof</div>
        </div>
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="grid gap-px border-t border-stone-900/20 bg-stone-900/20"
            style={{ gridTemplateColumns: "2.5rem 1fr 2fr 8rem" }}
          >
            <div className="bg-[#f4f0e6] px-3 py-2 font-serif italic text-stone-500">
              {String(i + 1).padStart(2, "0")}
            </div>
            <input className="bg-[#f4f0e6] px-3 py-2 text-sm outline-none" />
            <input className="bg-[#f4f0e6] px-3 py-2 text-sm outline-none" />
            <button className="bg-[#f4f0e6] px-3 py-2 text-left text-xs uppercase tracking-[0.15em] text-stone-700 hover:bg-white/60">
              Upload
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ---------- Tab: University (pre-filled from paths) ----------
function UniversityTab({ paths, countryFor }) {
  return (
    <div className="space-y-10">
      <Section title="Target country (primary)">
        <Input label="Target country" placeholder="e.g. Canada" />
      </Section>

      <Section title="Country choices">
        <p className="mb-4 max-w-2xl text-sm text-stone-600">
          These came from your study path selections. You can adjust below — or hit{" "}
          <span className="italic">Edit paths</span> at the bottom to redo them.
        </p>
        <div className="space-y-6">
          {paths.map((p, idx) => (
            <div key={idx} className="border border-stone-900/20 p-5">
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-stone-500">
                Country {idx + 1}
              </p>
              <div className="grid gap-6 md:grid-cols-3">
                <Input label="Country" defaultValue={countryFor(p.university) || ""} />
                <Input label="University" defaultValue={p.university || ""} />
                <Input label="Course" defaultValue={p.program || ""} />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ---------- Shared form helpers ----------
function Section({ title, children }) {
  return (
    <section>
      <h3 className="mb-5 border-b border-stone-900/30 pb-2 font-serif text-xl">{title}</h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Input({ label, hint, type = "text", placeholder, defaultValue, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{label}</span>
      {hint && <span className="ml-2 text-[10px] italic text-stone-400">({hint})</span>}
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-1.5 w-full border-b border-stone-900/30 bg-transparent py-1.5 text-sm outline-none transition focus:border-stone-900"
      />
    </label>
  );
}

function FileLink({ label, hint }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-stone-900/15 py-3">
      <div>
        <p className="text-sm">{label}</p>
        {hint && <p className="mt-0.5 text-[10px] italic text-stone-500">{hint}</p>}
      </div>
      <button className="shrink-0 text-xs uppercase tracking-[0.15em] text-stone-700 underline-offset-4 hover:underline">
        Upload ↑
      </button>
    </div>
  );
}

function PathSelect({ value, onChange, options, placeholder, disabled = false }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full max-w-full appearance-none truncate border-b bg-transparent py-2 pr-5 text-xs outline-none transition ${
          disabled
            ? "cursor-not-allowed border-stone-900/15 italic text-stone-400"
            : value
            ? "border-stone-900 text-stone-900"
            : "border-stone-900/40 text-stone-500 hover:border-stone-900"
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <span
        className={`pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-xs ${
          disabled ? "text-stone-300" : "text-stone-500"
        }`}
      >
        ▾
      </span>
    </div>
  );
}

// ============================================================
// Admin Panel
// ============================================================
function AdminPanel({ students, setStudents, messages, onSendMessage, onExit }) {
  const [expanded, setExpanded] = useState(null);
  const [archivedIds, setArchivedIds] = useState(new Set());
  const [showArchived, setShowArchived] = useState(false);

  const visible = students.filter((s) => !archivedIds.has(s.id));

  const unassigned = useMemo(
    () =>
      visible
        .filter((s) => !s.counsellorId)
        .sort((a, b) => daysUntil(a.submissionDeadline) - daysUntil(b.submissionDeadline)),
    [visible]
  );
  const incomplete = useMemo(
    () =>
      visible
        .filter((s) => s.counsellorId && completionFor(s).pct < 100)
        .sort((a, b) => daysUntil(a.submissionDeadline) - daysUntil(b.submissionDeadline)),
    [visible]
  );
  const complete = useMemo(
    () =>
      visible
        .filter((s) => s.counsellorId && completionFor(s).pct === 100)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [visible]
  );

  const stats = useMemo(() => {
    const total = visible.length;
    const filled = visible.filter((s) => completionFor(s).pct === 100).length;
    const u = visible.filter((s) => !s.counsellorId).length;
    return { total, filled, pending: total - filled, unassigned: u };
  }, [visible]);

  const reassign = (studentId, counsellorId) =>
    setStudents(
      students.map((s) =>
        s.id === studentId ? { ...s, counsellorId: counsellorId || null } : s
      )
    );

  const archive = (studentId) =>
    setArchivedIds((prev) => new Set(prev).add(studentId));

  const unarchive = (studentId) =>
    setArchivedIds((prev) => {
      const next = new Set(prev);
      next.delete(studentId);
      return next;
    });

  // Auto-assign suggestion: counsellor with fewest assigned students.
  const counsellorLoad = useMemo(() => {
    const m = new Map(COUNSELLORS.map((c) => [c.id, 0]));
    students.forEach((s) => {
      if (s.counsellorId) m.set(s.counsellorId, (m.get(s.counsellorId) || 0) + 1);
    });
    return m;
  }, [students]);

  const suggestedCounsellor = () => {
    const sorted = [...COUNSELLORS].sort(
      (a, b) => (counsellorLoad.get(a.id) || 0) - (counsellorLoad.get(b.id) || 0)
    );
    return sorted[0];
  };

  const autoAssignAll = () => {
    if (unassigned.length === 0) return;
    const load = new Map(counsellorLoad);
    const updates = new Map();
    unassigned.forEach((s) => {
      // Pick the counsellor with the fewest students (live updated as we go).
      const sorted = [...COUNSELLORS].sort(
        (a, b) => (load.get(a.id) || 0) - (load.get(b.id) || 0)
      );
      const target = sorted[0];
      updates.set(s.id, target.id);
      load.set(target.id, (load.get(target.id) || 0) + 1);
    });
    setStudents(
      students.map((s) =>
        updates.has(s.id) ? { ...s, counsellorId: updates.get(s.id) } : s
      )
    );
  };

  return (
    <>
      <button
        onClick={onExit}
        className="mb-6 inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" /> exit
      </button>

      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">Admin</p>
          <h2 className="mt-1 font-serif text-3xl leading-tight">All students</h2>
          <p className="mt-2 text-sm text-stone-600">
            Top to bottom: who needs assignment, who's behind, who's done.
          </p>
        </div>
        <div className="flex gap-6 text-xs">
          <Stat n={stats.total} label="Active" />
          <Stat n={stats.unassigned} label="Unassigned" />
          <Stat n={stats.pending} label="Pending" />
          <Stat n={stats.filled} label="Complete" />
        </div>
      </div>

      <BroadcastBar
        students={visible.filter((s) => completionFor(s).pct < 100)}
      />

      {/* Counsellor workload — see who's behind, prompt anyone with pending work */}
      <CounsellorWorkloadStrip students={visible} />

      {/* ────────────────────────────────────────────────────────── */}
      {/* SECTION 1 — UNASSIGNED                                     */}
      {/* ────────────────────────────────────────────────────────── */}
      <SectionHeader
        number="01"
        title="Unassigned"
        count={unassigned.length}
        accent="amber"
        sub={
          unassigned.length > 0
            ? "These students don't have a counsellor yet. Assign one to start the relationship."
            : "Everyone has a counsellor — nice."
        }
        action={
          unassigned.length > 1 ? (
            <button
              onClick={autoAssignAll}
              className="inline-flex items-center gap-1.5 border border-stone-900 bg-stone-900 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-stone-50 transition hover:bg-stone-800"
              title="Distribute evenly among counsellors"
            >
              ✨ Auto-assign all
            </button>
          ) : null
        }
      />

      {unassigned.length === 0 ? (
        <EmptyRow message="No unassigned students." tone="emerald" />
      ) : (
        <div className="border border-stone-900/20 bg-white/30">
          {unassigned.map((s, idx) => (
            <UnassignedRow
              key={s.id}
              idx={idx}
              student={s}
              suggestedCounsellor={suggestedCounsellor()}
              onAssign={(cid) => reassign(s.id, cid)}
              expanded={expanded === s.id}
              onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
              messages={messages?.[s.id] || []}
              onSendMessage={onSendMessage}
            />
          ))}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* SECTION 2 — INCOMPLETE                                     */}
      {/* ────────────────────────────────────────────────────────── */}
      <SectionHeader
        number="02"
        title="Incomplete"
        count={incomplete.length}
        accent="stone"
        sub={
          incomplete.length > 0
            ? "Students with pending items, sorted by closest submission deadline."
            : "Nobody is behind — the bar is clear."
        }
      />

      {incomplete.length === 0 ? (
        <EmptyRow message="No pending students." tone="emerald" />
      ) : (
        <div className="border border-stone-900/20 bg-white/30">
          {incomplete.map((s, idx) => (
            <IncompleteRow
              key={s.id}
              idx={idx}
              student={s}
              onReassign={(cid) => reassign(s.id, cid)}
              expanded={expanded === s.id}
              onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
              messages={messages?.[s.id] || []}
              onSendMessage={onSendMessage}
            />
          ))}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* SECTION 3 — COMPLETE                                       */}
      {/* ────────────────────────────────────────────────────────── */}
      <SectionHeader
        number="03"
        title="Complete · ready for audit"
        count={complete.length}
        accent="emerald"
        sub={
          complete.length > 0
            ? "Open an audit to review their CV, full application, and university targets — then archive."
            : "No completed students yet."
        }
      />

      {complete.length === 0 ? (
        <EmptyRow message="No one's finished yet." tone="stone" />
      ) : (
        <div className="border border-stone-900/20 bg-white/30">
          {complete.map((s, idx) => (
            <CompleteRow
              key={s.id}
              idx={idx}
              student={s}
              expanded={expanded === s.id}
              onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
              onArchive={() => archive(s.id)}
              messages={messages?.[s.id] || []}
              onSendMessage={onSendMessage}
            />
          ))}
        </div>
      )}

      {/* Archived footer */}
      {archivedIds.size > 0 && (
        <div className="mt-12 border-t border-stone-900/20 pt-6">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900"
          >
            {showArchived ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Archived · {archivedIds.size}
          </button>
          {showArchived && (
            <div className="mt-3 border border-stone-900/15 bg-white/20">
              {students
                .filter((s) => archivedIds.has(s.id))
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between border-b border-stone-900/10 px-4 py-2 text-xs last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-[10px] text-stone-500">
                        {s.paths[0]?.university} · counsellor {counsellorName(s.counsellorId)}
                      </p>
                    </div>
                    <button
                      onClick={() => unarchive(s.id)}
                      className="text-[10px] uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900"
                    >
                      Unarchive
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ============================================================
// Admin row variants — one per section
// ============================================================

function SectionHeader({ number, title, count, accent, sub, action }) {
  const accentColor = {
    amber: "bg-amber-100 text-amber-900 border-amber-700/40",
    stone: "bg-stone-100 text-stone-900 border-stone-400",
    emerald: "bg-emerald-100 text-emerald-900 border-emerald-700/40",
  }[accent];

  return (
    <div className="mt-12 mb-3 flex items-end justify-between gap-4 border-b border-stone-900/30 pb-2">
      <div className="min-w-0">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-xs italic text-stone-500">{number}</span>
          <h3 className="font-serif text-xl">{title}</h3>
          <span className={`inline-flex items-center border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] ${accentColor}`}>
            {count}
          </span>
        </div>
        {sub && <p className="mt-1 max-w-2xl text-xs text-stone-600">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyRow({ message, tone }) {
  const c =
    tone === "emerald"
      ? "border-emerald-700/30 bg-emerald-50 text-emerald-900"
      : "border-stone-900/15 bg-white/30 text-stone-500";
  return (
    <div className={`border ${c} px-4 py-4 text-center text-xs italic`}>{message}</div>
  );
}

function RowChevron({ open }) {
  return open ? (
    <ChevronDown className="h-3.5 w-3.5 text-stone-500" />
  ) : (
    <ChevronRight className="h-3.5 w-3.5 text-stone-500" />
  );
}

function UnassignedRow({
  idx,
  student,
  suggestedCounsellor,
  onAssign,
  expanded,
  onToggle,
  messages,
  onSendMessage,
}) {
  const days = daysUntil(student.submissionDeadline);
  return (
    <div className="border-b border-stone-900/10 last:border-b-0">
      <div
        className="grid items-center gap-3 px-4 py-3 hover:bg-white/40"
        style={{ gridTemplateColumns: "1.5rem 1fr 1.2fr 5rem 11rem 6rem 5rem" }}
      >
        <span className="font-serif text-xs italic text-stone-500">
          {String(idx + 1).padStart(2, "0")}
        </span>
        <button onClick={onToggle} className="min-w-0 text-left">
          <p className="truncate text-sm font-medium hover:underline">{student.name}</p>
          <p className="truncate text-[10px] text-stone-500">
            {student.parentName} · +{student.parentPhone}
          </p>
        </button>
        <div className="min-w-0">
          <p className="truncate text-xs text-stone-700">{student.paths[0]?.university}</p>
          <p className="truncate text-[10px] text-stone-500">{student.paths[0]?.program}</p>
        </div>
        <span className={`text-xs ${days <= 1 ? "text-red-700" : "text-stone-700"}`}>
          <Clock className="mr-1 inline h-3 w-3" />
          {days}d
        </span>
        <div className="flex items-center gap-1">
          <select
            defaultValue=""
            onChange={(e) => onAssign(e.target.value)}
            className="w-full border border-stone-900/30 bg-white/60 px-2 py-1 text-[11px] outline-none focus:border-stone-900"
          >
            <option value="" disabled>
              Assign to…
            </option>
            {COUNSELLORS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => onAssign(suggestedCounsellor.id)}
          className="border border-stone-900/30 bg-white/60 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-stone-700 hover:border-stone-900"
          title={`Suggest: ${suggestedCounsellor.name} (lightest load)`}
        >
          ✨ Suggest
        </button>
        <button
          onClick={onToggle}
          className="inline-flex items-center justify-end gap-1 text-[10px] uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900"
        >
          {expanded ? "Hide" : "Profile"}
          <RowChevron open={expanded} />
        </button>
      </div>
      {expanded && (
        <StudentDetail
          student={student}
          messages={messages}
          onSendMessage={onSendMessage}
          viewerRole="admin"
        />
      )}
    </div>
  );
}

function IncompleteRow({
  idx,
  student,
  onReassign,
  expanded,
  onToggle,
  messages,
  onSendMessage,
}) {
  const { done, total, pct } = completionFor(student);
  const days = daysUntil(student.submissionDeadline);
  const missing = missingItems(student);
  // Top 2 missing items as a quick read.
  const missingPreview = missing
    .slice(0, 2)
    .map((m) => m.item)
    .join(", ") + (missing.length > 2 ? `, +${missing.length - 2} more` : "");
  return (
    <div className="border-b border-stone-900/10 last:border-b-0">
      <div
        className="grid items-center gap-3 px-4 py-3 hover:bg-white/40"
        style={{ gridTemplateColumns: "1.5rem 1.2fr 1fr 7rem 4rem 6rem 4rem" }}
      >
        <span className="font-serif text-xs italic text-stone-500">
          {String(idx + 1).padStart(2, "0")}
        </span>
        <button onClick={onToggle} className="min-w-0 text-left">
          <p className="truncate text-sm font-medium hover:underline">{student.name}</p>
          <p className="truncate text-[10px] italic text-stone-500">
            Missing: {missingPreview}
          </p>
        </button>
        <select
          value={student.counsellorId || ""}
          onChange={(e) => onReassign(e.target.value)}
          className="border-b border-stone-900/30 bg-transparent py-1 text-xs outline-none focus:border-stone-900"
        >
          {COUNSELLORS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <ProgressBar pct={pct} done={done} total={total} />
        <span className={`text-xs ${days <= 1 ? "text-red-700" : "text-stone-700"}`}>
          <Clock className="mr-1 inline h-3 w-3" />
          {days}d
        </span>
        <a
          href={whatsAppLink(student)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 border border-emerald-700 bg-emerald-700 px-2 py-1.5 text-[10px] uppercase tracking-[0.15em] text-white transition hover:bg-emerald-800"
          title={`WhatsApp ${student.parentName}`}
        >
          <MessageCircle className="h-3 w-3" />
          Parent
        </a>
        <button
          onClick={onToggle}
          className="inline-flex items-center justify-end gap-1 text-[10px] uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900"
        >
          {expanded ? "Hide" : "Profile"}
          <RowChevron open={expanded} />
        </button>
      </div>
      {expanded && (
        <StudentDetail
          student={student}
          messages={messages}
          onSendMessage={onSendMessage}
          viewerRole="admin"
        />
      )}
    </div>
  );
}

function CompleteRow({
  idx,
  student,
  expanded,
  onToggle,
  onArchive,
  messages,
  onSendMessage,
}) {
  const earliestUni = student.paths
    .map((p) => ({ uni: p.university, deadline: deadlineFor(p.university) }))
    .filter((x) => x.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];

  return (
    <div className="border-b border-stone-900/10 last:border-b-0">
      <div
        className="grid items-center gap-3 px-4 py-3 hover:bg-white/40"
        style={{ gridTemplateColumns: "1.5rem 1.2fr 1.4fr 1fr 6rem 6rem 4rem" }}
      >
        <span className="font-serif text-xs italic text-stone-500">
          {String(idx + 1).padStart(2, "0")}
        </span>
        <button onClick={onToggle} className="min-w-0 text-left">
          <p className="truncate text-sm font-medium hover:underline">{student.name}</p>
          <p className="truncate text-[10px] text-stone-500">
            Counsellor · {counsellorName(student.counsellorId)}
          </p>
        </button>
        <div className="min-w-0">
          <p className="truncate text-xs text-stone-700">{student.paths[0]?.university}</p>
          <p className="truncate text-[10px] text-stone-500">{student.paths[0]?.program}</p>
        </div>
        <p className="truncate text-[10px] text-stone-500">
          {earliestUni && (
            <>
              Apply by <span className="text-stone-700">{fmtDate(earliestUni.deadline)}</span>
            </>
          )}
        </p>
        <button
          onClick={onToggle}
          className="border border-stone-900 bg-stone-900 px-2 py-1.5 text-[10px] uppercase tracking-[0.15em] text-stone-50 transition hover:bg-stone-800"
          title="Audit full application — CV, documents, messages"
        >
          ✓ Audit
        </button>
        <button
          onClick={onArchive}
          className="border border-stone-900/30 bg-white/60 px-2 py-1.5 text-[10px] uppercase tracking-[0.15em] text-stone-700 transition hover:border-stone-900"
        >
          📦 Archive
        </button>
        <button
          onClick={onToggle}
          className="inline-flex items-center justify-end gap-1 text-[10px] uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900"
        >
          <RowChevron open={expanded} />
        </button>
      </div>
      {expanded && (
        <StudentDetail
          student={student}
          messages={messages}
          onSendMessage={onSendMessage}
          viewerRole="admin"
        />
      )}
    </div>
  );
}


// ============================================================
// Counsellor Panel
// ============================================================
function CounsellorPanel({ counsellorId, students, messages, onSendMessage, onExit }) {
  const myStudents = students.filter((s) => s.counsellorId === counsellorId);
  const me = COUNSELLORS.find((c) => c.id === counsellorId);

  // Auto-select the first student on load (or when assignments change).
  const [selectedId, setSelectedId] = useState(myStudents[0]?.id ?? null);

  // If the currently-selected student is no longer assigned, fall back.
  useEffect(() => {
    if (selectedId && !myStudents.find((s) => s.id === selectedId)) {
      setSelectedId(myStudents[0]?.id ?? null);
    } else if (!selectedId && myStudents[0]) {
      setSelectedId(myStudents[0].id);
    }
  }, [myStudents, selectedId]);

  const selected = myStudents.find((s) => s.id === selectedId) || null;

  const stats = useMemo(() => {
    const total = myStudents.length;
    const filled = myStudents.filter((s) => completionFor(s).pct === 100).length;
    return { total, filled, pending: total - filled };
  }, [myStudents]);

  return (
    <>
      <button
        onClick={onExit}
        className="mb-6 inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" /> exit
      </button>

      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">Counsellor</p>
          <h2 className="mt-1 font-serif text-3xl leading-tight">
            {me?.name} · <span className="italic text-stone-500">your students</span>
          </h2>
        </div>
        <div className="flex gap-6 text-xs">
          <Stat n={stats.total} label="Assigned" />
          <Stat n={stats.filled} label="Complete" />
          <Stat n={stats.pending} label="Pending" />
        </div>
      </div>

      {myStudents.length === 0 ? (
        <div className="mt-10 border border-dashed border-stone-900/30 p-10 text-center">
          <p className="text-sm italic text-stone-600">
            You don't have any students assigned yet.
          </p>
          <p className="mt-2 text-xs text-stone-500">
            An admin needs to assign students to you from the admin panel.
          </p>
        </div>
      ) : (
        <div
          className="mt-6 grid gap-4"
          style={{ gridTemplateColumns: "16rem 1fr" }}
        >
          {/* Left rail: student list */}
          <aside className="border border-stone-900/20 bg-white/30">
            <div className="border-b border-stone-900/20 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
                Roster · {myStudents.length}
              </p>
            </div>
            <ul>
              {myStudents.map((s) => {
                const { pct } = completionFor(s);
                const days = daysUntil(s.submissionDeadline);
                const thread = messages?.[s.id] || [];
                const lastMsg = thread[thread.length - 1];
                const unreadFromStudent = lastMsg && lastMsg.from === "student";
                const isSelected = s.id === selectedId;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelectedId(s.id)}
                      className={`block w-full border-l-2 px-3 py-2.5 text-left transition ${
                        isSelected
                          ? "border-stone-900 bg-stone-900 text-stone-50"
                          : "border-transparent hover:border-stone-900/40 hover:bg-white/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{s.name}</p>
                        {unreadFromStudent && (
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              isSelected ? "bg-emerald-300" : "bg-emerald-700"
                            }`}
                            title="New message from student"
                          />
                        )}
                      </div>
                      <p className={`mt-0.5 truncate text-[10px] ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                        {s.paths[0]?.university}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px]">
                        <span
                          className={
                            isSelected
                              ? "text-stone-300"
                              : pct === 100
                              ? "text-emerald-700"
                              : "text-amber-700"
                          }
                        >
                          {pct}%
                        </span>
                        <span className={isSelected ? "text-stone-300" : days <= 1 ? "text-red-700" : "text-stone-500"}>
                          <Clock className="mr-0.5 inline h-2.5 w-2.5" />
                          {days}d
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Right pane: selected student's full workspace */}
          <section className="min-w-0 border border-stone-900/20 bg-white/30">
            {!selected ? (
              <div className="p-12 text-center">
                <p className="text-sm italic text-stone-500">Select a student from the left to begin.</p>
              </div>
            ) : (
              <CounsellorWorkspace
                student={selected}
                messages={messages?.[selected.id] || []}
                onSendMessage={onSendMessage}
              />
            )}
          </section>
        </div>
      )}
    </>
  );
}

// ---------- Counsellor workspace (right pane) ----------
function CounsellorWorkspace({ student, messages, onSendMessage }) {
  const [tab, setTab] = useState("documents");
  const counsellor = student.counsellorId
    ? COUNSELLORS.find((c) => c.id === student.counsellorId)
    : null;

  const tabs = [
    { id: "documents", label: "Documents" },
    { id: "resume", label: "Resume" },
    { id: "cv", label: "Full CV" },
    {
      id: "intake",
      label: intakeFor(student.id)?.status === "complete" ? "Intake" : "Intake ⚠",
    },
    { id: "messages", label: "Messages" },
  ];

  return (
    <div>
      {/* Header strip */}
      <div className="flex flex-wrap items-center gap-4 border-b border-stone-900/20 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-xl">{student.name}</p>
          <p className="text-xs text-stone-500">
            {student.parentName} · +{student.parentPhone} · {student.paths[0]?.university}
          </p>
        </div>
        <ProgressBar
          pct={completionFor(student).pct}
          done={completionFor(student).done}
          total={completionFor(student).total}
          wide
        />
        <span
          className={`text-xs ${
            daysUntil(student.submissionDeadline) <= 1 ? "text-red-700" : "text-stone-700"
          }`}
        >
          <Clock className="mr-1 inline h-3 w-3" />
          {daysUntil(student.submissionDeadline)}d
        </span>
        <a
          href={whatsAppLink(student)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 border border-emerald-700 bg-emerald-700 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-white transition hover:bg-emerald-800"
        >
          <MessageCircle className="h-3 w-3" />
          Parent
        </a>
      </div>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-6 border-b border-stone-900/15 px-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 py-2.5 text-[10px] uppercase tracking-[0.2em] transition ${
              tab === t.id
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="px-4 py-4">
        {tab === "documents" && <DocumentsAtAGlance student={student} />}
        {tab === "resume" && <StudentResume student={student} />}
        {tab === "cv" && <StudentCV student={student} />}
        {tab === "intake" && <StudentIntake student={student} viewerRole="counsellor" />}
        {tab === "messages" && (
          <MessageThread
            messages={messages}
            currentUser="counsellor"
            counterparty={student.name}
            onSend={(text) => onSendMessage(student.id, text)}
            placeholder={`Message ${student.name}…`}
            showWhatsAppNote
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Shared admin/counsellor pieces
// ============================================================
function Stat({ n, label }) {
  return (
    <div className="text-right">
      <p className="font-serif text-2xl">{n}</p>
      <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{label}</p>
    </div>
  );
}

function ProgressBar({ pct, done, total, wide = false }) {
  const color =
    pct === 100 ? "bg-emerald-700" : pct >= 50 ? "bg-amber-600" : "bg-stone-400";
  return (
    <div className={wide ? "min-w-[10rem] flex-1" : ""}>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden bg-stone-300/60">
          <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <span className="shrink-0 text-[10px] tabular-nums text-stone-600">
          {done}/{total}
        </span>
      </div>
    </div>
  );
}

function StudentDetail({ student, messages = [], onSendMessage, viewerRole = "admin" }) {
  const [tab, setTab] = useState("documents");
  const counsellor = student.counsellorId
    ? COUNSELLORS.find((c) => c.id === student.counsellorId)
    : null;

  const tabs = [
    { id: "documents", label: "Documents" },
    { id: "resume", label: "Resume" },
    { id: "cv", label: "Full CV" },
    {
      id: "intake",
      label:
        intakeFor(student.id)?.status === "complete"
          ? "Intake"
          : student.counsellorId
          ? "Intake ⚠"
          : "Intake",
    },
    { id: "messages", label: counsellor ? `Messages · ${counsellor.name}` : "Messages" },
  ];

  return (
    <div className="border-t border-stone-900/15 bg-stone-50/50">
      {/* Sub-tabs */}
      <nav className="flex flex-wrap gap-6 border-b border-stone-900/15 px-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 py-2.5 text-[10px] uppercase tracking-[0.2em] transition ${
              tab === t.id
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="px-4 py-4">
        {tab === "documents" && <DocumentsAtAGlance student={student} />}
        {tab === "resume" && <StudentResume student={student} />}
        {tab === "cv" && <StudentCV student={student} />}
        {tab === "intake" && <StudentIntake student={student} viewerRole={viewerRole} />}
        {tab === "messages" && (
          <div className="max-w-2xl">
            {!counsellor ? (
              <div className="border border-dashed border-stone-900/30 p-6 text-center">
                <p className="text-sm italic text-stone-600">
                  Not yet assigned a counsellor — assign one above to start a thread.
                </p>
              </div>
            ) : (
              <MessageThread
                messages={messages}
                currentUser={viewerRole === "counsellor" ? "counsellor" : "admin"}
                counterparty={viewerRole === "counsellor" ? student.name : `${student.name} ↔ ${counsellor.name}`}
                onSend={
                  viewerRole === "counsellor"
                    ? (text) => onSendMessage?.(student.id, text)
                    : null // admin is read-only on the thread
                }
                placeholder={
                  viewerRole === "counsellor"
                    ? `Message ${student.name}…`
                    : "Admins can read but not send. (Switch to counsellor view to reply.)"
                }
                showWhatsAppNote={viewerRole === "counsellor"}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Documents at-a-glance ----------
function DocumentsAtAGlance({ student }) {
  const submitted = ALL_REQUIRED.filter(({ item }) => student.filled[item]);
  const missing = ALL_REQUIRED.filter(({ item }) => !student.filled[item]);

  // Group helper
  const groupBySection = (items) =>
    items.reduce((acc, m) => {
      (acc[m.section] = acc[m.section] || []).push(m.item);
      return acc;
    }, {});

  const submittedGrouped = groupBySection(submitted);
  const missingGrouped = groupBySection(missing);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Meta column */}
      <div className="md:col-span-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
          Submission deadline
        </p>
        <p className="mt-1 text-sm">
          {fmtDate(student.submissionDeadline)}
          <span className="ml-2 text-xs text-stone-500">
            ({daysUntil(student.submissionDeadline)} days)
          </span>
        </p>

        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-stone-500">
          Applying to
        </p>
        <ul className="mt-1 space-y-1.5">
          {student.paths.map((p, i) => (
            <li key={i} className="text-xs">
              <span className="font-medium">{p.university}</span>
              <span className="block text-stone-500">{p.program}</span>
              <span className="block italic text-stone-500">
                Due {fmtDate(deadlineFor(p.university))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Submitted column */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-700">
          Submitted ({submitted.length})
        </p>
        {submitted.length === 0 ? (
          <p className="mt-2 text-xs italic text-stone-500">Nothing submitted yet.</p>
        ) : (
          <div className="mt-2 space-y-3">
            {Object.entries(submittedGrouped).map(([section, items]) => (
              <div key={section}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-700">
                  {section}
                </p>
                <ul className="mt-0.5 space-y-0.5">
                  {items.map((it) => (
                    <li key={it} className="flex items-baseline gap-1.5 text-xs text-stone-700">
                      <Check className="h-3 w-3 shrink-0 text-emerald-700" strokeWidth={3} />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Missing column */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-700">
          Pending ({missing.length})
        </p>
        {missing.length === 0 ? (
          <p className="mt-2 text-xs italic text-emerald-700">
            <Check className="mr-1 inline h-3 w-3" />
            All complete.
          </p>
        ) : (
          <div className="mt-2 space-y-3">
            {Object.entries(missingGrouped).map(([section, items]) => (
              <div key={section}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-700">
                  {section}
                </p>
                <ul className="mt-0.5 space-y-0.5">
                  {items.map((it) => (
                    <li key={it} className="flex items-baseline gap-1.5 text-xs text-stone-600">
                      <span className="inline-block h-3 w-3 shrink-0 border border-amber-700/60" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Auto-generated CV / Resume ----------
function StudentCV({ student }) {
  const empty = !student.school && !student.summary;

  if (empty) {
    return (
      <div className="border border-dashed border-stone-900/30 p-8 text-center">
        <p className="text-sm italic text-stone-600">
          Not enough profile data to generate a CV yet.
        </p>
        <p className="mt-2 text-xs text-stone-500">
          The student needs to fill in their basic profile, school, activities, and achievements.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl border border-stone-900/30 bg-white p-8 font-serif text-stone-900 shadow-sm">
      {/* Header */}
      <div className="border-b-2 border-stone-900 pb-4">
        <h1 className="text-3xl font-semibold leading-none">{student.name}</h1>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-600">
          {student.paths[0]?.program} · {student.paths[0]?.university}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-700">
          {student.email && <span>{student.email}</span>}
          {student.phone && <span>· {student.phone}</span>}
          {student.city && <span>· {student.city}</span>}
        </div>
      </div>

      {/* Summary */}
      {student.summary && (
        <CVSection title="Summary">
          <p className="text-sm leading-relaxed text-stone-700">{student.summary}</p>
        </CVSection>
      )}

      {/* Education */}
      <CVSection title="Education">
        <div className="space-y-2">
          {student.school && (
            <div>
              <p className="text-sm font-medium">{student.school}</p>
              <p className="text-xs text-stone-600">
                {student.marks10 != null && <>Class 10: <span className="text-stone-800">{student.marks10}%</span></>}
                {student.marks10 != null && student.marks12 != null && " · "}
                {student.marks12 != null && <>Class 12: <span className="text-stone-800">{student.marks12}%</span></>}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium">Target — {student.paths[0]?.university}</p>
            <p className="text-xs text-stone-600">
              {student.paths[0]?.program} · Application due {fmtDate(deadlineFor(student.paths[0]?.university))}
            </p>
          </div>
        </div>
      </CVSection>

      {/* Test scores */}
      {Object.keys(student.testScores || {}).length > 0 && (
        <CVSection title="Standardised tests">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {Object.entries(student.testScores).map(([test, score]) => (
              <li key={test} className="flex items-baseline justify-between border-b border-stone-200 pb-1">
                <span className="text-stone-700">{test}</span>
                <span className="font-medium">{score}</span>
              </li>
            ))}
          </ul>
        </CVSection>
      )}

      {/* Activities */}
      {student.activities?.length > 0 && (
        <CVSection title="Activities & Leadership">
          <ul className="space-y-1.5 text-sm">
            {student.activities.map((a, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <span className="text-stone-400">—</span>
                <span className="text-stone-700">{a}</span>
              </li>
            ))}
          </ul>
        </CVSection>
      )}

      {/* Internships */}
      {student.internships?.length > 0 && (
        <CVSection title="Experience">
          <ul className="space-y-1.5 text-sm">
            {student.internships.map((a, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <span className="text-stone-400">—</span>
                <span className="text-stone-700">{a}</span>
              </li>
            ))}
          </ul>
        </CVSection>
      )}

      {/* Awards */}
      {student.awards?.length > 0 && (
        <CVSection title="Awards & Recognition">
          <ul className="space-y-1.5 text-sm">
            {student.awards.map((a, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <span className="text-stone-400">—</span>
                <span className="text-stone-700">{a}</span>
              </li>
            ))}
          </ul>
        </CVSection>
      )}

      {/* Footer */}
      <div className="mt-8 border-t border-stone-300 pt-3 text-center text-[10px] italic text-stone-500">
        Auto-generated by Campus Connect · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </div>
    </div>
  );
}

function CVSection({ title, children }) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-700">
        {title}
      </h3>
      {children}
    </section>
  );
}

// ---------- Student resume (1-page, condensed) ----------
function StudentResume({ student }) {
  const empty = !student.school && !student.summary;
  if (empty) {
    return (
      <div className="border border-dashed border-stone-900/30 p-8 text-center">
        <p className="text-sm italic text-stone-600">
          Not enough profile data to generate a resume yet.
        </p>
        <p className="mt-2 text-xs text-stone-500">
          The student needs to fill in their basic profile first.
        </p>
      </div>
    );
  }

  const fmtMarks = (m) => (m != null ? `${m}%` : "—");
  const acts = student.activities || [];
  const ints = student.internships || [];
  const awds = student.awards || [];
  const tests = Object.entries(student.testScores || {});

  return (
    <div className="mx-auto max-w-2xl border border-stone-900/30 bg-white p-8 font-serif text-stone-900 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between gap-4 border-b-2 border-stone-900 pb-2">
        <div>
          <h2 className="text-2xl font-bold leading-none">{student.name}</h2>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-stone-600">
            {student.paths[0]?.program} · Class of 2026
          </p>
        </div>
        <div className="text-right text-[10px] text-stone-600">
          {student.email && <p>{student.email}</p>}
          {student.phone && <p>{student.phone}</p>}
          {student.city && <p>{student.city}</p>}
        </div>
      </div>

      {student.summary && (
        <p className="mb-4 text-sm italic leading-snug text-stone-700">{student.summary}</p>
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
        <div>
          <h3 className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-700">Education</h3>
          <p className="font-medium">{student.school || "—"}</p>
          <p className="text-stone-600">Class XII: {fmtMarks(student.marks12)}</p>
          <p className="text-stone-600">Class X: {fmtMarks(student.marks10)}</p>
        </div>
        <div>
          <h3 className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-700">Test Scores</h3>
          {tests.length ? (
            tests.map(([t, s]) => (
              <p key={t}>
                <span className="font-medium">{t.toUpperCase()}</span> · {s}
              </p>
            ))
          ) : (
            <p className="italic text-stone-500">Pending</p>
          )}
        </div>
        <div className="col-span-2">
          <h3 className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-700">Activities & Leadership</h3>
          {acts.length ? (
            <ul className="space-y-0.5">
              {acts.slice(0, 4).map((a, i) => (
                <li key={i}>— {a}</li>
              ))}
            </ul>
          ) : (
            <p className="italic text-stone-500">No activities listed yet.</p>
          )}
        </div>
        {ints.length > 0 && (
          <div className="col-span-2">
            <h3 className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-700">Experience</h3>
            <ul className="space-y-0.5">
              {ints.slice(0, 3).map((it, i) => (
                <li key={i}>— {it}</li>
              ))}
            </ul>
          </div>
        )}
        {awds.length > 0 && (
          <div className="col-span-2">
            <h3 className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-700">Awards & Recognition</h3>
            <ul className="space-y-0.5">
              {awds.slice(0, 4).map((a, i) => (
                <li key={i}>— {a}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="mt-5 border-t border-stone-300 pt-2 text-center text-[9px] italic text-stone-500">
        Auto-generated 1-page resume · Full CV in the next tab
      </p>
    </div>
  );
}

// ---------- Intake transcript (admin + counsellor) ----------
function StudentIntake({ student, viewerRole = "admin" }) {
  const intake = intakeFor(student.id);
  const counsellor = student.counsellorId
    ? COUNSELLORS.find((c) => c.id === student.counsellorId)
    : null;

  if (!intake || intake.status === "not_started") {
    return (
      <div className="border border-dashed border-amber-700/40 bg-amber-50 p-6">
        <p className="font-serif text-sm font-medium text-stone-900">
          Intake call not yet completed
        </p>
        <p className="mt-1 text-xs text-stone-700">
          {counsellor
            ? `${counsellor.name} hasn't conducted the intake call with ${student.name} yet. This is the first counsellor task before applications can move forward.`
            : `Assign a counsellor first — the intake call is their first task.`}
        </p>
        {viewerRole === "counsellor" && counsellor && (
          <button className="mt-4 inline-flex items-center gap-1.5 border border-stone-900 bg-stone-900 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-stone-50 transition hover:bg-stone-800">
            📞 Schedule intake call
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <aside className="md:col-span-1">
        <div className="border border-stone-900/30 bg-white p-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">Intake summary</p>
          <p className="mt-2 font-serif text-sm font-medium leading-snug text-stone-900">
            {intake.summary.headline}
          </p>
          <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-stone-500">Conducted</p>
          <p className="text-xs text-stone-700">
            {fmtDate(intake.date)} · {intake.duration} · {intake.channel}
          </p>
          <p className="mt-1 text-xs text-stone-700">
            By {COUNSELLORS.find((c) => c.id === intake.counsellorId)?.name || "—"}
          </p>

          <SummaryBlock title="Goals" items={intake.summary.goals} />
          <SummaryBlock title="Strengths" items={intake.summary.strengths} tone="emerald" />
          <SummaryBlock title="Concerns" items={intake.summary.concerns} tone="amber" />

          {intake.summary.financialNotes && (
            <>
              <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-stone-500">Financial</p>
              <p className="text-xs text-stone-700">{intake.summary.financialNotes}</p>
            </>
          )}
        </div>

        <div className="mt-4 border border-stone-900/30 bg-white p-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">Action items</p>
          <p className="mt-1 text-[10px] italic text-stone-500">
            Each is a task. Tick off when done.
          </p>
          <ul className="mt-3 space-y-2">
            {intake.actionItems.map((a) => {
              const overdue = a.due !== "ongoing" && daysUntil(a.due) < 0 && !a.done;
              return (
                <li key={a.id} className="flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    defaultChecked={a.done}
                    disabled={viewerRole === "admin"}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`leading-snug ${a.done ? "text-stone-400 line-through" : "text-stone-800"}`}>
                      {a.text}
                    </p>
                    <p className="mt-0.5 text-[10px] text-stone-500">
                      <span className={`uppercase tracking-[0.15em] ${a.owner === "counsellor" ? "text-amber-700" : "text-stone-500"}`}>
                        {a.owner}
                      </span>
                      {" · "}
                      <span className={overdue ? "font-medium text-red-700" : ""}>
                        {a.due === "ongoing" ? "ongoing" : `due ${fmtDate(a.due)}${overdue ? " (overdue)" : ""}`}
                      </span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <div className="md:col-span-2">
        <div className="border border-stone-900/30 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">Full transcript</p>
          <div className="mt-3 space-y-3">
            {intake.transcript.map((line, i) => {
              const isCounsellor = line.speaker === "counsellor";
              const speaker = isCounsellor
                ? COUNSELLORS.find((c) => c.id === intake.counsellorId)?.name || "Counsellor"
                : student.name;
              return (
                <div
                  key={i}
                  className={`flex gap-3 ${isCounsellor ? "" : "rounded-sm bg-stone-50 p-2 -m-2"}`}
                >
                  <p
                    className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.15em] ${isCounsellor ? "text-amber-700" : "text-stone-700"}`}
                    style={{ minWidth: "5rem" }}
                  >
                    {speaker.split(" ")[0]}:
                  </p>
                  <p className="font-serif text-sm leading-relaxed text-stone-800">
                    {line.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryBlock({ title, items, tone = "stone" }) {
  if (!items || !items.length) return null;
  const dotColor = { stone: "bg-stone-500", emerald: "bg-emerald-600", amber: "bg-amber-600" }[tone];
  return (
    <>
      <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-stone-500">{title}</p>
      <ul className="mt-1 space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-stone-700">
            <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${dotColor}`} />
            <span className="leading-snug">{it}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

// ---------- Counsellor workload strip (top of admin panel) ----------
function CounsellorWorkloadStrip({ students }) {
  const workloads = COUNSELLORS.map((c) => ({
    counsellor: c,
    workload: counsellorWorkload(c, students),
  }));
  workloads.sort((a, b) => {
    const aHot = a.workload.intakesPending + a.workload.pendingTasks + a.workload.imminent;
    const bHot = b.workload.intakesPending + b.workload.pendingTasks + b.workload.imminent;
    return bHot - aHot;
  });

  const totalOutstanding = workloads.reduce(
    (sum, w) => sum + w.workload.intakesPending + w.workload.pendingTasks,
    0
  );

  return (
    <div className="mt-8 border border-stone-900/20 bg-white/40 p-4">
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">Counsellor workload</p>
        <p className="font-serif text-base">
          Outstanding work across the team ·{" "}
          <span className="font-medium">{totalOutstanding} items</span>
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {workloads.map(({ counsellor, workload }) => {
          const hot = workload.intakesPending > 0 || workload.imminent > 0;
          return (
            <div
              key={counsellor.id}
              className={`border p-3 ${hot ? "border-amber-700/50 bg-amber-50/60" : "border-stone-900/20 bg-white/60"}`}
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="font-serif text-sm font-medium">{counsellor.name}</p>
                  <p className="text-[10px] text-stone-500">
                    {workload.studentCount}{" "}
                    {workload.studentCount === 1 ? "student" : "students"}
                  </p>
                </div>
                <a
                  href={counsellorPromptLink(counsellor, students)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`shrink-0 border px-2 py-1 text-[9px] uppercase tracking-[0.15em] transition ${
                    hot
                      ? "border-stone-900 bg-stone-900 text-stone-50 hover:bg-stone-800"
                      : "border-stone-900/30 bg-white/60 text-stone-700 hover:border-stone-900"
                  }`}
                  title={hot ? "Prompt counsellor about pending work" : "Send a check-in"}
                >
                  {hot ? "📲 Prompt" : "Ping"}
                </a>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-y-1 text-[10px]">
                <span className="uppercase tracking-[0.1em] text-stone-500">Intakes pending</span>
                <span className={`text-right font-medium ${workload.intakesPending > 0 ? "text-amber-700" : "text-stone-700"}`}>
                  {workload.intakesPending}
                </span>

                <span className="uppercase tracking-[0.1em] text-stone-500">Action items open</span>
                <span className={`text-right font-medium ${workload.pendingTasks > 0 ? "text-stone-900" : "text-stone-500"}`}>
                  {workload.pendingTasks}
                </span>

                <span className="uppercase tracking-[0.1em] text-stone-500">Deadlines ≤ 1 day</span>
                <span className={`text-right font-medium ${workload.imminent > 0 ? "text-red-700" : "text-stone-500"}`}>
                  {workload.imminent}
                </span>

                <span className="uppercase tracking-[0.1em] text-stone-500">Incomplete profiles</span>
                <span className="text-right font-medium text-stone-700">{workload.incomplete}</span>
              </div>

              {workload.students.length > 0 && (
                <p className="mt-2 truncate text-[10px] italic text-stone-500">
                  {workload.students.map((s) => s.name).join(", ")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Message thread (shared) ----------
function MessageThread({ messages, currentUser, counterparty, onSend, placeholder, showWhatsAppNote = false }) {
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !onSend) return;
    onSend(text);
    setDraft("");
  };

  // "Your" side = bubble on right. Determine based on currentUser + msg.from.
  const isOwnMessage = (msg) => {
    if (currentUser === "student") return msg.from === "student";
    if (currentUser === "counsellor") return msg.from === "counsellor";
    return false; // admin sees both as "other"
  };

  return (
    <div className="flex flex-col">
      <div className="border border-stone-900/20 bg-white/60 p-3">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-xs italic text-stone-500">
            No messages yet. Say hi to {counterparty}.
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m, i) => {
              const own = isOwnMessage(m);
              return (
                <li key={i} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${own ? "items-end" : "items-start"} flex flex-col`}>
                    <div
                      className={`inline-block px-3 py-2 text-sm leading-snug ${
                        own
                          ? "bg-stone-900 text-stone-50"
                          : "border border-stone-300 bg-stone-50 text-stone-900"
                      }`}
                    >
                      {m.text}
                    </div>
                    <div className={`mt-1 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] text-stone-500 ${own ? "justify-end" : "justify-start"}`}>
                      <span>
                        {new Date(m.ts).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {m.channels?.includes("whatsapp") && (
                        <span className="inline-flex items-center gap-0.5 text-emerald-700">
                          · <MessageCircle className="h-2.5 w-2.5" /> wa
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Composer */}
      {onSend ? (
        <div className="mt-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={placeholder}
            rows={2}
            className="w-full resize-none border border-stone-900/30 bg-white/60 p-3 text-sm outline-none focus:border-stone-900"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[10px] italic text-stone-500">
              {showWhatsAppNote
                ? "Replies are sent via in-app chat AND mirrored to the student's WhatsApp."
                : "⌘/Ctrl + Enter to send"}
            </p>
            <button
              onClick={handleSend}
              disabled={!draft.trim()}
              className="inline-flex items-center gap-1.5 border border-stone-900 bg-stone-900 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-stone-50 transition enabled:hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Send
              {showWhatsAppNote && <MessageCircle className="h-3 w-3" />}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-[10px] italic text-stone-500">{placeholder}</p>
      )}
    </div>
  );
}

// ============================================================
// App Map — sitemap / flow overview
// ============================================================
function AppMap({
  onTeleport,
  students,
  messages,
  currentStudentId,
  activeCounsellorId,
  paths,
  updateStudent,
  sendMessage,
  setStudents,
}) {
  // Which student/counsellor to use for the data-driven thumbnails.
  // User can swap these from the controls under each card.
  const defaultStudent = students.find((s) => s.id === currentStudentId) || students[0];
  const [thumbStudentId, setThumbStudentId] = useState(defaultStudent.id);
  const [thumbCounsellorId, setThumbCounsellorId] = useState(() => {
    const assigned = COUNSELLORS.filter((c) => students.some((s) => s.counsellorId === c.id));
    return (assigned[0] || COUNSELLORS[0]).id;
  });
  const thumbStudent = students.find((s) => s.id === thumbStudentId) || defaultStudent;

  const screens = [
    { id: "persona", label: "Landing", role: "public", row: 1, col: 2, icon: "L",
      desc: "Hero, news strip, sign-in entry", connectsTo: ["studentLogin", "staffLogin"], thumbType: "wireframe" },
    { id: "studentLogin", label: "Student login", role: "student", row: 2, col: 1, icon: "🎓",
      desc: "Username/password + 10 demo accounts", connectsTo: ["studyPath", "dashboard"], thumbType: "wireframe" },
    { id: "staffLogin", label: "Staff login", role: "staff", row: 2, col: 3, icon: "🛡",
      desc: "Pick admin or counsellor role", connectsTo: ["adminPanel", "counsellorPanel"], thumbType: "wireframe" },
    { id: "studyPath", label: "Study path", role: "student", row: 3, col: 1, icon: "↦",
      desc: "Program / Univ / Country (multi-row)", connectsTo: ["dashboard"], thumbType: "wireframe" },
    { id: "adminPanel", label: "Admin panel", role: "staff", row: 3, col: 3, icon: "⊞",
      desc: "All students · assign · message · matrix", connectsTo: ["studentDetail"], thumbType: "live" },
    { id: "counsellorPanel", label: "Counsellor panel", role: "staff", row: 3, col: 4, icon: "▤",
      desc: "Your assigned students · chat", connectsTo: ["studentDetail"], thumbType: "live", needs: "counsellor" },
    { id: "dashboard", label: "Student dashboard", role: "student", row: 4, col: 1, icon: "▦",
      desc: "Tasks · 5 form tabs · messages tab", connectsTo: [], thumbType: "live", needs: "student" },
    { id: "studentDetail", label: "Student detail", role: "staff", row: 4, col: 3, icon: "👤",
      desc: "Documents · CV · Messages — opens inside admin/counsellor", connectsTo: [], readOnly: true, thumbType: "live", needs: "student" },
  ];

  const connections = [];
  screens.forEach((s) => {
    (s.connectsTo || []).forEach((targetId) => {
      const target = screens.find((t) => t.id === targetId);
      if (target) connections.push({ from: s, to: target });
    });
  });

  const roleColor = {
    public: "border-stone-900 bg-stone-100",
    student: "border-blue-700 bg-blue-50",
    staff: "border-emerald-700 bg-emerald-50",
  };
  const roleLabel = { public: "Public", student: "Student", staff: "Staff" };

  return (
    <div>
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">Site map</p>
          <h2 className="mt-2 font-serif text-3xl leading-tight">App flow at a glance</h2>
          <p className="mt-3 max-w-2xl text-sm text-stone-600">
            Every screen, who it's for, how it connects. Component-based screens render live
            with current data; the four entry-flow screens still show wireframes (those will
            go live once they're extracted into components).
          </p>
        </div>
        <Legend />
      </div>

      {/* Global thumbnail-data controls */}
      <div className="mb-8 flex flex-wrap items-center gap-4 border border-stone-900/20 bg-white/40 px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">Preview as</p>
        <label className="flex items-center gap-2 text-xs">
          <span className="text-stone-600">Student:</span>
          <select
            value={thumbStudentId}
            onChange={(e) => setThumbStudentId(e.target.value)}
            className="border-b border-stone-900/30 bg-transparent py-1 pr-4 text-xs outline-none focus:border-stone-900"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              const next = students[Math.floor(Math.random() * students.length)];
              setThumbStudentId(next.id);
            }}
            className="rounded-full border border-stone-900/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-stone-700 hover:border-stone-900 hover:bg-white/60"
            title="Pick a random student for the previews"
          >
            🎲 random
          </button>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <span className="text-stone-600">Counsellor:</span>
          <select
            value={thumbCounsellorId}
            onChange={(e) => setThumbCounsellorId(e.target.value)}
            className="border-b border-stone-900/30 bg-transparent py-1 pr-4 text-xs outline-none focus:border-stone-900"
          >
            {COUNSELLORS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              const assigned = COUNSELLORS.filter((c) =>
                students.some((s) => s.counsellorId === c.id)
              );
              const pool = assigned.length > 0 ? assigned : COUNSELLORS;
              const next = pool[Math.floor(Math.random() * pool.length)];
              setThumbCounsellorId(next.id);
            }}
            className="rounded-full border border-stone-900/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-stone-700 hover:border-stone-900 hover:bg-white/60"
          >
            🎲 random
          </button>
        </label>
      </div>

      {/* Map grid with overlay arrows */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ zIndex: 1 }}
          aria-hidden="true"
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#78716c" />
            </marker>
          </defs>
          {connections.map((c, i) => (
            <ArrowPath key={i} from={c.from} to={c.to} />
          ))}
        </svg>

        <div
          className="relative grid gap-x-4 gap-y-12"
          style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", zIndex: 2 }}
        >
          {screens.map((s) => (
            <div
              key={s.id}
              id={`mapcard-${s.id}`}
              className={`col-span-1 ${
                s.col === 2 ? "col-start-2" : s.col === 3 ? "col-start-3" : s.col === 4 ? "col-start-4" : "col-start-1"
              }`}
              style={{ gridRow: s.row }}
            >
              <ScreenCard
                screen={s}
                roleColor={roleColor[s.role]}
                roleLabel={roleLabel[s.role]}
                onTeleport={onTeleport}
                thumbStudent={thumbStudent}
                thumbStudentId={thumbStudentId}
                thumbCounsellorId={thumbCounsellorId}
                students={students}
                messages={messages}
                paths={paths}
                updateStudent={updateStudent}
                sendMessage={sendMessage}
                setStudents={setStudents}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 border-t border-stone-900/20 pt-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">How to use</p>
        <ul className="mt-3 space-y-1.5 text-xs text-stone-600">
          <li>— <span className="font-semibold text-stone-800">Click any card</span> to teleport into that page.</li>
          <li>— <span className="font-semibold text-stone-800">🎲 Random</span> on student dashboard / counsellor panel jumps in as a randomly picked one.</li>
          <li>— Title bar or top-right <span className="font-semibold text-stone-800">Map</span> button always brings you back here.</li>
          <li>— Live thumbnails reflect the current state — change something, return here, and you'll see it.</li>
        </ul>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.2em]">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 border border-stone-900 bg-stone-100" />
        Public
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 border border-blue-700 bg-blue-50" />
        Student
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 border border-emerald-700 bg-emerald-50" />
        Staff
      </span>
    </div>
  );
}

function ScreenCard({
  screen,
  roleColor,
  roleLabel,
  onTeleport,
  thumbStudent,
  thumbStudentId,
  thumbCounsellorId,
  students,
  messages,
  paths,
  updateStudent,
  sendMessage,
  setStudents,
}) {
  // Click anywhere on the card → teleport to that page.
  const teleportPrimary = () => {
    if (screen.id === "dashboard") {
      onTeleport("dashboard", { studentId: thumbStudentId });
    } else if (screen.id === "counsellorPanel") {
      onTeleport("counsellorPanel", { counsellorId: thumbCounsellorId });
    } else if (screen.id === "studentDetail") {
      // Detail screen lives inside admin panel — go there.
      onTeleport("adminPanel");
    } else {
      onTeleport(screen.id);
    }
  };

  const teleportRandom = (e) => {
    e.stopPropagation(); // don't also fire the card click
    if (screen.id === "dashboard") {
      onTeleport("dashboard", { random: true });
    } else if (screen.id === "counsellorPanel") {
      onTeleport("counsellorPanel", { random: true });
    }
  };

  const showRandom = screen.needs === "student" || screen.needs === "counsellor";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={teleportPrimary}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          teleportPrimary();
        }
      }}
      className={`group flex h-full cursor-pointer flex-col border ${roleColor} p-3 transition hover:shadow-md`}
      title={`Open ${screen.label}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-2xl leading-none text-stone-700">{screen.icon}</span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-stone-500">{roleLabel}</span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-serif text-sm font-medium leading-tight">{screen.label}</p>
        <ArrowRight className="h-3 w-3 shrink-0 text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-stone-900" />
      </div>
      <p className="mt-1 text-[10px] leading-snug text-stone-600">{screen.desc}</p>

      {/* Live thumbnail or wireframe */}
      <div className="mt-2 overflow-hidden border border-stone-900/20 bg-white/60 transition group-hover:border-stone-900">
        {screen.thumbType === "live" ? (
          <LiveThumbnail
            screenId={screen.id}
            thumbStudent={thumbStudent}
            thumbCounsellorId={thumbCounsellorId}
            students={students}
            messages={messages}
            paths={paths}
            updateStudent={updateStudent}
            sendMessage={sendMessage}
            setStudents={setStudents}
          />
        ) : (
          <div className="p-2">
            <ScreenWireframe id={screen.id} />
          </div>
        )}
      </div>

      {/* Live data label + optional random button */}
      <div className="mt-2 flex items-center justify-between gap-2">
        {screen.thumbType === "live" ? (
          <p className="truncate text-[9px] italic text-stone-500">
            {screen.id === "dashboard" || screen.id === "studentDetail"
              ? `Showing: ${thumbStudent.name}`
              : screen.id === "counsellorPanel"
              ? `Showing: ${counsellorName(thumbCounsellorId)}`
              : "Showing: live"}
          </p>
        ) : (
          <span className="text-[9px] italic text-stone-400">Wireframe</span>
        )}
        {showRandom && (
          <button
            type="button"
            onClick={teleportRandom}
            className="shrink-0 border border-stone-900/40 bg-white/60 px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-stone-700 transition hover:border-stone-900 hover:bg-white"
            title="Teleport with a random pick"
          >
            🎲 random
          </button>
        )}
      </div>

      {screen.readOnly && (
        <p className="mt-2 text-[9px] italic text-stone-500">
          Tip: this view opens automatically — click here goes to the admin roster, then
          pick a student.
        </p>
      )}
    </div>
  );
}

// Wraps a real screen component, scaling it down for the map.
function LiveThumbnail({
  screenId,
  thumbStudent,
  thumbCounsellorId,
  students,
  messages,
  paths,
  updateStudent,
  sendMessage,
  setStudents,
  scale = 0.18,
  fixedWidth, // px — when set, the outer container has fixed dimensions (zoom modal)
  interactive = false, // when true, allows clicks/hovers inside the preview
}) {
  // Inner content renders at a fixed desktop size, then is scaled.
  const INNER_W = 1100;
  const INNER_H = 700;

  const noop = () => {};
  const noopSendMessage = (studentId, text, fromCounsellorId) =>
    sendMessage(studentId, {
      from: "counsellor",
      fromCounsellorId,
      text,
      ts: new Date().toISOString(),
      channels: ["chat", "whatsapp"],
    });

  let content = null;
  if (screenId === "dashboard") {
    const studentMessages = messages[thumbStudent.id] || [];
    content = (
      <Dashboard
        username={thumbStudent.name}
        paths={thumbStudent.paths}
        student={thumbStudent}
        messages={studentMessages}
        onSendMessage={noop}
        onUpdateStudent={noop}
        onEdit={noop}
        onReset={noop}
      />
    );
  } else if (screenId === "adminPanel") {
    content = (
      <AdminPanel
        students={students}
        setStudents={setStudents}
        messages={messages}
        onSendMessage={noopSendMessage}
        onExit={noop}
      />
    );
  } else if (screenId === "counsellorPanel") {
    content = (
      <CounsellorPanel
        counsellorId={thumbCounsellorId}
        students={students}
        messages={messages}
        onSendMessage={(studentId, text) =>
          sendMessage(studentId, {
            from: "counsellor",
            fromCounsellorId: thumbCounsellorId,
            text,
            ts: new Date().toISOString(),
            channels: ["chat", "whatsapp"],
          })
        }
        onExit={noop}
      />
    );
  } else if (screenId === "studentDetail") {
    content = (
      <div className="p-6">
        <StudentDetail
          student={thumbStudent}
          messages={messages[thumbStudent.id] || []}
          onSendMessage={noopSendMessage}
          viewerRole="counsellor"
        />
      </div>
    );
  }

  const outerStyle = fixedWidth
    ? {
        width: `${fixedWidth}px`,
        height: `${(fixedWidth * INNER_H) / INNER_W}px`,
        backgroundColor: "#f4f0e6",
      }
    : {
        width: "100%",
        aspectRatio: `${INNER_W} / ${INNER_H}`,
        backgroundColor: "#f4f0e6",
      };

  return (
    <div className="relative overflow-hidden" style={outerStyle}>
      <div
        className={`absolute left-0 top-0 ${interactive ? "" : "pointer-events-none"}`}
        style={{
          width: `${INNER_W}px`,
          height: `${INNER_H}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div className="px-6 py-4">{content}</div>
      </div>
    </div>
  );
}

function ArrowPath({ from, to }) {
  // Approximate card centers using grid math.
  // Card width ~ 1/4 of container; cards are taller now with live thumbnails.
  const COL_WIDTH_PCT = 100 / 4;
  const ROW_HEIGHT = 320; // px (card height + vertical gap)

  const x1 = (from.col - 0.5) * COL_WIDTH_PCT;
  const x2 = (to.col - 0.5) * COL_WIDTH_PCT;
  const y1 = (from.row - 1) * ROW_HEIGHT + 280; // bottom of source card
  const y2 = (to.row - 1) * ROW_HEIGHT + 30;    // top of target card

  // Curved path
  const midY = (y1 + y2) / 2;
  const d = `M ${x1}% ${y1} C ${x1}% ${midY}, ${x2}% ${midY}, ${x2}% ${y2}`;

  return (
    <path
      d={d}
      fill="none"
      stroke="#a8a29e"
      strokeWidth="1.5"
      strokeDasharray="4 3"
      markerEnd="url(#arrowhead)"
    />
  );
}

// Stylized wireframes — small SVGs representing each screen's gist.
function ScreenWireframe({ id }) {
  const common = { width: "100%", height: "60", viewBox: "0 0 200 80" };
  const stroke = "#78716c";
  const fill = "#e7e5e4";

  switch (id) {
    case "persona":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="10" y="8" width="80" height="6" fill={stroke} />
          <rect x="10" y="20" width="120" height="4" fill={fill} />
          <rect x="10" y="28" width="100" height="4" fill={fill} />
          <rect x="10" y="50" width="40" height="14" fill="#1c1917" />
          {/* News strip */}
          <rect x="120" y="50" width="70" height="14" fill="none" stroke={stroke} strokeDasharray="2 1" />
        </svg>
      );
    case "studentLogin":
    case "staffLogin":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="20" y="10" width="60" height="4" fill={fill} />
          <line x1="20" y1="22" x2="180" y2="22" stroke={stroke} />
          <rect x="20" y="32" width="40" height="4" fill={fill} />
          <line x1="20" y1="44" x2="180" y2="44" stroke={stroke} />
          <rect x="20" y="58" width="40" height="12" fill="#1c1917" />
        </svg>
      );
    case "studyPath":
      return (
        <svg {...common} aria-hidden="true">
          <line x1="10" y1="14" x2="190" y2="14" stroke={stroke} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={20 + i * 55} y="22" width="50" height="4" fill={fill} />
              <line x1={20 + i * 55} y1="34" x2={70 + i * 55} y2="34" stroke={stroke} />
              <rect x={20 + i * 55} y="42" width="30" height="3" fill={fill} />
            </g>
          ))}
          <rect x="10" y="62" width="40" height="12" fill="#1c1917" />
        </svg>
      );
    case "dashboard":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="10" y="6" width="100" height="4" fill={fill} />
          {/* Tabs */}
          <line x1="10" y1="18" x2="190" y2="18" stroke={stroke} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={12 + i * 30} y="14" width="22" height="3" fill={i === 0 ? "#1c1917" : fill} />
          ))}
          {/* Tasks panel */}
          <rect x="10" y="26" width="180" height="20" fill="none" stroke={stroke} />
          <rect x="14" y="32" width="60" height="3" fill={fill} />
          <rect x="14" y="38" width="40" height="3" fill={fill} />
          {/* Body */}
          <rect x="10" y="52" width="180" height="22" fill={fill} opacity="0.4" />
        </svg>
      );
    case "adminPanel":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="10" y="6" width="60" height="4" fill={stroke} />
          {/* Stats */}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={120 + i * 18} y="6" width="14" height="6" fill={fill} />
          ))}
          {/* Rows */}
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x="10" y={20 + i * 14} width="180" height="12" fill="none" stroke={stroke} strokeOpacity="0.4" />
              <rect x="14" y={24 + i * 14} width="50" height="3" fill={fill} />
              <rect x="80" y={24 + i * 14} width="40" height="3" fill={fill} />
              <rect x="130" y={24 + i * 14} width="30" height="3" fill="#10b981" />
              <rect x="170" y={24 + i * 14} width="14" height="4" fill="#059669" />
            </g>
          ))}
        </svg>
      );
    case "counsellorPanel":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="10" y="6" width="80" height="4" fill={stroke} />
          {/* Cards */}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="10" y={18 + i * 18} width="180" height="14" fill="none" stroke={stroke} strokeOpacity="0.5" />
              <rect x="14" y={22 + i * 18} width="50" height="3" fill={fill} />
              <rect x="14" y={27 + i * 18} width="80" height="2" fill={fill} />
              <rect x="120" y={22 + i * 18} width="40" height="3" fill="#10b981" />
              <rect x="170" y={22 + i * 18} width="14" height="4" fill="#059669" />
            </g>
          ))}
        </svg>
      );
    case "studentDetail":
      return (
        <svg {...common} aria-hidden="true">
          {/* Sub tabs */}
          <line x1="10" y1="12" x2="190" y2="12" stroke={stroke} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={12 + i * 30} y="8" width="22" height="3" fill={i === 0 ? "#1c1917" : fill} />
          ))}
          {/* 3 columns: meta / submitted / pending */}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={12 + i * 62} y="20" width="50" height="3" fill={fill} />
              <rect x={12 + i * 62} y="28" width="40" height="2" fill={fill} />
              <rect x={12 + i * 62} y="34" width="44" height="2" fill={fill} />
              <rect x={12 + i * 62} y="40" width="30" height="2" fill={fill} />
              <rect x={12 + i * 62} y="46" width="38" height="2" fill={fill} />
            </g>
          ))}
        </svg>
      );
    default:
      return null;
  }
}

// ============================================================
// Admin: At-a-glance matrix (students × required items)
// ============================================================
function AtAGlanceMatrix({ students, messages, onSendMessage }) {
  // Compact set of doc columns for the matrix — pulled from REQUIRED_ITEMS but trimmed
  // to fit on screen. Tweak the list below if you want more columns surfaced.
  const cols = [
    { key: "Photo", label: "Photo", section: "Mandatory documents" },
    { key: "10th marksheet", label: "10th", section: "Mandatory documents" },
    { key: "12th marksheet", label: "12th", section: "Mandatory documents" },
    { key: "Passport scan", label: "Passport", section: "Mandatory documents" },
    { key: "LOR 1", label: "LOR 1", section: "Profile documents" },
    { key: "LOR 2", label: "LOR 2", section: "Profile documents" },
    { key: "SOP", label: "SOP", section: "Profile documents" },
    { key: "At least 1 activity", label: "Activities", section: "Extra curricular" },
  ];

  return (
    <div className="mt-6">
      <p className="mb-3 text-xs italic text-stone-600">
        One row per student, one column per required item. Green ✓ = submitted, amber × = pending. Click a student name for full detail.
      </p>
      <div className="overflow-x-auto border border-stone-900/20 bg-white/30">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-stone-900/30 bg-stone-100/60">
              <th className="sticky left-0 z-10 bg-stone-100/95 px-3 py-2 text-left text-[9px] uppercase tracking-[0.2em] text-stone-600">Student</th>
              <th className="px-2 py-2 text-left text-[9px] uppercase tracking-[0.2em] text-stone-600">Counsellor</th>
              {cols.map((c) => (
                <th key={c.key} className="px-1.5 py-2 text-center text-[9px] uppercase tracking-[0.15em] text-stone-600" title={c.section}>
                  {c.label}
                </th>
              ))}
              <th className="px-2 py-2 text-center text-[9px] uppercase tracking-[0.2em] text-stone-600">Done</th>
              <th className="px-2 py-2 text-[9px] uppercase tracking-[0.2em] text-stone-600">Days</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const { pct, done, total } = completionFor(s);
              const days = daysUntil(s.submissionDeadline);
              return (
                <tr key={s.id} className="border-b border-stone-900/10 hover:bg-white/60">
                  <td className="sticky left-0 z-10 bg-white/90 px-3 py-2">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-[9px] text-stone-500">{s.parentName} · +{s.parentPhone}</p>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-stone-700">
                    {counsellorName(s.counsellorId)}
                  </td>
                  {cols.map((c) => {
                    const ok = !!s.filled[c.key];
                    return (
                      <td key={c.key} className="px-1.5 py-2 text-center">
                        {ok ? (
                          <Check className="mx-auto h-3.5 w-3.5 text-emerald-700" strokeWidth={3} />
                        ) : (
                          <span className="text-amber-700">×</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center">
                    <span className={`text-[10px] tabular-nums ${pct === 100 ? "text-emerald-700" : "text-amber-700"}`}>
                      {done}/{total}
                    </span>
                  </td>
                  <td className={`whitespace-nowrap px-2 py-2 text-[10px] ${days <= 1 ? "text-red-700" : "text-stone-700"}`}>
                    <Clock className="mr-0.5 inline h-2.5 w-2.5" />
                    {days}d
                  </td>
                  <td className="px-2 py-2">
                    <a
                      href={whatsAppLink(s)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 border border-emerald-700 bg-emerald-700 px-1.5 py-1 text-[9px] uppercase tracking-[0.15em] text-white hover:bg-emerald-800"
                      title={`WhatsApp ${s.parentName}`}
                    >
                      <MessageCircle className="h-2.5 w-2.5" />
                      Msg
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-stone-600">
        <span className="inline-flex items-center gap-1.5">
          <Check className="h-3 w-3 text-emerald-700" strokeWidth={3} /> Submitted
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="text-amber-700">×</span> Pending
        </span>
        <span className="text-stone-500">· Sticky student column scrolls horizontally on smaller screens.</span>
      </div>
    </div>
  );
}

// ============================================================
// Admin: Deadlines view (university application deadlines, ranked)
// ============================================================
function DeadlinesView({ students, messages, onSendMessage }) {
  // Build a flat list of {student, path, deadline} sorted by deadline ASC
  const rows = useMemo(() => {
    const list = [];
    students.forEach((s) => {
      s.paths.forEach((p) => {
        const dl = deadlineFor(p.university);
        if (dl) list.push({ student: s, path: p, deadline: dl });
      });
    });
    list.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    return list;
  }, [students]);

  const today = new Date("2026-04-25");

  return (
    <div className="mt-6">
      <p className="mb-3 text-xs italic text-stone-600">
        Every student × university combination, sorted by closest application deadline. Use this to know who needs to be ready first.
      </p>
      <div className="border border-stone-900/20 bg-white/30">
        <div
          className="grid items-center gap-3 border-b border-stone-900/30 bg-stone-100/60 px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-stone-600"
          style={{ gridTemplateColumns: "5rem 1fr 1.2fr 1fr 5rem 5rem 5rem" }}
        >
          <span>Deadline</span>
          <span>Student</span>
          <span>University</span>
          <span>Course</span>
          <span>Counsellor</span>
          <span>Status</span>
          <span></span>
        </div>
        {rows.map((r, idx) => {
          const { pct } = completionFor(r.student);
          const daysToUni = Math.ceil((new Date(r.deadline) - today) / 86400000);
          const urgent = daysToUni <= 90;
          return (
            <div
              key={`${r.student.id}-${idx}`}
              className="grid items-center gap-3 border-b border-stone-900/10 px-4 py-2.5 last:border-b-0 hover:bg-white/60"
              style={{ gridTemplateColumns: "5rem 1fr 1.2fr 1fr 5rem 5rem 5rem" }}
            >
              <div>
                <p className={`text-xs font-medium ${urgent ? "text-red-700" : "text-stone-800"}`}>
                  {fmtDate(r.deadline)}
                </p>
                <p className="text-[9px] text-stone-500">{daysToUni}d</p>
              </div>
              <p className="truncate text-sm">{r.student.name}</p>
              <p className="truncate text-xs text-stone-700">{r.path.university}</p>
              <p className="truncate text-xs text-stone-600">{r.path.program}</p>
              <p className="truncate text-[10px] text-stone-600">
                {counsellorName(r.student.counsellorId)}
              </p>
              <span
                className={`text-[10px] font-medium uppercase tracking-[0.15em] ${
                  pct === 100 ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {pct === 100 ? "Ready" : `${pct}%`}
              </span>
              <a
                href={whatsAppLink(r.student)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 border border-emerald-700 bg-emerald-700 px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-white hover:bg-emerald-800"
              >
                <MessageCircle className="h-2.5 w-2.5" />
                Parent
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Broadcast bar — admin sends a status nudge to every pending student's parent
// ============================================================
function BroadcastBar({ students }) {
  const [done, setDone] = useState(0);

  const pendingCount = students.length;
  const allLinks = students.map((s) => whatsAppLink(s));

  const handleBroadcast = () => {
    if (pendingCount === 0) return;
    // Open each WhatsApp link in a new tab. Browsers will pop-up-block all but
    // the first unless invoked from a direct user gesture, which is what this
    // is. Spaced apart slightly to be friendlier to popup blockers.
    students.forEach((s, i) => {
      setTimeout(() => {
        window.open(whatsAppLink(s), "_blank", "noopener,noreferrer");
      }, i * 250);
    });
    setDone(pendingCount);
    setTimeout(() => setDone(0), 4000);
  };

  if (pendingCount === 0) {
    return (
      <div className="mt-5 flex items-center gap-3 border border-emerald-700/40 bg-emerald-50 p-3 text-xs">
        <Check className="h-4 w-4 text-emerald-700" strokeWidth={3} />
        <span className="text-emerald-900">
          Every student is fully ready. Nothing to broadcast.
        </span>
      </div>
    );
  }

  return (
    <div className="mt-5 border border-stone-900/20 bg-amber-50/50 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-stone-700">
            Daily nudge
          </p>
          <p className="mt-0.5 text-xs text-stone-600">
            {pendingCount} {pendingCount === 1 ? "parent has" : "parents have"} a child with
            outstanding items. Open prefilled WhatsApp messages for all of them in one click —
            each message lists what's pending, the 3-day submission deadline, and the
            university application cutoff.
          </p>
        </div>
        <button
          onClick={handleBroadcast}
          className="inline-flex shrink-0 items-center gap-1.5 border border-emerald-700 bg-emerald-700 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-emerald-800"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Open {pendingCount} WhatsApp{pendingCount === 1 ? "" : "s"}
        </button>
      </div>
      {done > 0 && (
        <p className="mt-2 text-[11px] italic text-emerald-700">
          ✓ Opened {done} message{done === 1 ? "" : "s"} in new tabs. If your browser blocked
          some, allow popups for this page.
        </p>
      )}
    </div>
  );
}


// ============================================================
// Magazine Landing — editorial public marketing front
// ============================================================

const HIDDEN_CAREERS_POOL = [
  { name: "Forensic Accountant", field: "Finance", tag: "finance", desc: "Hunts down financial fraud across corporate ledgers. Hired by law firms, regulators, and Big Four forensic units. ₹18–35L median." },
  { name: "Genetic Counsellor", field: "Healthcare", tag: "health", desc: "Helps families understand inherited risk and make sense of genetic test results. Two-year master's, fastest-growing health profession globally." },
  { name: "Foley Artist", field: "Creative", tag: "creative", desc: "Recreates every footstep, fabric rustle, and door creak you hear in a film. The unsung half of cinematic sound." },
  { name: "Penetration Tester", field: "Tech", tag: "tech", desc: "Paid to break into corporate systems before criminals do. Top freelancers clear ₹40L on contract work alone — degrees often optional." },
  { name: "Music Therapist", field: "Healthcare", tag: "health", desc: "Uses guided music sessions to treat trauma, dementia, and stroke recovery. Master's-level clinical role, dramatically under-supplied in India." },
  { name: "Urban Forester", field: "Sustainability", tag: "sustain", desc: "Designs and maintains city tree canopies. Quietly the hottest hire in metro planning departments worldwide." },
  { name: "Perfume Designer", field: "Creative", tag: "creative", desc: "Composes scents for brands. ISIPCA in Paris is the field's MIT. Six-figure roles standard at IFF, Givaudan, L'Oréal." },
  { name: "Conversational AI Designer", field: "Tech", tag: "tech", desc: "Writes the personality and dialogue logic for AI assistants and chatbots. Half writer, half engineer, fully in demand." },
  { name: "Forensic Linguist", field: "Policy & Law", tag: "policy", desc: "Analyses speech patterns to identify the authors of anonymous threats and ransom notes. Rare field, increasingly used in cybercrime." },
  { name: "Patent Agent", field: "Policy & Law", tag: "policy", desc: "A non-lawyer cleared by the patent bar to draft and file patents. Engineering degree + the exam = a niche, very well-paid second career." },
  { name: "Catastrophe Bond Trader", field: "Finance", tag: "finance", desc: "Trades insurance-linked securities tied to hurricanes, earthquakes, and pandemics. Tiny desks, gigantic individual P&L." },
  { name: "Medical Illustrator", field: "Creative", tag: "creative", desc: "Draws the surgical guides, anatomy textbooks, and pharma marketing visuals you've seen a thousand times. Master's degree, ~6 schools globally." },
  { name: "Bioinformatics Engineer", field: "Tech", tag: "tech", desc: "Sits between biology PhDs and software engineers. Builds the pipelines that turn genome data into drug candidates." },
  { name: "Carbon Accountant", field: "Sustainability", tag: "sustain", desc: "Audits a company's emissions across every supplier, every shipment, every kilowatt-hour. Mandatory disclosure rules made this the hottest finance-adjacent role." },
  { name: "Sleep Medicine Specialist", field: "Healthcare", tag: "health", desc: "A small but exploding speciality. Fellowship-trained doctors who treat insomnia, apnoea, and circadian disorders almost exclusively." },
  { name: "Voice Actor for AI", field: "Creative", tag: "creative", desc: "Records the thousands of phonetic samples that train synthetic voices. Two-day shoots can pay what a film week pays." },
  { name: "Type Designer", field: "Creative", tag: "creative", desc: "Designs typefaces — every letter, weight, and language. Studios like Indian Type Foundry hire 3–4 a year and royalties stack for decades." },
  { name: "Election Administrator", field: "Policy & Law", tag: "policy", desc: "Runs the operational machinery of free elections — logistics, training, dispute resolution. A career that didn't exist as a profession 20 years ago." },
  { name: "Crime Scene Reconstructionist", field: "Policy & Law", tag: "policy", desc: "Rebuilds the physics of a crime: blood patterns, bullet trajectories, time of impact. A blend of forensics, geometry, and theatre." },
  { name: "Quantum Algorithm Researcher", field: "Tech", tag: "tech", desc: "Designs algorithms for quantum hardware that doesn't quite work yet. Pays absurdly well precisely because the field is early." },
  { name: "ESG Ratings Analyst", field: "Finance", tag: "finance", desc: "Decides whether a company is 'sustainable' enough to be in an ESG index. Trillions of investor dollars now hinge on these calls." },
  { name: "Hospice Doula", field: "Healthcare", tag: "health", desc: "Sits with the dying and supports their families through the final weeks. Death's answer to the birth doula. Quietly growing in metros." },
  { name: "Colourist", field: "Creative", tag: "creative", desc: "Sets the mood, tone, and emotional temperature of every frame of a film through colour grading. Top colourists become franchises." },
  { name: "Wildlife Corridor Designer", field: "Sustainability", tag: "sustain", desc: "Designs the strips of land that let tigers, elephants, and bears safely cross between habitats fragmented by highways." },
  { name: "Privacy Engineer", field: "Tech", tag: "tech", desc: "Builds the technical systems that enforce GDPR, DPDP, and similar laws. Engineering meets policy, and barely anyone in India can do both." },
  { name: "Astrobiologist", field: "Sustainability", tag: "sustain", desc: "Studies the chemistry of possible life on other worlds. Tiny field, now hiring as private space companies join the search." },
  { name: "Catastrophe Modeller", field: "Finance", tag: "finance", desc: "Models the financial impact of climate disasters at the geographic-block level. Insurance, reinsurance, and now governments." },
  { name: "Audiologist", field: "Healthcare", tag: "health", desc: "Tests, diagnoses, and treats hearing disorders. Master's-level clinical work; the cochlear implant boom has tripled demand." },
  { name: "Editorial Illustrator", field: "Creative", tag: "creative", desc: "The artists behind every New Yorker, Atlantic, and Guardian opinion piece. Freelance, repeat clients, surprisingly stable income." },
  { name: "Climate Migration Researcher", field: "Sustainability", tag: "sustain", desc: "Studies how rising seas, droughts, and crop failures will reshape where humans live. Universities, think tanks, and the UN are hiring." },
  { name: "AI Red Teamer", field: "Tech", tag: "tech", desc: "Paid to break, manipulate, and jailbreak AI systems before bad actors do. Anthropic, OpenAI, and Indian labs all have full-time openings." },
  { name: "Sovereign Debt Restructurer", field: "Finance", tag: "finance", desc: "Negotiates the bankruptcy of countries. Roughly forty people in the world do this seriously. They are very, very busy right now." },
  { name: "Sports Psychologist", field: "Healthcare", tag: "health", desc: "Works with elite athletes and franchises on performance under pressure. The IPL, Indian football, and cricket boards are now full-time employers." },
  { name: "Game Designer", field: "Creative", tag: "creative", desc: "Designs the rules, mechanics, and feel of a game — from indie mobile titles to AAA studios. Less coding, more systems thinking than people assume." },
  { name: "Maritime Lawyer", field: "Policy & Law", tag: "policy", desc: "Specialises in shipping, cargo disputes, and law-of-the-sea cases. A small, lucrative bar; still mostly trained in London and Singapore." },
  { name: "Synthetic Biology Technician", field: "Tech", tag: "tech", desc: "Two-year diploma to lab work designing engineered cells. Roles that used to require a PhD now opening up to skilled technicians." },
  { name: "Diplomatic Translator", field: "Policy & Law", tag: "policy", desc: "Interprets at the UN, Track-II talks, and major treaty negotiations. Rare combination of language mastery and security clearance." },
  { name: "Mycologist", field: "Sustainability", tag: "sustain", desc: "Studies fungi — for food, materials, medicine, and ecosystem restoration. The field has tripled in funding since 2022." },
  { name: "Voice Coach for AI", field: "Tech", tag: "tech", desc: "Trains the prosody, rhythm, and intent of synthesised voices. New role; mostly former phonetics PhDs and theatre coaches." },
  { name: "Cartographer", field: "Sustainability", tag: "sustain", desc: "Modern mapmakers — for satellites, urban planning, conflict zones, and AR systems. The field exploded with the rise of geospatial data." }
];

const FRONTIER_ARTICLES = [
  { cat: "Artificial Intelligence", title: "The 'AI translator' — every company suddenly needs one", lede: "A hybrid role that barely existed two years ago. Salaries climbing past ₹40 lakh.", meta: "12 min · By R. Mehta", color: "#b54a26", img: "https://picsum.photos/seed/ai-translator/800/500" },
  { cat: "Sustainability", title: "Climate-risk underwriters are reshaping insurance", lede: "Pricing wildfire and flood exposure has become its own discipline.", meta: "7 min · By S. Iyer", color: "#4d5a3a", img: "https://picsum.photos/seed/climate-risk/800/500" },
  { cat: "Biotech", title: "Inside the rise of synthetic biology technicians", lede: "Two-year diplomas now lead to lab roles that once required PhDs.", meta: "9 min · By P. Banerjee", color: "#c08a2c", img: "https://picsum.photos/seed/synbio-lab/800/500" },
  { cat: "Longevity", title: "'Longevity coach' is replacing personal training in metro cities", lede: "Genetic testing plus behavioural science plus a clipboard. It's working.", meta: "6 min · By N. Joshi", color: "#8a3517", img: "https://picsum.photos/seed/longevity-coach/800/500" },
  { cat: "Policy & Law", title: "The quiet boom in maritime law — and why Mumbai is the new Singapore", lede: "Shipping disputes, cargo arbitration, and a bar that mints lakhpati associates inside three years.", meta: "10 min · By A. Khurana", color: "#5a4a3a", img: "https://picsum.photos/seed/maritime-law/800/500" },
  { cat: "Creative", title: "Type designers are the new rockstars of Indian publishing", lede: "Inside the studios where every Devanagari letterform is a year of work — and the royalties never stop.", meta: "8 min · By V. Subramanian", color: "#16140f", img: "https://picsum.photos/seed/type-design/800/500" },
  { cat: "Healthcare", title: "Sleep medicine is its own speciality now — and India only has 60 of them", lede: "A two-year fellowship, a queue of cash-paying patients, and a discipline barely a decade old.", meta: "11 min · By T. Bhattacharya", color: "#4d5a3a", img: "https://picsum.photos/seed/sleep-medicine/800/500" },
  { cat: "Finance", title: "Catastrophe bond traders are the new quants", lede: "Pricing hurricanes and pandemics into instruments that pay nine figures when the world goes wrong.", meta: "9 min · By J. D'Souza", color: "#c08a2c", img: "https://picsum.photos/seed/cat-bonds/800/500" },
];

const CAREER_PATHS = [
  { id: "tech", name: "Technology", tag: "From the AI translator to the platform engineer — what the next ten years of building software will actually look like.", color: "#b54a26", articles: 5, schools: 8, img: "https://picsum.photos/seed/path-tech/800/500" },
  { id: "finance", name: "Finance", tag: "The desks are still there. The desks are not the same. A field guide to a sector that never stopped reinventing itself.", color: "#c08a2c", articles: 5, schools: 8, img: "https://picsum.photos/seed/path-finance/800/500" },
  { id: "health", name: "Healthcare", tag: "A profession in slow, painful transition — and quietly, the most interesting place to be a young person right now.", color: "#4d5a3a", articles: 5, schools: 8, img: "https://picsum.photos/seed/path-health/800/500" },
  { id: "creative", name: "Creative", tag: "Design, film, music, advertising — the fields where what you make matters more than what you majored in.", color: "#2c2a25", articles: 4, schools: 6, img: "https://picsum.photos/seed/path-creative/800/500" },
  { id: "policy", name: "Policy & Law", tag: "Civil services, the bar, public-policy think tanks — institutions that look slow until you're inside them.", color: "#5a4a3a", articles: 4, schools: 7, img: "https://picsum.photos/seed/path-policy/800/500" },
  { id: "science", name: "Science & Research", tag: "From CSIR labs to PhD programs abroad — what an academic career actually pays, and where the funding is real.", color: "#7a8a5c", articles: 4, schools: 8, img: "https://picsum.photos/seed/path-science/800/500" },
  { id: "education", name: "Education", tag: "Teaching at every level, plus the edtech sector that quietly became one of India's largest employers.", color: "#8a3517", articles: 4, schools: 6, img: "https://picsum.photos/seed/path-education/800/500" },
  { id: "sustainability", name: "Sustainability", tag: "Climate finance, urban planning, ecology, environmental law — the fastest-growing professional cluster in 2026.", color: "#4a5e6e", articles: 4, schools: 5, img: "https://picsum.photos/seed/path-sustainability/800/500" },
];

function MagazineLanding({ onSignup }) {
  const [hiddenList, setHiddenList] = useState(HIDDEN_CAREERS_POOL.slice(0, 10));
  const [seenNames, setSeenNames] = useState(
    () => new Set(HIDDEN_CAREERS_POOL.slice(0, 10).map((c) => c.name))
  );
  const [openPaths, setOpenPaths] = useState({});
  const [quizSel, setQuizSel] = useState(1);

  const shuffleHidden = () => {
    const fresh = HIDDEN_CAREERS_POOL.filter((c) => !seenNames.has(c.name));
    const pool = fresh.length >= 10 ? fresh : HIDDEN_CAREERS_POOL;
    const next = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    setHiddenList(next);
    setSeenNames((prev) => new Set([...prev, ...next.map((c) => c.name)]));
  };

  const togglePath = (id) =>
    setOpenPaths((prev) => ({ ...prev, [id]: !prev[id] }));

  const fieldTagStyle = (tag) => {
    const map = {
      tech: { background: "#b54a26", color: "#faf5ec", border: "none" },
      health: { background: "#4d5a3a", color: "#faf5ec", border: "none" },
      finance: { background: "#c08a2c", color: "#16140f", border: "none" },
      creative: { background: "#16140f", color: "#faf5ec", border: "none" },
      policy: { background: "#ebe2d2", color: "#16140f", border: "1px solid #16140f" },
      sustain: { background: "#c8d4b1", color: "#16140f", border: "none" },
    };
    return map[tag] || map.policy;
  };

  // Editorial palette inline so it doesn't bleed into the rest of the app
  return (
    <div
      style={{
        backgroundColor: "#f3ece1",
        color: "#16140f",
        fontFamily: "'Instrument Sans', system-ui, -apple-system, sans-serif",
        // Pull beyond Shell's container padding so editorial sections feel full-width
        margin: "-2.5rem -1.5rem 0",
        padding: "1.75rem 1.75rem 0",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .m-serif { font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-feature-settings: "kern", "liga"; }
        .m-mono { font-family: 'JetBrains Mono', ui-monospace, 'Courier New', monospace; }
        .m-italic { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-weight: 300; }
        .m-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #b54a26; }
        .m-card { transition: transform .25s ease; cursor: pointer; }
        .m-card:hover { transform: translateY(-2px); }
        .m-card:hover h3 { color: #b54a26; }
        .m-link { transition: color .2s; }
        .m-link:hover { color: #b54a26; }
        .m-shuffle-icon { display: inline-block; transition: transform .5s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .m-shuffle:hover .m-shuffle-icon { transform: rotate(360deg); }
        .m-hidden-row { transition: padding-left .2s; }
        .m-hidden-row:hover { padding-left: 6px; }
        .m-hidden-row:hover .m-hidden-name { color: #b54a26; }
        .m-school { transition: padding-left .2s; }
        .m-school:hover { padding-left: 4px; }
        .m-quiz-opt { transition: all .2s; }
        .m-quiz-opt:hover { border-color: #16140f !important; padding-left: 18px !important; }
      `}</style>

      {/* Section: The Frontier */}
      <section style={{ paddingTop: "8px", paddingBottom: "32px" }}>
        <div
          style={{
            borderBottom: "1px solid #16140f",
            paddingBottom: "10px",
            marginBottom: "20px",
          }}
        >
          <h2
            className="m-serif"
            style={{
              fontSize: "20px",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            The Frontier
          </h2>
          <p
            className="m-italic"
            style={{ fontSize: "13px", color: "#3c372c", marginTop: "2px" }}
          >
            Selected articles from various emerging and hot fields.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          {FRONTIER_ARTICLES.map((a, i) => (
            <article key={i} className="m-card" onClick={onSignup}>
              <div
                style={{
                  aspectRatio: "16/10",
                  backgroundColor: a.color,
                  backgroundImage: `linear-gradient(135deg, ${a.color}cc, ${a.color}55), url(${a.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  marginBottom: "10px",
                }}
              />
              <p
                className="m-mono"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#b54a26",
                  marginBottom: "6px",
                }}
              >
                {a.cat}
              </p>
              <h3
                className="m-serif"
                style={{
                  fontWeight: 500,
                  fontSize: "15px",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  marginBottom: "6px",
                }}
              >
                {a.title}
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "#3c372c",
                  lineHeight: 1.45,
                  marginBottom: "6px",
                }}
              >
                {a.lede}
              </p>
              <p
                className="m-mono"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#3c372c",
                  opacity: 0.7,
                }}
              >
                {a.meta}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Section: Ask an Expert */}
      <AskExpertSection onSignup={onSignup} />

      {/* Counselling CTA banner */}
      <section
        style={{
          background: "#b54a26",
          color: "#faf5ec",
          margin: "0 -1.75rem",
          padding: "40px 1.75rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "48px",
            alignItems: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div>
            <p
              className="m-mono"
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#faf5ec",
                opacity: 0.8,
                marginBottom: "12px",
              }}
            >
              Free 30-minute consultation
            </p>
            <h2
              className="m-serif"
              style={{
                fontWeight: 400,
                fontSize: "clamp(28px, 3.6vw, 44px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              Reading about it is the first step. The{" "}
              <span style={{ fontStyle: "italic" }}>second</span> is talking to someone.
            </h2>
            <p
              style={{
                marginTop: "12px",
                fontSize: "14px",
                lineHeight: 1.55,
                maxWidth: "540px",
                color: "rgba(250,245,236,0.88)",
              }}
            >
              Our counsellors have walked the IIT-JEE, NEET, MBA, and abroad-applications path themselves. Book a no-strings-attached call and bring whatever's on your mind.
            </p>
            <div
              style={{
                display: "flex",
                marginTop: "16px",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex" }}>
                {["A", "M", "R", "+"].map((ch, i) => (
                  <div
                    key={i}
                    className="m-italic"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      border: "2px solid #b54a26",
                      marginLeft: i === 0 ? 0 : "-8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 500,
                      fontSize: "12px",
                      color: "#b54a26",
                      background: ["#f5d3c4", "#d4dfb6", "#f5e6b8", "#faf5ec"][i],
                    }}
                  >
                    {ch}
                  </div>
                ))}
              </div>
              <p
                className="m-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(250,245,236,0.8)",
                }}
              >
                42 counsellors · Avg 4.9 / 5 · 8,200+ sessions
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={onSignup}
              className="m-mono"
              style={{
                background: "#faf5ec",
                color: "#b54a26",
                border: "none",
                padding: "16px 28px",
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#16140f";
                e.currentTarget.style.color = "#faf5ec";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#faf5ec";
                e.currentTarget.style.color = "#b54a26";
              }}
            >
              Book your free session →
            </button>
            <p
              className="m-mono"
              style={{
                fontSize: "9px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(250,245,236,0.65)",
                marginTop: "4px",
              }}
            >
              No credit card · No upsell · Genuinely free
            </p>
          </div>
        </div>
      </section>

      {/* Quiz section */}
      <section
        style={{
          background: "#faf5ec",
          margin: "32px -1.75rem 0",
          padding: "32px 1.75rem",
          borderTop: "1px solid #c9bfa9",
          borderBottom: "1px solid #c9bfa9",
        }}
      >
        <div
          style={{
            borderBottom: "1px solid #16140f",
            paddingBottom: "10px",
            marginBottom: "20px",
          }}
        >
          <h2
            className="m-serif"
            style={{
              fontSize: "20px",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Find Your Field
          </h2>
          <p
            className="m-italic"
            style={{ fontSize: "13px", color: "#3c372c", marginTop: "2px" }}
          >
            A five-minute test built with three labour economists and a clinical psychologist.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "18px",
          }}
        >
          {/* Question */}
          <div
            style={{
              background: "#f3ece1",
              border: "1px solid #c9bfa9",
              padding: "22px",
            }}
          >
            <div
              className="m-mono"
              style={{
                fontSize: "10px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#3c372c",
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span>Sample · Question 03 of 24</span>
              <span style={{ color: "#b54a26" }}>⏱ 4 min left</span>
            </div>
            <div
              style={{
                height: "2px",
                background: "#c9bfa9",
                marginBottom: "16px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: "12.5%",
                  background: "#b54a26",
                }}
              />
            </div>
            <p
              className="m-italic"
              style={{
                fontSize: "20px",
                fontWeight: 400,
                lineHeight: 1.2,
                marginBottom: "14px",
                color: "#16140f",
              }}
            >
              "When you're stuck on a hard problem at work, you most naturally —"
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                "Take it apart logically until it makes sense",
                "Talk to people until something clicks",
                "Step away and let it solve itself",
                "Sketch, draw, or build something around it",
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setQuizSel(i)}
                  className="m-quiz-opt m-serif"
                  style={{
                    border: i === quizSel ? "1px solid #b54a26" : "1px solid #c9bfa9",
                    borderLeft: i === quizSel ? "3px solid #b54a26" : "1px solid #c9bfa9",
                    background: "#f3ece1",
                    padding: i === quizSel ? "10px 14px 10px 12px" : "10px 14px",
                    cursor: "pointer",
                    fontSize: "13px",
                    lineHeight: 1.3,
                    textAlign: "left",
                    fontFamily: "'Fraunces', Georgia, serif",
                    color: "#16140f",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div
              style={{
                marginTop: "14px",
                paddingTop: "14px",
                borderTop: "1px solid #c9bfa9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <p
                className="m-italic"
                style={{ fontSize: "12px", color: "#3c372c", lineHeight: 1.35 }}
              >
                Free. No account required. Results in five minutes.
              </p>
              <button
                onClick={onSignup}
                className="m-mono"
                style={{
                  background: "#b54a26",
                  color: "#faf5ec",
                  border: "none",
                  padding: "10px 18px",
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#8a3517")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#b54a26")}
              >
                Start the test
              </button>
            </div>
          </div>

          {/* Results preview */}
          <div
            style={{
              background: "#f3ece1",
              border: "1px solid #c9bfa9",
              padding: "22px",
            }}
          >
            <p
              className="m-mono"
              style={{
                fontSize: "10px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#3c372c",
                borderBottom: "1px solid #16140f",
                paddingBottom: "6px",
                marginBottom: "12px",
              }}
            >
              Your top 10 matches · Preview
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { name: "Product Manager", pct: "94%", locked: false },
                { name: "UX Researcher", pct: "91%", locked: false },
                { name: "Strategy Consultant", pct: "88%", locked: false },
                { name: "Investigative Journalist", pct: "86%", locked: false },
                { name: "Behavioural Economist", pct: "84%", locked: false },
                { name: "Lorem ipsum dolor", pct: "82%", locked: true },
                { name: "Lorem ipsum dolor", pct: "79%", locked: true },
                { name: "Lorem ipsum dolor", pct: "76%", locked: true },
                { name: "Lorem ipsum dolor", pct: "73%", locked: true },
                { name: "Lorem ipsum dolor", pct: "71%", locked: true },
              ].map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "baseline",
                    padding: "7px 0",
                    borderBottom: i < 9 ? "1px solid #ddd2bb" : "none",
                  }}
                >
                  <span
                    className="m-mono"
                    style={{ fontSize: "10px", color: "#b54a26", minWidth: "22px" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="m-serif"
                    style={{
                      fontWeight: 500,
                      fontSize: "13px",
                      flex: 1,
                      filter: r.locked ? "blur(4px)" : "none",
                      userSelect: r.locked ? "none" : "auto",
                    }}
                  >
                    {r.name}
                  </span>
                  <span
                    className="m-mono"
                    style={{ fontSize: "10px", color: "#3c372c", opacity: r.locked ? 0.4 : 1 }}
                  >
                    {r.pct}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "14px",
                paddingTop: "14px",
                borderTop: "1px solid #c9bfa9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <p
                className="m-italic"
                style={{ fontSize: "12px", color: "#3c372c", lineHeight: 1.35 }}
              >
                Unlock the full ranking and a free 30-min call with a counsellor to walk through it.
              </p>
              <button
                onClick={onSignup}
                className="m-mono"
                style={{
                  background: "#b54a26",
                  color: "#faf5ec",
                  border: "none",
                  padding: "10px 18px",
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Unlock results
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Hidden Careers */}
      <section style={{ paddingBottom: "32px" }}>
        <div
          style={{
            borderBottom: "1px solid #16140f",
            paddingBottom: "10px",
            marginBottom: "20px",
          }}
        >
          <h2
            className="m-serif"
            style={{
              fontSize: "20px",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Hidden Careers
          </h2>
          <p
            className="m-italic"
            style={{ fontSize: "13px", color: "#3c372c", marginTop: "2px" }}
          >
            Ten careers nobody told you about — quietly hiring, paying well, short on talent.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          {hiddenList.slice(0, 8).map((c, i) => {
            const tagStyle = fieldTagStyle(c.tag);
            const seed = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return (
              <article
                key={`${c.name}-${i}`}
                className="m-card"
                onClick={onSignup}
              >
                <div
                  style={{
                    aspectRatio: "16/10",
                    backgroundColor: tagStyle.background,
                    backgroundImage: `linear-gradient(135deg, ${tagStyle.background}d9, ${tagStyle.background}66), url(https://picsum.photos/seed/${seed}/800/500)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    marginBottom: "10px",
                  }}
                />
                <p
                  className="m-mono"
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#b54a26",
                    marginBottom: "6px",
                  }}
                >
                  {c.field}
                </p>
                <h3
                  className="m-serif"
                  style={{
                    fontWeight: 500,
                    fontSize: "15px",
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                    marginBottom: "6px",
                  }}
                >
                  {c.name}
                </h3>
                <p style={{ fontSize: "12px", color: "#3c372c", lineHeight: 1.45 }}>
                  {c.desc}
                </p>
              </article>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
            paddingTop: "24px",
          }}
        >
          <button
            className="m-shuffle m-mono"
            onClick={shuffleHidden}
            style={{
              background: "#16140f",
              color: "#faf5ec",
              border: "none",
              padding: "12px 24px",
              fontSize: "11px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              transition: "background .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#b54a26")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#16140f")}
          >
            <span className="m-shuffle-icon" style={{ fontSize: "14px" }}>↻</span>
            Show me ten different ones
          </button>
          <span
            className="m-mono"
            style={{
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#3c372c",
              opacity: 0.7,
            }}
          >
            {HIDDEN_CAREERS_POOL.length} in the pool
          </span>
        </div>
      </section>

      {/* Section: Career Paths */}
      <section style={{ paddingTop: "8px", paddingBottom: "32px" }}>
        <div
          style={{
            borderBottom: "1px solid #16140f",
            paddingBottom: "10px",
            marginBottom: "20px",
          }}
        >
          <h2
            className="m-serif"
            style={{
              fontSize: "20px",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Career Paths
          </h2>
          <p
            className="m-italic"
            style={{ fontSize: "13px", color: "#3c372c", marginTop: "2px" }}
          >
            Pick a field — every path is a deep-dive with curated articles and a school list.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          {CAREER_PATHS.map((p) => (
            <article key={p.id} className="m-card" onClick={onSignup}>
              <div
                style={{
                  aspectRatio: "16/10",
                  backgroundColor: p.color,
                  backgroundImage: `linear-gradient(135deg, ${p.color}cc, ${p.color}55), url(${p.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  marginBottom: "10px",
                }}
              />
              <p
                className="m-mono"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#b54a26",
                  marginBottom: "6px",
                }}
              >
                Career Path
              </p>
              <h3
                className="m-serif"
                style={{
                  fontWeight: 500,
                  fontSize: "15px",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  marginBottom: "6px",
                }}
              >
                {p.name}
              </h3>
              <p style={{ fontSize: "12px", color: "#3c372c", lineHeight: 1.45, marginBottom: "6px" }}>
                {p.tag}
              </p>
              <p
                className="m-mono"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#3c372c",
                  opacity: 0.7,
                }}
              >
                {p.articles} articles · {p.schools} schools
              </p>
            </article>
          ))}
        </div>
      </section>


    </div>
  );
}

// ============================================================
// Ask an Expert — LLM-grounded transcript browser
// ============================================================

const EXPERTS = [
  {
    id: "renuka",
    name: "Dr. Renuka Pillai",
    role: "Pediatric Cardiologist",
    years: 18,
    city: "Kochi",
    initial: "R",
    avatarBg: "#b54a26",
    avatarFg: "#faf5ec",
    qa: [
      { q: "How many years did training actually take, start to finish?", a: "MBBS plus MD plus DM in Pediatric Cardiology — 13.5 years post-Class XII, if nothing goes sideways. The first three years are where most people quit, not the latter ones. I'd plan for that, not against it." },
      { q: "Was it worth it financially?", a: "Took until 36 before I felt financially comfortable, and many cardiologists never get there. If money is the primary motivator, this isn't the field. If patients are, you'll be fine." },
      { q: "What does a typical day look like?", a: "OPD from 9 to 1, surgical procedures or echo lab till 5, then rounds. Twice a week I'm on call which means 36-hour stretches. The work doesn't slow down — you slow down around it." },
    ],
  },
  {
    id: "karan",
    name: "Karan Mehrotra",
    role: "Robotics Engineer",
    years: 7,
    city: "Bangalore",
    initial: "K",
    avatarBg: "#4d5a3a",
    avatarFg: "#faf5ec",
    qa: [
      { q: "What did you study and how did you get into robotics?", a: "Mechanical engineering at IIT Bombay, then a master's at CMU in robotics. The CMU degree is what actually opened doors — undergraduate ME is too broad to land robotics roles directly." },
      { q: "What does a typical day look like?", a: "Half is software — debugging the locomotion stack, running simulations. The other half is hardware in the lab, watching the robot fall over and figuring out why. Lots of coffee, lots of moments of 'why did I think this would work'." },
      { q: "What would you tell a 17-year-old considering this path?", a: "Build something physical before you commit. Buy a cheap Arduino kit, make a robot do one thing badly. If you don't enjoy the badly-doing-one-thing phase, robotics is going to break your heart at scale." },
    ],
  },
  {
    id: "ananya",
    name: "Ananya Reddy",
    role: "VP, Climate Finance",
    years: 12,
    city: "Mumbai",
    initial: "A",
    avatarBg: "#c08a2c",
    avatarFg: "#16140f",
    qa: [
      { q: "Climate finance didn't exist as a field when you graduated. How did you end up here?", a: "I was a chartered accountant doing audit at one of the Big Four. Got moved to a sustainability reporting team almost by accident. Within two years that team was the most strategically important in the firm." },
      { q: "What does the work actually involve, day to day?", a: "Modelling. A lot of modelling. We price the financial impact of physical climate risks — heat, flood, cyclone — at the geographic-block level. Then we translate that into bond pricing, insurance pricing, lending decisions." },
      { q: "Is the field still hiring? Or has it peaked?", a: "Hiring like crazy. The mandatory disclosure regulations that hit in 2024 created a step-change in demand. The bottleneck is people who can do the maths and explain it to a banker. That intersection is rare." },
    ],
  },
  {
    id: "devansh",
    name: "Devansh Rao",
    role: "ML Engineer, OpenAI",
    years: 5,
    city: "San Francisco",
    initial: "D",
    avatarBg: "#16140f",
    avatarFg: "#faf5ec",
    qa: [
      { q: "What's the biggest myth about working at a frontier AI lab?", a: "That it's all glamorous research. About 70 per cent is data plumbing, eval design, and arguing about benchmarks. The exciting model-architecture stuff is maybe 15 per cent of any given week." },
      { q: "Did you need a PhD?", a: "I don't have one. The team is split — some PhDs, some strong engineers who got deep into ML on the side. What's non-negotiable is solid systems engineering and the ability to read papers fast." },
      { q: "What would you do differently if you started today?", a: "I'd contribute to one big open-source ML repo for two years before applying anywhere. The signal that creates is more reliable than any degree. Also: learn to use LLMs to review your own code aggressively. The bar for what counts as 'shipping fast' just moved." },
    ],
  },
  {
    id: "naina",
    name: "Naina Gupta",
    role: "Game Designer",
    years: 8,
    city: "Pune",
    initial: "N",
    avatarBg: "#8a3517",
    avatarFg: "#faf5ec",
    qa: [
      { q: "Game design feels like a dream career. What's the unglamorous truth?", a: "You will work on three projects that get cancelled before you ship one. The cancellations are not signs of failure — they're how the industry operates. People who can't handle that exit fast." },
      { q: "What's a typical day like?", a: "Mornings: design docs, balancing spreadsheets, system diagrams. Afternoons: playtests, watching strangers play, biting my tongue. Evenings: revising based on what I just saw. The actual game-playing happens at home." },
      { q: "Indian games industry — real career or wishful thinking?", a: "Real, but small. Studios like Lila Games, SuperGaming, Nodding Heads are hiring. International remote roles are easier to land than five years ago. Mobile is the dominant track in India whether you like it or not." },
    ],
  },
];

function AskExpertSection({ onSignup }) {
  const [activeId, setActiveId] = useState(EXPERTS[0].id);
  const active = EXPERTS.find((e) => e.id === activeId);

  return (
    <section
      style={{
        background: "#faf5ec",
        margin: "32px -1.75rem",
        padding: "32px 1.75rem",
        borderTop: "1px solid #c9bfa9",
        borderBottom: "1px solid #c9bfa9",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid #16140f",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        <h2
          className="m-serif"
          style={{
            fontSize: "20px",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          Ask an Expert
        </h2>
        <p
          className="m-italic"
          style={{ fontSize: "13px", color: "#3c372c", marginTop: "2px" }}
        >
          AI-grounded conversations with practitioners about their career, training, and daily life. Pick a name. Ask anything.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "20px",
        }}
      >
        {/* Left: expert list */}
        <aside>
          <p
            className="m-mono"
            style={{
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#3c372c",
              borderBottom: "1px solid #16140f",
              paddingBottom: "6px",
              marginBottom: "10px",
            }}
          >
            Pick an expert · {EXPERTS.length} available
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {EXPERTS.map((e) => {
              const isActive = e.id === activeId;
              return (
                <button
                  key={e.id}
                  onClick={() => setActiveId(e.id)}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    padding: isActive ? "10px 10px 10px 8px" : "10px",
                    border: isActive ? "1px solid #16140f" : "1px solid #c9bfa9",
                    borderLeft: isActive ? "3px solid #b54a26" : "1px solid #c9bfa9",
                    background: "#f3ece1",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all .2s",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: e.avatarBg,
                      color: e.avatarFg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontStyle: "italic",
                      fontWeight: 500,
                      fontSize: "13px",
                      flexShrink: 0,
                    }}
                  >
                    {e.initial}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      className="m-serif"
                      style={{
                        fontWeight: 500,
                        fontSize: "13px",
                        lineHeight: 1.1,
                      }}
                    >
                      {e.name}
                    </div>
                    <div
                      className="m-mono"
                      style={{
                        fontSize: "9px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#3c372c",
                        marginTop: "2px",
                      }}
                    >
                      {e.role} · {e.years} yrs
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: transcript */}
        <div
          style={{
            background: "#f3ece1",
            border: "1px solid #c9bfa9",
            padding: "22px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <p
            className="m-mono"
            style={{
              fontSize: "10px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#3c372c",
              borderBottom: "1px solid #c9bfa9",
              paddingBottom: "10px",
              marginBottom: "16px",
            }}
          >
            In conversation with {active.name} · {active.role}, {active.city}
          </p>

          {active.qa.map((pair, i) => (
            <div key={i} style={{ marginBottom: "14px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr",
                  gap: "12px",
                  alignItems: "baseline",
                  marginBottom: "8px",
                }}
              >
                <span
                  className="m-mono"
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    color: "#b54a26",
                  }}
                >
                  Q.
                </span>
                <p
                  className="m-italic"
                  style={{ fontSize: "14px", lineHeight: 1.5, color: "#3c372c" }}
                >
                  {pair.q}
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr",
                  gap: "12px",
                  alignItems: "baseline",
                }}
              >
                <span
                  className="m-mono"
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    color: "#16140f",
                  }}
                >
                  A.
                </span>
                <p
                  className="m-serif"
                  style={{ fontSize: "14px", lineHeight: 1.55, color: "#16140f" }}
                >
                  {pair.a}
                </p>
              </div>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "6px",
              paddingTop: "14px",
              borderTop: "1px solid #c9bfa9",
            }}
          >
            <input
              type="text"
              placeholder="Ask your own follow-up — try 'what would you do differently?'"
              onClick={onSignup}
              readOnly
              className="m-italic"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                borderBottom: "1px solid #16140f",
                padding: "8px 0",
                fontSize: "14px",
                outline: "none",
                color: "#16140f",
                cursor: "pointer",
              }}
            />
            <button
              onClick={onSignup}
              className="m-mono"
              style={{
                background: "#16140f",
                color: "#faf5ec",
                border: "none",
                padding: "8px 18px",
                fontSize: "10px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#b54a26")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#16140f")}
            >
              Send →
            </button>
          </div>
          <p
            className="m-mono"
            style={{
              fontSize: "9px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#3c372c",
              opacity: 0.7,
              marginTop: "10px",
            }}
          >
            Responses synthesised from a 90-minute recorded interview · Not real-time
          </p>
        </div>
      </div>
    </section>
  );
}
