"use client";

import {
  ChatBubbleLeftRightIcon,
  HomeIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import pkg from "../../../package.json";
import { useUserRole } from "@/hooks/useUserRole";

// Helper function to conditionally join class names
function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const { isAdmin } = useUserRole();

  // Define navigation items with icons
  const navigation = [
    {
      name: t("nav.dashboard"),
      href: "/dashboard",
      icon: HomeIcon,
      current: pathname === "/dashboard",
    },
    {
      name: t("nav.myArguments"),
      href: "/argument",
      icon: ChatBubbleLeftRightIcon,
      current:
        pathname === "/argument" ||
        (pathname.startsWith("/argument/") && !pathname.includes("/create")),
    },
  ];
  
  // Admin-only navigation items
  const adminNavigation = isAdmin ? [
    {
      name: t("nav.adminPanel"),
      href: "/admin",
      icon: Cog6ToothIcon,
      current: pathname.startsWith("/admin"),
    }
  ] : [];

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 py-4">
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
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-50 text-primary-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-primary-600",
                      "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                    )}
                  >
                    <item.icon
                      aria-hidden="true"
                      className={classNames(
                        item.current
                          ? "text-primary-600"
                          : "text-gray-400 group-hover:text-primary-600",
                        "size-6 shrink-0"
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
              
              {/* Admin navigation items */}
              {adminNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-50 text-primary-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-primary-600",
                      "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                    )}
                  >
                    <item.icon
                      aria-hidden="true"
                      className={classNames(
                        item.current
                          ? "text-primary-600"
                          : "text-gray-400 group-hover:text-primary-600",
                        "size-6 shrink-0"
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
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
