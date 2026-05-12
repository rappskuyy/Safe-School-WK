import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_user")({
  component: UserLayout,
});

function UserLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Memuat...</div>;
  if (!user) return <Navigate to="/login" />;
  return <Outlet />;
}
