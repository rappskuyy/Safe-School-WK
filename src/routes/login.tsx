import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Shield, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login Guru BK — SafeSchool" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(login);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Berhasil masuk");
    navigate({ to: "/dashboard" });
  };

  const doSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signup.email,
      password: signup.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: signup.name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Akun dibuat! Tunggu admin menyetujui akses Guru BK.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-soft/30">
      <header className="container mx-auto flex h-16 items-center px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-gradient-brand">SafeSchool</span>
        </Link>
      </header>
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md p-6 md:p-8 shadow-glow">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold">Akses Guru BK</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Masuk untuk melihat laporan & konsultasi siswa
            </p>
          </div>

          <Tabs defaultValue="login" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login"><LogIn className="mr-2 h-4 w-4" />Masuk</TabsTrigger>
              <TabsTrigger value="signup"><UserPlus className="mr-2 h-4 w-4" />Daftar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={doLogin} className="space-y-4 mt-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-brand text-white">
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={doSignup} className="space-y-4 mt-4">
                <div>
                  <Label>Nama Lengkap</Label>
                  <Input required value={signup.name} onChange={(e) => setSignup({ ...signup, name: e.target.value })} />
                </div>
                <div>
                  <Label>Email Sekolah</Label>
                  <Input type="email" required value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} />
                </div>
                <div>
                  <Label>Password (min. 8 karakter)</Label>
                  <Input type="password" required minLength={8} value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} />
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-brand text-white">
                  {loading ? "Memproses..." : "Daftar"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Akun baru perlu disetujui admin sebelum bisa melihat laporan.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}
