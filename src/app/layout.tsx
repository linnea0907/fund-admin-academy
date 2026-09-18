import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AcademyProvider } from "@/hooks/use-academy";
import GlossaryProvider from "@/components/glossary/GlossaryProvider";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Fund Admin Academy · 境外基金行政知识平台",
    template: "%s · Fund Admin Academy",
  },
  description:
    "境外基金行政、AML/KYC 与合规运营知识平台：基金运作与架构、Cayman、BVI、AML、FATCA/CRS、AML Technology 课程，以及术语库、实务案例库、实务工具包与 CAMS 认证备考。",
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
