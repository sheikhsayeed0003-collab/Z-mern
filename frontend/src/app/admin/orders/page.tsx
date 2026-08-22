"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    const data = await api<{ orders: Order[] }>("/api/orders", { token });
    setOrders(data.orders);
  };

  useEffect(() => {
    if (!token) return;
    load().catch((err) => setError(err.message));
  }, [token]);

  const updateStatus = async (id: string, orderStatus: string) => {
    await api(`/api/orders/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ orderStatus }),
    });
    await load();
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">Orders</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {orders.map((order) => {
        const buyer =
          typeof order.user === "object" && order.user
            ? `${order.user.firstName} ${order.user.lastName} (${order.user.email})`
            : "Customer";
        return (
          <div key={order._id} className="border border-amer-line bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">#{order._id.slice(-8)}</p>
                <p className="text-sm text-amer-muted">{buyer}</p>
                <p className="text-sm">
                  ${order.totalAmount.toFixed(2)} · {order.paymentMethod} · {order.paymentStatus}
                </p>
              </div>
              <select
                value={order.orderStatus}
                onChange={(e) => updateStatus(order._id, e.target.value)}
                className="rounded-md border border-amer-line px-3 py-2 text-sm"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-amer-muted">
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.name} × {item.qty}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {!error && orders.length === 0 && (
        <p className="text-sm text-amer-muted">No orders yet.</p>
      )}
    </div>
  );
}
