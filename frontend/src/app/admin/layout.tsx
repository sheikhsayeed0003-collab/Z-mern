"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (user.role !== "admin") router.push("/dashboard");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "admin") {
    return <p className="px-4 py-10">Loading admin...</p>;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit border border-amer-ink bg-amer-ink p-4 text-white">
        <p className="font-display text-lg font-bold text-amer-orange">Admin Panel</p>
        <nav className="mt-4 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                pathname === link.href ? "bg-amer-orange text-white" : "hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
