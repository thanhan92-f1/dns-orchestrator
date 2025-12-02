import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";

interface AppLayoutProps {
  children?: ReactNode;
  onOpenToolbox?: () => void;
}

export function AppLayout({ children, onOpenToolbox }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background pb-6">
      <Sidebar onOpenToolbox={onOpenToolbox} />
      {children || <MainContent />}
    </div>
  );
}
