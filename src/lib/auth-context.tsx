import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  nis: string | null;
  kelas: string | null;
  child_nis: string | null;
};

interface AuthCtx {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid?: string) => {
    if (!uid) return setProfile(null);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, nis, kelas, child_nis")
      .eq("id", uid)
      .maybeSingle();
    setProfile(data as UserProfile | null);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setTimeout(() => loadProfile(s?.user?.id), 0);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      loadProfile(session?.user?.id).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider
      value={{
        user, session, profile, loading,
        signOut: async () => { await supabase.auth.signOut(); setProfile(null); },
        refresh: () => loadProfile(user?.id),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};
