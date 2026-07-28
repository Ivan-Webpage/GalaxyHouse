# CLAUDE.md

給 AI agent 的專案速覽。詳細內容拆分在 [docs/](docs/) 資料夾，請依需求查閱。

> **語言慣例**：與使用者（專案owner）對話時一律使用**繁體中文**回覆，不要用英文或其他語言。這是使用者明確要求的溝通慣例，每次對話都要遵守，不只是這次而已。

## 專案是什麼

GalaxyHouse（銀河會所）官方網站。**純前端靜態網站**：Angular 19（`src/` + `projects/lib/`），用 Angular 的 build-time prerender 產生真正的靜態 HTML，部署到 GitHub Pages，綁定自訂網域 `thegalaxyhouse.com`。

原本有一組 Django + DRF 後端（`backEnd20251210/`）負責分店 / 文章 / 職缺資料，**已於重構中移除**：資料改成靜態 JSON（`public/data/*.json`），原本活在後端 view 裡的過濾/排序/分組邏輯搬到前端的 `ContentService`。`backEnd20251210/` 資料夾還留在硬碟上當歷史備份，但已被 `.gitignore`、不再被前端依賴，也不會被部署。細節見 [docs/architecture.md](docs/architecture.md) 與 [docs/refactor-plan.md](docs/refactor-plan.md)（含完整遷移記錄）。

## 目錄結構

```
GHWeb/
├── src/app/              # 頁面層元件（路由對應的 page component）
├── projects/lib/         # Angular library "lib"：共用元件、service、interface、directive
│   └── src/lib/service/content.service.ts   # 讀取 public/data/*.json 的靜態資料服務
├── public/
│   ├── data/*.json       # 網站資料本體（分店、文章、職缺、消息分類）
│   └── images/uploads/*  # 從舊後端搬過來的圖片
├── scripts/              # 內容維運與發佈工具（見下方）
├── backEnd20251210/      # 舊 Django 後端，已停用、已 gitignore，僅供歷史參考
├── docs/                 # 詳細文件（見下方索引）
└── angular.json          # workspace 設定，專案名為 galaxyhouseWeb / lib
```

## 常用指令

```bash
npm start              # ng serve，本地開發
npm run build           # ng build，輸出到 dist/galaxyhouse-web（含 prerender 靜態 HTML）
npm run sitemap         # 依 public/data 內容重新產生 public/sitemap.xml
npm run article:add     # 互動式新增文章/活動，會自動更新 sitemap
npm run publish         # commit+push 原始碼到 main，build，並把靜態站 push 到 gh-pages（含 CNAME）
```

日常「新增一場活動」的流程：`npm run article:add` 依提示輸入 → 選擇是否立即發佈，或之後手動 `npm run publish`。完整說明見 [docs/content-editing.md](docs/content-editing.md)。

## 前端重點事實

- 頁面元件都在 `src/app/*`（home、apply、about-us、branch-shop、article、news、buffet、catering），路由定義在 [src/app/app.routes.ts](src/app/app.routes.ts)。
- 資料存取統一經過 [projects/lib/src/lib/service/content.service.ts](projects/lib/src/lib/service/content.service.ts)：讀 `public/data/*.json`，並在前端重建原本後端的業務邏輯（文章 `state>0` 與到期日過濾、依到期日排序、首頁限制 9 篇、菜單依 menuType 分組、職缺依分店分組）。修改資料篩選/排序邏輯要改這裡，不要在各頁面元件裡各自實作一份。
- `projects/lib/src/lib/interface/content.ts` 定義了靜態資料的 TS 型別（`ArticleRecord`/`BranchData`/`ApplyGroup` 等），對照 `public/data/*.json` 的實際格式。
- Angular 有啟用 SSR 的 build-time prerender（`app.config.server.ts`、`app.routes.server.ts`），**這是實際會用到的功能**：`home`、`apply`、`about_us`、`banquet`、`catering`、`branchShop/:id`、`news/:type/:scope`、`article/:id` 都會在 `ng build` 時產生真正的靜態 HTML（含各頁專屬的 title/meta/canonical），檔案輸出到 `dist/galaxyhouse-web/browser/<route>/index.html`。`article/:id` 的可 prerender 清單是從 `public/data/articles.json` 動態讀出來的，新增文章後重新 build 就會自動涵蓋。
- SEO meta（title、OG、Twitter card、canonical）由 [projects/lib/src/lib/service/make-meta.service.ts](projects/lib/src/lib/service/make-meta.service.ts) 統一管理，用 DOM 直接 upsert `<meta>`/`<link rel="canonical">`，不要改回用 Angular `Meta.addTags`（在這個專案的 SSR/prerender 流程中會產生重複 tag，細節見程式內註解）。每個頁面元件的 `ngOnInit` 都要呼叫 `this.meta.set(title, keywords, description, image)`，這是唯一會設定該頁 SEO 資訊的地方。

## docs 索引

- [docs/architecture.md](docs/architecture.md) — 現況整體架構（純靜態 + prerender + GitHub Pages 部署）
- [docs/frontend-structure.md](docs/frontend-structure.md) — Angular app 與 lib 的詳細結構
- [docs/backend-api-reference.md](docs/backend-api-reference.md) — 舊後端 API 規格（歷史參考，說明 `public/data/*.json` 裡每個欄位原本從哪裡來）
- [docs/refactor-plan.md](docs/refactor-plan.md) — 移除後端的重構記錄（已完成，含詳細遷移過程與已知取捨）
- [docs/content-editing.md](docs/content-editing.md) — 日常新增活動/文章、發佈網站的操作說明

## 給 AI agent 的協作提醒

- **一律用繁體中文回覆使用者**，即使先前對話是用其他語言進行的也一樣。
- 後端已經移除，**不要**假設或建議呼叫 Django/Zeabur API；所有資料都在 `public/data/*.json`，透過 `ContentService` 讀取。
- 內文含大量繁體中文字串（頁面文案、SEO meta），修改時保留原文風格，不要翻譯或改寫非必要文字。
- `projects/lib` 是共用套件，修改時要考慮多個頁面共用的影響範圍。
- `scripts/` 底下的 Node 工具（`add-article.js`、`publish.js`、`generate-sitemap.js`）會執行 git commit/push，屬於會影響共用/遠端狀態的操作，修改這些腳本或代替使用者執行 `npm run publish` 前要特別小心，確認使用者真的要現在發佈。
