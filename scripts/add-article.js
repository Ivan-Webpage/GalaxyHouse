// 互動式新增文章/活動工具。
// 用法：npm run article:add
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const ROOT = path.join(__dirname, '..');
const ARTICLES_PATH = path.join(ROOT, 'public', 'data', 'articles.json');
const NEWS_TYPES_PATH = path.join(ROOT, 'public', 'data', 'news-types.json');
const BRANCH_SHOPS_PATH = path.join(ROOT, 'public', 'data', 'branch-shops.json');
const ARTICLE_IMAGE_DIR = path.join(ROOT, 'public', 'images', 'uploads', 'articles');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

function slugifyImageName(originalPath, existingNames) {
  const ext = path.extname(originalPath) || '.jpg';
  const base = path.basename(originalPath, ext);
  let name = base + ext;
  let n = 2;
  while (existingNames.has(name)) {
    name = `${base}-${n}${ext}`;
    n += 1;
  }
  return name;
}

function isValidDate(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());
}

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const ask = (q) => rl.question(q);

  try {
    const articles = readJson(ARTICLES_PATH);
    const newsTypes = readJson(NEWS_TYPES_PATH);
    const branchShops = readJson(BRANCH_SHOPS_PATH);
    const branchNames = Object.keys(branchShops);

    console.log('=== 新增文章 / 活動 ===\n');

    const title = (await ask('標題：')).trim();
    if (!title) {
      console.log('標題不可空白，已取消。');
      return;
    }

    console.log('\n消息分類：');
    newsTypes.forEach((nt, i) => console.log(`  ${i + 1}. ${nt.title} (${nt.englishName})`));
    const typeIdxRaw = await ask(`請輸入分類編號 [1-${newsTypes.length}]：`);
    const typeIdx = parseInt(typeIdxRaw, 10) - 1;
    const newType = newsTypes[typeIdx];
    if (!newType) {
      console.log('分類編號無效，已取消。');
      return;
    }

    console.log('\n所屬分店：');
    console.log('  0. 不指定特定分店（全館活動）');
    branchNames.forEach((name, i) => console.log(`  ${i + 1}. ${branchShops[name].shop.title} (${name})`));
    const shopIdxRaw = await ask(`請輸入分店編號 [0-${branchNames.length}]：`);
    const shopIdx = parseInt(shopIdxRaw, 10);
    const branchShopEnglishName = shopIdx > 0 ? branchNames[shopIdx - 1] : null;

    const description = (await ask('\n簡短介紹（會用在列表卡片與社群分享預覽，建議 100 字內）：')).trim();

    let expirationDate = (await ask('活動/截止日期（YYYY-MM-DD，長期公告可留空直接按 Enter）：')).trim();
    if (expirationDate && !isValidDate(expirationDate)) {
      console.log('日期格式不正確，已當作未設定處理。');
      expirationDate = '';
    }

    const contentInput = (await ask('\n內文（可直接貼文字/HTML；若要改用檔案內容，輸入 @檔案路徑）：')).trim();
    let content = contentInput;
    if (contentInput.startsWith('@')) {
      const contentFile = contentInput.slice(1).trim();
      content = fs.readFileSync(contentFile, 'utf-8');
    }

    const imagePathInput = (await ask('\n封面圖片路徑（本機檔案完整路徑）：')).trim();
    if (!imagePathInput || !fs.existsSync(imagePathInput)) {
      console.log('找不到圖片檔案，已取消。');
      return;
    }

    fs.mkdirSync(ARTICLE_IMAGE_DIR, { recursive: true });
    const existingNames = new Set(fs.readdirSync(ARTICLE_IMAGE_DIR));
    const destName = slugifyImageName(imagePathInput, existingNames);
    fs.copyFileSync(imagePathInput, path.join(ARTICLE_IMAGE_DIR, destName));
    const imageRelPath = `images/uploads/articles/${destName}`;

    const now = new Date();
    const createTime = now.toISOString().replace('T', ' ').slice(0, 23);
    const createDate = now.toISOString().slice(0, 10);
    const newId = articles.reduce((max, a) => Math.max(max, a.id), 0) + 1;

    const newArticle = {
      id: newId,
      title,
      image: imageRelPath,
      description,
      content,
      newTypeId: newType.id,
      newTypeTitle: newType.title,
      newTypeColor: newType.color,
      newTypeEnglishName: newType.englishName,
      branchShopId: branchShopEnglishName ? branchShops[branchShopEnglishName].shop.id : null,
      branchShopEnglishName,
      state: 1,
      expiration_date: expirationDate || null,
      create_date: createDate,
      create_time: createTime,
    };

    articles.push(newArticle);
    writeJson(ARTICLES_PATH, articles);
    console.log(`\n已新增文章 #${newId}：${title}`);

    const { buildSitemap } = require('./generate-sitemap');
    fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), buildSitemap(), 'utf-8');
    console.log('sitemap.xml 已同步更新。');

    const publishAnswer = (await ask('\n是否要立即建置並發佈到 GitHub Pages？(y/N)：')).trim().toLowerCase();
    if (publishAnswer === 'y' || publishAnswer === 'yes') {
      rl.close();
      const { publish } = require('./publish');
      publish(`新增文章：${title}`);
      return;
    }

    console.log('\n已儲存變更，稍後可執行「npm run publish」手動發佈。');
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('發生錯誤：', err);
  process.exitCode = 1;
});
