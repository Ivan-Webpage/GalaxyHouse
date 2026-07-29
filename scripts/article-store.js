// 把一篇文章草稿寫進 public/data/articles.json 並重新產生 sitemap。
// 給互動式工具（add-article.js）跟非互動式 CI 腳本（add-article-from-template.js）共用。
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ARTICLES_PATH = path.join(ROOT, 'public', 'data', 'articles.json');
const NEWS_TYPES_PATH = path.join(ROOT, 'public', 'data', 'news-types.json');
const BRANCH_SHOPS_PATH = path.join(ROOT, 'public', 'data', 'branch-shops.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

function loadCatalog() {
  const newsTypes = readJson(NEWS_TYPES_PATH);
  const branchShops = readJson(BRANCH_SHOPS_PATH);
  return {
    newsTypes,
    branchShops,
    branchNames: Object.keys(branchShops),
    newTypeByEnglishName: Object.fromEntries(newsTypes.map((nt) => [nt.englishName, nt])),
  };
}

/**
 * draft: { title, description, content, expirationDate, imageRelPath, newTypeEnglishName, branchShopEnglishName }
 * 回傳新增後的完整文章物件。
 */
function saveArticleDraft(draft) {
  const { branchShops, newTypeByEnglishName } = loadCatalog();
  const articles = readJson(ARTICLES_PATH);

  const newType = newTypeByEnglishName[draft.newTypeEnglishName];
  if (!newType) {
    throw new Error(`找不到消息分類：${draft.newTypeEnglishName}`);
  }
  if (draft.branchShopEnglishName && !branchShops[draft.branchShopEnglishName]) {
    throw new Error(`找不到分店：${draft.branchShopEnglishName}`);
  }

  const now = new Date();
  const createTime = now.toISOString().replace('T', ' ').slice(0, 23);
  const createDate = now.toISOString().slice(0, 10);
  const newId = articles.reduce((max, a) => Math.max(max, a.id), 0) + 1;

  const newArticle = {
    id: newId,
    title: draft.title,
    image: draft.imageRelPath,
    description: draft.description,
    content: draft.content,
    newTypeId: newType.id,
    newTypeTitle: newType.title,
    newTypeColor: newType.color,
    newTypeEnglishName: newType.englishName,
    branchShopId: draft.branchShopEnglishName ? branchShops[draft.branchShopEnglishName].shop.id : null,
    branchShopEnglishName: draft.branchShopEnglishName || null,
    state: 1,
    expiration_date: draft.expirationDate || null,
    create_date: createDate,
    create_time: createTime,
  };

  articles.push(newArticle);
  writeJson(ARTICLES_PATH, articles);

  const { buildSitemap } = require('./generate-sitemap');
  fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), buildSitemap(), 'utf-8');

  return newArticle;
}

module.exports = { saveArticleDraft, loadCatalog };
