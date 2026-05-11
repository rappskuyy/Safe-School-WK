import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, LogIn, Eye, EyeOff, KeyRound, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginTeacher, getTeacher } from "@/lib/teacher-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login Guru BK — SafeSchool" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getTeacher()) navigate({ to: "/dashboard" });
  }, [navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const t = loginTeacher(username.trim(), password);
      setLoading(false);
      if (!t) return toast.error("Username atau password salah");
      toast.success(`Selamat datang, ${t.nama}!`);
      navigate({ to: "/dashboard" });
    }, 400); // efek loading kecil
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      {/* blob dekorasi */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-400/30 blur-3xl animate-float [animation-delay:1.5s]" />

      <header className="container relative mx-auto flex h-16 items-center px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white shadow-glow">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-gradient-brand">SafeSchool</span>
        </Link>
      </header>

      <main className="container relative mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-2 border-primary/10 p-8 shadow-glow backdrop-blur animate-fade-up">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white shadow-glow">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold">Login Guru BK</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Hanya untuk guru. Siswa tidak perlu login.
            </p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="u">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="u"
                  required
                  autoComplete="username"
                  placeholder="contoh: bukartika"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="p"
                  type={show ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Tampilkan password"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full gradient-brand text-white shadow-glow hover:opacity-95"
            >
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "Memeriksa..." : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border bg-muted/40 p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Akun demo:</p>
            <ul className="mt-1 space-y-0.5">
              <li>• <code className="font-mono">bukartika</code> / <code className="font-mono">safe123</code></li>
              <li>• <code className="font-mono">pakraka</code> / <code className="font-mono">safe123</code></li>
              <li>• <code className="font-mono">buanindya</code> / <code className="font-mono">safe123</code></li>
            </ul>
            <p className="mt-2">Ubah daftar guru di <code>src/lib/teacher-auth.ts</code>.</p>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Kembali ke{" "}
            <Link to="/" className="text-primary hover:underline">halaman utama</Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
