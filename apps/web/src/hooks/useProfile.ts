"use client";

// ────────────────────────────────────────────────────────────────────────────
// useProfile — User Profile State Hook
//
// Manages editable profile data (name, avatarUrl) in localStorage.
// Keyed per user: secretleaf.profile.{userId}
// After saving, dispatches "secretleaf:profileUpdated" so useAuth re-hydrates
// displayName in the navigation without a page reload.
// ────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from "react";
import type { UserProfile } from "@/lib/types";

const PROFILE_KEY_PREFIX = "secretleaf.profile.";

export type SaveState = "idle" | "saving" | "success" | "error";

export type ProfileState = {
  name: string;
  avatarUrl: string | undefined;
  saveState: SaveState;
  updateName: (name: string) => Promise<void>;
};

// ── Storage helpers ───────────────────────────────────────────────────────────

function readProfile(userId: string): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY_PREFIX + userId);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

function writeProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY_PREFIX + profile.userId, JSON.stringify(profile));
  // Notify useAuth (same tab) to re-hydrate displayName
  window.dispatchEvent(new Event("secretleaf:profileUpdated"));
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Provides editable profile data for the current user.
 *
 * @param userId   — the logged-in user's id
 * @param fallback — username as fallback when no profile name is saved
 */
export function useProfile(
  userId: string | undefined,
  fallback: string
): ProfileState {
  const [name, setName] = useState(fallback);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Load from localStorage on mount / when userId changes
  useEffect(() => {
    if (!userId) return;
    const stored = readProfile(userId);
    if (stored) {
      setName(stored.name);
      setAvatarUrl(stored.avatarUrl);
    } else {
      setName(fallback);
    }
  }, [userId, fallback]);

  const updateName = useCallback(
    async (newName: string) => {
      if (!userId) return;
      setSaveState("saving");
      try {
        const existing = readProfile(userId);
        const profile: UserProfile = {
          userId,
          name: newName,
          ...(existing?.avatarUrl ? { avatarUrl: existing.avatarUrl } : {}),
        };
        writeProfile(profile);
        setName(newName);
        setSaveState("success");
        setTimeout(() => setSaveState("idle"), 2500);
      } catch {
        setSaveState("error");
        setTimeout(() => setSaveState("idle"), 3000);
      }
    },
    [userId]
  );

  return { name, avatarUrl, saveState, updateName };
}
