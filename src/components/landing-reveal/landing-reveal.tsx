"use client";

import { type CSSProperties, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";

import {
  landingRevealConfig,
  type LandingRevealConfig,
  type LandingRevealCssVariables,
  type LandingRevealIntroImage,
} from "./landing-reveal.config";
import styles from "./landing-reveal.module.css";

gsap.registerPlugin(useGSAP, CustomEase, SplitText);

let customEasesReady = false;

type LandingRevealProps = {
  config?: LandingRevealConfig;
};

function ensureCustomEases(config: LandingRevealConfig) {
  if (customEasesReady) {
    return;
  }

  CustomEase.create("landingRevealHop", config.animation.easings.hop);
  CustomEase.create("landingRevealGlide", config.animation.easings.glide);
  customEasesReady = true;
}

function cx(...classNames: Array<string | false | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function getToneClass(tone: LandingRevealIntroImage["tone"]) {
  const toneClasses = {
    stone: styles.toneStone,
    sage: styles.toneSage,
    charcoal: styles.toneCharcoal,
    ivory: styles.toneIvory,
    rose: styles.toneRose,
  } satisfies Record<LandingRevealIntroImage["tone"], string>;

  return toneClasses[tone];
}

function getText(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function hideBrokenImage(event: React.SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.hidden = true;
}

function MediaPanel({
  image,
  isHero = false,
}: {
  image: LandingRevealIntroImage;
  isHero?: boolean;
}) {
  const label = getText(image.label, isHero ? "Hero image placeholder" : "Image placeholder");

  return (
    <div className={styles.mediaFrame}>
      <div className={cx(styles.mediaPlaceholder, getToneClass(image.tone))}>
        <span>{label}</span>
      </div>
      {image.src ? (
        <Image
          className={styles.image}
          src={image.src}
          alt={getText(image.alt, label)}
          fill
          sizes={isHero ? "100vw" : "22vw"}
          unoptimized
          onError={hideBrokenImage}
        />
      ) : null}
    </div>
  );
}

export function LandingReveal({ config = landingRevealConfig }: LandingRevealProps) {
  const rootRef = useRef<HTMLElement>(null);
  const rootStyle = config.cssVariables as LandingRevealCssVariables & CSSProperties;
  const copy = config.copy;
  const introImages = config.assets.introImages;
  const heroImage =
    config.assets.heroImage ??
    introImages[2] ??
    ({
      label: "Hero image placeholder",
      tone: "charcoal",
    } satisfies LandingRevealIntroImage);
  const baseIntroImages = introImages.length ? introImages : [heroImage];
  const requestedHeroCardIndex = config.assets.heroImageIndex ?? 2;
  const heroCardIndex = Math.min(
    Math.max(0, requestedHeroCardIndex),
    Math.max(0, baseIntroImages.length - 1),
  );
  const displayIntroImages = baseIntroImages.map((image, index) =>
    index === heroCardIndex ? heroImage : image,
  );
  const navItems = copy.navItems ?? [];
  const socialLinks = copy.socialLinks ?? [];

  useGSAP(
    () => {
      const root = rootRef.current;

      if (!root) {
        return;
      }

      ensureCustomEases(config);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const preloader = root.querySelector<HTMLElement>("[data-landing-preloader]");
      const loaderLine = root.querySelector<HTMLElement>("[data-landing-loader-line]");
      const hero = root.querySelector<HTMLElement>("[data-landing-hero]");
      const revealSurface = root.querySelector<HTMLElement>("[data-landing-surface]");
      const introCards = Array.from(
        root.querySelectorAll<HTMLElement>("[data-landing-intro-card]"),
      );
      const revealItems = Array.from(
        root.querySelectorAll<HTMLElement>("[data-landing-reveal-item]"),
      );
      const splitTargets = Array.from(
        root.querySelectorAll<HTMLElement>("[data-landing-split]"),
      ).filter((target) => target.textContent?.trim());
      const splitRecords: Array<{ group: string; split: SplitText }> = [];

      splitTargets.forEach((target) => {
        gsap.set(target, { visibility: "visible" });

        const split = SplitText.create(target, {
          type: "lines",
          linesClass: styles.splitLine,
          mask: "lines",
          autoSplit: true,
        });

        splitRecords.push({
          group: target.dataset.landingSplitGroup ?? "default",
          split,
        });
        gsap.set(split.masks, {
          display: "block",
          overflow: "clip",
        });
      });

      const splitRefs = splitRecords.map((record) => record.split);
      const splitLines = splitRefs.flatMap((split) => split.lines);
      const linesByGroup = (group: string) =>
        splitRecords
          .filter((record) => record.group === group)
          .flatMap((record) => record.split.lines);
      const cleanupSplitText = () => {
        splitRefs.forEach((split) => {
          split.revert();
          split.kill();
        });
      };

      if (prefersReducedMotion) {
        gsap.set([preloader, loaderLine, revealSurface], { clearProps: "all" });
        gsap.set(preloader, { autoAlpha: 0 });
        gsap.set([...introCards, ...revealItems, ...splitLines], {
          clearProps: "all",
          autoAlpha: 1,
          y: "0%",
        });

        return cleanupSplitText;
      }

      const { animation } = config;
      const panelWidth = hero?.clientWidth || window.innerWidth;
      const panelHeight = hero?.clientHeight || window.innerHeight;
      const heroCard = introCards[heroCardIndex] ?? introCards[0];
      const leftCards = introCards.filter((_, index) => index < heroCardIndex);
      const rightCards = introCards.filter((_, index) => index > heroCardIndex);
      const nonHeroCards = [...leftCards, ...rightCards];
      const cardWidth = heroCard?.offsetWidth || panelWidth * 0.72;
      const cardHeight = heroCard?.offsetHeight || panelHeight * 0.78;
      const visualScale = window.innerWidth < 760 ? 0.18 : animation.introImages.scale;
      const gap = window.innerWidth < 760 ? 28 : animation.introImages.gap;
      const scaledWidth = cardWidth * visualScale;
      const cardCount = Math.max(1, introCards.length - 1);
      const rowWidth = introCards.length * scaledWidth + cardCount * gap;
      const rowStartX = (panelWidth - rowWidth) / 2;
      const rowCenterY = panelHeight / 2;
      const getRowX = (index: number) => {
        const visualCenterX = rowStartX + index * (scaledWidth + gap) + scaledWidth / 2;

        return visualCenterX - cardWidth / 2;
      };
      const lineExitPosition =
        animation.preloader.lineDuration + animation.preloader.lineExitDelay;
      const clipPosition =
        lineExitPosition + animation.preloader.lineExitDuration + animation.preloader.clipDelay;
      const dealPosition = clipPosition + animation.introImages.dealDelay;
      const dealStaggerTotal =
        Math.max(0, introCards.length - 1) * animation.introImages.stagger;
      const heroDealEnd =
        dealPosition + heroCardIndex * animation.introImages.stagger + animation.introImages.duration;
      const lastDealEnd = dealPosition + dealStaggerTotal + animation.introImages.duration;
      const spreadPosition = Math.max(
        heroDealEnd + 0.04,
        lastDealEnd - animation.introImages.spreadOverlap,
      );
      const heroRevealPosition = `spread+=${animation.heroImage.delay}`;
      const textRevealPosition = `spread+=${Math.max(
        0,
        animation.heroImage.delay + animation.heroImage.duration - animation.reveal.textLead,
      )}`;
      const nonHeroHidePosition = `spread+=${Math.max(
        animation.introImages.exitDuration,
        animation.heroImage.delay + animation.heroImage.duration,
      )}`;
      const socialRevealPosition = `<${animation.reveal.socialOffset}`;

      gsap.set(root, { autoAlpha: 1 });
      gsap.set(preloader, {
        autoAlpha: 1,
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        yPercent: 0,
      });
      gsap.set(loaderLine, {
        scaleX: 0,
        transformOrigin: "left center",
      });
      gsap.set(revealSurface, {
        yPercent: 100,
      });
      gsap.set(introCards, {
        autoAlpha: 1,
        scale: visualScale,
        x: (index: number) =>
          getRowX(index) - panelWidth * animation.introImages.offscreenRatio,
        y: rowCenterY - cardHeight / 2,
        rotation: (index: number) =>
          animation.introImages.rotations[index] ??
          animation.introImages.rotations[0] ??
          0,
        transformOrigin: "50% 50%",
        borderRadius: "2.5rem",
      });
      if (revealItems.length) {
        gsap.set(revealItems, {
          y: animation.reveal.lineY,
        });
      }
      gsap.set(splitLines, {
        y: animation.reveal.lineY,
      });

      const timeline = gsap.timeline({
        delay: animation.preloader.delay,
        defaults: {
          ease: "landingRevealGlide",
        },
      });

      timeline.addLabel("loader", 0);
      timeline.addLabel("deal", dealPosition);
      timeline.addLabel("spread", spreadPosition);
      timeline
        .to(loaderLine, {
          scaleX: 1,
          duration: animation.preloader.lineDuration,
          ease: "landingRevealGlide",
          onComplete: () => {
            gsap.set(loaderLine, { transformOrigin: "right center" });
          },
        }, "loader")
        .to(
          loaderLine,
          {
            scaleX: 0,
            duration: animation.preloader.lineExitDuration,
            ease: "landingRevealHop",
          },
          lineExitPosition,
        )
        .to(
          preloader,
          {
            yPercent: -100,
            duration: animation.preloader.clipDuration,
            ease: "landingRevealHop",
          },
          clipPosition,
        )
        .to(
          revealSurface,
          {
            yPercent: 0,
            duration: animation.preloader.clipDuration,
            ease: "landingRevealHop",
          },
          clipPosition,
        );

      introCards.forEach((card, index) => {
        timeline.to(
          card,
          {
            x: getRowX(index),
            y: rowCenterY - cardHeight / 2,
            scale: visualScale,
            duration: animation.introImages.duration,
            ease: "landingRevealGlide",
          },
          `deal+=${index * animation.introImages.stagger}`,
        );
      });

      timeline
        .set(preloader, { autoAlpha: 0 }, clipPosition + animation.preloader.clipDuration)
        .to(
          leftCards,
          {
            x: `-${animation.introImages.exitXPercent}vw`,
            duration: animation.introImages.exitDuration,
            ease: "landingRevealGlide",
          },
          "spread",
        )
        .to(
          rightCards,
          {
            x: `${animation.introImages.exitXPercent}vw`,
            duration: animation.introImages.exitDuration,
            ease: "landingRevealGlide",
          },
          "spread",
        )
        .to(
          heroCard,
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            borderRadius: 0,
            duration: animation.heroImage.duration,
            ease: "landingRevealGlide",
          },
          heroRevealPosition,
        )
        .set(nonHeroCards, { autoAlpha: 0 }, nonHeroHidePosition)
        .to(
          linesByGroup("nav"),
          {
            y: "0%",
            duration: animation.reveal.navDuration,
            stagger: animation.reveal.stagger,
            ease: "power3.out",
          },
          textRevealPosition,
        )
        .to(
          linesByGroup("headline"),
          {
            y: "0%",
            duration: animation.reveal.duration,
            stagger: animation.reveal.stagger,
            ease: "power3.out",
          },
          "<",
        )
        .to(
          linesByGroup("social"),
          {
            y: "0%",
            duration: animation.reveal.socialDuration,
            stagger: animation.reveal.stagger,
            ease: "power3.out",
          },
          socialRevealPosition,
        );

      return () => {
        timeline.kill();
        cleanupSplitText();
      };
    },
    {
      dependencies: [config],
      scope: rootRef,
      revertOnUpdate: true,
    },
  );

  return (
    <section ref={rootRef} className={styles.landingReveal} style={rootStyle}>
      <div className={styles.hero} id="top" data-landing-hero>
        <div className={styles.revealSurface} data-landing-surface>
          <nav className={styles.nav} aria-label="Landing reveal navigation">
            <div>
              <a
                className={cx(styles.brand, styles.navLink)}
                href="#top"
                data-landing-split
                data-landing-split-group="nav"
              >
                {getText(copy.brand, "")}
              </a>
              <span className={styles.eyebrow} data-landing-split data-landing-split-group="nav">
                {getText(copy.eyebrow, "")}
              </span>
            </div>
            <div className={styles.navItems}>
              {navItems.map((item) => (
                <a
                  className={styles.navLink}
                  href={item.href}
                  data-landing-split
                  data-landing-split-group="nav"
                  key={`${item.href}-${item.label}`}
                >
                  {getText(item.label, "")}
                </a>
              ))}
            </div>
          </nav>

          <div className={styles.introStack} aria-hidden="true">
            {displayIntroImages.map((image, index) => (
              <div
                className={styles.introCard}
                data-landing-intro-card
                data-landing-hero-card={index === heroCardIndex ? "true" : undefined}
                key={`${image.label}-${index}`}
              >
                <MediaPanel image={image} isHero={index === heroCardIndex} />
              </div>
            ))}
          </div>

          <div className={styles.heroContent}>
            <div className={styles.headline}>
              <h1 data-landing-split data-landing-split-group="headline">
                {getText(copy.heroTitle, "")}
              </h1>
            </div>

            <div className={styles.social}>
              <div className={styles.socialLead}>
                <span data-landing-split data-landing-split-group="social">
                  {getText(copy.socialLead, "")}
                </span>
                {copy.footerNote?.trim() ? (
                  <span
                    className={styles.footerNote}
                    data-landing-split
                    data-landing-split-group="social"
                  >
                    {copy.footerNote}
                  </span>
                ) : null}
              </div>

              <div className={styles.socialLinks}>
                {socialLinks.map((item) => (
                  <a
                    className={styles.socialLink}
                    href={item.href}
                    data-landing-split
                    data-landing-split-group="social"
                    key={`${item.href}-${item.label}`}
                  >
                    {getText(item.label, "")}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.preloader} data-landing-preloader aria-hidden="true">
          <div className={styles.preloaderTop}>
            <span>{getText(copy.introLabel, "")}</span>
            <span>{getText(copy.preloaderCounter, "")}</span>
          </div>
          <div className={styles.loaderTrack}>
            <div className={styles.loaderLine} data-landing-loader-line />
          </div>
          <div className={styles.preloaderBottom}>
            <span>{getText(copy.preloaderStatus, "")}</span>
            <span>{getText(copy.preloaderSource, "")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
