# 開發
## 創建
## 執行測試
```
ng g s 物件名稱 --project=lib

```

## 執行測試
```
ng serve
```

# push到Github上
1.先CD 到前端路徑
2.接著輸入以下指令（PowerShell）。目標是把 `dist/galaxyhouse-web/browser` 部署到 `gh-pages` 分支。

## 方法 A（建議）：不用 `ngh`，用 `git worktree` 部署
```powershell
# (可選) 設定遠端
git remote set-url origin https://github.com/Ivan-Webpage/GalaxyHouse.git
# 或使用 SSH：git remote set-url origin git@github.com:Ivan-Webpage/GalaxyHouse.git

# 1) Build
npx ng build --configuration production

# 2) GitHub Pages SPA fallback + 關閉 Jekyll
$outDir = "dist/galaxyhouse-web/browser"
Copy-Item -Force "$outDir/index.html" "$outDir/404.html"
New-Item -ItemType File -Force -Path "$outDir/.nojekyll" | Out-Null

# 3) 用 worktree 更新 gh-pages
git fetch origin gh-pages
if (Test-Path .gh-pages-worktree) { git worktree remove .gh-pages-worktree --force }
git worktree add .gh-pages-worktree gh-pages

# 清空舊檔（保留 .git）
Get-ChildItem .gh-pages-worktree -Force | Where-Object { $_.Name -ne '.git' } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# 複製新檔（不要用 /MIR，避免誤刪 .git 指向檔）
robocopy $outDir .gh-pages-worktree /E
$rc = $LASTEXITCODE
if ($rc -ge 8) { throw "robocopy failed with exit code $rc" }

Push-Location .gh-pages-worktree
git add -A
if (git diff --cached --quiet) { Write-Host "No changes to deploy" } else { git commit -m "Deploy" }
git push origin gh-pages
Pop-Location

# 4) 清理 worktree（可選）
git worktree remove .gh-pages-worktree --force
```

## 方法 B：使用 `ngh`（若你的環境可正常授權）
```powershell
npx ng build --configuration production
Copy-Item -Force "dist/galaxyhouse-web/browser/index.html" "dist/galaxyhouse-web/browser/404.html"
npx ngh --dir=dist/galaxyhouse-web/browser --no-silent
```

備註：如果你是用 HTTPS remote，GitHub 目前通常需要使用 Personal Access Token (PAT) 當作密碼，並可能要求 2FA/OTP；改用 SSH remote 則需要先在本機設定好 GitHub SSH key。

如果你有自訂網域（GitHub Pages Custom Domain），記得在 `gh-pages` 根目錄保留/重建 `CNAME`；另外也要保留 `.nojekyll`、`404.html`。

# 專案結構
## 主要頁面
1. home: 首頁
2. apply: 企業徵才
3. about-us: 關於我們
4. branch-shop: 分店資訊，分店資料由後端傳送
5. article: 文章頁面
6. news: 最新消息

## Lib組件
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

### service
1. api: 連結API使用
2. destroy
3. make-meta: 頁面meta資料

### directive
1. animation-into: 網頁動畫
2. image-filter
3. slip-hover: 滑動方塊，配合floating-block
4. sticky: 讓navbar黏在頂端