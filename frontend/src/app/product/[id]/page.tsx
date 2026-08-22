"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { addToCartBtnClass } from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { productPrice } from "@/lib/types";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ product: Product }>(`/api/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-red-600">{error}</p>;
  }
  if (!product) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-amer-muted">Loading...</p>;
  }

  const price = productPrice(product);
  const categoryName =
    typeof product.category === "object" ? product.category.name : "";

  const onAdd = () => {
    if (!user) {
      router.push(`/login?redirect=/product/${product._id}&msg=account`);
      return;
    }
    addItem(product, qty);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden border border-amer-line bg-amer-surface">
        <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
      </div>
      <div className="animate-fade-up">
        <p className="text-sm font-semibold uppercase tracking-wide text-amer-orange">
          {categoryName}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">{product.name}</h1>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-amer-orange">${price.toFixed(2)}</span>
          {product.isFlashSale && product.flashSalePrice != null && (
            <span className="text-amer-muted line-through">${product.price.toFixed(2)}</span>
          )}
        </div>
        <p className="mt-4 text-amer-muted">{product.description}</p>
        <p className="mt-3 text-sm">
          Stock: <strong>{product.stock}</strong>
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            type="number"
            min={1}
            max={product.stock}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full rounded-md border border-amer-line px-3 py-2.5 sm:w-20 sm:py-2"
          />
          <button
            type="button"
            disabled={product.stock < 1}
            onClick={onAdd}
            className={addToCartBtnClass}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
