import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold">Payment cancelled</h1>
      <p className="mt-3 text-amer-muted">You can try checkout again anytime.</p>
      <Link href="/cart" className="mt-6 inline-block text-amer-orange hover:underline">
        Back to cart
      </Link>
    </div>
  );
}
