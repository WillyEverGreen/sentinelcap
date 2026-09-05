import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SentinelCap — Institutional Capital & Risk Optimization Control Engine",
  description: "Automated capital management, multi-method tail-risk optimization, Markov regime switching, and autonomous safeguard circuit breakers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-sky-500/30 selection:text-sky-200`}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-zinc-900 bg-zinc-950/80 py-4 text-center text-xs text-zinc-500 font-mono">
            SENTINELCAP FINTECH PLATFORM • FRTB COMPLIANT COHERENT TAIL-RISK & AUTONOMOUS SAFEGUARD ENGINE
          </footer>
        </div>
      </body>
    </html>
  );
}
