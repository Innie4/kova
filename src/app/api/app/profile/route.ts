import { NextResponse } from "next/server";
import { getProfileSnapshot } from "@/lib/api/app-state";

export async function GET() {
  try {
    const payload = await getProfileSnapshot();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load profile data.",
      },
      { status: 500 },
    );
  }
}
