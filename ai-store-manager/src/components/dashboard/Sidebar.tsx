import Link from "next/link";
import { LayoutDashboard, Package, ScanSearch, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/scanner", label: "Store Scanner", icon: ScanSearch },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <div className="mb-8 px-2 text-lg font-semibold tracking-tight">
        AI Store Manager
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
