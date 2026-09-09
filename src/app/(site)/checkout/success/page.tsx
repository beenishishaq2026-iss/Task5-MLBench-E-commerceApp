"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LoadingState from "@/components/ui/LoadingState";

interface SessionOrder {
  _id: string;
  totalPrice: number;
  shippingAddress: {
    fullName: string;
  };
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [status, setStatus] = useState<"checking" | "paid" | "unpaid" | "error">("checking");
  const [order, setOrder] = useState<SessionOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function confirmSession() {
      if (!sessionId) {
        setStatus("error");
        setErrorMsg("Missing checkout session.");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/payments/session/${sessionId}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Could not verify payment");
        }

        setOrder(data.order);
        setStatus(data.isPaid ? "paid" : "unpaid");
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      }
    }

    if (user) {
      confirmSession();
    }
  }, [sessionId, user]);

  if (authLoading || status === "checking") {
    return <LoadingState message="Verifying your payment..." />;
  }

  if (!user) {
    return null;
  }

  if (status === "error" || status === "unpaid") {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-full animate-fade-up rounded-2xl border border-brass/20 bg-white p-10 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rust/10">
            <XCircle className="h-9 w-9 text-rust" strokeWidth={1.75} />
          </div>

          <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl italic text-ink">
            {status === "unpaid" ? "Payment not confirmed yet" : "We couldn't verify that"}
          </h1>

          <p className="mt-3 text-sm text-ink/60">
            {status === "unpaid"
              ? "Your payment hasn't gone through. If you completed checkout, this can take a few seconds — try refreshing."
              : errorMsg || "Something went wrong confirming your payment."}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {order && (
              <Link
                href={`/orders/${order._id}`}
                className="flex-1 rounded-full bg-rust px-6 py-3 text-sm font-semibold text-white hover:bg-rust-dark"
              >
                View Order
              </Link>
            )}
            <Link
              href="/"
              className="flex-1 rounded-full border border-brass/30 px-6 py-3 text-sm font-semibold text-ink hover:bg-cream"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-full animate-fade-up rounded-2xl border border-brass/20 bg-white p-10 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rust/10">
          <CheckCircle2 className="h-9 w-9 text-rust" strokeWidth={1.75} />
        </div>

        <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl italic text-ink">
          Payment Successful!
        </h1>

        <p className="mt-3 text-sm text-ink/60">
          Thank you for your order. Your payment has been successfully verified and your order
          has been created.
        </p>
        <p className="mt-1 text-xs text-ink/40">
          We&apos;ll process your order and keep you updated.
        </p>

        {order && (
          <>
            <div className="divider-signature mt-6">
              <span className="dot" />
            </div>

            <div className="mt-6 flex justify-between text-sm text-ink/70">
              <span>Order total</span>
              <span className="font-semibold text-ink">${order.totalPrice.toFixed(2)}</span>
            </div>
          </>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/products"
            className="flex-1 rounded-full bg-rust px-6 py-3 text-sm font-semibold text-white hover:bg-rust-dark"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-full border border-brass/30 px-6 py-3 text-sm font-semibold text-ink hover:bg-cream"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}