"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

type Stats = {
  users: number;
  products: number;
  orders: number;
  categories: number;
  revenue: number;
};

export default function AdminHome() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!token) return;
    api<{ stats: Stats }>("/api/admin/stats", { token }).then((data) =>
      setStats(data.stats)
    );
  }, [token]);

  const cards = [
    { label: "Users", value: stats?.users ?? "—" },
    { label: "Products", value: stats?.products ?? "—" },
    { label: "Orders", value: stats?.orders ?? "—" },
    { label: "Categories", value: stats?.categories ?? "—" },
    { label: "Revenue", value: stats ? `$${stats.revenue.toFixed(2)}` : "—" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-amer-muted">Full control of IoT programmers catalog and orders.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="border border-amer-line bg-white p-5">
            <p className="text-sm text-amer-muted">{card.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-amer-orange">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
