# Copilot Instructions — 通用規則（Clean Architecture 版 v1.2）

> 目的：提供 **通用、與專案無關** 的規範，讓 Copilot 生成的程式碼 **一致、可維護、可測試、可替換資料來源**。適用於 TypeScript/React/Next.js 或類似框架。
>
> **本版重點**：
>
> * 補上 Adapter 平行子層的 **層內隔離**（store ⟂ repository；UI ⟂ ApiService）。
> * 新增 **Composition Root（組裝點）**：唯一建立並注入 ApiServiceImpl/RepositoryImpl/UseCase 的地方。
> * 以 **ESLint + CI** 強制邊界，避免規則流失。

---

## 0) 黃金守則（Golden Rules）

1. **型別優先**：public 介面、函式入出參數與回傳值必有明確型別，避免 `any`。
2. **單一責任**：檔案與函式只做一件事；複雜流程拆小步驟以組合完成。
3. **依賴反轉**：上層依賴抽象（interface），不依賴具體實作。
4. **可替換資料來源**：定義穩定的 Repository 介面；實作可切換（mock/http/local/db/sse/ws）。
5. **讀寫分離**：能分則分（Query vs Command）。
6. **副作用集中**：IO/導航/儲存集中於 Adapter/Framework；Domain/UseCase 保持純粹。
7. **絕對匯入**：使用 `@/` 別名；禁止 `../../..`。
8. **可觀測性**：錯誤與關鍵狀態有型別與統一處理。
9. **可測試**：優先純函式與可注入依賴；UseCase/Repository 可替身（mock）。
10. **a11y/UX**：互動元件有 ARIA、鍵盤可用、具空/載入/錯誤三態。

---

## 1) 資料契約（Types First）

先定義 **Domain Entity**、**DTO**、**Repository 介面**；命名穩定。

```ts
// features/item/entity/models.ts
export interface Item { id: string; name: string; tags: string[] }

// features/item/entity/ports.ts
export interface ItemRepository {
  list(params?: { q?: string }): Promise<Item[]>
  get(id: string): Promise<Item | undefined>
  create(input: Omit<Item, 'id'>): Promise<Item>
  update(id: string, patch: Partial<Omit<Item, 'id'>>): Promise<Item>
  remove(id: string): Promise<void>
}
```

> **嚴禁**：UI/Store 直接耦合 HTTP 原始結構；DTO ↔ Domain 的轉換僅在 **RepositoryImpl** 或專責 mapper。

---

## 2) 目錄與分層（by‑feature 推薦）

```
features/<feature>/
  entity/           # Domain Models & Ports（純型別/規則）
  usecase/          # UseCases（依賴 Repository 介面）
  adapter/
    store/          # 狀態（Zustand/Redux），只依賴 UseCases
    repository/     # RepositoryImpl（只依賴 ApiService 介面）
    ports.ts        # ApiService/Storage 介面（Adapter 暴露）
  framework/
    ui/             # React components/pages（只用 store）
    api/            # ApiServiceImpl（HTTP/WS/SSE...）
    storage/        # StorageImpl（IndexedDB/LocalStorage...）
    app/
      composition-root.tsx  # ♟ 唯一的組裝點（建立與注入）
      providers.tsx         # React Providers（將 usecases 提供給 UI/Store）
```

### 合法依賴方向

```
UI (framework/ui)
  → Store (adapter/store)
    → UseCase (usecase)
      & Repository Interface (entity/ports)
        → RepositoryImpl (adapter/repository)
          & ApiService Interface (adapter/ports)
            → ApiServiceImpl / StorageImpl (framework/api|storage)
```

---

## 3) 層內隔離（Adapter 子層的邊界）

* `adapter/store` 與 `adapter/repository` 為**平行子層**，**禁止互相 import**。
* `framework/ui` **不得** import `adapter/repository`、`framework/api|storage` 或 `adapter/ports`。
* `ApiServiceImpl` 僅能在 **Composition Root** 被看見與實例化；其他層一律不可 import。

> 透過 ESLint（見 §10）在建置期強制，PR 直接擋掉違規。

---

## 4) Composition Root（唯一組裝點）

**只在這裡** 決定使用哪個 ApiServiceImpl / RepositoryImpl，並建立 UseCases，最後以 Provider 提供給 UI/Store。

```tsx
// features/item/framework/app/composition-root.tsx
import React from 'react'
import { HttpItemApiService } from '@/features/item/framework/api/HttpItemApiService'
import { MockItemApiService } from '@/features/item/framework/api/MockItemApiService'
import { HttpItemRepository } from '@/features/item/adapter/repository/HttpItemRepository'
import { ListItems } from '@/features/item/usecase/ListItems'
import { UseCasesProvider } from './providers'

export default function CompositionRoot({ children }: React.PropsWithChildren) {
  const api = process.env.NEXT_PUBLIC_DATA_SOURCE === 'http'
    ? new HttpItemApiService()
    : new MockItemApiService()

  const repo = new HttpItemRepository(api)
  const usecases = { listItems: new ListItems(repo) }

  return <UseCasesProvider value={usecases}>{children}</UseCasesProvider>
}
```

