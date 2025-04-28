"use client";

import AppShell from "@/components/layout/AppShell";
import { AnalyticsOverview, RecentDiagrams } from "@/components/dashboard";

export default function Dashboard() {
  return (
    <AppShell title="Dashboard">
      <div className="-mt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
            <AnalyticsOverview />
            <RecentDiagrams />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
