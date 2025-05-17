"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";


export interface ActionItem {
  label: string;
  onClick?: () => void;
  href?: string;
  srLabel?: string;
}

interface ActionMenuProps {
  items: ActionItem[];
  srLabel?: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function ActionMenu({ items, srLabel = "Open options" }: Readonly<ActionMenuProps>) {
  return (
    <Menu as="div" className="relative flex-none">
      <MenuButton className="-m-2.5 block p-2.5 text-gray-500 cursor-pointer hover:text-gray-900">
        <span className="sr-only">{srLabel}</span>
        <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
      </MenuButton>
      <MenuItems className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
        {items.map((item, index) => (
          <MenuItem key={index}>
            {({ active }) => {
              const className = classNames(
                active ? "bg-gray-50" : "",
                "block px-3 py-1 text-sm leading-6 text-gray-900"
              );

              // Render as link if href is provided
              if (item.href) {
                return (
                  <a href={item.href} className={className}>
                    <span>{item.label}</span>
                    {item.srLabel && <span className="sr-only">, {item.srLabel}</span>}
                  </a>
                );
              }

              // Otherwise render as button
              return (
                <button 
                  onClick={item.onClick} 
                  className={classNames(className, "w-full text-left")}
                >
                  <span>{item.label}</span>
                  {item.srLabel && <span className="sr-only">, {item.srLabel}</span>}
                </button>
              );
            }}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
} 