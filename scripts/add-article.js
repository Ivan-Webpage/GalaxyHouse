// 互動式新增文章/活動工具。
// 用法：npm run article:add
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const { TEMPLATES } = require('./article-templates');
const { saveArticleDraft, loadCatalog } = require('./article-store');

const ROOT = path.join(__dirname, '..');
const ARTICLE_IMAGE_DIR = path.join(ROOT, 'public', 'images', 'uploads', 'articles');

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

/**
 * 內文常常是多行文字/HTML，單純用一次 rl.question() 只會讀到第一行，
 * 貼上去的其餘內容會整段消失。改成逐行讀取，直到使用者輸入單獨一行 END 為止。
 * 若第一行是 @檔案路徑，則直接讀該檔案內容（不需要再輸入 END）。
 */
async function askContent(rl) {
  console.log('\n內文：');
  console.log('  - 可直接貼多行文字或 HTML，貼完後另起一行輸入 END 並按 Enter 結束輸入');
  console.log('  - 若要改用檔案內容，第一行直接輸入 @檔案路徑 即可（不用再輸入 END）');

  const lines = [];
  let isFirstLine = true;
  for (;;) {
    const line = await rl.question('> ');
    if (isFirstLine && line.trim().startsWith('@')) {
      const contentFile = line.trim().slice(1).trim();
      return fs.readFileSync(contentFile, 'utf-8');
    }
    isFirstLine = false;
    if (line.trim() === 'END') break;
    lines.push(line);
  }
  return lines.join('\n').trim();
}

async function askBranchShop(rl, branchShops, branchNames) {
  console.log('\n所屬分店：');
  console.log('  0. 不指定特定分店（全館活動）');
  branchNames.forEach((name, i) => console.log(`  ${i + 1}. ${branchShops[name].shop.title} (${name})`));
  const shopIdxRaw = await rl.question(`請輸入分店編號 [0-${branchNames.length}]：`);
  const shopIdx = parseInt(shopIdxRaw, 10);
  return shopIdx > 0 ? branchNames[shopIdx - 1] : null;
}

async function askEventDate(rl, promptText, required) {
  for (;;) {
    const raw = (await rl.question(promptText)).trim();
    if (!raw) {
      if (required) {
        console.log('這個套版需要日期，請重新輸入。');
        continue;
      }
      return '';
    }
    if (!isValidDate(raw)) {
      console.log('日期格式不正確，請用 YYYY-MM-DD（例如 2026-08-14）。');
      continue;
    }
    return raw;
  }
}

function copyCoverImage(imagePathInput) {
  fs.mkdirSync(ARTICLE_IMAGE_DIR, { recursive: true });
  const existingNames = new Set(fs.readdirSync(ARTICLE_IMAGE_DIR));
  const destName = slugifyImageName(imagePathInput, existingNames);
  fs.copyFileSync(imagePathInput, path.join(ARTICLE_IMAGE_DIR, destName));
  return `images/uploads/articles/${destName}`;
}

async function buildFromMoonMusicTemplate(rl, template, branchShops, branchNames) {
  const branchShopEnglishName = await askBranchShop(rl, branchShops, branchNames);
  const dateStr = await askEventDate(rl, '\n活動日期（YYYY-MM-DD，例如 2026-08-14）：', true);

  const draft = {
    title: template.buildTitle(dateStr),
    description: template.buildDescription(dateStr),
    content: template.buildContent(dateStr),
    expirationDate: dateStr,
    imageRelPath: template.imageRelPath,
    newTypeEnglishName: template.newTypeEnglishName,
    branchShopEnglishName,
  };

  console.log('\n已自動產生以下內容：');
  console.log(`  標題：${draft.title}`);
  console.log(`  簡短介紹：${draft.description}`);
  console.log(`  活動日期：${draft.expirationDate}`);
  console.log(`  封面圖片：${draft.imageRelPath}（沿用既有檔案，不會複製新檔）`);

  const confirm = (await rl.question('\n確認送出？(Y/n)：')).trim().toLowerCase();
  if (confirm === 'n' || confirm === 'no') {
    return null;
  }
  return draft;
}

