import { TransferStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getHistorySnapshot } from "@/lib/api/app-state";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const payload = await getHistorySnapshot({
      status:
        status && status in TransferStatus
          ? (status as TransferStatus)
          : undefined,
    });

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load history data.",
      },
      { status: 500 },
    );
  }
}
