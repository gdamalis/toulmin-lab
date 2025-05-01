import Image from 'next/image';
import Link from 'next/link';
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export function Header() {
  return (
    <header className="relative z-10 bg-primary-600">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              alt="Toulmin Lab Logo"
              src="/logo.png"
              width={320}
              height={320}
              className="w-auto h-10 brightness-0 invert"
              priority
            />
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
} 