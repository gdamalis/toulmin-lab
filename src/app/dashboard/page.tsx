"use client";

import AppShell from "@/components/layout/AppShell";
import { RecentDiagrams } from "@/components/dashboard";
import { useTranslations } from "next-intl";

export default function Dashboard() {
  const t = useTranslations('pages.dashboard');
  
  return (
    <AppShell title={t('title')}>
        <div className="mx-auto pb-12">
          <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
            {/* Recent diagrams - visible to all users */}
            <RecentDiagrams />
          </div>
        </div>
    </AppShell>
  );
}
