import { NextResponse } from "next/server";
import { getWalletSnapshot } from "@/lib/api/app-state";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getWalletSnapshot();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load wallet data.",
      },
      { status: 500 },
    );
  }
}
