import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PortalShell } from "@/components/PortalShell";

export default async function InvestorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/investor/dashboard");
  if (session.role !== "INVESTOR") redirect("/");

  return (
    <PortalShell
      portalLabel="Investor Portal"
      userName={session.email}
      navItems={[
        {
          href: "/investor/dashboard",
          label: "Marketplace",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 12 3l9 4.5M4 10v9a1 1 0 001 1h14a1 1 0 001-1v-9M9 20v-6h6v6" />
            </svg>
          ),
        },
        {
          href: "/investor/buy-box",
          label: "Smart Buy Box",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          ),
        },
        {
          href: "/investor/proof-of-funds",
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
