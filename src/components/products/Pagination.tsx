"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(pathname + "?" + params.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const showAllNumbers = totalPages <= 7;

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full border border-brass/30 px-3 py-1.5 text-sm text-ink disabled:opacity-30"
      >
        Prev
      </button>

      {showAllNumbers ? (
        // just show a button for every page
        Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={
                "h-8 w-8 rounded-full text-sm " +
                (page === currentPage
                  ? "bg-ink text-cream"
                  : "text-ink/70 hover:bg-brass/10")
              }
            >
              {page}
            </button>
          );
        })
      ) : (
      
        <span className="px-3 text-sm text-ink/70">
          Page {currentPage} of {totalPages}
        </span>
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full border border-brass/30 px-3 py-1.5 text-sm text-ink disabled:opacity-30"
      >
        Next
      </button>
    </div>
  );
}