import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Factory, Zap, BarChart3, Users, CalendarClock,
  ArrowRight, ChevronDown, CheckCircle2,
} from "lucide-react";
import "./Landing.css";

const SHOWCASE = [
  {
    id: "dashboard",
    icon: <BarChart3 size={20} />,
    color: "blue",
    tab: "Dashboard",
    title: "Real-Time Production Dashboard",
    desc: "Get a bird's-eye view of your entire factory floor. Monitor KPIs, track active orders, machine utilization, and workforce status — all updating in real time.",
    bullets: [
      "Live KPI cards for orders, machines, and workers",
      "Production throughput chart with daily trends",
      "Quick-action buttons to jump into any module",
    ],
    image: `${import.meta.env.BASE_URL}previews/preview_dashboard.png`,
  },
  {
    id: "scheduling",
    icon: <CalendarClock size={20} />,
    color: "purple",
    tab: "Scheduling",
    title: "Intelligent Production Scheduling",
    desc: "Drag-and-drop your production orders onto machines with automatic conflict detection. ProSched respects shift hours, maintenance windows, and order deadlines.",
    bullets: [
      "Visual timeline with machine rows and order blocks",
      "Automatic priority-based scheduling engine",
      "Shift-aware conflict and overlap detection",
    ],
    image: `${import.meta.env.BASE_URL}previews/preview_scheduling.png`,
  },
  {
    id: "workforce",
    icon: <Users size={20} />,
    color: "orange",
    tab: "Workforce",
    title: "Complete Workforce Management",
    desc: "Track every worker's skills, availability, and shift assignments. Role-based access ensures managers control the floor while workers see their schedules.",
    bullets: [
      "Worker profiles with skill tags and certifications",
      "Availability badges (Available / Busy / On Leave)",
      "Manager vs. Worker role-based access control",
    ],
    image: `${import.meta.env.BASE_URL}previews/preview_workforce.png`,
  },
  {
    id: "reports",
    icon: <Zap size={20} />,
    color: "cyan",
    tab: "Reports",
    title: "One-Click Production Reports",
    desc: "Generate comprehensive production reports with charts, breakdowns, and export them to PDF. Share insights with stakeholders in seconds, not hours.",
    bullets: [
      "Throughput analytics with interactive charts",
      "Order status breakdown and completion rates",
      "Export to PDF with a single click",
    ],
    image: `${import.meta.env.BASE_URL}previews/preview_reports.png`,
  },
];

const STATS = [
  { number: "40%", label: "Faster Scheduling" },
  { number: "99.9%", label: "Uptime SLA" },
  { number: "3x", label: "Throughput Gains" },
  { number: "500+", label: "Factories Trust Us" },
];

export default function Landing() {
  const navRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle("scrolled", window.scrollY > 40);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Intersection Observer for scroll-triggered reveals
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const current = SHOWCASE[activeTab];

  return (
    <div className="landing-root">
      {/* Animated background */}
      <div className="landing-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="grid-overlay" />

      {/* Content */}
      <div className="landing-content">
        {/* ── Navbar ── */}
        <nav ref={navRef} className="lp-nav">
          <div className="lp-nav-logo">
            <Factory size={24} />
            ProSched
          </div>
          <Link to="/login" className="lp-nav-cta">
            Sign In
          </Link>
        </nav>

        {/* ── Hero ── */}
        <section className="lp-hero" id="hero">
          <div className="lp-hero-badge">
            <span className="pulse-dot" />
            Now with AI-powered scheduling
          </div>

          <h1>
            Production Planning
            <br />
            <span className="gradient-text">Made Effortless</span>
          </h1>

          <p className="lp-hero-sub">
            Streamline your factory floor with intelligent scheduling, real-time
            analytics, and seamless workforce management — all in one platform.
          </p>

          <div className="lp-hero-actions">
            <Link to="/login" className="lp-btn-primary">
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <a href="#features" className="lp-btn-ghost">
              See Features
              <ChevronDown size={18} />
            </a>
          </div>

          <div className="scroll-indicator">
            <div className="scroll-mouse" />
            <span>Scroll</span>
          </div>
        </section>

        {/* ── Stats ── */}
        <div className="stats-bar">
          {STATS.map((s, i) => (
            <div key={i} className={`stat-item reveal reveal-delay-${i + 1}`}>
              <div className="stat-number">{s.number}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Features Showcase ── */}
        <section className="lp-section" id="features">
          <h2 className="lp-section-title reveal">
            See What's{" "}
            <span className="gradient-text">Inside ProSched</span>
          </h2>
          <p className="lp-section-sub reveal">
            Don't just take our word for it — explore the actual interface.
            Click each tab to see how ProSched transforms your production floor.
          </p>

          {/* Tabs */}
          <div className="showcase-tabs reveal">
            {SHOWCASE.map((s, i) => (
              <button
                key={s.id}
                className={`showcase-tab ${activeTab === i ? "active" : ""} ${s.color}`}
                onClick={() => setActiveTab(i)}
              >
                {s.icon}
                <span>{s.tab}</span>
              </button>
            ))}
          </div>

          {/* Showcase panel */}
          <div className="showcase-panel reveal" key={current.id}>
            <div className="showcase-info">
              <h3 className="showcase-title">{current.title}</h3>
              <p className="showcase-desc">{current.desc}</p>
              <ul className="showcase-bullets">
                {current.bullets.map((b, i) => (
                  <li key={i}>
                    <CheckCircle2 size={16} className={`bullet-icon ${current.color}`} />
                    {b}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="lp-btn-primary" style={{ marginTop: "1.5rem" }}>
                Try It Now
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="showcase-image-wrap">
              <div className={`showcase-image-glow ${current.color}`} />
              <img
                src={current.image}
                alt={`${current.tab} preview`}
                className="showcase-image"
              />
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="lp-cta-section">
          <h2 className="reveal">
            Ready to Transform
            <br />
            Your <span className="gradient-text">Production Line</span>?
          </h2>
          <p className="reveal reveal-delay-1">
            Join hundreds of factories already using ProSched to cut scheduling
            time, boost throughput, and delight their teams.
          </p>
          <div className="reveal reveal-delay-2">
            <Link to="/login" className="lp-btn-primary">
              Start Scheduling Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="lp-footer">
          <div className="lp-footer-logo">ProSched</div>
          <p>&copy; {new Date().getFullYear()} ProSched. Built for modern factories.</p>
        </footer>
      </div>
    </div>
  );
}