async function buildFromVenueClosureTemplate(rl, template, branchShops, branchNames) {
  const branchShopEnglishName = await askBranchShop(rl, branchShops, branchNames);
  const title = (await rl.question('\n標題：')).trim();
  if (!title) {
    console.log('標題不可空白，已取消。');
    return null;
  }
  const description = (await rl.question('\n簡短介紹（會用在列表卡片與社群分享預覽，建議 100 字內）：')).trim();
  const expirationDate = await askEventDate(rl, '\n公告截止日期（YYYY-MM-DD，長期公告可留空直接按 Enter）：', false);
  const content = await askContent(rl);
  if (!content) {
    console.log('內文不可空白，已取消。');
    return null;
  }

  return {
    title,
    description,
    content,
    expirationDate,
    imageRelPath: template.imageRelPath,
    newTypeEnglishName: template.newTypeEnglishName,
    branchShopEnglishName,
  };
}

async function buildFromScratch(rl, newsTypes, branchShops, branchNames) {
  const title = (await rl.question('標題：')).trim();
  if (!title) {
    console.log('標題不可空白，已取消。');
    return null;
  }

  console.log('\n消息分類：');
  newsTypes.forEach((nt, i) => console.log(`  ${i + 1}. ${nt.title} (${nt.englishName})`));
  const typeIdxRaw = await rl.question(`請輸入分類編號 [1-${newsTypes.length}]：`);
  const typeIdx = parseInt(typeIdxRaw, 10) - 1;
  const newType = newsTypes[typeIdx];
  if (!newType) {
    console.log('分類編號無效，已取消。');
    return null;
  }

  const branchShopEnglishName = await askBranchShop(rl, branchShops, branchNames);
  const description = (await rl.question('\n簡短介紹（會用在列表卡片與社群分享預覽，建議 100 字內）：')).trim();
  const expirationDate = await askEventDate(rl, '活動/截止日期（YYYY-MM-DD，長期公告可留空直接按 Enter）：', false);
  const content = await askContent(rl);
  if (!content) {
    console.log('內文不可空白，已取消。');
    return null;
  }

  const imagePathInput = (await rl.question('\n封面圖片路徑（本機檔案完整路徑）：')).trim();
  if (!imagePathInput || !fs.existsSync(imagePathInput)) {
    console.log('找不到圖片檔案，已取消。');
    return null;
  }
  const imageRelPath = copyCoverImage(imagePathInput);

  return {
    title,
    description,
    content,
    expirationDate,
    imageRelPath,
    newTypeEnglishName: newType.englishName,
    branchShopEnglishName,
  };
}

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  try {
    const { newsTypes, branchShops, branchNames } = loadCatalog();

    console.log('=== 新增文章 / 活動 ===\n');
    console.log('請選擇文章類型：');
    TEMPLATES.forEach((t, i) => console.log(`  ${i + 1}. ${t.label}`));
    console.log(`  ${TEMPLATES.length + 1}. 其他（完整手動輸入）`);

    const choiceRaw = await rl.question(`請輸入選項 [1-${TEMPLATES.length + 1}]：`);
    const choice = parseInt(choiceRaw, 10);

    let draft;
    if (choice >= 1 && choice <= TEMPLATES.length) {
      const template = TEMPLATES[choice - 1];
      draft = template.buildContent
        ? await buildFromMoonMusicTemplate(rl, template, branchShops, branchNames)
        : await buildFromVenueClosureTemplate(rl, template, branchShops, branchNames);
    } else if (choice === TEMPLATES.length + 1) {
      draft = await buildFromScratch(rl, newsTypes, branchShops, branchNames);
    } else {
      console.log('選項無效，已取消。');
      return;
    }

    if (!draft) {
      console.log('已取消。');
      return;
    }

    const newArticle = saveArticleDraft(draft);
    console.log(`\n已新增文章 #${newArticle.id}：${newArticle.title}`);
    console.log('sitemap.xml 已同步更新。');

    const publishAnswer = (await rl.question('\n是否要立即建置並發佈到 GitHub Pages？(y/N)：')).trim().toLowerCase();
    if (publishAnswer === 'y' || publishAnswer === 'yes') {
      rl.close();
      const { publish } = require('./publish');
      publish(`新增文章：${newArticle.title}`);
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
