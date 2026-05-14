"use client";

import { useCallback, useEffect, useState } from "react";
import type { ResourceViewMode } from "./resource-view";

function isResourceViewMode(value: string | null): value is ResourceViewMode {
  return value === "list" || value === "grid";
}

function readViewModePreference(storageKey: string): ResourceViewMode | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(storageKey);
    return isResourceViewMode(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeViewModePreference(storageKey: string, mode: ResourceViewMode) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, mode);
  } catch {
    // Keep the in-memory toggle responsive if browser storage is unavailable.
  }
}

export function useResourceViewModePreference(
  storageKey: string,
  defaultMode: ResourceViewMode = "list",
) {
  const [viewMode, setViewModeState] = useState<ResourceViewMode>(defaultMode);

  useEffect(() => {
    const stored = readViewModePreference(storageKey);
    if (stored) setViewModeState(stored);
  }, [storageKey]);

  const setViewMode = useCallback(
    (mode: ResourceViewMode) => {
      setViewModeState(mode);
      writeViewModePreference(storageKey, mode);
    },
    [storageKey],
  );

  return [viewMode, setViewMode] as const;
}
