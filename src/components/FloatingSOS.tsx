import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Phone, MessageCircleHeart, FileWarning, X, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingSOS() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
      {open && (
        <div className="animate-fade-in flex w-64 flex-col gap-2 rounded-2xl border bg-card/95 p-3 shadow-glow backdrop-blur">
          <a href="tel:08111100200">
            <Button variant="destructive" size="sm" className="w-full justify-start">
              <Phone className="mr-2 h-4 w-4" /> Hotline BK 24/7
            </Button>
          </a>
          <Link to="/lapor">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <FileWarning className="mr-2 h-4 w-4" /> Lapor Anonim
            </Button>
          </Link>
          <Link to="/konsultasi">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <MessageCircleHeart className="mr-2 h-4 w-4" /> Konsultasi BK
            </Button>
          </Link>
          <p className="px-1 pt-1 text-[11px] text-muted-foreground">
            Kamu tidak sendiri 💜 BK siap dengar.
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Tombol SOS"
        className="group relative grid h-14 w-14 place-items-center rounded-full gradient-brand text-white shadow-glow transition hover:scale-110 sm:h-16 sm:w-16"
      >
        <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
        {open ? <X className="relative h-6 w-6" /> : <LifeBuoy className="relative h-7 w-7" />}
      </button>
    </div>
  );
}
