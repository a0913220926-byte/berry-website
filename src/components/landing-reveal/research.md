# Landing Reveal Research

## Reference

Source: tutorial video file provided by the user on the Windows desktop.

Frame extraction used for this pass:

- Video metadata: 1280x720, 30fps, 650.033333 seconds, 19,501 frames.
- Every frame was extracted to a temporary research folder outside the repo:
  `%TEMP%\landing-reveal-video-four-all-frames-20260603-235744`.
- Contact sheets were generated outside the repo:
  `%TEMP%\landing-reveal-video-four-contact-sheets-20260603-235744`.
- Opening transition sheet:
  `%TEMP%\landing-reveal-white-line-transition\transition_sheet_frames_00008_00036.jpg`.
- Code-frame crops:
  `%TEMP%\landing-reveal-code-crops`.
- OCR output from those crops:
  `%TEMP%\landing-reveal-code-ocr`.

The tutorial builds a landing-page entrance sequence with a dark preloader, a
top loading line, a clipped overlay reveal, a stack of intro images, and masked
text lines. The original code is vanilla HTML, CSS, and module JavaScript.

## Observed Structure

- `nav` with a brand link and right-aligned navigation links.
- `.hero` section containing five `.intro-img` layers.
- `.hero-content` with `.hero-header` headline and `.hero-social` contact links.
- `.preloader-overlay` above the page.
- `.preloader` is the loading line inside the overlay.
- Each intro image is a full-screen absolute layer. The card look comes from
  scaling each layer to `0.2`, not from making the DOM node itself small.

## Observed Animation Logic

- GSAP imports `gsap`, `SplitText`, and `CustomEase`.
- `CustomEase.create("hop", "0.9, 0, 0.1, 1")`.
- `CustomEase.create("glide", "0.8, 0, 0.2, 1")`.
- The vanilla tutorial starts with `gsap.timeline({ delay: 1 })`; the lab keeps
  the delay configurable.
- SplitText targets `nav a`, `.hero-header h1`, `.hero-social p`, and
  `.hero-social a` with `type: "lines"`, `mask: "lines"`, and `autoSplit: true`.
- Lines start at `y: "125%"`, then reveal to `y: "0%"`.
- The preloader line scales from left to right, then collapses from right to
  left with the GSAP position `"<0.75"`.
- The preloader overlay exits upward through
  `clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)`, also using
  `"<0.75"`. This is why the next screen appears from bottom to top.
- Intro images are full-screen absolute panels scaled to `0.2`, rotated with
  `[-15, 5, -7.5, 10, -2.5]`, and moved from off-screen into a centered row.
- The centered row is calculated from `window.innerWidth`, `introImgScale`,
  `introImgGap`, and each card index.
- The intro image row uses a `0.025` second per-card offset, creating the
  card-dealing motion.
- After the row lands, the first `"spread"` position creates the shared spread
  label.
- The left two cards move to `x: "-100vw"` and the right two cards move to
  `x: "100vw"`.
- The center `.hero-img` scales to `1`, moves to `x: 0`, rotation `0`, and
  border radius `0`, becoming the full-screen hero background. Its position is
  `"<"`, so it starts with the right-side card exit.
- Nav, headline, and social copy are revealed with SplitText line masks after
  the hero image begins expanding. In the reference, nav uses `"<1"`, headline
  uses `"<"`, and social uses `"<0.25"`.

## Next.js Adaptation

This module keeps the tutorial behavior but adapts it to the project rules:

- `LandingReveal` is a React client component.
- `src/app/lab/landing-reveal/page.tsx` is only a lab display route.
- CSS is isolated in `landing-reveal.module.css`.
- GSAP selectors are scoped to `rootRef` through `useGSAP`.
- SplitText instances are reverted and killed on cleanup.
- The GSAP timeline is killed on cleanup.
- The tutorial's global selectors are replaced with scoped DOM queries and
  grouped SplitText line arrays.
- Missing image files show CSS placeholders instead of failing visually.
- Missing text falls back to safe default copy.

## Configurable Inputs

Edit `landing-reveal.config.ts` to change:

- Brand, nav, headline, preloader label/counter/status/source, social lead,
  social links, and optional footer note.
- Intro image paths, hero image path, hero image index, alt text, labels, and
  placeholder tones.
- CustomEase curves.
- Preloader delay, line duration, line exit duration, line exit offset, clip
  duration, and clip offset.
- Intro image scale, gap, offscreen ratio, rotations, duration, stagger,
  deal delay, spread overlap, and exit movement.
- Hero image reveal delay and duration.
- SplitText line reveal y offset, duration, stagger, nav duration, social
  duration, text lead, and social offset.
- CSS variables for background, ink, muted text, panel, paper, border, and
  radius.

## Fallbacks

The default asset config intentionally omits real image `src` values. If an
image `src` is missing, each panel renders a CSS placeholder tone. If a provided
image fails to load, the broken image element is hidden and the placeholder
remains visible. Text fields are optional; empty copy is filtered before
SplitText is created, so missing brand, eyebrow, headline, social lead, footer
note, or social links do not throw.

## 第一版封版紀錄

封版日期：2026-06-04

目前版本狀態：`landing-reveal` 第一版穩定封版。多輪比對與節奏修正後，目前保留教學影片四的核心動作：上方白色細線、由下往上的白面揭露、五張斜卡發牌式進場、左右兩側卡片分別往左右飛出、中間 hero 圖延後放大成首頁主視覺、nav/headline/social 以 SplitText line mask 進場。此紀錄只保存目前 `/lab/landing-reveal` 的穩定版本，未接入正式首頁。

已實作的教學影片四核心邏輯：

