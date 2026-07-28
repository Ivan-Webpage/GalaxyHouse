// 靜態網站的完整路由清單，供 sitemap 產生器與其他工具共用。
'use strict';

const path = require('path');
const fs = require('fs');

const SITE_ORIGIN = 'https://thegalaxyhouse.com';

const BRANCH_SHOPS = ['Songshan', 'Tianmu'];
const NEWS_TYPES = ['announcement', 'newActivity', 'eventHighlights'];
const NEWS_SCOPES = ['galaxyhouse', ...BRANCH_SHOPS];

const STATIC_PATHS = ['/home', '/about_us', '/apply', '/banquet', '/catering'];

function readArticles() {
  const file = path.join(__dirname, '..', 'public', 'data', 'articles.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

/** 回傳目前應該存在於 sitemap 裡的所有路徑（不含 domain），只列出上架中(state>0)的文章 */
function getAllRoutePaths() {
  const paths = [...STATIC_PATHS];

  for (const shop of BRANCH_SHOPS) {
    paths.push(`/branchShop/${shop}`);
  }

  for (const newType of NEWS_TYPES) {
    for (const scope of NEWS_SCOPES) {
      paths.push(`/news/${newType}/${scope}`);
    }
  }

  const articles = readArticles();
  for (const article of articles) {
    if (article.state > 0) {
      paths.push(`/article/${article.id}`);
    }
  }

  return paths;
}

module.exports = { SITE_ORIGIN, BRANCH_SHOPS, NEWS_TYPES, NEWS_SCOPES, STATIC_PATHS, getAllRoutePaths, readArticles };
