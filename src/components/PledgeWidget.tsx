import { useEffect, useState } from "react";
import { HandHeart, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const KEY = "safeschool-pledged";

export function PledgeWidget() {
  const [count, setCount] = useState<number>(0);
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { count: c } = await supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("type", "pledge");
    setCount(c ?? 0);
  };

  useEffect(() => {
    setSigned(localStorage.getItem(KEY) === "1");
    load();
    const ch = supabase
      .channel("pledges")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_posts", filter: "type=eq.pledge" },
        () => load(),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const sign = async () => {
    if (signed) return;
    setLoading(true);
    const { error } = await supabase.from("community_posts").insert({ type: "pledge" });
    setLoading(false);
    if (error) return toast.error("Gagal menandatangani", { description: error.message });
    localStorage.setItem(KEY, "1");
    setSigned(true);
    toast.success("Terima kasih! Kamu sudah berjanji 💜", {
      description: "Yuk ajak temanmu ikut menandatangani.",
    });
  };

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <Card className="overflow-hidden border-none p-0 shadow-glow">
        <div className="grid gap-0 md:grid-cols-5">
          <div className="gradient-brand p-8 text-center text-white md:col-span-2 md:text-left">
            <HandHeart className="mx-auto h-10 w-10 md:mx-0" />
            <div className="mt-4 font-display text-5xl font-extrabold tabular-nums sm:text-6xl">
              {count.toLocaleString("id-ID")}
            </div>
            <div className="mt-1 text-sm opacity-90">siswa Wikrama sudah berjanji</div>
          </div>
          <div className="bg-card p-6 sm:p-8 md:col-span-3">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Janji Anti-Bullying</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Dengan menandatangani, saya berjanji untuk:
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                "Tidak melakukan bullying dalam bentuk apa pun.",
                "Berani bersuara saat melihat teman dirundung.",
                "Menjaga kata-kata di media sosial.",
                "Membantu menciptakan SMK Wikrama yang aman.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={sign}
              disabled={signed || loading}
              size="lg"
              className="mt-6 w-full gradient-brand text-white sm:w-auto"
            >
              {signed ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Sudah ditandatangani
                </>
              ) : (
                <>
                  <HandHeart className="mr-2 h-4 w-4" /> Saya Berjanji
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
