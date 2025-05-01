"use client";

import { locales } from "@/i18n/settings";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

// Flag images for languages
const flagImages = {
  en: "/images/flags/us.svg",
  es: "/images/flags/es.svg",
};

// Function to set cookie
function setLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${
    60 * 60 * 24 * 365
  }`;
}

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isChanging, setIsChanging] = useState(false);

  const isLoading = isPending || isChanging;

  function onSelectChange(newLocale: string) {
    setIsChanging(true);

    // Set cookie for locale
    setLocaleCookie(newLocale);

    // Refresh the page to use the new locale
    startTransition(() => {
      router.refresh();
      setIsChanging(false);
    });
  }

  return (
    <Menu as="div" className="relative">
      <MenuButton
        disabled={isLoading}
        className="relative flex cursor-pointer items-center gap-x-1 rounded-sm text-sm focus:ring-1 focus:ring-white focus:ring-offset-1 focus:ring-offset-gray-800 focus:outline-hidden"
      >
        <span className="sr-only">{t("language")}</span>
        <Image
          src={flagImages[locale as keyof typeof flagImages]}
          alt={locale}
          width={40}
          height={30}
          className="h-auto w-7 rounded-sm"
        />
      </MenuButton>
      <MenuItems className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden">
        {locales.map((lang) => (
          <MenuItem key={lang}>
            {({ active }) => (
              <button
                className={`${active ? "bg-gray-100" : ""} ${
                  locale === lang ? "bg-gray-50 font-semibold" : ""
                } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                onClick={() => onSelectChange(lang)}
                disabled={isLoading || locale === lang}
              >
                <Image
                  src={flagImages[lang as keyof typeof flagImages]}
                  alt={lang}
                  width={40}
                  height={30}
                  className="h-auto w-7 mr-2 rounded-sm"
                />
                {lang === "en" ? "English" : "Español"}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
