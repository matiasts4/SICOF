import type { ReactNode } from "react";

import { WorkspaceTabs } from "@/components/workspace-tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { terminalWorkspace } from "@/lib/sicof-navigation";

export default function TerminalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <section className="sticky top-[92px] z-30 flex justify-center px-4 py-2 md:px-6 lg:px-10">
        <div className="w-full max-w-[1000px]">
          <WorkspaceTabs items={terminalWorkspace.links} />
        </div>
      </section>
      {children}
    </>
  );
}
