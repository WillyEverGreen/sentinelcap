import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium font-sans">Completing secure authentication...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
