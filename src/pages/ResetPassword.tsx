import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Factory, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

    console.log("Password recovery mode active");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Mock API delay
      
      toast.success("Password updated successfully!");
      navigate("/");
    } catch (err: any) {
      setError(err.message ?? "Failed to update password. Your link might have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="login-form-wrap" style={{ maxWidth: '400px', width: '100%', padding: '2rem', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="login-mobile-logo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Factory size={32} className="text-purple-400" style={{ color: '#a78bfa' }} />
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginLeft: '0.5rem' }}>ProSched</span>
          </div>

          <h1 className="login-form-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Reset Password</h1>
          <p className="login-form-sub" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Enter your new password below.
          </p>

          <form onSubmit={submit} className="login-form">
            <div className="login-field-group">
              <label className="login-label">New Password</label>
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

            <div className="login-field-group">
              <label className="login-label">Confirm Password</label>
              <div className="login-pw-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="login-input login-input-pw"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              Update Password
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
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

        .login-container {
          position: relative;
          z-index: 1;
          min-height: 100vh;
        }
        .login-form-wrap {
          animation: fadeInUp 0.7s ease both 0.15s;
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

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
