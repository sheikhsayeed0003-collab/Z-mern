"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api<{ users: User[] }>("/api/admin/users", { token })
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Registered Users</h1>
      <p className="mt-2 text-sm text-amer-muted">{users.length} users</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 overflow-x-auto border border-amer-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-amer-surface">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Address</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-amer-line">
                <td className="px-3 py-2">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.phone}</td>
                <td className="px-3 py-2">{u.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
