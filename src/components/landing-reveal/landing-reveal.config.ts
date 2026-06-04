export type LandingRevealNavItem = {
  label: string;
  href: string;
};

export type LandingRevealIntroImage = {
  src?: string;
  alt?: string;
  label: string;
  tone: "stone" | "sage" | "charcoal" | "ivory" | "rose";
};

export type LandingRevealCopy = {
  brand?: string;
  navItems?: LandingRevealNavItem[];
  eyebrow?: string;
  heroTitle?: string;
  introLabel?: string;
  preloaderCounter?: string;
  preloaderStatus?: string;
  preloaderSource?: string;
  socialLead?: string;
  socialLinks?: LandingRevealNavItem[];
  footerNote?: string;
};

export type LandingRevealAnimationConfig = {
  easings: {
    hop: string;
    glide: string;
  };
  preloader: {
    delay: number;
    lineDuration: number;
    lineExitDuration: number;
    lineExitDelay: number;
    clipDuration: number;
    clipDelay: number;
  };
  introImages: {
    scale: number;
    gap: number;
    offscreenRatio: number;
    rotations: number[];
    duration: number;
    stagger: number;
    dealDelay: number;
    spreadOverlap: number;
    exitDuration: number;
    exitXPercent: number;
  };
  heroImage: {
    delay: number;
    duration: number;
  };
  reveal: {
    lineY: string;
    duration: number;
    stagger: number;
    navDuration: number;
    socialDuration: number;
    textLead: number;
    socialOffset: number;
  };
};

export type LandingRevealCssVariables = Record<`--${string}`, string | number>;

export type LandingRevealConfig = {
  copy: LandingRevealCopy;
  assets: {
    imagesDirectory: string;
    heroImageIndex?: number;
    heroImage?: LandingRevealIntroImage;
    introImages: LandingRevealIntroImage[];
  };
  animation: LandingRevealAnimationConfig;
  cssVariables: LandingRevealCssVariables;
};

export const landingRevealConfig = {
  copy: {
    brand: "Foundry & Form",
    navItems: [
      { label: "Work", href: "#work" },
      { label: "Catalogue", href: "#catalogue" },
      { label: "About", href: "#about" },
    ],
    eyebrow: "Industrial Design Consultancy",
    heroTitle:
      "We design objects that carry the weight of their own conviction, where every curve and joint exists not for beauty but because the material demanded it.",
    introLabel: "Steelworks landing page reveal",
    preloaderCounter: "00-100",
    preloaderStatus: "Loading study",
    preloaderSource: "BERRY EFFECTS LAB",
    socialLead: "Say Hello",
    socialLinks: [
      { label: "info@foundryandform.com", href: "mailto:info@foundryandform.com" },
      { label: "View Enquiries", href: "#enquiries" },
    ],
  },
  assets: {
    imagesDirectory: "/images/landing-reveal/",
    heroImageIndex: 2,
    heroImage: {
      alt: "Monochrome editorial portrait placeholder",
      label: "Hero study",
      tone: "charcoal",
    },
    introImages: [
      {
        alt: "Gallery image one",
        label: "01 / Cast object",
        tone: "stone",
      },
      {
        alt: "Gallery image two",
        label: "02 / Textile form",
        tone: "sage",
      },
      {
        alt: "Gallery image three",
        label: "03 / Portrait crop",
        tone: "charcoal",
      },
      {
        alt: "Gallery image four",
        label: "04 / Metal surface",
        tone: "ivory",
      },
      {
        alt: "Gallery image five",
        label: "05 / Catalogue card",
        tone: "rose",
      },
    ],
  },
  animation: {
    easings: {
      hop: "0.9, 0, 0.1, 1",
      glide: "0.8, 0, 0.2, 1",
    },
    preloader: {
      delay: 1,
      lineDuration: 1.5,
      lineExitDuration: 1,
      lineExitDelay: 0.06,
      clipDuration: 1,
      clipDelay: 0.1,
    },
    introImages: {
      scale: 0.2,
      gap: 72,
      offscreenRatio: 1.12,
      rotations: [-15, 5, -7.5, 10, -2.5],
      duration: 1.95,
      stagger: 0.075,
      dealDelay: 0.02,
      spreadOverlap: 0.18,
      exitDuration: 2.14,
      exitXPercent: 100,
    },
    heroImage: {
      delay: 0.14,
      duration: 2.18,
    },
    reveal: {
      lineY: "125%",
      duration: 0.78,
      stagger: 0.06,
      navDuration: 0.72,
      socialDuration: 0.72,
      textLead: 0.42,
      socialOffset: 0.12,
    },
  },
  cssVariables: {
    "--landing-reveal-bg": "#222221",
    "--landing-reveal-ink": "#ffffff",
    "--landing-reveal-muted": "rgba(255, 255, 255, 0.78)",
    "--landing-reveal-panel": "#0a0a09",
    "--landing-reveal-paper": "#f5f2ec",
    "--landing-reveal-border": "rgba(255, 255, 255, 0.18)",
    "--landing-reveal-card-radius": "0.5rem",
  },
} satisfies LandingRevealConfig;
