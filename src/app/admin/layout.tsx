import { getTranslations } from "next-intl/server";
import { AppShellWrapper } from "@/components/layout";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("pages.admin");

  return (
    <AppShellWrapper title={t("title")}>
      <div className="mx-auto pb-12">
        <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          {children}
        </div>
      </div>
    </AppShellWrapper>
  );
} 