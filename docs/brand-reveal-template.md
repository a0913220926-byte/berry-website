# Brand Reveal Template Guide

## What this is

這是一個可重複使用的 GSAP + ScrollTrigger + Lenis + SVG Mask Reveal 品牌開場特效。

## Current files

- src/app/lab/brand-reveal/page.tsx
- src/components/brand-reveal/brand-reveal.tsx
- src/components/brand-reveal/brand-reveal.module.css
- src/components/brand-reveal/logo.js
- src/components/brand-reveal/brand-reveal.config.js
- public/images/berry-hero-flow.png
- public/images/berry-word.png
- public/images/berry-logo.svg
- package.json
- package-lock.json

## Required dependencies

- gsap
- lenis

## Required image assets

目前 BERRY 版本需要：

- public/images/berry-hero-flow.png
- public/images/berry-word.png

## Required logo path

Logo path 位於：
src/components/brand-reveal/logo.js

Logo 必須是真正的 SVG path，不可以是 PNG 包在 SVG 裡。

正確：

```svg
<path d="..." />
```

錯誤：

```svg
<image href="data:image/png..." />
```

## How to replace brand assets

以後換品牌時，優先修改：

src/components/brand-reveal/brand-reveal.config.js

更換：

- heroImage
- wordMark
- cards copy

## How to replace logo

1. 準備真正向量 SVG logo
2. 打開 SVG 原始碼
3. 找到 <path d="...">
4. 複製 d 內容
5. 替換 src/components/brand-reveal/logo.js 裡的 logoData
6. 開啟 /lab/brand-reveal 測試

## Do not casually modify

以下內容不要隨便動，否則特效可能失敗：

- getBBox()
- getBoundingClientRect()
- logoMaskGroup transform
- ScrollTrigger onUpdate
- Lenis init / destroy
- progress 分段計算
- SVG mask 結構

## Test checklist

每次換素材後都要執行：

```bash
npm run lint
npm run typecheck
npm run build
```

並確認：

- /lab/brand-reveal 可正常打開
- SVG mask reveal 正常
- BERRY wordMark 或新品牌 wordMark 有顯示
- 主視覺圖有顯示
- 手機版不爆版
- 滾動不卡住

## Restore guide

如果之後特效壞掉，請先檢查：

1. package.json 是否仍有 gsap、lenis
2. public/images 裡素材是否存在
3. brand-reveal.config.js 路徑是否正確
4. logo.js 是否是真正 path
5. brand-reveal.module.css 是否仍存在
6. /lab/brand-reveal 是否可打開
