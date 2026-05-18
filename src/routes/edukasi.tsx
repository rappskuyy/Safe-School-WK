import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  Brain, HeartHandshake, ShieldAlert, MessagesSquare, Download,
  Quote, Wind, Lightbulb, Phone, Sparkles, BookHeart,
} from "lucide-react";
import { toast } from "sonner";
import posterStop from "@/assets/poster-stop-bullying.jpg";
import posterMental from "@/assets/poster-mental-health.jpg";
import posterFriend from "@/assets/poster-help-friend.jpg";
import posterCyber from "@/assets/poster-cyberbullying.jpg";

export const Route = createFileRoute("/edukasi")({
  head: () => ({
    meta: [
      { title: "Edukasi & Kampanye — SafeSchool SMK Wikrama Bogor" },
      { name: "description", content: "Poster kampanye anti-bullying, tips kesehatan mental, latihan pernapasan, dan artikel untuk siswa SMK Wikrama Bogor." },
    ],
  }),
  component: EdukasiPage,
});

const posters = [
  { img: posterStop,   title: "Stop Bullying",        tag: "Kampanye", desc: "Setiap siswa berhak belajar tanpa rasa takut." },
  { img: posterMental, title: "Kesehatan Mental",     tag: "Wellness", desc: "Jaga pikiran sebaik kamu menjaga tubuh." },
  { img: posterFriend, title: "Bantu Temanmu",        tag: "Empati",   desc: "Satu pelukan bisa menyelamatkan satu hari." },
  { img: posterCyber,  title: "Stop Cyberbullying",   tag: "Digital",  desc: "Jari kita harus selembut hati kita." },
];

const artikel = [
  { icon: ShieldAlert,    t: "Dampak Bullying",       d: "Bullying menyebabkan trauma, depresi, dan menurunkan prestasi akademik." },
  { icon: HeartHandshake, t: "Cara Membantu Teman",   d: "Dengarkan dengan empati, jangan menghakimi, dan ajak melapor ke BK." },
  { icon: Brain,          t: "Mental Health Siswa",   d: "Kesehatan mental sama pentingnya dengan kesehatan fisik." },
  { icon: MessagesSquare, t: "Cara Melapor Aman",     d: "Gunakan SafeSchool atau hubungi guru BK; identitas dijaga." },
];

const quotes = [
  "Kamu tidak sendirian. Cerita kamu penting.",
  "Berani bersuara adalah bentuk keberanian sejati.",
  "Kebaikan kecil hari ini bisa menyelamatkan masa depan seseorang.",
  "Mental yang sehat lahir dari lingkungan yang aman.",
  "Bersikap baik tidak pernah ketinggalan zaman.",
];

const tips = [
  { t: "Tarik napas 4-7-8",    d: "Tarik 4 detik, tahan 7 detik, buang 8 detik. Ulangi 4x saat cemas." },
  { t: "Journaling 5 menit",   d: "Tulis 3 hal yang kamu syukuri tiap malam — terbukti turunkan stres." },
  { t: "Batasi scroll medsos", d: "Maksimal 30 menit/sesi. Otak butuh istirahat dari notifikasi." },
  { t: "Bicara ke orang dewasa", d: "Guru BK, orang tua, atau wali kelas. Bercerita = 50% solusi." },
  { t: "Tidur 7-9 jam",        d: "Kurang tidur memperburuk mood & menurunkan daya tahan emosi." },
  { t: "Gerak 20 menit/hari",  d: "Jalan kaki, stretching, atau senam ringan melepas endorfin." },
];

