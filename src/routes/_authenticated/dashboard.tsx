import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Download, FileWarning, MessageCircleHeart, Smile, Loader2,
  LogOut, Search, TrendingUp, Calendar, Bell, BellDot,
  Heart, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  ShieldAlert, Package,
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
import * as XLSX from "xlsx";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard Guru BK — SafeSchool" }] }),
  component: Dashboard,
});

type Report = {
  id: string; nama: string; kelas: string; kategori: string; jenis: string;
  cerita: string; lokasi: string; bukti_url: string | null;
  status: string; catatan_guru: string | null; created_at: string;
};
type Consult = {
  id: string; nama: string; kelas: string; masalah: string;
  jadwal: string; status: string; catatan_guru: string | null; created_at: string;
};
type Mood = { mood: string; created_at: string };
type KindnessPost = {
  id: string; name: string | null; message: string; status: string; created_at: string;
};
type Notification = {
  id: string; type: string; title: string; body: string | null;
  ref_id: string | null; is_read: boolean; created_at: string;
};

// ─── Export Excel yang rapi ───────────────────────────────────────────────────
function exportReportsExcel(reports: Report[]) {
  if (!reports.length) return toast.error("Tidak ada data untuk diunduh");

  const rows = reports.map((r, idx) => ({
    "No": idx + 1,
    "Tanggal": new Date(r.created_at).toLocaleString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }),
    "Nama Pelapor": r.nama,
    "Kelas": r.kelas,
    "Kategori": r.kategori,
    "Jenis": r.jenis,
    "Cerita Lengkap": r.cerita,
    "Lokasi": r.lokasi,
    "Ada Bukti Foto": r.bukti_url ? "Ya" : "Tidak",
    "Status": r.status.charAt(0).toUpperCase() + r.status.slice(1),
    "Catatan Guru": r.catatan_guru || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Lebar kolom
  ws["!cols"] = [
    { wch: 5 },   // No
    { wch: 22 },  // Tanggal
    { wch: 22 },  // Nama
    { wch: 12 },  // Kelas
    { wch: 12 },  // Kategori
    { wch: 18 },  // Jenis
    { wch: 60 },  // Cerita
    { wch: 20 },  // Lokasi
    { wch: 14 },  // Bukti
    { wch: 12 },  // Status
    { wch: 30 },  // Catatan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan BK");
  XLSX.writeFile(wb, `Laporan_BK_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.xlsx`);
  toast.success("File Excel berhasil diunduh");
}

function exportConsultsExcel(consults: Consult[]) {
  if (!consults.length) return toast.error("Tidak ada data untuk diunduh");

  const rows = consults.map((c, idx) => ({
    "No": idx + 1,
    "Tanggal Diajukan": new Date(c.created_at).toLocaleString("id-ID", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    }),
    "Nama": c.nama,
    "Kelas": c.kelas,
    "Masalah": c.masalah,
    "Jadwal": new Date(c.jadwal).toLocaleString("id-ID", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    }),
    "Status": c.status.charAt(0).toUpperCase() + c.status.slice(1),
    "Catatan Guru": c.catatan_guru || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 5 }, { wch: 22 }, { wch: 22 }, { wch: 12 },
    { wch: 50 }, { wch: 22 }, { wch: 14 }, { wch: 30 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Konsultasi BK");
  XLSX.writeFile(wb, `Konsultasi_BK_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.xlsx`);
  toast.success("File Excel berhasil diunduh");
}

// ─── Komponen baris laporan (expandable) ─────────────────────────────────────
function ReportRow({ r, onUpdate }: { r: Report; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [catatan, setCatatan] = useState(r.catatan_guru || "");
  const [savingNote, setSavingNote] = useState(false);

  const updateStatus = async (status: string) => {
    const { error } = await supabase.from("reports").update({ status, updated_at: new Date().toISOString() }).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Status diperbarui");
    onUpdate();
  };

  const saveNote = async () => {
    setSavingNote(true);
    const { error } = await supabase.from("reports").update({ catatan_guru: catatan, updated_at: new Date().toISOString() }).eq("id", r.id);
    setSavingNote(false);
    if (error) return toast.error(error.message);
    toast.success("Catatan disimpan");
    onUpdate();
  };

  const getBuktiUrl = async () => {
    if (!r.bukti_url) return;
    const { data } = await supabase.storage.from("report-evidence").createSignedUrl(r.bukti_url, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const kategoriColor = r.kategori === "Bullying"
    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
    : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
          {new Date(r.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </TableCell>
        <TableCell className="font-medium">{r.nama}</TableCell>
        <TableCell>{r.kelas}</TableCell>
        <TableCell>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${kategoriColor}`}>
            {r.kategori}
          </span>
        </TableCell>
        <TableCell>
          <Badge variant="secondary">{r.jenis}</Badge>
        </TableCell>
        <TableCell className="max-w-[200px]">
          <p className="truncate text-sm">{r.cerita}</p>
        </TableCell>
        <TableCell>{r.lokasi}</TableCell>
        <TableCell>
          <Badge variant={r.status === "selesai" ? "default" : r.status === "diproses" ? "secondary" : "destructive"}>
            {r.status}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {r.status === "baru" && (
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateStatus("diproses")}>
                Proses
              </Button>
            )}
            {r.status === "diproses" && (
              <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600" onClick={() => updateStatus("selesai")}>
                Selesai
              </Button>
            )}
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </TableCell>
      </TableRow>

      {/* Detail row yang expand */}
      {expanded && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={9} className="py-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Cerita lengkap */}
              <div>
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cerita Lengkap</h4>
                <div className="rounded-lg bg-background p-3 text-sm leading-relaxed border">
                  {r.cerita}
                </div>
              </div>

              {/* Catatan guru */}
              <div>
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Catatan Tindak Lanjut</h4>
                <textarea
                  className="w-full rounded-lg border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Tuliskan catatan tindak lanjut..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                />
                <div className="mt-2 flex items-center gap-2">
                  <Button size="sm" className="h-7 text-xs" onClick={saveNote} disabled={savingNote}>
                    {savingNote ? "Menyimpan..." : "Simpan Catatan"}
                  </Button>
                  {r.bukti_url && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={getBuktiUrl}>
                      🖼️ Lihat Bukti Foto
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ─── Dashboard utama ──────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();
  const teacher = getTeacher();
  const [reports, setReports] = useState<Report[]>([]);
  const [consults, setConsults] = useState<Consult[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [kindness, setKindness] = useState<KindnessPost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showNotif, setShowNotif] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [r, c, m, k, n] = await Promise.all([
      supabase.from("reports").select("*").order("created_at", { ascending: false }),
      supabase.from("consultations").select("*").order("created_at", { ascending: false }),
      supabase.from("mood_entries").select("mood, created_at").order("created_at", { ascending: false }).limit(500),
      supabase.from("kindness_wall").select("id, name, message, status, created_at").order("created_at", { ascending: false }),
      supabase.from("guru_notifications").select("*").order("created_at", { ascending: false }).limit(30),
    ]);
    if (r.data) setReports(r.data);
    if (c.data) setConsults(c.data);
    if (m.data) setMoods(m.data);
    if (k.data) setKindness(k.data);
    if (n.data) setNotifications(n.data);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const pendingKindness = kindness.filter(k => k.status === "pending");

  const markAllRead = async () => {
    await supabase.from("guru_notifications").update({ is_read: true }).eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const moderateKindness = async (id: string, action: "approved" | "rejected") => {
    const { error } = await supabase
      .from("kindness_wall")
      .update({ status: action, approved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(action === "approved" ? "Pesan disetujui ✅" : "Pesan ditolak ❌");
    loadAll();
  };

  const moodCount = moods.reduce<Record<string, number>>((acc, x) => {
    acc[x.mood] = (acc[x.mood] || 0) + 1;
    return acc;
  }, {});

  const seminggu = reports.filter((r) => Date.now() - new Date(r.created_at).getTime() < 7 * 24 * 3600 * 1000).length;

  const filteredReports = useMemo(
    () => reports.filter((r) => `${r.nama} ${r.kelas} ${r.jenis} ${r.kategori} ${r.lokasi} ${r.cerita}`.toLowerCase().includes(q.toLowerCase())),
    [reports, q],
  );
  const filteredConsults = useMemo(
    () => consults.filter((c) => `${c.nama} ${c.kelas} ${c.masalah}`.toLowerCase().includes(q.toLowerCase())),
    [consults, q],
  );

  const doLogout = () => {
    logoutTeacher();
    toast.success("Berhasil keluar");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-slate-950 dark:via-background dark:to-purple-950/40">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-8">

        {/* Header guru */}
        <div className="rounded-2xl gradient-brand p-6 text-white shadow-glow">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold md:text-3xl">{teacher?.nama}</h1>
                <p className="text-sm opacity-90">{teacher?.mapel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Notifikasi */}
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setShowNotif(!showNotif); if (!showNotif && unreadCount > 0) markAllRead(); }}
                >
                  {unreadCount > 0 ? <BellDot className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                  {unreadCount > 0 && (
                    <span className="ml-1 rounded-full bg-rose-500 px-1.5 text-xs text-white">{unreadCount}</span>
                  )}
                </Button>
                {showNotif && (
                  <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border bg-background shadow-xl">
                    <div className="border-b px-4 py-2.5 font-semibold text-sm">Notifikasi</div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-sm text-muted-foreground">Tidak ada notifikasi</p>
                      ) : notifications.map(n => (
                        <div key={n.id} className={`border-b px-4 py-3 text-sm last:border-0 ${!n.is_read ? "bg-brand-soft" : ""}`}>
                          <div className="font-medium">{n.title}</div>
                          {n.body && <div className="mt-0.5 text-xs text-muted-foreground">{n.body}</div>}
                          <div className="mt-1 text-xs text-muted-foreground">
                            {new Date(n.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={doLogout} variant="secondary" size="sm">
                <LogOut className="mr-2 h-4 w-4" />Keluar
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Statistik */}
            <div className="mt-8 grid gap-4 md:grid-cols-4 lg:grid-cols-5">
              <StatCard color="from-rose-500 to-pink-600" icon={ShieldAlert} label="Laporan Bullying"
                value={reports.filter(r => r.kategori === "Bullying").length}
                sub={`${reports.filter(r => r.kategori === "Bullying" && r.status === "baru").length} baru`} />
              <StatCard color="from-amber-500 to-orange-600" icon={Package} label="Laporan Pencurian"
                value={reports.filter(r => r.kategori === "Pencurian").length}
                sub={`${reports.filter(r => r.kategori === "Pencurian" && r.status === "baru").length} baru`} />
              <StatCard color="from-blue-500 to-indigo-600" icon={MessageCircleHeart} label="Konsultasi"
                value={consults.length} sub={`${consults.filter(c => c.status === "menunggu").length} menunggu`} />
              <StatCard color="from-emerald-500 to-teal-600" icon={Smile} label="Mood Hari Ini"
                value={moods.filter(m => new Date(m.created_at).toDateString() === new Date().toDateString()).length}
                sub={`${moodCount.marah || 0} marah · ${moodCount.sedih || 0} sedih`} />
              <StatCard color="from-violet-500 to-purple-600" icon={TrendingUp} label="Laporan 7 Hari"
                value={seminggu} sub="terakhir" />
            </div>

            {/* Peringatan mood negatif tinggi */}
            {((moodCount.marah || 0) + (moodCount.sedih || 0)) >= 5 && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-semibold text-rose-700 dark:text-rose-300">Perhatian: Banyak siswa dengan mood negatif hari ini</p>
                  <p className="text-sm text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                    {moodCount.marah || 0} siswa marah, {moodCount.sedih || 0} siswa sedih. Pertimbangkan sesi kelompok atau pengumuman.
                  </p>
                </div>
              </div>
            )}

            {/* Peringatan dinding kebaikan pending */}
            {pendingKindness.length > 0 && (
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
                <Heart className="mt-0.5 h-5 w-5 text-violet-600" />
                <p className="text-sm text-violet-700 dark:text-violet-300">
                  <span className="font-semibold">{pendingKindness.length} pesan</span> di Dinding Kebaikan menunggu persetujuanmu.
                  Cek tab "Dinding Kebaikan" untuk moderasi.
                </p>
              </div>
            )}

            {/* Search */}
            <div className="mt-8 relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari laporan / konsultasi..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs defaultValue="reports" className="mt-6">
              <TabsList className="flex-wrap h-auto gap-1">
                <TabsTrigger value="reports">
                  Laporan BK ({filteredReports.length})
                  {reports.filter(r => r.status === "baru").length > 0 && (
                    <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 text-[10px] text-white">
                      {reports.filter(r => r.status === "baru").length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="consults">
                  Konsultasi ({filteredConsults.length})
                  {consults.filter(c => c.status === "menunggu").length > 0 && (
                    <span className="ml-1.5 rounded-full bg-blue-500 px-1.5 text-[10px] text-white">
                      {consults.filter(c => c.status === "menunggu").length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="mood">Mood Siswa</TabsTrigger>
                <TabsTrigger value="kindness">
                  Dinding Kebaikan
                  {pendingKindness.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-violet-500 px-1.5 text-[10px] text-white">
                      {pendingKindness.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* LAPORAN BK */}
              <TabsContent value="reports">
                <Card className="p-4 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h2 className="font-semibold">Laporan masuk — klik baris untuk detail lengkap</h2>
                    <Button size="sm" variant="outline" onClick={() => exportReportsExcel(filteredReports)}>
                      <Download className="mr-2 h-4 w-4" />Unduh Excel
                    </Button>
                  </div>
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                          <TableHead>Nama</TableHead>
                          <TableHead>Kelas</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Jenis</TableHead>
                          <TableHead className="min-w-[160px]">Cerita (klik untuk lengkap)</TableHead>
                          <TableHead>Lokasi</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                              Belum ada laporan
                            </TableCell>
                          </TableRow>
                        )}
                        {filteredReports.map((r) => (
                          <ReportRow key={r.id} r={r} onUpdate={loadAll} />
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
                    <Button size="sm" variant="outline" onClick={() => exportConsultsExcel(filteredConsults)}>
                      <Download className="mr-2 h-4 w-4" />Unduh Excel
                    </Button>
                  </div>
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Diajukan</TableHead>
                          <TableHead>Nama</TableHead>
                          <TableHead>Kelas</TableHead>
                          <TableHead className="min-w-[200px]">Masalah</TableHead>
                          <TableHead>Jadwal</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredConsults.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              Belum ada permintaan
                            </TableCell>
                          </TableRow>
                        )}
                        {filteredConsults.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                              {new Date(c.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </TableCell>
                            <TableCell className="font-medium">{c.nama}</TableCell>
                            <TableCell>{c.kelas}</TableCell>
                            {/* Masalah ditampilkan penuh (wrap) */}
                            <TableCell className="max-w-[240px]">
                              <p className="text-sm leading-snug whitespace-normal">{c.masalah}</p>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              {new Date(c.jadwal).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </TableCell>
                            <TableCell>
                              <Badge variant={c.status === "selesai" ? "default" : c.status === "dijadwalkan" ? "secondary" : "destructive"}>
                                {c.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {c.status === "menunggu" && (
                                <Button size="sm" variant="ghost" className="h-7 text-xs"
                                  onClick={async () => {
                                    await supabase.from("consultations").update({ status: "dijadwalkan" }).eq("id", c.id);
                                    toast.success("Dijadwalkan"); loadAll();
                                  }}>
                                  Jadwalkan
                                </Button>
                              )}
                              {c.status === "dijadwalkan" && (
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600"
                                  onClick={async () => {
                                    await supabase.from("consultations").update({ status: "selesai" }).eq("id", c.id);
                                    toast.success("Selesai"); loadAll();
                                  }}>
                                  Selesai
                                </Button>
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
                  <p className="mt-4 text-xs text-muted-foreground">
                    Total responden hari ini: {moods.filter(m => new Date(m.created_at).toDateString() === new Date().toDateString()).length} siswa •
                    Semua data: {moods.length} entri
                  </p>
                </Card>
              </TabsContent>

              {/* DINDING KEBAIKAN — MODERASI */}
              <TabsContent value="kindness">
                <div className="space-y-4">
                  {/* Pending */}
                  <Card className="p-4 shadow-soft">
                    <h2 className="mb-3 font-semibold">
                      Menunggu Persetujuan
                      {pendingKindness.length > 0 && (
                        <span className="ml-2 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                          {pendingKindness.length}
                        </span>
                      )}
                    </h2>
                    {pendingKindness.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">Tidak ada pesan yang menunggu persetujuan ✅</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingKindness.map((p) => (
                          <div key={p.id} className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
                            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm leading-relaxed">{p.message}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Dari: <span className="font-medium">{p.name || "Anonim"}</span> •{" "}
                                {new Date(p.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                              <Button size="sm" variant="outline"
                                className="h-8 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => moderateKindness(p.id, "approved")}>
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Setuju
                              </Button>
                              <Button size="sm" variant="outline"
                                className="h-8 border-rose-300 text-rose-700 hover:bg-rose-50"
                                onClick={() => moderateKindness(p.id, "rejected")}>
                                <XCircle className="mr-1 h-3.5 w-3.5" /> Tolak
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Approved */}
                  <Card className="p-4 shadow-soft">
                    <h2 className="mb-3 font-semibold text-emerald-700">
                      Sudah Ditampilkan ({kindness.filter(k => k.status === "approved").length})
                    </h2>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {kindness.filter(k => k.status === "approved").map((p) => (
                        <div key={p.id} className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/20">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <p className="text-xs text-emerald-800 dark:text-emerald-200">{p.message}</p>
                        </div>
                      ))}
                      {kindness.filter(k => k.status === "approved").length === 0 && (
                        <p className="text-sm text-muted-foreground py-2 text-center">Belum ada pesan yang disetujui</p>
                      )}
                    </div>
                  </Card>
                </div>
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
    <Card className="overflow-hidden p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
      <div className="flex items-center gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-glow shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm text-muted-foreground">{label}</div>
          <div className="font-display text-2xl font-bold">{value}</div>
        </div>
      </div>
      <p className="mt-2 truncate text-xs text-muted-foreground">{sub}</p>
    </Card>
  );
}
