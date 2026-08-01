"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getPageList(current: number, total: number, siblingCount = 1): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total]);
  for (let i = current - siblingCount; i <= current + siblingCount; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = getPageList(currentPage, totalPages);

  return (
    <div className="mt-6 flex items-center justify-end gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={`dots-${idx}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-gray-400"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
              currentPage === page ? "bg-red-600 text-white" : "border border-gray-200 text-black"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}