import type { ReactNode } from "react";

import { WorkspaceTabs } from "@/components/workspace-tabs";
import { cofWorkspace } from "@/lib/sicof-navigation";

export default function CofLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <section className="sticky top-[92px] z-30 flex justify-center px-4 py-2 md:px-6 lg:px-10">
        <div className="w-full max-w-[1000px]">
          <WorkspaceTabs items={cofWorkspace.links} />
        </div>
      </section>
      {children}
    </>
  );
}
