import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Brain, HeartHandshake, ShieldAlert, MessagesSquare } from "lucide-react";

export const Route = createFileRoute("/edukasi")({
  head: () => ({
    meta: [
      { title: "Edukasi & Video — SafeSchool" },
      { name: "description", content: "Video dan artikel edukasi seputar bullying, kesehatan mental remaja, dan cara membantu teman." },
    ],
  }),
  component: EdukasiPage,
});

const videos = [
  { id: "7-K_VTtR0v0", title: "Apa itu Bullying & Bahayanya", desc: "Pengenalan bentuk-bentuk bullying di sekolah." },
  { id: "Fhc1zg0Y6jQ", title: "Mental Health untuk Remaja", desc: "Tips menjaga kesehatan mental sebagai siswa SMA." },
  { id: "I8Xc2_FtpHI", title: "Cara Membantu Teman yang Di-bully", desc: "Langkah konkret yang bisa kamu lakukan." },
];

const artikel = [
  { icon: ShieldAlert, t: "Dampak Bullying", d: "Bullying menyebabkan trauma, depresi, dan menurunkan prestasi akademik." },
  { icon: HeartHandshake, t: "Cara Membantu Teman", d: "Dengarkan dengan empati, jangan menghakimi, dan ajak melapor ke BK." },
  { icon: Brain, t: "Mental Health Siswa", d: "Kesehatan mental sama pentingnya dengan kesehatan fisik." },
  { icon: MessagesSquare, t: "Cara Melapor Aman", d: "Gunakan SafeSchool atau hubungi guru BK; identitas dijaga." },
];

function EdukasiPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-primary">Edukasi</span>
          <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            Belajar bareng <span className="text-gradient-brand">SafeSchool</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Tonton video pilihan dan baca artikel singkat untuk memahami bullying & cara menjaga kesehatan mental.
          </p>
        </div>

        {/* VIDEO */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">🎬 Video edukasi</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <Card key={v.id} className="overflow-hidden p-0">
                <div className="aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${v.id}`}
                    title={v.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ARTIKEL */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">📚 Artikel singkat</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
      </main>
      <SiteFooter />
    </div>
  );
}
