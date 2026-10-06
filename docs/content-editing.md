# 新增活動/文章與發佈網站

網站的內容維運不需要後端或後台，全部透過 npm 指令完成，或是透過財務系統自動觸發。

## 方法一：互動式新增（`npm run article:add`）

```bash
npm run article:add
```

第一步會先選文章類型：

```
請選擇文章類型：
  1. 漫霧與音樂之約（最新活動）
  2. 包場公告（公告）
  3. 其他（完整手動輸入）
```

### 1. 漫霧與音樂之約

內容固定、每次幾乎不變的常態活動。只會問：**所屬分店**、**活動日期**（`YYYY-MM-DD`）。標題（`X/X漫霧與音樂之約`）、SEO 簡短介紹、完整內文（含日期/時間/費用/報名方式）、封面圖片全部自動產生，最後給你看一次自動產生的內容，確認一次就送出。封面固定沿用 `漫霧與音樂之約_5.jpg`，不會每次複製新檔。

### 2. 包場公告

只會問：**所屬分店**、**包場日期**（`YYYY-MM-DD`，用來產生標題跟截止日）、**內文**（每次包場的實際日期/時段不同，需要手動打，支援多行——見下方注意事項）。標題固定格式**「X年X月包場公告」**（例如 `2026年8月包場公告`）、SEO 簡短介紹自動由標題產生，都不用再手動輸入。封面固定沿用 `過年店休公告1.jpg`。

### 3. 其他（完整手動輸入）

不屬於上面兩種常態內容時使用，會依序問：標題、消息分類、所屬分店、簡短介紹、活動/截止日期、內文、封面圖片路徑（工具會自動複製到 `public/images/uploads/articles/`）。

- **內文支援多行**：直接貼文字或 HTML，貼完之後**另起一行輸入 `END` 再按 Enter，才會結束輸入**——這一步不能省略，否則只會存到第一次按 Enter 前的內容，後面貼的東西會消失。也可以第一行輸入 `@檔案路徑` 改讀取檔案內容（不用再輸入 `END`）。
- **活動/截止日期**：有時效性的內容過了這天會自動從「最新消息」與首頁列表消失（直接連結還是打得開）；長期公告可以留空。

完成後，工具會把文章加進 `public/data/articles.json`、自動重新產生 `public/sitemap.xml`，然後問要不要立即發佈（`npm run publish`）。

## 方法二：財務系統自動觸發（全自動，不需要手動操作）

公司內部財務系統新增「漫霧與音樂之約」或「包場公告」活動時，會自動呼叫 GitHub 觸發 `.github/workflows/add-article.yml` 這個 workflow：非互動地執行 `scripts/add-article-from-template.js`，用跟上面兩個套版完全一樣的規則產生文章（標題/簡短介紹自動產生的規則一致），寫入資料後自動 build 並發佈到 GitHub Pages——全程不需要人工介入。可以到 `https://github.com/Ivan-Webpage/GalaxyHouse/actions` 看執行紀錄，確認有沒有成功。

## 方法三：分店訂位月曆同步（財務系統自動觸發）

分店頁 `/branchShop/:id` 的「訂位資訊」月曆讀取 `public/data/reservations.json`。資料來源是財務系統（gh_finance）既有的「活動管理」資料（`mkt.activity_records`）。

**使用者已拍板：不另外建立訂位資料表。** 原因是活動管理的資料已經足以呈現，再多一張表還得維持兩邊一致，反而更麻煩。

同步流程：

1. 財務系統在活動新增、編輯、刪除或取消時，送出 `repository_dispatch`（`event_type: sync-reservation`）。
2. 收到 dispatch 後，[.github/workflows/sync-reservation.yml](../.github/workflows/sync-reservation.yml) 執行 [scripts/manage-reservation.js](../scripts/manage-reservation.js)，以 `sourceEventId` 為鍵對 JSON 做 upsert 或 delete，接著跑 `publish.js` 部署。
3. 這支 workflow 和 `add-article.yml` 共用同一個 concurrency group，兩邊會排隊執行，避免同時 push 造成衝突。

`reservations.json` 格式：

```json
{
  "Songshan": [
    { "date": "2026-09-30", "startTime": "20:00", "endTime": "23:00",
      "label": "9/30漫霧與音樂之約", "sourceEventId": "176" }
  ],
  "Tianmu": []
}
```

- **只放公開資訊**：只放日期、時段和顯示文字，不放客戶姓名、金額、備註。
- **`label`**：月曆上顯示的文字。值是「公休」時會顯示成灰色公休樣式，例如 `sourceEventId` 為 `closure-…` 的店休日。
- **每週一公休**：這是前端元件的預設值，不需要寫進 JSON。
- **不要手動清空或覆蓋**：這份檔案由機器人維護。以前曾經在本機清除測試資料時，rebase 撞到機器人剛同步進來的真實資料（id=176），最後是保留真實資料、只刪除測試資料。

## LINE@ 連結格式

- **一律使用 `https://line.me/ti/p/@392kgxba`**，這是加好友或開啟對話的連結，桌機和手機都能用。松山店官方帳號是 `@392kgxba`；分店頁從 `branch-shops.json` 的 `lineID` 組出連結。
- **不要用 `https://line.me/R/oaMessage/@…/?預填文字`**：這種可以預填訊息的連結只有在已安裝 LINE App 的手機上有效，桌機瀏覽器會被導回 LINE 首頁。使用者實測後決定改回 `/ti/p/`，接受客人需要自己輸入訊息。
- **這和 LINE Login 無關**：LINE Login 是登入用的 OAuth 機制，不能拿來解決上面的問題。

