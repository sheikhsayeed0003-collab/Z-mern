"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const catRes = await api<{ category: Category }>(`/api/categories/${slug}`);
        setCategory(catRes.category);
        const prodRes = await api<{ products: Product[] }>(
          `/api/products?category=${catRes.category._id}`
        );
        setProducts(prodRes.products);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      }
    }
    load();
  }, [slug]);

  return (
    <div className="mx-auto w-full px-3 py-10 lg:px-2.5">
      <h1 className="font-display text-3xl font-bold">
        {category?.name || "Category"}
      </h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2 lg:grid-cols-4 lg:gap-2.5">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      {!error && products.length === 0 && (
        <p className="mt-6 text-amer-muted">No products in this category yet.</p>
      )}
    </div>
  );
}
