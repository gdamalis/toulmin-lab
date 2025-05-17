"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

export interface ActionItem {
  label: string;
  onClick?: () => void;
  href?: string;
  srLabel?: string;
  isExternal?: boolean;
}

interface ActionMenuProps {
  items: ActionItem[];
  srLabel?: string;
}

export function ActionMenu({
  items,
  srLabel = "Open options",
}: Readonly<ActionMenuProps>) {
  return (
    <Menu as="div" className="relative flex-none">
      <MenuButton className="-m-2.5 block p-2.5 text-gray-500 cursor-pointer hover:text-gray-900 focus:outline-hidden">
        <span className="sr-only">{srLabel}</span>
        <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
      </MenuButton>
      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        {items.map((item, index) => (
          <MenuItem key={index}>
            {({ active }) => {
              const menuItemClasses = cn(
                active ? "bg-gray-50" : "",
                "block px-3 py-1 text-sm leading-6 text-gray-900"
              );

              return (
                <Button
                  href={item.href}
                  onClick={item.onClick}
                  isExternal={item.isExternal}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    menuItemClasses,
                    "w-full text-left justify-start font-normal rounded-none"
                  )}
                >
                  <span>{item.label}</span>
                  {item.srLabel && (
                    <span className="sr-only">, {item.srLabel}</span>
                  )}
                </Button>
              );
            }}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
