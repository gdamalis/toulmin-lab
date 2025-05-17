import { AppShell } from "@/components/layout";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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