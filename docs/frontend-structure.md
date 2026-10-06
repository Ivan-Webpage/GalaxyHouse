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
| `/anniversary` | `AnniversaryComponent` | 純靜態（週年慶活動著陸頁，見下方章節） |

路由定義：[src/app/app.routes.ts](../src/app/app.routes.ts)。哪些路由會被 build-time prerender 見 [src/app/app.routes.server.ts](../src/app/app.routes.server.ts) 與 [architecture.md](architecture.md)。

`BuffetComponent` 與 `CateringComponent` 完全是靜態內容，沒有資料依賴。

### 分店菜單卡片（六邊形版型）

`BranchShopComponent`（[src/app/branch-shop/branch-shop.component.html](../src/app/branch-shop/branch-shop.component.html)）的每張菜單卡片圖片區塊用 `class="img-box"`，靠 [branch-shop.component.scss](../src/app/branch-shop/branch-shop.component.scss) 的 `.img-box { overflow: hidden; height: ... }` 把圖片裁成固定高度，卡片本身的六邊形折角是用 `clip-path: polygon(0% 5%, 50% 0%, 100% 5%, 100% 95%, 50% 100%, 0% 95%)`（[branch-shop.component.scss:144](../src/app/branch-shop/branch-shop.component.scss)）——折角角度是「卡片總高度的 5%」，所以**卡片高度必須固定、一致**，折角看起來才會整齊。之前發生過 `img-box` 的 `class` 屬性被誤打成 `clase`，導致這個固定高度沒套用、圖片區塊改用原圖比例撐開，酒單卡片（威士忌 26 行、直式酒瓶照）跟食物卡片比例差異大時，六邊形折角就會參差不齊（已修正，見 commit `e7fde0a`）。之後新增/調整菜單分類卡片時，若發現折角角度跑掉，先檢查是不是圖片區塊的固定高度沒有被套用。

### 酒類菜單「杯 / 瓶」合併顯示

`BranchMenu` 有兩個選填欄位（[interface/content.ts](../projects/lib/src/lib/interface/content.ts)）：

- `unitLabel`：卡片標題下方顯示的單位列，例如 `杯 / 瓶`、`杯 / 箱`。
- `subMenu[].priceAlt`：第二個價格。有設定時品項顯示成 `$ 350 / $ 3200`，沒設定就照舊只顯示 `price`。

目前松山店的「啤酒」「威士忌（單一麥芽）」「威士忌（煙燻泥煤）」用這個格式，品名不再帶「（杯）」「（瓶）」後綴。「威士忌（調和）」使用者當時沒要求，維持原本一行一價。之後要新增其他酒類卡片時，優先用這兩個欄位，不要把杯和瓶拆成兩行。

### 分店頁「訂位資訊」月曆

`/branchShop/:id` 在菜單下方有「訂位資訊」區塊（[branch-shop.component.html](../src/app/branch-shop/branch-shop.component.html)），內容依序是：

- **「我要訂位」按鈕**：連到該分店的 `https://line.me/ti/p/<lineID>`（加好友／開啟對話）。
- **月曆**：用 lib 的 `ReservationCalendarComponent`，依 `branch-shop.component.ts` 的寫法延遲載入（lazy load），沿用 `NewsComponent` 載入月曆的方式。

月曆元件（[reservation-calendar.component.ts](../projects/lib/src/lib/component/reservation-calendar/reservation-calendar.component.ts)）用專案既有的 FullCalendar：

- **資料來源**：`ContentService.getReservations(分店英文名)`，讀 `public/data/reservations.json`。格式與同步方式見 [content-editing.md](content-editing.md) 的「方法三」。
- **每週固定公休**：`@Input() closedWeekdays`，預設是 `[1]`（每週一顯示灰色「公休」）。兩間分店目前都是週一公休；若之後某分店公休日不同，個別傳入覆蓋。
- **臨時公休**：資料裡 `label` 剛好是「公休」的那筆，會套用跟每週公休一樣的灰色樣式，例如連假或店休。
- **一般時段**：顯示成 `HH:mm~HH:mm <label>`，沒有 `label` 時顯示「已預訂」。
- **看完整文字**：格子太窄會截字，所以滑鼠移過去時用原生 `title` 顯示完整文字；點擊時另外跳出自訂懸浮框，點其他地方關閉，這是給手機用的。

### 週年慶活動頁 `/anniversary`

這是 2026 週年慶 DM 導流用的一頁式著陸頁，由使用者提供的 HTML 範本改寫成品牌配色（[src/app/anniversary/](../src/app/anniversary/)），圖片放在 `public/images/uploads/anniversary/`（金粉裝飾素材在 `deco/` 子資料夾）。使用者確認過的設計決定如下：

- **全中文**：除了品牌名 Galaxy House、VIP，以及 LINE、PDF、DM 這類專有名詞以外，不要出現英文。
- **報名不用表單**：原本做了 Formspree 表單，但 Formspree 沒有申請，送出一定會失敗。網站是純靜態，沒有後端可以寄信；把 Gmail 憑證放進前端也不安全。因此改成「報名時請提供的資訊」清單，加上導向 LINE@ 的按鈕。若之後要恢復線上表單，需要先申請 Formspree 或 EmailJS 這類可以放在前端的服務。
- **頁面按鈕**：「立即響應出席」用 `scrollIntoView()` 捲到報名區，因為原本的 `#rsvp` 錨點不會動。「LINE@詢問」連到 `https://line.me/ti/p/@392kgxba`。
- **匯款資訊**：放在頁面最底部。繳費期限、帳號等文字可能已經被使用者手動改過，以檔案內容為準，不要用舊對話的內容蓋回去。
- **金粉光點**：使用者明確要求以下幾點：
  - 只設寬度，高度用 `auto`，不可以改變素材的長寬比例。
  - 不可以隨意裁切，否則頁面上會看到明顯的切割線。素材要貼齊有金粉的那個角落，例如右上那張貼頁面右上角；右下角是把右上那張垂直翻轉後重複使用。
  - 不可以蓋到文字。原本放在匯款文字下方的金粉已經拿掉。
  - 動畫只做緩慢的明暗閃爍。系統設定為減少動態時不閃，列印時隱藏。
- **整體色調**：比全站其他頁面更暖，使用暖褐底色加淡金色邊框。
- **AI 生成圖片**：北投場地圖是使用者用 Gemini 修復畫質的版本，三人樂團照（貝拉、王奕凡、JAYWU）是合成圖。之後若要替換這兩張圖，記得它們不是原始照片。
- **導覽列入口**：導覽列「週年慶」目前在 [app.component.ts](../src/app/app.component.ts) 裡被註解掉，頁面還在，路由與 sitemap 也都還在（[scripts/site-routes.js](../scripts/site-routes.js)）。活動結束後要不要移除整頁，由使用者決定。
- **樣式大小上限**：這個頁面的 SCSS 很大，所以 [angular.json](../angular.json) 的 `anyComponentStyle` 錯誤上限已從 8kB 調到 20kB。這是全專案共用的設定。

## `projects/lib` — 共用套件（import 時寫 `from 'lib'`）

```
projects/lib/src/lib/
├── component/       # UI 元件：collapsible, floating-block, footer, navbar, slideshow,
│                    #          triangle-slideshow, calendar, reservation-calendar, card, loading
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
  - `getReservations(englishName)` — 讀 `reservations.json` 裡該分店的時段陣列，沒有資料時回傳空陣列
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
