"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { restoreSessionFromSupabase, logoutFromSupabase } from "@/lib/auth";
import type { SessionData } from "@/lib/types";

type AdminAuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "authenticated"; session: SessionData };

export function useAdminAuth(): AdminAuthState & { logout: () => Promise<void> } {
  const [state, setState] = useState<AdminAuthState>({ status: "loading" });

  useEffect(() => {
    void (async () => {
      const session = await restoreSessionFromSupabase();
      if (!session) {
        setState({ status: "unauthenticated" });
        return;
      }
      if (session.user.role !== "ADMIN") {
        setState({ status: "forbidden" });
        return;
      }
      setState({ status: "authenticated", session });
    })();
  }, []);

  const logout = useCallback(async () => {
    await logoutFromSupabase();
    setState({ status: "unauthenticated" });
  }, []);

  return useMemo(() => ({ ...state, logout }), [state, logout]);
}
