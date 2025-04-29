"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ProfileMenu } from "./ProfileMenu";
import { NewArgumentButton } from "./NewArgumentButton";
import { useTranslations } from "next-intl";

interface TopBarProps {
  setSidebarOpen: (open: boolean) => void;
}

export function TopBar({ setSidebarOpen }: TopBarProps) {
  const t = useTranslations();

  return (
    <div className="sticky top-0 z-40 lg:mx-auto">
      <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        >
          <span className="sr-only">{t("common.openMainMenu")}</span>
          <Bars3Icon aria-hidden="true" className="size-6" />
        </button>

        {/* Separator */}
        <div aria-hidden="true" className="h-6 w-px bg-gray-200 lg:hidden" />
        <NewArgumentButton className="md:hidden w-auto" />

        <div className="flex flex-1 items-center justify-end gap-x-4 self-stretch lg:gap-x-6">
          {/* New Argument Button (Desktop) */}
          <div className="hidden md:block">
            <NewArgumentButton />
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <LanguageSwitcher />
          </div>

          {/* Separator */}
          <div
            aria-hidden="true"
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
          />

          {/* Profile dropdown */}
          <ProfileMenu />
        </div>
      </div>
    </div>
  );
}
