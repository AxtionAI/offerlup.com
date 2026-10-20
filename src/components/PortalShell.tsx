import Link from "next/link";
import { NotificationBell } from "./NotificationBell";
import { LogoutButton } from "./LogoutButton";

export type NavItem = { href: string; label: string; icon: React.ReactNode };

export function PortalShell({
  navItems,
  portalLabel,
  userName,
  children,
}: {
  navItems: NavItem[];
  portalLabel: string;
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="hidden w-64 shrink-0 flex-col bg-ink-950 lg:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            OL
          </span>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-white">OfferLift</div>
            <div className="text-[11px] text-ink-400">{portalLabel}</div>
          </div>
        </div>
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-300 hover:bg-ink-900 hover:text-white"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-ink-900 p-4">
          <Link href="/" className="text-xs text-ink-400 hover:text-white">
            ← Back to public site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-ink-100 bg-ink-950 px-4 lg:bg-white lg:px-8">
          <div className="text-sm font-semibold text-white lg:text-ink-900">{portalLabel}</div>
          <div className="flex items-center gap-4">
            <div className="hidden text-sm text-ink-500 lg:block">{userName}</div>
            <div className="rounded-full bg-ink-900 lg:bg-ink-100">
              <div className="lg:text-ink-700 [&_svg]:lg:text-ink-600">
                <NotificationBell />
              </div>
            </div>
            <LogoutButton className="text-sm font-medium text-ink-300 hover:text-white lg:text-ink-500 lg:hover:text-ink-900" />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
