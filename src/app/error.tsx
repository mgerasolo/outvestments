"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Page for Next.js App Router
 *
 * Catches errors in route segments and their nested children.
 * Provides user-friendly error display with recovery options.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console in structured format for Loki
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        message: "Next.js route error",
        app: "outvestments",
        error: error.message,
        stack: error.stack,
        digest: error.digest,
      })
    );
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            An unexpected error occurred while loading this page.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="rounded-md bg-muted p-3">
              <p className="font-mono text-sm text-destructive">{error.message}</p>
              {error.digest && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={reset} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={() => (window.location.href = "/")} variant="default">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
