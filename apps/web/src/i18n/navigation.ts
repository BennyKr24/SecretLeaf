/**
 * Localized navigation utilities generated from the routing config.
 * Import Link, useRouter, usePathname from here instead of next/navigation
 * so that locale is handled automatically by next-intl.
 *
 * Usage (locale switching):
 *   const router = useRouter();
 *   router.replace(pathname, { locale: "en" });
 */
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
