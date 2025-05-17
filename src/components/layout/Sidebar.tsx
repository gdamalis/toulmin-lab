"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import pkg from "../../../package.json";
import { useUserRole } from "@/hooks/useUserRole";
import { Role } from "@/types/roles";
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
    "flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 px-6 py-4",
    isAdmin ? "bg-primary-50" : "bg-white"
  );

  return (
    <div className={rootClass}>
      <div className="flex h-16 shrink-0 items-center">
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
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
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
                            : "text-gray-400 group-hover:text-primary-600",
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
          {/* <li className="mt-auto">
            <Link
              href="/settings"
              className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-600"
            >
              <Cog6ToothIcon
                aria-hidden="true"
                className="size-6 shrink-0 text-gray-400 group-hover:text-primary-600"
              />
              {commonT("settings")}
            </Link>
          </li> */}
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
