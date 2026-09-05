"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, KeyRound } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const clerk = useClerk();

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email OTP verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInstantDemo = () => {
    try {
      localStorage.setItem(
        "sentinel_demo_user",
        JSON.stringify({
          name: name || "Aditya Sharma",
          role: "Chief Investment Officer",
          email: email || "aditya.sharma@sentinelcap.ai",
        })
      );
      document.cookie = "sentinel_demo=1; path=/; max-age=604800";
    } catch {
      // ignore
    }
    window.location.href = "/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 15) {
      setError("Password must be 15 characters or more for institutional security standards.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (clerk && clerk.client && clerk.client.signUp) {
        const [firstName, ...lastNameParts] = name.split(" ");
        const result = await clerk.client.signUp.create({
          firstName: firstName || "Institutional",
          lastName: lastNameParts.join(" ") || "User",
          emailAddress: email,
          password: password,
        });

        if (result.status === "complete") {
          await clerk.setActive({ session: result.createdSessionId });
          window.location.href = "/dashboard";
          return;
        }

        if (result.status === "missing_requirements" && result.unverifiedFields.includes("email_address")) {
          await clerk.client.signUp.prepareEmailAddressVerification({ strategy: "email_code" });
          setPendingVerification(true);
          return;
        }
      }
      handleInstantDemo();
    } catch (err: any) {
      console.error("Sign up error:", err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Could not create account. Please check your details.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setError("");
    setVerifying(true);

    try {
      if (clerk && clerk.client && clerk.client.signUp) {
        const completeSignUp = await clerk.client.signUp.attemptEmailAddressVerification({
          code: verificationCode,
        });

        if (completeSignUp.status === "complete") {
          await clerk.setActive({ session: completeSignUp.createdSessionId });
          window.location.href = "/dashboard";
          return;
        }
      }
      handleInstantDemo();
    } catch (err: any) {
      console.error("Verification error:", err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Invalid verification code. Please try again.";
      setError(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleOAuth = async (strategy: "oauth_google" | "oauth_microsoft") => {
    try {
      if (clerk && (clerk as any).authenticateWithRedirect) {
        await (clerk as any).authenticateWithRedirect({
          strategy,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/dashboard",
        });
      } else {
        handleInstantDemo();
      }
    } catch (err) {
      console.error("OAuth error:", err);
      handleInstantDemo();
    }
  };

  return (
    <div suppressHydrationWarning className="h-screen w-full flex flex-col lg:flex-row font-sans select-none bg-white overflow-hidden">
      
      {/* ================= LEFT SIDE: HALF-SCREEN BLUE HERO PANEL ================= */}
      <div className="w-full lg:w-1/2 h-full max-h-screen bg-gradient-to-b from-[#1C64F2] via-[#1A56DB] to-[#1748BE] text-white flex flex-col justify-between p-8 sm:p-10 lg:p-12 relative overflow-hidden lg:rounded-r-[36px] shadow-2xl lg:shadow-blue-900/20 z-10 shrink-0">
        
        {/* Ambient Subtle Radial Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] bg-blue-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Back to website pill */}
        <div className="relative z-10 flex items-center justify-end">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs sm:text-[13px] font-semibold backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-xs"
          >
            <span>Back to website</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Center Area: Half screen reserved for 3D image (kept blank as instructed) */}
        <div className="relative z-10 flex-1 flex items-center justify-center my-4 min-h-[160px]">
          <div className="w-full h-full flex items-center justify-center" />
        </div>

        {/* Bottom Section: Editorial Typography */}
        <div className="relative z-10 space-y-2.5 max-w-xl pb-2">
          <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold tracking-tight text-white leading-tight">
            Intelligent Capital Management
          </h2>

          <p className="text-white/90 text-sm sm:text-[15px] font-normal leading-relaxed max-w-md">
            Monitor risks. Optimize allocations. Make confident decisions with real-time insights.
          </p>

          <div className="w-12 h-[2.5px] bg-white/50 rounded-full my-3" />

          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.24em] text-white/75 uppercase">
            BUILT FOR A MORE RESILIENT TOMORROW
          </p>
        </div>
      </div>

      {/* ================= RIGHT SIDE: HALF-SCREEN SIGN-UP FORM ================= */}
      <div className="w-full lg:w-1/2 h-full max-h-screen flex flex-col justify-between p-6 sm:p-8 lg:px-14 lg:py-7 bg-white overflow-hidden">
        
        {/* Top Header: CapitalAI Logo */}
        <div className="flex items-center justify-end w-full shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="flex items-end gap-[3.5px] h-6">
              <span className="w-[5px] h-3.5 bg-[#00D2FF] rounded-full transition-all group-hover:h-5 duration-300" />
              <span className="w-[5px] h-[19px] bg-[#0077FF] rounded-full transition-all group-hover:h-3.5 duration-300" />
              <span className="w-[5px] h-6 bg-[#0044FF] rounded-full transition-all group-hover:h-6 duration-300" />
            </div>
            <span className="text-[21px] font-extrabold tracking-[-0.03em] text-[#0A1128]">
              Capital<span className="text-[#0066FF]">AI</span>
            </span>
          </Link>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-[430px] mx-auto my-auto py-1">
          
          {pendingVerification ? (
            /* Email Code Verification View */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1C64F2] flex items-center justify-center mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Verify your email
                </h1>
                <p className="text-sm text-slate-500 mt-1.5">
                  We sent a 6-digit verification code to <span className="font-semibold text-slate-800">{email}</span>.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyCode} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 tracking-wider uppercase mb-1.5">
                    VERIFICATION CODE
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.trim())}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center text-xl font-mono tracking-widest text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#1C64F2] focus:ring-2 focus:ring-[#1C64F2]/15 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full bg-[#1C64F2] hover:bg-[#1A56DB] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleInstantDemo}
                  className="text-xs sm:text-sm font-semibold text-[#1C64F2] hover:underline cursor-pointer"
                >
                  Skip verification and enter Demo →
                </button>
              </div>
            </div>
          ) : (
            /* Standard Sign-Up View */
            <>
              <div className="mb-5">
                <h1 className="text-3xl sm:text-[34px] font-extrabold text-slate-900 tracking-tight leading-none">
                  Create account
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  Institutional access to risk & capital management
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Required Clerk Captcha Anchor Element */}
                <div id="clerk-captcha" />

                {/* Name Field */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 tracking-wider uppercase mb-1">
                    FULL NAME
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-[18px] h-[18px] text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aditya Sharma"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1C64F2] focus:ring-2 focus:ring-[#1C64F2]/15 transition-all bg-white shadow-2xs"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 tracking-wider uppercase mb-1">
                    INSTITUTIONAL EMAIL
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-[18px] h-[18px] text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@firm.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1C64F2] focus:ring-2 focus:ring-[#1C64F2]/15 transition-all bg-white shadow-2xs"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">
                      PASSWORD
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Min 15 chars</span>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-[18px] h-[18px] text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="e.g. SentinelCap2026!Secure"
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1C64F2] focus:ring-2 focus:ring-[#1C64F2]/15 transition-all bg-white shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 bg-[#1C64F2] hover:bg-[#1A56DB] text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg shadow-blue-500/20 transition-all text-[14.5px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Get started</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  OR CONTINUE WITH
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {/* Social Authentication Buttons */}
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => handleOAuth("oauth_google")}
                  className="w-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs sm:text-[13px] font-semibold py-3 px-3 rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="truncate">Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuth("oauth_microsoft")}
                  className="w-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs sm:text-[13px] font-semibold py-3 px-3 rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  <span className="truncate">Microsoft</span>
                </button>
              </div>

              {/* Bottom Sign-In Link */}
              <p className="text-center text-[13px] text-slate-500 mt-4">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-[#1C64F2] font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}

        </div>

        {/* Empty bottom spacer */}
        <div className="h-1 shrink-0" />
      </div>

    </div>
  );
}
