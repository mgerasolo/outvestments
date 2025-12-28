import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#0a0a12] overflow-hidden">
      {/* ========== HEADER BAR ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left - Logo + Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Outvestments"
              width={40}
              height={40}
              className="shadow-lg group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-bold text-xl text-white tracking-tight">OUTVESTMENTS</span>
              <div className="text-[10px] text-emerald-400/80 tracking-[0.2em] font-medium -mt-0.5">THEORY-FIRST TRADING</div>
            </div>
          </Link>

          {/* Right - Auth Buttons */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-bold text-sm text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all"
              >
                <span>ENTER ARENA</span>
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-bold text-sm text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all"
                >
                  <span>GET STARTED</span>
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========== HERO SECTION - 600px with Arena Background ========== */}
      <section className="relative h-[600px] overflow-hidden pt-16">
        {/* Arena Background - Contained to Hero Only */}
        <div className="absolute inset-0">
          <Image
            src="/arena-bg.png"
            alt="Basketball Arena"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Dark Overlay with finance gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-emerald-900/30" />

          {/* Lens Flares / Camera Flashes */}
          <div className="absolute top-[20%] left-[25%] w-2 h-2 bg-white rounded-full animate-ping opacity-40" style={{ animationDuration: '3s' }} />
          <div className="absolute top-[25%] right-[20%] w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-30" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute top-[15%] right-[40%] w-1 h-1 bg-white rounded-full animate-ping opacity-50" style={{ animationDuration: '5s', animationDelay: '2s' }} />

          {/* ===== HORIZONTAL CANDLESTICK CHART - Left Side ===== */}
          <svg className="absolute left-0 top-[20%] w-[45%] h-64 opacity-[0.15]" viewBox="0 0 400 200" preserveAspectRatio="none">
            {/* Candlesticks */}
            <g>
              {/* Candle 1 - Green */}
              <line x1="30" y1="40" x2="30" y2="160" stroke="#10b981" strokeWidth="2"/>
              <rect x="20" y="60" width="20" height="60" fill="#10b981"/>
              {/* Candle 2 - Red */}
              <line x1="70" y1="50" x2="70" y2="140" stroke="#ef4444" strokeWidth="2"/>
              <rect x="60" y="70" width="20" height="40" fill="#ef4444"/>
              {/* Candle 3 - Green */}
              <line x1="110" y1="30" x2="110" y2="150" stroke="#10b981" strokeWidth="2"/>
              <rect x="100" y="50" width="20" height="70" fill="#10b981"/>
              {/* Candle 4 - Red */}
              <line x1="150" y1="60" x2="150" y2="170" stroke="#ef4444" strokeWidth="2"/>
              <rect x="140" y="80" width="20" height="50" fill="#ef4444"/>
              {/* Candle 5 - Green */}
              <line x1="190" y1="20" x2="190" y2="130" stroke="#10b981" strokeWidth="2"/>
              <rect x="180" y="40" width="20" height="60" fill="#10b981"/>
              {/* Candle 6 - Green */}
              <line x1="230" y1="35" x2="230" y2="120" stroke="#10b981" strokeWidth="2"/>
              <rect x="220" y="50" width="20" height="45" fill="#10b981"/>
              {/* Candle 7 - Red */}
              <line x1="270" y1="45" x2="270" y2="155" stroke="#ef4444" strokeWidth="2"/>
              <rect x="260" y="65" width="20" height="55" fill="#ef4444"/>
              {/* Candle 8 - Green */}
              <line x1="310" y1="25" x2="310" y2="110" stroke="#10b981" strokeWidth="2"/>
              <rect x="300" y="40" width="20" height="50" fill="#10b981"/>
              {/* Candle 9 - Green */}
              <line x1="350" y1="15" x2="350" y2="100" stroke="#10b981" strokeWidth="2"/>
              <rect x="340" y="30" width="20" height="45" fill="#10b981"/>
            </g>
            {/* Trend line */}
            <path d="M20,120 Q100,100 200,60 T380,25" fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray="8,4"/>
          </svg>

          {/* ===== HORIZONTAL CANDLESTICK CHART - Right Side ===== */}
          <svg className="absolute right-0 bottom-[15%] w-[40%] h-48 opacity-[0.12]" viewBox="0 0 350 150" preserveAspectRatio="none">
            <g>
              {/* Different pattern - more volatile */}
              <line x1="25" y1="30" x2="25" y2="120" stroke="#10b981" strokeWidth="2"/>
              <rect x="15" y="45" width="20" height="50" fill="#10b981"/>
              <line x1="60" y1="50" x2="60" y2="130" stroke="#ef4444" strokeWidth="2"/>
              <rect x="50" y="70" width="20" height="35" fill="#ef4444"/>
              <line x1="95" y1="40" x2="95" y2="110" stroke="#ef4444" strokeWidth="2"/>
              <rect x="85" y="55" width="20" height="40" fill="#ef4444"/>
              <line x1="130" y1="25" x2="130" y2="100" stroke="#10b981" strokeWidth="2"/>
              <rect x="120" y="35" width="20" height="45" fill="#10b981"/>
              <line x1="165" y1="20" x2="165" y2="90" stroke="#10b981" strokeWidth="2"/>
              <rect x="155" y="30" width="20" height="40" fill="#10b981"/>
              <line x1="200" y1="35" x2="200" y2="105" stroke="#ef4444" strokeWidth="2"/>
              <rect x="190" y="50" width="20" height="35" fill="#ef4444"/>
              <line x1="235" y1="15" x2="235" y2="80" stroke="#10b981" strokeWidth="2"/>
              <rect x="225" y="25" width="20" height="40" fill="#10b981"/>
              <line x1="270" y1="10" x2="270" y2="70" stroke="#10b981" strokeWidth="2"/>
              <rect x="260" y="18" width="20" height="35" fill="#10b981"/>
              <line x1="305" y1="20" x2="305" y2="85" stroke="#ef4444" strokeWidth="2"/>
              <rect x="295" y="35" width="20" height="30" fill="#ef4444"/>
            </g>
          </svg>

          {/* ===== BULLSEYE TARGET - Top Right ===== */}
          <svg className="absolute top-[12%] right-[5%] w-32 h-32 opacity-[0.18]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="2"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" strokeWidth="2"/>
            <circle cx="50" cy="50" r="25" fill="none" stroke="#10b981" strokeWidth="2"/>
            <circle cx="50" cy="50" r="15" fill="none" stroke="#10b981" strokeWidth="2"/>
            <circle cx="50" cy="50" r="5" fill="#10b981"/>
            {/* Arrow hitting bullseye */}
            <line x1="85" y1="15" x2="55" y2="45" stroke="#f59e0b" strokeWidth="3"/>
            <polygon points="50,50 58,42 55,45" fill="#f59e0b"/>
          </svg>

          {/* ===== BULLSEYE TARGET - Bottom Left ===== */}
          <svg className="absolute bottom-[18%] left-[3%] w-24 h-24 opacity-[0.15]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#06b6d4" strokeWidth="2"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#06b6d4" strokeWidth="2"/>
            <circle cx="50" cy="50" r="25" fill="none" stroke="#06b6d4" strokeWidth="2"/>
            <circle cx="50" cy="50" r="15" fill="none" stroke="#06b6d4" strokeWidth="2"/>
            <circle cx="50" cy="50" r="5" fill="#06b6d4"/>
          </svg>

          {/* Floating finance symbols */}
          <div className="absolute top-[30%] left-[10%] text-emerald-500/20 text-6xl font-black animate-pulse" style={{ animationDuration: '4s' }}>$</div>
          <div className="absolute top-[50%] right-[8%] text-cyan-500/20 text-5xl font-black animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}>📈</div>
          <div className="absolute bottom-[30%] left-[15%] text-amber-500/15 text-4xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}>💹</div>
        </div>

        {/* Hero Content - Split Layout */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex items-center">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center w-full">
            {/* Left Side - Logo + Stylized Name + Main Tagline */}
            <div className="flex flex-col items-center md:items-start">
              {/* Logo with glow */}
              <div className="relative mb-6">
                <div className="absolute inset-0 scale-150 bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-emerald-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <Image
                  src="/logo.png"
                  alt="Outvestments"
                  width={180}
                  height={180}
                  className="relative shadow-2xl shadow-black/50"
                />
              </div>

              {/* Stylized Name */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-center md:text-left mb-4">
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                  OUTVESTMENTS
                </span>
              </h1>

              {/* Main Tagline - Prominent */}
              <div className="relative">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-center md:text-left">
                  <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    Outvest the rest.
                  </span>
                  <br />
                  <span className="text-white">Be the best.</span>
                </p>
              </div>
            </div>

            {/* Right Side - Value Prop + CTA */}
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                What&apos;s Your <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Trading Theory?</span>
              </h2>

              <p className="text-lg text-gray-300 mb-3">
                Most traders buy stocks without knowing <span className="text-white font-semibold">why</span>.
              </p>
              <p className="text-base text-gray-400 mb-8">
                Define your thesis first. Track how your theories perform over time.
                <span className="text-emerald-400 font-medium"> Know your edge. Prove your edge.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                {session?.user ? (
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-lg text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all"
                  >
                    <span>ENTER THE ARENA</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="group inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-lg text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all"
                  >
                    <span>START PROVING YOUR EDGE</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade to main content */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a12] to-transparent" />
      </section>

      {/* ========== SECTION 1: The Problem / Solution - Dark with emerald accents ========== */}
      <section className="relative bg-gradient-to-b from-[#0a0a12] via-[#0a1210] to-[#0a0a12] py-20 overflow-hidden">
        {/* Finance Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-10 left-[5%] text-emerald-500 text-8xl font-black">$</div>
          <div className="absolute top-[40%] right-[3%] text-cyan-500 text-7xl font-black">%</div>
          <div className="absolute bottom-20 left-[8%] text-emerald-500 text-6xl font-black">₿</div>
          <div className="absolute top-[20%] left-[50%] text-amber-500 text-5xl font-black">Ξ</div>
          <div className="absolute bottom-[30%] right-[15%] text-cyan-500 text-4xl font-black">◆</div>
        </div>
        {/* Floating stock ticker elements */}
        <div className="absolute top-[15%] left-[12%] px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400/40 text-xs font-mono animate-pulse">AAPL +2.4%</div>
        <div className="absolute top-[60%] right-[10%] px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400/40 text-xs font-mono animate-pulse" style={{ animationDelay: '1s' }}>NVDA +5.1%</div>
        <div className="absolute bottom-[25%] left-[20%] px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400/40 text-xs font-mono animate-pulse" style={{ animationDelay: '2s' }}>TSLA +1.8%</div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8 sm:p-12 shadow-2xl">
            {/* Accent Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full" />

            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                The Only Trading App With A <span className="text-emerald-400">Real Scoreboard</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Stop guessing. Start knowing. We track every theory you make and show you exactly how it played out.
              </p>
            </div>

            {/* Three Questions Flow */}
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors">
                <div className="text-4xl mb-4">💭</div>
                <h3 className="font-bold text-white mb-2">What&apos;s Your Theory?</h3>
                <p className="text-sm text-gray-500">Define WHY before you buy. Set your investment thesis.</p>
              </div>
              <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-bold text-white mb-2">What Fits Your Theory?</h3>
                <p className="text-sm text-gray-500">Pick stocks that match your thesis. Build a coherent portfolio.</p>
              </div>
              <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="font-bold text-white mb-2">How Well Did It Play Out?</h3>
                <p className="text-sm text-gray-500">Track performance over time. Learn what actually works.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 2: How It Works - Gradient mesh background ========== */}
      <section className="relative bg-gradient-to-br from-[#0f0a1a] via-[#0a0a12] to-[#0a1015] py-20 overflow-hidden">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* ===== HORIZONTAL CANDLESTICK CHART - Full Width Bottom ===== */}
        <svg className="absolute bottom-0 left-0 w-full h-40 opacity-[0.08]" viewBox="0 0 800 120" preserveAspectRatio="none">
          <g>
            <line x1="30" y1="20" x2="30" y2="100" stroke="#10b981" strokeWidth="2"/><rect x="22" y="35" width="16" height="45" fill="#10b981"/>
            <line x1="70" y1="30" x2="70" y2="95" stroke="#ef4444" strokeWidth="2"/><rect x="62" y="45" width="16" height="30" fill="#ef4444"/>
            <line x1="110" y1="15" x2="110" y2="85" stroke="#10b981" strokeWidth="2"/><rect x="102" y="25" width="16" height="40" fill="#10b981"/>
            <line x1="150" y1="25" x2="150" y2="90" stroke="#10b981" strokeWidth="2"/><rect x="142" y="35" width="16" height="35" fill="#10b981"/>
            <line x1="190" y1="35" x2="190" y2="105" stroke="#ef4444" strokeWidth="2"/><rect x="182" y="50" width="16" height="35" fill="#ef4444"/>
            <line x1="230" y1="20" x2="230" y2="80" stroke="#10b981" strokeWidth="2"/><rect x="222" y="30" width="16" height="35" fill="#10b981"/>
            <line x1="270" y1="25" x2="270" y2="95" stroke="#ef4444" strokeWidth="2"/><rect x="262" y="40" width="16" height="35" fill="#ef4444"/>
            <line x1="310" y1="15" x2="310" y2="75" stroke="#10b981" strokeWidth="2"/><rect x="302" y="22" width="16" height="38" fill="#10b981"/>
            <line x1="350" y1="20" x2="350" y2="85" stroke="#10b981" strokeWidth="2"/><rect x="342" y="30" width="16" height="35" fill="#10b981"/>
            <line x1="390" y1="30" x2="390" y2="100" stroke="#ef4444" strokeWidth="2"/><rect x="382" y="45" width="16" height="35" fill="#ef4444"/>
            <line x1="430" y1="18" x2="430" y2="78" stroke="#10b981" strokeWidth="2"/><rect x="422" y="28" width="16" height="32" fill="#10b981"/>
            <line x1="470" y1="12" x2="470" y2="70" stroke="#10b981" strokeWidth="2"/><rect x="462" y="20" width="16" height="35" fill="#10b981"/>
            <line x1="510" y1="22" x2="510" y2="88" stroke="#ef4444" strokeWidth="2"/><rect x="502" y="38" width="16" height="32" fill="#ef4444"/>
            <line x1="550" y1="10" x2="550" y2="65" stroke="#10b981" strokeWidth="2"/><rect x="542" y="18" width="16" height="30" fill="#10b981"/>
            <line x1="590" y1="15" x2="590" y2="72" stroke="#10b981" strokeWidth="2"/><rect x="582" y="22" width="16" height="32" fill="#10b981"/>
            <line x1="630" y1="25" x2="630" y2="85" stroke="#ef4444" strokeWidth="2"/><rect x="622" y="38" width="16" height="30" fill="#ef4444"/>
            <line x1="670" y1="8" x2="670" y2="60" stroke="#10b981" strokeWidth="2"/><rect x="662" y="15" width="16" height="30" fill="#10b981"/>
            <line x1="710" y1="12" x2="710" y2="68" stroke="#10b981" strokeWidth="2"/><rect x="702" y="20" width="16" height="30" fill="#10b981"/>
            <line x1="750" y1="5" x2="750" y2="55" stroke="#10b981" strokeWidth="2"/><rect x="742" y="12" width="16" height="28" fill="#10b981"/>
          </g>
          {/* Moving average line */}
          <path d="M25,60 Q150,50 300,40 T500,25 T700,15" fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray="6,3"/>
        </svg>

        {/* ===== BULLSEYE TARGET - Top Left ===== */}
        <svg className="absolute top-[8%] left-[5%] w-28 h-28 opacity-[0.12]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#a855f7" strokeWidth="2"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="#a855f7" strokeWidth="2"/>
          <circle cx="50" cy="50" r="25" fill="none" stroke="#a855f7" strokeWidth="2"/>
          <circle cx="50" cy="50" r="15" fill="none" stroke="#a855f7" strokeWidth="2"/>
          <circle cx="50" cy="50" r="5" fill="#a855f7"/>
        </svg>

        {/* ===== BULLSEYE TARGET - Right ===== */}
        <svg className="absolute top-[40%] right-[3%] w-20 h-20 opacity-[0.10]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#06b6d4" strokeWidth="2"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="#06b6d4" strokeWidth="2"/>
          <circle cx="50" cy="50" r="25" fill="none" stroke="#06b6d4" strokeWidth="2"/>
          <circle cx="50" cy="50" r="15" fill="none" stroke="#06b6d4" strokeWidth="2"/>
          <circle cx="50" cy="50" r="5" fill="#06b6d4"/>
          {/* Arrow */}
          <line x1="90" y1="10" x2="55" y2="45" stroke="#f59e0b" strokeWidth="2"/>
          <polygon points="50,50 56,44 53,47" fill="#f59e0b"/>
        </svg>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
            The Full Playbook
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
            From theory to execution to scoring—here&apos;s how you prove your edge.
          </p>

          {/* First Row - Target, Aim, Shot */}
          <div className="grid gap-6 sm:grid-cols-3 mb-6">
            {/* Target */}
            <div className="group relative bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-emerald-500/30 hover:bg-white/[0.08] transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-400 tracking-widest">STEP 1</div>
                  <h3 className="text-lg font-bold text-white">Target</h3>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Define your macro thesis. &quot;AI will transform healthcare&quot; or &quot;Interest rates will stay high.&quot;
              </p>
            </div>

            {/* Aim */}
            <div className="group relative bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-cyan-500/30 hover:bg-white/[0.08] transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
                  <span className="text-xl">🔭</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-cyan-400 tracking-widest">STEP 2</div>
                  <h3 className="text-lg font-bold text-white">Aim</h3>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Lock onto specific stocks. &quot;NVDA will outperform because of GPU demand.&quot;
              </p>
            </div>

            {/* Shot */}
            <div className="group relative bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-amber-500/30 hover:bg-white/[0.08] transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/20">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-400 tracking-widest">STEP 3</div>
                  <h3 className="text-lg font-bold text-white">Shot</h3>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Pull the trigger. Execute with $100K virtual cash, real market data.
              </p>
            </div>
          </div>

          {/* Second Row - Track, Collect, Score */}
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Track */}
            <div className="group relative bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-purple-500/30 hover:bg-white/[0.08] transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                  <span className="text-xl">📡</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-400 tracking-widest">STEP 4</div>
                  <h3 className="text-lg font-bold text-white">Track</h3>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Monitor your trajectory. Watch if your shot is on course to hit your target.
              </p>
            </div>

            {/* Collect */}
            <div className="group relative bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-green-500/30 hover:bg-white/[0.08] transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-green-500/20">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-green-400 tracking-widest">STEP 5</div>
                  <h3 className="text-lg font-bold text-white">Collect</h3>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Exit your position. Close the trade when your thesis plays out—or proves wrong.
              </p>
            </div>

            {/* Score */}
            <div className="group relative bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-rose-500/30 hover:bg-white/[0.08] transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-rose-500/20">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-400 tracking-widest">STEP 6</div>
                  <h3 className="text-lg font-bold text-white">Score</h3>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Get graded on your round. Not just profit—your prediction accuracy and timing too.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 3: Scoring Deep Dive - Rose accent background ========== */}
      <section className="relative bg-gradient-to-b from-[#0a0a12] via-[#120a10] to-[#0a0a12] py-20 overflow-hidden">
        {/* Finance decorations */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-[20%] right-[5%] text-rose-500 text-7xl font-black">↗</div>
          <div className="absolute bottom-[20%] left-[5%] text-emerald-500 text-6xl font-black">◎</div>
          <div className="absolute top-[50%] left-[50%] text-cyan-500 text-5xl font-black">⬡</div>
        </div>
        {/* Candlestick chart decoration */}
        <div className="absolute top-10 right-10 flex gap-2 opacity-10">
          <div className="w-3 h-16 bg-emerald-500 rounded"></div>
          <div className="w-3 h-12 bg-rose-500 rounded mt-4"></div>
          <div className="w-3 h-20 bg-emerald-500 rounded -mt-2"></div>
          <div className="w-3 h-8 bg-rose-500 rounded mt-6"></div>
          <div className="w-3 h-14 bg-emerald-500 rounded mt-2"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8 sm:p-12 shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent rounded-full" />

            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 rounded-full text-rose-400 font-bold text-sm mb-4">
                <span>📊</span> SCORING YOUR ROUND
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                We Grade More Than Just <span className="text-emerald-400">Profit</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Making money is one thing. Knowing <em>why</em> you made it is everything.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-5 bg-white/[0.03] rounded-xl border border-white/5 hover:border-rose-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">🎯</span>
                  <h3 className="font-bold text-white">Prediction Accuracy</h3>
                </div>
                <p className="text-sm text-gray-500">How close was your actual return to what you predicted? Did the stock move the direction you called?</p>
              </div>

              <div className="p-5 bg-white/[0.03] rounded-xl border border-white/5 hover:border-rose-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">💪</span>
                  <h3 className="font-bold text-white">Boldness Score</h3>
                </div>
                <p className="text-sm text-gray-500">How difficult was your prediction vs standard market performance? Bold calls get bonus points.</p>
              </div>

              <div className="p-5 bg-white/[0.03] rounded-xl border border-white/5 hover:border-rose-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">⏱️</span>
                  <h3 className="font-bold text-white">Timing Analysis</h3>
                </div>
                <p className="text-sm text-gray-500">Did you buy too early or late? Hold too long? We calculate max potential return and how much you captured.</p>
              </div>

              <div className="p-5 bg-white/[0.03] rounded-xl border border-white/5 hover:border-rose-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">📈</span>
                  <h3 className="font-bold text-white">Alpha vs NPC</h3>
                </div>
                <p className="text-sm text-gray-500">Was this play better than just buying the S&P 500 and holding? Beat the NPC to prove your edge.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 4: Analytics - Cyan accent with grid pattern ========== */}
      <section className="relative bg-gradient-to-br from-[#0a0f12] via-[#0a0a12] to-[#0a1210] py-20 overflow-hidden">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Finance metrics floating */}
        <div className="absolute top-[10%] left-[8%] px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400/30 text-sm font-mono">+12.4% ROI</div>
        <div className="absolute top-[30%] right-[12%] px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400/30 text-sm font-mono">α = 0.82</div>
        <div className="absolute bottom-[20%] left-[15%] px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400/30 text-sm font-mono">β = 1.15</div>
        <div className="absolute bottom-[40%] right-[8%] px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400/30 text-sm font-mono">σ = 0.23</div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 rounded-full text-cyan-400 font-bold text-sm mb-4">
              <span>📉</span> DEEP ANALYTICS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Stats That Actually <span className="text-cyan-400">Matter</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We break down your trades in ways no other app does.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center p-8 bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-sm rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-colors">
              <div className="text-4xl font-black text-emerald-400 mb-2">PPD</div>
              <div className="text-sm font-bold text-white mb-2">Performance Per Day</div>
              <p className="text-xs text-gray-500">Your return normalized by time. Compare a 2-day trade to a 2-month trade fairly.</p>
            </div>

            <div className="text-center p-8 bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-sm rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-colors">
              <div className="text-4xl font-black text-cyan-400 mb-2">vs NPC</div>
              <div className="text-sm font-bold text-white mb-2">Benchmark Comparison</div>
              <p className="text-xs text-gray-500">Every trade compared to S&P 500 over the same period. See if you&apos;re actually generating alpha.</p>
            </div>

            <div className="text-center p-8 bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-sm rounded-2xl border border-white/10 hover:border-amber-500/30 transition-colors">
              <div className="text-4xl font-black text-amber-400 mb-2">BY SECTOR</div>
              <div className="text-sm font-bold text-white mb-2">Category Breakdown</div>
              <p className="text-xs text-gray-500">Your performance by Target themes, sectors, and reasoning types. Find your edge.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 5: Social + Final CTA ========== */}
      <section className="relative bg-gradient-to-b from-[#0a0a12] via-[#12100a] to-[#0a0a12] py-20 overflow-hidden">
        {/* Stadium spotlight effects */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>

        {/* ===== VEGAS-STYLE STOCK SCOREBOARD - Left Side ===== */}
        <div className="absolute left-0 top-[10%] w-[45%] max-w-[500px] opacity-[0.12] hidden lg:block">
          <div className="bg-black/40 border border-emerald-500/20 rounded-r-lg p-4 font-mono text-xs">
            {/* Header Row */}
            <div className="grid grid-cols-[80px_60px_50px_50px_60px] gap-2 text-amber-400/80 border-b border-white/10 pb-2 mb-2">
              <span>SYMBOL</span><span className="text-right">LAST</span><span className="text-right">CHG</span><span className="text-right">%</span><span className="text-right">VOL</span>
            </div>
            {/* Stock Rows */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-[80px_60px_50px_50px_60px] gap-2 text-emerald-400">
                <span className="flex items-center gap-1"><span className="text-white/60">🍎</span>AAPL</span><span className="text-right">189.25</span><span className="text-right">+2.15</span><span className="text-right">+1.15%</span><span className="text-right text-gray-500">42.5M</span>
              </div>
              <div className="grid grid-cols-[80px_60px_50px_50px_60px] gap-2 text-emerald-400">
                <span className="flex items-center gap-1"><span className="text-white/60">📈</span>NVDA</span><span className="text-right">875.50</span><span className="text-right">+18.20</span><span className="text-right">+2.12%</span><span className="text-right text-gray-500">58.2M</span>
              </div>
              <div className="grid grid-cols-[80px_60px_50px_50px_60px] gap-2 text-rose-400">
                <span className="flex items-center gap-1"><span className="text-white/60">⚡</span>TSLA</span><span className="text-right">248.30</span><span className="text-right">-4.70</span><span className="text-right">-1.86%</span><span className="text-right text-gray-500">89.1M</span>
              </div>
              <div className="grid grid-cols-[80px_60px_50px_50px_60px] gap-2 text-emerald-400">
                <span className="flex items-center gap-1"><span className="text-white/60">🔍</span>GOOG</span><span className="text-right">141.80</span><span className="text-right">+1.25</span><span className="text-right">+0.89%</span><span className="text-right text-gray-500">22.8M</span>
              </div>
              <div className="grid grid-cols-[80px_60px_50px_50px_60px] gap-2 text-emerald-400">
                <span className="flex items-center gap-1"><span className="text-white/60">📘</span>META</span><span className="text-right">505.40</span><span className="text-right">+8.90</span><span className="text-right">+1.79%</span><span className="text-right text-gray-500">18.4M</span>
              </div>
              <div className="grid grid-cols-[80px_60px_50px_50px_60px] gap-2 text-rose-400">
                <span className="flex items-center gap-1"><span className="text-white/60">☁️</span>AMZN</span><span className="text-right">178.25</span><span className="text-right">-2.30</span><span className="text-right">-1.27%</span><span className="text-right text-gray-500">31.6M</span>
              </div>
              <div className="grid grid-cols-[80px_60px_50px_50px_60px] gap-2 text-emerald-400">
                <span className="flex items-center gap-1"><span className="text-white/60">💻</span>MSFT</span><span className="text-right">425.80</span><span className="text-right">+5.40</span><span className="text-right">+1.28%</span><span className="text-right text-gray-500">25.3M</span>
              </div>
              <div className="grid grid-cols-[80px_60px_50px_50px_60px] gap-2 text-emerald-400">
                <span className="flex items-center gap-1"><span className="text-white/60">🎵</span>SPOT</span><span className="text-right">315.60</span><span className="text-right">+12.40</span><span className="text-right">+4.09%</span><span className="text-right text-gray-500">5.2M</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== VEGAS-STYLE STOCK SCOREBOARD - Right Side ===== */}
        <div className="absolute right-0 bottom-[15%] w-[40%] max-w-[420px] opacity-[0.10] hidden lg:block">
          <div className="bg-black/40 border border-cyan-500/20 rounded-l-lg p-3 font-mono text-xs">
            {/* Header */}
            <div className="grid grid-cols-[70px_55px_45px_50px] gap-2 text-cyan-400/80 border-b border-white/10 pb-2 mb-2">
              <span>TICKER</span><span className="text-right">PRICE</span><span className="text-right">%</span><span className="text-right">PRED</span>
            </div>
            {/* More stocks with prediction column */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-[70px_55px_45px_50px] gap-2">
                <span className="text-white/70">AMD</span><span className="text-right text-emerald-400">164.20</span><span className="text-right text-emerald-400">+3.2%</span><span className="text-right text-amber-400">+5.0%</span>
              </div>
              <div className="grid grid-cols-[70px_55px_45px_50px] gap-2">
                <span className="text-white/70">CRM</span><span className="text-right text-rose-400">298.40</span><span className="text-right text-rose-400">-0.8%</span><span className="text-right text-amber-400">+2.5%</span>
              </div>
              <div className="grid grid-cols-[70px_55px_45px_50px] gap-2">
                <span className="text-white/70">NFLX</span><span className="text-right text-emerald-400">628.90</span><span className="text-right text-emerald-400">+1.9%</span><span className="text-right text-amber-400">+3.0%</span>
              </div>
              <div className="grid grid-cols-[70px_55px_45px_50px] gap-2">
                <span className="text-white/70">PLTR</span><span className="text-right text-emerald-400">22.85</span><span className="text-right text-emerald-400">+5.4%</span><span className="text-right text-amber-400">+8.0%</span>
              </div>
              <div className="grid grid-cols-[70px_55px_45px_50px] gap-2">
                <span className="text-white/70">COIN</span><span className="text-right text-rose-400">185.30</span><span className="text-right text-rose-400">-2.1%</span><span className="text-right text-amber-400">+10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard-style decorations */}
        <div className="absolute top-[15%] right-[8%] flex flex-col gap-1 opacity-10 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs font-bold text-black">1</div>
            <div className="w-24 h-3 bg-amber-400/50 rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-black">2</div>
            <div className="w-20 h-3 bg-gray-400/50 rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold text-black">3</div>
            <div className="w-16 h-3 bg-amber-600/50 rounded"></div>
          </div>
        </div>
        {/* Finance symbols */}
        <div className="absolute top-[25%] left-[5%] text-emerald-500/15 text-5xl font-black animate-pulse lg:hidden">$</div>
        <div className="absolute bottom-[30%] right-[5%] text-cyan-500/15 text-4xl font-black animate-pulse lg:hidden" style={{ animationDelay: '1s' }}>📈</div>
        <div className="absolute bottom-[15%] left-[10%] text-amber-500/15 text-4xl font-black animate-pulse lg:hidden" style={{ animationDelay: '2s' }}>💹</div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          {/* Social / Learning Section */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8 sm:p-12 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full" />

              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-400 font-bold text-sm mb-4">
                  <span>👥</span> LEARN FROM THE BEST
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  See What <span className="text-amber-400">Top Traders</span> Are Thinking
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  View other players&apos; theories, targets, and predictions. Follow traders who consistently beat the market.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 bg-white/[0.03] rounded-xl border border-white/5 hover:border-amber-500/30 transition-colors">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <span>🔍</span> Public Theories
                  </h3>
                  <p className="text-sm text-gray-500">
                    See what others are betting on. What sectors? What reasoning? What&apos;s the thesis behind their moves?
                  </p>
                </div>

                <div className="p-6 bg-white/[0.03] rounded-xl border border-white/5 hover:border-amber-500/30 transition-colors">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <span>📊</span> Verified Track Records
                  </h3>
                  <p className="text-sm text-gray-500">
                    Every player&apos;s performance is public. Follow those who prove they can predict, not just talk.
                  </p>
                </div>

                <div className="p-6 bg-white/[0.03] rounded-xl border border-white/5 hover:border-amber-500/30 transition-colors">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <span>🎓</span> Learn From Winners
                  </h3>
                  <p className="text-sm text-gray-500">
                    Study the theories that worked. Understand why top performers make the calls they make.
                  </p>
                </div>

                <div className="p-6 bg-white/[0.03] rounded-xl border border-white/5 hover:border-amber-500/30 transition-colors">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <span>🏅</span> Leaderboards
                  </h3>
                  <p className="text-sm text-gray-500">
                    Rankings by accuracy, boldness, timing, and overall alpha. Compete to be the best predictor.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Differentiator / Final CTA */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Ready to Prove You&apos;re Not Just <span className="text-emerald-400">Lucky</span>?
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Outvestments turns trading into a way to evaluate your prediction capability.
              Learn from each other. Follow those who perform best.
              <span className="text-white font-medium"> Know your edge. Prove your edge.</span>
            </p>

            {/* Final CTA */}
            {session?.user ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-emerald-500 via-emerald-500 to-cyan-500 rounded-2xl font-bold text-xl text-white shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all"
              >
                <span>ENTER THE ARENA</span>
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <Link
                href="/login"
                className="group inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-emerald-500 via-emerald-500 to-cyan-500 rounded-2xl font-bold text-xl text-white shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all"
              >
                <span>START PROVING YOUR EDGE</span>
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-[#0a0a12] py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/logo.png"
              alt="Outvestments"
              width={28}
              height={28}
            />
            <span className="font-bold text-gray-500">OUTVESTMENTS</span>
          </div>
          <p className="text-gray-600 text-sm">
            Theory-First Paper Trading • Powered by Alpaca
          </p>
          <p className="text-gray-700 text-xs mt-2">
            Not financial advice. Virtual trading only.
          </p>
        </div>
      </footer>

    </div>
  );
}