- HTML / JSX 結構：preloader overlay、loader line、reveal surface、intro image stack、nav、headline、social info 都在 `LandingReveal` client component 內。
- CSS / CSS Module：所有 landing-reveal 樣式隔離在 `landing-reveal.module.css`，不使用全域 selector 影響其他特效。
- GSAP timeline：白線、白面上彈、五卡入場、左右散開、hero 放大、文字 reveal 都在同一條 timeline 內用 label 和 position 編排。
- SplitText：nav、headline、social 的 `[data-landing-split]` 文字會依 group 建立 SplitText lines，並以 mask lines 做 `y: "125%"` 到 `y: "0%"` 的 reveal。
- CustomEase：`landingRevealHop` 和 `landingRevealGlide` 從 config 建立，並實際套用在 preloader、surface、intro cards、spread、hero reveal。
- React / Next.js client component：`landing-reveal.tsx` 使用 `"use client"`，lab page 只 import 並展示 component。
- GSAP cleanup：`useGSAP` 使用 `scope: rootRef` 和 `revertOnUpdate: true`，unmount 或 config 更新時會 kill timeline，SplitText 也會 `revert()` / `kill()`。

可從 config 更換的內容：

- `copy.brand`
- `copy.navItems`
- `copy.eyebrow`
- `copy.heroTitle`
- `copy.introLabel`
- `copy.preloaderCounter`
- `copy.preloaderStatus`
- `copy.preloaderSource`
- `copy.socialLead`
- `copy.socialLinks`
- `copy.footerNote`
- `assets.imagesDirectory`
- `assets.heroImageIndex`
- `assets.heroImage`
- `assets.introImages`
- `cssVariables`

可從 config 調整的動畫參數：

- `animation.easings.hop`
- `animation.easings.glide`
- `animation.preloader.delay`
- `animation.preloader.lineDuration`
- `animation.preloader.lineExitDuration`
- `animation.preloader.lineExitDelay`
- `animation.preloader.clipDuration`
- `animation.preloader.clipDelay`
- `animation.introImages.scale`
- `animation.introImages.gap`
- `animation.introImages.offscreenRatio`
- `animation.introImages.rotations`
- `animation.introImages.duration`
- `animation.introImages.stagger`
- `animation.introImages.dealDelay`
- `animation.introImages.spreadOverlap`
- `animation.introImages.exitDuration`
- `animation.introImages.exitXPercent`
- `animation.heroImage.delay`
- `animation.heroImage.duration`
- `animation.reveal.lineY`
- `animation.reveal.duration`
- `animation.reveal.stagger`
- `animation.reveal.navDuration`
- `animation.reveal.socialDuration`
- `animation.reveal.textLead`
- `animation.reveal.socialOffset`

Placeholder / fallback 規則：

- `introImages` 或 `heroImage` 沒有 `src` 時，會顯示對應 `tone` 的 CSS placeholder。
- 圖片載入失敗時，`onError` 會隱藏 broken image，底下 placeholder 仍保留。
- `introImages` 若被設成空陣列，component 會用 `heroImage` 建立最低限度的一張 hero card，避免 timeline 沒有可用卡片。
- 文字欄位可留空或省略；SplitText 只會處理有文字內容的 target。
- `socialLinks` 可省略或設為空陣列，不會報錯。
- `footerNote` 可省略；只有有內容時才 render。

Mobile 規則：

- 手機斷點為 `max-width: 760px`。
- 手機版保持 full-screen hero，intro card 視覺 scale 改為 `0.18`，gap 改為 `28`。
- nav 改成上下排列，headline 改成 full width，social 區塊改為直向排列。
- 動畫 timeline 沿用同一套 config 節奏，不另外建立手機專用 timeline。

Cleanup 規則：

- `useGSAP` 的 `scope: rootRef` 限制所有 selector 在 component root 內。
- `revertOnUpdate: true` 讓 config 更新時自動 revert scoped GSAP context。
- timeline cleanup 會執行 `timeline.kill()`。
- SplitText cleanup 會對每個 instance 執行 `split.revert()` 和 `split.kill()`。
- `prefers-reduced-motion` 分支會直接清除動畫 inline props，並同樣回傳 SplitText cleanup。

未來如何替換正式素材：

- 將正式圖片放入 `public/images/landing-reveal/`。
- 在 `landing-reveal.config.ts` 的 `assets.introImages` 加上 `src`，例如 `/images/landing-reveal/intro-01.jpg`。
- 在 `assets.heroImage.src` 加上正式 hero 圖路徑。
- 用 `assets.heroImageIndex` 指定哪一張 intro card 會被 hero image 取代並放大。
- 若只要改 placeholder，不放正式圖，調整每張 image 的 `label` 和 `tone` 即可。

未來如何接入首頁，但本次不接：

- 未來若要接入正式首頁，只需要在首頁或指定 route import `LandingReveal`，並傳入需要的 config。
- 正式接入前應先決定是否沿用 lab config，或建立 production config。
- 本次封版沒有修改 `src/app/page.tsx`，也沒有把 `landing-reveal` 接入首頁。

封版確認：

- 沒有修改首頁。
- 沒有修改 `src/app/page.tsx`。
- 沒有修改 `brand-reveal`、`text-reveal`、`dissolve-page-transition`。
- 沒有修改 `package.json`。
- 沒有修改 lock file。
- 沒有安裝套件。
- `src/app/lab/landing-reveal/page.tsx` 只負責展示 `LandingReveal`。
- `src/components/landing-reveal/`、`src/app/lab/landing-reveal/`、`public/images/landing-reveal/` 可獨立刪除，不影響其他特效或首頁。
