/**
 * MoodCheckAlert.tsx
 * Alert mood otomatis yang muncul:
 *  - Pertama kali mengunjungi web (localStorage belum ada)
 *  - Reset setiap hari (tanggal berubah)
 *
 * Logika respon:
 *  - 😊 Senang   → apresiasi / pesan semangat
 *  - 😐 Biasa    → pesan netral yang ringan
 *  - 😢 Sedih    → dukungan + opsi curhat ke BK
 *  - 😡 Marah    → langsung tawari konsultasi BK / cerita
 */

import { useEffect, useState } from "react";
import { Heart, MessageCircleHeart, X, Sparkles, Frown, Meh, Angry } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

const STORAGE_KEY = "safeschool_mood_date";
const SESSION_KEY = "safeschool_mood_session";

function getSessionId() {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function shouldShowAlert(): boolean {
  const saved = localStorage.getItem(STORAGE_KEY);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return saved !== today;
}

type Mood = "senang" | "biasa" | "sedih" | "marah";

const MOODS: { key: Mood; emoji: string; label: string; bg: string; hover: string }[] = [
  { key: "senang", emoji: "😊", label: "Senang",  bg: "bg-emerald-50 border-emerald-200", hover: "hover:bg-emerald-100 hover:border-emerald-400" },
  { key: "biasa",  emoji: "😐", label: "Biasa",   bg: "bg-amber-50 border-amber-200",    hover: "hover:bg-amber-100 hover:border-amber-400" },
  { key: "sedih",  emoji: "😢", label: "Sedih",   bg: "bg-sky-50 border-sky-200",        hover: "hover:bg-sky-100 hover:border-sky-400" },
  { key: "marah",  emoji: "😡", label: "Marah",   bg: "bg-rose-50 border-rose-200",      hover: "hover:bg-rose-100 hover:border-rose-400" },
];

// Respons setelah pilih mood
const RESPONSES: Record<Mood, {
  title: string;
  message: string;
  color: string;
  icon: React.ReactNode;
  actions?: { label: string; to: string; variant?: "default" | "outline" }[];
}> = {
  senang: {
    title: "Hore, semangat terus! 🌟",
    message: "Senang banget kamu baik-baik saja hari ini! Tebarkan energi positif itu ke teman-temanmu ya. Kamu luar biasa!",
    color: "from-emerald-400 to-teal-500",
    icon: <Sparkles className="h-8 w-8" />,
    actions: [
      { label: "💜 Tulis di Dinding Kebaikan", to: "/#kindness-wall", variant: "outline" },
    ],
  },
  biasa: {
    title: "Hari yang tenang, itu oke! 😌",
    message: "Tidak semua hari harus luar biasa. Yang penting kamu sudah hadir dan berusaha. Hari ini punya potensinya sendiri!",
    color: "from-amber-400 to-orange-500",
    icon: <Meh className="h-8 w-8" />,
    actions: [
      { label: "Coba Cek Mental Sebentar", to: "/#mental-check", variant: "outline" },
    ],
  },
  sedih: {
    title: "Kamu tidak sendirian 💙",
    message: "Sedih itu wajar, dan perasaanmu valid. Cerita kepada seseorang bisa membantu meringankan bebanmu. Kami ada untukmu.",
    color: "from-sky-400 to-blue-600",
    icon: <Frown className="h-8 w-8" />,
    actions: [
      { label: "💬 Konsultasi ke BK", to: "/konsultasi", variant: "default" },
      { label: "Baca Artikel Kesehatan Mental", to: "/edukasi", variant: "outline" },
    ],
  },
  marah: {
    title: "Marah itu manusiawi 💪",
    message: "Napas dulu, ya. Kalau ada yang mengganggu atau kamu alami sesuatu yang tidak adil, Guru BK siap mendengar dan membantumu.",
    color: "from-rose-400 to-red-600",
    icon: <Angry className="h-8 w-8" />,
    actions: [
      { label: "🆘 Konsultasi BK Sekarang", to: "/konsultasi", variant: "default" },
      { label: "Lapor Kejadian ke BK", to: "/lapor", variant: "outline" },
    ],
  },
};

export function MoodCheckAlert() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<Mood | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Tunda sedikit agar page sudah render
    const timer = setTimeout(() => {
      if (shouldShowAlert()) setVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const pickMood = async (mood: Mood) => {
    setSaving(true);
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(STORAGE_KEY, today);

    await supabase.from("mood_entries").insert({
      mood,
      session_id: getSessionId(),
    });

    setSaving(false);
    setSelected(mood);
  };

  const close = () => {
    // Jika belum pilih, tandai sudah visited hari ini tanpa data
    if (!selected) {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(STORAGE_KEY, today);
    }
    setVisible(false);
  };

  if (!visible) return null;

  const response = selected ? RESPONSES[selected] : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!selected ? undefined : close}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md animate-fade-up rounded-3xl bg-background p-6 shadow-2xl">
        {/* Tutup */}
        {selected && (
          <button
            onClick={close}
            className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {!selected ? (
          /* ── Pilih Mood ── */
          <>
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white shadow-glow">
                <Heart className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold">Selamat Datang! 👋</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Bagaimana perasaanmu hari ini? Pilih salah satu.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  disabled={saving}
                  onClick={() => pickMood(m.key)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-5 text-center font-medium transition active:scale-95 disabled:opacity-50 ${m.bg} ${m.hover} dark:bg-transparent`}
                >
                  <span className="text-4xl drop-shadow">{m.emoji}</span>
                  <span className="text-sm font-semibold">{m.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={close}
              className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Lewati untuk sekarang
            </button>
          </>
        ) : (
          /* ── Respons setelah pilih ── */
          <>
            <div className="text-center">
              <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br ${response!.color} text-white shadow-glow`}>
                {response!.icon}
              </div>
              <h2 className="mt-4 font-display text-xl font-bold">{response!.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{response!.message}</p>
            </div>

            {response!.actions && response!.actions.length > 0 && (
              <div className="mt-5 flex flex-col gap-2">
                {response!.actions.map((a) => (
                  <Button
                    key={a.to}
                    variant={a.variant ?? "default"}
                    className={a.variant !== "outline" ? "gradient-brand text-white" : ""}
                    onClick={() => {
                      close();
                      navigate({ to: a.to as any });
                    }}
                  >
                    {a.label}
                  </Button>
                ))}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full text-muted-foreground"
              onClick={close}
            >
              Tutup
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
