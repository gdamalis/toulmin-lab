"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AnalyticsOverview } from "@/components/dashboard";

export default function AdminDashboard() {
  const t = useTranslations("pages.admin");
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t("adminPanel")}</h1>
        <p className="text-gray-500 mt-1">{t("adminDescription")}</p>
      </div>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users">{t("tabs.users")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("tabs.analytics")}</TabsTrigger>
          <TabsTrigger value="settings">{t("tabs.settings")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>{t("userManagement.title")}</CardTitle>
              <CardDescription>{t("userManagement.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* User management overview */}
              <div className="flex justify-end mb-4">
                <Link href="/admin/users">
                  <Button>View All Users</Button>
                </Link>
              </div>
              <p className="text-gray-500 italic">{t("userManagement.comingSoon")}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.title")}</CardTitle>
              <CardDescription>{t("analytics.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Platform analytics */}
              <AnalyticsOverview />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.title")}</CardTitle>
              <CardDescription>{t("settings.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Platform settings will go here */}
              <p className="text-gray-500 italic">{t("settings.comingSoon")}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
} 