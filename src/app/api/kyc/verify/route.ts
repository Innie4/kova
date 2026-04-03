import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyKycSubmission } from "@/lib/api/kyc";

const verifySchema = z.object({
  userId: z.string().min(1),
  documentId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const body = verifySchema.parse(await request.json());
    const payload = await verifyKycSubmission(body);
    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to verify KYC record.";
    const status = /required|not found|invalid/i.test(message) ? 400 : 500;

    return NextResponse.json(
      {
        error: message,
      },
      { status },
    );
  }
}
