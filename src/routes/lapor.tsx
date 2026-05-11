import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileWarning, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/lapor")({
  head: () => ({
    meta: [
      { title: "Lapor Bullying — SafeSchool" },
      { name: "description", content: "Sampaikan laporan bullying secara anonim dan aman. Tim BK akan menindaklanjuti laporanmu." },
    ],
  }),
  component: LaporPage,
});

function LaporPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama: "", kelas: "", jenis: "", cerita: "", lokasi: "",
  });
  const [done, setDone] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.kelas || !form.jenis || !form.cerita || !form.lokasi) {
      toast.error("Mohon lengkapi semua data wajib");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("reports").insert({
      nama: form.nama || "Anonim",
      kelas: form.kelas,
      jenis: form.jenis,
      cerita: form.cerita,
      lokasi: form.lokasi,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Laporan berhasil dikirim ✅");
    setDone(true);
    setForm({ nama: "", kelas: "", jenis: "", cerita: "", lokasi: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white shadow-glow">
              <FileWarning className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold">Lapor Bullying</h1>
            <p className="mt-2 text-muted-foreground">
              Identitasmu dijaga rahasia. Boleh diisi sebagai anonim.
            </p>
          </div>

          <Card className="mt-8 p-6 md:p-8">
            <div className="mb-4 flex items-start gap-3 rounded-lg bg-brand-soft p-4 text-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p>Hanya Guru BK yang sudah disetujui yang dapat melihat laporan ini.</p>
            </div>

            <form onSubmit={handle} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="nama">Nama (boleh anonim)</Label>
                  <Input id="nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Anonim" />
                </div>
                <div>
                  <Label htmlFor="kelas">Kelas *</Label>
                  <Input id="kelas" required value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })} placeholder="XI IPA 2" />
                </div>
              </div>

              <div>
                <Label>Jenis Bullying *</Label>
                <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verbal">Verbal (ejekan, hinaan)</SelectItem>
                    <SelectItem value="Fisik">Fisik (pukul, dorong)</SelectItem>
                    <SelectItem value="Sosial">Sosial (dikucilkan)</SelectItem>
                    <SelectItem value="Cyber">Cyber (online)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cerita">Cerita Kejadian *</Label>
                <Textarea id="cerita" required rows={5} value={form.cerita} onChange={(e) => setForm({ ...form, cerita: e.target.value })} placeholder="Ceritakan apa yang terjadi..." />
              </div>

              <div>
                <Label htmlFor="lokasi">Lokasi Kejadian *</Label>
                <Input id="lokasi" required value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} placeholder="Kantin, kelas, lapangan..." />
              </div>

              <Button type="submit" disabled={loading} size="lg" className="w-full gradient-brand text-white">
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Mengirim..." : "Kirim Laporan"}
              </Button>

              {done && (
                <div className="rounded-lg bg-green-50 p-4 text-center text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                  ✅ Laporan kamu sudah diterima. Tim BK akan menindaklanjuti secepatnya.
                </div>
              )}
            </form>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
