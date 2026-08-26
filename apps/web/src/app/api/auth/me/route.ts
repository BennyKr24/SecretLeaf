import { getAuthenticatedUserWithRole } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUserWithRole(request);
    if (!authUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return Response.json({
      user: {
        id: authUser.userId,
        email: authUser.email,
        role: authUser.role,
        plan: authUser.plan,
        planSource: authUser.planSource,
        trialRedeemed: authUser.trialRedeemed,
        currentPeriodEnd: authUser.currentPeriodEnd,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to resolve current user";
    return Response.json({ error: message }, { status: 500 });
  }
}
