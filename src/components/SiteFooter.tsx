import { Shield, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-card">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <div className="grid h-8 w-8 place-items-center rounded-lg gradient-brand text-white">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-gradient-brand">SafeSchool</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Ruang aman untuk siswa SMA melaporkan bullying dan berkonsultasi dengan Guru BK.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Halaman</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/tentang" className="hover:text-primary">Tentang</Link></li>
            <li><Link to="/lapor" className="hover:text-primary">Lapor Bullying</Link></li>
            <li><Link to="/konsultasi" className="hover:text-primary">Konsultasi BK</Link></li>
            <li><Link to="/edukasi" className="hover:text-primary">Edukasi</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Kontak Darurat</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" />bk@safeschool.sch.id</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" />(021) 123-4567</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />Ruang BK, Lantai 2</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © 2026 SafeSchool — Sekolah aman tanpa bullying 💜
      </div>
    </footer>
  );
}
