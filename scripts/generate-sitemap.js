// 重新產生 public/sitemap.xml，涵蓋所有靜態頁面、分店頁、消息分類頁與上架中的文章頁。
// 用法：node scripts/generate-sitemap.js
'use strict';

const fs = require('fs');
const path = require('path');
const { SITE_ORIGIN, getAllRoutePaths } = require('./site-routes');

function buildSitemap() {
  const now = new Date().toISOString();
  const paths = getAllRoutePaths();

  const urls = paths
    .map((p) => `<url>\n  <loc>${SITE_ORIGIN}${p}</loc>\n  <lastmod>${now}</lastmod>\n</url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset\n      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n${urls}\n</urlset>\n`;
}

function main() {
  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, buildSitemap(), 'utf-8');
  console.log(`sitemap.xml 已更新：${outPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { buildSitemap };
