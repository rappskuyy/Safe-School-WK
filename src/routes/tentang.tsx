import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Users, Heart, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang SafeSchool — Misi & Tim BK" },
      { name: "description", content: "Pelajari misi SafeSchool: menciptakan sekolah aman tanpa bullying lewat pelaporan, konsultasi BK, dan edukasi mental." },
    ],
  }),
  component: TentangPage,
});

function TentangPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-primary">Tentang Kami</span>
          <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            Setiap siswa berhak merasa <span className="text-gradient-brand">aman</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            SafeSchool dibangun bersama Guru BK untuk memutus rantai bullying di lingkungan sekolah,
            sekaligus memberi dukungan kesehatan mental yang mudah diakses semua siswa SMA.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "Tempat Aman", d: "Privasi siswa dijaga ketat. Identitas pelapor dirahasiakan." },
            { icon: Users, t: "Lapor Bullying", d: "Saluran resmi untuk melaporkan tindakan bullying di sekolah." },
            { icon: Heart, t: "Konsultasi BK", d: "Jadwal konsultasi 1-on-1 dengan Guru BK terlatih." },
            { icon: Lock, t: "Edukasi Mental", d: "Sumber belajar tentang mental health bagi remaja." },
          ].map((it, i) => (
            <Card key={i} className="p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl gradient-brand text-white">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{it.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{it.d}</p>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">Visi kami</h2>
            <p className="mt-3 text-muted-foreground">
              Menciptakan ekosistem sekolah di mana setiap siswa merasa dilihat, didengar, dan didukung.
              Kami percaya pencegahan bullying adalah tanggung jawab bersama: siswa, guru, dan keluarga.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold">Misi kami</h2>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>• Menyediakan saluran pelaporan yang aman dan anonim</li>
              <li>• Memudahkan akses ke layanan konsultasi BK</li>
              <li>• Mendidik siswa tentang kesehatan mental & empati</li>
              <li>• Membantu sekolah memantau & menindaklanjuti laporan</li>
            </ul>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
