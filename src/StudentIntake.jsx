import { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Check,
  Zap,
  Loader2,
  RotateCcw,
  Upload,
} from "lucide-react";

// ============================================================
// Schema — chapters → pages → fields.
// Every field on the legacy Dashboard is covered here so the
// flow map is the single source of "things we ever ask".
// ============================================================
const CHAPTERS = [
  {
    id: "personal",
    title: "Personal details",
    pages: [
      {
        id: "p_basics",
        title: "Tell us about yourself",
        helper: "The basics — we'll use these everywhere else.",
        fields: [
          { id: "name", label: "Full name", type: "text", placeholder: "First Last" },
          { id: "email", label: "Email", type: "email", placeholder: "name@example.com" },
          { id: "phone", label: "Phone", type: "tel", placeholder: "+91 98XXX XXXXX" },
          { id: "dob", label: "Date of birth", type: "date" },
          { id: "bloodGroup", label: "Blood group", type: "text", placeholder: "O+", optional: true },
        ],
      },
      {
        id: "p_address",
        title: "Where you live",
        fields: [
          { id: "houseAddress", label: "House address", type: "textarea", placeholder: "Street, area, city, state, PIN" },
        ],
      },
      {
        id: "p_ids",
        title: "Identification",
        helper: "We need these for university and visa applications.",
        fields: [
          { id: "aadhar", label: "Aadhar card #", type: "text", placeholder: "XXXX XXXX XXXX" },
          { id: "pan", label: "PAN card #", type: "text", optional: true },
          { id: "passport", label: "Passport #", type: "text", placeholder: "A1234567" },
          { id: "passportExpiry", label: "Passport expiry date", type: "date" },
        ],
      },
      {
        id: "p_photo",
        title: "Upload your photo",
        helper: "White background, formals, 3.5×4.5 cm. JPG or PDF.",
        fields: [
          { id: "photoFile", label: "Photo", type: "file" },
        ],
      },
    ],
  },
  {
    id: "schooling",
    title: "Schooling",
    pages: [
      {
        id: "p_school",
        title: "Your school (undergraduate)",
        fields: [
          { id: "schoolName", label: "School name", type: "text" },
          { id: "schoolEmail", label: "School email", type: "email" },
          { id: "schoolAddress", label: "School address", type: "textarea" },
        ],
      },
      {
        id: "p_uni",
        title: "Your university (post-graduate)",
        helper: "Skip if you're applying for an undergraduate program.",
        optional: true,
        fields: [
          { id: "uniName", label: "University / college", type: "text", optional: true },
          { id: "uniEmail", label: "University email", type: "email", optional: true },
          { id: "uniAddress", label: "Address", type: "textarea", optional: true },
        ],
      },
    ],
  },
  {
    id: "academics",
    title: "Academic record",
    pages: [
      {
        id: "p_marks10",
        title: "10th-grade marks",
        fields: [
          { id: "marks10pct", label: "Percentage", type: "number", placeholder: "85" },
          { id: "marks10sheet", label: "Marksheet (PDF)", type: "file" },
        ],
      },
      {
        id: "p_marks11",
        title: "11th-grade marks",
        helper: "Per-subject scores if you have them.",
        fields: [
          { id: "marks11pct", label: "Percentage", type: "number" },
          { id: "marks11sheet", label: "Marksheet (PDF)", type: "file" },
        ],
      },
      {
        id: "p_marks12",
        title: "12th-grade marks",
        helper: "Predicted score is fine if boards aren't out yet.",
        fields: [
          { id: "marks12pct", label: "Percentage (or predicted)", type: "number" },
          { id: "marks12sheet", label: "Marksheet / predicted scores (PDF)", type: "file" },
        ],
      },
      {
        id: "p_cgpa",
        title: "Graduate CGPA",
        helper: "Only fill if applying for a post-graduate program.",
        optional: true,
        fields: [
          { id: "cgpa", label: "CGPA", type: "text", optional: true },
          { id: "transcript", label: "Transcript (PDF)", type: "file", optional: true },
          { id: "finalDegree", label: "Final degree (PDF)", type: "file", optional: true },
          { id: "semesterTranscripts", label: "All-semester transcripts (PDF)", type: "file", optional: true },
        ],
      },
    ],
  },
  {
    id: "passport",
    title: "Passport scans",
    pages: [
      {
        id: "p_passport_scans",
        title: "Upload passport pages",
        helper: "Three PDFs — front & back combined, front page alone, last page alone.",
        fields: [
          { id: "passportFrontBack", label: "Front & back (combined)", type: "file" },
          { id: "passportFront", label: "Front page", type: "file" },
          { id: "passportLast", label: "Last page", type: "file" },
        ],
      },
    ],
  },
  {
    id: "tests",
    title: "Standardized tests",
    pages: [
      {
        id: "p_tests",
        title: "Test scores",
        helper: "Fill any test you've taken or booked. Skip the rest.",
        optional: true,
        fields: [
          { id: "ielts_score", label: "IELTS score", type: "text", optional: true },
          { id: "ielts_booked", label: "IELTS test date", type: "date", optional: true },
          { id: "toefl_score", label: "TOEFL score", type: "number", optional: true },
          { id: "toefl_booked", label: "TOEFL test date", type: "date", optional: true },
          { id: "sat_score", label: "SAT / ACT score", type: "number", optional: true },
          { id: "sat_booked", label: "SAT / ACT test date", type: "date", optional: true },
          { id: "ap_score", label: "AP scores", type: "text", optional: true },
          { id: "other_test_score", label: "Other tests (TUMA / TSA / etc.)", type: "text", optional: true },
          { id: "tests_results", label: "Result PDFs (combined)", type: "file", optional: true },
        ],
      },
    ],
  },
  {
    id: "family",
    title: "Family",
    pages: [
      {
        id: "p_father",
        title: "Father's details",
        fields: [
          { id: "father_name", label: "Name", type: "text" },
          { id: "father_dob", label: "Date of birth", type: "date" },
          { id: "father_education", label: "Education", type: "text" },
          { id: "father_institution", label: "Educational institution", type: "text" },
          { id: "father_aadhar", label: "Aadhar card", type: "text" },
          { id: "father_occupation", label: "Occupation", type: "text" },
          { id: "father_position", label: "Position at workplace", type: "text" },
          { id: "father_phone", label: "Phone", type: "tel" },
          { id: "father_email", label: "Email", type: "email" },
          { id: "father_org", label: "Name of organisation", type: "text" },
        ],
      },
      {
        id: "p_mother",
        title: "Mother's details",
        fields: [
          { id: "mother_name", label: "Name", type: "text" },
          { id: "mother_dob", label: "Date of birth", type: "date" },
          { id: "mother_education", label: "Education", type: "text" },
          { id: "mother_institution", label: "Educational institution", type: "text" },
          { id: "mother_aadhar", label: "Aadhar card", type: "text" },
          { id: "mother_occupation", label: "Occupation", type: "text" },
          { id: "mother_position", label: "Position at workplace", type: "text" },
          { id: "mother_phone", label: "Phone", type: "tel" },
          { id: "mother_email", label: "Email", type: "email" },
          { id: "mother_org", label: "Name of organisation", type: "text" },
        ],
      },
    ],
  },
  {
    id: "extracurriculars",
    title: "Activities & achievements",
    pages: [
      {
        id: "p_activities",
        title: "Activities, clubs, awards",
        helper: "Community service, art & culture, leadership, sports — anything that says something about you.",
        fields: [
          { id: "activities", label: "List your activities", type: "textarea", placeholder: "One per line — name + brief description" },
          { id: "activitiesProof", label: "Proof / certificates (combined PDF)", type: "file", optional: true },
        ],
      },
    ],
  },
  {
    id: "profile_docs",
    title: "Profile documents",
    pages: [
      {
        id: "p_lors",
        title: "Letters of recommendation",
        fields: [
          { id: "lor1", label: "LOR 1", type: "file" },
          { id: "lor2", label: "LOR 2", type: "file" },
          { id: "lor3", label: "LOR 3", type: "file", optional: true },
        ],
      },
      {
        id: "p_internships",
        title: "Internships",
        helper: "Offer letters or completion certificates.",
        optional: true,
        fields: [
          { id: "internship1", label: "Internship 1", type: "file", optional: true },
          { id: "internship2", label: "Internship 2", type: "file", optional: true },
          { id: "internship3", label: "Internship 3", type: "file", optional: true },
        ],
      },
      {
        id: "p_sop",
        title: "Statement of purpose",
        helper: "Upload a draft — we'll review and give feedback.",
        fields: [
          { id: "sop", label: "SOP (PDF)", type: "file" },
        ],
      },
      {
        id: "p_resume",
        title: "Resume",
        helper: "We can also generate one from your profile. Upload one if you already have it.",
        optional: true,
        fields: [
          { id: "resumeFile", label: "Resume (PDF)", type: "file", optional: true },
        ],
      },
    ],
  },
  {
    id: "story",
    title: "Your story",
    pages: [
      {
        id: "p_summary",
        title: "Tell us a bit about yourself",
        helper: "What do you love? What are you curious about? A few sentences is fine.",
        fields: [
          { id: "summary", label: "About you", type: "textarea" },
        ],
      },
    ],
  },
  {
    id: "destination",
    title: "Where you want to go",
    pages: [
      {
        id: "p_country",
        title: "Your target country",
        fields: [
          {
            id: "targetCountry",
            label: "Primary target country",
            type: "select",
            options: ["Canada", "USA", "UK", "Switzerland", "Singapore", "Australia", "Germany", "Other"],
          },
        ],
      },
      {
        id: "p_paths",
        title: "Programs & universities",
        helper: "Pick the programs and universities you're considering. You can refine later with your counsellor.",
        fields: [
          {
            id: "program1",
            label: "Program 1",
            type: "select",
            options: ["BSc Physics", "BSc Computer Science", "BSc Mathematics", "BEng Mechanical", "BA Economics", "BCom", "Other"],
          },
          { id: "univ1", label: "University 1", type: "text", placeholder: "e.g. MIT" },
          { id: "program2", label: "Program 2", type: "text", optional: true },
          { id: "univ2", label: "University 2", type: "text", optional: true },
          { id: "program3", label: "Program 3", type: "text", optional: true },
          { id: "univ3", label: "University 3", type: "text", optional: true },
        ],
      },
    ],
  },
];

