"use client";

import { locales } from "@/i18n/settings";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

// Flag images for languages
const flagImages = {
  en: "/images/us-flag.svg",
  es: "/images/es-flag.svg",
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
        className="relative min-h-10 min-w-10 flex justify-center cursor-pointer items-center p-1 rounded-md text-sm hover:bg-gray-100 focus:ring-1 focus:ring-white focus:outline-hidden"
      >
        <span className="sr-only">{t("language")}</span>
        <Image
          src={flagImages[locale as keyof typeof flagImages]}
          alt={locale}
          width={40}
          height={30}
          className="h-auto w-6 rounded-xs"
        />
      </MenuButton>
      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
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
                  src={flagImages[lang]}
                  alt={lang}
                  width={40}
                  height={30}
                  className="h-auto w-7 mr-2 rounded-xs"
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
