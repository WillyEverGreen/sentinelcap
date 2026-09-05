import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 flex font-sans antialiased transition-colors duration-150">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Right Main Application Area offset by fixed sidebar width (240px) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] dark:bg-[#0A0F1D] ml-[240px] transition-colors duration-150">
        <Header />
        <main className="flex-1 p-6 md:p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
