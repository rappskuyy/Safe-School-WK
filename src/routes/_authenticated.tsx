import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: Layout,
});

function Layout() {
  const { user, loading, isApprovedStaff } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (!isApprovedStaff) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-soft/30 px-4">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-soft">
          <h1 className="font-display text-2xl font-bold">Menunggu persetujuan admin</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Akun kamu sudah terdaftar, tetapi belum disetujui sebagai Guru BK. Hubungi admin sekolah agar
            akses ke laporan siswa diaktifkan.
          </p>
        </div>
      </div>
    );
  }
  return <Outlet />;
}
