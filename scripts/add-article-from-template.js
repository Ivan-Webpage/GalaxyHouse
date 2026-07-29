// 非互動式版本，給 GitHub Actions（收到財務系統的 repository_dispatch 後）呼叫。
//
// 用法：
//   漫霧與音樂之約（全自動，不需要標題/內文）：
//     node scripts/add-article-from-template.js --template=moonMusic --date=2026-08-14 --branch=Songshan
//   包場公告（標題/內文每次不同，用文字直接帶不透過 argv，避免特殊字元被 shell 吃掉）：
//     ARTICLE_TITLE="9月包場公告" ARTICLE_CONTENT="9月15日、9月22日包場" \
//       node scripts/add-article-from-template.js --template=venueClosure --date=2026-09-30 --branch=Songshan
'use strict';

const { TEMPLATES } = require('./article-templates');
const { saveArticleDraft } = require('./article-store');

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    const match = raw.match(/^--([^=]+)=(.*)$/);
    if (match) {
      args[match[1]] = match[2];
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const templateKey = args.template;
  const dateStr = args.date;
  const branchShopEnglishName = args.branch || null;

  const template = TEMPLATES.find((t) => t.key === templateKey);
  if (!template) {
    throw new Error(`未知的套版：${templateKey}（可用：${TEMPLATES.map((t) => t.key).join(', ')}）`);
  }
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error(`--date 需要 YYYY-MM-DD 格式，收到：${dateStr}`);
  }

  let draft;
  if (template.buildContent) {
    // 內容完全固定的套版（漫霧與音樂之約）：只需要日期。
    draft = {
      title: template.buildTitle(dateStr),
      description: template.buildDescription(dateStr),
      content: template.buildContent(dateStr),
      expirationDate: dateStr,
      imageRelPath: template.imageRelPath,
      newTypeEnglishName: template.newTypeEnglishName,
      branchShopEnglishName,
    };
  } else {
    // 標題/內文每次不同的套版（包場公告）：從環境變數帶入，簡短介紹自動產生。
    const title = (process.env.ARTICLE_TITLE || '').trim();
    const content = (process.env.ARTICLE_CONTENT || '').trim();
    if (!title || !content) {
      throw new Error('套版「' + template.label + '」需要 ARTICLE_TITLE 與 ARTICLE_CONTENT 環境變數。');
    }
    draft = {
      title,
      description: template.buildDescription(title),
      content,
      expirationDate: dateStr,
      imageRelPath: template.imageRelPath,
      newTypeEnglishName: template.newTypeEnglishName,
      branchShopEnglishName,
    };
  }

  const newArticle = saveArticleDraft(draft);
  console.log(`已新增文章 #${newArticle.id}：${newArticle.title}`);
  console.log('sitemap.xml 已同步更新。');
}

try {
  main();
} catch (err) {
  console.error('發生錯誤：', err.message);
  process.exitCode = 1;
}
