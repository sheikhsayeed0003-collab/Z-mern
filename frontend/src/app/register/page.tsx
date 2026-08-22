"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "";
  const needAccount = params.get("msg") === "account";
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      if (redirect && redirect.startsWith("/")) {
        router.push(redirect);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-display text-3xl font-bold">Create account</h1>
      {needAccount && (
        <p className="mt-2 rounded-md border border-amer-line bg-amer-surface px-3 py-2 text-sm">
          Cart ব্যবহার করতে আগে অ্যাকাউন্ট খুলুন।
        </p>
      )}
      <form
        onSubmit={onSubmit}
        className="mt-6 grid gap-4 border border-amer-line bg-white p-5 sm:grid-cols-2"
      >
        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
        {(
          [
            ["firstName", "First Name"],
            ["lastName", "Last Name"],
            ["phone", "Phone Number"],
            ["email", "Email"],
            ["address", "Home Address"],
            ["password", "Password"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className={`block text-sm ${key === "address" ? "sm:col-span-2" : ""}`}
          >
            {label}
            <input
              type={key === "password" ? "password" : key === "email" ? "email" : "text"}
              required
              minLength={key === "password" ? 6 : undefined}
              value={form[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className="mt-1 w-full rounded-md border border-amer-line px-3 py-2"
            />
          </label>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-amer-orange py-2.5 text-sm font-bold text-white hover:bg-amer-orange-dark disabled:opacity-60 sm:col-span-2"
        >
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link
          href={`/login${needAccount ? "?msg=account" : ""}`}
          className="font-semibold text-amer-orange hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<p className="px-4 py-10">Loading...</p>}>
      <RegisterForm />
    </Suspense>
  );
}
