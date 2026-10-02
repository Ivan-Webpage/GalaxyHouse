// 給 GitHub Actions「自動新增活動並發佈」（.github/workflows/add-article.yml）在部署完成後呼叫：
// 把新文章編號回寫到財務系統（gh_finance）對應的活動，讓「活動管理」與 LINE@ 訂位日曆
// 都拿得到這筆活動的官網文章網址（https://thegalaxyhouse.com/article/{id}）。
//
// 用環境變數帶入（不經過 argv，避免外部輸入被 shell 解讀）：
//   SOURCE_EVENT_ID          gh_finance 活動 id（dispatch 的 client_payload.sourceEventId）
//   ARTICLE_ID               這次新增的文章編號（add-article-from-template.js 寫進 $GITHUB_OUTPUT）
//   GH_FINANCE_CALLBACK_KEY  GitHub Actions secret，需等於 gh_finance 後端的 WEBSITE_ARTICLE_CALLBACK_KEY
//   GH_FINANCE_API_BASE      選填，預設 https://galaxyhouse-finance.zeabur.app
//
// 沒有 SOURCE_EVENT_ID（例如手動觸發、舊版財務系統沒帶）或沒設定金鑰時只印提示、不算失敗——
// 文章已經部署成功，回寫網址是附加功能，不應該讓整個 workflow 變成失敗。
'use strict';

const DEFAULT_API_BASE = 'https://galaxyhouse-finance.zeabur.app';

async function main() {
  const sourceEventId = (process.env.SOURCE_EVENT_ID || '').trim();
  const articleId = (process.env.ARTICLE_ID || '').trim();
  const callbackKey = (process.env.GH_FINANCE_CALLBACK_KEY || '').trim();
  const apiBase = ((process.env.GH_FINANCE_API_BASE || '').trim() || DEFAULT_API_BASE).replace(/\/+$/, '');

  if (!sourceEventId) {
    console.log('沒有 SOURCE_EVENT_ID，略過回寫財務系統。');
    return;
  }
  if (!/^\d+$/.test(sourceEventId) || !/^\d+$/.test(articleId)) {
    throw new Error(`SOURCE_EVENT_ID／ARTICLE_ID 需為數字，收到：${sourceEventId}／${articleId}`);
  }
  if (!callbackKey) {
    console.log('::warning::未設定 GH_FINANCE_CALLBACK_KEY secret，略過回寫財務系統（文章已正常發佈）。');
    return;
  }

  const response = await fetch(`${apiBase}/api/public/website-article-callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Callback-Key': callbackKey,
    },
    body: JSON.stringify({ sourceEventId, articleId: Number(articleId) }),
  });
  const text = await response.text().catch(() => '');

  if (response.status === 404) {
    console.log(`::warning::財務系統找不到活動 #${sourceEventId}（可能已被刪除），文章 #${articleId} 未回寫。`);
    return;
  }
  if (!response.ok) {
    throw new Error(`回寫財務系統失敗：HTTP ${response.status} ${text}`.trim());
  }

  console.log(`已回寫財務系統：活動 #${sourceEventId} → 文章 #${articleId}`);
}

main().catch((err) => {
  console.error('發生錯誤：', err.message);
  process.exitCode = 1;
});