const ALL_PAGES = CHAPTERS.flatMap((c) =>
  c.pages.map((p) => ({ ...p, chapterId: c.id, chapterTitle: c.title }))
);
const PAGES_BY_ID = Object.fromEntries(ALL_PAGES.map((p) => [p.id, p]));
const DEFAULT_ORDER = ALL_PAGES.map((p) => p.id);

const MOCK = {
  name: "Riya Sharma",
  email: "riya.sharma@example.com",
  phone: "+91 98765 43210",
  dob: "2007-06-15",
  bloodGroup: "B+",
  houseAddress: "12, Model Town, Ludhiana, Punjab 141002",
  aadhar: "1234 5678 9012",
  pan: "ABCDE1234F",
  passport: "A1234567",
  passportExpiry: "2030-04-12",
  schoolName: "Sacred Heart Convent School, Ludhiana",
  schoolEmail: "office@sacredheart.edu.in",
  schoolAddress: "Sarabha Nagar, Ludhiana, Punjab 141001",
  marks10pct: "94",
  marks11pct: "92",
  marks12pct: "91",
  ielts_score: "8.5",
  toefl_score: "110",
  sat_score: "1520",
  father_name: "Vikram Sharma",
  father_dob: "1972-03-08",
  father_education: "MBA",
  father_institution: "Punjab University",
  father_aadhar: "9876 5432 1098",
  father_occupation: "Executive Director",
  father_position: "Head of Operations",
  father_phone: "+91 98765 12345",
  father_email: "vikram.sharma@example.com",
  father_org: "Sharma Industries Pvt Ltd",
  mother_name: "Priya Sharma",
  mother_dob: "1975-07-22",
  mother_education: "MA English Literature",
  mother_institution: "Delhi University",
  mother_aadhar: "5432 1098 7654",
  mother_occupation: "School Principal",
  mother_position: "Principal",
  mother_phone: "+91 98765 67890",
  mother_email: "priya.sharma@example.com",
  mother_org: "Sacred Heart Convent School",
  activities:
    "Founder & President — School CS Club (2024–25)\nMember — National Debate Team\nICPC qualifier 2025\nVolunteer — Habitat for Humanity, Punjab chapter",
  summary:
    "I'm fascinated by how computers can model the world. I've been programming since I was 13 — started with web, now mostly into ML and systems. I also love a good policy debate.",
  targetCountry: "USA",
  program1: "BSc Computer Science",
  univ1: "MIT",
  program2: "BSc Computer Science",
  univ2: "Stanford University",
};

