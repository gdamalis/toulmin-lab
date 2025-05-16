"use client";

import AppShell from "@/components/layout/AppShell";
import { AnalyticsOverview, RecentDiagrams } from "@/components/dashboard";
import { useTranslations } from "next-intl";
import { useUserRole } from "@/hooks/useUserRole";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Dashboard() {
  const t = useTranslations('pages.dashboard');
  const { isAdmin } = useUserRole();
  
  return (
    <AppShell title={t('title')}>
        <div className="mx-auto pb-12">
          <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
            {/* Analytics overview - only visible to admins */}
            {isAdmin ? (
              <AnalyticsOverview />
            ) : (
              <div className="mb-8">
                <div className="flex gap-3 rounded-md border p-4 bg-blue-50 border-blue-200 text-blue-800">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                  <div>
                    <h5 className="font-medium leading-none tracking-tight">Limited Dashboard View</h5>
                    <div className="text-sm [&_p]:leading-relaxed">
                      You are viewing the standard dashboard. For detailed analytics and user management
                      {isAdmin && (
                        <Link href="/admin" className="ml-1">
                          <Button variant="link" className="p-0 h-auto">
                            visit the admin panel
                          </Button>
                        </Link>
                      )}
                      .
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Recent diagrams - visible to all users */}
            <RecentDiagrams />
          </div>
        </div>
    </AppShell>
  );
}
