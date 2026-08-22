"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function DashboardHome() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="border border-amer-line bg-white p-6">
      <h1 className="font-display text-2xl font-bold">Welcome, {user.firstName}</h1>
      <p className="mt-2 text-amer-muted">
        Manage your orders, profile, and shipping addresses.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link href="/dashboard/orders" className="border border-amer-line p-4 hover:border-amer-orange">
          <p className="font-semibold">Order History</p>
          <p className="mt-1 text-sm text-amer-muted">Track past purchases</p>
        </Link>
        <Link href="/dashboard/profile" className="border border-amer-line p-4 hover:border-amer-orange">
          <p className="font-semibold">Edit Profile</p>
          <p className="mt-1 text-sm text-amer-muted">Update your details</p>
        </Link>
        <Link href="/dashboard/addresses" className="border border-amer-line p-4 hover:border-amer-orange">
          <p className="font-semibold">Addresses</p>
          <p className="mt-1 text-sm text-amer-muted">Shipping destinations</p>
        </Link>
      </div>
    </div>
  );
}