const STORAGE_KEY = "visuara-intake-v1";
const ORDER_KEY = "visuara-intake-order-v1";
const STUDENT_RECORD_KEY = "visuara-student-record-v1";

// ============================================================
// Student record — the canonical, organized shape for everything
// we collect in the intake. Every save writes BOTH:
//   - the flat answers map (working draft for inputs)
//   - the nested student record (source of truth for downstream views)
//
// Shape:
//   {
//     id, createdAt, updatedAt, intakeComplete,
//     personal: { name, email, phone, dob, bloodGroup,
//                 address: { house },
//                 ids: { aadhar, pan, passport, passportExpiry },
//                 photoFile },
//     schooling: { school: { name, email, address },
//                  university: { name, email, address } },
//     academics: { marks10: { percentage, marksheet },
//                  marks11, marks12, cgpa, transcript, finalDegree,
//                  semesterTranscripts,
//                  tests: { ielts, toefl, sat, ap, other, results } },
//     passport: { frontBack, front, last },
//     family: { father: {10 fields}, mother: {10 fields} },
//     extracurriculars: { activities, proof },
//     profileDocs: { lors[3], internships[3], sop, resume },
//     story: { summary },
//     destination: { targetCountry, paths[] }
//   }
// ============================================================
export function buildStudentRecord(answers, opts = {}) {
  const existing = opts.existing || loadStudentRecord();
  return {
    id: existing?.id || opts.id || `s_${Date.now()}`,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    intakeComplete: !!opts.intakeComplete,
    personal: {
      name: answers.name || "",
      email: answers.email || "",
      phone: answers.phone || "",
      dob: answers.dob || "",
      bloodGroup: answers.bloodGroup || "",
      address: { house: answers.houseAddress || "" },
      ids: {
        aadhar: answers.aadhar || "",
        pan: answers.pan || "",
        passport: answers.passport || "",
        passportExpiry: answers.passportExpiry || "",
      },
      photoFile: answers.photoFile || "",
    },
    schooling: {
      school: {
        name: answers.schoolName || "",
        email: answers.schoolEmail || "",
        address: answers.schoolAddress || "",
      },
      university: {
        name: answers.uniName || "",
        email: answers.uniEmail || "",
        address: answers.uniAddress || "",
      },
    },
    academics: {
      marks10: { percentage: answers.marks10pct || "", marksheet: answers.marks10sheet || "" },
      marks11: { percentage: answers.marks11pct || "", marksheet: answers.marks11sheet || "" },
      marks12: { percentage: answers.marks12pct || "", marksheet: answers.marks12sheet || "" },
      cgpa: answers.cgpa || "",
      transcript: answers.transcript || "",
      finalDegree: answers.finalDegree || "",
      semesterTranscripts: answers.semesterTranscripts || "",
      tests: {
        ielts: { score: answers.ielts_score || "", booked: answers.ielts_booked || "" },
        toefl: { score: answers.toefl_score || "", booked: answers.toefl_booked || "" },
        sat: { score: answers.sat_score || "", booked: answers.sat_booked || "" },
        ap: { score: answers.ap_score || "" },
        other: { score: answers.other_test_score || "" },
        results: answers.tests_results || "",
      },
    },
    passport: {
      frontBack: answers.passportFrontBack || "",
      front: answers.passportFront || "",
      last: answers.passportLast || "",
    },
    family: {
      father: {
        name: answers.father_name || "",
        dob: answers.father_dob || "",
        education: answers.father_education || "",
        institution: answers.father_institution || "",
        aadhar: answers.father_aadhar || "",
        occupation: answers.father_occupation || "",
        position: answers.father_position || "",
        phone: answers.father_phone || "",
        email: answers.father_email || "",
        organization: answers.father_org || "",
      },
      mother: {
        name: answers.mother_name || "",
        dob: answers.mother_dob || "",
        education: answers.mother_education || "",
        institution: answers.mother_institution || "",
        aadhar: answers.mother_aadhar || "",
        occupation: answers.mother_occupation || "",
        position: answers.mother_position || "",
        phone: answers.mother_phone || "",
        email: answers.mother_email || "",
        organization: answers.mother_org || "",
      },
    },
    extracurriculars: {
      activities: answers.activities || "",
      proof: answers.activitiesProof || "",
    },
    profileDocs: {
      lors: [answers.lor1 || "", answers.lor2 || "", answers.lor3 || ""],
      internships: [
        answers.internship1 || "",
        answers.internship2 || "",
        answers.internship3 || "",
      ],
      sop: answers.sop || "",
      resume: answers.resumeFile || "",
    },
    story: {
      summary: answers.summary || "",
    },
    destination: {
      targetCountry: answers.targetCountry || "",
      paths: [
        { program: answers.program1 || "", university: answers.univ1 || "" },
        { program: answers.program2 || "", university: answers.univ2 || "" },
        { program: answers.program3 || "", university: answers.univ3 || "" },
      ].filter((p) => p.program || p.university),
    },
  };
}

