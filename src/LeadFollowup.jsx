import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Mail,
  Plus,
} from "lucide-react";

// ============================================================
// Static config
// ============================================================
const COUNSELLORS = [
  { id: "c1", name: "Anita Verma", phone: "919811001001", email: "anita@persona.in" },
  { id: "c2", name: "Rajiv Mehta", phone: "919811001002", email: "rajiv@persona.in" },
  { id: "c3", name: "Priya Singh", phone: "919811001003", email: "priya@persona.in" },
  { id: "c4", name: "Amit Kapoor", phone: "919811001004", email: "amit@persona.in" },
  { id: "c5", name: "Neha Sharma", phone: "919811001005", email: "neha@persona.in" },
];

const SEED_LEADS = [
  {
    id: "L001",
    name: "Simran Bhatia",
    contact: "919811001711",
    email: "simran.bhatia@example.com",
    purpose: "STK aptitude test",
    serviceDate: "2026-05-06T10:00",
    counsellorId: "c1",
    status: "scheduled",
    inquiryDate: "2026-04-22",
    notes: "Class 12 student, parents called first. Specifically asked for aptitude testing before any other steps.",
    activity: [
      { ts: "2026-04-22T11:14:00", type: "inquiry", text: "Initial phone inquiry — mother asked about aptitude testing." },
      { ts: "2026-04-23T09:30:00", type: "assignment", text: "Assigned to Anita Verma." },
      { ts: "2026-04-23T09:31:00", type: "notification_sent", channel: "whatsapp", to: "lead", text: "Welcome message sent on WhatsApp." },
      { ts: "2026-04-23T09:31:00", type: "notification_sent", channel: "email", to: "lead", text: "Welcome email sent." },
      { ts: "2026-04-23T09:32:00", type: "notification_sent", channel: "whatsapp", to: "counsellor", text: "Counsellor notified on WhatsApp." },
      { ts: "2026-04-23T09:32:00", type: "notification_sent", channel: "email", to: "counsellor", text: "Counsellor notified by email." },
    ],
  },
  {
    id: "L002",
    name: "Aarav Khanna",
    contact: "919811002831",
    email: "aarav.k@example.com",
    purpose: "Career counselling session",
    serviceDate: "2026-04-29T15:00",
    counsellorId: "c2",
    status: "scheduled",
    inquiryDate: "2026-04-24",
    notes: "Heard about us from a friend. Confused between engineering and economics tracks.",
    activity: [
      { ts: "2026-04-24T16:20:00", type: "inquiry", text: "Walked in to office, took down details." },
      { ts: "2026-04-24T16:45:00", type: "assignment", text: "Assigned to Rajiv Mehta." },
      { ts: "2026-04-24T16:46:00", type: "notification_sent", channel: "whatsapp", to: "lead", text: "Welcome + service confirmation sent." },
      { ts: "2026-04-24T16:46:00", type: "notification_sent", channel: "email", to: "lead", text: "Welcome email sent." },
      { ts: "2026-04-24T16:47:00", type: "notification_sent", channel: "whatsapp", to: "counsellor", text: "Counsellor notified." },
    ],
  },
  {
    id: "L003",
    name: "Pooja Malhotra",
    contact: "919811003942",
    email: "pooja.m@example.com",
    purpose: "SOP review",
    serviceDate: "2026-04-28T11:00",
    counsellorId: "c3",
    status: "scheduled",
    inquiryDate: "2026-04-21",
    notes: "Already has SOP draft for Cornell. Wants a 1-hour review session.",
    activity: [
      { ts: "2026-04-21T10:00:00", type: "inquiry", text: "Email inquiry with attached SOP draft." },
      { ts: "2026-04-21T14:30:00", type: "assignment", text: "Assigned to Priya Singh." },
      { ts: "2026-04-21T14:31:00", type: "notification_sent", channel: "whatsapp", to: "lead", text: "Welcome message sent." },
      { ts: "2026-04-21T14:31:00", type: "notification_sent", channel: "email", to: "lead", text: "Welcome email sent." },
      { ts: "2026-04-21T14:32:00", type: "notification_sent", channel: "whatsapp", to: "counsellor", text: "Counsellor notified." },
      { ts: "2026-04-21T14:32:00", type: "notification_sent", channel: "email", to: "counsellor", text: "Counsellor notified by email." },
    ],
  },
  {
    id: "L004",
    name: "Vivaan Sethi",
    contact: "919811004102",
    email: "vivaan.sethi@example.com",
    purpose: "University shortlisting",
    serviceDate: "2026-05-02T16:00",
    counsellorId: null,
    status: "unassigned",
    inquiryDate: "2026-04-25",
    notes: "Class 11, just exploring. Parents not yet involved.",
    activity: [
      { ts: "2026-04-25T18:10:00", type: "inquiry", text: "Whatsapp inquiry from student directly." },
    ],
  },
  {
    id: "L005",
    name: "Riya Saluja",
    contact: "919811005553",
    email: "riya.saluja@example.com",
    purpose: "Mock interview",
    serviceDate: "2026-04-26T14:00",
    counsellorId: "c4",
    status: "scheduled",
    inquiryDate: "2026-04-19",
    notes: "Stanford GSB shortlist. Has secured all admits, wants prep for Stanford interview specifically.",
    activity: [
      { ts: "2026-04-19T09:00:00", type: "inquiry", text: "Phone inquiry." },
      { ts: "2026-04-19T09:30:00", type: "assignment", text: "Assigned to Amit Kapoor." },
      { ts: "2026-04-19T09:31:00", type: "notification_sent", channel: "whatsapp", to: "lead", text: "Welcome + interview prep details sent." },
      { ts: "2026-04-19T09:31:00", type: "notification_sent", channel: "email", to: "lead", text: "Welcome email sent." },
      { ts: "2026-04-19T09:32:00", type: "notification_sent", channel: "whatsapp", to: "counsellor", text: "Counsellor notified." },
    ],
  },
  {
    id: "L006",
    name: "Kabir Trehan",
    contact: "919811006714",
    email: "kabir.trehan@example.com",
    purpose: "Profile-building consult",
    serviceDate: "2026-05-15T10:30",
    counsellorId: null,
    status: "unassigned",
    inquiryDate: "2026-04-26",
    notes: "Just started Class 11. Wants to plan extracurriculars over the next 18 months.",
    activity: [
      { ts: "2026-04-26T13:45:00", type: "inquiry", text: "Walked in with father. Long inquiry call (~25 min)." },
    ],
  },
];