function BreathingBox() {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!active) return;
    const cycle = ["in", "hold", "out"] as const;
    const dur = { in: 4000, hold: 7000, out: 8000 };
    let i = 0;
    setPhase(cycle[0]);
    const tick = () => {
      i = (i + 1) % cycle.length;
      setPhase(cycle[i]);
    };
    const id = setInterval(tick, dur[cycle[i]]);
    return () => clearInterval(id);
  }, [active]);

  const label = phase === "in" ? "Tarik napas…" : phase === "hold" ? "Tahan…" : "Buang napas…";
  const scale = phase === "in" ? "scale-110" : phase === "hold" ? "scale-110" : "scale-75";

  return (
    <Card className="overflow-hidden p-6 sm:p-8 text-center shadow-soft">
      <Wind className="mx-auto h-7 w-7 text-primary" />
      <h3 className="mt-2 font-display text-xl font-bold sm:text-2xl">Latihan Pernapasan 4-7-8</h3>
      <p className="mt-1 text-sm text-muted-foreground">Teknik ampuh untuk menenangkan diri saat cemas atau marah.</p>
      <div className="my-8 grid place-items-center">
        <div
          className={`grid h-40 w-40 sm:h-48 sm:w-48 place-items-center rounded-full gradient-brand text-white shadow-glow transition-transform duration-[4000ms] ease-in-out ${active ? scale : "scale-90"}`}
        >
          <div>
            <div className="text-xs uppercase tracking-widest opacity-80">{active ? "Sedang berlatih" : "Siap memulai"}</div>
            <div className="mt-1 font-display text-xl font-bold">{active ? label : "Mulai"}</div>
          </div>
        </div>
      </div>
      <Button
        onClick={() => {
          setActive((v) => !v);
          toast.success(active ? "Latihan dihentikan" : "Latihan dimulai", {
            description: active ? "Semoga kamu merasa lebih tenang." : "Ikuti ritme lingkaran selama 1–3 menit.",
          });
        }}
        size="lg"
        className="gradient-brand text-white"
      >
        {active ? "Berhenti" : "Mulai Sekarang"}
      </Button>
    </Card>
  );
}

function QuoteOfDay() {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(new Date().getDate() % quotes.length);
  }, []);
  return (
    <div className="rounded-3xl gradient-hero p-6 text-white shadow-glow sm:p-10">
      <Quote className="h-8 w-8 opacity-80" />
      <p className="mt-3 font-display text-xl font-semibold sm:text-2xl md:text-3xl leading-snug">
        "{quotes[i]}"
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm opacity-90">— Quote of the day</span>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setI((p) => (p + 1) % quotes.length)}
        >
          <Sparkles className="mr-2 h-4 w-4" /> Quote lain
        </Button>
      </div>
    </div>
  );
}

function EdukasiPage() {
  const download = async (src: string, name: string) => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${name}.jpg`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Poster diunduh", { description: "Bagikan ke teman-temanmu ya!" });
    } catch {
      toast.error("Gagal mengunduh poster");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-10 sm:py-16">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-primary">Edukasi & Kampanye</span>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl md:text-5xl">
            Belajar bareng <span className="text-gradient-brand">SafeSchool</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground">
            Poster kampanye, tips kesehatan mental, dan latihan singkat untuk hari-hari yang berat.
          </p>
        </div>

        {/* QUOTE */}
        <section className="mt-10 sm:mt-12">
          <QuoteOfDay />
        </section>

        {/* POSTER */}
        <section className="mt-12 sm:mt-16">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">🎨 Poster kampanye</h2>
              <p className="mt-1 text-sm text-muted-foreground">Klik unduh & bagikan ke kelasmu.</p>
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex">Gratis untuk warga Wikrama</Badge>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {posters.map((p) => (
              <Card key={p.title} className="group overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-glow">
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={p.img}
                    alt={p.title}
                    width={1024}
                    height={576}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{p.tag}</Badge>
                  </div>
                  <h3 className="mt-2 font-display font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.desc}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => download(p.img, p.title.toLowerCase().replace(/\s+/g, "-"))}
                  >
                    <Download className="mr-2 h-4 w-4" /> Unduh poster
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* TIPS + BREATHING */}
        <section className="mt-16 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" /> Tips menjaga mental
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Praktek harian yang ringan tapi berdampak besar.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {tips.map((tip, i) => (
                <Card key={i} className="p-5 hover:shadow-glow transition">
                  <div className="flex items-start gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-primary text-sm font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{tip.t}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{tip.d}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <BreathingBox />
          </div>
        </section>

        {/* ARTIKEL */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <BookHeart className="h-6 w-6 text-primary" /> Artikel singkat
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {artikel.map((a, i) => (
              <Card key={i} className="group p-6 transition hover:-translate-y-2 hover:shadow-glow">
                <div className="grid h-12 w-12 place-items-center rounded-xl gradient-brand text-white">
                  <a.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display font-semibold">{a.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.d}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* HOTLINE */}
        <section className="mt-16">
          <Card className="flex flex-col items-center justify-between gap-4 border-2 border-destructive/30 bg-destructive/5 p-6 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-destructive text-white animate-pulse">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display text-lg font-bold">Butuh bicara dengan BK sekarang?</div>
                <div className="text-sm text-muted-foreground">Hotline aktif 24/7, gratis, dan rahasia.</div>
              </div>
            </div>
            <a href="tel:08111100200">
              <Button size="lg" variant="destructive" className="shadow-glow">
                <Phone className="mr-2 h-4 w-4" /> 0811-1100-200
              </Button>
            </a>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
