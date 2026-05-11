import { Link, useRouterState } from "@tanstack/react-router";
import { Shield, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const links = [
  { to: "/", label: "Home" },
  { to: "/tentang", label: "Tentang" },
  { to: "/lapor", label: "Lapor Bullying" },
  { to: "/konsultasi", label: "Konsultasi BK" },
  { to: "/edukasi", label: "Edukasi" },
  { to: "/kontak", label: "Kontak" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, isApprovedStaff, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white shadow-soft">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-gradient-brand">SafeSchool</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                  path === l.to ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          {user && isApprovedStaff && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard"><LayoutDashboard className="mr-1 h-4 w-4" />Dashboard</Link>
            </Button>
          )}
          {user ? (
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="mr-1 h-4 w-4" />Keluar
            </Button>
          ) : (
            <Button asChild size="sm" className="gradient-brand text-white">
              <Link to="/login">Login Guru</Link>
            </Button>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden rounded-md p-2 hover:bg-muted"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t bg-background lg:hidden">
          <ul className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                    path === l.to ? "bg-brand-soft text-primary" : "text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              {user && isApprovedStaff && (
                <Link to="/dashboard" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
              )}
              {user ? (
                <Button onClick={signOut} variant="outline" size="sm" className="w-full">Keluar</Button>
              ) : (
                <Button asChild size="sm" className="w-full gradient-brand text-white">
                  <Link to="/login" onClick={() => setOpen(false)}>Login Guru</Link>
                </Button>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
