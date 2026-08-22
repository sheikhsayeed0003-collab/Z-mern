"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import type { Order, ShippingAddress } from "@/lib/types";

export default function CheckoutPage() {
  const { user, token, loading } = useAuth();
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "stripe">("cod");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const defaultAddress = useMemo(() => {
    const list = user?.shippingAddresses || [];
    return list.find((a) => a.isDefault) || list[0];
  }, [user]);

  const [ship, setShip] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (defaultAddress) {
      setShip({
        fullName: defaultAddress.fullName,
        phone: defaultAddress.phone,
        addressLine: defaultAddress.addressLine,
        city: defaultAddress.city || "",
      });
    } else if (user) {
      setShip({
        fullName: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        addressLine: user.address,
        city: "",
      });
    }
  }, [defaultAddress, user]);

  if (loading) return <p className="px-4 py-10">Loading...</p>;
  if (!user) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Nothing to checkout</h1>
        <Link href="/" className="mt-4 inline-block text-amer-orange hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const data = await api<{ order: Order; checkoutUrl?: string }>(
        "/api/orders/checkout",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
            shippingAddress: ship as ShippingAddress,
            paymentMethod,
          }),
        }
      );
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      clear();
      router.push(`/checkout/success?orderId=${data.order._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Checkout</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 border border-amer-line bg-white p-5">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <p className="text-sm text-amer-muted">Total: <strong className="text-amer-orange">${subtotal.toFixed(2)}</strong></p>
        {(["fullName", "phone", "addressLine", "city"] as const).map((key) => (
          <label key={key} className="block text-sm capitalize">
            {key === "addressLine" ? "Address" : key}
            <input
              required={key !== "city"}
              value={ship[key]}
              onChange={(e) => setShip((s) => ({ ...s, [key]: e.target.value }))}
              className="mt-1 w-full rounded-md border border-amer-line px-3 py-2"
            />
          </label>
        ))}
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Payment</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            Cash on Delivery
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={paymentMethod === "stripe"}
              onChange={() => setPaymentMethod("stripe")}
            />
            Stripe Card (needs STRIPE_SECRET_KEY)
          </label>
        </fieldset>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-amer-orange py-2.5 text-sm font-bold text-white hover:bg-amer-orange-dark disabled:opacity-60"
        >
          {submitting ? "Placing order..." : "Place order"}
        </button>
      </form>
    </div>
  );
}
