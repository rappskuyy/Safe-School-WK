import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { FileWarning, Send, ShieldCheck, Upload, X, AlertTriangle } from "lucide-react";
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
      { title: "Lapor BK — SafeSchool" },
      { name: "description", content: "Sampaikan laporan bullying atau pencurian secara anonim dan aman. Tim BK akan menindaklanjuti laporanmu." },
    ],
  }),
  component: LaporPage,
});

const JENIS_BY_KATEGORI: Record<string, { value: string; label: string }[]> = {
  Bullying: [
    { value: "Verbal",  label: "Verbal — ejekan, hinaan, ancaman lisan" },
    { value: "Fisik",   label: "Fisik — pukul, dorong, tendang" },
    { value: "Sosial",  label: "Sosial — dikucilkan, disebarkan gosip" },
  ],
  Pencurian: [
    { value: "Barang Hilang",         label: "Barang hilang / diduga dicuri" },
    { value: "Uang",                   label: "Uang hilang / diduga dicuri" },
    { value: "Perangkat Elektronik",   label: "HP / laptop / perangkat elektronik" },
  ],
};

function LaporPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama: "", kelas: "", kategori: "", jenis: "", cerita: "", lokasi: "",
  });
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [buktiPreview, setBuktiPreview] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 5 MB");
      return;
    }
    setBuktiFile(f);
    setBuktiPreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    setBuktiFile(null);
    setBuktiPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.kelas || !form.kategori || !form.jenis || !form.cerita || !form.lokasi) {
      toast.warning("Form belum lengkap", {
        description: "Mohon isi semua field yang wajib (*) sebelum mengirim.",
      });
      return;
    }
    if (form.cerita.trim().length < 20) {
      toast.warning("Cerita terlalu singkat", {
        description: "Tuliskan kejadian minimal 20 karakter agar tim BK bisa memahami situasi.",
      });
      return;
    }
    setLoading(true);

    // Upload bukti foto jika ada
    let buktiUrl: string | null = null;
    if (buktiFile) {
      const ext = buktiFile.name.split(".").pop();
      const path = `evidence/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("report-evidence")
        .upload(path, buktiFile, { upsert: false });
      if (uploadError) {
        toast.error("Gagal upload foto bukti", { description: uploadError.message });
        setLoading(false);
        return;
      }
      buktiUrl = uploadData.path;
    }

    const { error } = await supabase.from("reports").insert({
      nama:      form.nama || "Anonim",
      kelas:     form.kelas,
      kategori:  form.kategori,
      jenis:     form.jenis,
      cerita:    form.cerita,
      lokasi:    form.lokasi,
      bukti_url: buktiUrl,
    });
    setLoading(false);
    if (error) {
      return toast.error("Laporan gagal terkirim", {
        description: error.message || "Coba lagi sebentar atau hubungi hotline BK.",
      });
    }
    toast.success("Laporan berhasil dikirim 💜", {
      description: "Tim BK akan menindaklanjuti maksimal 24 jam. Identitasmu aman.",
    });
    setDone(true);
    setForm({ nama: "", kelas: "", kategori: "", jenis: "", cerita: "", lokasi: "" });
    setBuktiFile(null);
    setBuktiPreview(null);
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
            <h1 className="mt-4 font-display text-4xl font-bold">Lapor BK</h1>
            <p className="mt-2 text-muted-foreground">
              Laporkan kejadian bullying atau pencurian secara anonim dan aman.
            </p>
          </div>

          {/* Pilihan kategori visual */}
          {!form.kategori && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => setForm({ ...form, kategori: "Bullying", jenis: "" })}
                className="group rounded-2xl border-2 border-rose-200 bg-rose-50 p-6 text-left transition hover:border-rose-400 hover:shadow-md dark:border-rose-900 dark:bg-rose-950/30"
              >
                <div className="text-3xl">🚫</div>
                <div className="mt-3 font-display text-xl font-bold text-rose-700 dark:text-rose-300">Bullying</div>
                <p className="mt-1 text-sm text-rose-600/80 dark:text-rose-400/80">
                  Verbal, fisik, atau sosial — penganiayaan, ejekan, pengucilan
                </p>
              </button>
              <button
                onClick={() => setForm({ ...form, kategori: "Pencurian", jenis: "" })}
                className="group rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 text-left transition hover:border-amber-400 hover:shadow-md dark:border-amber-900 dark:bg-amber-950/30"
              >
                <div className="text-3xl">🔍</div>
                <div className="mt-3 font-display text-xl font-bold text-amber-700 dark:text-amber-300">Pencurian</div>
                <p className="mt-1 text-sm text-amber-600/80 dark:text-amber-400/80">
                  Barang, uang, atau perangkat elektronik yang hilang / dicuri
                </p>
              </button>
            </div>
          )}

          {form.kategori && (
            <Card className="mt-8 p-6 md:p-8">
              {/* Badge kategori yang dipilih */}
              <div className="mb-5 flex items-center justify-between">
                <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
                  form.kategori === "Bullying"
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                }`}>
                  {form.kategori === "Bullying" ? "🚫" : "🔍"} {form.kategori}
                </span>
                <button
                  onClick={() => setForm({ ...form, kategori: "", jenis: "" })}
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                >
                  Ganti kategori
                </button>
              </div>

              <div className="mb-4 flex items-start gap-3 rounded-lg bg-brand-soft p-4 text-sm">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p>Hanya Guru BK yang sudah disetujui yang dapat melihat laporan ini. Identitasmu terjaga.</p>
              </div>

              <form onSubmit={handle} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="nama">Nama (boleh anonim)</Label>
                    <Input
                      id="nama"
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                      placeholder="Anonim"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kelas">Kelas *</Label>
                    <Input
                      id="kelas"
                      required
                      value={form.kelas}
                      onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                      placeholder="XI PPLG 2"
                    />
                  </div>
                </div>

                <div>
                  <Label>Jenis {form.kategori} *</Label>
                  <Select
                    value={form.jenis}
                    onValueChange={(v) => setForm({ ...form, jenis: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Pilih jenis ${form.kategori.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {JENIS_BY_KATEGORI[form.kategori]?.map((j) => (
                        <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cerita">Cerita Kejadian *</Label>
                  <Textarea
                    id="cerita"
                    required
                    rows={5}
                    value={form.cerita}
                    onChange={(e) => setForm({ ...form, cerita: e.target.value })}
                    placeholder={
                      form.kategori === "Bullying"
                        ? "Ceritakan apa yang terjadi, kapan, siapa yang terlibat..."
                        : "Ceritakan kapan dan bagaimana kejadian, barang apa yang hilang, siapa yang mungkin terlibat..."
                    }
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{form.cerita.length} karakter (min. 20)</p>
                </div>

                <div>
                  <Label htmlFor="lokasi">Lokasi Kejadian *</Label>
                  <Input
                    id="lokasi"
                    required
                    value={form.lokasi}
                    onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                    placeholder="Kantin, kelas, lapangan, toilet..."
                  />
                </div>

                {/* Upload bukti foto */}
                <div>
                  <Label>Bukti Foto <span className="text-muted-foreground font-normal">(opsional, maks. 5 MB)</span></Label>
                  {!buktiPreview ? (
                    <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-sm text-muted-foreground transition hover:border-primary hover:text-primary">
                      <Upload className="h-8 w-8" />
                      <span>Klik atau seret foto ke sini</span>
                      <span className="text-xs">JPG, PNG, WEBP — maks 5 MB</span>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleFile}
                      />
                    </label>
                  ) : (
                    <div className="relative mt-1.5 overflow-hidden rounded-xl border">
                      <img src={buktiPreview} alt="Bukti" className="max-h-48 w-full object-cover" />
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
                        {buktiFile?.name}
                      </div>
                    </div>
                  )}
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3 w-3" />
                    Foto hanya bisa dilihat oleh Guru BK
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full gradient-brand text-white"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? "Mengirim laporan..." : "Kirim Laporan ke BK"}
                </Button>

                {done && (
                  <div className="rounded-lg bg-green-50 p-4 text-center text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                    ✅ Laporan kamu sudah diterima. Tim BK akan menindaklanjuti secepatnya.
                  </div>
                )}
              </form>
            </Card>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
