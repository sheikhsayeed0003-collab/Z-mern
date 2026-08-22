"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export default function ProfilePage() {
  const { user, token, setUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const data = await api<{ user: User }>("/api/users/profile", {
        method: "PATCH",
        token,
        body: JSON.stringify(form),
      });
      setUser(data.user);
      setMessage("Profile updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-amer-line bg-white p-6">
      <h1 className="font-display text-2xl font-bold">Edit Profile</h1>
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {(["firstName", "lastName", "phone", "address"] as const).map((key) => (
        <label key={key} className="block text-sm capitalize">
          {key}
          <input
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="mt-1 w-full rounded-md border border-amer-line px-3 py-2"
            required
          />
        </label>
      ))}
      <p className="text-sm text-amer-muted">Email: {user.email} (cannot change)</p>
      <button
        type="submit"
        className="rounded-md bg-amer-orange px-4 py-2 text-sm font-bold text-white hover:bg-amer-orange-dark"
      >
        Save changes
      </button>
    </form>
  );
}
