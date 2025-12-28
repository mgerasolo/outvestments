"use client";

import { useEffect } from "react";

interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Boundary for Root Layout Errors
 *
 * This is a fallback for errors that occur in the root layout.
 * It must define its own <html> and <body> tags since the root
 * layout is replaced when this error boundary is triggered.
 */
export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    // Log error to console in structured format for Loki
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        message: "Next.js global error (root layout)",
        app: "outvestments",
        error: error.message,
        stack: error.stack,
        digest: error.digest,
      })
    );
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backgroundColor: "#0a0a0a",
            color: "#fafafa",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "32rem",
              width: "100%",
              backgroundColor: "#171717",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              border: "1px solid #262626",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#ef4444" }}>
                Application Error
              </h1>
            </div>

            <p style={{ color: "#a1a1aa", marginBottom: "1rem" }}>
              A critical error occurred. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === "development" && (
              <div
                style={{
                  backgroundColor: "#0a0a0a",
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  marginBottom: "1rem",
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  color: "#ef4444",
                }}
              >
                {error.message}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={reset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#262626",
                  color: "#fafafa",
                  border: "1px solid #404040",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#fafafa",
                  color: "#0a0a0a",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
