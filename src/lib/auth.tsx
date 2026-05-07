import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";

type Role = "manager" | "worker";

export interface User {
  id: string;
  email: string;
  role: Role;
}

interface Session {
  access_token: string;
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  role: Role | null;
  loading: boolean;
  isManager: boolean;
  signIn: (token: string, userData: User) => void;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setSession({ access_token: token });
          setUser(res.user);
          setRole(res.user.role);
        } catch (err) {
          console.error("Failed to fetch user", err);
          localStorage.removeItem("token");
          setSession(null);
          setUser(null);
          setRole(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const signIn = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    setSession({ access_token: token });
    setUser(userData);
    setRole(userData.role);
  };

  const signOut = async () => {
    localStorage.removeItem("token");
    setSession(null);
    setUser(null);
    setRole(null);
  };

  const refreshRole = async () => {
    if (user) {
      try {
        const res = await api.get('/auth/me');
        setUser(res.user);
        setRole(res.user.role);
      } catch (err) {
        console.error("Failed to refresh role");
      }
    }
  };

  return (
    <Ctx.Provider value={{ user, session, role, loading, isManager: role === "manager", signIn, signOut, refreshRole }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
