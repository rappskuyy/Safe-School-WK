import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { UserPlus, Mail, KeyRound, User, Hash, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { signUpUser } from "@/lib/student-auth";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

type Search = { role?: "siswa" | "ortu" };

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    role: s.role === "ortu" ? "ortu" : "siswa",
  }),
  head: () => ({ meta: [{ title: "Daftar Akun — SafeSchool" }] }),
  component: RegisterPage,
});

const baseSchema = z.object({
  full_name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  email: z.string().trim().email("Email tidak valid").max(255),
  password: z.string().min(6, "Password minimal 6 karakter").max(72),
});

function RegisterPage() {
  const navigate = useNavigate();
  const { role } = Route.useSearch();

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
            <h1 className="mt-3 font-display text-2xl font-bold">Buat Akun Baru</h1>
          </div>

          <Tabs defaultValue={role || "siswa"} className="mt-5">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="siswa"><GraduationCap className="mr-1 h-4 w-4" />Siswa</TabsTrigger>
              <TabsTrigger value="ortu"><Users className="mr-1 h-4 w-4" />Orang Tua</TabsTrigger>
            </TabsList>
            <TabsContent value="siswa" className="mt-4">
              <RegForm role="siswa" onDone={() => navigate({ to: "/login" })} />
            </TabsContent>
            <TabsContent value="ortu" className="mt-4">
              <RegForm role="ortu" onDone={() => navigate({ to: "/login" })} />
            </TabsContent>
          </Tabs>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Sudah punya akun? <Link to="/login" className="text-primary hover:underline">Masuk</Link>
          </p>
        </Card>
      </main>
    </div>
  );
}

function RegForm({ role, onDone }: { role: "siswa" | "ortu"; onDone: () => void }) {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", nis: "", kelas: "", child_nis: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = baseSchema.parse(form);
      if (role === "siswa" && !form.nis.trim()) return toast.error("NIS wajib diisi");
      if (role === "ortu" && !form.child_nis.trim()) return toast.error("NIS anak wajib diisi");
      setLoading(true);
      await signUpUser({
        ...parsed,
        role,
        nis: role === "siswa" ? form.nis.trim() : undefined,
        kelas: role === "siswa" ? form.kelas.trim() : undefined,
        child_nis: role === "ortu" ? form.child_nis.trim() : undefined,
      });
      toast.success("Akun berhasil dibuat! Silakan login.");
      onDone();
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.message || err.message || "Pendaftaran gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Nama Lengkap" icon={User}>
        <Input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className="pl-9" />
      </Field>
      <Field label="Email" icon={Mail}>
        <Input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="pl-9" />
      </Field>
      <Field label="Password" icon={KeyRound}>
        <Input required type="password" minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} className="pl-9" />
      </Field>

      {role === "siswa" ? (
        <>
          <Field label="NIS (Nomor Induk Siswa)" icon={Hash}>
            <Input required value={form.nis} onChange={(e) => set("nis", e.target.value)} placeholder="contoh: 2210001" className="pl-9" />
          </Field>
          <div className="space-y-1.5">
            <Label>Kelas</Label>
            <Input value={form.kelas} onChange={(e) => set("kelas", e.target.value)} placeholder="contoh: XI RPL 1" />
          </div>
          <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
            💡 Coba pakai NIS demo: <code>2210001</code> atau <code>2210002</code> untuk lihat data contoh.
          </p>
        </>
      ) : (
        <>
          <Field label="NIS Anak" icon={Hash}>
            <Input required value={form.child_nis} onChange={(e) => set("child_nis", e.target.value)} placeholder="contoh: 2210001" className="pl-9" />
          </Field>
          <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
            💡 Pakai NIS demo: <code>2210001</code> atau <code>2210002</code> untuk lihat data contoh anak.
          </p>
        </>
      )}

      <Button type="submit" disabled={loading} size="lg" className="w-full gradient-brand text-white shadow-glow">
        <UserPlus className="mr-2 h-4 w-4" />{loading ? "Mendaftar..." : "Daftar"}
      </Button>
    </form>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
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