// ============================================================
// Persistence
// ============================================================
const STORAGE_KEY = "persona-leads-v1";

const loadLeads = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_LEADS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return SEED_LEADS;
    return parsed;
  } catch {
    return SEED_LEADS;
  }
};

const saveLeads = (leads) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch {
    // storage full / disabled — fail silently, in-memory state still works
  }
};

// ============================================================
// Helpers
// ============================================================
const fmtDateTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const fmtDate = (s) => {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
};

const hoursUntil = (iso) => {
  if (!iso) return Infinity;
  return Math.round((new Date(iso) - new Date()) / 3600000);
};

const buildAssignmentMessage = (lead, counsellor, target) => {
  if (target === "lead") {
    return [
      `Hi ${lead.name.split(" ")[0]}, thanks for reaching out to Persona.`,
      "",
      `You've been assigned to ${counsellor.name} as your counsellor.`,
      `Your ${lead.purpose} is scheduled for ${fmtDateTime(lead.serviceDate)}.`,
      "",
      `${counsellor.name} will be in touch shortly. You'll also get a reminder 12 hours before the session.`,
      "",
      "— Team Persona",
    ].join("\n");
  }
  return [
    `Hi ${counsellor.name.split(" ")[0]}, new lead assigned —`,
    "",
    `Name: ${lead.name}`,
    `Contact: +${lead.contact}`,
    `Service: ${lead.purpose}`,
    `Scheduled: ${fmtDateTime(lead.serviceDate)}`,
    "",
    lead.notes ? `Admin notes: ${lead.notes}` : "",
    "",
    "Please reach out to confirm. Reminder will go to both of you 12 hours before the session.",
  ]
    .filter(Boolean)
    .join("\n");
};

