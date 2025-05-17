"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { getRoleBadgeVariant } from "@/types/roles";
import { Badge } from "@/components/ui/Badge";

export function ProfileMenu() {
  const { user, userRole, signOutUser } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/");
  };

  // Display user name or email or fallback
  const displayName =
    user?.displayName ?? user?.email?.split("@")[0] ?? t("common.user");

  return (
    <Menu as="div" className="relative">
      <MenuButton className="relative min-h-10 min-w-10 flex items-center p-1 cursor-pointer hover:bg-gray-100 rounded-md focus:outline-hidden">
        <span className="sr-only">{t("common.openUserMenu")}</span>
        <div className="flex items-center">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt="Profile picture"
              width={32}
              height={32}
              className="size-8 rounded-full bg-gray-50"
            />
          ) : (
            <div className="size-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </MenuButton>
      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-gray-900">{displayName}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email ?? ""}</p>

          {/* Role badge */}
          {userRole && (
            <Badge className="mt-2" variant={getRoleBadgeVariant(userRole)}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Badge>
          )}
        </div>
        <div className="border-t border-gray-100 my-1"></div>
        <MenuItem>
          {({ active }) => (
            <button
              onClick={handleSignOut}
              className={`${
                active ? "bg-gray-50" : ""
              } block cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700`}
            >
              {t("common.signOut")}
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
