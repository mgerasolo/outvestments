"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { updateShotState, deleteShot, fireShot, syncShotOrderStatus, cancelAlpacaOrder } from "@/app/actions/shots";
import { PartialCloseDialog } from "@/components/trading/partial-close-dialog";
import type { Shot, ShotState } from "@/lib/db/schema";

interface ShotActionsProps {
  shot: Shot;
  symbol: string;
}

interface StateTransition {
  from: ShotState;
  to: ShotState;
  label: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
  requiresConfirmation?: boolean;
}

const STATE_TRANSITIONS: StateTransition[] = [
  {
    from: "pending",
    to: "armed",
    label: "Arm Shot",
    description: "Ready this shot for execution",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 mr-2"
      >
        <path d="m9 12 2 2 4-4" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    color: "text-yellow-600",
  },
  {
    from: "armed",
    to: "fired",
    label: "Fire Shot",
    description: "Execute this trade with Alpaca",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 mr-2"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    color: "text-blue-600",
    requiresConfirmation: true,
  },
  {
    from: "fired",
    to: "active",
    label: "Mark Active",
    description: "Order has been filled",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 mr-2"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    color: "text-green-600",
  },
  // Note: Close Position for active shots is handled via PartialCloseDialog
  // to support partial closes with quantity selection
];

export function ShotActions({ shot, symbol }: ShotActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPartialCloseDialog, setShowPartialCloseDialog] = useState(false);
  const [pendingTransition, setPendingTransition] =
    useState<StateTransition | null>(null);

  const availableTransitions = STATE_TRANSITIONS.filter(
    (t) => t.from === shot.state
  );

  const handleTransition = (transition: StateTransition) => {
    if (transition.requiresConfirmation) {
      setPendingTransition(transition);
      setShowConfirmDialog(true);
    } else {
      executeTransition(transition.to);
    }
  };

  const executeTransition = (newState: ShotState) => {
    startTransition(async () => {
      // Use fireShot for armed→fired transition (executes actual trade)
      if (newState === "fired" && shot.state === "armed") {
        const result = await fireShot(shot.id);
        if (result.success) {
          toast.success(`Trade submitted! Order ID: ${result.orderId?.slice(0, 8)}...`);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to submit trade");
        }
        return;
      }

      // Use standard state transition for other cases
      const result = await updateShotState(shot.id, newState);
      if (result.success) {
        toast.success(`Shot ${newState}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update shot");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteShot(shot.id);
      if (result.success) {
        toast.success("Shot deleted");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete shot");
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      const result = await updateShotState(shot.id, "closed");
      if (result.success) {
        toast.success("Shot cancelled");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to cancel shot");
      }
    });
  };

  const handleSyncStatus = () => {
    startTransition(async () => {
      const result = await syncShotOrderStatus(shot.id);
      if (result.success) {
        toast.success(
          result.shot?.state === "active"
            ? "Order filled! Position is now active."
            : `Status synced: ${result.shot?.alpacaStatus || "updated"}`
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to sync order status");
      }
    });
  };

  const handleCancelOrder = () => {
    startTransition(async () => {
      const result = await cancelAlpacaOrder(shot.id);
      if (result.success) {
        toast.success("Order cancelled successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to cancel order");
      }
    });
  };

  const canDelete =
    shot.state === "pending" ||
    shot.state === "armed" ||
    shot.state === "fired";
  const canCancel = shot.state === "pending" || shot.state === "armed";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isPending}>
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
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {availableTransitions.map((transition) => (
            <DropdownMenuItem
              key={transition.to}
              onClick={() => handleTransition(transition)}
              className={transition.color}
            >
              {transition.icon}
              <div className="flex flex-col">
                <span>{transition.label}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {transition.description}
                </span>
              </div>
            </DropdownMenuItem>
          ))}

          {/* Sync status for fired shots */}
          {shot.state === "fired" && shot.alpacaOrderId && (
            <DropdownMenuItem onClick={handleSyncStatus} className="text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 mr-2"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <div className="flex flex-col">
                <span>Sync Order Status</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Check if order is filled
                </span>
              </div>
            </DropdownMenuItem>
          )}

          {/* Cancel order for fired shots */}
          {shot.state === "fired" && shot.alpacaOrderId && (
            <DropdownMenuItem onClick={handleCancelOrder} className="text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 mr-2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" x2="9" y1="9" y2="15" />
                <line x1="9" x2="15" y1="9" y2="15" />
              </svg>
              <div className="flex flex-col">
                <span>Cancel Order</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Cancel pending Alpaca order
                </span>
              </div>
            </DropdownMenuItem>
          )}

          {/* Close position for active shots - opens partial close dialog */}
          {shot.state === "active" && (
            <DropdownMenuItem
              onClick={() => setShowPartialCloseDialog(true)}
              className="text-orange-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 mr-2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" x2="9" y1="9" y2="15" />
                <line x1="9" x2="15" y1="9" y2="15" />
              </svg>
              <div className="flex flex-col">
                <span>Close Position</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Close all or partial shares
                </span>
              </div>
            </DropdownMenuItem>
          )}

          {(availableTransitions.length > 0 || shot.state === "active") && (canDelete || canCancel) && (
            <DropdownMenuSeparator />
          )}

          {canCancel && (
            <DropdownMenuItem
              onClick={() => handleCancel()}
              className="text-yellow-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 mr-2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="8" x2="16" y1="12" y2="12" />
              </svg>
              Cancel Shot
            </DropdownMenuItem>
          )}

          {canDelete && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 mr-2"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Delete Shot
            </DropdownMenuItem>
          )}

          {shot.state === "closed" && (
            <DropdownMenuItem disabled>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 mr-2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-muted-foreground">Position Closed</span>
            </DropdownMenuItem>
          )}

          {shot.state === "partially_closed" && (
            <DropdownMenuItem disabled>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 mr-2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="text-muted-foreground">
                Partially Closed ({shot.closedQuantity} shares)
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {shot.direction} shot for{" "}
              {symbol}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* State Transition Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingTransition?.label}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingTransition?.to === "fired" ? (
                <>
                  You are about to execute this {shot.direction} trade for{" "}
                  {symbol} at ${Number(shot.entryPrice).toFixed(2)}. This will
                  submit an order to your connected broker.
                  <br />
                  <br />
                  <strong>This action cannot be undone.</strong>
                </>
              ) : (
                <>
                  Are you sure you want to close this position for {symbol}?
                  This will mark the trade as complete.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingTransition) {
                  executeTransition(pendingTransition.to);
                }
              }}
              disabled={isPending}
            >
              {isPending ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Partial Close Dialog */}
      <PartialCloseDialog
        open={showPartialCloseDialog}
        onOpenChange={setShowPartialCloseDialog}
        shot={shot}
        symbol={symbol}
      />
    </>
  );
}
