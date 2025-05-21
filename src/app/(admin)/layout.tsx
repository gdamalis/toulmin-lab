import { AppShell } from "@/components/layout";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
