"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";

interface AppShellProps {
  readonly children: ReactNode;
  readonly title: string;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", current: true },
  {
    name: "ToulminArgument Builder",
    href: "/argument/create",
    current: false,
  },
];

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AppShell({ children, title }: Readonly<AppShellProps>) {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/");
  };

  // Set the current navigation item based on the current path
  const updatedNavigation = navigation.map((item) => ({
    ...item,
    current:
      item.href === pathname ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href)),
  }));

  return (
    <div className="min-h-full">
      <div className="bg-gray-800 pb-32">
        <Disclosure as="nav" className="bg-gray-800">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="border-b border-gray-700">
                  <div className="flex h-16 items-center justify-between px-4 sm:px-0">
                    <div className="flex items-center">
                      <div className="shrink-0">
                        <Image
                          alt="Toulmin Lab"
                          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                          width={32}
                          height={32}
                          className="size-8"
                        />
                      </div>
                      <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                          {updatedNavigation.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              aria-current={item.current ? "page" : undefined}
                              className={classNames(
                                item.current
                                  ? "bg-gray-900 text-white"
                                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                "rounded-md px-3 py-2 text-sm font-medium"
                              )}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-4 flex items-center md:ml-6">
                        {/* Profile dropdown */}
                        <Menu as="div" className="relative ml-3">
                          <div>
                            <MenuButton className="relative flex max-w-xs cursor-pointer items-center rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                              <span className="absolute -inset-1.5" />
                              <span className="sr-only">Open user menu</span>
                              {user?.photoURL ? (
                                <Image
                                  src={user.photoURL}
                                  alt="Profile picture"
                                  width={32}
                                  height={32}
                                  className="size-8 rounded-full"
                                />
                              ) : (
                                <div className="size-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                                  {user?.displayName?.charAt(0).toUpperCase() ??
                                    user?.email?.charAt(0).toUpperCase() ??
                                    "U"}
                                </div>
                              )}
                            </MenuButton>
                          </div>
                          <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden">
                            <MenuItem>
                              {({ active }) => (
                                <Button
                                  onClick={handleSignOut}
                                  className={classNames(
                                    active ? "bg-gray-100" : "",
                                    "block w-full text-left px-4 py-2 text-sm text-gray-700"
                                  )}
                                  variant="secondary"
                                >
                                  Sign out
                                </Button>
                              )}
                            </MenuItem>
                          </MenuItems>
                        </Menu>
                      </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                      {/* Mobile menu button */}
                      <DisclosureButton className="relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon
                            className="block size-6"
                            aria-hidden="true"
                          />
                        ) : (
                          <Bars3Icon
                            className="block size-6"
                            aria-hidden="true"
                          />
                        )}
                      </DisclosureButton>
                    </div>
                  </div>
                </div>
              </div>

              <DisclosurePanel className="border-b border-gray-700 md:hidden">
                <div className="space-y-1 px-2 py-3 sm:px-3">
                  {updatedNavigation.map((item) => (
                    <DisclosureButton
                      key={item.name}
                      as="a"
                      href={item.href}
                      aria-current={item.current ? "page" : undefined}
                      className={classNames(
                        item.current
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "block rounded-md px-3 py-2 text-base font-medium"
                      )}
                    >
                      {item.name}
                    </DisclosureButton>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4 pb-3">
                  <div className="flex items-center px-5">
                    <div className="shrink-0">
                      {user?.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt="Profile picture"
                          width={40}
                          height={40}
                          className="size-10 rounded-full"
                        />
                      ) : (
                        <div className="size-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
                          {user?.displayName?.charAt(0).toUpperCase() ??
                            user?.email?.charAt(0).toUpperCase() ??
                            "U"}
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">
                        {user?.displayName ?? "User"}
                      </div>
                      <div className="text-sm font-medium text-gray-400">
                        {user?.email ?? ""}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    <DisclosureButton
                      as={Button}
                      onClick={handleSignOut}
                      className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                      variant="secondary"
                    >
                      Sign out
                    </DisclosureButton>
                  </div>
                </div>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Typography variant="h1" textColor="white">
              {title}
            </Typography>
          </div>
        </header>
      </div>

      <main>{children}</main>
    </div>
  );
}