export function loadStudentRecord() {
  try {
    const raw = window.localStorage.getItem(STUDENT_RECORD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const writeStudentRecord = (record) => {
  try {
    window.localStorage.setItem(STUDENT_RECORD_KEY, JSON.stringify(record));
  } catch {}
};

const loadAnswers = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};
// Persist BOTH the flat draft and the organized record on every save.
const writeAnswers = (answers, opts = {}) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    writeStudentRecord(buildStudentRecord(answers, opts));
  } catch {}
};
const loadOrder = () => {
  try {
    const raw = window.localStorage.getItem(ORDER_KEY);
    if (!raw) return DEFAULT_ORDER;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ORDER;
    const known = parsed.filter((id) => PAGES_BY_ID[id]);
    const missing = DEFAULT_ORDER.filter((id) => !known.includes(id));
    return [...known, ...missing];
  } catch {
    return DEFAULT_ORDER;
  }
};
const writeOrder = (order) => {
  try {
    window.localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  } catch {}
};

const isFieldFilled = (val) => val !== "" && val !== null && val !== undefined;
const pageFillState = (page, answers) => {
  const required = page.fields.filter((f) => !f.optional && !page.optional);
  const filledReq = required.filter((f) => isFieldFilled(answers[f.id])).length;
  const filledAny = page.fields.filter((f) => isFieldFilled(answers[f.id])).length;
  if (required.length === 0) {
    return filledAny > 0 ? "complete" : "empty";
  }
  if (filledReq === required.length) return "complete";
  if (filledReq > 0 || filledAny > 0) return "partial";
  return "empty";
};

