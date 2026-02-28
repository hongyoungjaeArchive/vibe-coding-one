import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { MobileTabBar } from "./MobileTabBar";

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {!hideNav && <Navbar />}
      <main className="pb-16 md:pb-0">{children}</main>
      {!hideNav && <MobileTabBar />}
    </div>
  );
}
