import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PortalShell } from "@/components/PortalShell";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/seller/properties");
  if (session.role !== "SELLER") redirect("/");

  return (
    <PortalShell
      portalLabel="Seller Portal"
      userName={session.email}
      navItems={[
        {
          href: "/seller/properties",
          label: "My Properties",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" />
            </svg>
          ),
        },
        {
          href: "/sell",
          label: "Submit Another Property",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          ),
        },
      ]}
    >
      {children}
    </PortalShell>
  );
}