// ============================================================
// Main flow
// ============================================================
export default function StudentIntake({ studentName = "student", onComplete, onExit }) {
  const [answers, setAnswers] = useState(loadAnswers);
  const [order, setOrder] = useState(loadOrder);
  // step: -1 = welcome, 0..N-1 = page, N = closing
  const [step, setStep] = useState(-1);
  const [saveState, setSaveState] = useState("idle");
  const debounceTimer = useRef(null);
  const savingTimer = useRef(null);

  const orderedPages = order.map((id) => PAGES_BY_ID[id]).filter(Boolean);
  const total = orderedPages.length;
  const isWelcome = step === -1;
  const isClosing = step >= total;
  const currentPage = !isWelcome && !isClosing ? orderedPages[step] : null;
  const prevPage = step > 0 ? orderedPages[step - 1] : null;
  const isChapterStart = currentPage && (!prevPage || prevPage.chapterId !== currentPage.chapterId);

  const scheduleSave = useCallback((nextAnswers) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (savingTimer.current) clearTimeout(savingTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSaveState("saving");
      savingTimer.current = setTimeout(() => {
        writeAnswers(nextAnswers);
        setSaveState("saved");
      }, 450);
    }, 3000);
  }, []);

  const flushSave = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    setSaveState("saving");
    if (savingTimer.current) clearTimeout(savingTimer.current);
    savingTimer.current = setTimeout(() => {
      writeAnswers(answers);
      setSaveState("saved");
    }, 250);
  }, [answers]);

  const setAnswer = (fid, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [fid]: value };
      scheduleSave(next);
      return next;
    });
  };

  const advance = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    writeAnswers(answers);
    setSaveState("saved");
    setStep((s) => s + 1);
  };
  const goBack = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    writeAnswers(answers);
    setStep((s) => Math.max(-1, s - 1));
  };

  const fillMock = () => {
    setAnswers(MOCK);
    writeAnswers(MOCK);
    setSaveState("saved");
  };

  const movePage = (id, direction) => {
    const idx = order.indexOf(id);
    const newIdx = idx + direction;
    if (idx < 0 || newIdx < 0 || newIdx >= order.length) return;
    const next = [...order];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setOrder(next);
    writeOrder(next);
    if (step === idx) setStep(newIdx);
    else if (step === newIdx) setStep(idx);
  };

  const jumpTo = (idx) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    writeAnswers(answers);
    setStep(idx);
  };

  const resetOrder = () => {
    setOrder(DEFAULT_ORDER);
    writeOrder(DEFAULT_ORDER);
  };

  const reorderTo = (srcId, dstId) => {
    if (!srcId || srcId === dstId) return;
    const currentId = currentPage?.id;
    const next = [...order];
    const srcIdx = next.indexOf(srcId);
    const dstIdx = next.indexOf(dstId);
    if (srcIdx < 0 || dstIdx < 0) return;
    const [moved] = next.splice(srcIdx, 1);
    next.splice(dstIdx, 0, moved);
    setOrder(next);
    writeOrder(next);
    if (currentId) {
      const newIdx = next.indexOf(currentId);
      if (newIdx >= 0) setStep(newIdx);
    }
  };

  // Enter advances on welcome / closing only — multi-field pages need free Enter.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      const tag = e.target.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return;
      e.preventDefault();
      if (isWelcome) setStep(0);
      else if (isClosing) onComplete?.(answers);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isWelcome, isClosing, answers, onComplete]);

  return (
    <div
      className="min-h-screen w-full font-serif text-stone-900"
      style={{ backgroundColor: "#f4f0e6" }}
    >
      <TopBar onExit={onExit} onAutofill={fillMock} saveState={saveState} />

      <section className="mx-auto max-w-3xl px-6 pt-28 pb-12">
        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-stone-500">
          Live view
        </p>
        <div className="min-h-[420px] border border-stone-900/15 bg-white/40 px-8 py-2">
          {isWelcome && <Welcome name={studentName} onStart={() => setStep(0)} />}
          {currentPage && (
            <PageCard
              key={currentPage.id}
              page={currentPage}
              answers={answers}
              onChange={setAnswer}
              onBlur={flushSave}
              onAdvance={advance}
              onBack={goBack}
              isChapterStart={isChapterStart}
              stepLabel={`Page ${step + 1}`}
            />
          )}
          {isClosing && (
            <Closing
              onDone={() => onComplete?.(answers)}
              onBack={() => setStep(total - 1)}
            />
          )}
        </div>
      </section>

      <FlowMap
        orderedPages={orderedPages}
        currentIdx={isWelcome ? -1 : isClosing ? total : step}
        answers={answers}
        onMove={movePage}
        onJump={jumpTo}
        onReset={resetOrder}
        onReorder={reorderTo}
      />
    </div>
  );
}

