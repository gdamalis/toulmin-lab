"use client";

import { AnalyticsOverview, AiAnalyticsOverview } from "@/components/admin";
import { useTranslations } from "next-intl";
import { useAnalytics } from "@/hooks/useAnalytics";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function AnalyticsPage() {
  const t = useTranslations("pages.admin");
  const tCommon = useTranslations("common");
  const { analyticsData, isLoading, error, refreshAnalytics } = useAnalytics();

  return (
    <>
      <PageHeader
        title={t("analytics.title")}
        buttons={[
          {
            text: tCommon("refresh"),
            variant: "secondary",
            onClick: refreshAnalytics,
            icon: ArrowPathIcon,
            isLoading: isLoading,
          },
        ]}
      >
        <p className="mt-2 max-w-2xl text-gray-500">
          {t("analytics.description")}
        </p>
      </PageHeader>

      <div className="mt-8 space-y-12">
        {/* Existing overview stats (users, diagrams) */}
        <AnalyticsOverview 
          analyticsData={analyticsData}
          isLoading={isLoading}
          error={error}
        />
        
        {/* AI Usage Analytics */}
        <div className="border-t border-gray-200 pt-8">
          <AiAnalyticsOverview />
        </div>
      </div>
    </>
  );
} 