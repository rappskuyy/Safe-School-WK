import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircleHeart, X, Send, Sparkles, Phone, FileWarning, Trash2, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "wika-chat-v1";
const WELCOME: Msg = {
  role: "assistant",
  content:
    "Hai! Aku **Wika** 💜 teman ngobrol kamu soal bullying & kesehatan mental. Cerita apa aja yang lagi kamu rasain — di sini aman & rahasia. ✨",
};

const QUICK_PROMPTS = [
  "Aku dibully di kelas, harus gimana?",
  "Lagi cemas berat, bantu aku tenang",
  "Cara dukung teman korban bullying?",
  "Apa itu cyberbullying & cara hindarinya?",
];

// Mini-renderer: **bold** + line breaks
function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function BreathingMini({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [count, setCount] = useState(4);
  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setPhase((p) => (p === "in" ? "hold" : p === "hold" ? "out" : "in"));
        return phase === "in" ? 7 : phase === "hold" ? 8 : 4;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);
  const label = phase === "in" ? "Tarik napas" : phase === "hold" ? "Tahan" : "Hembuskan";
  const scale = phase === "in" ? "scale-110" : phase === "hold" ? "scale-110" : "scale-90";
  return (
    <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-purple-500/10 p-4 text-center">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-primary">Latihan Napas 4-7-8</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
      </div>
      <div className="mx-auto my-3 grid h-20 w-20 place-items-center">
        <div className={`grid h-20 w-20 place-items-center rounded-full gradient-brand text-white shadow-glow transition-transform duration-1000 ${scale}`}>
          <span className="text-2xl font-bold">{count}</span>
        </div>
      </div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
}

export function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBreath, setShowBreath] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // restore
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  // autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, showBreath]);

  // focus on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal menjawab");
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      toast.error("Wika lagi nge-lag", { description: e.message });
      setMessages((m) => [...m, { role: "assistant", content: "Maaf, ada gangguan sebentar. Coba lagi ya 🙏" }]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([WELCOME]);
    toast.success("Riwayat chat dibersihkan");
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Buka chatbot Wika"
          className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full gradient-brand text-white shadow-glow transition hover:scale-110 sm:bottom-8 sm:right-8 sm:h-16 sm:w-16"
        >
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
          <MessageCircleHeart className="relative h-7 w-7" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:p-0">
          {/* backdrop on mobile */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm sm:hidden" onClick={() => setOpen(false)} />

          <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-card shadow-glow animate-fade-up sm:h-[600px] sm:max-h-[85vh] sm:w-[400px] sm:rounded-3xl sm:border">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 gradient-brand p-3 text-white sm:p-4">
              <div className="flex items-center gap-3">
                <div className="relative grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur">
                  <Sparkles className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
                </div>
                <div>
                  <div className="font-display font-bold leading-tight">Wika AI</div>
                  <div className="text-[11px] opacity-90">Teman cerita anti-bullying • online</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearChat} aria-label="Bersihkan chat" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/20">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={() => setOpen(false)} aria-label="Tutup chat" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/20">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick actions strip */}
            <div className="flex items-center gap-2 overflow-x-auto border-b bg-muted/30 p-2 text-xs">
              <button onClick={() => setShowBreath((v) => !v)} className="inline-flex shrink-0 items-center gap-1 rounded-full border bg-card px-3 py-1 font-medium hover:shadow-soft">
                <Wind className="h-3.5 w-3.5 text-primary" /> Napas 4-7-8
              </button>
              <a href="tel:08111100200" className="inline-flex shrink-0 items-center gap-1 rounded-full border bg-card px-3 py-1 font-medium hover:shadow-soft">
                <Phone className="h-3.5 w-3.5 text-rose-500" /> Hotline BK
              </a>
              <Link to="/lapor" onClick={() => setOpen(false)} className="inline-flex shrink-0 items-center gap-1 rounded-full border bg-card px-3 py-1 font-medium hover:shadow-soft">
                <FileWarning className="h-3.5 w-3.5 text-amber-500" /> Lapor Anonim
              </Link>
              <Link to="/konsultasi" onClick={() => setOpen(false)} className="inline-flex shrink-0 items-center gap-1 rounded-full border bg-card px-3 py-1 font-medium hover:shadow-soft">
                <MessageCircleHeart className="h-3.5 w-3.5 text-primary" /> Konsultasi
              </Link>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
              {showBreath && <BreathingMini onClose={() => setShowBreath(false)} />}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-soft ${
                      m.role === "user"
                        ? "gradient-brand text-white rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{renderText(m.content)}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3 shadow-soft">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestion chips when only welcome */}
              {messages.length === 1 && !loading && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:gradient-brand hover:text-white hover:shadow-glow"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="border-t bg-card p-2 sm:p-3"
            >
              <div className="flex items-end gap-2 rounded-2xl border bg-muted/40 p-1.5 focus-within:border-primary focus-within:bg-card">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder="Cerita apa aja ke Wika..."
                  className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={loading || !input.trim()}
                  className="h-9 w-9 shrink-0 gradient-brand text-white shadow-glow"
                  aria-label="Kirim"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
                Wika AI bukan pengganti konselor. Untuk darurat, hubungi Hotline BK.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
