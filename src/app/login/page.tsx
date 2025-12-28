import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  // If already logged in, redirect to dashboard
  if (session?.user) {
    redirect(params.callbackUrl || "/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] overflow-hidden relative">
      {/* Arena Background - Full page */}
      <div className="absolute inset-0">
        <Image
          src="/arena-bg.png"
          alt="Arena"
          fill
          className="object-cover object-center opacity-40"
          priority
        />
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-emerald-900/40" />
      </div>

      {/* Floating finance symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[8%] text-emerald-500/15 text-7xl font-black animate-pulse" style={{ animationDuration: '4s' }}>$</div>
        <div className="absolute top-[25%] right-[10%] text-cyan-500/15 text-6xl font-black animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}>📈</div>
        <div className="absolute bottom-[30%] left-[12%] text-amber-500/10 text-5xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}>💹</div>
        <div className="absolute bottom-[20%] right-[8%] text-rose-500/10 text-6xl font-black animate-pulse" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>%</div>
        <div className="absolute top-[60%] left-[5%] text-cyan-500/10 text-4xl font-black animate-pulse" style={{ animationDuration: '5s', animationDelay: '1.5s' }}>◆</div>
        <div className="absolute top-[40%] right-[5%] text-emerald-500/10 text-5xl font-black animate-pulse" style={{ animationDuration: '6s', animationDelay: '2.5s' }}>Ξ</div>
      </div>

      {/* Stock ticker decorations */}
      <div className="absolute top-[10%] left-[15%] px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400/30 text-xs font-mono animate-pulse hidden sm:block">AAPL +2.4%</div>
      <div className="absolute top-[20%] right-[15%] px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400/30 text-xs font-mono animate-pulse hidden sm:block" style={{ animationDelay: '1s' }}>NVDA +5.1%</div>
      <div className="absolute bottom-[25%] left-[10%] px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400/30 text-xs font-mono animate-pulse hidden sm:block" style={{ animationDelay: '2s' }}>TSLA +1.8%</div>
      <div className="absolute bottom-[15%] right-[12%] px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400/30 text-xs font-mono animate-pulse hidden sm:block" style={{ animationDelay: '1.5s' }}>MSFT +0.9%</div>

      {/* Stadium spotlight effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-emerald-500/5 rounded-full blur-3xl"></div>

      {/* ===== HORIZONTAL CANDLESTICK CHART - Left Side ===== */}
      <svg className="absolute left-0 top-[15%] w-[35%] h-56 opacity-[0.12] hidden md:block" viewBox="0 0 300 180" preserveAspectRatio="none">
        <g>
          <line x1="25" y1="30" x2="25" y2="150" stroke="#10b981" strokeWidth="2"/><rect x="17" y="50" width="16" height="70" fill="#10b981"/>
          <line x1="55" y1="45" x2="55" y2="130" stroke="#ef4444" strokeWidth="2"/><rect x="47" y="60" width="16" height="45" fill="#ef4444"/>
          <line x1="85" y1="25" x2="85" y2="120" stroke="#10b981" strokeWidth="2"/><rect x="77" y="40" width="16" height="55" fill="#10b981"/>
          <line x1="115" y1="50" x2="115" y2="140" stroke="#ef4444" strokeWidth="2"/><rect x="107" y="70" width="16" height="45" fill="#ef4444"/>
          <line x1="145" y1="20" x2="145" y2="100" stroke="#10b981" strokeWidth="2"/><rect x="137" y="35" width="16" height="45" fill="#10b981"/>
          <line x1="175" y1="30" x2="175" y2="95" stroke="#10b981" strokeWidth="2"/><rect x="167" y="42" width="16" height="35" fill="#10b981"/>
          <line x1="205" y1="40" x2="205" y2="115" stroke="#ef4444" strokeWidth="2"/><rect x="197" y="55" width="16" height="40" fill="#ef4444"/>
          <line x1="235" y1="18" x2="235" y2="85" stroke="#10b981" strokeWidth="2"/><rect x="227" y="28" width="16" height="40" fill="#10b981"/>
          <line x1="265" y1="15" x2="265" y2="75" stroke="#10b981" strokeWidth="2"/><rect x="257" y="22" width="16" height="35" fill="#10b981"/>
        </g>
        <path d="M20,100 Q80,80 150,50 T280,25" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6,3"/>
      </svg>

      {/* ===== HORIZONTAL CANDLESTICK CHART - Right Side ===== */}
      <svg className="absolute right-0 bottom-[20%] w-[30%] h-48 opacity-[0.10] hidden md:block" viewBox="0 0 250 140" preserveAspectRatio="none">
        <g>
          <line x1="20" y1="25" x2="20" y2="110" stroke="#10b981" strokeWidth="2"/><rect x="12" y="40" width="16" height="50" fill="#10b981"/>
          <line x1="50" y1="40" x2="50" y2="115" stroke="#ef4444" strokeWidth="2"/><rect x="42" y="55" width="16" height="40" fill="#ef4444"/>
          <line x1="80" y1="30" x2="80" y2="100" stroke="#ef4444" strokeWidth="2"/><rect x="72" y="45" width="16" height="35" fill="#ef4444"/>
          <line x1="110" y1="20" x2="110" y2="85" stroke="#10b981" strokeWidth="2"/><rect x="102" y="30" width="16" height="40" fill="#10b981"/>
          <line x1="140" y1="15" x2="140" y2="75" stroke="#10b981" strokeWidth="2"/><rect x="132" y="25" width="16" height="35" fill="#10b981"/>
          <line x1="170" y1="28" x2="170" y2="90" stroke="#ef4444" strokeWidth="2"/><rect x="162" y="42" width="16" height="30" fill="#ef4444"/>
          <line x1="200" y1="12" x2="200" y2="65" stroke="#10b981" strokeWidth="2"/><rect x="192" y="20" width="16" height="30" fill="#10b981"/>
          <line x1="230" y1="8" x2="230" y2="55" stroke="#10b981" strokeWidth="2"/><rect x="222" y="15" width="16" height="28" fill="#10b981"/>
        </g>
      </svg>

      {/* ===== BULLSEYE TARGET - Top Right ===== */}
      <svg className="absolute top-[10%] right-[8%] w-36 h-36 opacity-[0.15] hidden sm:block" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="2"/>
        <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" strokeWidth="2"/>
        <circle cx="50" cy="50" r="25" fill="none" stroke="#10b981" strokeWidth="2"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#10b981" strokeWidth="2"/>
        <circle cx="50" cy="50" r="5" fill="#10b981"/>
        {/* Arrow hitting bullseye */}
        <line x1="88" y1="12" x2="55" y2="45" stroke="#f59e0b" strokeWidth="3"/>
        <polygon points="50,50 58,42 54,46" fill="#f59e0b"/>
      </svg>

      {/* ===== BULLSEYE TARGET - Bottom Left ===== */}
      <svg className="absolute bottom-[15%] left-[5%] w-28 h-28 opacity-[0.12] hidden sm:block" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#06b6d4" strokeWidth="2"/>
        <circle cx="50" cy="50" r="35" fill="none" stroke="#06b6d4" strokeWidth="2"/>
        <circle cx="50" cy="50" r="25" fill="none" stroke="#06b6d4" strokeWidth="2"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#06b6d4" strokeWidth="2"/>
        <circle cx="50" cy="50" r="5" fill="#06b6d4"/>
      </svg>

      {/* ===== BULLSEYE TARGET - Mid Right ===== */}
      <svg className="absolute top-[55%] right-[3%] w-20 h-20 opacity-[0.10] hidden lg:block" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#a855f7" strokeWidth="2"/>
        <circle cx="50" cy="50" r="35" fill="none" stroke="#a855f7" strokeWidth="2"/>
        <circle cx="50" cy="50" r="25" fill="none" stroke="#a855f7" strokeWidth="2"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#a855f7" strokeWidth="2"/>
        <circle cx="50" cy="50" r="5" fill="#a855f7"/>
      </svg>

      {/* Header */}
      <header className="relative z-20 p-6">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="Outvestments"
            width={36}
            height={36}
            className="shadow-lg group-hover:scale-105 transition-transform"
          />
          <span className="font-bold text-lg text-white/80 group-hover:text-white transition-colors">OUTVESTMENTS</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-4 -mt-16">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="relative bg-gradient-to-b from-white/[0.12] to-white/[0.04] backdrop-blur-xl rounded-3xl border border-white/10 p-8 sm:p-10 shadow-2xl">
            {/* Accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full" />

            {/* Logo + Branding */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 scale-150 bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-emerald-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <Image
                  src="/logo.png"
                  alt="Outvestments"
                  width={100}
                  height={100}
                  className="relative shadow-2xl shadow-black/50"
                />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  OUTVESTMENTS
                </span>
              </h1>

              <p className="text-base sm:text-lg font-bold">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Outvest the rest.
                </span>
                {" "}
                <span className="text-white/90">Be the best.</span>
              </p>
            </div>

            {/* Error message */}
            {params.error && (
              <div className="mb-6 p-4 text-sm text-rose-300 bg-rose-500/20 border border-rose-500/30 rounded-xl">
                {params.error === "OAuthCallback"
                  ? "There was a problem signing in. Please try again."
                  : params.error}
              </div>
            )}

            {/* Sign in form */}
            <form
              action={async () => {
                "use server";
                await signIn("authentik", {
                  redirectTo: params.callbackUrl || "/dashboard",
                });
              }}
            >
              <button
                type="submit"
                className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-lg text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" x2="3" y1="12" y2="12" />
                </svg>
                <span>ENTER THE ARENA</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-xs text-gray-500 font-medium">SECURE SIGN-IN</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Features teaser */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="text-xl mb-1">🎯</div>
                <div className="text-[10px] text-gray-400 font-medium">Track Theories</div>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="text-xl mb-1">📊</div>
                <div className="text-[10px] text-gray-400 font-medium">Get Scored</div>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="text-xl mb-1">🏆</div>
                <div className="text-[10px] text-gray-400 font-medium">Prove Your Edge</div>
              </div>
            </div>

            {/* Legal */}
            <p className="mt-6 text-[11px] text-center text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              <br />
              <span className="text-gray-600">Virtual trading only. Not financial advice.</span>
            </p>
          </div>

          {/* Back to home link */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
