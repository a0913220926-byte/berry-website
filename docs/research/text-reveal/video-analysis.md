# Text Reveal Video Analysis

Source video: `retatube.com1780327939_3BngM1eyz5vaVh3OK5IF.mp4`

## Visual Stages

1. Initial website reference: the page uses a quiet black/white editorial layout, large sans-serif copy, and abstract monochrome imagery. Text is not decorative; it is the main visual element.
2. Text reveal behavior: copy appears line by line. Each line is clipped by its own mask and rises from below into its natural baseline.
3. Scroll trigger: the tutorial code sets the reveal trigger around `start: "top 75%"` and uses `once: true`, so each block animates when it enters the lower-middle viewport.
4. Final state: each text block remains fully visible after the reveal. The page keeps a clean, high-contrast studio-style rhythm with image blocks sitting behind or below the copy.

## Code Observations

The visible code shows a reusable `Copy.jsx` component with this structure:

- `"use client"` at the top.
- `import React, { useRef } from "react";`
- `import gsap from "gsap";`
- `import { SplitText } from "gsap/SplitText";`
- `import { ScrollTrigger } from "gsap/ScrollTrigger";`
- `import { useGSAP } from "@gsap/react";`
- `gsap.registerPlugin(SplitText, ScrollTrigger);`
- `containerRef`, `elementRef`, `splitRef`, and `lines` refs.
- `React.cloneElement(children, { ref: containerRef })`.
- `SplitText.create(..., { type: "lines", mask: "lines" })`.
- Initial line offset is set before animation; the animation moves lines back to `y: "0%"`.
- Animation props shown: `duration: 1`, `stagger: 0.1`, `ease: "power4.out"`, and `delay`.
- ScrollTrigger block shown: `trigger: containerRef.current`, `start: "top 75%"`, `once: true`.
- Cleanup calls `split.revert()` for each SplitText instance.

## Implementation Direction

This project has `gsap@3.15.0`, so `gsap/SplitText` is available. The new lab effect should use SplitText directly, matching the tutorial logic, and use `@gsap/react` only inside the new `text-reveal` component. The six service modules should reuse one data array and reveal each copy block with the same masked line rise.
