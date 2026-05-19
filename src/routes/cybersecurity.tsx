import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shield, Lock, Eye, EyeOff, Fish, Wifi, Smartphone, KeyRound, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Globe, UserX, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { toast } from "sonner";

export const Route = createFileRoute("/cybersecurity")({
  head: () => ({
    meta: [
      { title: "Keamanan Digital — SafeSchool SMK Wikrama Bogor" },
      { name: "description", content: "Belajar lindungi diri di dunia digital: cek kekuatan password, kenali phishing, jaga privasi, dan stop cyberbullying." },
    ],
  }),
  component: CyberPage,
});

// ---------- Password Strength ----------
function scorePassword(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  const weak = ["123456", "password", "qwerty", "admin", "wikrama", "12345678"];
  if (weak.some((w) => p.toLowerCase().includes(w))) s = Math.min(s, 1);
  return Math.min(s, 5);
}
const STRENGTH = [
  { l: "Sangat lemah", c: "bg-rose-500", t: "text-rose-500" },
  { l: "Lemah", c: "bg-orange-500", t: "text-orange-500" },
  { l: "Cukup", c: "bg-amber-500", t: "text-amber-500" },
  { l: "Bagus", c: "bg-lime-500", t: "text-lime-500" },
  { l: "Kuat", c: "bg-emerald-500", t: "text-emerald-500" },
  { l: "Sangat kuat", c: "bg-emerald-600", t: "text-emerald-600" },
];

