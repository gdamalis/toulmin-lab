import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations("pages.auth");

  return (
    <header className="relative z-10 bg-transparent">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              alt="Toulmin Lab Logo"
              src="/logo.png"
              width={320}
              height={320}
              className="w-auto h-10"
              priority
            />
          </Link>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link
              href="/auth"
              className="text-sm font-medium text-primary-600 hover:text-primary-300 transition-colors"
            >
              {t("signIn")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
