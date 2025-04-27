"use client";

import AppShell from "@/components/layout/AppShell";
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { StatCard, StatCardGrid, StatCardProps } from "@/components/dashboard";

// Mock data for the dashboard
const mockStats: Array<
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

export default function Dashboard() {
  return (
    <AppShell title="Dashboard">
      <div className="-mt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
            <div>
              <Typography variant="h3" className="mb-6">
                Analytics Overview
              </Typography>

              <StatCardGrid>
                {mockStats.map((item) => (
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

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <Typography variant="h3">Recent Activity</Typography>
                <Button href="/argument-builder">Create New Diagram</Button>
              </div>
              <div className="mt-4 bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                <Typography textColor="muted">
                  No recent activity to display. Create your first diagram to
                  get started.
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
