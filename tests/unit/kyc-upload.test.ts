import { KycDocumentType } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { validateKycUploadForm } from "@/lib/api/kyc";

describe("kyc upload validation", () => {
  it("accepts valid file types", () => {
    const formData = new FormData();
    formData.set("userId", "user_123");
    formData.set("documentType", "passport");
    formData.set(
      "front",
      new File(["front"], "passport-front.png", {
        type: "image/png",
      }),
    );
    formData.set(
      "back",
      new File(["back"], "passport-back.pdf", {
        type: "application/pdf",
      }),
    );

    const result = validateKycUploadForm(formData);

    expect(result.userId).toBe("user_123");
    expect(result.documentType).toBe(KycDocumentType.PASSPORT);
    expect(result.front.name).toBe("passport-front.png");
    expect(result.back?.name).toBe("passport-back.pdf");
  });

  it("rejects invalid file types", () => {
    const formData = new FormData();
    formData.set("userId", "user_123");
    formData.set("documentType", "passport");
    formData.set(
      "front",
      new File(["front"], "passport-front.txt", {
        type: "text/plain",
      }),
    );

    expect(() => validateKycUploadForm(formData)).toThrow(
      "Front document must be a PNG, JPG, or PDF document.",
    );
  });
});
