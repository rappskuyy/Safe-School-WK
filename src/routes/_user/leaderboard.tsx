import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Trophy, Crown, Medal, Award } from "lucide-react";

export const Route = createFileRoute("/_user/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — SafeSchool" }] }),
  component: LeaderboardPage,
});

type Row = { nis: string; nama: string; kelas: string; poin: number; badges: number };

function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: penc }, { data: profs }] = await Promise.all([
        supabase.from("pencapaian").select("nis, poin"),
        supabase.from("profiles").select("nis, full_name, kelas").not("nis", "is", null),
      ]);
      const map = new Map<string, Row>();
      (penc || []).forEach((p) => {
        const cur = map.get(p.nis) || { nis: p.nis, nama: "Siswa", kelas: "—", poin: 0, badges: 0 };
        cur.poin += Number(p.poin || 0);
        cur.badges += 1;
        map.set(p.nis, cur);
      });
      (profs || []).forEach((pr) => {
        if (!pr.nis) return;
        const cur = map.get(pr.nis);
        if (cur) { cur.nama = pr.full_name || "Siswa"; cur.kelas = pr.kelas || "—"; }
      });
      setRows([...map.values()].sort((a, b) => b.poin - a.poin));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-background to-orange-50/40 dark:from-slate-950 dark:to-amber-950/20">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-6 text-center">
          <div className="mx-auto inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-glow">
            <Trophy className="h-7 w-7" />
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold">Leaderboard SafeSchool</h1>
          <p className="text-muted-foreground">Siswa SMK Wikrama paling positif & berprestasi</p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Memuat...</p>
        ) : rows.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">Belum ada data pencapaian.</Card>
        ) : (
          <div className="space-y-3">
            {rows.slice(0, 3).map((r, i) => (
              <Card key={r.nis} className={`flex items-center gap-4 p-5 ${i === 0 ? "border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40" : ""}`}>
                <div className="grid h-12 w-12 place-items-center rounded-xl text-white shadow-soft" style={{ background: i === 0 ? "linear-gradient(135deg,#f59e0b,#ea580c)" : i === 1 ? "linear-gradient(135deg,#94a3b8,#475569)" : "linear-gradient(135deg,#a16207,#78350f)" }}>
                  {i === 0 ? <Crown className="h-6 w-6" /> : i === 1 ? <Medal className="h-6 w-6" /> : <Award className="h-6 w-6" />}
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg font-bold">{r.nama}</p>
                  <p className="text-xs text-muted-foreground">{r.kelas} · NIS {r.nis}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold text-primary">{r.poin}</p>
                  <p className="text-xs text-muted-foreground">{r.badges} badge</p>
                </div>
              </Card>
            ))}
            {rows.slice(3).map((r, i) => (
              <Card key={r.nis} className="flex items-center gap-4 p-4">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted font-bold">{i + 4}</div>
                <div className="flex-1">
                  <p className="font-medium">{r.nama}</p>
                  <p className="text-xs text-muted-foreground">{r.kelas} · NIS {r.nis}</p>
                </div>
                <Badge variant="secondary">{r.poin} poin</Badge>
              </Card>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
