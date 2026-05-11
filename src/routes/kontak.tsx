import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/kontak")({
  head: () => ({
    meta: [
      { title: "Kontak — SafeSchool" },
      { name: "description", content: "Hubungi tim BK SafeSchool untuk bantuan cepat." },
    ],
  }),
  component: KontakPage,
});

function KontakPage() {
  const items = [
    { icon: Mail, t: "Email", d: "bk@safeschool.sch.id" },
    { icon: Phone, t: "Telepon", d: "(021) 123-4567" },
    { icon: MapPin, t: "Lokasi", d: "Ruang BK, Lantai 2" },
    { icon: Clock, t: "Jam Layanan", d: "Senin–Jumat 07.30–15.00" },
  ];
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold md:text-5xl">Hubungi <span className="text-gradient-brand">Kami</span></h1>
          <p className="mt-3 text-muted-foreground">Kalau butuh bantuan cepat, jangan ragu hubungi tim BK kami.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
          {items.map((it, i) => (
            <Card key={i} className="flex items-start gap-4 p-6">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-brand text-white">
                <it.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{it.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{it.d}</p>
              </div>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
