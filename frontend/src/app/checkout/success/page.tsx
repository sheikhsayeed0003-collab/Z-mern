"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";

function SuccessInner() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const sessionId = params.get("session_id");
  const { token } = useAuth();
  const { clear } = useCart();
  const [status, setStatus] = useState("Confirming payment...");

  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    if (!orderId || !token) return;
    let cancelled = false;

    async function confirm() {
      try {
        await api(`/api/orders/${orderId}/confirm-stripe`, {
          method: "POST",
          token,
          body: JSON.stringify({ sessionId }),
        });
        if (!cancelled) setStatus("Payment confirmed. Your order is processing.");
      } catch {
        if (!cancelled) {
          setStatus(
            "Order received. Payment will update when Stripe webhook arrives."
          );
        }
      }
    }

    confirm();
    return () => {
      cancelled = true;
    };
  }, [orderId, sessionId, token]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold text-amer-orange">Order placed</h1>
      <p className="mt-3 text-amer-muted">
        {orderId ? `Order ID: ${orderId}` : "Thanks for shopping with IoT programmers."}
      </p>
      <p className="mt-2 text-sm text-amer-ink">{status}</p>
      <Link
        href="/dashboard/orders"
        className="mt-6 inline-block rounded-md bg-amer-ink px-4 py-2 text-sm font-bold text-white"
      >
        View orders
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
