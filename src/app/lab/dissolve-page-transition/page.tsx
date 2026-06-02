import type { Metadata } from "next";

import { DissolvePageTransition } from "@/components/dissolve-page-transition";

export const metadata: Metadata = {
  title: "Dissolve Page Transition Lab | BERRY",
  description:
    "Scroll-triggered WebGL dissolve page transition lab using Three.js shaders and GSAP ScrollTrigger.",
};

export default function DissolvePageTransitionLabPage() {
  return <DissolvePageTransition />;
}

