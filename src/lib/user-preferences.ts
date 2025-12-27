// User preferences stored in localStorage (client-side)
// In the future, these will be synced with the database

export interface UserPreferences {
  colorblindMode: boolean;
  alpacaApiKey?: string;
  alpacaSecretKey?: string;
}

const PREFERENCES_KEY = "outvestments-preferences";

export function getPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return { colorblindMode: false };
  }

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load preferences:", error);
  }

  return { colorblindMode: false };
}

export function savePreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = getPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save preferences:", error);
  }
}

export function clearPreferences(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(PREFERENCES_KEY);
  } catch (error) {
    console.error("Failed to clear preferences:", error);
  }
}
