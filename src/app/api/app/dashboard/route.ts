import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/api/app-state";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getDashboardSnapshot();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load dashboard data.",
      },
      { status: 500 },
    );
  }
}
