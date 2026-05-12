import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Heart, AlertTriangle, CheckCircle2, Trophy, BookOpen, TrendingUp, Calendar } from "lucide-react";

export const Route = createFileRoute("/_user/ortu")({
  head: () => ({ meta: [{ title: "Dashboard Orang Tua — SafeSchool" }] }),
  component: OrtuDashboard,
});

function OrtuDashboard() {
  const { profile } = useAuth();
  const [anak, setAnak] = useState<any>(null);
  const [nilai, setNilai] = useState<any[]>([]);
  const [absen, setAbsen] = useState<any[]>([]);
  const [pencapaian, setPencapaian] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [konsul, setKonsul] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.child_nis) return;
    const nis = profile.child_nis;
    (async () => {
      const [a, n, ab, p, r, k] = await Promise.all([
        supabase.from("profiles").select("*").eq("nis", nis).maybeSingle(),
        supabase.from("nilai").select("*").eq("nis", nis),
        supabase.from("absensi").select("*").eq("nis", nis).order("tanggal", { ascending: false }).limit(20),
        supabase.from("pencapaian").select("*").eq("nis", nis),
        supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("consultations").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setAnak(a.data);
      setNilai(n.data || []);
      setAbsen(ab.data || []);
      setPencapaian(p.data || []);
      setReports(r.data || []);
      setKonsul(k.data || []);
    })();
  }, [profile]);

  const rata = nilai.length ? Math.round(nilai.reduce((s, x) => s + Number(x.nilai), 0) / nilai.length) : 0;
  const hadir = absen.filter((x) => x.status === "hadir").length;
  const sakit = absen.filter((x) => x.status === "sakit").length;
  const izin = absen.filter((x) => x.status === "izin").length;
  const alpa = absen.filter((x) => x.status === "alpa").length;
  const persenHadir = absen.length ? Math.round((hadir / absen.length) * 100) : 0;
  const totalPoin = pencapaian.reduce((s, x) => s + (x.poin || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/40 via-background to-indigo-50/40 dark:from-slate-950 dark:to-purple-950/30">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-glow">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="text-sm opacity-80">Selamat datang, Bapak/Ibu 👋</p>
            <h1 className="font-display text-3xl font-bold">{profile?.full_name}</h1>
            <p className="mt-1 text-sm opacity-90">Memantau perkembangan anak Anda di SMK Wikrama Bogor</p>
          </div>
        </Card>

        {/* Profil anak */}
        <Card className="mt-6 p-5">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            <h2 className="font-display text-lg font-bold">Profil Anak</h2>
          </div>
          {anak ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <Info label="Nama" value={anak.full_name || "—"} />
              <Info label="NIS" value={anak.nis || "—"} />
              <Info label="Kelas" value={anak.kelas || "—"} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Data anak (NIS <code>{profile?.child_nis}</code>) belum terdaftar di sistem. Minta anak untuk mendaftar dulu.
            </p>
          )}
        </Card>

        {/* Stat */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={TrendingUp} label="Rata-rata Nilai" value={rata || "—"} color="from-blue-500 to-indigo-600" />
          <StatCard icon={CheckCircle2} label="Kehadiran" value={`${persenHadir}%`} color="from-emerald-500 to-teal-600" />
          <StatCard icon={Trophy} label="Total Poin" value={totalPoin} color="from-amber-500 to-orange-600" />
          <StatCard icon={AlertTriangle} label="Alpa" value={alpa} color="from-rose-500 to-red-600" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Nilai */}
          <Card className="p-5">
            <h3 className="mb-3 font-display text-lg font-bold">Rapor Sementara</h3>
            {nilai.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada nilai untuk anak Anda.</p>
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

          {/* Rekap absensi */}
          <Card className="p-5">
            <h3 className="mb-3 font-display text-lg font-bold">Rekap Absensi</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <Mini label="Hadir" value={hadir} cls="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" />
              <Mini label="Sakit" value={sakit} cls="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" />
              <Mini label="Izin" value={izin} cls="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" />
              <Mini label="Alpa" value={alpa} cls="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" />
            </div>
            <div className="mt-4 max-h-56 overflow-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider">
                  <tr><th className="p-2 text-left">Tanggal</th><th className="p-2 text-left">Status</th></tr>
                </thead>
                <tbody>
                  {absen.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="p-2">{new Date(a.tanggal).toLocaleDateString("id-ID")}</td>
                      <td className="p-2 capitalize">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pencapaian */}
          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
              <Trophy className="h-5 w-5 text-amber-500" /> Pencapaian Anak
            </h3>
            {pencapaian.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada pencapaian.</p>
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

          {/* Aktivitas BK terbaru (publik) */}
          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
              <BookOpen className="h-5 w-5 text-primary" /> Aktivitas BK Sekolah
            </h3>
            <div className="space-y-2">
              <p className="text-xs uppercase text-muted-foreground">Laporan terbaru</p>
              {reports.length === 0 ? <p className="text-sm">—</p> : reports.map((r) => (
                <div key={r.id} className="rounded-lg border p-2 text-sm">
                  <div className="flex justify-between"><span className="font-medium">{r.jenis}</span><Badge variant="outline">{r.status}</Badge></div>
                  <p className="text-xs text-muted-foreground">{r.kelas} · {new Date(r.created_at).toLocaleDateString("id-ID")}</p>
                </div>
              ))}
              <p className="mt-3 text-xs uppercase text-muted-foreground">Konsultasi terbaru</p>
              {konsul.length === 0 ? <p className="text-sm">—</p> : konsul.map((k) => (
                <div key={k.id} className="rounded-lg border p-2 text-sm">
                  <div className="flex justify-between"><span className="font-medium">{k.nama}</span><Badge variant="outline">{k.status}</Badge></div>
                  <p className="text-xs text-muted-foreground">{k.kelas} · {new Date(k.jadwal).toLocaleString("id-ID")}</p>
                </div>
              ))}
            </div>
            <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
              <Link to="/kontak"><Calendar className="mr-1 h-4 w-4" />Hubungi BK Sekolah</Link>
            </Button>
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
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
function Mini({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className={`rounded-lg p-3 ${cls}`}>
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}
