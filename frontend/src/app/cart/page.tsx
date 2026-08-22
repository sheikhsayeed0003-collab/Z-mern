"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { user, loading } = useAuth();
  const { items, updateQty, removeItem, subtotal } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-amer-muted">Loading...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <Link href="/" className="mt-4 inline-block text-amer-orange hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Cart</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 border border-amer-line bg-white p-3"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-amer-surface">
                <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{item.name}</p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <p className="font-bold text-amer-orange">${item.price.toFixed(2)}</p>
                <input
                  type="number"
                  min={1}
                  max={item.stock}
                  value={item.qty}
                  onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                  className="w-20 rounded-md border border-amer-line px-2 py-1 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
        <aside className="h-fit border border-amer-line bg-white p-4">
          <p className="text-sm text-amer-muted">Subtotal</p>
          <p className="mt-1 text-2xl font-bold text-amer-orange">${subtotal.toFixed(2)}</p>
          <Link
            href="/checkout"
            className="mt-4 block rounded-md bg-amer-orange py-2.5 text-center text-sm font-bold text-white hover:bg-amer-orange-dark"
          >
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
