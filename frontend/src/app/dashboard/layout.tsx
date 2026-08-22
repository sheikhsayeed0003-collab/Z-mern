"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/addresses", label: "Addresses" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="px-4 py-10">Loading...</p>;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit border border-amer-line bg-white p-4">
        <p className="font-display text-lg font-bold">My Account</p>
        <p className="mt-1 text-sm text-amer-muted">
          {user.firstName} {user.lastName}
        </p>
        <nav className="mt-4 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                pathname === link.href
                  ? "bg-amer-orange text-white"
                  : "hover:bg-amer-surface"
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
