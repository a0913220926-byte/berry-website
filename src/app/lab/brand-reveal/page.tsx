import type { Metadata } from "next";

import { BrandReveal } from "@/components/brand-reveal/brand-reveal";

export const metadata: Metadata = {
  title: "Brand Reveal Lab | BERRY",
  description:
    "BERRY brand reveal structure using the official logo path, wordmark, and hero flow visual assets.",
};

export default function BrandRevealLabPage() {
  return <BrandReveal />;
}
