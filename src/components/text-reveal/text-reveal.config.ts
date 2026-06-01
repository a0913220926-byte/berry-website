export type TextRevealModule = {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  zh: string;
};

export type TextRevealCssVariables = Record<`--${string}`, string | number>;

export const textRevealConfig = {
  assets: {
    imagesDirectory: "/images/text-reveal/",
    heroBackgroundImage: "",
    heroBackgroundImageMobile: "",
    modulePlaceholderImage: "",
  },
  copy: {
    kicker: "BERRY / TEXT REVEAL LAB",
    heroTitle: "We shape quiet ideas into visible systems.",
    modules: [
      {
        number: "01",
        title: "Brand Strategy",
        subtitle: "品牌策略",
        description: "Define the direction before creating the vision.",
        zh: "先定義方向，再創造被記住的品牌視覺。",
      },
      {
        number: "02",
        title: "Visual Design",
        subtitle: "視覺設計",
        description: "Turn brand personality into a clear visual language.",
        zh: "把品牌個性，轉化成清楚、有質感的視覺語言。",
      },
      {
        number: "03",
        title: "Web Experience",
        subtitle: "網站體驗",
        description: "Build immersive websites that feel alive.",
        zh: "打造有互動感、沉浸感，並且真正能被記住的網站體驗。",
      },
      {
        number: "04",
        title: "Content Marketing",
        subtitle: "內容行銷",
        description: "Create content that connects, communicates, and converts.",
        zh: "讓內容不只是曝光，而是能溝通、建立信任並帶來轉換。",
      },
      {
        number: "05",
        title: "Digital Campaign",
        subtitle: "數位整合",
        description: "Connect design, media, traffic, and conversion into one system.",
        zh: "整合設計、廣告、流量與轉換，讓行銷不再各做各的。",
      },
      {
        number: "06",
        title: "Growth System",
        subtitle: "成長系統",
        description: "Make every brand touchpoint work with purpose.",
        zh: "讓每一個品牌接觸點，都有策略、有節奏、有成果。",
      },
    ] satisfies TextRevealModule[],
  },
  animation: {
    lenis: {
      lerp: 0.065,
      wheelMultiplier: 0.58,
    },
    splitText: {
      type: "lines",
      mask: "lines",
      fromY: "115%",
      toY: "0%",
      hiddenAutoAlpha: 0.01,
      visibleAutoAlpha: 1,
      duration: 1,
      stagger: 0.1,
      ease: "power4.out",
      start: "top 75%",
      titleDelay: 0.02,
      descriptionDelay: 0.12,
      zhDelay: 0.22,
    },
    hero: {
      delay: 0.1,
      resetDelayMs: 140,
      autoReplayMs: 7600,
      leavePointViewportRatio: 0.86,
      replayPointViewportRatio: 0.12,
      autoReplayMaxScrollRatio: 0.62,
    },
    module: {
      activeStart: "top 58%",
      activeEnd: "bottom 42%",
      inactiveOpacity: 0.38,
      inactiveBlur: "0.7px",
      inactiveScale: 0.985,
      activeScale: 1,
      moduleHeight: "128svh",
      mobileModuleHeight: "112svh",
    },
    visual: {
      fromYPercent: -8,
      toYPercent: 8,
      fromScale: 1.06,
      toScale: 1,
      fromBlur: "blur(10px)",
      toBlur: "blur(0px)",
      scrub: 0.8,
    },
    backdrop: {
      yPercent: 8,
      scale: 1.04,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
    },
  },
  cssVariables: {
    "--text-reveal-module-height": "128svh",
    "--text-reveal-mobile-module-height": "112svh",
    "--text-reveal-module-inactive-opacity": 0.38,
    "--text-reveal-module-inactive-blur": "0.7px",
    "--text-reveal-module-inactive-scale": 0.985,
    "--text-reveal-module-active-scale": 1,
  } satisfies TextRevealCssVariables,
};
