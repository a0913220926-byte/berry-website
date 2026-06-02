"use client";

import { type CSSProperties, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import * as THREE from "three";

import {
  dissolvePageTransitionConfig,
  type DissolvePageTransitionBreakpoint,
  type DissolvePageTransitionSection,
} from "./dissolve-page-transition.config";
import { fragmentShader, vertexShader } from "./dissolve-page-transition.shaders";
import styles from "./dissolve-page-transition.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type CssVariables = CSSProperties & Record<`--${string}`, string | number>;

type TextureRecord = {
  texture: THREE.Texture;
  width: number;
  height: number;
  isFallback: boolean;
};

type TextureImageLike = {
  width?: number;
  height?: number;
  naturalWidth?: number;
  naturalHeight?: number;
};

const scrollTriggerId = "dissolve-page-transition-scroll";
const clamp01 = gsap.utils.clamp(0, 1);

function getRenderableSections() {
  const { fallbackSection, sections } = dissolvePageTransitionConfig;
  return sections.length > 0 ? sections : [fallbackSection];
}

function getBreakpointConfig(): DissolvePageTransitionBreakpoint {
  if (window.matchMedia("(max-width: 760px)").matches) {
    return dissolvePageTransitionConfig.mobile;
  }

  return dissolvePageTransitionConfig.desktop;
}

function getQualityTextureSize(baseSize: number) {
  const { shaderQuality } = dissolvePageTransitionConfig;

  if (shaderQuality === "low") {
    return Math.min(baseSize, 768);
  }

  if (shaderQuality === "medium") {
    return Math.min(baseSize, 1152);
  }

  return baseSize;
}

function getViewportAspect() {
  return Math.max(0.38, Math.min(2.25, window.innerWidth / Math.max(window.innerHeight, 1)));
}

function getTextureImageSize(texture: THREE.Texture) {
  const image = texture.image as TextureImageLike | undefined;
  const width = image?.naturalWidth ?? image?.width ?? 1;
  const height = image?.naturalHeight ?? image?.height ?? 1;

  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
}

function configureTexture(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let value = seed || 1;

  return () => {
    value = Math.imul(value, 48271) % 2147483647;
    return (value & 2147483647) / 2147483647;
  };
}

function colorWithAlpha(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const isShort = normalized.length === 3;
  const fullHex = isShort
    ? normalized
        .split("")
        .map((character) => `${character}${character}`)
        .join("")
    : normalized.padEnd(6, "0").slice(0, 6);
  const value = Number.parseInt(fullHex, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  canvasWidth: number,
  canvasHeight: number,
) {
  const imageLike = image as TextureImageLike;
  const sourceWidth = Math.max(1, imageLike.naturalWidth ?? imageLike.width ?? canvasWidth);
  const sourceHeight = Math.max(1, imageLike.naturalHeight ?? imageLike.height ?? canvasHeight);
  const scale = Math.max(canvasWidth / sourceWidth, canvasHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = (canvasWidth - width) * 0.5;
  const y = (canvasHeight - height) * 0.5;

  context.drawImage(image, x, y, width, height);
}

function applyImagePageFallback(
  context: CanvasRenderingContext2D,
  section: DissolvePageTransitionSection,
  random: () => number,
  width: number,
  height: number,
) {
  const baseGradient = context.createLinearGradient(0, 0, width, height);
  baseGradient.addColorStop(0, "#091611");
  baseGradient.addColorStop(0.42, section.backgroundColor);
  baseGradient.addColorStop(1, "#020302");
  context.fillStyle = baseGradient;
  context.fillRect(0, 0, width, height);

  const portraitX = width * (0.5 + (random() - 0.5) * 0.08);
  const portraitY = height * 0.42;
  const portrait = context.createRadialGradient(
    portraitX,
    portraitY,
    width * 0.02,
    portraitX,
    portraitY,
    width * 0.34,
  );
  portrait.addColorStop(0, colorWithAlpha(section.accentColor, 0.2));
  portrait.addColorStop(0.38, "rgba(58, 70, 50, 0.34)");
  portrait.addColorStop(0.72, "rgba(5, 13, 9, 0.84)");
  portrait.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = portrait;
  context.fillRect(0, 0, width, height);

  context.globalCompositeOperation = "screen";
  for (let index = 0; index < 7; index += 1) {
    const x = width * (0.2 + random() * 0.6);
    const y = height * (0.16 + random() * 0.62);
    const radius = width * (0.05 + random() * 0.16);
    const light = context.createRadialGradient(x, y, 0, x, y, radius);
    light.addColorStop(0, colorWithAlpha(section.accentColor, 0.08 + random() * 0.08));
    light.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = light;
    context.fillRect(0, 0, width, height);
  }
  context.globalCompositeOperation = "source-over";
}

function fitTextSize(
  context: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  desiredSize: number,
  minimumSize: number,
  maxWidth: number,
) {
  let size = desiredSize;

  while (size > minimumSize) {
    context.font = `400 ${size}px ${fontFamily}`;

    if (context.measureText(text).width <= maxWidth) {
      return size;
    }

    size -= 2;
  }

  return minimumSize;
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 5,
) {
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  let lineIndex = 0;

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (!word) {
      continue;
    }

    const testLine = line ? `${line} ${word}` : word;
    const isLastWord = index === words.length - 1;

    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, y + lineIndex * lineHeight);
      line = word;
      lineIndex += 1;

      if (lineIndex >= maxLines) {
        break;
      }
    } else {
      line = testLine;
    }

    if (isLastWord && line && lineIndex < maxLines) {
      context.fillText(line, x, y + lineIndex * lineHeight);
    }
  }
}

