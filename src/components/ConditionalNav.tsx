"use client";
import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = ["/learn", "/login", "/signup", "/admin"];

export default function ConditionalNav({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hide = HIDDEN_ROUTES.some((route) => pathname.startsWith(route));
  if (hide) return null;
  return <>{children}</>;
}
