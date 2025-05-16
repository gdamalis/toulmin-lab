"use client";

import { ReactNode } from "react";
import AppShell from "./AppShell";

interface AppShellWrapperProps {
  children: ReactNode;
  title: string;
}

/**
 * A client component wrapper for AppShell to allow using it from server components
 */
export default function AppShellWrapper({ children, title }: AppShellWrapperProps) {
  return <AppShell title={title}>{children}</AppShell>;
} 