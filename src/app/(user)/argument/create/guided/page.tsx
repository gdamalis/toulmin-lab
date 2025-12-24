"use client";

import { GuidedArgumentCreator } from "@/components/chat/GuidedArgumentCreator";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTranslations } from "next-intl";

export default function GuidedArgumentCreationPage() {
  const t = useTranslations("pages.argument");
  
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("guidedCreation.title")}
        subtitle={t("guidedCreation.subtitle")}
        buttons={[
          {
            text: t("backToDashboard"),
            href: "/arguments",
            variant: "secondary",
          },
        ]}
      />
      
      <GuidedArgumentCreator />
    </div>
  );
}

