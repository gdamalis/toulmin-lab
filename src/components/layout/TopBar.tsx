"use client";

import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { ProfileMenu } from "./ProfileMenu";

interface TopBarProps {
  setSidebarOpen: (open: boolean) => void;
}

export function TopBar({ setSidebarOpen }: Readonly<TopBarProps>) {
  const t = useTranslations();

  return (
    <div className="sticky top-0 z-40 lg:mx-auto">
      <div className="flex h-16 items-center justify-between md:justify-end gap-x-2 border-b border-gray-200 bg-white px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        >
          <span className="sr-only">{t("common.openMainMenu")}</span>
          <Bars3Icon aria-hidden="true" className="size-6" />
        </button>

        <div className="md:max-w-8xl px-4 sm:px-6">
          <div className="flex flex-1 items-center justify-end gap-x-2 self-stretch">
            <LanguageSwitcher />

            <ProfileMenu />
          </div>
        </div>
      </div>
    </div>
  );
}
