import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircleHeart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/konsultasi")({
  head: () => ({
    meta: [
      { title: "Konsultasi BK — SafeSchool" },
      { name: "description", content: "Atur jadwal konsultasi 1-on-1 dengan Guru BK secara online dan rahasia." },
    ],
  }),
  component: KonsulPage,
});

function KonsulPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nama: "", kelas: "", masalah: "", jadwal: "" });
  const [done, setDone] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.kelas || !form.masalah || !form.jadwal) {
      toast.warning("Form belum lengkap", {
        description: "Mohon isi nama, kelas, topik masalah, dan jadwal yang diinginkan.",
      });
      return;
    }
    if (new Date(form.jadwal).getTime() < Date.now()) {
      toast.warning("Jadwal tidak valid", {
        description: "Pilih tanggal & waktu di masa depan agar bisa dijadwalkan.",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("consultations").insert({
      nama: form.nama, kelas: form.kelas, masalah: form.masalah,
      jadwal: new Date(form.jadwal).toISOString(),
    });
    setLoading(false);
    if (error) {
      return toast.error("Permintaan gagal dikirim", {
        description: error.message || "Periksa koneksi internetmu lalu coba lagi.",
      });
    }
    toast.success("Permintaan konsultasi terkirim 💬", {
      description: "Guru BK akan mengonfirmasi jadwalmu dalam 1×24 jam.",
    });
    setDone(true);
    setForm({ nama: "", kelas: "", masalah: "", jadwal: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white shadow-glow">
              <MessageCircleHeart className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold">Konsultasi BK</h1>
            <p className="mt-2 text-muted-foreground">Atur jadwal konsultasi dengan Guru BK.</p>
          </div>

          <Card className="mt-8 p-6 md:p-8">
            <form onSubmit={handle} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="nama">Nama Lengkap *</Label>
                  <Input id="nama" required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="kelas">Kelas *</Label>
                  <Input id="kelas" required value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })} placeholder="XI IPA 2" />
                </div>
              </div>
              <div>
                <Label htmlFor="masalah">Masalah / Topik *</Label>
                <Textarea id="masalah" required rows={5} value={form.masalah} onChange={(e) => setForm({ ...form, masalah: e.target.value })} placeholder="Ceritakan singkat..." />
              </div>
              <div>
                <Label htmlFor="jadwal">Jadwal yang diinginkan *</Label>
                <Input id="jadwal" required type="datetime-local" value={form.jadwal} onChange={(e) => setForm({ ...form, jadwal: e.target.value })} />
              </div>
              <Button type="submit" disabled={loading} size="lg" className="w-full gradient-brand text-white">
                <Send className="mr-2 h-4 w-4" />{loading ? "Mengirim..." : "Kirim Permintaan"}
              </Button>
              {done && (
                <div className="rounded-lg bg-green-50 p-4 text-center text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                  ✅ Permintaan diterima. Guru BK akan mengonfirmasi jadwalmu.
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
