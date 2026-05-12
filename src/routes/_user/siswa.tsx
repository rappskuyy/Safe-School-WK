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
import { Calendar, CheckCircle2, BookOpen, Trophy, Award, TrendingUp, Clock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_user/siswa")({
  head: () => ({ meta: [{ title: "Dashboard Siswa — SafeSchool" }] }),
  component: SiswaDashboard,
});

function SiswaDashboard() {
  const { profile } = useAuth();
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [tugas, setTugas] = useState<any[]>([]);
  const [nilai, setNilai] = useState<any[]>([]);
  const [absen, setAbsen] = useState<any[]>([]);
  const [pencapaian, setPencapaian] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const kelas = profile.kelas || "XI RPL 1";
      const nis = profile.nis;
      const [j, t, n, a, p] = await Promise.all([
        supabase.from("jadwal_pelajaran").select("*").eq("kelas", kelas).order("hari"),
        supabase.from("tugas").select("*").eq("kelas", kelas).order("deadline"),
        nis ? supabase.from("nilai").select("*").eq("nis", nis) : Promise.resolve({ data: [] } as any),
        nis ? supabase.from("absensi").select("*").eq("nis", nis).order("tanggal", { ascending: false }).limit(10) : Promise.resolve({ data: [] } as any),
        nis ? supabase.from("pencapaian").select("*").eq("nis", nis) : Promise.resolve({ data: [] } as any),
      ]);
      setJadwal(j.data || []);
      setTugas(t.data || []);
      setNilai(n.data || []);
      setAbsen(a.data || []);
      setPencapaian(p.data || []);
    })();
  }, [profile]);

  const totalPoin = pencapaian.reduce((s, x) => s + (x.poin || 0), 0);
  const rata = nilai.length ? Math.round(nilai.reduce((s, x) => s + Number(x.nilai), 0) / nilai.length) : 0;
  const hadir = absen.filter((a) => a.status === "hadir").length;
  const persenHadir = absen.length ? Math.round((hadir / absen.length) * 100) : 0;
  const level = Math.floor(totalPoin / 100) + 1;
  const progressLevel = totalPoin % 100;

  const today = new Date();
  const hariNames = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const hariIni = hariNames[today.getDay()];
  const jadwalHariIni = jadwal.filter((j) => j.hari === hariIni);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-background to-purple-50/40 dark:from-slate-950 dark:to-purple-950/30">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Hero greeting */}
        <Card className="relative overflow-hidden border-0 gradient-brand p-6 text-white shadow-glow">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm opacity-80">Halo, Siswa SMK Wikrama 👋</p>
              <h1 className="font-display text-3xl font-bold">{profile?.full_name}</h1>
              <p className="mt-1 text-sm opacity-90">{profile?.kelas || "—"} · NIS {profile?.nis || "—"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Link to="/lapor"><Sparkles className="mr-1 h-4 w-4" />Lapor Bullying</Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/konsultasi">Konsultasi BK</Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Stat cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={TrendingUp} label="Rata-rata Nilai" value={rata || "—"} color="from-blue-500 to-indigo-600" />
          <StatCard icon={CheckCircle2} label="Kehadiran" value={`${persenHadir}%`} color="from-emerald-500 to-teal-600" />
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

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Jadwal hari ini */}
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">Jadwal {hariIni} Ini</h2>
            </div>
            {jadwalHariIni.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada pelajaran hari ini 🎉</p>
            ) : (
              <ul className="space-y-2">
                {jadwalHariIni.map((j) => (
                  <li key={j.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                    <div>
                      <p className="font-medium">{j.mapel}</p>
                      <p className="text-xs text-muted-foreground">{j.guru} · {j.ruang}</p>
                    </div>
                    <Badge variant="secondary">{j.jam_mulai}–{j.jam_selesai}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Tugas */}
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">Tugas Mendatang</h2>
            </div>
            {tugas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada tugas. Santai dulu ✨</p>
            ) : (
              <ul className="space-y-2">
                {tugas.slice(0, 5).map((t) => {
                  const days = Math.ceil((new Date(t.deadline).getTime() - Date.now()) / 86400000);
                  return (
                    <li key={t.id} className="rounded-lg border bg-muted/30 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{t.judul}</p>
                          <p className="text-xs text-muted-foreground">{t.mapel}</p>
                        </div>
                        <Badge variant={days <= 2 ? "destructive" : "secondary"}>
                          <Clock className="mr-1 h-3 w-3" />{days}h lagi
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Nilai */}
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">Nilai Kamu</h2>
            </div>
            {nilai.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada nilai untuk NIS ini.</p>
            ) : (
              <ul className="space-y-2">
                {nilai.map((n) => (
                  <li key={n.id} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="font-medium">{n.mapel}</span>
                    <Badge className={Number(n.nilai) >= 85 ? "bg-emerald-500" : Number(n.nilai) >= 75 ? "bg-blue-500" : "bg-amber-500"}>
                      {Number(n.nilai)}
                    </Badge>
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
              <p className="text-sm text-muted-foreground">Belum ada pencapaian. Yuk mulai aktif!</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {pencapaian.map((p) => (
                  <div key={p.id} className="rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 p-3 dark:from-amber-950/30 dark:to-orange-950/30">
                    <p className="text-lg">{p.badge}</p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.deskripsi}</p>
                    <Badge variant="secondary" className="mt-2">+{p.poin} poin</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
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
