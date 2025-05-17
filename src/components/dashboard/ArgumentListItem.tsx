"use client";

import { ActionMenu, DateDisplay, DotSeparator } from "@/components/ui";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { ToulminArgument } from "@/types/client";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface ArgumentListItemProps {
  argument: ToulminArgument;
  onDelete: (argument: ToulminArgument) => void;
}

export function ArgumentListItem({
  argument,
  onDelete,
}: Readonly<ArgumentListItemProps>) {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");
  const { user } = useAuth();

  const actionItems = [
    {
      label: commonT("edit", { title: argument.name }),
      href: `/argument/edit/${argument._id}`,
    },
    {
      label: commonT("delete"),
      onClick: () => onDelete(argument),
    },
  ];

  return (
    <li className="flex items-center justify-between gap-x-6 p-4 hover:bg-gray-50 rounded-md">
      <Link href={`/argument/view/${argument._id}`}>
        <div className="min-w-0">
          <Typography variant="body" bold className="leading-6">
            {argument.name ||
              `${t("diagram")} ${argument._id?.toString()?.slice(0, 8)}`}
          </Typography>
          <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
            <DateDisplay
              date={argument.createdAt.toString()}
              label={t("createdOn")}
            />
            <DotSeparator />
            <DateDisplay
              date={argument.updatedAt.toString()}
              label={t("updatedOn")}
            />
            <DotSeparator />
            <Typography
              variant="body-sm"
              textColor="muted"
              className="truncate"
            >
              {t("author")}:{" "}
              {argument.author?.name ?? user?.displayName ?? t("anonymous")}
            </Typography>
          </div>
        </div>
      </Link>
      <div className="flex flex-none items-center gap-x-4">
        <ActionMenu items={actionItems} srLabel={commonT("openOptions")} />
      </div>
    </li>
  );
}
