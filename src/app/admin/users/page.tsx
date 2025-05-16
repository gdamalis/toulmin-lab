"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function UsersManagement() {
  const t = useTranslations("pages.admin");
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t("userManagement.title")}</h1>
        <p className="text-gray-500 mt-1">{t("userManagement.description")}</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>Manage all platform users</CardDescription>
        </CardHeader>
        <CardContent>
          {/* User management table will be implemented here */}
          <div className="text-center py-8">
            <p className="text-gray-500 italic">User management functionality will be implemented here.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
} 