import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogIn, Eye, EyeOff, KeyRound, User, GraduationCap, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { loginTeacher, getTeacher } from "@/lib/teacher-auth";
import { signInUser } from "@/lib/student-auth";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — SafeSchool SMK Wikrama Bogor" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Auto redirect kalau sudah login
  useEffect(() => {
    if (getTeacher()) navigate({ to: "/dashboard" });
    else if (user && profile?.role === "siswa") navigate({ to: "/siswa" });
    else if (user && profile?.role === "ortu") navigate({ to: "/ortu" });
  }, [user, profile, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-400/30 blur-3xl animate-float [animation-delay:1.5s]" />

      <header className="container relative mx-auto flex h-16 items-center px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <Logo />
          <div className="leading-tight">
            <div className="text-gradient-brand">SafeSchool</div>
            <div className="text-[10px] font-normal text-muted-foreground">SMK Wikrama Bogor</div>
          </div>
        </Link>
      </header>

      <main className="container relative mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-2 border-primary/10 p-6 shadow-glow backdrop-blur animate-fade-up">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white shadow-glow">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold">Masuk SafeSchool</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pilih jenis akun kamu</p>
          </div>

          <Tabs defaultValue="siswa" className="mt-5">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="siswa"><GraduationCap className="mr-1 h-4 w-4" />Siswa</TabsTrigger>
              <TabsTrigger value="ortu"><Users className="mr-1 h-4 w-4" />Ortu</TabsTrigger>
              <TabsTrigger value="guru"><User className="mr-1 h-4 w-4" />Guru</TabsTrigger>
            </TabsList>

            <TabsContent value="siswa" className="mt-4">
              <SupabaseLoginForm role="siswa" onSuccess={() => navigate({ to: "/siswa" })} />
            </TabsContent>
            <TabsContent value="ortu" className="mt-4">
              <SupabaseLoginForm role="ortu" onSuccess={() => navigate({ to: "/ortu" })} />
            </TabsContent>
            <TabsContent value="guru" className="mt-4">
              <TeacherLoginForm onSuccess={() => navigate({ to: "/dashboard" })} />
            </TabsContent>
          </Tabs>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Kembali ke <Link to="/" className="text-primary hover:underline">halaman utama</Link>
          </p>
        </Card>
      </main>
    </div>
  );
}

function SupabaseLoginForm({ role, onSuccess }: { role: "siswa" | "ortu"; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      return toast.warning("Email & password wajib diisi", {
        description: "Lengkapi kedua kolom untuk melanjutkan.",
      });
    }
    setLoading(true);
    try {
      await signInUser(email.trim(), password);
      toast.success("Selamat datang kembali 🎉", {
        description: "Mengarahkan ke dashboardmu...",
      });
      onSuccess();
    } catch (err: any) {
      toast.error("Login gagal", {
        description: err.message || "Periksa email & password kamu, lalu coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5">
        <Label>Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input required type="email" placeholder="email@contoh.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Password</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input required type={show ? "text" : "password"} placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-10" />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" disabled={loading} size="lg" className="w-full gradient-brand text-white shadow-glow">
        <LogIn className="mr-2 h-4 w-4" />{loading ? "Masuk..." : "Masuk"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Belum punya akun?{" "}
        <Link to="/register" search={{ role }} className="text-primary font-medium hover:underline">
          Daftar sebagai {role === "siswa" ? "Siswa" : "Orang Tua"}
        </Link>
      </p>
    </form>
  );
}

function TeacherLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!u.trim() || !p) {
      return toast.warning("Username & password wajib diisi", {
        description: "Lengkapi kedua kolom untuk melanjutkan.",
      });
    }
    setLoading(true);
    setTimeout(() => {
      const t = loginTeacher(u.trim(), p);
      setLoading(false);
      if (!t) {
        return toast.error("Login guru gagal", {
          description: "Username atau password salah. Coba akun demo: bukartika / safe123.",
        });
      }
      toast.success(`Selamat datang, ${t.nama} 👩‍🏫`, {
        description: "Mengarahkan ke dashboard guru BK...",
      });
      onSuccess();
    }, 300);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5">
        <Label>Username</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input required placeholder="bukartika" value={u} onChange={(e) => setU(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Password</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input required type={show ? "text" : "password"} placeholder="••••••" value={p} onChange={(e) => setP(e.target.value)} className="pl-9 pr-10" />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" disabled={loading} size="lg" className="w-full gradient-brand text-white shadow-glow">
        <LogIn className="mr-2 h-4 w-4" />{loading ? "Memeriksa..." : "Masuk"}
      </Button>
      <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Akun demo guru:</p>
        <p className="mt-1"><code>bukartika</code> / <code>safe123</code></p>
      </div>
    </form>
  );
}
