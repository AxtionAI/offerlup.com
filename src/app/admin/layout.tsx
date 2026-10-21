import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PortalShell } from "@/components/PortalShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin/dashboard");
  if (session.role !== "ADMIN") redirect("/");

  return (
    <PortalShell
      portalLabel="Admin Console"
      userName={session.email}
      navItems={[
        {
          href: "/admin/dashboard",
          label: "Pipeline",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5h4.5V21H3v-7.5zM9.75 8.25h4.5V21h-4.5V8.25zM16.5 3h4.5v18h-4.5V3z" />
            </svg>
          ),
        },
        {
          href: "/admin/proof-of-funds",
          label: "Proof of Funds",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          href: "/admin/investors/import",
          label: "Import Investors",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5 12 6m0 0 4.5 4.5M12 6v12" />
            </svg>
          ),
        },
      ]}
    >
      {children}
    </PortalShell>
  );
}
