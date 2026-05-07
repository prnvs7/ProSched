import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Factory, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function Login() {
  const { user, loading: authLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<"manager" | "worker">("manager");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authLoading && user) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await api.post('/auth/register', { email, password, role });
        signIn(res.token, res.user);
        toast.success("Account created! Welcome aboard.");
        navigate("/");
      } else {
        const res = await api.post('/auth/login', { email, password });
        signIn(res.token, res.user);
        toast.success("Welcome back");
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Background */}
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <div className="login-container">
        {/* Left — Branding panel */}
        <div className="login-brand">
          <div className="login-brand-content">
            <div className="login-brand-logo">
              <Factory size={32} />
              <span>ProSched</span>
            </div>
            <h2 className="login-brand-title">
              Smart Production<br />
              <span className="login-gradient-text">Planning & Scheduling</span>
            </h2>
            <p className="login-brand-sub">
              Manage your entire factory floor with intelligent scheduling,
              real-time analytics, and seamless workforce management.
            </p>
            <div className="login-brand-features">
              {["AI-powered scheduling", "Real-time dashboards", "One-click reports"].map((f) => (
                <div key={f} className="login-brand-feature">
                  <div className="login-feature-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Form panel */}
        <div className="login-form-panel">
          <div className="login-form-wrap">
            {/* Mobile logo */}
            <div className="login-mobile-logo">
              <Factory size={26} className="text-purple-400" />
              <span>ProSched</span>
            </div>

            <h1 className="login-form-title">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="login-form-sub">
              {mode === "login"
                ? "Sign in to manage your production floor"
                : "Set up your factory account in seconds"}
            </p>

            <form onSubmit={submit} className="login-form">
              {/* Email */}
              <div className="login-field-group">
                <label className="login-label">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  placeholder="you@factory.com"
                />
              </div>

              {/* Password */}
              <div className="login-field-group">
                <label className="login-label">Password</label>
                <div className="login-pw-wrap">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input login-input-pw"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="login-pw-toggle"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Role selector (signup only) */}
              {mode === "signup" && (
                <div className="login-field-group">
                  <label className="login-label">Role</label>
                  <div className="login-role-grid">
                    {(["manager", "worker"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`login-role-btn ${role === r ? "active" : ""}`}
                      >
                        {r === "manager" ? "Manager" : "Worker"}
                      </button>
                    ))}
                  </div>
                  <p className="login-role-hint">
                    Managers can create and edit data; workers have read access.
                  </p>
                </div>
              )}

              {/* Remember + Forgot (login only) */}
              {mode === "login" && (
                <div className="login-extras">
                  <label className="login-remember">
                    <input type="checkbox" className="login-checkbox" />
                    <span>Remember me</span>
                  </label>
                  <button type="button" onClick={() => navigate("/forgot-password")} className="login-forgot">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                {mode === "login" ? "Sign In" : "Create Account"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Toggle mode */}
            <div className="login-toggle">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
                className="login-toggle-btn"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-root {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
          background: #060611;
        }

        /* Animated background */
        .login-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: linear-gradient(135deg, #060611 0%, #1a0533 40%, #0c1445 70%, #060611 100%);
        }
        .login-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          pointer-events: none;
          will-change: transform;
        }
        .login-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #7c3aed, transparent 70%);
          top: -15%; left: -10%;
          animation: loginOrb1 20s ease-in-out infinite;
        }
        .login-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #2563eb, transparent 70%);
          bottom: -10%; right: -5%;
          animation: loginOrb2 25s ease-in-out infinite;
        }
        .login-orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #06b6d4, transparent 70%);
          top: 50%; left: 40%;
          animation: loginOrb3 18s ease-in-out infinite;
        }
        @keyframes loginOrb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(50px,60px) scale(1.1)} }
        @keyframes loginOrb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-40px,-50px) scale(1.05)} }
        @keyframes loginOrb3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-30px) scale(1.1)} }

        /* Container — split layout */
        .login-container {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        /* Left brand panel */
        .login-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          position: relative;
        }
        .login-brand::after {
          content: '';
          position: absolute;
          right: 0;
          top: 10%;
          height: 80%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(124,58,237,0.3), transparent);
        }
        .login-brand-content {
          max-width: 420px;
          animation: fadeInUp 0.7s ease both;
        }
        .login-brand-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: 2rem;
        }
        .login-brand-logo svg { color: #a78bfa; }
        .login-brand-title {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.15;
          color: white;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .login-gradient-text {
          background: linear-gradient(135deg, #7c3aed, #ec4899, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .login-brand-sub {
          color: #94a3b8;
          font-size: 1rem;
          line-height: 1.7;
          margin-bottom: 2rem;
        }
        .login-brand-features {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .login-brand-feature {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #cbd5e1;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .login-feature-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #06b6d4);
          flex-shrink: 0;
        }

        /* Right form panel */
        .login-form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
        }
        .login-form-wrap {
          width: 100%;
          max-width: 400px;
          animation: fadeInUp 0.7s ease both 0.15s;
        }

        .login-mobile-logo {
          display: none;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 2rem;
        }

        .login-form-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }
        .login-form-sub {
          color: #94a3b8;
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }

        /* Form */
        .login-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .login-field-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .login-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .login-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: white;
          font-size: 0.9rem;
          transition: all 0.25s ease;
          outline: none;
        }
        .login-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
        }
        .login-input::placeholder { color: #475569; }

        /* Password wrapper */
        .login-pw-wrap { position: relative; }
        .login-input-pw { padding-right: 2.5rem; }
        .login-pw-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
        }
        .login-pw-toggle:hover { color: #94a3b8; }

        /* Role selector */
        .login-role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
        .login-role-btn {
          padding: 0.6rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .login-role-btn.active {
          border-color: #7c3aed;
          background: rgba(124,58,237,0.12);
          color: #a78bfa;
          box-shadow: 0 0 12px rgba(124,58,237,0.15);
        }
        .login-role-btn:hover:not(.active) { background: rgba(255,255,255,0.05); color: #cbd5e1; }
        .login-role-hint { font-size: 0.75rem; color: #64748b; margin-top: 0.3rem; }

        /* Extras row */
        .login-extras {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .login-remember {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          color: #94a3b8;
          cursor: pointer;
        }
        .login-checkbox {
          width: 16px; height: 16px;
          border-radius: 4px;
          accent-color: #7c3aed;
          cursor: pointer;
        }
        .login-forgot {
          font-size: 0.82rem;
          color: #a78bfa;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: color 0.2s;
        }
        .login-forgot:hover { color: #c4b5fd; }

        /* Error */
        .login-error {
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171;
          animation: shake 0.4s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        /* Submit */
        .login-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.85rem;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          color: white;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .login-submit::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }
        .login-submit:hover::after { transform: translateX(100%); }
        .login-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(124,58,237,0.45);
        }
        .login-submit:active { transform: scale(0.97); }
        .login-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Toggle */
        .login-toggle {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.85rem;
          color: #64748b;
        }
        .login-toggle-btn {
          color: #a78bfa;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .login-toggle-btn:hover { color: #c4b5fd; text-decoration: underline; }

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive */
        @media (max-width: 900px) {
          .login-container { grid-template-columns: 1fr; }
          .login-brand { display: none; }
          .login-form-panel { padding: 2rem 1.5rem; }
          .login-mobile-logo { display: flex; }
        }
      `}</style>
    </div>
  );
}
