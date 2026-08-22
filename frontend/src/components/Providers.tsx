"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}
