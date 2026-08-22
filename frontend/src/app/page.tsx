"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flash, setFlash] = useState<Product[]>([]);
  const [popular, setPopular] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function load() {
      attempts += 1;
      try {
        const [cats, flashSale, popularItems] = await Promise.all([
          api<{ categories: Category[] }>("/api/categories"),
          api<{ products: Product[] }>("/api/products?flash=true"),
          api<{ products: Product[] }>("/api/products?popular=true"),
        ]);
        if (cancelled) return;
        setCategories(cats.categories);
        setFlash(flashSale.products);
        setPopular(popularItems.products);
        setError("");
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load";
        setError(message);
        // Backend may still be starting — retry a few times
        if (attempts < 5) {
          setTimeout(load, 1500 * attempts);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <HeroSlider />

      <div className="mx-auto w-full space-y-8 px-3 py-8 sm:space-y-10 sm:py-10 lg:px-2.5">
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}. Start the API (`cd backend && npm run dev`) and seed data (`npm run seed`).
          </p>
        )}

        <section className="animate-fade-up">
          <div className="mb-3 flex items-end justify-between sm:mb-4">
            <h2 className="font-display text-2xl font-bold">Categories</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2 lg:gap-2.5">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/category/${cat.slug}`}
                className="group relative overflow-hidden border border-amer-line bg-white"
              >
                <div className="relative aspect-[4/3] sm:aspect-[5/4]">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full bg-amer-surface" />
                  )}
                  <div className="absolute inset-0 bg-black/35" />
                  <p className="absolute inset-x-0 bottom-2 text-center text-sm font-bold text-white sm:bottom-3">
                    {cat.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between sm:mb-4">
            <h2 className="font-display text-2xl font-bold text-amer-orange">Flash Sale</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2 lg:grid-cols-4 lg:gap-2.5">
            {flash.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between sm:mb-4">
            <h2 className="font-display text-2xl font-bold">Popular Products</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2 lg:grid-cols-4 lg:gap-2.5">
            {popular.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
