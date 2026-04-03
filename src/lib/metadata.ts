import type { Metadata } from "next";

function getMetadataBase() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    return new URL(rawUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
}

const defaultImage = "/brand/kova-logo.png";

export const rootMetadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "Kova",
  description:
    "Kova is an autonomous remittance agent that compares rails, executes transfers, and writes verifiable proofs on Kite Chain.",
  openGraph: {
    title: "Kova",
    description:
      "Autonomous remittance with rail comparison, agent execution, and Kite Chain attestations.",
    images: [
      {
        url: defaultImage,
        alt: "Kova logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kova",
    description:
      "Autonomous remittance with rail comparison, agent execution, and Kite Chain attestations.",
    images: [defaultImage],
  },
};

export function createPageMetadata({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  return {
    title: `${title} | Kova`,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | Kova`,
      description,
      url: path,
      images: [
        {
          url: defaultImage,
          alt: "Kova logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Kova`,
      description,
      images: [defaultImage],
    },
  };
}