// ============================================================
// Top bar — autofill + save indicator
// ============================================================
function TopBar({ onExit, onAutofill, saveState }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-stone-900/10 bg-[#f4f0e6]/80 px-6 py-4 backdrop-blur">
      <button
        onClick={onExit}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900"
      >
        <ArrowLeft className="h-3 w-3" /> exit
      </button>
      <div className="flex items-baseline gap-2">
        <span className="text-sm italic text-stone-500">the</span>
        <span className="text-lg font-semibold tracking-tight">Visuara</span>
      </div>
      <div className="flex items-center gap-4">
        <SaveIndicator state={saveState} />
        <button
          onClick={onAutofill}
          title="Fill with mock data"
          aria-label="Fill with mock data"
          className="inline-flex items-center gap-1.5 border border-stone-900/30 bg-white/60 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-stone-700 transition hover:border-stone-900 hover:bg-white"
        >
          <Zap className="h-3 w-3" /> Autofill
        </button>
      </div>
    </header>
  );
}

function SaveIndicator({ state }) {
  if (state === "idle") {
    return (
      <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Ready</span>
    );
  }
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-stone-500">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-emerald-700">
      <Check className="h-3 w-3" /> Saved
    </span>
  );
}

// ============================================================
// Welcome / Closing
// ============================================================
function Welcome({ name, onStart }) {
  return (
    <div className="animate-fadeUp py-20">
      <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">Step 01</p>
      <h1 className="mt-2 font-serif text-5xl leading-[1.05] md:text-6xl">
        Hello {name},
        <br />
        welcome to Visuara.
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-600">
        We'll walk through your profile a page at a time. We save as you go, so come
        back any time. Skip what doesn't apply — your counsellor will fill the gaps.
      </p>
      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 border border-stone-900 bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-stone-50 transition hover:bg-stone-800"
        >
          Let's start <ArrowRight className="h-4 w-4" />
        </button>
        <span className="text-xs italic text-stone-500">press Enter ↵</span>
      </div>
    </div>
  );
}

