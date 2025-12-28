"use client";

import { useRouter } from "next/navigation";
import { OrphanPositionsSection } from "./orphan-positions-section";
import type { OrphanPosition } from "@/app/actions/orphan-positions";

interface PortfolioOrphansWrapperProps {
  orphanPositions: OrphanPosition[];
}

export function PortfolioOrphansWrapper({
  orphanPositions,
}: PortfolioOrphansWrapperProps) {
  const router = useRouter();

  const handleAdoptSuccess = () => {
    // Refresh the page to get updated orphan positions
    router.refresh();
  };

  return (
    <OrphanPositionsSection
      orphanPositions={orphanPositions}
      onAdoptSuccess={handleAdoptSuccess}
    />
  );
}
