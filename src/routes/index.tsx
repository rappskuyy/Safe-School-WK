import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldCheck, MessageCircleHeart, BookOpen, HeartHandshake, FileWarning, Sparkles, Phone, ChevronDown, Quote, Lock, Clock, Award, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImg from "@/assets/hero-students.jpg";
import posterStop from "@/assets/poster-stop-bullying.jpg";
import posterMental from "@/assets/poster-mental-health.jpg";
import posterFriend from "@/assets/poster-help-friend.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeSchool SMK Wikrama Bogor — Stop Bullying, Mulai Lingkungan Aman" },
      { name: "description", content: "Platform resmi SMK Wikrama Bogor untuk pelaporan bullying, konsultasi BK, pemantauan akademik, dan dukungan psikologis siswa." },
      { property: "og:title", content: "SafeSchool — SMK Wikrama Bogor" },
      { property: "og:description", content: "Stop bullying, mulai lingkungan aman. Layanan resmi BK SMK Wikrama Bogor." },
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
    const { error } = await supabase.from("mood_entries").insert({ mood: m.m });
    if (error) return toast.error("Gagal menyimpan mood", { description: error.message });
    toast.success(`Mood: ${m.m}`, { description: m.text });
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

        <div className="container mx-auto grid items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-primary shadow-soft">
              <ShieldCheck className="h-3.5 w-3.5" /> Platform resmi SMK Wikrama Bogor
            </span>
            <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Stop Bullying,<br />
              <span className="text-gradient-brand">Mulai Lingkungan Aman</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
              SafeSchool adalah ruang aman bagi keluarga besar <strong>SMK Wikrama Bogor</strong> —
              siswa, orang tua, dan guru BK — untuk melaporkan bullying, berkonsultasi, dan saling
              mendukung tanpa rasa takut.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="gradient-brand text-white shadow-glow w-full sm:w-auto">
                <Link to="/lapor">Laporkan Sekarang <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link to="/konsultasi">Konsultasi BK</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />100% Anonim</div>
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-primary animate-pulse" />Didampingi Guru BK</div>
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />Respon &lt; 24 jam</div>
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

      {/* POSTER GALLERY */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="rounded-3xl gradient-hero p-6 text-white shadow-glow sm:p-10 md:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                <ImageIcon className="h-3.5 w-3.5" /> Kampanye visual
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl md:text-4xl">
                Poster anti-bullying untuk dibagikan
              </h2>
              <p className="mt-3 text-sm opacity-90 sm:text-base">
                Ambil, cetak, tempel di mading kelas. Gerakan kecilmu bisa menyelamatkan teman.
              </p>
              <Button asChild size="lg" variant="secondary" className="mt-6">
                <Link to="/edukasi"><ImageIcon className="mr-2 h-4 w-4" />Lihat semua poster</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[posterStop, posterMental, posterFriend].slice(0, 3).map((src, i) => (
                <div
                  key={i}
                  className={`overflow-hidden rounded-2xl bg-black/20 shadow-glow ${i === 0 ? "col-span-2 aspect-video" : "aspect-square"}`}
                >
                  <img
                    src={src}
                    alt={`Poster anti-bullying ${i + 1}`}
                    width={1024}
                    height={576}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MoodChecker />

      {/* TRUST / KEUNGGULAN */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { i: Lock, t: "Privasi Terjaga", d: "Identitas pelapor dilindungi penuh." },
            { i: Clock, t: "Respon Cepat", d: "Tim BK merespon kurang dari 24 jam." },
            { i: Award, t: "Tim Bersertifikasi", d: "Konselor profesional berpengalaman." },
            { i: ShieldCheck, t: "Resmi Sekolah", d: "Didukung pihak SMK Wikrama Bogor." },
          ].map((x, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-soft">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-brand text-white">
                <x.i className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{x.t}</div>
                <div className="text-sm text-muted-foreground">{x.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONI */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Cerita dari warga Wikrama</h2>
          <p className="mt-3 text-muted-foreground">Pengalaman nyata siswa, orang tua, dan guru.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: "Rania, kelas XI RPL", q: "Awalnya takut cerita, tapi BK respon cepat. Sekarang lebih tenang ke sekolah." },
            { n: "Bpk. Hadi (orang tua)", q: "Saya bisa pantau nilai & kehadiran anak setiap hari. Sangat membantu." },
            { n: "Bu Kartika (Guru BK)", q: "Laporan terorganisir rapi dan datanya aman. Memudahkan tindak lanjut." },
          ].map((t, i) => (
            <Card key={i} className="p-6 shadow-soft hover:shadow-glow transition">
              <Quote className="h-8 w-8 text-primary/60" />
              <p className="mt-3 text-sm leading-relaxed">"{t.q}"</p>
              <div className="mt-4 text-sm font-semibold text-primary">— {t.n}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Pertanyaan yang sering ditanyakan</h2>
            <p className="mt-3 text-muted-foreground">Hal yang perlu kamu tahu sebelum menggunakan SafeSchool.</p>
          </div>
          <div className="mt-8 space-y-3">
            {[
              { q: "Apakah laporan saya benar-benar anonim?", a: "Ya. Kamu boleh tidak mencantumkan nama. Hanya guru BK terpilih yang dapat melihat data laporan." },
              { q: "Berapa lama laporan ditindaklanjuti?", a: "Maksimal 24 jam pada hari kerja. Kasus darurat ditangani segera oleh BK." },
              { q: "Apakah orang tua bisa memantau anak?", a: "Bisa. Daftar sebagai akun orang tua dan masukkan NIS anak untuk melihat nilai, absensi, dan progres." },
              { q: "Apa bedanya konsultasi dengan lapor?", a: "Lapor untuk insiden bullying/kekerasan. Konsultasi untuk curhat & pendampingan psikologis rutin." },
            ].map((item, i) => (
              <details key={i} className="group rounded-2xl border bg-card p-5 shadow-soft open:shadow-glow">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  <span>{item.q}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* HOTLINE DARURAT */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border-2 border-destructive/30 bg-destructive/5 p-6 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-destructive text-white animate-pulse">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-lg font-bold">Butuh bantuan segera?</div>
              <div className="text-sm text-muted-foreground">Hotline BK aktif 24/7 untuk kondisi darurat.</div>
            </div>
          </div>
          <a href="tel:08111100200">
            <Button size="lg" variant="destructive" className="shadow-glow">
              <Phone className="mr-2 h-4 w-4" /> 0811-1100-200
            </Button>
          </a>
        </div>
      </section>

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
