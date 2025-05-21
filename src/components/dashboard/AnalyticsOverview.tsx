"use client";

import { StatCard, StatCardGrid } from "@/components/dashboard";
import { Typography } from "@/components/ui/Typography";
import {
  ChartBarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

export interface AnalyticsData {
  totalDiagrams: number;
  totalDiagramsChange: number;
  totalUsers: number;
  totalUsersChange: number;
}

interface AnalyticsOverviewProps {
  analyticsData: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
}

export function AnalyticsOverview({
  analyticsData,
  isLoading,
  error,
}: Readonly<AnalyticsOverviewProps>) {
  const t = useTranslations('pages.admin.analytics');

  const displayStats = analyticsData ? [
    {
      id: 1,
      name: t('totalDiagrams'),
      stat: analyticsData.totalDiagrams.toString(),
      icon: ChartBarIcon,
      change: Math.abs(analyticsData.totalDiagramsChange).toString(),
      changeType: analyticsData.totalDiagramsChange >= 0 ? "increase" as const : "decrease" as const,
    },
    {
      id: 2,
      name: t('activeUsers'),
      stat: analyticsData.totalUsers.toString(),
      icon: UsersIcon,
      change: Math.abs(analyticsData.totalUsersChange).toString(),
      changeType: analyticsData.totalUsersChange >= 0 ? "increase" as const : "decrease" as const,
    }
  ] : [];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="animate-pulse space-y-4">
          <StatCardGrid>
            {[1, 2].map((i) => (
              <div 
                key={i}
                className="h-32 bg-gray-200 rounded-lg"
              />
            ))}
          </StatCardGrid>
        </div>
      );
    }
    
    if (error) {
      return <div className="text-red-500">{error}</div>;
    }
    
    return (
      <StatCardGrid>
        {displayStats?.map((item) => (
          <StatCard
            key={item.id}
            id={item.id}
            name={item.name}
            stat={item.stat}
            icon={item.icon}
            change={item.change}
            changeType={item.changeType}
          />
        ))}
      </StatCardGrid>
    );
  };

  return (
    <div>
      <Typography variant="h3" className="mb-6">
        {t('analyticsOverview')}
      </Typography>

      {renderContent()}
    </div>
  );
}
