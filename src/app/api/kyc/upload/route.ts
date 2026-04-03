import { NextResponse } from "next/server";
import { uploadKycDocuments } from "@/lib/api/kyc";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payload = await uploadKycDocuments(formData);
    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload KYC documents.";
    const status = /required|must be|exceeds/i.test(message) ? 400 : 500;

    return NextResponse.json(
      {
        error: message,
      },
      { status },
    );
  }
}
