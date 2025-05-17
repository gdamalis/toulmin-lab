"use client";

import { AnalyticsOverview } from "@/components/dashboard";
import { useTranslations } from "next-intl";

export default function AnalyticsPage() {
  const t = useTranslations("pages.admin");

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">{t("analytics.title")}</h1>
      <p className="text-gray-500 mb-6">{t("analytics.description")}</p>
      <AnalyticsOverview />
    </div>
  );
} 