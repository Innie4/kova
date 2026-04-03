import { NextResponse } from "next/server";
import { getWalletBalanceSnapshot } from "@/lib/api/wallet";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? undefined;
  const address = searchParams.get("address") ?? undefined;

  if (!userId && !address) {
    return NextResponse.json(
      {
        error: "A userId or address is required.",
      },
      { status: 400 },
    );
  }

  try {
    const payload = await getWalletBalanceSnapshot({
      userId,
      address,
    });

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch wallet balance.",
      },
      { status: 500 },
    );
  }
}
