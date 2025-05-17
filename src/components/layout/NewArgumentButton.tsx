"use client";

import { PlusIcon } from "@heroicons/react/20/solid";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface NewArgumentButtonProps {
  className?: string;
}

export function NewArgumentButton({ className = "" }: NewArgumentButtonProps) {
  const t = useTranslations();
  
  return (
    <Link
      href="/arguments/create"
      className={`inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${className}`}
    >
      <PlusIcon className="mr-1.5 -ml-0.5 h-5 w-5" aria-hidden="true" />
      {t("nav.newArgument")}
    </Link>
  );
} 