export type DissolvePageTransitionSection = {
  variant?: "image" | "light" | "dark";
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
};

export type DissolvePageTransitionBreakpoint = {
  maxPixelRatio: number;
  scrollHeight: number;
  noiseScale: number;
  threshold: number;
  smoothness: number;
  displacementStrength: number;
  textureSize: number;
};

export type DissolvePageTransitionTextMotion = {
  switchAt: number;
  fadeStart: number;
  fadeEnd: number;
  titleY: number;
  subtitleY: number;
  wordFromY: string;
  wordDuration: number;
  wordStagger: number;
  wordEase: string;
};

export type DissolvePageTransitionConfig = {
  sections: DissolvePageTransitionSection[];
  fallbackSection: DissolvePageTransitionSection;
  scrollHeight: number;
  transitionDuration: number;
  noiseScale: number;
  threshold: number;
  smoothness: number;
  displacementStrength: number;
  shaderQuality: "low" | "medium" | "high";
  maskPull: number;
  enableSmoothScroll: boolean;
  enableWordReveal: boolean;
  desktop: DissolvePageTransitionBreakpoint;
  mobile: DissolvePageTransitionBreakpoint;
  fallbackMode: "procedural-gradient" | "pure-color" | "css-gradient";
  textMotion: DissolvePageTransitionTextMotion;
};

export const dissolvePageTransitionConfig: DissolvePageTransitionConfig = {
  sections: [
    {
      variant: "image",
      title: "MORPHOGENESIS",
      subtitle: "Solid form gives way to liquid movement.",
      description: "AN UNDERLYING FIELD OF MOTION PUSHES AND PULLS THE IMAGE ACROSS ITS SURFACE.",
      image: "/images/dissolve-page-transition/section-01.jpg",
      backgroundColor: "#07110d",
      textColor: "#d6b46a",
      accentColor: "#f1d27a",
    },
    {
      variant: "light",
      title: "DISSOLUTION",
      subtitle: "A page dissolves into the next.",
      description: "THE SURFACE BREAKS APART THROUGH A NOISE FIELD THAT FEELS ORGANIC AND CONSTANTLY IN FLUX.",
      image: "/images/dissolve-page-transition/section-02.jpg",
      backgroundColor: "#ebf5df",
      textColor: "#080906",
      accentColor: "#0f130d",
    },
    {
      variant: "dark",
      title: "REASSEMBLY",
      subtitle: "The next scene appears through the same field.",
      description: "A NEW COMPOSITION EMERGES FROM THE SAME DISSOLVING MASK, CARRYING THE MOTION FORWARD.",
      image: "/images/dissolve-page-transition/section-03.jpg",
      backgroundColor: "#050605",
      textColor: "#ebf5df",
      accentColor: "#d7bf75",
    },
  ],
  fallbackSection: {
    variant: "image",
    title: "DISSOLVE",
    subtitle: "Add at least two sections to see the page transition.",
    description: "THE MODULE FALLS BACK TO A SINGLE PROCEDURAL SCENE WHEN CONFIG HAS FEWER THAN TWO SECTIONS.",
    image: "",
    backgroundColor: "#07110d",
    textColor: "#d6b46a",
    accentColor: "#f1d27a",
  },
  scrollHeight: 1120,
  transitionDuration: 1,
  noiseScale: 15,
  threshold: 0.5,
  smoothness: 0.0012,
  displacementStrength: 0.012,
  shaderQuality: "high",
  maskPull: 1.2,
  enableSmoothScroll: true,
  enableWordReveal: true,
  desktop: {
    maxPixelRatio: 2,
    scrollHeight: 1120,
    noiseScale: 15,
    threshold: 0.5,
    smoothness: 0.0012,
    displacementStrength: 0.012,
    textureSize: 1536,
  },
  mobile: {
    maxPixelRatio: 1.35,
    scrollHeight: 880,
    noiseScale: 12,
    threshold: 0.42,
    smoothness: 0.002,
    displacementStrength: 0.006,
    textureSize: 1024,
  },
  fallbackMode: "procedural-gradient",
  textMotion: {
    switchAt: 0.66,
    fadeStart: 0.22,
    fadeEnd: 0.92,
    titleY: 18,
    subtitleY: 10,
    wordFromY: "115%",
    wordDuration: 0.42,
    wordStagger: 0.012,
    wordEase: "power3.out",
  },
} satisfies DissolvePageTransitionConfig;
