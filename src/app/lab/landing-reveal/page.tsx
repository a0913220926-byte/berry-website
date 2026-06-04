import type { Metadata } from "next";

import { LandingReveal } from "@/components/landing-reveal";

export const metadata: Metadata = {
  title: "Landing Reveal Lab | BERRY",
  description:
    "Preloader, intro image stack, CustomEase, and SplitText landing reveal lab.",
};

export default function LandingRevealLabPage() {
  return <LandingReveal />;
}
