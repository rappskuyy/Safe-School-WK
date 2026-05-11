import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getTeacher } from "@/lib/teacher-auth";

export const Route = createFileRoute("/_authenticated")({
  component: Layout,
});

function Layout() {
  // Cek login guru dari localStorage (login manual di kode)
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setOk(!!getTeacher());
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!ok) return <Navigate to="/login" />;
  return <Outlet />;
}
