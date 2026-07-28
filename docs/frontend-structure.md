# 前端結構

Angular workspace 有兩個 project（見 `angular.json`）：`galaxyhouseWeb`（app，`src/`）與 `lib`（共用 library，`projects/lib/`）。

## `src/app` — 頁面層

每個路由對應一個獨立的 standalone component 資料夾（`*.component.ts/html/scss/spec.ts`）：

| 路由 | Component | 資料來源 |
|---|---|---|
| `/home` | `HomeComponent` | `ContentService.getRecentArticles()` |
| `/branchShop/:id` | `BranchShopComponent` | `ContentService.getBranchShop(id)` |
| `/about_us` | `AboutUsComponent` | 純靜態 |
| `/apply` | `ApplyComponent` | `ContentService.getApplyClassification()` |
| `/news/:newType/:branchShop` | `NewsComponent` | `ContentService.getArticlesByNewsType(newType, branchShop)` |
| `/banquet` | `BuffetComponent` | 純靜態 |
| `/catering` | `CateringComponent` | 純靜態 |
| `/article/:id` | `ArticleComponent` | `ContentService.getArticleById(id)` + `getRecentArticles()` |

路由定義：[src/app/app.routes.ts](../src/app/app.routes.ts)。哪些路由會被 build-time prerender 見 [src/app/app.routes.server.ts](../src/app/app.routes.server.ts) 與 [architecture.md](architecture.md)。

`BuffetComponent` 與 `CateringComponent` 完全是靜態內容，沒有資料依賴。

## `projects/lib` — 共用套件（import 時寫 `from 'lib'`）

```
projects/lib/src/lib/
├── component/       # UI 元件：collapsible, floating-block, footer, navbar, slideshow,
│                    #          triangle-slideshow, calendar, card, loading
├── directive/       # animation-into, image-filter, slip-hover, sticky
├── interface/       # article.ts (Article/ArticleSimple/NewType), images.ts (Images),
│                    #   content.ts (ArticleRecord/BranchData/ApplyGroup 等靜態資料型別)
├── service/         # content.service, destroy.service, make-meta.service
├── config/          # font-awesome.config.ts
└── types/
```

重點檔案：

- [service/content.service.ts](../projects/lib/src/lib/service/content.service.ts) — 唯一讀取 `public/data/*.json` 的地方。用 `HttpClient` 讀本地靜態檔（走 `withFetch()`，讓 build-time prerender 在 Node 環境下也能正常抓到檔案，見 [src/app/app.config.ts](../src/app/app.config.ts)），並在這裡重建原本 Django view 裡的邏輯：
  - `getRecentArticles()` — state>0、未過期、依到期日排序，限制 9 筆
  - `getArticlesByNewsType(newType, branchShop)` — 同上但依分類/分店篩選、無筆數上限
  - `getArticleById(id)` — 只檢查 state，不檢查到期日（跟原本後端行為一致）
  - `getBranchShop(englishName)` / `getApplyClassification()` — 直接讀已經分組好的靜態資料
- [interface/content.ts](../projects/lib/src/lib/interface/content.ts) — 對照 `public/data/*.json` 實際格式的 TS 型別。
- [interface/article.ts](../projects/lib/src/lib/interface/article.ts) / [interface/images.ts](../projects/lib/src/lib/interface/images.ts) — 元件對外使用的資料型別（`Article`/`ArticleSimple`/`Images`）。
- `service/destroy.service.ts` — 每個有訂閱資料的元件都會 `providers: [DestroyService]`，搭配 `takeUntil(this.destroy$)` 做訂閱清理，這是這個專案處理 RxJS 訂閱生命週期的慣例寫法（即使現在資料來源是靜態檔案，這個模式還是保留，改動幅度較小）。
- `service/make-meta.service.ts` — 每個頁面在 `ngOnInit` 呼叫 `this.meta.set(title, keywords, description, image)`，會設定 title、meta description、Open Graph、Twitter Card，並動態更新 `<link rel="canonical">` 為當前路由的完整網址。**不要**改回用 Angular `Meta.addTags`——這個專案的 SSR/prerender 流程下它沒辦法正確找到 `index.html` 裡已存在的同名 static tag，會產生重複 tag（詳見程式內註解與 [docs/architecture.md](architecture.md) 的 SEO 章節）。

## 靜態資源與資料

- `public/images/` — 圖片資源根目錄。`public/images/16比9/`、`Buffet/`、`外燴/` 等是專案原本就有的手寫版位圖片（輪播圖等，路徑寫死在各元件的 `slides` 陣列裡）；`public/images/uploads/<類型>/` 是從舊後端 media 資料夾遷移過來的內容圖片（分店相簿、文章封面、菜單分類封面、分店 cover 輪播圖），檔名維持原始檔名（含中文）。
- `public/data/*.json` — 網站資料本體，見 [architecture.md](architecture.md) 的「資料層」章節。

## 命名與撰碼慣例

- 頁面文案、SEO meta、資料欄位標籤大量使用繁體中文，且用詞正式（例如「福利」「給薪方式」「資料狀態」），修改時延續既有用語風格。
- 「頁面顯示用的 TypeScript interface」有些定義在 component 檔案底部（如 `branch-shop.component.ts`），有些統一放在 `projects/lib/interface`（`content.ts`）——新增欄位時兩邊要對照著看，別漏改。
