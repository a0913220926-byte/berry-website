"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import { brandRevealConfig } from "./brand-reveal.config";
import { logoData } from "./logo";
import styles from "./brand-reveal.module.css";

const WORD_ASPECT_RATIO = 3840 / 1400;
const clamp01 = gsap.utils.clamp(0, 1);

function segment(progress: number, start: number, end: number) {
  return clamp01(gsap.utils.mapRange(start, end, 0, 1, progress));
}

type WordBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function BrandReveal() {
  const {
    assets,
    copy: { cards: brandRevealCards },
  } = brandRevealConfig;

  void brandRevealCards;
  void logoData;

  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);
  const wordMarkRef = useRef<HTMLDivElement>(null);
  const wordMaskSvgRef = useRef<SVGSVGElement>(null);
  const wordMaskDefRef = useRef<SVGMaskElement>(null);
  const wordMaskBaseRectRef = useRef<SVGRectElement>(null);
  const wordMaskImageRef = useRef<SVGImageElement>(null);
  const wordFillImageRef = useRef<SVGImageElement>(null);
  const wordMaskRectRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = rootRef.current;
    const stage = stageRef.current;
    const background = backgroundRef.current;
    const foreground = foregroundRef.current;
    const wordMark = wordMarkRef.current;
    const wordMaskSvg = wordMaskSvgRef.current;
    const wordMaskDef = wordMaskDefRef.current;
    const wordMaskBaseRect = wordMaskBaseRectRef.current;
    const wordMaskImage = wordMaskImageRef.current;
    const wordFillImage = wordFillImageRef.current;
    const wordMaskRect = wordMaskRectRef.current;

    if (
      !root ||
      !stage ||
      !background ||
      !foreground ||
      !wordMark ||
      !wordMaskSvg ||
      !wordMaskDef ||
      !wordMaskBaseRect ||
      !wordMaskImage ||
      !wordFillImage ||
      !wordMaskRect
    ) {
      return;
    }

    /**
     * Core Brand Reveal Animation
     *
     * This block controls the SVG mask reveal effect.
     * The animation depends on:
     * - logoData path
     * - getBBox()
     * - getBoundingClientRect()
     * - ScrollTrigger progress
     * - Lenis smooth scrolling
     *
     * Safe to replace:
     * - hero image
     * - word mark image
     * - card copy
     * - logoData path
     *
     * Be careful modifying:
     * - mask transform logic
     * - progress mapping
     * - ScrollTrigger onUpdate
     * - Lenis lifecycle
     * - resize recalculation
     */
    const ctx = gsap.context(() => {
      const lenis = new Lenis({
        lerp: 0.08,
        wheelMultiplier: 0.9,
      });

      lenis.on("scroll", ScrollTrigger.update);

      const tickLenis = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickLenis);
      gsap.ticker.lagSmoothing(0);

      let finalWordBox: WordBox = {
        x: 360,
        y: 160,
        width: 720,
        height: 263,
      };
      let stageWidth = 1440;
      let stageHeight = 1000;
      let currentProgress = 0;

      const calculateWordBox = () => {
        const stageRect = stage.getBoundingClientRect();
        const wordRect = wordMark.getBoundingClientRect();

        stageWidth = Math.max(1, stageRect.width);
        stageHeight = Math.max(1, stageRect.height);

        wordMaskSvg.setAttribute("viewBox", `0 0 ${stageWidth} ${stageHeight}`);
        wordMaskDef.setAttribute("width", stageWidth.toFixed(3));
        wordMaskDef.setAttribute("height", stageHeight.toFixed(3));
        wordMaskBaseRect.setAttribute("width", stageWidth.toFixed(3));
        wordMaskBaseRect.setAttribute("height", stageHeight.toFixed(3));
        wordMaskRect.setAttribute("width", stageWidth.toFixed(3));
        wordMaskRect.setAttribute("height", stageHeight.toFixed(3));

        finalWordBox = {
          x: wordRect.left - stageRect.left,
          y: wordRect.top - stageRect.top,
          width: wordRect.width,
          height: wordRect.height,
        };
      };

      const setWordImageBox = (box: WordBox) => {
        [wordMaskImage, wordFillImage].forEach((image) => {
          image.setAttribute("x", box.x.toFixed(3));
          image.setAttribute("y", box.y.toFixed(3));
          image.setAttribute("width", box.width.toFixed(3));
          image.setAttribute("height", box.height.toFixed(3));
        });
      };

      const renderProgress = (progress: number) => {
        currentProgress = progress;

        const firstFade = segment(progress, 0.006, 0.035);
        const maskIn = segment(progress, 0.034, 0.052);
        const maskTravel = segment(progress, 0.05, 0.96);
        const wordWhiten = segment(progress, 0.42, 1);

        const easedTravel = 1 - Math.pow(1 - maskTravel, 2.35);
        const centerX = finalWordBox.x + finalWordBox.width / 2;
        const centerY = finalWordBox.y + finalWordBox.height / 2;
        const nearScale = gsap.utils.interpolate(
          4.2,
          1,
          easedTravel,
        );
        const maskWidth = finalWordBox.width * nearScale;
        const maskHeight = maskWidth / WORD_ASPECT_RATIO;
        const liftedCenterY = gsap.utils.interpolate(
          centerY - stageHeight * 0.24,
          centerY,
          easedTravel,
        );
        const wordBox: WordBox = {
          x: centerX - maskWidth / 2,
          y: liftedCenterY - maskHeight / 2,
          width: maskWidth,
          height: maskHeight,
        };

        setWordImageBox(wordBox);

        gsap.set(background, {
          scale: gsap.utils.interpolate(1, 1.08, segment(progress, 0.05, 0.62)),
          autoAlpha: 1,
        });
        gsap.set(foreground, {
          scale: gsap.utils.interpolate(1.02, 1.14, segment(progress, 0.05, 0.62)),
          autoAlpha:
            gsap.utils.interpolate(0.28, 0.36, segment(progress, 0, 0.18)) *
            (1 - wordWhiten),
        });
        gsap.set(wordMark, {
          scale: gsap.utils.interpolate(1, 1.04, firstFade),
          autoAlpha: 1 - firstFade,
        });
        gsap.set(wordMaskSvg, {
          autoAlpha: maskIn,
        });
        gsap.set(wordMaskRect, {
          attr: {
            opacity: "1",
          },
        });
        gsap.set(wordFillImage, {
          attr: {
            opacity: gsap.utils.interpolate(0, 1, wordWhiten).toFixed(3),
          },
        });
      };

      calculateWordBox();
      renderProgress(0);

      const trigger = ScrollTrigger.create({
        id: "brand-reveal-scroll",
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => renderProgress(self.progress),
        onRefresh: (self) => {
          calculateWordBox();
          renderProgress(self.progress || currentProgress);
        },
      });

      const handleResize = () => {
        calculateWordBox();
        renderProgress(trigger.progress || currentProgress);
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", handleResize);
      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        window.removeEventListener("resize", handleResize);
        trigger.kill();
        ScrollTrigger.getAll()
          .filter((item) => item.vars.id === "brand-reveal-scroll")
          .forEach((item) => item.kill());
        gsap.ticker.remove(tickLenis);
        lenis.off("scroll", ScrollTrigger.update);
        lenis.destroy();
      };
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className={styles.brandReveal}>
      <div ref={stageRef} className={styles.stage}>
        <div ref={backgroundRef} className={styles.background}>
          <Image
            src={assets.heroImage}
            alt="BERRY hero flow background"
            fill
            priority
            sizes="100vw"
            className={styles.backgroundImage}
          />
        </div>

        <div ref={foregroundRef} className={styles.foreground}>
          <Image
            src={assets.heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.foregroundImage}
          />
        </div>

        <div className={styles.gridLayer} />
        <div className={styles.noiseLayer} />

        <div ref={wordMarkRef} className={styles.wordMark}>
          <Image
            src={assets.wordMark}
            alt="BERRY"
            width={3840}
            height={1400}
            priority
            className={styles.wordMarkImage}
          />
        </div>

        <svg
          ref={wordMaskSvgRef}
          className={styles.wordMaskSvg}
          viewBox="0 0 1440 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <filter id="berryWordMaskBlack" colorInterpolationFilters="sRGB">
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              />
            </filter>
            <mask
              ref={wordMaskDefRef}
              id="berryWordCutoutMask"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="1440"
              height="1000"
            >
              <rect
                ref={wordMaskBaseRectRef}
                width="1440"
                height="1000"
                fill="white"
              />
              <image
                ref={wordMaskImageRef}
                id="wordMask"
                href={assets.wordMark}
                x="360"
                y="160"
                width="720"
                height="263"
                preserveAspectRatio="xMidYMid meet"
                filter="url(#berryWordMaskBlack)"
              />
            </mask>
          </defs>
          <rect
            ref={wordMaskRectRef}
            width="1440"
            height="1000"
            fill="#000"
            opacity="1"
            mask="url(#berryWordCutoutMask)"
          />
          <image
            ref={wordFillImageRef}
            href={assets.wordMark}
            x="360"
            y="160"
            width="720"
            height="263"
            opacity="0"
            preserveAspectRatio="xMidYMid meet"
          />
        </svg>
      </div>
    </section>
  );
}
