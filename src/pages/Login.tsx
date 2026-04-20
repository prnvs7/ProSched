import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Factory, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function Login() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        const { error: e1 } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { role },
          },
        });
        if (e1) throw e1;
        toast.success("Account created! Welcome aboard.");
        navigate("/");
      } else {
        const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
        if (e2) throw e2;
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--gradient-navy)" }}>
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 animate-slide-up">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <Factory className="text-accent" size={32} />
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">ProSched</h1>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-6">
          {mode === "login" ? "Sign in to manage production" : "Create your factory account"}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@factory.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {(["manager", "worker"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      role === r ? "border-accent bg-accent/10 text-accent" : "border-input bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {r === "manager" ? "Manager" : "Worker"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Managers can create and edit data; workers have read access.</p>
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 animate-fade-in">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : null}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} className="text-accent font-semibold hover:underline">
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
