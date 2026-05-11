import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldCheck, MessageCircleHeart, BookOpen, HeartHandshake, FileWarning, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImg from "@/assets/hero-students.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeSchool — Stop Bullying, Mulai Lingkungan Aman" },
      { name: "description", content: "Platform pelaporan bullying & konsultasi BK untuk siswa SMA. Aman, anonim, didukung guru BK." },
      { property: "og:title", content: "SafeSchool" },
      { property: "og:description", content: "Stop bullying, mulai lingkungan aman." },
    ],
  }),
  component: HomePage,
});

function useCountUp(target: number, start: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number; const t0 = performance.now(); const dur = 1500;
    const step = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setV(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, start]);
  return v;
}

function StatsBlock() {
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVis(true), { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const a = useCountUp(120, vis), b = useCountUp(85, vis), c = useCountUp(24, vis), d = useCountUp(98, vis);
  return (
    <section ref={ref} className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { v: a, l: "Laporan Tertangani", suf: "+" },
          { v: b, l: "Konsultasi BK", suf: "+" },
          { v: c, l: "Artikel Edukasi", suf: "" },
          { v: d, l: "Tingkat Kepuasan", suf: "%" },
        ].map((s, i) => (
          <Card key={i} className="border-none gradient-brand p-6 text-center text-white shadow-soft">
            <div className="font-display text-4xl font-bold">{s.v}{s.suf}</div>
            <div className="mt-1 text-sm opacity-90">{s.l}</div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function MoodChecker() {
  const [picked, setPicked] = useState<string | null>(null);
  const moods = [
    { e: "😊", m: "senang", text: "Senangnya lihat kamu bahagia! Tetap sebar energi positif 🌈" },
    { e: "😐", m: "biasa", text: "Hari biasa juga berharga. Pelan-pelan saja, kamu hebat 💪" },
    { e: "😢", m: "sedih", text: "Sedih itu wajar. Cerita ke guru BK bisa bantu kamu lega 💜" },
    { e: "😡", m: "marah", text: "Tarik napas dalam... Tenang dulu ya, kamu bisa atasi ini 🌿" },
  ];
  const handle = async (m: typeof moods[number]) => {
    setPicked(m.m);
    await supabase.from("mood_entries").insert({ mood: m.m });
    toast.success(m.text);
  };
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="rounded-3xl border bg-card p-8 text-center shadow-soft">
        <Sparkles className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 font-display text-3xl font-bold">Bagaimana perasaanmu hari ini?</h2>
        <p className="mt-2 text-muted-foreground">Klik emoji untuk berbagi mood-mu hari ini.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {moods.map((m) => (
            <button
              key={m.m}
              onClick={() => handle(m)}
              className={`grid h-16 w-16 place-items-center rounded-2xl text-3xl transition hover:scale-110 ${
                picked === m.m ? "gradient-brand shadow-glow" : "bg-muted"
              }`}
            >
              {m.e}
            </button>
          ))}
        </div>
        {picked && (
          <p className="mt-4 text-sm text-primary font-medium animate-fade-up">
            {moods.find((x) => x.m === picked)?.text}
          </p>
        )}
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-hero opacity-10" />
        {/* blob warna-warni */}
        <div className="pointer-events-none absolute -top-24 -left-24 -z-10 h-80 w-80 rounded-full bg-blue-400/30 blur-3xl animate-float" />
        <div className="pointer-events-none absolute top-40 right-0 -z-10 h-96 w-96 rounded-full bg-purple-400/30 blur-3xl animate-float [animation-delay:1.5s]" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-72 w-72 rounded-full bg-pink-400/20 blur-3xl animate-float [animation-delay:3s]" />

        <div className="container mx-auto grid items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-primary shadow-soft">
              <ShieldCheck className="h-3.5 w-3.5" /> Platform resmi sekolah
            </span>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-tight md:text-6xl">
              Stop Bullying,<br />
              <span className="text-gradient-brand">Mulai Lingkungan Aman</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              SafeSchool adalah ruang aman untuk siswa SMA melaporkan bullying dan berkonsultasi
              dengan Guru BK secara mudah, rahasia, dan didampingi tenaga profesional.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gradient-brand text-white shadow-glow">
                <Link to="/lapor">Laporkan Sekarang <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/konsultasi">Konsultasi BK</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />100% Anonim</div>
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-primary animate-pulse" />Didampingi Guru BK</div>
            </div>
          </div>
          <div className="relative animate-float">
            <div className="absolute inset-0 -z-10 rounded-full gradient-brand opacity-20 blur-3xl" />
            <img
              src={heroImg}
              alt="Ilustrasi siswa SMA Indonesia saling mendukung"
              width={1024} height={1024}
              className="mx-auto w-full max-w-md rounded-3xl shadow-glow"
            />
            {/* badge melayang */}
            <div className="absolute -left-4 top-10 hidden rounded-2xl bg-white/90 p-3 shadow-glow backdrop-blur dark:bg-slate-900/90 md:block animate-fade-up">
              <div className="flex items-center gap-2 text-xs">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-600">✓</span>
                <div>
                  <div className="font-semibold">Laporan terkirim</div>
                  <div className="text-muted-foreground">Guru BK menerima</div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 bottom-10 hidden rounded-2xl bg-white/90 p-3 shadow-glow backdrop-blur dark:bg-slate-900/90 md:block animate-fade-up [animation-delay:0.3s]">
              <div className="flex items-center gap-2 text-xs">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple-100 text-purple-600">💜</span>
                <div>
                  <div className="font-semibold">Kamu didengar</div>
                  <div className="text-muted-foreground">Aman & rahasia</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR UTAMA */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="font-display text-4xl font-bold">Empat pilar SafeSchool</h2>
          <p className="mt-3 text-muted-foreground">Dukungan menyeluruh untuk kesehatan mental & keamanan siswa.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck,        t: "Tempat Aman",    d: "Ruang aman untuk berbagi tanpa takut dihakimi.", c: "from-emerald-500 to-teal-600" },
            { icon: FileWarning,        t: "Lapor Bullying", d: "Sampaikan laporan secara anonim dan rahasia.",   c: "from-rose-500 to-pink-600" },
            { icon: MessageCircleHeart, t: "Konsultasi BK",  d: "Atur jadwal langsung dengan Guru BK.",            c: "from-blue-500 to-indigo-600" },
            { icon: BookOpen,           t: "Edukasi Mental", d: "Artikel & video tentang kesehatan mental remaja.",c: "from-violet-500 to-purple-600" },
          ].map((f, i) => (
            <Card key={i} className="group p-6 transition hover:-translate-y-2 hover:shadow-glow">
              <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${f.c} text-white shadow-glow`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <StatsBlock />

      {/* VIDEO PREVIEW */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-3xl gradient-hero p-8 text-white md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Belajar dari video edukasi pilihan</h2>
              <p className="mt-3 opacity-90">
                Tonton video singkat tentang anti-bullying, kesehatan mental, dan tips dukung teman.
              </p>
              <Button asChild size="lg" variant="secondary" className="mt-6">
                <Link to="/edukasi"><Play className="mr-2 h-4 w-4" />Tonton Video</Link>
              </Button>
            </div>
            <div className="aspect-video overflow-hidden rounded-2xl bg-black/30 shadow-glow">
              <iframe
                src="https://www.youtube.com/embed/7-K_VTtR0v0"
                title="Anti-Bullying"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <MoodChecker />

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-none gradient-brand p-10 text-center text-white shadow-glow md:p-16">
          <HeartHandshake className="mx-auto h-12 w-12" />
          <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">Kamu tidak sendirian.</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-90">
            Cerita kamu didengar. Mulai langkah pertama dengan menyampaikan laporan atau bicara ke guru BK.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary"><Link to="/lapor">Lapor Sekarang</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 hover:text-white">
              <Link to="/konsultasi">Konsultasi BK</Link>
            </Button>
          </div>
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}
