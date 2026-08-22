"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";
import { productPrice } from "@/lib/types";

export const addToCartBtnClass =
  "inline-flex w-full items-center justify-center whitespace-nowrap rounded-md bg-amer-orange px-3 py-2.5 text-xs font-bold text-white transition hover:bg-amer-orange-dark disabled:cursor-not-allowed disabled:opacity-50";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const price = productPrice(product);
  const onSale = product.isFlashSale && product.flashSalePrice != null;

  const onAdd = () => {
    if (!user) {
      router.push(`/login?redirect=/product/${product._id}&msg=account`);
      return;
    }
    addItem(product);
  };

  return (
    <article className="group flex flex-col overflow-hidden border border-amer-line bg-white transition hover:-translate-y-0.5 hover:border-amer-orange/50 hover:shadow-[0_12px_30px_rgba(245,114,36,0.12)]">
      <Link href={`/product/${product._id}`} className="relative block aspect-square overflow-hidden bg-amer-surface">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 50vw, 25vw"
          unoptimized
        />
        {onSale && (
          <span className="absolute left-2 top-2 bg-amer-orange px-2 py-0.5 text-xs font-bold text-white">
            Flash
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/product/${product._id}`} className="line-clamp-2 text-sm font-semibold text-amer-ink hover:text-amer-orange">
          {product.name}
        </Link>
        <div className="mt-auto flex flex-col gap-2">
          <div>
            <p className="text-lg font-bold text-amer-orange">${price.toFixed(2)}</p>
            {onSale && (
              <p className="text-xs text-amer-muted line-through">${product.price.toFixed(2)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onAdd}
            disabled={product.stock < 1}
            className={addToCartBtnClass}
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
