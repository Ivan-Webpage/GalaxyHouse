# 重構記錄：移除後端，改為純靜態前端（已完成）

> 這份文件原本是重構前的計畫，現在改成記錄實際做了什麼、怎麼做的，以及做決策時的取捨依據，供之後回顧或有類似遷移需求時參考。

## 結果總覽

- 後端（`backEnd20251210/` Django + DRF）已完全移除依賴：前端不再呼叫任何 API，資料全部改為靜態 JSON（`public/data/*.json`），build 時直接打包進網站。
- 原本活在 Django view 裡的業務邏輯（文章上下架/到期日過濾、排序、9 篇上限、菜單依 menuType 分組、職缺依分店分組）搬到前端 [ContentService](../projects/lib/src/lib/service/content.service.ts)。
- 部署方式維持 GitHub Pages，但補上了正確的 build-time prerender（見 [architecture.md](architecture.md)），大幅改善 SEO（詳見下方「SEO 修正」）。
- 新增了 `scripts/add-article.js` + `scripts/publish.js`，讓日常「新增活動並發佈」變成一個指令，見 [content-editing.md](content-editing.md)。

## 資料遷移怎麼做的

直接連線 `backEnd20251210/data/db.sqlite3`（比 `backup.json` 新），依原本 DRF serializer/view 的邏輯用 Python 腳本重建每個 JSON：

- `public/data/branch-shops.json` — 對照原本 `branchShopViewSet.pick_classify`：依 englishName 分組，menu 依 menuType 分組，gallery 只留 `state>0`。
- `public/data/articles.json` — 保留所有文章（含 `state=0` 的），欄位比原本 API 回傳的更完整（多存了 `newTypeEnglishName`、`branchShopEnglishName` 等內部欄位），讓前端 `ContentService` 能自己做原本後端才做得到的篩選。
- `public/data/apply.json` — 對照 `applyViewSet.shopClassification`，職缺的 `welfare_title`/`how2Pay_title` 從對應的多對多關聯表 join 出來。
- `public/data/news-types.json` — 文章分類定義。
- 圖片：從 `backEnd20251210/media/` 底下依類型複製到 `public/images/uploads/{branch-gallery,branch-cover,news-types,articles,menu-types}/`，檔名保留原始檔名（含中文，跟專案原本 `public/images/` 的慣例一致，實測 GitHub Pages 與各種靜態伺服器都能正確處理 URL-encode 後的中文檔名）。

遷移時發現文章內文（`content` 欄位）裡的圖片都是外部 Medium CDN 連結，沒有任何指到 Django `/media/` 的內嵌圖片，所以不需要額外處理文章內文裡的圖片。

## 關鍵技術決策與取捨

1. **到期日／上下架邏輯放在前端，且用「使用者當下的本機時間」判斷**，不是在 build 當下寫死。原因：這個網站每次新增活動都會重新 build+部署（見 [content-editing.md](content-editing.md)），所以「上次 build 的時間」跟「現在」通常很接近，用本機時間判斷的誤差可以接受；比起只在 build 當下算好結果直接烘進 JSON，這樣做的好處是即使中途沒有立即重新部署，文章到期後還是會如期在瀏覽器端自動被過濾掉。
2. **內容維運選擇「CLI 工具直接編輯 JSON」，不是接第三方 headless CMS**：因為主要更新頻率是「每月至少 2 場活動」，用一個互動式 Node 腳本（`npm run article:add`）就能滿足，不需要額外的第三方服務、帳號與費用。
3. **啟用（而非移除）Angular 的 SSR/prerender**：原本以為 SSR 設定是沒在用的殘留（因為正式站是純靜態部署），實際深入研究後發現它其實是拿來做 build-time prerender（產生真正的靜態 HTML，不是跑常駐 Node server），對 SEO 有直接幫助，而且大部分路由本來就已經設定成 `RenderMode.Prerender`。重構過程中額外把 `article/:id`（原本是 `RenderMode.Client`，完全沒有 prerender、也沒有專屬 meta）也改成從 `public/data/articles.json` 動態產生 prerender 清單，讓所有文章/活動頁都有真正的靜態 HTML 與正確的 SEO meta——這對這個網站特別重要，因為文章/活動頁正是每月更新、最需要被搜尋引擎與社群分享正確索引的內容。
4. **後端資料夾保留在硬碟上，但整個 `.gitignore` 掉**：不強制刪除 `backEnd20251210/`（它是獨立的巢狀 git repo，有自己的歷史），讓專案擁有者之後自行決定要不要清掉；只確保新的前端 repo 不會追蹤或部署它。

## 過程中發現並一併修正的 SEO 問題

這些不是這次重構「新增」的，而是在確認 prerender/meta 邏輯時發現的既有 bug，一併修正：

- 全站 `<link rel="canonical">` 原本寫死指向首頁，導致每個子頁面實質上都在告訴搜尋引擎「這頁的正式版本是首頁」——已改成每個路由動態產生自己的 canonical URL。
- `index.html` 裡的 Open Graph 標籤原本用 `<meta name="og:...">`，OG 規範要求 `property="og:..."` 才有效，爬蟲會忽略 `name=` 版本——已修正，並補上正確的 Twitter Card 標籤。
- `<html lang="en">` 但內容全是繁體中文——改成 `lang="zh-Hant"`。
- `public/robots.txt` 結尾有殘留的亂碼字元；`public/sitemap.xml` 有重複的 http/https 版本、幾個路徑寫錯（`/branchShop/apply`、`/branchShop/about_us`、`/news/catering`、`/news/banquet`）、缺少所有文章頁、`lastmod` 全部是同一個舊日期——`sitemap.xml` 改成用 `scripts/generate-sitemap.js` 自動產生，不再手動維護。
- 個別文章頁原本完全沒有呼叫 `MakeMetaService.set()`，等於每篇活動頁面對外分享時顯示的都是通用的首頁標題/描述——已在 `ArticleComponent` 補上，每篇文章都有自己的 title/description/OG image。

## 已知但刻意不處理的小問題

- `branchShop/:id` 頁面的 Google Map iframe 在 prerender 階段會因為 `DomSanitizer.bypassSecurityTrustResourceUrl` 只在瀏覽器端執行而觸發一個 Angular `NG0904`（unsafe resource URL）警告，build 仍會成功、不影響網站運作，使用者在瀏覽器打開後地圖會正常顯示。這是重構前就存在的寫法（`isBrowser` 判斷式），不影響 SEO（iframe 內容本來就不會被索引），暫不處理。
