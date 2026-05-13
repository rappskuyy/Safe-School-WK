import { Mail, Phone, MapPin, Instagram, Globe, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-card">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 font-display text-lg font-bold">
            <Logo className="h-11 w-11" />
            <div className="leading-tight">
              <div className="text-gradient-brand">SafeSchool</div>
              <div className="text-[11px] font-normal text-muted-foreground">SMK Wikrama Bogor</div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Platform resmi pelaporan bullying, konsultasi BK, dan pemantauan progres siswa
            SMK Wikrama Bogor.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Terlindungi & rahasia
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Halaman</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/tentang" className="hover:text-primary">Tentang</Link></li>
            <li><Link to="/lapor" className="hover:text-primary">Lapor Bullying</Link></li>
            <li><Link to="/konsultasi" className="hover:text-primary">Konsultasi BK</Link></li>
            <li><Link to="/edukasi" className="hover:text-primary">Edukasi</Link></li>
            <li><Link to="/kontak" className="hover:text-primary">Kontak</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Kontak Darurat</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>BK 24 jam: <strong>0811-1100-200</strong></span></li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />bk@smkwikrama-bogor.sch.id</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Jl. Raya Wangun No.40, Bogor Timur</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Sosial</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Instagram className="h-4 w-4 text-primary" />@smkwikramabogor</li>
            <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />smkwikrama-bogor.sch.id</li>
          </ul>
          <div className="mt-4 rounded-xl border bg-background p-3 text-xs">
            <div className="font-semibold text-destructive">⚠️ Darurat?</div>
            <div className="text-muted-foreground">Hubungi 119 (kesehatan) atau 110 (polisi).</div>
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SafeSchool · SMK Wikrama Bogor — Sekolah aman tanpa bullying 💜
      </div>
    </footer>
  );
}
