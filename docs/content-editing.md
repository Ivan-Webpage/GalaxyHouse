# 新增活動/文章與發佈網站

網站的內容維運不需要後端或後台，全部透過兩個 npm 指令完成。

## 新增一篇文章／活動

```bash
npm run article:add
```

會依序詢問：

1. **標題**
2. **消息分類**（公告 / 最新活動 / 活動花絮，對應網站上的「最新消息」分類）
3. **所屬分店**（可選「不指定特定分店」，代表全館活動）
4. **簡短介紹**：會顯示在文章列表卡片，也會是社群分享（Facebook/LINE/Twitter）預覽時顯示的描述文字，建議控制在 100 字內
5. **活動/截止日期**（`YYYY-MM-DD`）：
   - 有時效性的活動（如某場品酒會），填活動當天日期——過了這天，文章會自動從「最新消息」的篩選結果與首頁最新消息列表中消失（但直接連結還是打得開）
   - 長期公告（如營業時間異動）可以留空，不會自動下架
6. **內文**：可以直接貼文字或 HTML（例如 `<p>...</p>`、`<h2>...</h2>`），也可以先把內文寫在一個文字檔裡，然後輸入 `@檔案路徑` 讓工具直接讀檔案內容進來（內文比較長、需要排版時建議用這個方式）
7. **封面圖片**：輸入圖片在你電腦上的完整路徑，工具會自動複製到 `public/images/uploads/articles/` 並更新網站資料

完成後，工具會：
- 把新文章加進 `public/data/articles.json`
- 自動重新產生 `public/sitemap.xml`（讓新文章能被搜尋引擎收錄）
- 詢問「是否要立即建置並發佈到 GitHub Pages？」——選 `y` 會直接接著執行下面的發佈流程；選 `n` 則只是把變更存在本機，之後可以再手動執行 `npm run publish`

## 發佈網站

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

- 新增/修改文章、活動之後
- 修改分店資訊、菜單、職缺（目前這些要直接編輯 `public/data/branch-shops.json` / `apply.json`，沒有互動式工具，改完存檔即可）
- 修改任何頁面的程式碼或文案之後

只要有改到 `public/` 或 `src/` 底下的任何內容，跑一次 `npm run publish` 就會把新版本部署上去。

## 注意事項

- `npm run publish` 會直接 push 到 GitHub 的 `main` 與 `gh-pages` 分支，這兩個分支都是「正式」分支，push 之後會立即反映在對外網站上——執行前確認自己真的要發佈。
- 第一次執行 `npm run article:add` 或 `npm run publish` 前，這台電腦要先能用 git 存取 `https://github.com/Ivan-Webpage/GalaxyHouse.git`（例如已經登入過 GitHub CLI 或設定好認證），否則 push 那一步會失敗。
