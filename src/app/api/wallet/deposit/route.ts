import { NextResponse } from "next/server";
import { generateDepositAddress } from "@/lib/api/wallet";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      {
        error: "userId is required.",
      },
      { status: 400 },
    );
  }

  try {
    const payload = await generateDepositAddress(userId);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate deposit address.",
      },
      { status: 500 },
    );
  }
}
