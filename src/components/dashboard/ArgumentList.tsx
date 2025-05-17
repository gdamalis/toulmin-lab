"use client";

import { Typography } from "@/components/ui/Typography";
import { ArgumentListItem } from "./ArgumentListItem";
import { Pagination } from "@/components/ui/Pagination";
import { ToulminArgument } from "@/types/client";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

interface ArgumentListProps {
  arguments: ToulminArgument[];
  isLoading: boolean;
  error: string | null;
  onDeleteArgument: (argument: ToulminArgument) => void;
  itemsPerPage?: number;
}

export function ArgumentList({
  arguments: toulminArguments,
  isLoading,
  error,
  onDeleteArgument,
  itemsPerPage = 10,
}: Readonly<ArgumentListProps>) {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedArguments = useMemo(() => {
    if (!toulminArguments) return [];
    const sortedArguments = [...toulminArguments].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedArguments.slice(startIndex, startIndex + itemsPerPage);
  }, [toulminArguments, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil((toulminArguments?.length || 0) / itemsPerPage),
    [toulminArguments, itemsPerPage]
  );

  if (isLoading) {
    return (
      <div className="mt-4 py-8 flex justify-center">
        <Typography textColor="muted">{commonT("loading")}</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 bg-red-50 p-6 rounded-lg text-center text-red-600">
        <Typography>
          {commonT("error")} {error}
        </Typography>
      </div>
    );
  }

  if (toulminArguments.length === 0) {
    return (
      <div className="mt-4 bg-gray-50 p-6 rounded-lg text-center text-gray-500">
        <Typography textColor="muted">{t("noArguments")}</Typography>
      </div>
    );
  }

  return (
    <>
      <ul className="mt-4 divide-y divide-gray-100">
        {paginatedArguments.map((argument) => (
          <ArgumentListItem
            key={argument._id?.toString() ?? ""}
            argument={argument}
            onDelete={onDeleteArgument}
          />
        ))}
      </ul>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
} 