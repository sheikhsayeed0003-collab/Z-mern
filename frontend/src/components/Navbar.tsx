"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

function ProfileIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM4 20.5C4 16.91 7.58 14 12 14s8 2.91 8 6.5a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/");
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-amer-line/80 bg-[#f57224] text-white shadow-md">
        <div className="mx-auto flex h-16 w-full items-center gap-2 px-2.5 sm:h-[4.5rem] sm:gap-4">
          <Link
            href="/"
            aria-label="IoT programmers home"
            className="flex shrink-0 items-center"
          >
            <img
              src="/iot-logo.svg"
              alt="IoT programmers"
              className="h-10 w-10 sm:hidden"
              width={40}
              height={40}
            />
            <span className="hidden font-display text-xl font-extrabold tracking-tight whitespace-nowrap sm:inline md:text-2xl">
              IoT<span className="text-black/80"> programmers</span>
            </span>
          </Link>

          <form
            onSubmit={onSearch}
            className="relative flex min-w-0 flex-1 items-center"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="h-10 w-full min-w-0 rounded-md border-0 bg-white py-2 pr-11 pl-3 text-sm text-amer-ink outline-none ring-2 ring-transparent focus:ring-black/20 sm:h-11"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-amer-ink transition hover:bg-black/5 sm:right-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </form>

          <nav className="flex shrink-0 items-center gap-1.5 text-xs font-semibold sm:gap-3 sm:text-sm">
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-md bg-black/20 px-2.5 py-2 hover:bg-black/30"
              >
                Admin
              </Link>
            )}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  title={`${user.firstName} ${user.lastName}`}
                  aria-label="Profile"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30 sm:h-10 sm:w-10"
                >
                  <ProfileIcon />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-md bg-black/15 px-2.5 py-2 hover:bg-black/25"
                >
                  Logout
                </button>
                <Link
                  href="/cart"
                  className="rounded-md bg-white px-2.5 py-2 text-amer-orange hover:bg-amer-surface sm:px-3"
                >
                  Cart{count > 0 ? ` (${count})` : ""}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md bg-black/15 px-2.5 py-2 hover:bg-black/25"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-amer-ink px-2.5 py-2 text-white hover:bg-black"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {/* Spacer so content is not hidden under fixed navbar */}
      <div className="h-16 sm:h-[4.5rem]" aria-hidden="true" />
    </>
  );
}
