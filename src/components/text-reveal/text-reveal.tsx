"use client";

import { type CSSProperties, type ReactNode, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

import {
  textRevealConfig,
  type TextRevealCssVariables,
} from "./text-reveal.config";
import styles from "./text-reveal.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const { animation, copy } = textRevealConfig;

const textRevealStyle = textRevealConfig.cssVariables as TextRevealCssVariables &
  CSSProperties;

type RevealCopyProps = {
  children: ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  replayAfterLeave?: boolean;
};

function RevealCopy({
  children,
  animateOnScroll = true,
  delay = 0,
  replayAfterLeave = false,
}: RevealCopyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRefs = useRef<SplitText[]>([]);
  const replayCleanupsRef = useRef<Array<() => void>>([]);

  useGSAP(
    () => {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      const { splitText, hero } = animation;

      /*
       * Step 1: 對應教學影片中的 Copy.jsx 初始結構。
       * 每個文字區塊先交給 SplitText，依照實際排版拆成 lines，
       * 並使用 mask: "lines" 讓每一行有自己的裁切容器。
       */
      splitRefs.current = [];
      replayCleanupsRef.current = [];

      const targets = Array.from(container.children);

      targets.forEach((target) => {
        const split = SplitText.create(target, {
          type: splitText.type,
          mask: splitText.mask as "lines",
          linesClass: styles.splitLine,
          onSplit(self) {
            /*
             * Step 2: 對應影片滾動前狀態。
             * line 先被放到 mask 底部並降低透明度，畫面看起來像文字
             * 從每一行自己的裁切框中等待被揭露。
             */
            gsap.set(target, { visibility: "visible" });
            gsap.set(self.masks, {
              display: "block",
              overflow: "clip",
            });
            gsap.set(self.lines, {
              y: splitText.fromY,
              autoAlpha: splitText.hiddenAutoAlpha,
              willChange: "transform, opacity",
            });

            const animationProps = {
              y: splitText.toY,
              autoAlpha: splitText.visibleAutoAlpha,
              duration: splitText.duration,
              stagger: splitText.stagger,
              ease: splitText.ease,
              delay,
            };

            if (animateOnScroll) {
              const revealTween = gsap.to(self.lines, {
                ...animationProps,
                paused: true,
              });

              /*
               * Step 3: 對應影片中段的 scroll reveal。
               * 影片可辨識設定為 start: "top 75%"，原版 once: true。
               * 這個 lab 改成可重播：往下進入時播放，往上離開觸發點後
               * 回到初始隱藏狀態，方便反覆測試。
               */
              ScrollTrigger.create({
                trigger: target,
                start: splitText.start,
                onEnter: () => {
                  revealTween.restart(true);
                },
                onEnterBack: () => {
                  revealTween.progress(1).pause();
                },
                onLeaveBack: () => {
                  revealTween.pause(0);
                  gsap.set(self.lines, {
                    y: splitText.fromY,
                    autoAlpha: splitText.hiddenAutoAlpha,
                  });
                },
              });

              return revealTween;
            }

            if (replayAfterLeave) {
              const heroTween = gsap.to(self.lines, {
                ...animationProps,
                paused: true,
              });
              let heroHasReset = false;
              let heroReplayTimer: number | undefined;

              const resetHeroLines = () => {
                if (heroReplayTimer) {
                  window.clearTimeout(heroReplayTimer);
                }
                heroHasReset = true;
                heroTween.pause(0);
                gsap.set(self.lines, {
                  y: splitText.fromY,
                  autoAlpha: splitText.hiddenAutoAlpha,
                });
              };

              const replayHeroLines = () => {
                if (heroReplayTimer) {
                  window.clearTimeout(heroReplayTimer);
                  heroReplayTimer = undefined;
                }
                heroHasReset = false;
                heroTween.restart(true);
              };

              const resetThenReplayHeroLines = () => {
                resetHeroLines();
                heroReplayTimer = window.setTimeout(() => {
                  replayHeroLines();
                }, hero.resetDelayMs);
              };

              /*
               * Step 4: 對應第一屏 hero 文字。
               * 首次進頁播放；離開第一屏後 reset；回到第一屏時再播放。
               */
              heroTween.restart(true);

              ScrollTrigger.create({
                trigger: target,
                start: "bottom top",
                onEnter: resetHeroLines,
                onEnterBack: replayHeroLines,
              });

              const handleHeroScrollReplay = () => {
                const leavePoint =
                  window.innerHeight * hero.leavePointViewportRatio;
                const replayPoint =
                  window.innerHeight * hero.replayPointViewportRatio;

                if (!heroHasReset && window.scrollY > leavePoint) {
                  resetHeroLines();
                }

                if (heroHasReset && window.scrollY <= replayPoint) {
                  replayHeroLines();
                }
              };

              window.addEventListener("scroll", handleHeroScrollReplay, {
                passive: true,
              });

              /*
               * Step 5: 對應第一屏停留狀態。
               * 訪客停在首屏時，標題會定時重置並重新揭露，讓畫面維持
               * 有生命感；離開首屏或分頁不可見時不觸發。
               */
              const heroReplayInterval = window.setInterval(() => {
                const isInsideHero =
                  window.scrollY <=
                  window.innerHeight * hero.autoReplayMaxScrollRatio;

                if (document.visibilityState === "visible" && isInsideHero) {
                  resetThenReplayHeroLines();
                }
              }, hero.autoReplayMs);

              replayCleanupsRef.current.push(() => {
                window.removeEventListener("scroll", handleHeroScrollReplay);
                if (heroReplayTimer) {
                  window.clearTimeout(heroReplayTimer);
                }
                window.clearInterval(heroReplayInterval);
              });

              return heroTween;
            }

            /*
             * Step 6: 非 scroll 版本保留給未來需要的靜態文字。
             * 完成後停留在完整顯示狀態。
             */
            return gsap.to(self.lines, animationProps);
          },
        });

        splitRefs.current.push(split);
      });

      ScrollTrigger.refresh();

      return () => {
        replayCleanupsRef.current.forEach((cleanup) => cleanup());
        replayCleanupsRef.current = [];
        splitRefs.current.forEach((split) => {
          split.revert();
          split.kill();
        });
        splitRefs.current = [];
      };
    },
    {
      dependencies: [animateOnScroll, delay, replayAfterLeave],
      scope: containerRef,
      revertOnUpdate: true,
    },
  );

  return (
    <div ref={containerRef} className={styles.copyWrapper}>
      {children}
    </div>
  );
}

export function TextReveal() {
  const rootRef = useRef<HTMLElement>(null);
  const moduleRefs = useRef<Array<HTMLElement | null>>([]);

  useGSAP(
    () => {
      const root = rootRef.current;

      if (!root) {
        return;
      }

      const { backdrop: backdropMotion, lenis: lenisMotion, module, visual } =
        animation;
      const panels = moduleRefs.current.filter(Boolean) as HTMLElement[];
      const railItems = Array.from(
        root.querySelectorAll<HTMLElement>("[data-text-reveal-rail-item]"),
      );
      const backdrop = root.querySelector<HTMLElement>(
        "[data-text-reveal-backdrop]",
      );

      const setActiveModule = (activeIndex: number) => {
        panels.forEach((panel, panelIndex) => {
          panel.classList.toggle(styles.isActive, panelIndex === activeIndex);
        });
        railItems.forEach((item, itemIndex) => {
          item.classList.toggle(styles.isRailActive, itemIndex === activeIndex);
        });
      };

      /*
       * Stage A: 對應影片初始畫面。
       * 先讓第一個模塊最清楚，其他模塊維持較低透明度與輕微 blur。
       */
      setActiveModule(0);

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        panels.forEach((panel) => panel.classList.add(styles.isActive));
        return;
      }

      /*
       * Stage B: 對應影片的平滑滾動節奏。
       * Lenis 只在這個 lab 元件內建立，並把 scroll event 接回 ScrollTrigger。
       */
      const lenis = new Lenis({
        lerp: lenisMotion.lerp,
        wheelMultiplier: lenisMotion.wheelMultiplier,
      });

      lenis.on("scroll", ScrollTrigger.update);

      const tickLenis = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickLenis);
      gsap.ticker.lagSmoothing(0);

      /*
       * Stage C: 對應影片中段。
       * 6 個模塊依序成為 active；視覺塊同步做很輕的 scrub 視差。
       */
      panels.forEach((panel, index) => {
        ScrollTrigger.create({
          id: `text-reveal-active-${index + 1}`,
          trigger: panel,
          start: module.activeStart,
          end: module.activeEnd,
          onEnter: () => setActiveModule(index),
          onEnterBack: () => setActiveModule(index),
        });

        const visualElement = panel.querySelector<HTMLElement>(
          "[data-text-reveal-visual]",
        );

        if (visualElement) {
          gsap.fromTo(
            visualElement,
            {
              yPercent: visual.fromYPercent,
              scale: visual.fromScale,
              filter: visual.fromBlur,
            },
            {
              yPercent: visual.toYPercent,
              scale: visual.toScale,
              filter: visual.toBlur,
              ease: "none",
              scrollTrigger: {
                id: `text-reveal-visual-${index + 1}`,
                trigger: panel,
                start: "top bottom",
                end: "bottom top",
                scrub: visual.scrub,
              },
            },
          );
        }
      });

      /*
       * Stage D: 對應影片結尾狀態。
       * 背景只做輕微 scrub，不使用 pin，因此 cleanup 時不會留下 pin spacer。
       */
      if (backdrop) {
        gsap.to(backdrop, {
          yPercent: backdropMotion.yPercent,
          scale: backdropMotion.scale,
          ease: "none",
          scrollTrigger: {
            id: "text-reveal-backdrop",
            trigger: root,
            start: backdropMotion.start,
            end: backdropMotion.end,
            scrub: backdropMotion.scrub,
          },
        });
      }

      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        gsap.ticker.remove(tickLenis);
        lenis.off("scroll", ScrollTrigger.update);
        lenis.destroy();
      };
    },
    {
      scope: rootRef,
    },
  );

  return (
    <section
      ref={rootRef}
      className={styles.textReveal}
      style={textRevealStyle}
    >
      <div
        className={styles.backdrop}
        data-text-reveal-backdrop
        aria-hidden="true"
      />

      <nav className={styles.rail} aria-label="Text reveal modules">
        {copy.modules.map((moduleItem) => (
          <span
            key={moduleItem.number}
            className={styles.railItem}
            data-text-reveal-rail-item
          >
            {moduleItem.number}
          </span>
        ))}
      </nav>

      <header className={styles.hero}>
        <p className={styles.kicker}>{copy.kicker}</p>
        <RevealCopy
          animateOnScroll={false}
          delay={animation.hero.delay}
          replayAfterLeave
        >
          <h1 className={styles.heroTitle}>{copy.heroTitle}</h1>
        </RevealCopy>
      </header>

      <div className={styles.modules}>
        {copy.modules.map((moduleItem, index) => (
          <article
            key={moduleItem.number}
            ref={(element) => {
              moduleRefs.current[index] = element;
            }}
            className={`${styles.module} ${index === 0 ? styles.isActive : ""}`}
          >
            <div className={styles.moduleMeta}>
              <span className={styles.moduleNumber}>{moduleItem.number}</span>
              <span>{moduleItem.subtitle}</span>
            </div>

            <div className={styles.moduleContent}>
              <RevealCopy delay={animation.splitText.titleDelay}>
                <h2 className={styles.moduleTitle}>{moduleItem.title}</h2>
              </RevealCopy>
              <RevealCopy delay={animation.splitText.descriptionDelay}>
                <p className={styles.moduleDescription}>
                  {moduleItem.description}
                </p>
              </RevealCopy>
              <RevealCopy delay={animation.splitText.zhDelay}>
                <p className={styles.moduleZh}>{moduleItem.zh}</p>
              </RevealCopy>
            </div>

            <div
              className={styles.moduleVisual}
              data-text-reveal-visual
              aria-hidden="true"
            >
              <span className={styles.visualPlane} />
              <span className={styles.visualFold} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
