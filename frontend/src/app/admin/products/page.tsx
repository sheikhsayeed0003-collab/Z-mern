"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  stock: "",
  isFlashSale: false,
  flashSalePrice: "",
  isPopular: false,
};

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    const [p, c] = await Promise.all([
      api<{ products: Product[] }>("/api/products"),
      api<{ categories: Category[] }>("/api/categories"),
    ]);
    setProducts(p.products);
    setCategories(c.categories);
    if (!form.category && c.categories[0]) {
      setForm((f) => ({ ...f, category: c.categories[0]._id }));
    }
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      image: form.image,
      stock: Number(form.stock),
      isFlashSale: form.isFlashSale,
      flashSalePrice: form.flashSalePrice ? Number(form.flashSalePrice) : undefined,
      isPopular: form.isPopular,
    };
    try {
      if (editingId) {
        await api(`/api/products/${editingId}`, {
          method: "PUT",
          token,
          body: JSON.stringify(payload),
        });
      } else {
        await api("/api/products", {
          method: "POST",
          token,
          body: JSON.stringify(payload),
        });
      }
      setForm({ ...emptyForm, category: categories[0]?._id || "" });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const onEdit = (product: Product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: typeof product.category === "object" ? product.category._id : product.category,
      image: product.image,
      stock: String(product.stock),
      isFlashSale: Boolean(product.isFlashSale),
      flashSalePrice: product.flashSalePrice != null ? String(product.flashSalePrice) : "",
      isPopular: Boolean(product.isPopular),
    });
  };

  const onDelete = async (id: string) => {
    await api(`/api/products/${id}`, { method: "DELETE", token });
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Products</h1>
      <form onSubmit={onSubmit} className="grid gap-3 border border-amer-line bg-white p-4 sm:grid-cols-2">
        {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="rounded-md border border-amer-line px-3 py-2 text-sm"
        />
        <select
          required
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="rounded-md border border-amer-line px-3 py-2 text-sm"
        >
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          required
          type="number"
          step="0.01"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          className="rounded-md border border-amer-line px-3 py-2 text-sm"
        />
        <input
          required
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          className="rounded-md border border-amer-line px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
          className="sm:col-span-2 rounded-md border border-amer-line px-3 py-2 text-sm"
        />
        <textarea
          required
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="sm:col-span-2 rounded-md border border-amer-line px-3 py-2 text-sm"
          rows={3}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isFlashSale}
            onChange={(e) => setForm((f) => ({ ...f, isFlashSale: e.target.checked }))}
          />
          Flash sale
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="Flash sale price"
          value={form.flashSalePrice}
          onChange={(e) => setForm((f) => ({ ...f, flashSalePrice: e.target.value }))}
          className="rounded-md border border-amer-line px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isPopular}
            onChange={(e) => setForm((f) => ({ ...f, isPopular: e.target.checked }))}
          />
          Popular product
        </label>
        <button
          type="submit"
          className="sm:col-span-2 rounded-md bg-amer-orange py-2 text-sm font-bold text-white"
        >
          {editingId ? "Update product" : "Add product"}
        </button>
      </form>

      <div className="overflow-x-auto border border-amer-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-amer-surface">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t border-amer-line">
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">${p.price.toFixed(2)}</td>
                <td className="px-3 py-2">{p.stock}</td>
                <td className="px-3 py-2 space-x-2">
                  <button type="button" onClick={() => onEdit(p)} className="text-amer-orange hover:underline">
                    Edit
                  </button>
                  <button type="button" onClick={() => onDelete(p._id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
