// /dashboard → permanent redirect to /dashboard/user (the Grow Dashboard)
// The old marketplace code has been superseded by the Grow OS architecture.
// Phase 5 will build the full Grow Dashboard at /dashboard/user.

import { redirect } from "next/navigation";

export default function DashboardPage() {
  redirect("/dashboard/user");
}
