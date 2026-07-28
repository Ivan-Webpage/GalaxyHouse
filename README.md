# 新增活動／文章（最常用）

```bash
npm run article:add
```

依提示輸入標題、消息分類、所屬分店、簡短介紹、活動/截止日期、內文、封面圖片路徑，工具會自動把資料寫進 `public/data/articles.json`、複製圖片、更新 `sitemap.xml`，最後問你要不要立即發佈。

# 發佈到網站上

```bash
npm run publish
```

會依序：commit + push 原始碼到 `main` 分支 → build → 把靜態網站 push 到 `gh-pages` 分支（含自訂網域 `thegalaxyhouse.com` 的 CNAME）。幾分鐘內 [thegalaxyhouse.com](https://thegalaxyhouse.com) 就會更新。

> 完整操作說明（含每個問題該怎麼填、什麼時候該重新發佈）見 [docs/content-editing.md](docs/content-editing.md)。

# 開發

## 創建 lib 內的 service
```
ng g s 物件名稱 --project=lib
```

## 本機開發伺服器
```
ng serve
```

## 手動建置（一般不需要，`npm run publish` 已包含這步）
```
ng build --configuration production
```

# 專案架構

這是一個**純前端靜態網站**（Angular 19），沒有後端、沒有資料庫。所有內容（分店資訊、文章/活動、職缺）都存在 `public/data/*.json`，build 時一併打包並用 Angular 的 build-time prerender 產生真正的靜態 HTML。完整架構說明見 [CLAUDE.md](CLAUDE.md) 與 [docs/](docs/) 資料夾。

## 主要頁面
1. home: 首頁
2. apply: 企業徵才
3. about-us: 關於我們
4. branch-shop: 分店資訊，資料來自 `public/data/branch-shops.json`
5. article: 文章頁面，資料來自 `public/data/articles.json`
6. news: 最新消息

## Lib組件（`projects/lib`）
### component
1. collapsible
2. floating-block: 圖片上方浮動方塊，跟著滑鼠飄移
3. footer
4. navbar
5. slideshow
6. triangle-slideshow: hero跑馬燈

### interface
1. article: 文章物件
2. images: 圖片物件
3. content: 靜態資料型別（分店、職缺等）

### service
1. content: 讀取 `public/data/*.json`，並在前端重建原本的篩選/排序邏輯（取代舊版的後端 API 呼叫）
2. destroy
3. make-meta: 頁面 SEO meta（title、OG、canonical）

### directive
1. animation-into: 網頁動畫
2. image-filter
3. slip-hover: 滑動方塊，配合floating-block
4. sticky: 讓navbar黏在頂端

# 給進階使用者：`npm run publish` 底層在做什麼

如果 `npm run publish` 因故無法使用，或想手動介入，以下是它實際執行的步驟（PowerShell 等效版本）：

```powershell
# 1) Build
npx ng build --configuration production

# 2) GitHub Pages SPA fallback + 關閉 Jekyll + 自訂網域
$outDir = "dist/galaxyhouse-web/browser"
Copy-Item -Force "$outDir/index.csr.html" "$outDir/index.html"
Copy-Item -Force "$outDir/index.csr.html" "$outDir/404.html"
New-Item -ItemType File -Force -Path "$outDir/.nojekyll" | Out-Null
Set-Content -Path "$outDir/CNAME" -Value "thegalaxyhouse.com"

# 3) 用 worktree 更新 gh-pages
git fetch origin gh-pages
if (Test-Path .gh-pages-worktree) { git worktree remove .gh-pages-worktree --force }
git worktree add .gh-pages-worktree gh-pages

# 清空舊檔（保留 .git）
Get-ChildItem .gh-pages-worktree -Force | Where-Object { $_.Name -ne '.git' } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# 複製新檔
robocopy $outDir .gh-pages-worktree /E
$rc = $LASTEXITCODE
if ($rc -ge 8) { throw "robocopy failed with exit code $rc" }

Push-Location .gh-pages-worktree
git add -A
if (git diff --cached --quiet) { Write-Host "No changes to deploy" } else { git commit -m "Deploy" }
git push origin gh-pages
Pop-Location

# 4) 清理 worktree
git worktree remove .gh-pages-worktree --force
```

備註：如果是用 HTTPS remote，GitHub 目前通常需要用 Personal Access Token (PAT) 當密碼，並可能要求 2FA/OTP；改用 SSH remote 則需要先在本機設定好 GitHub SSH key。實際的 `scripts/publish.js` 用 Node 的 `fs`/`child_process` 做同樣的事，另外還會先把原始碼 commit + push 到 `main` 分支。
