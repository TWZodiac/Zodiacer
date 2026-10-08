# 星靈猜猜看（Zodiacer）

回答幾個生活小問題，星靈小星會用貝氏推論一步步猜出你的太陽星座。猜中了算牠厲害，猜錯了算你神祕，每猜出一個新星座就收進圖鑑。

## 玩法

- 每局 8–16 題，從 110 題、9 種主題（個性、社交、愛情、工作、金錢、情緒、生活、美感、冒險）中動態出題。
- 左邊的星盤即時顯示 12 星座的可能性；每答一題，星靈會說「選這個的人最常是哪個星座」。
- 答滿 8 題還沒把握時，星靈會使出一次「季節透視」絕招，問生日在哪個季節；玩家可以拒絕，沒用絕招就猜中會解鎖「純粹讀心」成就。
- 揭曉後回報猜對與否，猜錯時選出真正的星座，看看自己排第幾名、哪些回答最像或最不像自己的星座。
- 圖鑑與 9 個成就存在瀏覽器 localStorage；圖鑑頁可以複製或下載作答紀錄 JSON，之後可用來校正題目權重。

## 猜中率

題目權重來自網路上的星座印象，不是真人資料，所以猜中率取決於玩家有多像自己星座的印象。`npm test` 的模擬結果：

| 玩家 | 有絕招 | 不用絕招 |
|---|---|---|
| 完全照星座印象作答 | 猜中 78%，前三 96% | 約 56% |
| 一半像 | 猜中 54%，前三 95% | 約 26% |
| 完全不像 | 約 33% | 約 9%（等於亂猜） |

心理學研究找不到太陽星座和個性的明顯關聯，所以光改題目有天花板；要讓個性題更準，需要收集真人的作答與真實星座來重新校正權重。

## 開發

```bash
npm install
npm run dev              # http://localhost:3000/Zodiacer
npm test                 # 引擎單元測試 + 模擬玩家猜中率
npm run lint
npm run build            # 靜態輸出到 out/
npm run deploy           # 推到 TWZodiac/Zodiacer 的 gh-pages
```

`NEXT_BASE_PATH` 可覆寫部署路徑（預設 `/Zodiacer`，本機預覽可設為空字串）。

## 題庫

- `src/data/authoring/legacy_bank_50.json`：原本 50 題，沿用既有權重。
- `src/data/authoring/new_questions.json`：新題目。每個選項用「星座+分數」標記，例如 `"射手3 牡羊2 水瓶1"`。
- `npm run build:questions` 把兩者換算、合併成 `src/data/question_bank.json`（每個星座在同一題的選項機率總和為 1），並計算資訊增益。
- `python3 generate_spec.py` 依題庫重新產生 `spec.md`。

新增題目時，在 `new_questions.json` 加一筆，跑 `npm run build:questions` 和 `npm test` 即可。

## 程式結構

```
src/domain/      純函式：星座資料、貝氏引擎、一局的狀態、洞察、成就、紀錄
src/hooks/       useZodiacGame：把 domain 接到 React 狀態與 localStorage
src/components/  首頁、作答、揭曉、結果、圖鑑等畫面
tests/           node:test 測試
```
