import { Role } from "@/types/roles";
import { ChartBarIcon, HomeIcon, UsersIcon } from "@heroicons/react/24/outline";
import type { ComponentType } from "react";

export interface NavItem {
  /** i18n key in messages, e.g. nav.dashboard */
  labelKey: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    labelKey: "nav.dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    roles: [Role.USER, Role.ADMINISTRATOR, Role.BETA_TESTER, Role.PROFESSOR, Role.STUDENT],
  },
  {
    labelKey: "nav.users",
    href: "/admin/users",
    icon: UsersIcon,
    roles: [Role.ADMINISTRATOR],
  },
  {
    labelKey: "nav.analytics",
    href: "/admin/analytics",
    icon: ChartBarIcon,
    roles: [Role.ADMINISTRATOR],
  },
];
