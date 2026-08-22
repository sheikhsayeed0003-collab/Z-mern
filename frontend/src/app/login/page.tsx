"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "";
  const needAccount = params.get("msg") === "account";
  const [email, setEmail] = useState("buyer@amer.com");
  const [password, setPassword] = useState("Buyer123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      if (redirect && redirect.startsWith("/")) {
        router.push(redirect);
      } else {
        router.push(user.role === "admin" ? "/admin" : "/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const registerHref = needAccount
    ? `/register?msg=account${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ""}`
    : "/register";

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-3xl font-bold">Login</h1>
      {needAccount ? (
        <p className="mt-2 rounded-md border border-amer-line bg-amer-surface px-3 py-2 text-sm text-amer-ink">
          Cart-এ প্রোডাক্ট অ্যাড করতে অ্যাকাউন্ট লাগবে — Login করুন অথবা{" "}
          <Link href={registerHref} className="font-semibold text-amer-orange hover:underline">
            Register
          </Link>{" "}
          করে নতুন অ্যাকাউন্ট খুলুন।
        </p>
      ) : (
        <p className="mt-2 text-sm text-amer-muted">
          Demo buyer: buyer@amer.com / Buyer123! · Admin: admin@amer.com / Admin123!
        </p>
      )}
      <form onSubmit={onSubmit} className="mt-6 space-y-4 border border-amer-line bg-white p-5">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-amer-line px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-amer-line px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-amer-orange py-2.5 text-sm font-bold text-white hover:bg-amer-orange-dark disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        No account?{" "}
        <Link href={registerHref} className="font-semibold text-amer-orange hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="px-4 py-10">Loading...</p>}>
      <LoginForm />
    </Suspense>
  );
}
