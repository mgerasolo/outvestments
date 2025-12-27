"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getPreferences,
  savePreferences,
  UserPreferences,
} from "@/lib/user-preferences";

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    colorblindMode: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPreferences(getPreferences());
    setIsLoading(false);
  }, []);

  const updatePreferences = useCallback(
    (updates: Partial<UserPreferences>) => {
      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);
      savePreferences(newPreferences);
    },
    [preferences]
  );

  return {
    preferences,
    updatePreferences,
    isLoading,
  };
}
