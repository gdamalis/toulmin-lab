import { AppShell } from "@/components/layout";
import { authorize } from "@/lib/auth/authorize";
import { Role } from "@/types/roles";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Only administrators allowed
  await authorize([Role.ADMINISTRATOR]);

  return (
    <AppShell>
      <div className="mx-auto pb-12">
        <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          {children}
        </div>
      </div>
    </AppShell>
  );
} 