function Closing({ onDone, onBack }) {
  return (
    <div className="animate-fadeUp py-20">
      <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">All done</p>
      <h2 className="mt-2 font-serif text-5xl leading-[1.05]">
        All saved.
        <br />
        We'll take it from here.
      </h2>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-600">
        Your counsellor will reach out within 24 hours. You can review and edit
        anything from your dashboard.
      </p>
      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 border border-stone-900/30 bg-transparent px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <button
          onClick={onDone}
          className="inline-flex items-center gap-2 border border-stone-900 bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-stone-50 transition hover:bg-stone-800"
        >
          Go to dashboard <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Page card — renders all fields on a page with autosave
// ============================================================
function PageCard({ page, answers, onChange, onBlur, onAdvance, onBack, isChapterStart, stepLabel }) {
  const firstFieldRef = useRef(null);
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, [page.id]);

  const requiredFields = page.fields.filter((f) => !f.optional && !page.optional);
  const allRequiredFilled = requiredFields.every((f) => isFieldFilled(answers[f.id]));
  const canAdvance = page.optional || allRequiredFilled;

  return (
    <div key={page.id} className="animate-fadeUp py-10">
      {isChapterStart && (
        <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-stone-500">
          ▸ {page.chapterTitle}
        </p>
      )}
      <div className="flex items-baseline gap-3">
        <span className="text-xs uppercase tracking-[0.25em] text-stone-400">{stepLabel}</span>
        {page.optional && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400">
            optional · skippable
          </span>
        )}
      </div>
      <h2 className="mt-2 font-serif text-3xl leading-tight md:text-4xl">{page.title}</h2>
      {page.helper && <p className="mt-3 text-sm italic text-stone-500">{page.helper}</p>}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {page.fields.map((field, i) => (
          <FieldRow
            key={field.id}
            field={field}
            value={answers[field.id] ?? ""}
            onChange={(v) => onChange(field.id, v)}
            onBlur={onBlur}
            inputRef={i === 0 ? firstFieldRef : undefined}
            wide={field.type === "textarea" || field.type === "file"}
          />
        ))}
      </div>

      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 border border-stone-900/30 bg-transparent px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <button
          onClick={onAdvance}
          disabled={!canAdvance}
          className="inline-flex items-center gap-2 border border-stone-900 bg-stone-900 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {canAdvance ? "OK" : `${requiredFields.length - requiredFields.filter((f) => isFieldFilled(answers[f.id])).length} required left`}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function FieldRow({ field, value, onChange, onBlur, inputRef, wide }) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
        {field.label}
        {field.optional && (
          <span className="ml-2 italic text-stone-400 normal-case tracking-normal">(optional)</span>
        )}
      </span>
      <FieldInput field={field} value={value} onChange={onChange} onBlur={onBlur} ref={inputRef} />
      {field.helper && (
        <span className="mt-1 block text-[10px] italic text-stone-500">{field.helper}</span>
      )}
    </label>
  );
}

