這個資料夾裡以下素材是 Brand Reveal 特效需要的：

- berry-hero-flow.png：首頁主視覺背景，可替換
- berry-word.png：品牌文字圖，可替換
- berry-logo.svg：Logo 原始參考檔，可替換，但動畫實際讀取 logo.js 的 path

替換圖片時：
1. 新圖放進 public/images
2. 更新 src/components/brand-reveal/brand-reveal.config.js
3. 不要直接刪除舊素材，除非確認沒有被引用
