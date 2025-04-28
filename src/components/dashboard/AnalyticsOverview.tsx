"use client";

import { useEffect, useState } from "react";
import { StatCard, StatCardGrid, StatCardProps } from "@/components/dashboard";
import { Typography } from "@/components/ui/Typography";
import {
  ChartBarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";

interface AnalyticsOverviewProps {
  stats?: Array<Omit<StatCardProps, "icon"> & { icon: StatCardProps["icon"] }>;
}

interface AnalyticsData {
  totalDiagrams: number;
  totalDiagramsChange: number;
  totalUsers: number;
  totalUsersChange: number;
}

export function AnalyticsOverview({
  stats,
}: Readonly<AnalyticsOverviewProps>) {
  const t = useTranslations('pages.dashboard');
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoading(true);
        
        if (!user) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }
        
        const token = await user.getIdToken();
        
        const response = await fetch("/api/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }
        
        const data: AnalyticsData = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Could not load analytics data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnalyticsData();
  }, [user]);
  
  // Prepare stats from API data
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
  ] : stats;

  return (
    <div>
      <Typography variant="h3" className="mb-6">
        {t('analyticsOverview')}
      </Typography>

      {loading ? (
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
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
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
      )}
    </div>
  );
}
