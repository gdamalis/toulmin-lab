import { AppShell } from "@/components/layout";

export default async function UserLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return <AppShell>{children}</AppShell>;
} 