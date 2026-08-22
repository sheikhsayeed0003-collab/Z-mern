"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { ShippingAddress } from "@/lib/types";

export default function AddressesPage() {
  const { user, token, setUser, refreshUser } = useAuth();
  const [form, setForm] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    isDefault: false,
  });
  const [error, setError] = useState("");

  if (!user) return null;

  const syncUser = async (addresses: ShippingAddress[]) => {
    setUser({ ...user, shippingAddresses: addresses });
    await refreshUser();
  };

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api<{ addresses: ShippingAddress[] }>("/api/users/addresses", {
        method: "POST",
        token,
        body: JSON.stringify(form),
      });
      await syncUser(data.addresses);
      setForm({
        label: "Home",
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        isDefault: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add address");
    }
  };

  const onDelete = async (id?: string) => {
    if (!id) return;
    const data = await api<{ addresses: ShippingAddress[] }>(
      `/api/users/addresses/${id}`,
      { method: "DELETE", token }
    );
    await syncUser(data.addresses);
  };

  const setDefault = async (id?: string) => {
    if (!id) return;
    const data = await api<{ addresses: ShippingAddress[] }>(
      `/api/users/addresses/${id}`,
      { method: "PATCH", token, body: JSON.stringify({ isDefault: true }) }
    );
    await syncUser(data.addresses);
  };

  return (
    <div className="space-y-6">
      <div className="border border-amer-line bg-white p-6">
        <h1 className="font-display text-2xl font-bold">Shipping Addresses</h1>
        <div className="mt-4 space-y-3">
          {user.shippingAddresses?.length ? (
            user.shippingAddresses.map((addr) => (
              <div key={addr._id} className="border border-amer-line p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {addr.label} {addr.isDefault ? "(Default)" : ""}
                    </p>
                    <p className="text-sm text-amer-muted">
                      {addr.fullName} · {addr.phone}
                    </p>
                    <p className="text-sm">
                      {addr.addressLine}
                      {addr.city ? `, ${addr.city}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefault(addr._id)}
                        className="text-amer-orange hover:underline"
                      >
                        Set default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(addr._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-amer-muted">No saved addresses yet.</p>
          )}
        </div>
      </div>

      <form onSubmit={onAdd} className="space-y-3 border border-amer-line bg-white p-6">
        <h2 className="font-display text-xl font-bold">Add address</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {(["label", "fullName", "phone", "addressLine", "city"] as const).map((key) => (
          <label key={key} className="block text-sm capitalize">
            {key === "addressLine" ? "Address" : key}
            <input
              required={key !== "city" && key !== "label"}
              value={form[key] as string}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="mt-1 w-full rounded-md border border-amer-line px-3 py-2"
            />
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
          />
          Set as default
        </label>
        <button
          type="submit"
          className="rounded-md bg-amer-orange px-4 py-2 text-sm font-bold text-white"
        >
          Add address
        </button>
      </form>
    </div>
  );
}
