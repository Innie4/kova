import {
  KycDocumentStatus,
  KycDocumentType,
  KycStatus,
} from "@prisma/client";
import { createHash } from "node:crypto";
import {
  getAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase";
import { writeAttestation } from "@/lib/kite/client";
import { db } from "@/server/db";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

type KycDependencies = {
  db: typeof db;
  writeAttestation: typeof writeAttestation;
  uploadFile: (path: string, file: File) => Promise<{
    path: string;
    storageMode: "supabase" | "simulated";
  }>;
};

const defaultDependencies: KycDependencies = {
  db,
  writeAttestation,
  uploadFile: async (path, file) => {
    if (!isSupabaseAdminConfigured()) {
      return {
        path,
        storageMode: "simulated",
      };
    }

    const bucket = process.env.SUPABASE_STORAGE_KYC_BUCKET ?? "kyc-documents";
    const supabase = getAdminSupabaseClient();
    const arrayBuffer = await file.arrayBuffer();
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, Buffer.from(arrayBuffer), {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    return {
      path,
      storageMode: "supabase",
    };
  },
};

function normalizeDocumentType(value: string) {
  switch (value.toLowerCase()) {
    case "passport":
      return KycDocumentType.PASSPORT;
    case "national_id":
    case "national-id":
    case "national id":
      return KycDocumentType.NATIONAL_ID;
    case "drivers_license":
    case "driver's license":
    case "drivers-license":
    case "driver-license":
      return KycDocumentType.DRIVERS_LICENSE;
    default:
      throw new Error("Unsupported KYC document type.");
  }
}

function assertValidFile(file: File, fieldName: string) {
  if (!allowedMimeTypes.has(file.type)) {
    throw new Error(
      `${fieldName} must be a PNG, JPG, or PDF document.`,
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`${fieldName} exceeds the 10MB upload limit.`);
  }
}

export function validateKycUploadForm(formData: FormData) {
  const userId = formData.get("userId");
  const documentType = formData.get("documentType");
  const front = formData.get("front");
  const back = formData.get("back");

  if (typeof userId !== "string" || !userId) {
    throw new Error("userId is required.");
  }

  if (typeof documentType !== "string" || !documentType) {
    throw new Error("documentType is required.");
  }

  if (!(front instanceof File) || front.size === 0) {
    throw new Error("A front document upload is required.");
  }

  assertValidFile(front, "Front document");

  if (back instanceof File && back.size > 0) {
    assertValidFile(back, "Back document");
  }

  return {
    userId,
    documentType: normalizeDocumentType(documentType),
    front,
    back: back instanceof File && back.size > 0 ? back : null,
  };
}

function buildStoragePath(
  userId: string,
  side: "front" | "back",
  file: File,
  metadataHash: string,
) {
  const extension = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : ".bin";

  return `kyc/${userId}/${metadataHash}-${side}${extension}`;
}

export async function uploadKycDocuments(
  formData: FormData,
  overrides: Partial<KycDependencies> = {},
) {
  const dependencies = {
    ...defaultDependencies,
    ...overrides,
  };
  const parsed = validateKycUploadForm(formData);
  const metadataHash = createHash("sha256")
    .update(
      JSON.stringify({
        userId: parsed.userId,
        documentType: parsed.documentType,
        front: {
          name: parsed.front.name,
          size: parsed.front.size,
          type: parsed.front.type,
        },
        back: parsed.back
          ? {
              name: parsed.back.name,
              size: parsed.back.size,
              type: parsed.back.type,
            }
          : null,
      }),
    )
    .digest("hex");

  const frontPath = buildStoragePath(
    parsed.userId,
    "front",
    parsed.front,
    metadataHash,
  );
  const backPath = parsed.back
    ? buildStoragePath(parsed.userId, "back", parsed.back, metadataHash)
    : null;

  const [frontUpload, backUpload] = await Promise.all([
    dependencies.uploadFile(frontPath, parsed.front),
    parsed.back && backPath
      ? dependencies.uploadFile(backPath, parsed.back)
      : Promise.resolve(null),
  ]);

  const attestation = await dependencies.writeAttestation(
    `kyc:${parsed.userId}`,
    {
      type: "kyc_document_metadata",
      userId: parsed.userId,
      documentType: parsed.documentType,
      metadataHash,
      frontPath,
      backPath,
      timestamp: new Date().toISOString(),
    },
  );

  const document = await dependencies.db.kycDocument.create({
    data: {
      userId: parsed.userId,
      documentType: parsed.documentType,
      frontPath,
      backPath,
      metadataHash: `0x${metadataHash}`,
      attestationHash: attestation.attestationHash,
      status: KycDocumentStatus.UPLOADED,
    },
  });

  await dependencies.db.user.update({
    where: {
      id: parsed.userId,
    },
    data: {
      kycStatus: KycStatus.SUBMITTED,
    },
  });

  return {
    documentId: document.id,
    userId: parsed.userId,
    metadataHash: `0x${metadataHash}`,
    attestationHash: attestation.attestationHash,
    frontPath: frontUpload.path,
    backPath: backUpload?.path ?? null,
    storageMode:
      frontUpload.storageMode === "supabase" ||
      backUpload?.storageMode === "supabase"
        ? "supabase"
        : "simulated",
    status: document.status,
  };
}

export async function verifyKycSubmission(
  params: {
    userId: string;
    documentId?: string;
  },
  overrides: Partial<KycDependencies> = {},
) {
  const dependencies = {
    ...defaultDependencies,
    ...overrides,
  };

  const document =
    params.documentId
      ? await dependencies.db.kycDocument.update({
          where: {
            id: params.documentId,
          },
          data: {
            status: KycDocumentStatus.VERIFIED,
          },
        })
      : await dependencies.db.kycDocument.findFirst({
          where: {
            userId: params.userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

  if (!document) {
    throw new Error("KYC document not found.");
  }

  if (!params.documentId) {
    await dependencies.db.kycDocument.update({
      where: {
        id: document.id,
      },
      data: {
        status: KycDocumentStatus.VERIFIED,
      },
    });
  }

  await dependencies.db.user.update({
    where: {
      id: params.userId,
    },
    data: {
      kycStatus: KycStatus.VERIFIED,
    },
  });

  return {
    userId: params.userId,
    documentId: document.id,
    status: KycStatus.VERIFIED,
    verifiedAt: new Date().toISOString(),
  };
}
