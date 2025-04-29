"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export function ProfileMenu() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/");
  };

  return (
    <Menu as="div" className="relative">
      <div>
        <MenuButton className="relative flex items-center p-1.5">
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
                {user?.displayName?.charAt(0).toUpperCase() ??
                  user?.email?.charAt(0).toUpperCase() ??
                  "U"}
              </div>
            )}
            <span className="hidden lg:flex lg:items-center">
              <span className="ml-4 text-sm/6 font-semibold text-gray-900">
                {user?.displayName ?? 
                  user?.email?.split("@")[0] ?? 
                  t("common.user")}
              </span>
              <ChevronDownIcon className="ml-2 size-5 text-gray-400" aria-hidden="true" />
            </span>
          </div>
        </MenuButton>
      </div>
      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-gray-900">
            {user?.displayName ??
              user?.email?.split("@")[0] ??
              t("common.user")}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user?.email ?? ""}
          </p>
        </div>
        <div className="border-t border-gray-100 my-1"></div>
        <MenuItem>
          {({ active }) => (
            <button
              onClick={handleSignOut}
              className={`${
                active ? "bg-gray-50" : ""
              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
            >
              {t("common.signOut")}
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
} 