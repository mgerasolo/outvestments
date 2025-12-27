"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { usePreferences } from "@/hooks/use-preferences";
import {
  saveAlpacaCredentials,
  deleteAlpacaCredentials,
  testAlpacaConnection,
  type AlpacaConnectionResult,
} from "@/app/actions/alpaca";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "admin" | "power_user" | "user" | "viewer";
  groups: string[];
}

interface SettingsFormProps {
  user: User;
  expiresAt?: number;
  hasAlpacaCredentials?: boolean;
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "U";
}

function formatRole(role: string): string {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getRoleBadgeVariant(
  role: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case "admin":
      return "destructive";
    case "power_user":
      return "default";
    default:
      return "secondary";
  }
}

function formatSessionExpiry(expiresAt?: number): string {
  if (!expiresAt) {
    return "Session active";
  }

  const expiryDate = new Date(expiresAt * 1000);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Session expired";
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 24) {
    const diffDays = Math.floor(diffHours / 24);
    return `Expires in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  }

  if (diffHours > 0) {
    return `Expires in ${diffHours}h ${diffMins}m`;
  }

  return `Expires in ${diffMins} minutes`;
}

function formatCurrency(value: string): string {
  const num = parseFloat(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function SettingsForm({
  user,
  expiresAt,
  hasAlpacaCredentials: initialHasCredentials = false,
}: SettingsFormProps) {
  const { preferences, updatePreferences, isLoading } = usePreferences();
  const [alpacaApiKey, setAlpacaApiKey] = useState("");
  const [alpacaSecretKey, setAlpacaSecretKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(initialHasCredentials);
  const [connectionResult, setConnectionResult] =
    useState<AlpacaConnectionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  // Track if we're specifically testing or saving
  const [actionType, setActionType] = useState<
    "save" | "delete" | "test" | null
  >(null);

  useEffect(() => {
    setHasCredentials(initialHasCredentials);
  }, [initialHasCredentials]);

  const handleColorblindToggle = (checked: boolean) => {
    updatePreferences({ colorblindMode: checked });
    toast.success(
      checked ? "Colorblind mode enabled" : "Colorblind mode disabled"
    );
  };

  const handleSaveApiKeys = () => {
    if (!alpacaApiKey || !alpacaSecretKey) {
      toast.error("Please enter both API Key and Secret Key");
      return;
    }

    setActionType("save");
    startTransition(async () => {
      const result = await saveAlpacaCredentials(alpacaApiKey, alpacaSecretKey);
      if (result.success) {
        toast.success("API keys saved securely");
        setAlpacaApiKey("");
        setAlpacaSecretKey("");
        setHasCredentials(true);
        setConnectionResult(null);
      } else {
        toast.error(result.error || "Failed to save API keys");
      }
      setActionType(null);
    });
  };

  const handleDeleteApiKeys = () => {
    setActionType("delete");
    startTransition(async () => {
      const result = await deleteAlpacaCredentials();
      if (result.success) {
        toast.success("API keys removed");
        setHasCredentials(false);
        setConnectionResult(null);
      } else {
        toast.error(result.error || "Failed to remove API keys");
      }
      setActionType(null);
    });
  };

  const handleTestConnection = () => {
    setActionType("test");
    startTransition(async () => {
      const result = await testAlpacaConnection();
      setConnectionResult(result);
      if (result.success) {
        toast.success("Connection successful!");
      } else {
        toast.error(result.error || "Connection failed");
      }
      setActionType(null);
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your account information from Authentik. This is read-only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={user.image || undefined}
                alt={user.name || "User"}
              />
              <AvatarFallback className="text-lg">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">
                {user.name || "Unknown"}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">User ID</Label>
              <p className="font-mono text-sm">{user.id}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Role</Label>
              <div>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {formatRole(user.role)}
                </Badge>
              </div>
            </div>
          </div>

          {user.groups.length > 0 && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Groups</Label>
              <div className="flex flex-wrap gap-2">
                {user.groups.map((group) => (
                  <Badge key={group} variant="outline">
                    {group}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Section */}
      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>
            Information about your current authentication session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Session Status</p>
              <p className="text-sm text-muted-foreground">
                {formatSessionExpiry(expiresAt)}
              </p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Section */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>
            Customize the appearance for better accessibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="colorblind-mode" className="font-medium">
                Colorblind Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Use yellow/purple instead of red/green for gain/loss indicators.
              </p>
            </div>
            <Switch
              id="colorblind-mode"
              checked={preferences.colorblindMode}
              onCheckedChange={handleColorblindToggle}
            />
          </div>

          {/* Preview of colorblind mode */}
          <div className="mt-4 p-4 rounded-lg border bg-muted/50">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    preferences.colorblindMode ? "bg-purple-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm">Loss</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    preferences.colorblindMode ? "bg-yellow-500" : "bg-green-500"
                  }`}
                />
                <span className="text-sm">Gain</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alpaca API Keys Section */}
      <Card>
        <CardHeader>
          <CardTitle>Alpaca Paper Trading</CardTitle>
          <CardDescription>
            Connect your Alpaca paper trading account. Keys are encrypted and
            stored securely in the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasCredentials ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-green-500"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span className="font-medium">API Keys Configured</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your Alpaca API keys are securely stored.
                </p>
              </div>

              {/* Connection Test Result */}
              {connectionResult && (
                <div
                  className={`p-4 rounded-lg border ${
                    connectionResult.success
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900"
                      : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900"
                  }`}
                >
                  {connectionResult.success && connectionResult.account ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-green-600"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span className="font-medium text-green-800 dark:text-green-200">
                          Connected to Alpaca
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Status:</span>{" "}
                          <Badge variant="outline" className="ml-1">
                            {connectionResult.account.status}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cash:</span>{" "}
                          {formatCurrency(connectionResult.account.cash)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Portfolio:
                          </span>{" "}
                          {formatCurrency(
                            connectionResult.account.portfolioValue
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Buying Power:
                          </span>{" "}
                          {formatCurrency(connectionResult.account.buyingPower)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-red-600"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" x2="9" y1="9" y2="15" />
                        <line x1="9" x2="15" y1="9" y2="15" />
                      </svg>
                      <span className="text-red-800 dark:text-red-200">
                        {connectionResult.error || "Connection failed"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isPending}
                >
                  {isPending && actionType === "test" ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Testing...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteApiKeys}
                  disabled={isPending}
                >
                  {isPending && actionType === "delete" ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Removing...
                    </>
                  ) : (
                    "Remove API Keys"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alpaca-api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="alpaca-api-key"
                    type={showApiKey ? "text" : "password"}
                    placeholder="PKXXXXXXXXXXXXXXXXXX"
                    value={alpacaApiKey}
                    onChange={(e) => setAlpacaApiKey(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" x2="23" y1="1" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alpaca-secret-key">Secret Key</Label>
                <div className="relative">
                  <Input
                    id="alpaca-secret-key"
                    type={showSecretKey ? "text" : "password"}
                    placeholder="Your secret key"
                    value={alpacaSecretKey}
                    onChange={(e) => setAlpacaSecretKey(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                  >
                    {showSecretKey ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" x2="23" y1="1" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                <div className="flex gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="16" y2="12" />
                    <line x1="12" x2="12.01" y1="8" y2="8" />
                  </svg>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Use your <strong>paper trading</strong> API keys from{" "}
                    <a
                      href="https://app.alpaca.markets/paper/dashboard/overview"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      Alpaca Paper Trading
                    </a>
                    . Keys are encrypted with AES-256-GCM before storage.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSaveApiKeys}
                disabled={isPending || !alpacaApiKey || !alpacaSecretKey}
              >
                {isPending && actionType === "save" ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save API Keys"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
