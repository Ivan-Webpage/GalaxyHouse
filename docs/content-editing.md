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

- 新增/修改文章、活動之後（透過財務系統觸發的不用管，workflow 會自動發佈）
- 修改分店資訊、菜單、職缺（目前這些要直接編輯 `public/data/branch-shops.json` / `apply.json`，沒有互動式工具，改完存檔即可）
- 修改任何頁面的程式碼或文案之後

只要有改到 `public/` 或 `src/` 底下的任何內容，跑一次 `npm run publish` 就會把新版本部署上去。

## 注意事項

- `npm run publish` 會直接 push 到 GitHub 的 `main` 與 `gh-pages` 分支，這兩個分支都是「正式」分支，push 之後會立即反映在對外網站上——執行前確認自己真的要發佈。
- 第一次執行 `npm run article:add` 或 `npm run publish` 前，這台電腦要先能用 git 存取 `https://github.com/Ivan-Webpage/GalaxyHouse.git`（例如已經登入過 GitHub CLI 或設定好認證），否則 push 那一步會失敗。
- 財務系統觸發的自動化需要：這個 repo 的預設分支是 `main`（GitHub 只會讀取預設分支上的 workflow 檔案來決定要不要監聽 `repository_dispatch`）、財務後端服務有設定 `GALAXYHOUSE_SYNC_ENABLED=true` 與 `GALAXYHOUSE_DISPATCH_TOKEN`（GitHub classic PAT，`repo` 權限），且改動環境變數後記得重新部署/重啟服務讓它生效。
