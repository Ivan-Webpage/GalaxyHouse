// 常態發文套版：內容基本固定、只有日期會變的文章類型。
// 用來讓「漫霧與音樂之約」這種每次幾乎照抄同一份內容的活動，不用每次手動貼一次 HTML。
'use strict';

/** 把 YYYY-MM-DD 拆成數字，不用 Date 物件轉換，避免時區造成日期偏移 */
function parseDateParts(dateStr) {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  return { y, m, d };
}

const MOON_MUSIC = {
  key: 'moonMusic',
  label: '漫霧與音樂之約（最新活動）',
  newTypeEnglishName: 'newActivity',
  imageRelPath: 'images/uploads/articles/漫霧與音樂之約_5.jpg',
  buildTitle(dateStr) {
    const { m, d } = parseDateParts(dateStr);
    return `${m}/${d}漫霧與音樂之約`;
  },
  buildDescription(dateStr) {
    const { m, d } = parseDateParts(dateStr);
    return `Galaxy House 銀河會所松山店 ${m}/${d} 晚間8點舉辦「漫霧與音樂之約」雪茄音樂分享會，限量15位，850元享雪茄一支＋白酒一杯，在音樂與雪茄煙霧交織的私密夜晚中，展開一場屬於台北的高端社交體驗。`;
  },
  buildContent(dateStr) {
    const { y, m, d } = parseDateParts(dateStr);
    return `<ul>
	<li>
	<p>日期：${y}/${m}/${d}</p>
	</li>
	<li>
	<p>時間：晚上8-9點</p>
	</li>
	<li>
	<p>費用：850元/人</p>
	</li>
	<li>
	<p>享用：精選任選1隻+白酒1杯</p>
	</li>
	<li>
	<p>人數：上限15位</p>
	</li>
	<li>
	<p>地點：台北市松山區南京東路5段66巷12弄3號 (南京三民站2號出口)</p>
	</li>
</ul>

<hr />
<h2>注意事項：</h2>

<ul>
	<li>因名額有限，因此已報名付款為主</li>
	<li>未到退款一半金額</li>
</ul>

<hr />
<h2>報名方式：</h2>

<ol>
	<li>
	<p>Line@報名：加入我們的Line@詢問報名，ID:「<a href="https://line.me/ti/p/@392kgxba">@392kgxba</a>」，確認尚有名額後方可報名。</p>
	</li>
	<li>
	<p>選擇付款方式：可選擇以下3種付款方式</p>

	<ol>
		<li>銀行轉帳</li>
		<li>Line Pay</li>
		<li>街口</li>
	</ol>
	</li>
</ol>`;
  },
};

const VENUE_CLOSURE = {
  key: 'venueClosure',
  label: '包場公告（公告）',
  newTypeEnglishName: 'announcement',
  imageRelPath: 'images/uploads/articles/過年店休公告1.jpg',
  // 內容每次差異較大（包場原因、日期都不同），標題/內文不套版，要另外提供；
  // 簡短介紹（SEO description）則用標題自動產生，減少每次都要重打一次的欄位。
  buildDescription(title) {
    return `Galaxy House 銀河會所松山店公告：${title}，造成不便敬請見諒，詳情請洽詢我們的官方 Line@ 或粉絲專頁。`;
  },
};

const TEMPLATES = [MOON_MUSIC, VENUE_CLOSURE];

module.exports = { TEMPLATES, MOON_MUSIC, VENUE_CLOSURE, parseDateParts };
