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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePreferences } from "@/hooks/use-preferences";
import {
  saveAlpacaCredentials,
  deleteAlpacaCredentials,
  testAlpacaConnection,
  type AlpacaConnectionResult,
} from "@/app/actions/alpaca";
import { clearUserData, deleteAccount } from "./settings-actions";
import {
  User,
  Settings,
  Key,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface UserInfo {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "admin" | "power_user" | "user" | "viewer";
  groups: string[];
}

interface SettingsFormProps {
  user: UserInfo;
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
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Track if we're specifically testing or saving
  const [actionType, setActionType] = useState<
    "save" | "delete" | "test" | "clear_data" | "delete_account" | null
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

  const handleClearData = () => {
    setActionType("clear_data");
    startTransition(async () => {
      const result = await clearUserData();
      if (result.success) {
        toast.success("All trading data has been cleared");
      } else {
        toast.error(result.error || "Failed to clear data");
      }
      setActionType(null);
    });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setActionType("delete_account");
    startTransition(async () => {
      const result = await deleteAccount();
      if (result.success) {
        toast.success("Account deleted. Redirecting...");
        // The server action will handle the redirect
      } else {
        toast.error(result.error || "Failed to delete account");
      }
      setActionType(null);
      setDeleteConfirmText("");
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
        <TabsTrigger value="brokerage" className="gap-2">
          <Key className="h-4 w-4" />
          <span className="hidden sm:inline">Brokerage</span>
        </TabsTrigger>
        <TabsTrigger value="preferences" className="gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Preferences</span>
        </TabsTrigger>
        <TabsTrigger value="danger" className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden sm:inline">Danger Zone</span>
        </TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your account information from Authentik SSO. This information is
              read-only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={user.image || undefined}
                  alt={user.name || "User"}
                />
                <AvatarFallback className="text-xl">
                  {getInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">
                  {user.name || "Unknown"}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {formatRole(user.role)}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">User ID</Label>
                <p className="font-mono text-sm bg-muted px-3 py-2 rounded-md">
                  {user.id}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Account Type</Label>
                <p className="text-sm bg-muted px-3 py-2 rounded-md">
                  {formatRole(user.role)}
                </p>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Session Information
            </CardTitle>
            <CardDescription>
              Details about your current authentication session.
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
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Brokerage Tab */}
      <TabsContent value="brokerage" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Alpaca Paper Trading
            </CardTitle>
            <CardDescription>
              Connect your Alpaca paper trading account to practice trading
              strategies. Your API keys are encrypted with AES-256-GCM before
              storage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasCredentials ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">API Keys Configured</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your Alpaca API keys are securely stored and encrypted.
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
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800 dark:text-green-200">
                            Connected to Alpaca
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Status:
                            </span>{" "}
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
                            {formatCurrency(
                              connectionResult.account.buyingPower
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isPending}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove API Keys
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove API Keys?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete your stored Alpaca API credentials.
                          You will need to re-enter them to use paper trading
                          features.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteApiKeys}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isPending && actionType === "delete" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Removing...
                            </>
                          ) : (
                            "Remove"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
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
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                  <div className="flex gap-2">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Save API Keys
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Preferences Tab */}
      <TabsContent value="preferences" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Display Preferences</CardTitle>
            <CardDescription>
              Customize how information is displayed in the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="colorblind-mode" className="font-medium">
                  Colorblind Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use yellow/purple instead of red/green for gain/loss
                  indicators.
                </p>
              </div>
              <Switch
                id="colorblind-mode"
                checked={preferences.colorblindMode}
                onCheckedChange={handleColorblindToggle}
              />
            </div>

            {/* Preview of colorblind mode */}
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="text-sm font-medium mb-3">Color Preview:</p>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      preferences.colorblindMode ? "bg-purple-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm">Loss / Negative</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      preferences.colorblindMode
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  />
                  <span className="text-sm">Gain / Positive</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Configure how you receive notifications. (Coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg border bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">
                Notification settings will be available in a future update.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Danger Zone Tab */}
      <TabsContent value="danger" className="space-y-6">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              These actions are destructive and cannot be undone. Please proceed
              with caution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Clear Trading Data */}
            <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-medium">Clear Trading Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Delete all your targets, aims, shots, and scores. Your
                    account and Alpaca credentials will be preserved.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="shrink-0">
                      Clear Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Clear All Trading Data?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your targets, aims,
                        shots, scores, and portfolio snapshots. This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isPending && actionType === "clear_data" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Clearing...
                          </>
                        ) : (
                          "Clear All Data"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <Separator />

            {/* Delete Account */}
            <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-medium text-destructive">
                    Delete Account
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                    This will remove your user record, all trading data, and
                    credentials from the system.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete Your Account?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          This will permanently delete your account and all
                          associated data including:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>All targets, aims, shots, and scores</li>
                          <li>Portfolio snapshots and history</li>
                          <li>Watchlist items</li>
                          <li>Alpaca API credentials</li>
                          <li>Audit logs</li>
                        </ul>
                        <p className="font-medium pt-2">
                          Type &quot;DELETE&quot; below to confirm:
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                      placeholder='Type "DELETE" to confirm'
                      value={deleteConfirmText}
                      onChange={(e) =>
                        setDeleteConfirmText(e.target.value.toUpperCase())
                      }
                      className="my-2"
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setDeleteConfirmText("")}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== "DELETE"}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isPending && actionType === "delete_account" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete Account"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
