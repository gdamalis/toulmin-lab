"use client";

import { useUserRole } from "@/hooks/useUserRole";
import { Role } from "@/types/roles";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import pkg from "../../../package.json";
import { NAV_ITEMS, NavItem } from "./navItems";

// Helper function to conditionally join class names
function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const { role, isAdmin } = useUserRole();

  // Filter nav items based on current role
  const navigation: NavItem[] = NAV_ITEMS.filter((item) => {
    const currentRole = role ?? Role.USER;
    return item.roles.includes(currentRole);
  });

  const rootClass = classNames(
    "flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 px-3 py-2",
    isAdmin ? "bg-primary-100" : "bg-white"
  );

  return (
    <div className={rootClass}>
      <div className="flex shrink-0 p-2 items-center">
        <Link href="/dashboard">
          <Image
            alt="Toulmin Lab"
            src="/logo.png"
            width={320}
            height={320}
            className="w-auto h-10"
          />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul className="flex flex-col gap-y-1">
              {navigation.map((item) => {
                const isCurrent =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={classNames(
                        isCurrent
                          ? "bg-gray-50 text-primary-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-primary-600",
                        "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                      )}
                    >
                      <Icon
                        aria-hidden="true"
                        className={classNames(
                          isCurrent
                            ? "text-primary-600"
                            : "text-gray-700 group-hover:text-primary-600",
                          "size-6 shrink-0"
                        )}
                      />
                      {t(item.labelKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>
      <div className="text-xs text-gray-400 text-center py-2 border-t border-gray-100">
        v{pkg.version}
        <div className="mt-1">{t("common.madeWith")}</div>
        <div>{t("common.email")}</div>
      </div>
    </div>
  );
}
