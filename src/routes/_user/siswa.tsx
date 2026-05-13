import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { toast } from "sonner";
import {
  FileWarning, MessageCircleHeart, Trophy, Award, HeartPulse, Sparkles,
  ShieldCheck, Phone, Smile, Meh, Frown, Angry,
} from "lucide-react";

export const Route = createFileRoute("/_user/siswa")({
  head: () => ({ meta: [{ title: "Dashboard Siswa — SafeSchool" }] }),
  component: SiswaDashboard,
});

function SiswaDashboard() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [konsul, setKonsul] = useState<any[]>([]);
  const [pencapaian, setPencapaian] = useState<any[]>([]);
  const [moodPicked, setMoodPicked] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const nama = profile.full_name;
      const [r, k, p] = await Promise.all([
        supabase.from("reports").select("*").eq("nama", nama || "").order("created_at", { ascending: false }),
        supabase.from("consultations").select("*").eq("nama", nama || "").order("created_at", { ascending: false }),
        profile.nis
          ? supabase.from("pencapaian").select("*").eq("nis", profile.nis)
          : Promise.resolve({ data: [] } as any),
      ]);
      setReports(r.data || []);
      setKonsul(k.data || []);
      setPencapaian(p.data || []);
    })();
  }, [profile]);

  const totalPoin = pencapaian.reduce((s, x) => s + (x.poin || 0), 0);
  const level = Math.floor(totalPoin / 100) + 1;
  const progressLevel = totalPoin % 100;
  const aktif = reports.filter((r) => r.status !== "selesai").length;

  const moods = [
    { e: <Smile className="h-6 w-6" />, key: "senang", label: "Senang", t: "Senang banget!", d: "Pertahankan energi positifmu, sebar ke sekitar 💛" },
    { e: <Meh className="h-6 w-6" />,   key: "biasa",  label: "Biasa",  t: "Hari biasa.",     d: "Pelan-pelan saja. Setiap hari berharga 🌿" },
    { e: <Frown className="h-6 w-6" />, key: "sedih",  label: "Sedih",  t: "Kamu sedih ya.",  d: "Cerita ke guru BK bisa bantu kamu lebih lega 💜" },
    { e: <Angry className="h-6 w-6" />, key: "marah",  label: "Marah",  t: "Tarik napas dulu.", d: "Tenang sebentar, lalu pikirkan langkahnya 🌬️" },
  ];
  const pickMood = async (m: typeof moods[number]) => {
    setMoodPicked(m.key);
    const { error } = await supabase.from("mood_entries").insert({ mood: m.key });
    if (error) return toast.error("Gagal menyimpan mood", { description: error.message });
    toast.success(m.t, { description: m.d });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-background to-purple-50/40 dark:from-slate-950 dark:to-purple-950/30">
      <SiteHeader />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Hero greeting */}
        <Card className="relative overflow-hidden border-0 gradient-brand p-5 text-white shadow-glow sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm opacity-80">Halo, Siswa SMK Wikrama 👋</p>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{profile?.full_name}</h1>
              <p className="mt-1 text-sm opacity-90">{profile?.kelas || "—"} · NIS {profile?.nis || "—"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Link to="/lapor"><FileWarning className="mr-1 h-4 w-4" />Lapor</Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/konsultasi"><MessageCircleHeart className="mr-1 h-4 w-4" />Konsultasi</Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Stat cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={FileWarning} label="Laporan Saya" value={reports.length} color="from-rose-500 to-pink-600" />
          <StatCard icon={MessageCircleHeart} label="Konsultasi" value={konsul.length} color="from-blue-500 to-indigo-600" />
          <StatCard icon={Trophy} label="Total Poin" value={totalPoin} color="from-amber-500 to-orange-600" />
          <StatCard icon={Award} label="Level" value={`Lv ${level}`} color="from-fuchsia-500 to-purple-600" />
        </div>

        {/* Level progress */}
        <Card className="mt-6 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Progress menuju Level {level + 1}</p>
              <p className="font-display text-lg font-bold">{progressLevel} / 100 poin</p>
            </div>
            <Award className="h-8 w-8 text-primary" />
          </div>
          <Progress value={progressLevel} className="mt-3" />
        </Card>

        {/* Banner darurat */}
        {aktif > 0 && (
          <Card className="mt-6 flex flex-col items-start gap-3 border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30 sm:flex-row sm:items-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-500 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-amber-900 dark:text-amber-100">Ada {aktif} laporan kamu yang sedang ditangani.</p>
              <p className="text-amber-800/80 dark:text-amber-200/80">Tim BK akan segera menghubungimu. Tetap tenang, kamu tidak sendirian.</p>
            </div>
          </Card>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Mood tracker */}
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-pink-500" />
              <h2 className="font-display text-lg font-bold">Mood Hari Ini</h2>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">Bagaimana perasaanmu sekarang?</p>
            <div className="grid grid-cols-4 gap-2">
              {moods.map((m) => (
                <button
                  key={m.key}
                  onClick={() => pickMood(m)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-sm transition hover:scale-105 ${
                    moodPicked === m.key ? "gradient-brand text-white shadow-glow border-transparent" : "bg-card"
                  }`}
                >
                  {m.e}
                  <span className="text-xs">{m.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Status laporan */}
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-rose-500" />
              <h2 className="font-display text-lg font-bold">Status Laporan Saya</h2>
            </div>
            {reports.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Belum ada laporan. Kalau ada masalah, jangan ragu untuk{" "}
                <Link to="/lapor" className="text-primary font-medium hover:underline">lapor</Link>.
              </div>
            ) : (
              <ul className="space-y-2">
                {reports.slice(0, 5).map((r) => (
                  <li key={r.id} className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{r.jenis}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{r.lokasi} · {new Date(r.created_at).toLocaleDateString("id-ID")}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Konsultasi */}
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <MessageCircleHeart className="h-5 w-5 text-blue-500" />
              <h2 className="font-display text-lg font-bold">Riwayat Konsultasi</h2>
            </div>
            {konsul.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Belum ada konsultasi.{" "}
                <Link to="/konsultasi" className="text-primary font-medium hover:underline">Atur jadwal sekarang</Link>.
              </div>
            ) : (
              <ul className="space-y-2">
                {konsul.slice(0, 5).map((k) => (
                  <li key={k.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                    <div>
                      <p className="font-medium line-clamp-1">{k.masalah}</p>
                      <p className="text-xs text-muted-foreground">{new Date(k.jadwal).toLocaleString("id-ID")}</p>
                    </div>
                    <StatusBadge status={k.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Pencapaian */}
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h2 className="font-display text-lg font-bold">Badge & Pencapaian</h2>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/leaderboard">Leaderboard →</Link>
              </Button>
            </div>
            {pencapaian.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Belum ada pencapaian. Yuk aktif bantu jaga lingkungan aman ✨
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {pencapaian.map((p) => (
                  <div key={p.id} className="rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 p-3 dark:from-amber-950/30 dark:to-orange-950/30">
                    <p className="text-lg">{p.badge}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.deskripsi}</p>
                    <Badge variant="secondary" className="mt-2">+{p.poin} poin</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Hotline */}
        <Card className="mt-6 flex flex-col items-center justify-between gap-3 border-2 border-destructive/30 bg-destructive/5 p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-destructive text-white">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Butuh bantuan segera?</p>
              <p className="text-sm text-muted-foreground">Hotline BK aktif 24 jam.</p>
            </div>
          </div>
          <a href="tel:08111100200">
            <Button variant="destructive">0811-1100-200</Button>
          </a>
        </Card>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Setiap data kamu rahasia & hanya diakses tim BK terverifikasi.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    baru: "bg-blue-500",
    menunggu: "bg-blue-500",
    diproses: "bg-amber-500",
    selesai: "bg-emerald-500",
  };
  return <Badge className={`${map[s] || "bg-muted-foreground"} capitalize`}>{status}</Badge>;
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
  return (
    <Card className="overflow-hidden p-5">
      <div className={`mb-3 inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-soft ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold">{value}</p>
    </Card>
  );
}
