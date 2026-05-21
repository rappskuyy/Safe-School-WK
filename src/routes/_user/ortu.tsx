import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Heart, FileWarning, MessageCircleHeart, Phone, ShieldCheck, BookOpen, Calendar } from "lucide-react";

export const Route = createFileRoute("/_user/ortu")({
  head: () => ({ meta: [{ title: "Dashboard Orang Tua — SafeSchool" }] }),
  component: OrtuDashboard,
});

function OrtuDashboard() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [konsul, setKonsul] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // RLS di Supabase otomatis memfilter laporan berdasarkan child_name & child_kelas
    // yang sudah dikonfigurasi di policy "Ortu can view reports of their child"
    (async () => {
      const [r, k] = await Promise.all([
        supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(8),
        supabase.from("consultations").select("*").order("created_at", { ascending: false }).limit(8),
      ]);
      setReports(r.data || []);
      setKonsul(k.data || []);
      setLoading(false);
    })();
  }, [profile]);

  const aktifReport = reports.filter((r) => r.status !== "selesai").length;
  const aktifKonsul = konsul.filter((k) => k.status !== "selesai").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/40 via-background to-indigo-50/40 dark:from-slate-950 dark:to-purple-950/30">
      <SiteHeader />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Hero card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white shadow-glow sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="text-sm opacity-80">Selamat datang, Bapak/Ibu 👋</p>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">{profile?.full_name}</h1>
            <p className="mt-1 text-sm opacity-90">Pendampingan BK untuk anak Anda di SMK Wikrama Bogor</p>
          </div>
        </Card>

        {/* Profil anak */}
        <Card className="mt-6 p-5">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            <h2 className="font-display text-lg font-bold">Profil Anak</h2>
          </div>
          {profile?.child_name ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Info label="Nama Anak" value={profile.child_name} />
              <Info label="Kelas" value={profile.child_kelas || "—"} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Data anak belum dilengkapi. Silakan hubungi admin sekolah.
            </p>
          )}
        </Card>

        {/* Stat */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={FileWarning} label="Laporan Aktif" value={loading ? "..." : aktifReport} color="from-rose-500 to-pink-600" />
          <StatCard icon={MessageCircleHeart} label="Konsultasi Aktif" value={loading ? "..." : aktifKonsul} color="from-blue-500 to-indigo-600" />
          <StatCard
            icon={ShieldCheck}
            label="Status Pendampingan"
            value={loading ? "..." : aktifReport + aktifKonsul > 0 ? "Aktif" : "Aman"}
            color="from-emerald-500 to-teal-600"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Aktivitas BK */}
          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
              <BookOpen className="h-5 w-5 text-primary" /> Aktivitas BK Terbaru
            </h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Laporan</p>
                  {reports.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
                      Belum ada laporan yang berkaitan dengan anak kamu.
                    </p>
                  ) : reports.map((r) => (
                    <div key={r.id} className="mb-2 rounded-lg border p-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{r.kategori} — {r.jenis}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {r.nama} · {r.kelas} · {new Date(r.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Konsultasi</p>
                  {konsul.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
                      Belum ada konsultasi.
                    </p>
                  ) : konsul.map((k) => (
                    <div key={k.id} className="mb-2 rounded-lg border p-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium line-clamp-1">{k.nama}</span>
                        <StatusBadge status={k.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {k.kelas} · {new Date(k.jadwal).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
              <Link to="/kontak"><Calendar className="mr-1 h-4 w-4" />Hubungi BK Sekolah</Link>
            </Button>
          </Card>

          {/* Tips */}
          <Card className="p-5">
            <h3 className="mb-3 font-display text-lg font-bold">Tips Mendampingi Anak</h3>
            <ul className="space-y-3 text-sm">
              {[
                { t: "Dengarkan dulu, jangan langsung menasihati.", d: "Anak butuh divalidasi sebelum diberi solusi." },
                { t: "Bangun rutin ngobrol singkat tiap hari.", d: "5–10 menit cukup untuk menjaga keterhubungan." },
                { t: "Hindari kalimat yang menyudutkan.", d: "Ganti dengan pertanyaan terbuka: 'gimana perasaan kamu?'" },
                { t: "Hubungi BK saat ada perubahan perilaku drastis.", d: "Lebih cepat ditangani, lebih baik untuk anak." },
              ].map((x, i) => (
                <li key={i} className="rounded-lg border bg-muted/30 p-3">
                  <p className="font-medium">{x.t}</p>
                  <p className="text-xs text-muted-foreground">{x.d}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Hotline */}
        <Card className="mt-6 flex flex-col items-center justify-between gap-3 border-2 border-destructive/30 bg-destructive/5 p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-destructive text-white">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Hotline BK 24 jam</p>
              <p className="text-sm text-muted-foreground">Untuk situasi mendesak terkait anak.</p>
            </div>
          </div>
          <a href="tel:08111100200">
            <Button variant="destructive">0811-1100-200</Button>
          </a>
        </Card>
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
    dijadwalkan: "bg-amber-500",
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
