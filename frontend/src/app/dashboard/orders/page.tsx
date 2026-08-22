"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api<{ orders: Order[] }>("/api/orders/mine", { token })
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <div className="border border-amer-line bg-white p-6">
      <h1 className="font-display text-2xl font-bold">Order History</h1>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 space-y-3">
        {orders.map((order) => (
          <div key={order._id} className="border border-amer-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">#{order._id.slice(-8)}</p>
              <p className="text-sm capitalize text-amer-orange">{order.orderStatus}</p>
            </div>
            <p className="mt-1 text-sm text-amer-muted">
              {new Date(order.createdAt).toLocaleString()} · {order.paymentMethod.toUpperCase()} ·{" "}
              {order.paymentStatus}
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {order.items.map((item, idx) => (
                <li key={`${order._id}-${idx}`}>
                  {item.name} × {item.qty} — ${(item.price * item.qty).toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="mt-2 font-bold text-amer-orange">
              Total ${order.totalAmount.toFixed(2)}
            </p>
          </div>
        ))}
        {!error && orders.length === 0 && (
          <p className="text-sm text-amer-muted">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
