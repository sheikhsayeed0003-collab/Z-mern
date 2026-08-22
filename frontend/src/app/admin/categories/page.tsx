"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const data = await api<{ categories: Category[] }>("/api/categories");
    setCategories(data.categories);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api("/api/categories", {
        method: "POST",
        token,
        body: JSON.stringify({ name, image }),
      });
      setName("");
      setImage("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const onDelete = async (id: string) => {
    await api(`/api/categories/${id}`, { method: "DELETE", token });
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Categories</h1>
      <form onSubmit={onSubmit} className="grid gap-3 border border-amer-line bg-white p-4 sm:grid-cols-[1fr_1fr_auto]">
        {error && <p className="sm:col-span-3 text-sm text-red-600">{error}</p>}
        <input
          required
          placeholder="Category name (e.g. Electronics)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-amer-line px-3 py-2 text-sm"
        />
        <input
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="rounded-md border border-amer-line px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-amer-orange px-4 py-2 text-sm font-bold text-white">
          Add
        </button>
      </form>
      <ul className="space-y-2">
        {categories.map((c) => (
          <li
            key={c._id}
            className="flex items-center justify-between border border-amer-line bg-white px-4 py-3"
          >
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-amer-muted">/{c.slug}</p>
            </div>
            <button
              type="button"
              onClick={() => onDelete(c._id)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
