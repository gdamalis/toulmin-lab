"use client";

import { StatCard, StatCardGrid, StatCardProps } from "@/components/dashboard";
import { Typography } from "@/components/ui/Typography";
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface AnalyticsOverviewProps {
  stats?: Array<Omit<StatCardProps, "icon"> & { icon: StatCardProps["icon"] }>;
}

// Default mock stats if real data is not provided
const defaultStats: Array<
  Omit<StatCardProps, "icon"> & { icon: StatCardProps["icon"] }
> = [
  {
    id: 1,
    name: "Total Diagrams",
    stat: "128",
    icon: ChartBarIcon,
    change: "12",
    changeType: "increase" as const,
  },
  {
    id: 2,
    name: "Active Users",
    stat: "42",
    icon: UsersIcon,
    change: "8",
    changeType: "increase" as const,
  },
  {
    id: 3,
    name: "Largest Diagram",
    stat: "872 words",
    icon: DocumentTextIcon,
    change: "3.5%",
    changeType: "decrease" as const,
    href: "/dashboard/diagrams/Climate%20Change%20Policy%20Analysis",
    linkText: "View diagram",
    description: "Climate Change Policy Analysis",
  },
];

export function AnalyticsOverview({
  stats = defaultStats,
}: Readonly<AnalyticsOverviewProps>) {
  return (
    <div>
      <Typography variant="h3" className="mb-6">
        Analytics Overview
      </Typography>

      <StatCardGrid>
        {stats.map((item) => (
          <StatCard
            key={item.id}
            id={item.id}
            name={item.name}
            stat={item.stat}
            icon={item.icon}
            change={item.change}
            changeType={item.changeType}
            href={item.href}
            linkText={item.linkText}
            description={item.description}
          />
        ))}
      </StatCardGrid>
    </div>
  );
}
