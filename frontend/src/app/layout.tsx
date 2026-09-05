import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SentinelCap - Institutional Capital & Risk Optimization Control Engine",
  description: "Automated capital management, multi-method tail-risk optimization, Markov regime switching, and autonomous safeguard circuit breakers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#11121d] text-zinc-100 antialiased selection:bg-sky-500/30 selection:text-sky-200 overflow-x-hidden`}>
        <div className="flex min-h-screen w-full">
          {/* Fixed Left Sidebar - remains in place on scroll */}
          <Sidebar />

          {/* Right Main Application Area offset by fixed sidebar width (250px) */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#11121d] ml-[250px]">
            <Header />
            <main className="flex-1 p-6 md:p-8 w-full">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
