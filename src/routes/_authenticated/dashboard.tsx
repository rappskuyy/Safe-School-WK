import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, FileWarning, MessageCircleHeart, Smile, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard Guru BK — SafeSchool" }] }),
  component: Dashboard,
});

type Report = { id: string; nama: string; kelas: string; jenis: string; cerita: string; lokasi: string; status: string; created_at: string };
type Consult = { id: string; nama: string; kelas: string; masalah: string; jadwal: string; status: string; created_at: string };
type Mood = { mood: string; created_at: string };

function downloadCSV(filename: string, headers: string[], rows: any[]) {
  if (!rows.length) return toast.error("Tidak ada data");
  let csv = headers.join(",") + "\n";
  rows.forEach((r) => {
    csv += headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",") + "\n";
  });
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [consults, setConsults] = useState<Consult[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [r, c, m] = await Promise.all([
        supabase.from("reports").select("*").order("created_at", { ascending: false }),
        supabase.from("consultations").select("*").order("created_at", { ascending: false }),
        supabase.from("mood_entries").select("mood, created_at").order("created_at", { ascending: false }).limit(500),
      ]);
      if (r.data) setReports(r.data);
      if (c.data) setConsults(c.data);
      if (m.data) setMoods(m.data);
      setLoading(false);
    })();
  }, []);

  const moodCount = moods.reduce<Record<string, number>>((acc, x) => {
    acc[x.mood] = (acc[x.mood] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard Guru BK</h1>
            <p className="text-sm text-muted-foreground">Selamat datang, {user?.email}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <StatCard icon={FileWarning} label="Total Laporan" value={reports.length} sub={`${reports.filter(r => r.status === "baru").length} baru`} />
              <StatCard icon={MessageCircleHeart} label="Konsultasi" value={consults.length} sub={`${consults.filter(c => c.status === "menunggu").length} menunggu`} />
              <StatCard icon={Smile} label="Mood Tracker" value={moods.length} sub={`${moodCount.sedih || 0} sedih · ${moodCount.marah || 0} marah`} />
            </div>

            <Tabs defaultValue="reports" className="mt-8">
              <TabsList>
                <TabsTrigger value="reports">Laporan Bullying</TabsTrigger>
                <TabsTrigger value="consults">Konsultasi BK</TabsTrigger>
                <TabsTrigger value="mood">Mood Siswa</TabsTrigger>
              </TabsList>

              <TabsContent value="reports">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Laporan masuk</h2>
                    <Button size="sm" variant="outline" onClick={() => downloadCSV("laporan_bullying.csv", ["nama", "kelas", "jenis", "cerita", "lokasi", "status", "created_at"], reports)}>
                      <Download className="mr-2 h-4 w-4" />Excel/CSV
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.length === 0 && (
                          <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Belum ada laporan</TableCell></TableRow>
                        )}
                        {reports.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="text-xs">{new Date(r.created_at).toLocaleString("id-ID")}</TableCell>
                            <TableCell>{r.nama}</TableCell>
                            <TableCell>{r.kelas}</TableCell>
                            <TableCell><Badge variant="secondary">{r.jenis}</Badge></TableCell>
                            <TableCell className="max-w-xs truncate">{r.cerita}</TableCell>
                            <TableCell>{r.lokasi}</TableCell>
                            <TableCell><Badge>{r.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="consults">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Permintaan konsultasi</h2>
                    <Button size="sm" variant="outline" onClick={() => downloadCSV("konsultasi.csv", ["nama", "kelas", "masalah", "jadwal", "status", "created_at"], consults)}>
                      <Download className="mr-2 h-4 w-4" />Excel/CSV
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {consults.length === 0 && (
                          <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Belum ada permintaan</TableCell></TableRow>
                        )}
                        {consults.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="text-xs">{new Date(c.created_at).toLocaleString("id-ID")}</TableCell>
                            <TableCell>{c.nama}</TableCell>
                            <TableCell>{c.kelas}</TableCell>
                            <TableCell className="max-w-xs truncate">{c.masalah}</TableCell>
                            <TableCell>{new Date(c.jadwal).toLocaleString("id-ID")}</TableCell>
                            <TableCell><Badge>{c.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="mood">
                <Card className="p-6">
                  <h2 className="font-semibold mb-4">Distribusi mood siswa (anonim)</h2>
                  <div className="grid gap-4 md:grid-cols-4">
                    {[
                      { e: "😊", k: "senang", c: "bg-green-100 dark:bg-green-950" },
                      { e: "😐", k: "biasa", c: "bg-yellow-100 dark:bg-yellow-950" },
                      { e: "😢", k: "sedih", c: "bg-blue-100 dark:bg-blue-950" },
                      { e: "😡", k: "marah", c: "bg-red-100 dark:bg-red-950" },
                    ].map((m) => (
                      <div key={m.k} className={`rounded-2xl p-6 text-center ${m.c}`}>
                        <div className="text-5xl">{m.e}</div>
                        <div className="mt-2 text-3xl font-bold">{moodCount[m.k] || 0}</div>
                        <div className="text-sm text-muted-foreground capitalize">{m.k}</div>
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

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: number; sub: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl gradient-brand text-white">
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
