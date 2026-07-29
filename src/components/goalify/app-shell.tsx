import { BottomDock } from "./bottom-dock";
import { TopBar } from "./top-bar";

/**
 * Frame for the four core app screens: top bar, scrollable content that
 * clears the floating dock, and the dock itself.
 */
export function AppShell({
  children,
  title,
  subtitle,
  showTopBar = true,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showTopBar?: boolean;
}) {
  return (
    <>
      <div className="mx-auto w-full max-w-lg px-5 pt-6 pb-36">
        {showTopBar && <TopBar title={title} subtitle={subtitle} />}
        {children}
      </div>
      <BottomDock />
    </>
  );
}
