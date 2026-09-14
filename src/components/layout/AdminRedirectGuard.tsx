"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Keeps admins out of the customer-facing storefront.
 * If a logged-in admin ends up on any public/site page (landing,
 * categories, products, cart, etc.) or the login/signup pages,
 * this sends them straight to the admin dashboard instead.
 */
export default function AdminRedirectGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      router.replace("/admin");
    }
  }, [loading, user, router]);

  return null;
}