Provider 與 Hook：

```ts
// features/item/framework/app/providers.tsx
import React, { createContext, useContext } from 'react'
import type { ListItems } from '@/features/item/usecase/ListItems'

type ItemUseCases = { listItems: ListItems }
const Ctx = createContext<ItemUseCases | null>(null)

export function UseCasesProvider({ value, children }:{ value: ItemUseCases; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useItemUseCases(): ItemUseCases {
  const v = useContext(Ctx)
  if (!v) throw new Error('Wrap with CompositionRoot')
  return v
}
```

---

## 5) Store 僅依賴 UseCases（兩種實作方式）

### 方案 A：建立時注入（測試友好）

```ts
// features/item/adapter/store/createItemStore.ts
import { create } from 'zustand'
import type { Item } from '@/features/item/entity/models'
import type { ListItems } from '@/features/item/usecase/ListItems'

export type ItemStoreDeps = { listItems: ListItems }

export function createItemStore(deps: ItemStoreDeps) {
  type State = { items: Item[]; loading: boolean; error?: string }
  type Actions = { fetch(q?: string): Promise<void> }

  return create<State & Actions>((set) => ({
    items: [],
    loading: false,
    async fetch(q) {
      set({ loading: true, error: undefined })
      try { set({ items: await deps.listItems.execute({ q }) }) }
      catch (e) { set({ error: (e as Error).message }) }
      finally { set({ loading: false }) }
    },
  }))
}
```

UI 組裝：

```tsx
// features/item/framework/ui/ItemPage.tsx
import CompositionRoot from '@/features/item/framework/app/composition-root'
import { useItemUseCases } from '@/features/item/framework/app/providers'
import { createItemStore } from '@/features/item/adapter/store/createItemStore'

function ItemList() {
  const { listItems } = useItemUseCases()
  const useStore = React.useMemo(() => createItemStore({ listItems }), [listItems])
  const { items, loading, fetch } = useStore()
  React.useEffect(() => { fetch() }, [fetch])
  return /* render list */ null
}

export default function Page() {
  return (
    <CompositionRoot>
      <ItemList />
    </CompositionRoot>
  )
}
```

### 方案 B：Store 內用 Context 取依賴（改動最小）

```ts
// features/item/adapter/store/itemStore.ts
import { create } from 'zustand'
import type { Item } from '@/features/item/entity/models'
import { useItemUseCases } from '@/features/item/framework/app/providers'

export const useItemStore = (() => {
  let store: ReturnType<typeof create> | null = null
  return function useStore() {
    const { listItems } = useItemUseCases()
    if (!store) {
      store = create<{ items: Item[]; loading: boolean; error?: string } & { fetch(q?: string): Promise<void> }>((set) => ({
        items: [],
        loading: false,
        async fetch(q) {
          set({ loading: true, error: undefined })
          try { set({ items: await listItems.execute({ q }) }) }
          catch (e) { set({ error: (e as Error).message }) }
          finally { set({ loading: false }) }
        },
      }))
    }
    return store()
  }
})()
```

> 無論 A 或 B：Store 都不可 import `RepositoryImpl`、`ApiService*` 或任何 `framework/api|storage`。

---

## 6) Repository 與 ApiService 的責任切分

**RepositoryImpl（adapter/repository）**：聚合來源、錯誤標準化、DTO↔Domain 映射。

```ts
// features/item/adapter/ports.ts
export interface ItemApiService {
  list(params?: { q?: string }): Promise<Array<{ id: string; name: string; tags: string[] }>>
}

// features/item/adapter/repository/HttpItemRepository.ts
import type { Item } from '@/features/item/entity/models'
import type { ItemRepository } from '@/features/item/entity/ports'
import type { ItemApiService } from '@/features/item/adapter/ports'

export class HttpItemRepository implements ItemRepository {
  constructor(private api: ItemApiService) {}
  async list(p?: { q?: string }): Promise<Item[]> {
    const dtos = await this.api.list(p)
    return dtos.map(({ id, name, tags }) => ({ id, name, tags }))
  }
}
```

**ApiServiceImpl（framework/api）**：技術實作（fetch/axios/...）。

```ts
// features/item/framework/api/HttpItemApiService.ts
import type { ItemApiService } from '@/features/item/adapter/ports'
export class HttpItemApiService implements ItemApiService {
  async list(p?: { q?: string }) {
    const res = await fetch(`/api/items?q=${encodeURIComponent(p?.q ?? '')}`)
    if (!res.ok) throw new Error('Network error')
    return (await res.json()) as Array<{ id: string; name: string; tags: string[] }>
  }
}
```

---

