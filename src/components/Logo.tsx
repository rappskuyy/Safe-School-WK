import { Shield } from "lucide-react";
import { useState } from "react";

/**
 * Logo SMK Wikrama Bogor.
 * Letakkan file gambarmu di: public/logo-wikrama.png
 * (akan otomatis dipakai. Kalau tidak ada / gagal load, fallback ke ikon perisai.)
 */
export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className={`grid place-items-center rounded-xl gradient-brand text-white shadow-soft ${className}`}>
        <Shield className="h-5 w-5" />
      </div>
    );
  }
  return (
    <img
      src="/logo-wikrama.png"
      alt="Logo SMK Wikrama Bogor"
      onError={() => setErr(true)}
      className={`${className} rounded-xl object-contain bg-white p-1 shadow-soft`}
    />
  );
}
