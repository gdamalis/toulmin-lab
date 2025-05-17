"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useTranslations } from "next-intl";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: Readonly<PaginationProps>) {
  const commonT = useTranslations("common");

  const goToPage = (page: number) =>
    onPageChange(Math.max(1, Math.min(page, totalPages)));

  if (totalPages <= 1) return null;

  return (
    <nav className="mt-6 flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
      <div className="-mt-px flex w-0 flex-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={classNames(
            "inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium",
            currentPage === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-500 hover:border-primary-400 hover:text-primary-600"
          )}
        >
          <ChevronLeftIcon className="mr-3 h-5 w-5" aria-hidden="true" />
          {commonT("previous")}
        </button>
      </div>
      <div className="hidden md:-mt-px md:flex">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i + 1}
            onClick={() => goToPage(i + 1)}
            className={classNames(
              "inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium",
              i + 1 === currentPage
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:border-primary-400 hover:text-primary-600"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="-mt-px flex w-0 flex-1 justify-end">
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={classNames(
            "inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium",
            currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-500 hover:border-primary-400 hover:text-primary-600"
          )}
        >
          {commonT("next")}
          <ChevronRightIcon className="ml-3 h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
} 