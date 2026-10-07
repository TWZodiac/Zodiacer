# Design System Master File — 星靈猜猜看

> 頁面若有 `design-system/pages/[page].md`，以該檔為準；否則依本檔。

**Project:** Zodiacer（星靈猜猜看）
**Updated:** 2026-10-07
**Direction:** 參考 SPARKFUL 的「把日常變成遊戲」：暖色粉彩、圓潤角色、收集與成就感。

## 色彩（`src/app/globals.css`）

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--bg` / `--bg-2` | `#FFF6EC` / `#FFE7D6` | `#17142E` / `#241D4A` | 背景漸層 |
| `--card` / `--card-2` | `#FFFFFF` / `#FFF3E6` | `#262051` / `#2F2862` | 卡片、次要底色 |
| `--ink` / `--ink-soft` | `#2D2552` / `#5F5885` | `#FFF4E6` / `#C9C2EA` | 文字 |
| `--line` | `#2D2552` | `#5B4FAE` | 貼紙粗框與下陰影 |
| `--accent` | `#FFC145` | 同左 | 主要按鈕（深色字） |
| `--peach` `--lilac` `--mint` `--star` | | | 點綴、主題標籤、星星 |
| `--fire` `--earth` `--air` `--water` | `#FF7B54` `#4FB171` `#3F9FE8` `#8B78F5` | | 四象元素色 |

## 字體

- 標題與數字：Baloo 2（`font-display`）
- 內文：Noto Sans TC，後備 PingFang TC、微軟正黑體

## 元件

- **貼紙卡片 `.sticker`**：3px 粗框、28px 圓角、6px 實心下陰影。
- **按鈕 `.btn`**：膠囊形，hover 上浮 2px、按下沉 3px；主要 `.btn-primary`（黃底深字）、次要 `.btn-ghost`。
- **選項 `.option`**：20px 圓角的大按鈕，單選題左側 A–F 圓章；是非題並排兩顆。
- **星靈小星**：圓潤五角星角色，表情 idle / think / happy / wow / pout。
- **星座圖**：每個星座一組星點與連線，鎖住時只剩暗淡星點。

## 規則

- 圖示一律用 lucide-react，不用 emoji 當圖示。
- 所有可點元素有 `cursor: pointer` 與 150ms 過場；`:focus-visible` 顯示 3px 外框。
- 尊重 `prefers-reduced-motion`（`MotionConfig reducedMotion="user"`，並關掉閃爍與揭曉動畫）。
- 響應式：375 / 768 / 1024 / 1440；作答頁在 `md` 以上分左右兩欄。
