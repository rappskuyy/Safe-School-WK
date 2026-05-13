import { Shield } from "lucide-react";
import { useState } from "react";

/**
 * Logo SMK Wikrama Bogor — tampil dalam bingkai bulat rapi.
 * File gambar: public/logo-wikrama.png
 */
export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className={`${className} relative shrink-0 grid place-items-center overflow-hidden rounded-full bg-white ring-2 ring-primary/20 shadow-soft`}
    >
      {err ? (
        <Shield className="h-1/2 w-1/2 text-primary" />
      ) : (
        <img
          src="/logo-wikrama.png"
          alt="Logo SMK Wikrama Bogor"
          onError={() => setErr(true)}
          className="h-full w-full object-cover"
          loading="eager"
        />
      )}
    </div>
  );
}
