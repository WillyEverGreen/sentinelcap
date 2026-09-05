import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Right Main Application Area offset by fixed sidebar width (240px) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] ml-[240px]">
        <Header />
        <main className="flex-1 p-6 md:p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
