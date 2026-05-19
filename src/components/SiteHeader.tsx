import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Menu, X, LogOut, LayoutDashboard, GraduationCap, Users, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTeacher, logoutTeacher } from "@/lib/teacher-auth";
import { signOutUser } from "@/lib/student-auth";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

const links = [
  { to: "/", label: "Home" },
  { to: "/tentang", label: "Tentang" },
  { to: "/lapor", label: "Lapor" },
  { to: "/konsultasi", label: "Konsultasi" },
  { to: "/edukasi", label: "Edukasi" },
  { to: "/cybersecurity", label: "Cyber Safety" },
  { to: "/kontak", label: "Kontak" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [teacher, setTeacher] = useState<ReturnType<typeof getTeacher>>(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setTeacher(getTeacher());
  }, [path]);

  const doLogoutTeacher = () => {
    logoutTeacher();
    setTeacher(null);
    toast.success("Sampai jumpa, Bu/Pak 👋", { description: "Sesi guru berhasil diakhiri dengan aman." });
    navigate({ to: "/" });
  };
  const doLogoutUser = async () => {
    await signOutUser();
    toast.success("Berhasil keluar 👋", { description: "Sesi kamu sudah ditutup. Sampai bertemu lagi!" });
    navigate({ to: "/" });
  };

  const dashboardLink =
    teacher ? "/dashboard" : profile?.role === "ortu" ? "/ortu" : profile?.role === "siswa" ? "/siswa" : null;
  const dashboardLabel =
    teacher ? "Dashboard Guru" : profile?.role === "ortu" ? "Dashboard Ortu" : "Dashboard Siswa";
  const isLoggedIn = teacher || user;

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <Logo />
          <div className="leading-tight">
            <div className="text-gradient-brand">SafeSchool</div>
            <div className="text-[10px] font-normal text-muted-foreground hidden sm:block">SMK Wikrama Bogor</div>
          </div>
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
          {user && (
            <li>
              <Link to="/leaderboard" className={`rounded-lg px-3 py-2 text-sm font-medium hover:text-primary ${path === "/leaderboard" ? "text-primary" : "text-muted-foreground"}`}>
                <Trophy className="mr-1 inline h-4 w-4" />Leaderboard
              </Link>
            </li>
          )}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          {isLoggedIn ? (
            <>
              {dashboardLink && (
                <Button asChild variant="ghost" size="sm">
                  <Link to={dashboardLink}>
                    <LayoutDashboard className="mr-1 h-4 w-4" />{dashboardLabel}
                  </Link>
                </Button>
              )}
              <Button onClick={teacher ? doLogoutTeacher : doLogoutUser} variant="outline" size="sm">
                <LogOut className="mr-1 h-4 w-4" />Keluar
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/register"><GraduationCap className="mr-1 h-4 w-4" />Daftar</Link>
              </Button>
              <Button asChild size="sm" className="gradient-brand text-white shadow-glow">
                <Link to="/login"><Users className="mr-1 h-4 w-4" />Masuk</Link>
              </Button>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="lg:hidden rounded-md p-2 hover:bg-muted" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t bg-background lg:hidden">
          <ul className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={() => setOpen(false)} className={`block rounded-lg px-3 py-2 text-sm font-medium ${path === l.to ? "bg-brand-soft text-primary" : "text-foreground"}`}>
                  {l.label}
                </Link>
              </li>
            ))}
            {user && (
              <li>
                <Link to="/leaderboard" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium">🏆 Leaderboard</Link>
              </li>
            )}
            <li className="pt-2 space-y-2">
              {isLoggedIn ? (
                <>
                  {dashboardLink && (
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to={dashboardLink} onClick={() => setOpen(false)}>{dashboardLabel}</Link>
                    </Button>
                  )}
                  <Button onClick={() => { teacher ? doLogoutTeacher() : doLogoutUser(); setOpen(false); }} variant="outline" size="sm" className="w-full">Keluar</Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/register" onClick={() => setOpen(false)}>Daftar</Link>
                  </Button>
                  <Button asChild size="sm" className="w-full gradient-brand text-white">
                    <Link to="/login" onClick={() => setOpen(false)}>Masuk</Link>
                  </Button>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
