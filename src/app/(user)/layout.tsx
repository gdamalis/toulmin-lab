import { AppShell } from "@/components/layout";
import { authorize } from "@/lib/auth/authorize";
import { Role } from "@/types/roles";

export default async function UserLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Any authenticated user (incl. admin) can access
  await authorize([Role.USER, Role.ADMINISTRATOR]);

  return <AppShell>{children}</AppShell>;
} 