function PasswordChecker() {
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const score = scorePassword(pwd);
  const meta = STRENGTH[score];
  const checks = [
    { ok: pwd.length >= 12, t: "Minimal 12 karakter" },
    { ok: /[A-Z]/.test(pwd) && /[a-z]/.test(pwd), t: "Huruf besar & kecil" },
    { ok: /\d/.test(pwd), t: "Mengandung angka" },
    { ok: /[^A-Za-z0-9]/.test(pwd), t: "Karakter spesial (!@#$%)" },
    { ok: !/(password|123|qwerty|admin)/i.test(pwd) && pwd.length > 0, t: "Bukan kata umum" },
  ];

  const suggest = () => {
    const ch = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*?";
    let out = "";
    for (let i = 0; i < 16; i++) out += ch[Math.floor(Math.random() * ch.length)];
    setPwd(out);
    setShow(true);
    toast.success("Password kuat dibuat", { description: "Salin & simpan di password manager kamu." });
  };

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold">Cek Kekuatan Password</h3>
          <p className="text-xs text-muted-foreground">Diproses lokal di browser. Tidak dikirim ke mana pun.</p>
        </div>
      </div>

      <div className="relative mt-5">
        <input
          type={show ? "text" : "password"}
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Ketik password kamu..."
          className="w-full rounded-xl border bg-card px-4 py-3 pr-20 text-sm outline-none focus:border-primary"
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-4 flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-2 flex-1 rounded-full transition ${i < score ? meta.c : "bg-muted"}`} />
        ))}
      </div>
      {pwd && <div className={`mt-2 text-sm font-semibold ${meta.t}`}>{meta.l}</div>}

      <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {checks.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {c.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
            <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.t}</span>
          </li>
        ))}
      </ul>

      <Button onClick={suggest} variant="outline" size="sm" className="mt-5">
        <RefreshCw className="mr-2 h-4 w-4" />Buatkan password kuat
      </Button>
    </Card>
  );
}

// ---------- Phishing Quiz ----------
const QUIZ = [
  { q: "Kamu dapat email: 'Selamat! Akun TikTok kamu terpilih, klik link untuk klaim hadiah HP gratis'. Apa yang kamu lakukan?", opts: ["Klik linknya cepat sebelum kehabisan", "Abaikan & hapus email", "Forward ke semua teman"], a: 1, e: "Phishing klasik. Hadiah mendadak = jebakan. Jangan klik link mencurigakan." },
  { q: "Akun IG temanmu kirim DM: 'pinjam OTP-mu sebentar dong'. Tindakanmu?", opts: ["Kirim OTP karena dia teman", "Tolak & konfirmasi langsung ke temannya via telepon", "Kirim screenshot OTP"], a: 1, e: "Akun temanmu mungkin diretas. OTP HARAM dibagikan, ke siapa pun." },
  { q: "Tanda paling jelas situs login PALSU adalah:", opts: ["Pakai https://", "URL aneh seperti faceb00k-login.xyz", "Punya logo perusahaan"], a: 1, e: "Selalu cek domain. Penipu sering ganti huruf jadi angka (o→0, l→1)." },
  { q: "Wifi gratis 'FREE_WIFI_MALL' tanpa password. Aman buat login m-banking?", opts: ["Aman, kan gratis", "Tidak, gunakan VPN atau data seluler", "Aman asal cepat"], a: 1, e: "Wifi publik bisa disadap. Hindari transaksi sensitif di wifi terbuka." },
  { q: "Cara terbaik amankan akun selain password kuat:", opts: ["Pakai password yang sama di semua akun", "Aktifkan 2FA (Two-Factor Authentication)", "Tulis password di buku"], a: 1, e: "2FA = lapisan kedua. Walau password bocor, pelaku tetap butuh kode OTP-mu." },
];

function PhishingQuiz() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = QUIZ[i];

  const choose = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === cur.a) setScore((s) => s + 1);
  };
  const next = () => {
    if (i + 1 >= QUIZ.length) setDone(true);
    else { setI(i + 1); setPicked(null); }
  };
  const reset = () => { setI(0); setPicked(null); setScore(0); setDone(false); };

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white">
          <Fish className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold">Kuis: Deteksi Phishing</h3>
          <p className="text-xs text-muted-foreground">{done ? "Selesai!" : `Soal ${i + 1} dari ${QUIZ.length}`}</p>
        </div>
      </div>

      {!done ? (
        <>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full gradient-brand transition-all" style={{ width: `${((i + (picked !== null ? 1 : 0)) / QUIZ.length) * 100}%` }} />
          </div>
          <p className="mt-5 font-medium">{cur.q}</p>
          <div className="mt-3 space-y-2">
            {cur.opts.map((o, idx) => {
              const isPicked = picked === idx;
              const isCorrect = picked !== null && idx === cur.a;
              const isWrong = isPicked && idx !== cur.a;
              return (
                <button
                  key={idx}
                  onClick={() => choose(idx)}
                  disabled={picked !== null}
                  className={`flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm transition ${
                    isCorrect ? "border-emerald-500 bg-emerald-500/10"
                    : isWrong ? "border-rose-500 bg-rose-500/10"
                    : "hover:border-primary hover:bg-brand-soft"
                  }`}
                >
                  {picked !== null && (isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : isWrong ? <XCircle className="h-4 w-4 text-rose-500" /> : <span className="h-4 w-4" />)}
                  {o}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="mt-4 animate-fade-up rounded-xl bg-muted/60 p-3 text-sm">
              <strong className="text-primary">Penjelasan:</strong> {cur.e}
              <Button onClick={next} size="sm" className="mt-3 gradient-brand text-white">
                {i + 1 >= QUIZ.length ? "Lihat hasil" : "Lanjut"} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full gradient-brand text-white shadow-glow">
            <Sparkles className="h-9 w-9" />
          </div>
          <div className="mt-4 font-display text-3xl font-bold">{score} / {QUIZ.length}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {score === QUIZ.length ? "Wow, cyber-defender sejati! 🛡️"
             : score >= 3 ? "Lumayan! Pelajari lagi yang salah ya."
             : "Yuk pelajari ulang materinya, biar makin aman."}
          </p>
          <Button onClick={reset} variant="outline" size="sm" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />Ulangi kuis
          </Button>
        </div>
      )}
    </Card>
  );
}

// ---------- Cyberbullying Risk Self-Check ----------
const RISK = [
  "Profil media sosialmu publik (bisa dilihat siapa saja).",
  "Kamu pernah membagikan nomor HP / alamat / sekolah di bio.",
  "Pakai password yang sama di 2+ akun penting.",
  "Pernah balas chat penghina dengan emosi.",
  "Belum aktifkan 2FA di IG / TikTok / WhatsApp / email.",
  "Pernah klik link dari DM orang tak dikenal.",
];

function RiskCheck() {
  const [picks, setPicks] = useState<boolean[]>(Array(RISK.length).fill(false));
  const count = picks.filter(Boolean).length;
  const level = useMemo(() => {
    if (count === 0) return { l: "Aman", c: "text-emerald-500", d: "Pertahankan kebiasaan baikmu!" };
    if (count <= 2) return { l: "Perlu Waspada", c: "text-amber-500", d: "Beberapa celah perlu kamu tutup." };
    if (count <= 4) return { l: "Berisiko", c: "text-orange-500", d: "Yuk perbaiki segera sebelum jadi korban." };
    return { l: "Berisiko Tinggi", c: "text-rose-500", d: "Segera ganti password & aktifkan 2FA sekarang!" };
  }, [count]);
  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <UserX className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold">Cek Risiko Cyberbullying-mu</h3>
          <p className="text-xs text-muted-foreground">Centang yang sesuai dengan kebiasaanmu.</p>
        </div>
      </div>
      <ul className="mt-5 space-y-2">
        {RISK.map((r, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm hover:border-primary">
              <input
                type="checkbox"
                checked={picks[i]}
                onChange={(e) => setPicks((p) => p.map((v, idx) => (idx === i ? e.target.checked : v)))}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span>{r}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-5 rounded-2xl border-2 border-dashed p-4 text-center">
        <div className="text-xs text-muted-foreground">Tingkat risiko</div>
        <div className={`mt-1 font-display text-2xl font-bold ${level.c}`}>{level.l}</div>
        <div className="mt-1 text-sm">{level.d}</div>
      </div>
    </Card>
  );
}

// ---------- Page ----------
function CyberPage() {
  const tips = [
    { i: Lock, t: "Password Manager", d: "Pakai Bitwarden / 1Password biar tiap akun beda password tanpa harus hafal." },
    { i: Shield, t: "Aktifkan 2FA", d: "Two-Factor Authentication menutup 99% serangan walau password bocor." },
    { i: Eye, t: "Privasi IG/TikTok", d: "Set akun jadi private, sembunyikan story dari orang asing." },
    { i: Wifi, t: "Hindari Wifi Publik", d: "Untuk login penting, pakai data seluler atau VPN tepercaya." },
    { i: Smartphone, t: "Update Aplikasi", d: "Update menutup celah keamanan. Aktifkan auto-update." },
    { i: Globe, t: "Cek URL", d: "Phishing meniru domain. Cek huruf demi huruf sebelum login." },
  ];

  const dont = [
    "Jangan bagikan OTP / kode verifikasi ke siapa pun.",
    "Jangan posting foto KTP, KK, kartu pelajar, atau boarding pass.",
    "Jangan klik link mencurigakan di DM / SMS / WhatsApp.",
    "Jangan pakai password lahir + nama (terlalu mudah ditebak).",
    "Jangan tinggalkan akun login di komputer warnet / sekolah.",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 gradient-hero opacity-10" />
        <div className="pointer-events-none absolute -top-20 -right-20 -z-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl animate-float" />
        <div className="container mx-auto px-4 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-primary shadow-soft">
              <Shield className="h-3.5 w-3.5" /> Cyber Safety Center
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
              Lindungi Diri di <span className="text-gradient-brand">Dunia Digital</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Bullying nggak cuma di kelas — di DM, komen, dan grup chat juga.
              Kuasai dasar keamanan digital biar kamu aman & nggak gampang jadi korban.
            </p>
          </div>
        </div>
      </section>

      {/* TOOLS GRID */}
      <section className="container mx-auto grid gap-6 px-4 py-12 lg:grid-cols-2">
        <PasswordChecker />
        <RiskCheck />
        <div className="lg:col-span-2">
          <PhishingQuiz />
        </div>
      </section>

      {/* TIPS */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">6 Kebiasaan Cyber-Safe</h2>
          <p className="mt-3 text-muted-foreground">Mudah dilakukan, dampaknya besar.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tips.map((t, i) => (
            <Card key={i} className="p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
              <div className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-white">
                <t.i className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-semibold">{t.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* DON'TS */}
      <section className="container mx-auto px-4 py-12">
        <Card className="border-2 border-destructive/30 bg-destructive/5 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-destructive text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl font-bold">5 Hal yang HARAM dilakukan</h2>
          </div>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {dont.map((d, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl bg-card p-3 text-sm shadow-soft">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> {d}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-none gradient-brand p-10 text-center text-white shadow-glow md:p-14">
          <Shield className="mx-auto h-12 w-12" />
          <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">Jadi korban cyberbullying?</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-90">
            Screenshot bukti, jangan dibalas, lalu laporkan. Tim BK siap dampingi kamu.
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
