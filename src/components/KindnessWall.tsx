/**
 * KindnessWall.tsx
 * Dinding Kebaikan dengan sistem moderasi:
 * - User kirim → status 'pending'
 * - Guru approve di dashboard → status 'approved' → tampil di sini
 * - Pesan 'pending' / 'rejected' TIDAK tampil
 */
import { useEffect, useState } from "react";
import { Heart, Send, Sparkles, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Post = { id: string; name: string | null; message: string | null; created_at: string };

const GRADIENTS = [
  "from-pink-500/15 to-rose-500/15 border-pink-500/30",
  "from-violet-500/15 to-indigo-500/15 border-violet-500/30",
  "from-emerald-500/15 to-teal-500/15 border-emerald-500/30",
  "from-amber-500/15 to-orange-500/15 border-amber-500/30",
  "from-sky-500/15 to-cyan-500/15 border-sky-500/30",
  "from-fuchsia-500/15 to-purple-500/15 border-fuchsia-500/30",
];

export function KindnessWall() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("kindness_wall")
      .select("id, name, message, created_at")
      .eq("status", "approved")               // ← Hanya yang sudah di-approve guru
      .order("approved_at", { ascending: false })
      .limit(12);
    setPosts((data as Post[]) ?? []);
  };

  useEffect(() => {
    load();
    // Real-time update saat guru approve pesan baru
    const ch = supabase
      .channel("kindness-wall-approved")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "kindness_wall",
          filter: "status=eq.approved",
        },
        () => load(),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const submit = async () => {
    if (msg.trim().length < 5) {
      return toast.error("Pesan terlalu pendek", { description: "Minimal 5 karakter ya." });
    }
    if (msg.length > 280) {
      return toast.error("Maksimal 280 karakter");
    }
    setLoading(true);
    const { error } = await supabase.from("kindness_wall").insert({
      name: name.trim() || null,
      message: msg.trim(),
      // status default = 'pending', diset oleh database
    });
    setLoading(false);
    if (error) return toast.error("Gagal kirim pesan", { description: error.message });
    setMsg("");
    setName("");
    setSubmitted(true);
    toast.success("Pesanmu terkirim! 💜", {
      description: "Menunggu persetujuan Guru BK sebelum ditampilkan di dinding.",
    });
    // Reset submitted state setelah beberapa detik
    setTimeout(() => setSubmitted(false), 6000);
  };

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Interaktif
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Dinding Kebaikan</h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Tinggalkan pesan dukungan untuk teman-temanmu. Anonim juga boleh.
        </p>
      </div>

      <Card className="mt-8 mx-auto max-w-2xl p-5 shadow-soft sm:p-6">
        {submitted ? (
          /* Status setelah submit */
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
              <Clock className="h-7 w-7" />
            </div>
            <h3 className="font-display text-lg font-semibold">Terima kasih! 💜</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Pesanmu sedang menunggu persetujuan Guru BK. Setelah disetujui, pesanmu akan tampil di Dinding Kebaikan.
            </p>
            <Button variant="outline" size="sm" onClick={() => setSubmitted(false)} className="mt-2">
              Kirim pesan lain
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            <Input
              placeholder="Nama (boleh kosong)"
              value={name}
              maxLength={32}
              onChange={(e) => setName(e.target.value)}
            />
            <Textarea
              placeholder="Tulis pesan dukungan, semangat, atau apresiasi..."
              value={msg}
              maxLength={280}
              onChange={(e) => setMsg(e.target.value)}
              className="min-h-[90px] resize-none"
            />
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-muted-foreground">{msg.length}/280</span>
                <span className="ml-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> Perlu persetujuan guru
                </span>
              </div>
              <Button onClick={submit} disabled={loading} className="gradient-brand text-white">
                <Send className="mr-2 h-4 w-4" /> Kirim
              </Button>
            </div>
          </div>
        )}
      </Card>

      {posts.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Card
              key={p.id}
              className={`animate-fade-in border bg-gradient-to-br p-5 transition hover:-translate-y-1 hover:shadow-glow ${GRADIENTS[i % GRADIENTS.length]}`}
            >
              <Heart className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm leading-relaxed break-words">{p.message}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold">— {p.name?.trim() || "Anonim"}</span>
                <span>{new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Belum ada pesan yang disetujui. Jadilah yang pertama! 💜
        </p>
      )}
    </section>
  );
}