## 發佈網站（`npm run publish`）

```bash
npm run publish
```

這個指令會依序：

1. 把目前的所有變更 commit 並 push 到 GitHub 的 **`main`** 分支（原始碼）
2. 執行 `ng build --configuration production`（含每篇文章的靜態頁面）
3. 幫 build 出來的網站補上 GitHub Pages 需要的檔案，包含把自訂網域 **`thegalaxyhouse.com`** 寫進 `CNAME`（所以每次發佈都會自動維持網域設定，不需要手動去 GitHub 上重新設定）
4. 把建置好的靜態網站 push 到 **`gh-pages`** 分支（正式對外的網站內容）

發佈後幾分鐘內，[thegalaxyhouse.com](https://thegalaxyhouse.com) 就會更新成最新內容。

## 什麼時候要重新發佈

- 新增或修改文章、活動之後。透過財務系統觸發的文章與訂位月曆同步不用管，workflow 會自動發佈。
- 修改分店資訊、菜單、職缺（目前這些要直接編輯 `public/data/branch-shops.json` / `apply.json`，沒有互動式工具，改完存檔即可）
- 修改任何頁面的程式碼或文案之後

只要有改到 `public/` 或 `src/` 底下的任何內容，跑一次 `npm run publish` 就會把新版本部署上去。

### 新增菜單分類（例如酒水）的做法

`public/data/branch-shops.json` 裡每張菜單卡片是一個 `menuType` 分組（品名/價格/圖片）。沒有互動式工具，直接手動編輯 JSON，流程可參考酒水菜單那次的做法：

- 卡片圖片盡量沿用該分類原本就有、已存在 `public/images/uploads/` 底下的照片，不確定圖片來源時先跟使用者確認，不要隨意新增檔案。
- 品項來源如果是 LINE 選單的 flex message JSON（例如 `github.com/Ivan-Webpage/share_card` 這個 repo 底下 `json/GalaxyHouse-<類別>-酒類飲品.json`，是使用者用於 LINE 官方帳號選單的資料），**格式跟網站卡片格式不是一對一對得起來**（分組方式、每行呈現方式不同），動手改資料前務必跟使用者確認呈現方式（例如威士忌原始選單品項太多，後來拆成「單一麥芽／煙燻泥煤／調和」三張卡片）。
- 改完先用 `ng serve` 本機開發伺服器實際看過該分店頁面（`/branchShop/:id`），確認新卡片的圖片有載入（沒有 404）、六邊形折角角度跟其他卡片一致（見上方[前端結構文件](frontend-structure.md)的「分店菜單卡片」章節），再發佈。

## 注意事項

- **`push` 被拒絕（`rejected … fetch first`）**：這代表機器人在遠端新增了 commit，不是你的修改遺失了。若上一次 publish 已經 commit 成功、只是 push 失敗，再跑一次時會顯示「沒有新變更，略過 commit」，這是正常的。處理方式是先跑 `git pull --rebase --autostash`，再重新 `npm run publish`。**不要**用 `git push -f`。
- `npm run publish` 會直接 push 到 GitHub 的 `main` 與 `gh-pages` 分支，這兩個分支都是「正式」分支，push 之後會立即反映在對外網站上——執行前確認自己真的要發佈。
- 第一次執行 `npm run article:add` 或 `npm run publish` 前，這台電腦要先能用 git 存取 `https://github.com/Ivan-Webpage/GalaxyHouse.git`（例如已經登入過 GitHub CLI 或設定好認證），否則 push 那一步會失敗。
- `scripts/publish.js` 寫死 push 到本地分支 `main`（[scripts/publish.js:52](../scripts/publish.js)）。如果在新環境（例如換電腦、重新 clone）跑 `npm run publish` 時卡在 push 這步，先確認本地分支叫 `main` 而不是 `master`（`git branch` 檢查；不對的話 `git branch -m master main`）——GitHub 遠端上的預設分支是 `main`，沒有 `master`。同樣道理，第一次在新環境跑之前也要記得先 `npm install`（`node_modules` 不會進 git，沒裝過的話 `ng build` 會直接失敗）。
- **`public/images/uploads/` 底下不要放帶有隱藏 `.git` 的資料夾**（例如直接複製一個曾經 `git init`/clone 過的資料夾進來）。之前 `Line@` 資料夾就因為裡面藏了一個 `.git`，被 git 當成「內嵌 git repository」（gitlink）而不是一般檔案，導致裡面十幾張照片實際內容從沒真的進到 git 歷史、部署到 `gh-pages` 後圖片是打不開的（已修正，見 commit `8276651`）。加新圖片資料夾前，可以簡單檢查一下裡面有沒有 `.git`（`ls -la` 或 Windows 顯示隱藏檔案），有的話先刪掉再放進 `uploads/`。
- 財務系統觸發的自動化需要：這個 repo 的預設分支是 `main`（GitHub 只會讀取預設分支上的 workflow 檔案來決定要不要監聽 `repository_dispatch`）、財務後端服務有設定 `GALAXYHOUSE_SYNC_ENABLED=true` 與 `GALAXYHOUSE_DISPATCH_TOKEN`（GitHub classic PAT，`repo` 權限），且改動環境變數後記得重新部署/重啟服務讓它生效。
