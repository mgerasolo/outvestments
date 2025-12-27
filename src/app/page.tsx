import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-primary-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="font-bold text-xl">Outvestments</span>
          </Link>
          <nav className="flex items-center gap-4">
            {session?.user ? (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl space-y-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Paper Trading,{" "}
              <span className="text-primary">Gamified</span>
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              Practice trading stocks without risking real money. Compete with
              friends, track your performance, and learn the markets in a fun,
              risk-free environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session?.user ? (
                <Button size="lg" asChild>
                  <Link href="/dashboard">Open Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link href="/login">Get Started</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/login">Learn More</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            <div className="p-6 rounded-xl border bg-card text-left">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-primary"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-Time Data</h3>
              <p className="text-muted-foreground">
                Trade with real market data powered by Alpaca. Experience the
                markets as they happen.
              </p>
            </div>

            <div className="p-6 rounded-xl border bg-card text-left">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-primary"
                >
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Compete & Win</h3>
              <p className="text-muted-foreground">
                Join leaderboards, compete with friends, and prove your trading
                skills.
              </p>
            </div>

            <div className="p-6 rounded-xl border bg-card text-left sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Zero Risk</h3>
              <p className="text-muted-foreground">
                Practice with virtual money. Learn from your mistakes without
                the financial consequences.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Outvestments - Paper Trading Platform</p>
          <p className="mt-1">Built with Next.js, shadcn/ui, and Alpaca</p>
        </div>
      </footer>
    </div>
  );
}
