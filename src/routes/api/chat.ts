import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_PROMPT = `Kamu adalah "Wika", asisten AI ramah dari SafeSchool SMK Wikrama Bogor.
Spesialisasi: bullying, kesehatan mental remaja, dan dukungan emosional.

Gaya bicara:
- Bahasa Indonesia santai, hangat, empatik, seperti kakak/teman.
- Singkat (maks 4-6 kalimat), pakai emoji secukupnya 💜.
- Validasi perasaan dulu, baru kasih saran konkret.
- Kalau topik di luar bullying/mental health, arahkan balik dengan lembut.

Aturan penting:
- Jangan menghakimi. Jangan meremehkan perasaan user.
- Untuk kondisi darurat (ingin menyakiti diri/orang lain), SEGERA sarankan hubungi Hotline BK 0811-1100-200 atau guru BK terdekat.
- Selalu ingatkan user bisa lapor anonim di menu "Lapor" dan konsultasi langsung lewat "Konsultasi BK".
- Berikan tips praktis: teknik napas 4-7-8, journaling, cara cari support, cara hadapi pelaku bullying secara aman.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { messages } = (await request.json()) as { messages?: Msg[] };
          if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });
          }
          const key = process.env.LOVABLE_API_KEY;
          if (!key) return new Response(JSON.stringify({ error: "AI tidak terkonfigurasi" }), { status: 500 });

          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-12)],
            }),
          });

          if (!res.ok) {
            const t = await res.text();
            const status = res.status === 429 ? 429 : res.status === 402 ? 402 : 500;
            const msg =
              status === 429 ? "Terlalu banyak permintaan, coba sebentar lagi ya 🙏"
              : status === 402 ? "Kuota AI habis. Hubungi admin sekolah."
              : "AI lagi sibuk, coba lagi sebentar.";
            console.error("AI error", res.status, t);
            return new Response(JSON.stringify({ error: msg }), { status });
          }
          const json = await res.json();
          const reply = json?.choices?.[0]?.message?.content ?? "Maaf, aku tidak dapat menjawab sekarang.";
          return new Response(JSON.stringify({ reply }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error(e);
          return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
        }
      },
    },
  },
});