const FieldInput = forwardRef(function FieldInput({ field, value, onChange, onBlur }, ref) {
  const lineCls =
    "mt-1.5 w-full border-b border-stone-900/30 bg-transparent py-1.5 font-serif text-base text-stone-900 outline-none transition focus:border-stone-900 placeholder:text-stone-300";

  if (field.type === "textarea") {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={field.placeholder}
        rows={4}
        className="mt-1.5 w-full resize-none border border-stone-900/30 bg-white/40 p-3 font-serif text-sm text-stone-900 outline-none transition focus:border-stone-900 placeholder:text-stone-400"
      />
    );
  }
  if (field.type === "select") {
    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={lineCls}
      >
        <option value="">— pick one —</option>
        {field.options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  }
  if (field.type === "file") {
    const fileName = value && typeof value === "string" ? value : "";
    return (
      <div
        className={`mt-1.5 flex items-center justify-between gap-3 border border-dashed bg-white/40 px-3 py-2 transition ${
          fileName ? "border-emerald-700/40" : "border-stone-900/30"
        }`}
      >
        <span className={`truncate text-sm ${fileName ? "text-stone-900" : "italic text-stone-400"}`}>
          {fileName || "no file selected"}
        </span>
        <button
          type="button"
          ref={ref}
          onClick={() => {
            const name = window.prompt("Mock file name (no real upload yet):", fileName || "marksheet.pdf");
            if (name !== null) {
              onChange(name);
              onBlur?.();
            }
          }}
          className="inline-flex items-center gap-1 border border-stone-900/30 bg-white px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-stone-700 transition hover:border-stone-900"
        >
          <Upload className="h-3 w-3" /> {fileName ? "replace" : "upload"}
        </button>
      </div>
    );
  }
  return (
    <input
      ref={ref}
      type={field.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={field.placeholder}
      className={lineCls}
    />
  );
});

// ============================================================
// Flow map — mini-card thumbnails of every page, with reorder
// ============================================================
function FlowMap({ orderedPages, currentIdx, answers, onMove, onJump, onReset, onReorder }) {
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  return (
    <section className="border-t border-stone-900/15 bg-stone-50/40 px-6 pt-10 pb-20">
      <div className="mx-auto max-w-md">
        <div className="flex items-baseline justify-between border-b border-stone-900/15 pb-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
            Flow map · {orderedPages.length} pages
          </p>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900"
            title="Restore the original order"
          >
            <RotateCcw className="h-3 w-3" /> reset
          </button>
        </div>
        <p className="mt-3 text-xs italic text-stone-500">
          Drag a card to reorder, or use the arrows. Click any card to jump there in
          the live view above.
        </p>

        <div className="mt-8 flex flex-col items-stretch">
          {orderedPages.map((page, idx) => {
            const prev = idx > 0 ? orderedPages[idx - 1] : null;
            const isChapterStart = !prev || prev.chapterId !== page.chapterId;
            return (
              <FlowThumb
                key={page.id}
                page={page}
                idx={idx}
                active={idx === currentIdx}
                fill={pageFillState(page, answers)}
                isChapterStart={isChapterStart}
                isFirst={idx === 0}
                isLast={idx === orderedPages.length - 1}
                isDragging={dragId === page.id}
                isOver={overId === page.id && dragId && dragId !== page.id}
                onMoveUp={() => onMove(page.id, -1)}
                onMoveDown={() => onMove(page.id, 1)}
                onJump={() => onJump(idx)}
                onDragStart={(e) => {
                  setDragId(page.id);
                  e.dataTransfer.setData("text/plain", page.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragId && dragId !== page.id && overId !== page.id) setOverId(page.id);
                }}
                onDragLeave={() => {
                  if (overId === page.id) setOverId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId && dragId !== page.id) onReorder(dragId, page.id);
                  setDragId(null);
                  setOverId(null);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FlowThumb({
  page,
  idx,
  active,
  fill,
  isChapterStart,
  isFirst,
  isLast,
  isDragging,
  isOver,
  onMoveUp,
  onMoveDown,
  onJump,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) {
  const fillColor =
    fill === "complete" ? "text-emerald-700" : fill === "partial" ? "text-amber-700" : "text-stone-300";
  const fillGlyph = fill === "complete" ? "✓" : fill === "partial" ? "◐" : "○";

  return (
    <div className="flex w-full flex-col">
      {isChapterStart && (
        <p className="mb-2 mt-3 text-[10px] uppercase tracking-[0.3em] text-stone-500">
          ▸ {page.chapterTitle}
        </p>
      )}
      {isOver && <div className="mb-1 h-0.5 w-full bg-amber-600" />}
      <div className="flex items-stretch gap-2">
        <button
          draggable
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          onClick={onJump}
          className={`group flex-1 cursor-grab border bg-white px-3 py-2.5 text-left transition active:cursor-grabbing ${
            active
              ? "border-stone-900 shadow-[2px_2px_0_rgba(0,0,0,0.08)]"
              : "border-stone-900/20 hover:border-stone-900/60"
          } ${isDragging ? "opacity-40" : ""}`}
        >
          {/* Mini "wireframe" of the page */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400">
              Page {idx + 1}
              {page.optional && " · optional"}
            </span>
            <span className={`text-[10px] ${fillColor}`}>{fillGlyph}</span>
          </div>
          <p className="mt-1 truncate font-serif text-sm font-medium text-stone-900">
            {page.title}
          </p>
          <div className="mt-2 border-t border-stone-900/10 pt-2">
            <MiniFieldList fields={page.fields} />
          </div>
        </button>
        <div className="flex flex-col gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="border border-stone-900/20 bg-white p-1 text-stone-600 transition hover:border-stone-900 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-25"
            aria-label="Move up"
            title="Move up"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="border border-stone-900/20 bg-white p-1 text-stone-600 transition hover:border-stone-900 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-25"
            aria-label="Move down"
            title="Move down"
          >
            <ArrowDown className="h-3 w-3" />
          </button>
        </div>
      </div>
      {!isLast && (
        <div className="my-1 flex flex-col items-center text-stone-300">
          <div className="h-2 w-px bg-stone-300" />
          <ChevronDown className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}

function MiniFieldList({ fields }) {
  const visible = fields.slice(0, 4);
  const more = fields.length - visible.length;
  return (
    <div className="flex flex-col gap-1.5">
      {visible.map((f) => (
        <div key={f.id} className="flex items-center gap-2">
          <span className="w-20 shrink-0 truncate text-[8px] uppercase tracking-[0.15em] text-stone-400">
            {f.label}
          </span>
          <FieldGlyph field={f} />
        </div>
      ))}
      {more > 0 && (
        <span className="text-[9px] italic text-stone-400">+ {more} more field{more > 1 ? "s" : ""}</span>
      )}
    </div>
  );
}

function FieldGlyph({ field }) {
  if (field.type === "textarea") {
    return (
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="h-px w-full bg-stone-300" />
        <div className="h-px w-full bg-stone-300" />
        <div className="h-px w-2/3 bg-stone-300" />
      </div>
    );
  }
  if (field.type === "file") {
    return (
      <div className="flex h-3 flex-1 items-center justify-center border border-dashed border-stone-300">
        <span className="text-[7px] uppercase tracking-[0.15em] text-stone-400">↑ upload</span>
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div className="flex flex-1 items-center justify-between border-b border-stone-300 pb-px">
        <span className="text-[8px] text-stone-300">▾</span>
      </div>
    );
  }
  return <div className="h-px w-full flex-1 bg-stone-300" />;
}