## 7) 即時事件（SSE/WS 通用簽名）

```ts
export interface Subscription<T> {
  subscribe(onEvent: (e: T) => void, onError?: (err: Error) => void): () => void
}
```

> 上層只看到 `subscribe/() => void`；內部可換成 SSE/WS/輪詢。

---

## 8) 錯誤處理與回復力（Resilience）

* IO 以受控錯誤回傳：`Result` 或自訂錯誤類別。
* 設計備援：SSE 失敗 → polling；cache 失效 → refetch。

---

## 9) UI 元件規格

* **Presentational**：僅 props、不含商業狀態。
* **Container**：只連接 store/hooks，不含樣式細節。
* 提供空/載入/錯誤三態；互動元件加上 `aria-*`。

---

## 10) 產檔與邊界規則（Copilot 必遵守）

1. **不要跨層**：遵守 `UI → store → usecase → repository(介面/實作) → api(介面/實作)` 單向鏈。
2. **檔名與路徑**：`@/features/<feature>/...`；kebabCase/PascalCase 一致。
3. **不可更名 public 介面**：`*Repository`、`*ApiService`、`UseCase`。
4. **事件訂閱統一**：回傳 `() => void`。
5. **UI 不直接 await IO**：交給 store 內動作或 UseCase。
6. **DTO 不外洩**：DTO↔Domain 僅在 RepositoryImpl/mapper。
7. **層內隔離**：`adapter/store ⟂ adapter/repository`、`framework/ui ⟂ adapter/ports|framework/api`。

**ESLint 防呆（示例）**：

```js
// .eslintrc.js 片段
module.exports = {
  rules: {
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          { target: './src/features/**/framework/ui', from: './src/features/**/adapter/repository' },
          { target: './src/features/**/framework/ui', from: './src/features/**/framework/api' },
          { target: './src/features/**/framework/ui', from: './src/features/**/adapter/ports' },

          { target: './src/features/**/adapter/store', from: './src/features/**/adapter/repository' },
          { target: './src/features/**/adapter/store', from: './src/features/**/framework/api' },

          { target: './src/features/**/adapter/repository', from: './src/features/**/framework/ui' },
        ],
      },
    ],
  },
}
```

CI 補強：

```bash
madge --extensions ts,tsx --circular src/
```

---

## 11) 註解範式（讓生成更精準）

檔頭意圖註解：

```ts
/**
 * Intent: Implement the list page data flow.
 * Constraints: Absolute imports only (@/); do not change ItemRepository interfaces.
 * Acceptance: shows loading/error/empty states; renders list; search updates query.
 */
```

關鍵函式 I/O 與副作用：

```ts
// Input: search string; Output: updates store state; Side effects: network fetch via UseCase
```

---

## 12) 測試與可維運性

* UseCase：以 mock Repository 驗證流程。
* Repository：以假伺服器/Mock 驗證序列化與錯誤處理。
* ApiServiceImpl/StorageImpl：以整合測試驗證傳輸與錯誤邊界。
* 日誌策略：關鍵節點 `info`、錯誤 `error`，避免雜訊。

---

## 13) 禁止事項（Hard NOs）

* 相對匯入層層向上（`../../..`）。
* UI/Store 直接呼叫 `fetch/axios/EventSource/WebSocket/IndexedDB`。
* 變更或刪除既有 public 介面名稱/簽名。
* 把 HTTP/DTO 型別帶到 UI/UseCase/Entity。
* 將導航、IO、持久化混入純函式或 Entity。

---

## 14) 最小外掛清單（可選、框架中立）

* 狀態：Zustand/Redux（擇一）
* 型別守門：Zod/Valibot（擇一）
* 資料抓取：React Query/RTK Query（擇一；必要時）
* Mock：以 Repository 假實作為主；必要時再引入 MSW

---

## 15) README/Docs 最小內容（可由 Copilot 生成）

* 架構說明（本文件要點精簡版）
* 啟動、建置、環境變數占位（不含私密值）
* 功能清單與 DoD 勾選表

---

### ✅ 小抄檢查清單（落地確認）

* [ ] Store 裡沒有 `new UseCase()` 或 `getRepository()`。
* [ ] UI/Store 不 import `*ApiService*`、`*RepositoryImpl*`、`framework/api|storage`、`adapter/ports`。
* [ ] `composition-root.tsx` 是唯一 new ApiServiceImpl/RepositoryImpl/UseCase 的地方。
* [ ] `adapter/store/**` 與 `adapter/repository/**` 彼此無引用（ESLint 已擋）。
* [ ] CI 跑 `eslint` + `madge`；違規 PR 直接 fail。
* [ ] 測試可用 `createItemStore({ listItems: mock })` 或 Provider 注入替身。

> **結論**：以「型別先行、依賴反轉、層級分明、層內隔離、單一組裝點」為核心；上層只依賴抽象，下層可任意更換技術而不影響 Domain 與 UI。