function createSectionTexture(
  section: DissolvePageTransitionSection,
  index: number,
  textureSize: number,
  sourceImage?: CanvasImageSource,
  viewportAspect = 16 / 9,
): TextureRecord {
  const canvas = document.createElement("canvas");
  canvas.width = textureSize;
  canvas.height = Math.round(textureSize / viewportAspect);

  const context = canvas.getContext("2d");

  if (!context) {
    const data = new Uint8Array([7, 17, 13, 255]);
    const texture = new THREE.DataTexture(data, 1, 1);
    configureTexture(texture);

    return {
      texture,
      width: 1,
      height: 1,
      isFallback: !sourceImage,
    } satisfies TextureRecord;
  }

  const random = createSeededRandom(hashString(`${section.title}-${index}`));
  const width = canvas.width;
  const height = canvas.height;
  const mode = dissolvePageTransitionConfig.fallbackMode;
  const variant = section.variant ?? (index === 1 ? "light" : index === 2 ? "dark" : "image");

  if (sourceImage) {
    drawCoverImage(context, sourceImage, width, height);
  } else if (variant === "image" && mode !== "pure-color") {
    applyImagePageFallback(context, section, random, width, height);
  } else {
    context.fillStyle = section.backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  if (sourceImage || variant !== "image") {
    context.fillStyle =
      variant === "image"
        ? "rgba(0, 0, 0, 0.24)"
        : colorWithAlpha(section.backgroundColor, sourceImage ? 0.9 : 1);
    context.fillRect(0, 0, width, height);
  }

  if (variant === "image") {
    const veil = context.createLinearGradient(0, 0, 0, height);
    veil.addColorStop(0, "rgba(0, 0, 0, 0.2)");
    veil.addColorStop(0.55, "rgba(0, 0, 0, 0.04)");
    veil.addColorStop(1, "rgba(0, 0, 0, 0.48)");
    context.fillStyle = veil;
    context.fillRect(0, 0, width, height);
  }

  if (mode !== "pure-color" && variant !== "image") {
    context.globalCompositeOperation = variant === "light" ? "multiply" : "screen";
    for (let pointIndex = 0; pointIndex < 1200; pointIndex += 1) {
      const light = variant === "light" ? 0 : 235;
      context.fillStyle = `rgba(${light}, ${light}, ${light}, ${0.012 + random() * 0.018})`;
      context.fillRect(random() * width, random() * height, 1, 1);
    }
    context.globalCompositeOperation = "source-over";
  }

  const serif = 'Georgia, "Times New Roman", serif';
  const sans = 'Arial, Helvetica, sans-serif';
  const title = section.title || "DISSOLVE";
  const subtitle = section.subtitle ?? "";
  const description = section.description ?? "";

  context.textBaseline = "alphabetic";

  if (variant === "image") {
    const titleSize = fitTextSize(context, title, serif, width * 0.088, width * 0.044, width * 0.78);
    context.font = `400 ${titleSize}px ${serif}`;
    context.textAlign = "center";
    context.fillStyle = section.textColor;
    context.shadowColor = "rgba(0, 0, 0, 0.64)";
    context.shadowBlur = width * 0.018;
    context.fillText(title, width * 0.5, height * 0.53);
    context.shadowBlur = 0;

    if (subtitle) {
      context.font = `500 ${width * 0.013}px ${sans}`;
      context.fillStyle = colorWithAlpha(section.accentColor, 0.82);
      context.fillText(subtitle, width * 0.5, height * 0.59);
    }
  } else if (variant === "light") {
    context.textAlign = "left";
    context.font = `500 ${width * 0.012}px ${sans}`;
    context.fillStyle = colorWithAlpha(section.textColor, 0.72);
    context.fillText(String(index + 1).padStart(2, "0"), width * 0.07, height * 0.16);

    context.font = `400 ${width * 0.078}px ${serif}`;
    context.fillStyle = section.textColor;
    context.fillText(title, width * 0.07, height * 0.35);

    if (description) {
      context.font = `400 ${width * 0.037}px ${serif}`;
      context.fillStyle = colorWithAlpha(section.textColor, 0.94);
      drawWrappedText(context, description, width * 0.07, height * 0.52, width * 0.74, width * 0.044, 4);
    }

    if (subtitle) {
      context.font = `500 ${width * 0.014}px ${sans}`;
      context.fillStyle = colorWithAlpha(section.textColor, 0.62);
      context.fillText(subtitle, width * 0.07, height * 0.83);
    }
  } else {
    context.textAlign = "left";
    context.font = `500 ${width * 0.012}px ${sans}`;
    context.fillStyle = colorWithAlpha(section.accentColor, 0.86);
    context.fillText(String(index + 1).padStart(2, "0"), width * 0.12, height * 0.22);

    context.font = `400 ${width * 0.062}px ${serif}`;
    context.fillStyle = section.textColor;
    context.fillText(title, width * 0.12, height * 0.42);

    if (description) {
      context.font = `400 ${width * 0.028}px ${serif}`;
      context.fillStyle = colorWithAlpha(section.textColor, 0.82);
      drawWrappedText(context, description, width * 0.12, height * 0.57, width * 0.62, width * 0.036, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  configureTexture(texture);

  return {
    texture,
    width: canvas.width,
    height: canvas.height,
    isFallback: !sourceImage,
  } satisfies TextureRecord;
}

function getSectionStyle(section: DissolvePageTransitionSection): CssVariables {
  return {
    "--dpt-section-bg": section.backgroundColor,
    "--dpt-section-text": section.textColor,
    "--dpt-section-accent": section.accentColor,
  };
}

export function DissolvePageTransition() {
  const sections = useMemo(() => getRenderableSections(), []);
  const [webglFailed, setWebglFailed] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);

  const firstSection = sections[0] ?? dissolvePageTransitionConfig.fallbackSection;
  const canUseDissolve = !webglFailed && sections.length >= 2;
  const rootStyle: CssVariables = {
    "--dpt-current-bg": firstSection.backgroundColor,
    "--dpt-current-text": firstSection.textColor,
    "--dpt-current-accent": firstSection.accentColor,
  };

  useGSAP(
    () => {
      if (!canUseDissolve) {
        return;
      }

      const root = rootRef.current;
      const stage = stageRef.current;
      const canvasHost = canvasHostRef.current;

      if (!root || !stage || !canvasHost) {
        return;
      }

      let disposed = false;
      let rafId = 0;
      let lastPairKey = "";
      const breakpoint = getBreakpointConfig();
      const textureSize = getQualityTextureSize(breakpoint.textureSize);
      const textureAspect = getViewportAspect();
      const textureRecords = sections.map((section, index) =>
        createSectionTexture(section, index, textureSize, undefined, textureAspect),
      );
      const textureLoader = new THREE.TextureLoader();
      const disposableTextures = new Set<THREE.Texture>(
        textureRecords.map((record) => record.texture),
      );

      let renderer: THREE.WebGLRenderer;
      const currentPair = {
        currentIndex: 0,
        nextIndex: 1,
      };
      const materialRef = {
        current: null as THREE.ShaderMaterial | null,
      };

      const updateRootColors = (section: DissolvePageTransitionSection) => {
        root.style.setProperty("--dpt-current-bg", section.backgroundColor);
        root.style.setProperty("--dpt-current-text", section.textColor);
        root.style.setProperty("--dpt-current-accent", section.accentColor);
      };

      const updateTextureUniforms = (currentIndex: number, nextIndex: number) => {
        const material = materialRef.current;
        const texture1 = textureRecords[currentIndex] ?? textureRecords[0];
        const texture2 = textureRecords[nextIndex] ?? texture1;
        const currentSection = sections[currentIndex] ?? sections[0];
        const nextSection = sections[nextIndex] ?? currentSection;

        if (!material || !texture1 || !texture2 || !currentSection || !nextSection) {
          return;
        }

        material.uniforms.uTexture1.value = texture1.texture;
        material.uniforms.uTexture2.value = texture2.texture;
        material.uniforms.uImageResolution1.value.set(texture1.width, texture1.height);
        material.uniforms.uImageResolution2.value.set(texture2.width, texture2.height);
        material.uniforms.uColor1.value.set(currentSection.backgroundColor);
        material.uniforms.uColor2.value.set(nextSection.backgroundColor);
        material.uniforms.uAccentColor.value.set(nextSection.accentColor);
      };

      const resolveProgress = (totalProgress: number) => {
        const transitionCount = Math.max(1, sections.length - 1);
        const scaled = clamp01(totalProgress) * transitionCount;
        const currentIndex =
          totalProgress >= 1
            ? Math.max(0, sections.length - 2)
            : Math.min(Math.floor(scaled), Math.max(0, sections.length - 2));
        const nextIndex = Math.min(currentIndex + 1, sections.length - 1);
        const rawLocal = totalProgress >= 1 ? 1 : scaled - currentIndex;
        const duration = clamp01(dissolvePageTransitionConfig.transitionDuration);
        const inset = (1 - Math.max(0.2, duration)) * 0.5;
        const localProgress = clamp01((rawLocal - inset) / Math.max(0.2, duration));

        return {
          currentIndex,
          nextIndex,
          localProgress,
          rawLocal,
        };
      };

      const renderScrollProgress = (progress: number) => {
        const material = materialRef.current;

        if (!material) {
          return;
        }

        const { currentIndex, localProgress, nextIndex } = resolveProgress(progress);
        const pairKey = `${currentIndex}-${nextIndex}`;

        if (pairKey !== lastPairKey) {
          lastPairKey = pairKey;
          currentPair.currentIndex = currentIndex;
          currentPair.nextIndex = nextIndex;
          updateTextureUniforms(currentIndex, nextIndex);
          updateRootColors(sections[currentIndex] ?? sections[0]);
        }

        material.uniforms.uProgress.value = localProgress;
      };

      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        });
      } catch (error) {
        console.warn("[dissolve-page-transition] WebGL initialization failed.", error);
        setWebglFailed(true);
        return;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
      camera.position.z = 1;

      const initialTexture1 = textureRecords[0];
      const initialTexture2 = textureRecords[1] ?? initialTexture1;

      if (!initialTexture1 || !initialTexture2) {
        setWebglFailed(true);
        return;
      }

      const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uProgress: { value: 0 },
          uTexture1: { value: initialTexture1.texture },
          uTexture2: { value: initialTexture2.texture },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uImageResolution1: {
            value: new THREE.Vector2(initialTexture1.width, initialTexture1.height),
          },
          uImageResolution2: {
            value: new THREE.Vector2(initialTexture2.width, initialTexture2.height),
          },
          uNoiseScale: { value: breakpoint.noiseScale },
          uThreshold: { value: breakpoint.threshold },
          uSmoothness: { value: breakpoint.smoothness },
          uDisplacementStrength: { value: breakpoint.displacementStrength },
          uTime: { value: 0 },
          uColor1: { value: new THREE.Color(sections[0]?.backgroundColor ?? "#07110d") },
          uColor2: { value: new THREE.Color(sections[1]?.backgroundColor ?? "#ebf5df") },
          uAccentColor: { value: new THREE.Color(sections[1]?.accentColor ?? "#f1d27a") },
          uMaskPull: { value: dissolvePageTransitionConfig.maskPull },
        },
      });
      materialRef.current = material;
      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      scene.add(mesh);

      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.className = styles.canvas;
      canvasHost.appendChild(renderer.domElement);

      const applyResponsiveSize = () => {
        const responsive = getBreakpointConfig();
        const rect = canvasHost.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width || window.innerWidth));
        const height = Math.max(1, Math.round(rect.height || window.innerHeight));
        const pixelRatio = Math.min(window.devicePixelRatio || 1, responsive.maxPixelRatio);

        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, false);
        material.uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio);
        material.uniforms.uNoiseScale.value = responsive.noiseScale;
        material.uniforms.uThreshold.value = responsive.threshold;
        material.uniforms.uSmoothness.value = responsive.smoothness;
        material.uniforms.uDisplacementStrength.value = responsive.displacementStrength;
        material.uniforms.uMaskPull.value = dissolvePageTransitionConfig.maskPull;
      };

      const onTextureReady = (
        index: number,
        loadedTexture: THREE.Texture,
        fallbackTexture: THREE.Texture,
      ) => {
        if (disposed) {
          loadedTexture.dispose();
          return;
        }

        const loadedImage = loadedTexture.image as CanvasImageSource | undefined;
        const composedRecord = loadedImage
          ? createSectionTexture(
              sections[index] ?? sections[0],
              index,
              textureSize,
              loadedImage,
              textureAspect,
            )
          : null;
        const size = composedRecord ? null : getTextureImageSize(loadedTexture);

        loadedTexture.dispose();

        textureRecords[index] = {
          texture: composedRecord?.texture ?? fallbackTexture,
          width: composedRecord?.width ?? size?.width ?? 1,
          height: composedRecord?.height ?? size?.height ?? 1,
          isFallback: !composedRecord,
        };

        if (composedRecord) {
          disposableTextures.add(composedRecord.texture);
          disposableTextures.delete(fallbackTexture);
          fallbackTexture.dispose();
        }

        updateTextureUniforms(currentPair.currentIndex, currentPair.nextIndex);
      };

      sections.forEach((section, index) => {
        if (!section.image) {
          console.warn(
            `[dissolve-page-transition] Section "${section.title}" has no image. Procedural fallback texture is used.`,
          );
          return;
        }

        const fallbackTexture = textureRecords[index]?.texture;

        textureLoader.load(
          section.image,
          (texture) => {
            if (fallbackTexture) {
              onTextureReady(index, texture, fallbackTexture);
            }
          },
          undefined,
          () => {
            console.warn(
              `[dissolve-page-transition] Could not load ${section.image}. Procedural fallback texture is used.`,
            );
          },
        );
      });

      applyResponsiveSize();
      updateTextureUniforms(0, 1);
      renderScrollProgress(0);

      const startTime = window.performance.now();
      const renderFrame = (time: number) => {
        material.uniforms.uTime.value = (time - startTime) / 1000;
        renderer.render(scene, camera);
        rafId = window.requestAnimationFrame(renderFrame);
      };
      rafId = window.requestAnimationFrame(renderFrame);

      const responsiveAtCreation = getBreakpointConfig();
      const scrollDistance =
        Math.max(1, sections.length - 1) *
        (responsiveAtCreation.scrollHeight || dissolvePageTransitionConfig.scrollHeight);

      const trigger = ScrollTrigger.create({
        id: scrollTriggerId,
        trigger: root,
        pin: stage,
        scrub: true,
        start: "top top",
        end: () => `+=${scrollDistance}`,
        onUpdate: (self) => renderScrollProgress(self.progress),
        onRefresh: (self) => {
          applyResponsiveSize();
          renderScrollProgress(self.progress);
        },
      });

      let lenis: Lenis | null = null;
      let tickLenis: ((time: number) => void) | null = null;

      if (dissolvePageTransitionConfig.enableSmoothScroll) {
        lenis = new Lenis({
          lerp: 0.075,
          wheelMultiplier: 0.8,
        });
        lenis.on("scroll", ScrollTrigger.update);
        tickLenis = (time: number) => {
          lenis?.raf(time * 1000);
        };
        gsap.ticker.add(tickLenis);
        gsap.ticker.lagSmoothing(0);
      }

      window.addEventListener("resize", applyResponsiveSize);
      window.requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        disposed = true;
        window.removeEventListener("resize", applyResponsiveSize);
        window.cancelAnimationFrame(rafId);
        trigger.kill();
        ScrollTrigger.getById(scrollTriggerId)?.kill();

        if (tickLenis) {
          gsap.ticker.remove(tickLenis);
        }

        if (lenis) {
          lenis.off("scroll", ScrollTrigger.update);
          lenis.destroy();
        }

        scene.remove(mesh);
        geometry.dispose();
        material.dispose();
        disposableTextures.forEach((texture) => texture.dispose());
        disposableTextures.clear();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    },
    {
      dependencies: [canUseDissolve, sections],
      scope: rootRef,
      revertOnUpdate: true,
    },
  );

  if (!canUseDissolve) {
    return (
      <section className={styles.fallbackRoot} style={rootStyle}>
        <div className={styles.fallbackSections}>
          {sections.map((section, index) => (
            <article
              key={`${section.title}-${index}`}
              className={styles.fallbackSection}
              style={getSectionStyle(section)}
            >
              <p className={styles.kicker}>{String(index + 1).padStart(2, "0")}</p>
              <h1 className={styles.title}>{section.title}</h1>
              {section.subtitle ? <p className={styles.subtitle}>{section.subtitle}</p> : null}
              {section.description ? (
                <p className={styles.description}>{section.description}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={rootRef} className={styles.root} style={rootStyle}>
      <div ref={stageRef} className={styles.stage}>
        <div ref={canvasHostRef} className={styles.canvasHost} aria-hidden="true" />
        <div className={styles.inkLayer} aria-hidden="true" />
        <div className={styles.grainLayer} aria-hidden="true" />
      </div>
    </section>
  );
}
