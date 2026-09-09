import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AcademyProvider } from "@/hooks/use-academy";
import GlossaryProvider from "@/components/glossary/GlossaryProvider";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Fund Admin Academy · 境外私募基金学习中心",
    template: "%s · Fund Admin Academy",
  },
  description:
    "面向基金行政管理从业者的境外私募基金学习中心：基金运作、基金结构、Cayman、AML、FATCA/CRS、BVI。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e2a5e",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AcademyProvider>
          <GlossaryProvider>
            <AppShell>{children}</AppShell>
          </GlossaryProvider>
        </AcademyProvider>
      </body>
    </html>
  );
}