const buildReminderMessage = (lead, counsellor, target) => {
  if (target === "lead") {
    return [
      `Hi ${lead.name.split(" ")[0]}, quick reminder —`,
      "",
      `Your ${lead.purpose} with ${counsellor.name} is in ~12 hours: ${fmtDateTime(lead.serviceDate)}.`,
      "",
      "Please be on time. Reply here if you need to reschedule.",
      "",
      "— Team Persona",
    ].join("\n");
  }
  return [
    `Hi ${counsellor.name.split(" ")[0]}, reminder —`,
    "",
    `${lead.name}'s ${lead.purpose} is in ~12 hours: ${fmtDateTime(lead.serviceDate)}.`,
    `Contact: +${lead.contact}`,
    "",
    lead.notes ? `Notes: ${lead.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

const waLink = (phone, message) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

const mailtoLink = (email, subject, body) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

// ============================================================
// Main
// ============================================================
export default function LeadFollowupPage({ onExit }) {
  const [leads, setLeads] = useState(loadLeads);
  const [expanded, setExpanded] = useState(null);
  const [showNewLead, setShowNewLead] = useState(false);

  useEffect(() => {
    saveLeads(leads);
  }, [leads]);

  const resetLeads = () => {
    if (window.confirm("Reset to seed leads? This will discard all changes.")) {
      window.localStorage.removeItem(STORAGE_KEY);
      setLeads(SEED_LEADS);
      setExpanded(null);
    }
  };

  const sorted = [...leads].sort((a, b) => {
    if (!a.counsellorId && b.counsellorId) return -1;
    if (a.counsellorId && !b.counsellorId) return 1;
    return new Date(a.serviceDate || 0) - new Date(b.serviceDate || 0);
  });

  const stats = {
    total: leads.length,
    unassigned: leads.filter((l) => !l.counsellorId).length,
    upcoming48: leads.filter(
      (l) =>
        l.counsellorId &&
        hoursUntil(l.serviceDate) <= 48 &&
        hoursUntil(l.serviceDate) >= 0
    ).length,
    imminent12: leads.filter(
      (l) =>
        l.counsellorId &&
        hoursUntil(l.serviceDate) <= 12 &&
        hoursUntil(l.serviceDate) >= 0
    ).length,
  };

  const updateLead = (id, patch) => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const logActivity = (id, entry) => {
    setLeads(
      leads.map((l) =>
        l.id === id
          ? {
              ...l,
              activity: [
                ...(l.activity || []),
                { ts: new Date().toISOString(), ...entry },
              ],
            }
          : l
      )
    );
  };

  const assignLead = (leadId, counsellorId) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const counsellor = COUNSELLORS.find((c) => c.id === counsellorId);
    const now = new Date().toISOString();
    setLeads(
      leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              counsellorId,
              status: "scheduled",
              activity: [
                ...(l.activity || []),
                {
                  ts: now,
                  type: "assignment",
                  text: `Assigned to ${counsellor.name}.`,
                },
              ],
            }
          : l
      )
    );
  };

  const addLead = (data) => {
    const id = `L${String(leads.length + 1).padStart(3, "0")}`;
    const newLead = {
      id,
      ...data,
      status: data.counsellorId ? "scheduled" : "unassigned",
      inquiryDate: new Date().toISOString().slice(0, 10),
      activity: [
        {
          ts: new Date().toISOString(),
          type: "inquiry",
          text: "Lead added manually by admin.",
        },
      ],
    };
    if (data.counsellorId) {
      const c = COUNSELLORS.find((x) => x.id === data.counsellorId);
      newLead.activity.push({
        ts: new Date().toISOString(),
        type: "assignment",
        text: `Assigned to ${c.name}.`,
      });
    }
    setLeads([newLead, ...leads]);
    setShowNewLead(false);
  };

  return (
    <div
      className="min-h-screen w-full font-serif text-stone-900"
      style={{
        backgroundColor: "#f4f0e6",
        backgroundImage:
          "radial-gradient(circle at 20% 10%, rgba(120,80,40,0.05), transparent 40%), radial-gradient(circle at 80% 90%, rgba(40,40,80,0.05), transparent 40%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between border-b border-stone-400/40 pb-4">
          <div className="flex items-baseline gap-3">
            <span className="italic text-stone-500">the</span>
            <span className="text-2xl font-semibold tracking-tight">Persona</span>
            <span className="text-xs uppercase tracking-[0.25em] text-stone-500">
              · Lead followup
            </span>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={resetLeads}
              className="text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900"
              title="Clear localStorage and restore seed leads"
            >
              reset demo
            </button>
            <button
              onClick={onExit}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-600 hover:text-stone-900"
            >
              <ArrowLeft className="h-3 w-3" /> exit
            </button>
          </div>
        </header>

        {/* Page heading */}
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
              Front desk
            </p>
            <h1 className="mt-1 font-serif text-4xl leading-tight">
              Lead followup
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-600">
              New inquiries from calls, walk-ins, and forms. Assign a counsellor +
              schedule the service. Notifications fire automatically — at assignment
              and 12 hours before the session.
            </p>
          </div>
          <button
            onClick={() => setShowNewLead(true)}
            className="inline-flex items-center gap-2 border border-stone-900 bg-stone-900 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-50 transition hover:bg-stone-800"
          >
            <Plus className="h-3.5 w-3.5" /> New lead
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-4 gap-4 border-y border-stone-900/30 py-4">
          <Stat n={stats.total} label="Total leads" />
          <Stat n={stats.unassigned} label="Unassigned" tone={stats.unassigned > 0 ? "amber" : ""} />
          <Stat n={stats.upcoming48} label="≤ 48hr" />
          <Stat n={stats.imminent12} label="≤ 12hr (reminder)" tone={stats.imminent12 > 0 ? "red" : ""} />
        </div>

        {showNewLead && (
          <NewLeadForm
            onCancel={() => setShowNewLead(false)}
            onSave={addLead}
          />
        )}

        {/* Lead list */}
        <div className="mt-6 border border-stone-900/20 bg-white/30">
          {sorted.map((lead, idx) => (
            <LeadRow
              key={lead.id}
              idx={idx}
              lead={lead}
              expanded={expanded === lead.id}
              onToggle={() => setExpanded(expanded === lead.id ? null : lead.id)}
              onAssign={(cid) => assignLead(lead.id, cid)}
              onUpdate={(patch) => updateLead(lead.id, patch)}
              onLog={(entry) => logActivity(lead.id, entry)}
            />
          ))}
          {sorted.length === 0 && (
            <p className="py-12 text-center text-sm italic text-stone-500">
              No leads yet. Click "+ New lead" to add one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ n, label, tone = "" }) {
  const color =
    tone === "amber"
      ? "text-amber-700"
      : tone === "red"
      ? "text-red-700"
      : "text-stone-900";
  return (
    <div>
      <p className={`font-serif text-3xl leading-none ${color}`}>{n}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone-500">
        {label}
      </p>
    </div>
  );
}

function LeadRow({ idx, lead, expanded, onToggle, onAssign, onUpdate, onLog }) {
  const counsellor = lead.counsellorId
    ? COUNSELLORS.find((c) => c.id === lead.counsellorId)
    : null;
  const hrs = hoursUntil(lead.serviceDate);
  const dateClass =
    hrs < 0
      ? "text-stone-400"
      : hrs <= 12
      ? "text-red-700 font-medium"
      : hrs <= 48
      ? "text-amber-700"
      : "text-stone-700";

  return (
    <div className="border-b border-stone-900/10 last:border-b-0">
      <div
        className="grid items-center gap-3 px-4 py-4 hover:bg-white/50"
        style={{ gridTemplateColumns: "2rem 1.2fr 9rem 1.4fr 1fr 9rem 4.5rem" }}
      >
        <span className="font-serif text-sm italic text-stone-500">
          {String(idx + 1).padStart(2, "0")}
        </span>
        <button onClick={onToggle} className="min-w-0 text-left">
          <p className="truncate text-base font-semibold hover:underline">
            {lead.name}
          </p>
          <p className="truncate text-xs text-stone-500">{lead.email}</p>
        </button>
        <a
          href={`tel:+${lead.contact}`}
          className="font-mono text-sm text-stone-700 hover:text-stone-900 hover:underline"
          title="Call"
        >
          +{lead.contact}
        </a>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-stone-700">{lead.purpose}</p>
          <p className={`truncate text-xl font-semibold leading-tight ${dateClass}`}>
            {fmtDateTime(lead.serviceDate)}
          </p>
        </div>
        <div className="min-w-0">
          {counsellor ? (
            <select
              value={lead.counsellorId}
              onChange={(e) => onAssign(e.target.value)}
              className="w-full border-b border-stone-900/30 bg-transparent py-1 text-sm outline-none focus:border-stone-900"
            >
              {COUNSELLORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              defaultValue=""
              onChange={(e) => onAssign(e.target.value)}
              className="w-full border border-amber-700/50 bg-amber-50 px-2 py-1.5 text-sm outline-none focus:border-amber-900"
            >
              <option value="" disabled>
                ⚠ Assign…
              </option>
              {COUNSELLORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <span
          className={`inline-flex items-center justify-center border px-2 py-1 text-[11px] uppercase tracking-[0.15em] ${
            lead.status === "scheduled"
              ? "border-emerald-700/40 bg-emerald-50 text-emerald-900"
              : lead.status === "completed"
              ? "border-stone-400 bg-stone-100 text-stone-700"
              : lead.status === "no_show"
              ? "border-red-700/40 bg-red-50 text-red-900"
              : "border-amber-700/40 bg-amber-50 text-amber-900"
          }`}
        >
          {lead.status}
        </span>
        <button
          onClick={onToggle}
          className="inline-flex items-center justify-end gap-1 text-xs uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900"
        >
          {expanded ? "Hide" : "Open"}
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {expanded && (
        <LeadDetail
          lead={lead}
          counsellor={counsellor}
          onUpdate={onUpdate}
          onLog={onLog}
        />
      )}
    </div>
  );
}

function LeadDetail({ lead, counsellor, onUpdate, onLog }) {
  const hrs = hoursUntil(lead.serviceDate);

  const has = (channel, to, kind = "assignment") =>
    (lead.activity || []).some(
      (a) =>
        a.type === "notification_sent" &&
        a.to === to &&
        a.channel === channel &&
        ((kind === "assignment" && !a.kind) || a.kind === kind)
    );

  const sendNotif = (channel, to, kind) => {
    onLog({
      type: "notification_sent",
      channel,
      to,
      kind,
      text: `${kind === "reminder" ? "12-hr reminder" : "Welcome"} ${channel} sent to ${to}.`,
    });
  };

  return (
    <div className="border-t border-stone-900/15 bg-stone-50/60 p-5">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: contact + purpose + notes */}
        <div className="md:col-span-1 space-y-4">
          <div className="border border-stone-900/30 bg-white p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
              Contact
            </p>
            <p className="mt-1 text-sm font-medium">{lead.name}</p>
            <p className="text-xs text-stone-600">+{lead.contact}</p>
            <p className="text-xs text-stone-600">{lead.email}</p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-stone-500">
              Inquiry date
            </p>
            <p className="text-xs text-stone-700">{fmtDate(lead.inquiryDate)}</p>
          </div>

          <div className="border border-stone-900/30 bg-white p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
              Purpose
            </p>
            <p className="mt-1 text-sm font-medium">{lead.purpose}</p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-stone-500">
              Scheduled for
            </p>
            <p className="text-xs text-stone-700">{fmtDateTime(lead.serviceDate)}</p>
            {hrs >= 0 && hrs <= 48 && (
              <p
                className={`mt-1 text-[10px] uppercase tracking-[0.15em] ${
                  hrs <= 12 ? "text-red-700" : "text-amber-700"
                }`}
              >
                {hrs <= 12 ? "🔴 reminder window" : `in ${hrs} hours`}
              </p>
            )}
          </div>

          {lead.notes && (
            <div className="border border-stone-900/30 bg-white p-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
                Admin notes
              </p>
              <p className="mt-2 text-xs leading-snug text-stone-700">
                {lead.notes}
              </p>
            </div>
          )}
        </div>

        {/* Middle: notifications + status */}
        <div className="md:col-span-1 space-y-4">
          <div className="border border-stone-900/30 bg-white p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
              Notifications
            </p>
            <p className="mt-1 text-[10px] italic text-stone-500">
              These will auto-fire via API. Click to open the message pre-filled.
            </p>

            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-700">
              On assignment
            </p>
            {!counsellor ? (
              <p className="mt-2 text-xs italic text-stone-500">
                Assign a counsellor first to enable.
              </p>
            ) : (
              <div className="mt-2 space-y-1.5">
                <NotifRow
                  label="Lead · WhatsApp"
                  icon={<MessageCircle className="h-3 w-3" />}
                  sent={has("whatsapp", "lead")}
                  href={waLink(
                    lead.contact,
                    buildAssignmentMessage(lead, counsellor, "lead")
                  )}
                  onClick={() => sendNotif("whatsapp", "lead", "assignment")}
                />
                <NotifRow
                  label="Lead · Email"
                  icon={<Mail className="h-3 w-3" />}
                  sent={has("email", "lead")}
                  href={mailtoLink(
                    lead.email,
                    `Welcome to Persona — your ${lead.purpose} is scheduled`,
                    buildAssignmentMessage(lead, counsellor, "lead")
                  )}
                  onClick={() => sendNotif("email", "lead", "assignment")}
                />
                <NotifRow
                  label="Counsellor · WhatsApp"
                  icon={<MessageCircle className="h-3 w-3" />}
                  sent={has("whatsapp", "counsellor")}
                  href={waLink(
                    counsellor.phone,
                    buildAssignmentMessage(lead, counsellor, "counsellor")
                  )}
                  onClick={() => sendNotif("whatsapp", "counsellor", "assignment")}
                />
                <NotifRow
                  label="Counsellor · Email"
                  icon={<Mail className="h-3 w-3" />}
                  sent={has("email", "counsellor")}
                  href={mailtoLink(
                    counsellor.email,
                    `New lead assigned — ${lead.name} (${lead.purpose})`,
                    buildAssignmentMessage(lead, counsellor, "counsellor")
                  )}
                  onClick={() => sendNotif("email", "counsellor", "assignment")}
                />
              </div>
            )}

            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-700">
              12 hours before service
            </p>
            {!counsellor ? (
              <p className="mt-2 text-xs italic text-stone-500">
                Available once assigned + scheduled.
              </p>
            ) : hrs > 24 ? (
              <p className="mt-2 text-xs italic text-stone-500">
                Will fire automatically when service is ≤12 hours away (currently{" "}
                {hrs}h).
              </p>
            ) : hrs < 0 ? (
              <p className="mt-2 text-xs italic text-stone-500">
                Service has passed. Mark as completed?
              </p>
            ) : (
              <div className="mt-2 space-y-1.5">
                <NotifRow
                  label="Lead · WhatsApp"
                  icon={<MessageCircle className="h-3 w-3" />}
                  sent={has("whatsapp", "lead", "reminder")}
                  href={waLink(
                    lead.contact,
                    buildReminderMessage(lead, counsellor, "lead")
                  )}
                  onClick={() => sendNotif("whatsapp", "lead", "reminder")}
                />
                <NotifRow
                  label="Lead · Email"
                  icon={<Mail className="h-3 w-3" />}
                  sent={has("email", "lead", "reminder")}
                  href={mailtoLink(
                    lead.email,
                    `Reminder — your ${lead.purpose} tomorrow`,
                    buildReminderMessage(lead, counsellor, "lead")
                  )}
                  onClick={() => sendNotif("email", "lead", "reminder")}
                />
                <NotifRow
                  label="Counsellor · WhatsApp"
                  icon={<MessageCircle className="h-3 w-3" />}
                  sent={has("whatsapp", "counsellor", "reminder")}
                  href={waLink(
                    counsellor.phone,
                    buildReminderMessage(lead, counsellor, "counsellor")
                  )}
                  onClick={() => sendNotif("whatsapp", "counsellor", "reminder")}
                />
              </div>
            )}
          </div>

          <div className="border border-stone-900/30 bg-white p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
              Status
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  onUpdate({ status: "completed" });
                  onLog({ type: "status", text: "Marked as completed." });
                }}
                disabled={lead.status === "completed"}
                className="border border-stone-900 bg-stone-900 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ✓ Mark completed
              </button>
              <button
                onClick={() => {
                  onUpdate({ status: "no_show" });
                  onLog({ type: "status", text: "Marked as no-show." });
                }}
                disabled={lead.status === "no_show"}
                className="border border-stone-900/40 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-stone-700 transition hover:border-stone-900 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ✕ No-show
              </button>
            </div>
            <p className="mt-3 text-[10px] italic text-stone-500">
              Once completed, you can convert this lead into a full student record.
            </p>
          </div>
        </div>

        {/* Right: activity */}
        <div className="md:col-span-1">
          <div className="border border-stone-900/30 bg-white p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
              Activity log
            </p>
            <ul className="mt-3 space-y-3">
              {(lead.activity || [])
                .slice()
                .reverse()
                .map((a, i) => (
                  <li key={i} className="flex gap-2 text-xs">
                    <span
                      className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                        a.type === "notification_sent"
                          ? "bg-emerald-600"
                          : a.type === "assignment"
                          ? "bg-amber-600"
                          : a.type === "status"
                          ? "bg-stone-900"
                          : "bg-stone-400"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="leading-snug text-stone-700">{a.text}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-stone-500">
                        {fmtDateTime(a.ts)}
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotifRow({ label, icon, sent, href, onClick }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`flex items-center justify-between gap-2 border px-2.5 py-1.5 text-[11px] transition ${
        sent
          ? "border-emerald-700/40 bg-emerald-50/60 text-emerald-900"
          : "border-stone-900/30 bg-white text-stone-700 hover:border-stone-900 hover:bg-stone-50"
      }`}
    >
      <span className="flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-[9px] uppercase tracking-[0.15em]">
        {sent ? "✓ sent · resend" : "Send →"}
      </span>
    </a>
  );
}

function NewLeadForm({ onCancel, onSave }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [counsellorId, setCounsellorId] = useState("");
  const [notes, setNotes] = useState("");

  const canSave = name && contact && purpose && serviceDate;
  const counsellor = counsellorId
    ? COUNSELLORS.find((c) => c.id === counsellorId)
    : null;

  return (
    <div className="mt-6 border-2 border-stone-900 bg-white">
      <div className="flex items-baseline justify-between border-b-2 border-stone-900 px-6 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
            Front desk · new inquiry
          </p>
          <p className="font-serif text-2xl">Add a lead</p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900"
        >
          ✕ Cancel
        </button>
      </div>

      <div className="grid gap-6 px-6 py-5 md:grid-cols-3">
        {/* ① Person */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
            ① Person
          </p>
          <FormField label="Name *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full border-b border-stone-900/40 bg-transparent py-2 text-base outline-none focus:border-stone-900"
            />
          </FormField>
          <FormField label="Phone (with country code) *">
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value.replace(/\D/g, ""))}
              placeholder="9198xxxxxxxx"
              className="w-full border-b border-stone-900/40 bg-transparent py-2 font-mono text-base outline-none focus:border-stone-900"
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full border-b border-stone-900/40 bg-transparent py-2 text-base outline-none focus:border-stone-900"
            />
          </FormField>
        </div>

        {/* ② Service */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
            ② Service
          </p>
          <FormField label="Purpose *" hint="Free-fill — what they're coming in for">
            <input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="STK aptitude test · SOP review · …"
              className="w-full border-b border-stone-900/40 bg-transparent py-2 text-base outline-none focus:border-stone-900"
            />
          </FormField>
          <FormField label="Date & time *">
            <input
              type="datetime-local"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              className="w-full border-b border-stone-900/40 bg-transparent py-2 text-base outline-none focus:border-stone-900"
            />
          </FormField>
          <FormField label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What did they say on the call? Any context for the counsellor…"
              className="w-full resize-none border border-stone-900/40 bg-stone-50 p-2 text-sm outline-none focus:border-stone-900"
            />
          </FormField>
        </div>

        {/* ③ Routing */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
            ③ Routing
          </p>
          <FormField label="Counsellor" hint="Pick now, or assign later from the row">
            <select
              value={counsellorId}
              onChange={(e) => setCounsellorId(e.target.value)}
              className="w-full border-b border-stone-900/40 bg-transparent py-2 text-base outline-none focus:border-stone-900"
            >
              <option value="">— Leave unassigned —</option>
              {COUNSELLORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="border border-stone-900/20 bg-stone-50 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">
              On save, we'll send
            </p>
            <ul className="mt-2 space-y-1.5 text-xs">
              <NotifPreview
                label="Lead · WhatsApp + email"
                ready={!!counsellor}
                hint={counsellor ? "fires now" : "needs counsellor"}
              />
              <NotifPreview
                label="Counsellor · WhatsApp + email"
                ready={!!counsellor}
                hint={counsellor ? `to ${counsellor.name}` : "needs counsellor"}
              />
              <NotifPreview
                label="12-hr reminder (lead + counsellor)"
                ready={!!counsellor && !!serviceDate}
                hint="auto, 12hrs before"
              />
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-stone-900/20 bg-stone-50 px-6 py-4">
        <p className="text-xs italic text-stone-600">
          {canSave
            ? counsellor
              ? `Will save and notify ${counsellor.name} immediately.`
              : "Will save as unassigned — assign later from the row."
            : "Fill name, phone, purpose, and service time to save."}
        </p>
        <button
          onClick={() =>
            onSave({
              name,
              contact,
              email,
              purpose,
              serviceDate,
              counsellorId: counsellorId || null,
              notes,
            })
          }
          disabled={!canSave}
          className="border border-stone-900 bg-stone-900 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Save lead →
        </button>
      </div>
    </div>
  );
}

function FormField({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.15em] text-stone-500">
        {label}
      </span>
      {children}
      {hint && (
        <p className="mt-1 text-[10px] italic text-stone-500">{hint}</p>
      )}
    </label>
  );
}

function NotifPreview({ label, ready, hint }) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            ready ? "bg-emerald-600" : "bg-stone-300"
          }`}
        />
        <span className={ready ? "text-stone-700" : "text-stone-400"}>{label}</span>
      </span>
      <span
        className={`text-[10px] uppercase tracking-[0.1em] ${
          ready ? "text-emerald-700" : "text-stone-400"
        }`}
      >
        {hint}
      </span>
    </li>
  );
}
