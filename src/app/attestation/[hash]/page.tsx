import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AttestationView } from "@/components/kova/attestation-view";
import { getDemoTransferByHash } from "@/lib/demo-data";
import { createPageMetadata } from "@/lib/metadata";

export function generateMetadata({
  params,
}: {
  params: { hash: string };
}): Metadata {
  const transfer = getDemoTransferByHash(params.hash);

  if (!transfer) {
    return {
      title: "Attestation Not Found | Kova",
    };
  }

  return createPageMetadata({
    title: `Attestation ${transfer.attestationHash.slice(0, 8)}...`,
    description: `Public proof for ${transfer.recipientName}'s transfer via ${transfer.routeLabel}.`,
    path: `/attestation/${params.hash}`,
  });
}

export default function AttestationPage({
  params,
}: {
  params: { hash: string };
}) {
  const transfer = getDemoTransferByHash(params.hash);

  if (!transfer) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(12,130,221,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(61,196,56,0.14),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-6 py-8 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <AttestationView transfer={transfer} />
      </div>
    </main>
  );
}
