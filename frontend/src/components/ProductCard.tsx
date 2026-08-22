"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";
import { productPrice } from "@/lib/types";

export const addToCartBtnClass =
  "inline-flex w-full items-center justify-center whitespace-nowrap rounded-md bg-amer-orange px-2 py-1.5 text-[11px] font-bold text-white transition hover:bg-amer-orange-dark disabled:cursor-not-allowed disabled:opacity-50";

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
      <Link
        href={`/product/${product._id}`}
        className="relative block aspect-[5/4] overflow-hidden bg-amer-surface sm:aspect-[4/3]"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 50vw, 25vw"
          unoptimized
        />
        {onSale && (
          <span className="absolute left-1.5 top-1.5 bg-amer-orange px-1.5 py-0.5 text-[10px] font-bold text-white">
            Flash
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-2">
        <Link
          href={`/product/${product._id}`}
          className="line-clamp-1 text-xs font-semibold text-amer-ink hover:text-amer-orange sm:text-sm"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex flex-col gap-1.5">
          <div className="flex items-baseline gap-1.5">
            <p className="text-sm font-bold text-amer-orange sm:text-base">${price.toFixed(2)}</p>
            {onSale && (
              <p className="text-[10px] text-amer-muted line-through sm:text-xs">${product.price.toFixed(2)}</p>
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
