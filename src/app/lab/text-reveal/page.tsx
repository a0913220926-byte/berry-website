import type { Metadata } from "next";

import { TextReveal } from "@/components/text-reveal";

export const metadata: Metadata = {
  title: "Text Reveal Lab | BERRY",
  description:
    "Scroll-triggered SplitText line reveal lab for BERRY service modules.",
};

export default function TextRevealLabPage() {
  return <TextReveal />;
}
