import React, { useEffect, useRef, useState, useCallback } from "react";
import { Github, Linkedin, Mail, Phone, ArrowUpRight, ArrowRight, MapPin, Bug, RotateCcw, Trophy, ExternalLink } from "lucide-react";

// ---- Design tokens ----
const C = {
  bg: "#F5F6FA",
  bgAlt: "#FFFFFF",
  ink: "#12141C",
  inkSoft: "#585C72",
  inkFaint: "#8A8DA0",
  line: "#E1E3EE",
  primary: "#4453E0",
  primaryDeep: "#333FB8",
  amber: "#E8A33D",
  dark: "#12141C",
  darkAlt: "#1B1E2C",
};

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s cubic-bezier(.2,.7,.2,1) ${delay}s, transform 0.7s cubic-bezier(.2,.7,.2,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children, color = C.primary }) {
  return (
    <div
      className="flex items-center gap-2 mb-4"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <span style={{ width: 18, height: 1, background: color }} />
      <span
        className="text-xs tracking-widest uppercase"
        style={{ color, letterSpacing: "0.18em" }}
      >
        {children}
      </span>
    </div>
  );
}

function Tag({ children, dark = false }) {
  return (
    <span
      className="text-xs px-3 py-1.5 rounded-full inline-block"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        background: dark ? "rgba(255,255,255,0.06)" : "#EEF0FA",
        color: dark ? "#C7CAF5" : C.primaryDeep,
        border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#DBDFF7"}`,
      }}
    >
      {children}
    </span>
  );
}

// ---- Signature hero visual: an animated pipeline graph ----
function PipelineGraph() {
  const nodes = [
    { label: "React / Next.js", x: 40 },
    { label: "FastAPI / Django", x: 240 },
    { label: "PostgreSQL", x: 440 },
    { label: "Gemini · LangGraph", x: 640 },
  ];
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 760 140" className="w-full min-w-[600px] h-auto" style={{ maxWidth: 760 }}>
        <defs>
          <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.primary} stopOpacity="0" />
            <stop offset="50%" stopColor={C.amber} stopOpacity="1" />
            <stop offset="100%" stopColor={C.primary} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* base line */}
        <line x1="40" y1="70" x2="680" y2="70" stroke={C.line} strokeWidth="2" />
        {/* animated flow line */}
        <line
          x1="40"
          y1="70"
          x2="680"
          y2="70"
          stroke="url(#flow)"
          strokeWidth="2.5"
          strokeDasharray="60 220"
          className="pipeline-flow"
        />
        {nodes.map((n, i) => (
          <g key={n.label}>
            <circle
              cx={n.x}
              cy="70"
              r="7"
              fill={C.bgAlt}
              stroke={i === nodes.length - 1 ? C.amber : C.primary}
              strokeWidth="2.5"
            />
            <text
              x={n.x}
              y="104"
              textAnchor="middle"
              fontSize="12.5"
              fill={C.inkSoft}
              fontFamily="'JetBrains Mono', monospace"
            >
              {n.label}
            </text>
          </g>
        ))}
        <text x="710" y="75" fontSize="20" fill={C.amber}>
          →
        </text>
      </svg>
      <style>{`
        .pipeline-flow {
          animation: flowMove 3.2s linear infinite;
        }
        @keyframes flowMove {
          from { stroke-dashoffset: 300; }
          to { stroke-dashoffset: -300; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pipeline-flow { animation: none; }
        }
      `}</style>
    </div>
  );
}

function SectionHeading({ kicker, title, dark = false }) {
  return (
    <Reveal>
      <Eyebrow color={dark ? C.amber : C.primary}>{kicker}</Eyebrow>
      <h2
        className="text-3xl sm:text-4xl font-medium mb-10"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: dark ? "#F5F6FA" : C.ink,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>
    </Reveal>
  );
}

