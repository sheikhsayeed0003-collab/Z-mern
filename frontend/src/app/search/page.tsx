"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!q) {
      setProducts([]);
      return;
    }
    api<{ products: Product[] }>(`/api/products?q=${encodeURIComponent(q)}`)
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message));
  }, [q]);

  return (
    <div className="mx-auto w-full px-3 py-10 lg:px-2.5">
      <h1 className="font-display text-3xl font-bold">Search: {q || "—"}</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2 lg:grid-cols-4 lg:gap-2.5">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      {!error && q && products.length === 0 && (
        <p className="mt-6 text-amer-muted">No products matched your search.</p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="px-4 py-10">Loading...</p>}>
      <SearchResults />
    </Suspense>
  );
}
