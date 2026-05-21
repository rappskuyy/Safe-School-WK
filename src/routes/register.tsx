import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { UserPlus, Mail, KeyRound, User, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpUser } from "@/lib/student-auth";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Daftar Akun Orang Tua — SafeSchool" }] }),
  component: RegisterPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  email: z.string().trim().email("Email tidak valid").max(255),
  password: z.string().min(6, "Password minimal 6 karakter").max(72),
  child_name: z.string().trim().min(2, "Nama anak minimal 2 karakter").max(80),
  child_kelas: z.string().trim().min(1, "Kelas anak wajib diisi").max(30),
});

function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-400/30 blur-3xl animate-float" />
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
        <Card className="w-full max-w-md p-6 shadow-glow border-2 border-primary/10 animate-fade-up">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white shadow-glow">
              <UserPlus className="h-7 w-7" />
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold">Daftar Akun Orang Tua</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pantau laporan dan aktivitas BK anak kamu
            </p>
          </div>

          <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 p-3 text-xs text-blue-700 dark:text-blue-300">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              Halaman ini khusus untuk <strong>Orang Tua/Wali</strong>.
              Guru mendapat akun dari admin sekolah.
            </span>
          </div>

          <RegForm onDone={() => navigate({ to: "/login" })} />

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Masuk
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}

function RegForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    child_name: "",
    child_kelas: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = schema.parse(form);
      setLoading(true);
      await signUpUser({
        ...parsed,
        role: "ortu",
      });
      toast.success("Akun berhasil dibuat 🎉", {
        description: "Silakan masuk dengan email & password yang baru kamu daftarkan.",
      });
      onDone();
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.message ||
        err?.message ||
        "Periksa data kamu lalu coba lagi.";
      toast.error("Pendaftaran gagal", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-5 space-y-3">
      <Field label="Nama Lengkap Orang Tua" icon={User}>
        <Input
          required
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          placeholder="contoh: Budi Santoso"
          className="pl-9"
        />
      </Field>

      <Field label="Email" icon={Mail}>
        <Input
          required
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="email@gmail.com"
          className="pl-9"
        />
      </Field>

      <Field label="Password" icon={KeyRound}>
        <Input
          required
          type="password"
          minLength={6}
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          placeholder="minimal 6 karakter"
          className="pl-9"
        />
      </Field>

      <div className="border-t pt-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Data Anak
        </p>
        <div className="space-y-3">
          <Field label="Nama Anak" icon={User}>
            <Input
              required
              value={form.child_name}
              onChange={(e) => set("child_name", e.target.value)}
              placeholder="contoh: Andi Santoso"
              className="pl-9"
            />
          </Field>

          <Field label="Kelas Anak" icon={GraduationCap}>
            <Input
              required
              value={form.child_kelas}
              onChange={(e) => set("child_kelas", e.target.value)}
              placeholder="contoh: XI RPL 1"
              className="pl-9"
            />
          </Field>
        </div>
      </div>

      <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
        💡 Nama dan kelas anak digunakan untuk memfilter laporan yang berkaitan dengan anak kamu.
      </p>

      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="w-full gradient-brand text-white shadow-glow"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        {loading ? "Mendaftar..." : "Daftar Akun"}
      </Button>
    </form>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}
