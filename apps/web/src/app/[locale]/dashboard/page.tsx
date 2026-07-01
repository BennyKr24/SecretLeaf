// /dashboard → permanent redirect to /dashboard/user (the Grow Dashboard)
// The old marketplace code has been superseded by the Grow OS architecture.
// Phase 5 will build the full Grow Dashboard at /dashboard/user.

import { redirect } from "@/i18n/navigation";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/dashboard/user", locale });
}
