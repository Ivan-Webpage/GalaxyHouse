# 架構現況（後端移除後）

## 整體圖

```
┌──────────────────────────────────────────────┐
│  Angular 19 前端 + build-time prerender         │
│  src/app + projects/lib                        │
│  資料來源：public/data/*.json（build 時一併打包）  │
│  部署：GitHub Pages（gh-pages 分支）＋ 自訂網域      │
│        thegalaxyhouse.com                      │
└──────────────────────────────────────────────┘
```

沒有任何 runtime 後端、沒有資料庫。所有內容（分店資訊、文章/活動、職缺）都是 build 時就存在的靜態 JSON，沒有伺服器在跑，也沒有 API 可以打。

`backEnd20251210/`（舊 Django + DRF 後端）還留在專案資料夾裡當歷史備份與遷移對照，但：
- 已加入根目錄 `.gitignore`，不會被新的前端 repo 追蹤或推上 GitHub
- 前端程式碼完全沒有任何地方會呼叫它（`ApiService`、`api.config.ts` 等相關程式碼已刪除）
- 它自己是獨立的 git repo（有自己的 `.git`），跟前端的版本控制無關

## 前端如何「靜態化」

Angular workspace 啟用了 SSR + build-time prerender（`app.config.server.ts`、`app.routes.server.ts`），這不是拿來跑一個常駐的 Node 伺服器，而是在 `ng build` 的時候，把大部分路由實際渲染成純 HTML 檔案：

- `home`、`apply`、`about_us`、`banquet`、`catering` — 固定路由，直接 prerender
- `branchShop/:id` — 依 [src/app/routes-ids.ts](../src/app/routes-ids.ts) 裡列出的分店英文名（Songshan、Tianmu）各自 prerender 一份
- `news/:newType/:branchShop` — 依消息分類 × 分店（含不分店的 `galaxyhouse`）的所有組合各自 prerender
- `article/:id` — 依 `public/data/articles.json` 裡 `state > 0` 的文章 id 動態列出清單，逐篇 prerender（見 [src/app/app.routes.server.ts](../src/app/app.routes.server.ts)）

`ng build` 完成後，`dist/galaxyhouse-web/browser/<route>/index.html` 就是這個路由的完整靜態頁面，包含該頁專屬的 `<title>`、meta description、Open Graph、canonical URL —— 對搜尋引擎與社群分享爬蟲來說，完全不需要執行 JavaScript 就能看到正確內容，這對本站的 SEO 很重要（見下方「SEO 相關」）。

由於 build 只在「發佈當下」跑一次，`article/:id` 的清單是固定死的：**新增文章之後一定要重新 `ng build`** 該文章的靜態頁面才會產生，這也是 `scripts/publish.js` 每次發佈都會重新 build 的原因。

沒有被 prerender 覆蓋到的路徑（理論上不太會發生，因為 `**` 萬用路由也設定了 prerender）會 fallback 到 `index.csr.html`（純 client-side render 的殼），純靠 Angular Router 在瀏覽器端接手。

## 資料層

- `public/data/branch-shops.json` — 依分店英文名（`Songshan`/`Tianmu`）分組，包含分店資訊、菜單（已依 menuType 分組）、相簿。內容變動不頻繁，目前是遷移時一次性產生，沒有工具重新產生（如需更新，手動編輯這個檔案，或參考 [refactor-plan.md](refactor-plan.md) 裡遷移腳本的邏輯重新產生）。
- `public/data/apply.json` — 依分店分組的職缺清單，跟上面一樣屬於低頻更新資料。
- `public/data/news-types.json` — 文章分類定義（公告/最新活動/活動花絮），低頻更新。
- `public/data/articles.json` — **唯一設計成常態更新的資料**，`scripts/add-article.js` 會自動 append 新文章進去。
- 圖片都在 `public/images/uploads/<類型>/`，檔名沿用舊後端上傳時的原始檔名（含中文檔名，這在 GitHub Pages 上運作正常，跟專案原本 `public/images/` 的既有慣例一致）。

`projects/lib/src/lib/service/content.service.ts` 是唯一讀取這些 JSON 的地方，並在前端重建原本後端的業務邏輯（文章上下架/到期日過濾、排序、9 篇上限、菜單分組、職缺分組）。詳見 [frontend-structure.md](frontend-structure.md)。

## 部署

`scripts/publish.js` 一次做完整套發佈流程：
1. commit 目前的原始碼變更並 push 到 GitHub 的 `main` 分支
2. `ng build --configuration production`
3. 把 build 產物補上 GitHub Pages 需要的檔案：`index.html`/`404.html`（複製自 `index.csr.html`，做 SPA fallback）、`.nojekyll`、`CNAME`（內容固定是 `thegalaxyhouse.com`，每次發佈都會重寫，這樣自訂網域設定就不會在下次部署時被洗掉）
4. 用 `git worktree` 抓現有的 `gh-pages` 分支，把新的靜態檔案覆蓋進去、commit、push（沿用專案原本 README 記載的手動流程，只是自動化）

完整操作方式見 [content-editing.md](content-editing.md)。

## SEO 相關（見 docs 內對應章節，這裡只列重點）

- 每個路由都有自己的 canonical URL（`MakeMetaService` 在 render 時動態寫入 `<link rel="canonical">`），修正了原本全站 canonical 寫死指向首頁的問題。
- `public/sitemap.xml` 由 `scripts/generate-sitemap.js` 產生，涵蓋所有靜態路由、分店頁、消息分類頁，以及所有上架中的文章頁；`npm run article:add` 會自動重新產生。
- `robots.txt` 指向 sitemap，允許全站爬取。
