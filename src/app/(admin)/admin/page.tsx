"use client";

import { useTranslations } from "next-intl";

export default function AdminDashboard() {
  const t = useTranslations("pages.admin");

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold">{t("adminPanel")}</h1>
      <p className="text-gray-500 mt-1">{t("adminDescription")}</p>
    </div>
  );
}
