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
      ]}
    >
      {children}
    </PortalShell>
  );
}
