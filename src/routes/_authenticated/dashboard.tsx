import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Download, FileWarning, MessageCircleHeart, Smile, Loader2,
  LogOut, Search, TrendingUp, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { getTeacher, logoutTeacher } from "@/lib/teacher-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard Guru BK — SafeSchool" }] }),
  component: Dashboard,
});

type Report = { id: string; nama: string; kelas: string; jenis: string; cerita: string; lokasi: string; status: string; created_at: string };
type Consult = { id: string; nama: string; kelas: string; masalah: string; jadwal: string; status: string; created_at: string };
type Mood = { mood: string; created_at: string };

function downloadCSV(filename: string, headers: string[], rows: any[]) {
  if (!rows.length) return toast.error("Tidak ada data untuk diunduh");
  let csv = headers.join(",") + "\n";
  rows.forEach((r) => {
    csv += headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",") + "\n";
  });
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  toast.success(`File ${filename} diunduh`);
}

function Dashboard() {
  const navigate = useNavigate();
  const teacher = getTeacher();
  const [reports, setReports] = useState<Report[]>([]);
  const [consults, setConsults] = useState<Consult[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const loadAll = async () => {
    setLoading(true);
    const [r, c, m] = await Promise.all([
      supabase.from("reports").select("*").order("created_at", { ascending: false }),
      supabase.from("consultations").select("*").order("created_at", { ascending: false }),
      supabase.from("mood_entries").select("mood, created_at").order("created_at", { ascending: false }).limit(500),
    ]);
    if (r.data) setReports(r.data);
    if (c.data) setConsults(c.data);
    if (m.data) setMoods(m.data);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const moodCount = moods.reduce<Record<string, number>>((acc, x) => {
    acc[x.mood] = (acc[x.mono] || 0) + 1; // typo guard fallback
    acc[x.mood] = (acc[x.mood] || 0) + 1;
    return acc;
  }, {});

  const filteredReports = useMemo(
    () => reports.filter((r) => `${r.nama} ${r.kelas} ${r.jenis} ${r.lokasi} ${r.cerita}`.toLowerCase().includes(q.toLowerCase())),
    [reports, q],
  );
  const filteredConsults = useMemo(
    () => consults.filter((c) => `${c.nama} ${c.kelas} ${c.masalah}`.toLowerCase().includes(q.toLowerCase())),
    [consults, q],
  );

  // Hitung laporan minggu ini
  const seminggu = reports.filter((r) => {
    const d = new Date(r.created_at);
    return Date.now() - d.getTime() < 7 * 24 * 3600 * 1000;
  }).length;

  const updateStatus = async (table: "reports" | "consultations", id: string, status: string) => {
    const { error } = await supabase.from(table).update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status diperbarui");
    loadAll();
  };

  const doLogout = () => {
    logoutTeacher();
    toast.success("Berhasil keluar");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-slate-950 dark:via-background dark:to-purple-950/40">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-10">
        {/* Header guru */}
        <div className="overflow-hidden rounded-3xl gradient-hero p-6 text-white shadow-glow md:p-8 animate-fade-up">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur">
                {teacher?.nama?.[0] ?? "G"}
              </div>
              <div>
                <p className="text-sm opacity-90">Selamat datang kembali,</p>
                <h1 className="font-display text-2xl font-bold md:text-3xl">{teacher?.nama}</h1>
                <p className="text-sm opacity-90">{teacher?.mapel}</p>
              </div>
            </div>
            <Button onClick={doLogout} variant="secondary" size="sm">
              <LogOut className="mr-2 h-4 w-4" />Keluar
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Statistik */}
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <StatCard color="from-rose-500 to-pink-600" icon={FileWarning} label="Total Laporan" value={reports.length} sub={`${reports.filter(r => r.status === "baru").length} baru`} />
              <StatCard color="from-blue-500 to-indigo-600" icon={MessageCircleHeart} label="Konsultasi" value={consults.length} sub={`${consults.filter(c => c.status === "menunggu").length} menunggu`} />
              <StatCard color="from-emerald-500 to-teal-600" icon={Smile} label="Mood Tracker" value={moods.length} sub={`${moodCount.sedih || 0} sedih · ${moodCount.marah || 0} marah`} />
              <StatCard color="from-violet-500 to-purple-600" icon={TrendingUp} label="Laporan 7 Hari" value={seminggu} sub="terakhir" />
            </div>

            {/* Search */}
            <div className="mt-8 relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari laporan / konsultasi (nama, kelas, kata kunci)..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs defaultValue="reports" className="mt-6">
              <TabsList>
                <TabsTrigger value="reports">Laporan Bullying ({filteredReports.length})</TabsTrigger>
                <TabsTrigger value="consults">Konsultasi BK ({filteredConsults.length})</TabsTrigger>
                <TabsTrigger value="mood">Mood Siswa</TabsTrigger>
              </TabsList>

              {/* LAPORAN */}
              <TabsContent value="reports">
                <Card className="p-4 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h2 className="font-semibold">Laporan masuk</h2>
                    <Button size="sm" variant="outline" onClick={() => downloadCSV("laporan_bullying.csv", ["nama", "kelas", "jenis", "cerita", "lokasi", "status", "created_at"], filteredReports)}>
                      <Download className="mr-2 h-4 w-4" />Unduh Excel/CSV
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Nama</TableHead>
                          <TableHead>Kelas</TableHead>
                          <TableHead>Jenis</TableHead>
                          <TableHead>Cerita</TableHead>
                          <TableHead>Lokasi</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.length === 0 && (
                          <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Belum ada laporan</TableCell></TableRow>
                        )}
                        {filteredReports.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleString("id-ID")}</TableCell>
                            <TableCell className="font-medium">{r.nama}</TableCell>
                            <TableCell>{r.kelas}</TableCell>
                            <TableCell><Badge variant="secondary">{r.jenis}</Badge></TableCell>
                            <TableCell className="max-w-xs truncate" title={r.cerita}>{r.cerita}</TableCell>
                            <TableCell>{r.lokasi}</TableCell>
                            <TableCell>
                              <Badge variant={r.status === "selesai" ? "default" : r.status === "diproses" ? "secondary" : "destructive"}>
                                {r.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {r.status === "baru" && (
                                <Button size="sm" variant="ghost" onClick={() => updateStatus("reports", r.id, "diproses")}>Proses</Button>
                              )}
                              {r.status === "diproses" && (
                                <Button size="sm" variant="ghost" onClick={() => updateStatus("reports", r.id, "selesai")}>Selesai</Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>

              {/* KONSULTASI */}
              <TabsContent value="consults">
                <Card className="p-4 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h2 className="font-semibold">Permintaan konsultasi</h2>
                    <Button size="sm" variant="outline" onClick={() => downloadCSV("konsultasi.csv", ["nama", "kelas", "masalah", "jadwal", "status", "created_at"], filteredConsults)}>
                      <Download className="mr-2 h-4 w-4" />Unduh Excel/CSV
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Diajukan</TableHead>
                          <TableHead>Nama</TableHead>
                          <TableHead>Kelas</TableHead>
                          <TableHead>Masalah</TableHead>
                          <TableHead>Jadwal</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredConsults.length === 0 && (
                          <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Belum ada permintaan</TableCell></TableRow>
                        )}
                        {filteredConsults.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="text-xs whitespace-nowrap">{new Date(c.created_at).toLocaleString("id-ID")}</TableCell>
                            <TableCell className="font-medium">{c.nama}</TableCell>
                            <TableCell>{c.kelas}</TableCell>
                            <TableCell className="max-w-xs truncate" title={c.masalah}>{c.masalah}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              {new Date(c.jadwal).toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell>
                              <Badge variant={c.status === "selesai" ? "default" : c.status === "dijadwalkan" ? "secondary" : "destructive"}>
                                {c.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {c.status === "menunggu" && (
                                <Button size="sm" variant="ghost" onClick={() => updateStatus("consultations", c.id, "dijadwalkan")}>Jadwalkan</Button>
                              )}
                              {c.status === "dijadwalkan" && (
                                <Button size="sm" variant="ghost" onClick={() => updateStatus("consultations", c.id, "selesai")}>Selesai</Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>

              {/* MOOD */}
              <TabsContent value="mood">
                <Card className="p-6 shadow-soft">
                  <h2 className="font-semibold mb-4">Distribusi mood siswa (anonim)</h2>
                  <div className="grid gap-4 md:grid-cols-4">
                    {[
                      { e: "😊", k: "senang", c: "from-emerald-400 to-teal-500" },
                      { e: "😐", k: "biasa",  c: "from-amber-400 to-orange-500" },
                      { e: "😢", k: "sedih",  c: "from-sky-400 to-blue-600" },
                      { e: "😡", k: "marah",  c: "from-rose-400 to-red-600" },
                    ].map((m) => (
                      <div key={m.k} className={`rounded-2xl bg-gradient-to-br ${m.c} p-6 text-center text-white shadow-soft transition hover:-translate-y-1`}>
                        <div className="text-5xl drop-shadow">{m.e}</div>
                        <div className="mt-2 text-3xl font-bold">{moodCount[m.k] || 0}</div>
                        <div className="text-sm opacity-90 capitalize">{m.k}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: number; sub: string; color: string }) {
  return (
    <Card className="overflow-hidden p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
      <div className="flex items-center gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-glow`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="font-display text-2xl font-bold">{value}</div>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
    </Card>
  );
}
