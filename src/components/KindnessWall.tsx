import { useEffect, useState } from "react";
import { Heart, Send, Sparkles } from "lucide-react";
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

  const load = async () => {
    const { data } = await supabase
      .from("community_posts")
      .select("id, name, message, created_at")
      .eq("type", "wall")
      .order("created_at", { ascending: false })
      .limit(12);
    setPosts((data as Post[]) ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("kindness-wall")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_posts", filter: "type=eq.wall" },
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
    const { error } = await supabase.from("community_posts").insert({
      type: "wall",
      name: name.trim() || null,
      message: msg.trim(),
    });
    setLoading(false);
    if (error) return toast.error("Gagal kirim pesan", { description: error.message });
    setMsg("");
    setName("");
    toast.success("Pesanmu terpasang 💜", { description: "Terima kasih sudah menebar kebaikan." });
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
            <span className="text-xs text-muted-foreground">{msg.length}/280</span>
            <Button onClick={submit} disabled={loading} className="gradient-brand text-white">
              <Send className="mr-2 h-4 w-4" /> Tempel
            </Button>
          </div>
        </div>
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
        <p className="mt-10 text-center text-sm text-muted-foreground">Jadilah yang pertama menempel pesan 💜</p>
      )}
    </section>
  );
}
