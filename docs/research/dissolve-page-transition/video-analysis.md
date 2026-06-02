# dissolve-page-transition video analysis

## 1. Video Effect Breakdown

The tutorial video shows a scroll-driven page transition where the next page color dissolves over the current page. The important visual is not a normal opacity fade, not a vertical wipe, and not a dark smoky texture. As the viewer scrolls down, page two's pale mint color is pulled into the viewport through an irregular WebGL noise mask, covering and replacing page one.

The tutorial code screen confirms this direction. The fragment shader is built around a vertical dissolve front:

- `dissolveEdge = uv.y - uProgress * 1.2`
- `noiseValue = fbm(centeredUv * 15.0)`
- `d = dissolveEdge + noiseValue * uSpread`
- `alpha = 1.0 - smoothstep(-pixelSize, pixelSize, d)`

That creates a page-color mask that feels like ink, corrosion, or liquid erosion. The next page appears from the same mask, as if it is being dragged out by the scroll.

Important correction from frame-by-frame comparison: pixels that have not been reached by the alpha mask must remain exactly the current page. There should be no global green tint, no early next-page typography, no pre-displacement, and no time-driven noise drifting independently from scroll.

## 2. Animation Flow

1. The lab page loads a pinned full-screen stage.
2. WebGL renders the current section texture and next section texture on one full-screen plane.
3. GSAP ScrollTrigger maps scroll progress to `currentIndex`, `nextIndex`, and `localProgress`.
4. `localProgress` is mapped linearly into shader `uProgress` from 0 to 1.
5. The next section color invades the screen through the noise mask first.
6. The next section texture becomes visible through that same dissolve field.
7. At the end of each segment, the next section becomes the current section and the process repeats.

## 3. Packages

- Next.js App Router for the isolated lab route.
- React client component for all browser-only WebGL and scroll logic.
- Three.js `WebGLRenderer`, `Scene`, `OrthographicCamera`, `PlaneGeometry`, `ShaderMaterial`, and `TextureLoader`.
- GSAP `ScrollTrigger` for pinned scrubbed scroll progress.
- `@gsap/react` `useGSAP` for scoped setup and cleanup.
- Lenis is configurable for smoother scroll, wired to `ScrollTrigger.update`.

## 4. Three.js / WebGL / Shader Implementation

The module uses native Three.js, not React Three Fiber. A full-screen plane is rendered with a custom `ShaderMaterial`.

The shader keeps the required uniforms:

- `uProgress`
- `uTexture1`
- `uTexture2`
- `uResolution`
- `uImageResolution1`
- `uImageResolution2`
- `uNoiseScale`
- `uThreshold`
- `uSmoothness`
- `uDisplacementStrength`
- `uTime`

Additional color uniforms let the next page color dominate only the transition edge. The fragment shader uses value noise and fbm to generate a vertical dissolve front that matches the tutorial code direction. `mix(texture1, texture2, mask)` changes the page. When `mask` is 0, the output is exactly `texture1`; only mask-covered pixels can show `texture2`.

## 5. GSAP ScrollTrigger Control

ScrollTrigger is created with:

- `scrub: true`
- `pin: stage`
- `start: "top top"`
- `end: () => "+=" + ((sections.length - 1) * scrollHeight)`
- `onUpdate` to push progress into shader uniforms

The component does not use a manual `window.scroll` animation loop. ScrollTrigger owns scroll progress; Three.js owns frame rendering. Lenis can smooth the physical scroll, but `ScrollTrigger` scrub progress is still mapped directly into the shader uniform.

## 6. Section Switching

`sections` comes from config and can be freely increased or reduced. The total scroll progress is converted into:

- `currentIndex`
- `nextIndex`
- `rawLocal`
- `localProgress`

The shader textures and colors are updated only when the active pair changes. Uniform values update directly by refs, avoiding React state churn on every scroll frame. Typography is not animated through DOM in WebGL mode; section text is baked into Three.js `CanvasTexture` planes with the visual layer.

## 7. Missing Assets

The formal image files are not currently present:

- `/images/dissolve-page-transition/section-01.jpg`
- `/images/dissolve-page-transition/section-02.jpg`
- `/images/dissolve-page-transition/section-03.jpg`

The folder exists with `.gitkeep`.

## 8. Placeholder Assets

When an image is missing, the component creates a procedural canvas texture:

- image section: dark green editorial image-like fallback with gold serif title
- light section: pale mint page with black serif copy
- dark section: black page with pale editorial copy

If an image later exists, it is loaded and composited into the same section texture so the configured text remains visible.

## 9. Config Parameters

All replaceable data and animation parameters are centralized in:

`src/components/dissolve-page-transition/dissolve-page-transition.config.ts`

Config includes:

- `sections`
- `scrollHeight`
- `transitionDuration`
- `noiseScale`
- `threshold`
- `smoothness`
- `displacementStrength`
- `shaderQuality`
- `maskPull`
- `enableSmoothScroll`
- `enableWordReveal`
- `desktop`
- `mobile`
- `fallbackMode`

Each section controls title, subtitle, description, image path, colors, and optional visual variant.

## 10. Mobile And Performance Notes

- Desktop DPR is capped at 2.
- Mobile DPR is capped lower through config.
- Mobile noise and displacement are reduced, but the WebGL dissolve remains active.
- Textures are pre-created before ScrollTrigger begins.
- WebGL mode does not update DOM typography on scroll; text and visual content are rendered through Three.js textures in the same render loop.
- Scroll updates do not recreate renderer, material, geometry, or textures.
- Resize updates renderer size and shader resolution.
- Cleanup disposes renderer, geometry, material, textures, RAF, resize listener, ScrollTrigger, and Lenis.

## 11. Isolation From Other Effects

The implementation stays isolated:

- route: `src/app/lab/dissolve-page-transition/page.tsx`
- module: `src/components/dissolve-page-transition/`
- no changes to `src/app/page.tsx`
- no changes to `brand-reveal`
- no changes to `text-reveal`
- no global CSS changes

The module can be deleted by removing the lab route, component folder, docs file, and optional public image folder.
