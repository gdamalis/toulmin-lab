"use client";

import { Alert, Loader } from "@/components/ui";
import { Typography } from "@/components/ui/Typography";
import { ArgumentListItem, DraftListItem } from "./ArgumentListItem";
import { Pagination } from "@/components/ui/Pagination";
import { ToulminArgument } from "@/types/client";
import { DraftOverview } from "@/lib/services/coach";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

// Unified list item type for sorting both arguments and drafts together
interface UnifiedListItem {
  type: "argument" | "draft";
  id: string;
  updatedAt: Date;
  data: ToulminArgument | DraftOverview;
}

interface ArgumentListProps {
  arguments: ToulminArgument[];
  drafts?: DraftOverview[];
  isLoading: boolean;
  error: string | null;
  onDeleteArgument: (argument: ToulminArgument) => void;
  onDeleteDraft?: (draft: DraftOverview) => void;
  itemsPerPage?: number;
}

export function ArgumentList({
  arguments: toulminArguments,
  drafts = [],
  isLoading,
  error,
  onDeleteArgument,
  onDeleteDraft,
  itemsPerPage = 10,
}: Readonly<ArgumentListProps>) {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");
  const [currentPage, setCurrentPage] = useState(1);

  // Merge arguments and drafts into a unified list sorted by updatedAt
  const unifiedItems = useMemo<UnifiedListItem[]>(() => {
    const argumentItems: UnifiedListItem[] = toulminArguments.map((arg) => ({
      type: "argument" as const,
      id: arg._id?.toString() ?? "",
      updatedAt: new Date(arg.updatedAt),
      data: arg,
    }));

    const draftItems: UnifiedListItem[] = drafts.map((draft) => ({
      type: "draft" as const,
      id: draft.sessionId,
      updatedAt: new Date(draft.updatedAt),
      data: draft,
    }));

    return [...argumentItems, ...draftItems].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }, [toulminArguments, drafts]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return unifiedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [unifiedItems, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(unifiedItems.length / itemsPerPage),
    [unifiedItems, itemsPerPage]
  );

  if (isLoading) {
    return (
      <div className="mt-4 py-8 flex justify-center">
        <Loader size={60} text={commonT("loading")} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        title={commonT("error")}
        description={error}
        className="mt-4"
      />
    );
  }

  if (unifiedItems.length === 0) {
    return (
      <Alert
        variant="default"
        description={t("noArguments")}
        className="mt-4"
      />
    );
  }

  return (
    <>
      <ul className="mt-4 divide-y divide-gray-100">
        {paginatedItems.map((item) =>
          item.type === "argument" ? (
            <ArgumentListItem
              key={item.id}
              argument={item.data as ToulminArgument}
              onDelete={onDeleteArgument}
            />
          ) : (
            <DraftListItem
              key={item.id}
              draft={item.data as DraftOverview}
              onDelete={onDeleteDraft ?? (() => {})}
            />
          )
        )}
      </ul>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
} 