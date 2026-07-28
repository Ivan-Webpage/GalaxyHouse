// 建置＋發佈工具：
//   1. 把目前的原始碼 commit 並 push 到 GitHub 的 main 分支
//   2. ng build 產生靜態網站
//   3. 補上 GitHub Pages 需要的 index.html / 404.html / .nojekyll / CNAME（自訂網域）
//   4. 把 build 出來的靜態檔案 push 到 gh-pages 分支（沿用既有內容，不會整個覆蓋歷史）
//
// 用法：node scripts/publish.js ["commit 訊息"]
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REMOTE_URL = 'https://github.com/Ivan-Webpage/GalaxyHouse.git';
const DOMAIN = 'thegalaxyhouse.com';
const DIST_BROWSER = path.join(ROOT, 'dist', 'galaxyhouse-web', 'browser');
const WORKTREE_DIR = path.join(ROOT, '.gh-pages-worktree');

function run(cmd, opts = {}) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });
}

function runCapture(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', ...opts }).trim();
}

function ensureGitRepo() {
  if (!fs.existsSync(path.join(ROOT, '.git'))) {
    run('git init');
    run('git checkout -B main');
  }
  const remotes = runCapture('git remote').split('\n').filter(Boolean);
  if (!remotes.includes('origin')) {
    run(`git remote add origin ${REMOTE_URL}`);
  }
}

function commitMainIfNeeded(message) {
  run('git add -A');
  const status = runCapture('git status --porcelain');
  if (status) {
    run(`git commit -m ${JSON.stringify(message)}`);
    return true;
  }
  console.log('main 分支沒有新變更，略過 commit。');
  return false;
}

function pushMain() {
  run('git push -u origin main');
}

function buildSite() {
  run('npx ng build --configuration production');
}

function preparePagesOutput() {
  const csr = path.join(DIST_BROWSER, 'index.csr.html');
  if (!fs.existsSync(csr)) {
    throw new Error(`找不到 ${csr}，build 可能失敗了`);
  }
  fs.copyFileSync(csr, path.join(DIST_BROWSER, 'index.html'));
  fs.copyFileSync(csr, path.join(DIST_BROWSER, '404.html'));
  fs.writeFileSync(path.join(DIST_BROWSER, '.nojekyll'), '');
  fs.writeFileSync(path.join(DIST_BROWSER, 'CNAME'), DOMAIN + '\n');
  console.log(`已寫入自訂網域 CNAME：${DOMAIN}`);
}

function deployGhPages() {
  run('git fetch origin gh-pages');

  if (fs.existsSync(WORKTREE_DIR)) {
    run(`git worktree remove "${WORKTREE_DIR}" --force`);
  }
  run(`git worktree add "${WORKTREE_DIR}" gh-pages`);

  try {
    // 清空舊檔（保留 .git）
    for (const entry of fs.readdirSync(WORKTREE_DIR)) {
      if (entry === '.git') continue;
      fs.rmSync(path.join(WORKTREE_DIR, entry), { recursive: true, force: true });
    }

    // 複製新的 build 產物進去
    fs.cpSync(DIST_BROWSER, WORKTREE_DIR, { recursive: true });

    run('git add -A', { cwd: WORKTREE_DIR });
    const status = runCapture('git status --porcelain', { cwd: WORKTREE_DIR });
    if (status) {
      run(`git commit -m "Deploy ${new Date().toISOString()}"`, { cwd: WORKTREE_DIR });
      run('git push origin gh-pages', { cwd: WORKTREE_DIR });
    } else {
      console.log('gh-pages 內容沒有變化，略過 push。');
    }
  } finally {
    run(`git worktree remove "${WORKTREE_DIR}" --force`);
  }
}

function publish(commitMessage) {
  const message = commitMessage || `Update content ${new Date().toISOString()}`;
  ensureGitRepo();
  commitMainIfNeeded(message);
  pushMain();
  buildSite();
  preparePagesOutput();
  deployGhPages();
  console.log('\n發佈完成！網站將在幾分鐘內於 https://thegalaxyhouse.com 更新。');
}

if (require.main === module) {
  publish(process.argv[2]);
}

module.exports = { publish };
