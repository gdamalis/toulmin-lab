"use client";

import { ActionMenu, Badge, Button, DateDisplay, DotSeparator } from "@/components/ui";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { ToulminArgument } from "@/types/client";
import { DraftOverview } from "@/lib/services/coach";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { SparklesIcon } from "@heroicons/react/24/outline";

interface ArgumentListItemProps {
  argument: ToulminArgument;
  onDelete: (argument: ToulminArgument) => void;
}

interface DraftListItemProps {
  draft: DraftOverview;
  onDelete: (draft: DraftOverview) => void;
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
    <li className="flex items-center justify-between gap-x-6 p-4 hover:bg-gray-100 rounded-md">
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

export function DraftListItem({
  draft,
  onDelete,
}: Readonly<DraftListItemProps>) {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");

  const actionItems = [
    {
      label: commonT("edit", { title: draft.name }),
      href: `/argument/edit/${draft.sessionId}?draft=true`,
    },
    {
      label: commonT("delete"),
      onClick: () => onDelete(draft),
    },
  ];

  return (
    <li className="flex items-center justify-between gap-x-6 p-4 hover:bg-gray-100 rounded-md">
      <div className="flex items-center gap-x-4 min-w-0 flex-1">
        <Button
          href={`/argument/view/${draft.sessionId}?draft=true`}
          variant="ghost"
          className="min-w-0 flex-1 justify-start text-left h-auto py-0 px-0 hover:bg-transparent"
        >
          <div>
            <div className="flex items-center gap-x-2">
              <Typography variant="body" bold className="leading-6">
                {draft.name || `${t("diagram")} ${draft.sessionId.slice(0, 8)}`}
              </Typography>
              <Badge variant="yellow">{t("draft")}</Badge>
            </div>
            <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
              <DateDisplay date={draft.createdAt} label={t("createdOn")} />
              <DotSeparator />
              <DateDisplay date={draft.updatedAt} label={t("updatedOn")} />
              <DotSeparator />
              <Typography
                variant="body-sm"
                textColor="muted"
                className="truncate"
              >
                {t("currentStep")}: {draft.currentStep}
              </Typography>
            </div>
          </div>
        </Button>
      </div>
      <div className="flex flex-none items-center gap-x-4">
        <Button
          href={`/argument/coach/${draft.sessionId}`}
          variant="primary"
          size="sm"
        >
          <SparklesIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
          {t("finishWithAI")}
        </Button>
        <ActionMenu items={actionItems} srLabel={commonT("openOptions")} />
      </div>
    </li>
  );
}
