import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth-guard";
import { MainLayoutWrapper } from "@/components/main-layout-wrapper";
import { PermissionsProvider } from "@/lib/permissions-context";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "SICOF · Sistema visual de control de flotas",
  description:
    "Sistema visual front-only en Next.js para SICOF, con shell por rol, módulos operacionales y navegación completa para Terminal, COF y TI.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${manrope.variable} ${sora.variable} ${jetBrainsMono.variable} bg-[#080a0f]`}>
        <div className="relative min-h-screen overflow-x-hidden">
          <PermissionsProvider>
            <AuthGuard>
              <MainLayoutWrapper>{children}</MainLayoutWrapper>
            </AuthGuard>
          </PermissionsProvider>
        </div>
      </body>
    </html>
  );
}