// ---------- mini game: Squash the Bug ----------
function BugGame() {
  const [state, setState] = useState("idle"); // idle | playing | over
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [time, setTime] = useState(20);
  const [bugs, setBugs] = useState([]);
  const areaRef = useRef(null);
  const spawnRef = useRef(null);
  const tickRef = useRef(null);
  const idRef = useRef(0);
 
  const addBug = useCallback(() => {
    const id = idRef.current++;
    const x = 6 + Math.random() * 84;
    const y = 10 + Math.random() * 72;
    setBugs((b) => [...b, { id, x, y }]);
    setTimeout(() => setBugs((b) => b.filter((bug) => bug.id !== id)), 850);
  }, []);
 
  const start = () => {
    setScore(0);
    setTime(20);
    setBugs([]);
    setState("playing");
    spawnRef.current = setInterval(addBug, 650);
    tickRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(spawnRef.current);
          clearInterval(tickRef.current);
          setBugs([]);
          setState("over");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };
 
  const squash = (id) => {
    setBugs((b) => b.filter((bug) => bug.id !== id));
    setScore((s) => {
      const ns = s + 1;
      setBest((bst) => Math.max(bst, ns));
      return ns;
    });
  };
 
  useEffect(() => () => {
    clearInterval(spawnRef.current);
    clearInterval(tickRef.current);
  }, []);
 
  return (
    <div className="rounded-2xl p-6 sm:p-8" style={{ background: C.bgAlt, border: `1px solid ${C.line}` }}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Bug size={18} style={{ color: C.primary }} />
          <h3 className="font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Squash the Bug
          </h3>
        </div>
        <div className="flex items-center gap-4 text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.inkSoft }}>
          <span>Score: <b style={{ color: C.ink }}>{score}</b></span>
          <span className="flex items-center gap-1"><Trophy size={13} style={{ color: C.amber }} /> {best}</span>
          {state === "playing" && <span>{time}s</span>}
        </div>
      </div>
 
      <div
        ref={areaRef}
        className="relative rounded-xl overflow-hidden select-none"
        style={{ height: 220, background: "linear-gradient(135deg,#EEF0FA,#F5F6FA)", border: `1px dashed ${C.line}` }}
      >
        {state !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm" style={{ color: C.inkSoft }}>
              {state === "idle" ? "Ship happens. Click the bugs before they escape." : `Time's up — you squashed ${score}.`}
            </p>
            <button
              onClick={start}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-transform hover:scale-105"
              style={{ background: C.primary, color: "#fff" }}
            >
              <RotateCcw size={14} /> {state === "idle" ? "Start" : "Play again"}
            </button>
          </div>
        )}
        {bugs.map((b) => (
          <button
            key={b.id}
            onClick={() => squash(b.id)}
            aria-label="squash bug"
            className="absolute bug-pop flex items-center justify-center rounded-full"
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: 34, height: 34, background: "#fff", border: `2px solid ${C.amber}`, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <Bug size={16} style={{ color: C.primary }} />
          </button>
        ))}
      </div>
      <style>{`
        .bug-pop { animation: bugPop 0.85s linear forwards; }
        @keyframes bugPop {
          0% { transform: scale(0.4); opacity: 0; }
          15% { transform: scale(1); opacity: 1; }
          85% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function Portfolio() {
  const [navSolid, setNavSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const experience = [
    {
      company: "OperForce AI",
      role: "Full Stack Engineer",
      dates: "Oct 2025 — Present",
      points: [
        "Building an AI-native ERP platform serving 20+ customers on React, Django and PostgreSQL.",
        "Designed inventory, quotation, purchase-order and accounting modules end to end.",
        "Built stock-allocation algorithms for a 300+ store clothing franchise, balancing supply by sales and size mix.",
        "Shipped demand-forecasting with Gemini, Vertex AI, SARIMA and Prophet.",
      ],
    },
    {
      company: "DigitalEdu IT Solutions",
      role: "Full Stack Developer Intern",
      dates: "Feb 2025 — Jul 2025",
      points: [
        "Worked on a large-scale Angular 19 ERP platform for educational institutions.",
        "Integrated legacy modules via Module Federation and Webpack for gradual modernization.",
        "Built a reusable PrimeNG component library on presentational architecture.",
        "Added RAG-based tutoring and student-performance agents using LLaMA 3, Mistral and Phi.",
      ],
    },
  ];

  const otherProjects = [
    {
      name: "PayTM Wallet",
      desc: "Digital wallet with secure transaction flows.",
      stack: ["Next.js", "Node.js", "Express", "PostgreSQL", "Prisma"],
    },
    {
      name: "Medium Blog Platform",
      desc: "Edge-deployed blogging platform built for speed.",
      stack: ["React", "Cloudflare Workers", "Hono", "PostgreSQL"],
    },
    {
      name: "Flask Deployment Pipeline",
      desc: "Dockerized Flask app behind Nginx with automated CI/CD.",
      stack: ["Flask", "Docker", "Nginx", "CI/CD"],
    },
  ];

  const skillGroups = [
    { label: "Languages", items: ["Python", "JavaScript", "TypeScript", "SQL"] },
    { label: "Frontend", items: ["React", "Next.js", "Angular", "Tailwind CSS", "ShadCN UI", "PrimeNG"] },
    { label: "Backend", items: ["FastAPI", "Django", "Node.js", "Express.js", "REST APIs"] },
    { label: "AI & LLMs", items: ["Agentic AI", "LangChain", "LangGraph", "RAG", "Gemini", "Vertex AI", "FAISS", "MCP"] },
    { label: "Data", items: ["PostgreSQL", "SQLAlchemy", "Prisma", "MySQL", "MongoDB", "Redis"] },
    { label: "Cloud & DevOps", items: ["Docker", "Git", "GitHub Actions", "GCP", "Cloudflare", "Render"] },
  ];

  return (
    <div
      style={{
        background: C.bg,
        color: C.ink,
        fontFamily: "'Inter', sans-serif",
      }}
      className="min-h-screen w-full"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: navSolid ? "rgba(245,246,250,0.85)" : "transparent",
          backdropFilter: navSolid ? "blur(10px)" : "none",
          borderBottom: navSolid
            ? `1px solid ${C.line}`
            : "1px solid transparent",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span
            className="font-semibold text-sm"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: C.ink }}
          >
            SK<span style={{ color: C.amber }}>.</span>dev
          </span>
          <div
            className="hidden sm:flex items-center gap-7 text-sm"
            style={{ color: C.inkSoft }}
          >
            {["work", "experience", "skills", "contact"].map((s) => (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                className="hover:opacity-70 transition-opacity capitalize"
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => scrollTo("contact")}
            className="text-xs px-4 py-2 rounded-full font-medium transition-transform hover:scale-105"
            style={{
              background: C.ink,
              color: "#fff",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Let's talk
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-5xl mx-auto px-6 pt-36 pb-20">
        <Reveal>
          <Eyebrow>Full Stack · AI Engineer</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-medium leading-[1.02] mb-6"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.03em",
            }}
          >
            Sameer Kakade
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p
            className="text-lg sm:text-xl max-w-xl mb-8"
            style={{ color: C.inkSoft }}
          >
            I build AI-native platforms — from ERP systems running 300+ stores
            to agentic pipelines that turn raw data into decisions.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="flex flex-wrap items-center gap-4 mb-14">
            <button
              onClick={() => scrollTo("work")}
              className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-transform hover:scale-105"
              style={{ background: C.primary, color: "#fff" }}
            >
              View my work <ArrowRight size={15} />
            </button>
            <a
              href="mailto:samkakade44@gmail.com"
              className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium border transition-colors hover:bg-white"
              style={{ borderColor: C.line, color: C.ink }}
            >
              <Mail size={15} /> Get in touch
            </a>
            <div className="flex items-center gap-3 ml-1">
              <a
                href="https://github.com/samkakade25"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                style={{ color: C.inkSoft }}
                className="hover:opacity-70"
              >
                <Github size={19} />
              </a>
              <a
                href="https://www.linkedin.com/in/sameer-kakade-21335b1b4/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                style={{ color: C.inkSoft }}
                className="hover:opacity-70"
              >
                <Linkedin size={19} />
              </a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{ background: C.bgAlt, border: `1px solid ${C.line}` }}
          >
            <div
              className="text-xs mb-6 flex items-center gap-2"
              style={{
                color: C.inkFaint,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <MapPin size={13} /> Pune, India — how a request moves through
              what I build
            </div>
            <PipelineGraph />
          </div>
        </Reveal>
      </header>

      {/* About */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-10">
          <div className="sm:col-span-1">
            <SectionHeading kicker="About" title="Grounded in shipping." />
          </div>
          <Reveal delay={0.1} className="sm:col-span-2">
            <p className="text-lg leading-relaxed" style={{ color: C.inkSoft }}>
              I'm a full stack developer who spends most of my time where
              backend engineering meets applied AI — designing schemas and APIs
              one hour, wiring RAG pipelines and LangGraph agents the next.
              Currently at{" "}
              <span style={{ color: C.ink, fontWeight: 500 }}>
                OperForce AI
              </span>
              , building an AI-native ERP used by real businesses; previously at{" "}
              <span style={{ color: C.ink, fontWeight: 500 }}>
                DigitalEdu IT Solutions
              </span>
              , modernizing a legacy education platform. I hold an MCA from
              PES's Modern College of Engineering and published research on
              optimizing transformer fine-tuning.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="max-w-5xl mx-auto px-6 py-16">
        <SectionHeading kicker="Experience" title="Where I've built." />
        <div className="relative pl-8 sm:pl-10">
          <div
            className="absolute left-[7px] sm:left-[9px] top-2 bottom-2 w-px"
            style={{ background: C.line }}
          />
          {experience.map((job, i) => (
            <Reveal key={job.company} delay={i * 0.1}>
              <div className="relative mb-12 last:mb-0">
                <div
                  className="absolute -left-8 sm:-left-10 top-1.5 w-3.5 h-3.5 rounded-full"
                  style={{
                    background: C.bg,
                    border: `2.5px solid ${i === 0 ? C.amber : C.primary}`,
                  }}
                />
                <div
                  className="text-xs mb-2"
                  style={{
                    color: C.inkFaint,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {job.dates}
                </div>
                <h3
                  className="text-xl font-medium mb-1"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {job.role} · {job.company}
                </h3>
                <ul className="mt-3 space-y-2">
                  {job.points.map((p) => (
                    <li
                      key={p}
                      className="text-[15px] leading-relaxed flex gap-2.5"
                      style={{ color: C.inkSoft }}
                    >
                      <span style={{ color: C.primary, marginTop: 2 }}>—</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Work / Projects — dark contrast section */}
      <section id="work" style={{ background: C.dark }} className="py-20 mt-8">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeading
            kicker="Selected Work"
            title="Featured project"
            dark
          />

          <Reveal>
            <div
              className="rounded-2xl p-7 sm:p-10 mb-6"
              style={{
                background: C.darkAlt,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                <h3
                  className="text-2xl sm:text-3xl font-medium"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: "#F5F6FA",
                  }}
                >
                  Crewaa
                </h3>

                <a
                  href="https://www.crewaa.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Crewaa live"
                  className="inline-flex items-center gap-1.5 text-sm transition-all hover:opacity-70"
                  style={{
                    color: C.inkSoft,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <span>View Live</span>
                  <ExternalLink size={14} />
                </a>
                </div>

                <span
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    color: C.amber,
                    border: `1px solid ${C.amber}44`,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  AI matchmaking SaaS
                </span>
              </div>
              <p className="mb-6 max-w-2xl" style={{ color: "#B7BACD" }}>
                A full-stack platform connecting brands and influencers through
                AI-powered campaign management and creator discovery, with
                Gemini driving the matchmaking logic.
              </p>
              <ul className="space-y-2 mb-6 max-w-2xl">
                {[
                  "Async backend on FastAPI, SQLAlchemy and PostgreSQL (Neon)",
                  "JWT auth, Google OAuth and role-based access control",
                  "Gemini-powered creator-brand recommendations",
                  "Responsive dashboards in Next.js, TypeScript, Tailwind and ShadCN",
                  "Redis caching, deployed on Render",
                ].map((f) => (
                  <li
                    key={f}
                    className="text-sm flex gap-2.5"
                    style={{ color: "#B7BACD" }}
                  >
                    <span style={{ color: C.amber }}>—</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {["FastAPI", "Next.js", "PostgreSQL", "Gemini AI", "Redis"].map(
                  (t) => (
                    <Tag key={t} dark>
                      {t}
                    </Tag>
                  )
                )}
              </div>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-5 mt-8">
            {otherProjects.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08}>
                <div
                  className="rounded-2xl p-6 h-full flex flex-col"
                  style={{
                    background: C.darkAlt,
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4
                      className="font-medium"
                      style={{
                        color: "#F5F6FA",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {p.name}
                    </h4>
                    <ArrowUpRight size={16} style={{ color: C.inkFaint }} />
                  </div>
                  <p className="text-sm mb-5" style={{ color: "#9A9DB2" }}>
                    {p.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {p.stack.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] px-2 py-1 rounded"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          color: "#C7CAF5",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="max-w-5xl mx-auto px-6 py-20">
        <SectionHeading kicker="Toolkit" title="What I build with." />
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
          {skillGroups.map((g, i) => (
            <Reveal key={g.label} delay={i * 0.05}>
              <div
                className="pb-6"
                style={{ borderBottom: `1px solid ${C.line}` }}
              >
                <div
                  className="text-xs uppercase tracking-widest mb-3"
                  style={{
                    color: C.inkFaint,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.12em",
                  }}
                >
                  {g.label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Publication / Education */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 gap-10">
          <Reveal>
            <Eyebrow>Research</Eyebrow>
            <h3
              className="text-lg font-medium mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Optimizing Transformers and Large Language Models
            </h3>
            <p className="text-sm mb-1" style={{ color: C.inkSoft }}>
              Effectiveness through training and fine-tuning
            </p>
            <p
              className="text-xs"
              style={{
                color: C.inkFaint,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              IJIRT · Vol 12, Issue 1 · June 2025 · ISSN 2349-6002
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <Eyebrow color={C.amber}>Education</Eyebrow>
            <h3
              className="text-lg font-medium mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Master of Computer Application
            </h3>
            <p className="text-sm mb-4" style={{ color: C.inkSoft }}>
              PES's Modern College of Engineering, Pune · 2023–2025
            </p>
            <h3
              className="text-lg font-medium mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Bachelor of Computer Science
            </h3>
            <p className="text-sm" style={{ color: C.inkSoft }}>
              PES's Modern College of Arts, Science & Commerce, Pune · 2021–2023
            </p>
          </Reveal>
        </div>
      </section>

      {/* Easter egg game */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <SectionHeading kicker="Just for fun" title="Take a break." />
        <Reveal delay={0.05}><BugGame /></Reveal>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-5xl mx-auto px-6 py-24">
        <Reveal>
          <Eyebrow>Contact</Eyebrow>
          <h2
            className="text-4xl sm:text-5xl font-medium mb-6 max-w-xl leading-tight"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Have a system worth building? Let's talk.
          </h2>
          <div className="flex flex-wrap gap-4 mt-8">
            <a
              href="mailto:samkakade44@gmail.com"
              className="flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium transition-transform hover:scale-105"
              style={{ background: C.ink, color: "#fff" }}
            >
              <Mail size={16} /> samkakade44@gmail.com
            </a>
            <a
              href="tel:+919834424545"
              className="flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium border"
              style={{ borderColor: C.line, color: C.ink }}
            >
              <Phone size={16} /> +91 98344 24545
            </a>
          </div>
          <div
            className="flex items-center gap-5 mt-10 pt-8"
            style={{ borderTop: `1px solid ${C.line}` }}
          >
            <a
              href="https://github.com/samkakade25"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: C.inkSoft }}
              className="hover:opacity-70 flex items-center gap-1.5 text-sm"
            >
              <Github size={16} /> GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/sameer-kakade-21335b1b4/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: C.inkSoft }}
              className="hover:opacity-70 flex items-center gap-1.5 text-sm"
            >
              <Linkedin size={16} /> LinkedIn
            </a>
            <span
              className="text-xs ml-auto"
              style={{
                color: C.inkFaint,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              © 2026 Sameer Kakade
            </span>
          </div>
        </Reveal>
      </section>
    </div>
  );
}