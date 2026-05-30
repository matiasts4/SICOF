import { CommandPreview } from "@/components/landing/command-preview";
import { DocumentationGrid } from "@/components/landing/documentation-grid";
import { HomeHero } from "@/components/landing/home-hero";
import { OperationalCta } from "@/components/landing/operational-cta";
import { RoleGrid } from "@/components/landing/role-grid";
import { WorkspaceShowcase } from "@/components/landing/workspace-showcase";

export default function HomePage() {
  return (
    <main>
      <HomeHero />

      <section className="section-shell pt-0">
        <div className="page-shell">
          <CommandPreview />
        </div>
      </section>

      <WorkspaceShowcase />
      <RoleGrid />
      <OperationalCta />
      <DocumentationGrid />
    </main>
  );
}
