"use client";

import { cn } from "@multica/ui/lib/utils";
import { SidebarTrigger, useSidebar } from "@multica/ui/components/ui/sidebar";

function MobileSidebarTrigger() {
  try {
    useSidebar();
  } catch {
    return null;
  }
  return <SidebarTrigger className="mr-2 md:hidden" />;
}

interface PageHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function PageHeader({ children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex h-14 shrink-0 items-center border-b border-border/70 px-5", className)}>
      <MobileSidebarTrigger />
      {children}
    </div>
  );
}
