// 非互動式版本，給 GitHub Actions（收到財務系統 gh_finance 的 repository_dispatch 後）呼叫。
// 依 sourceEventId 對 public/data/reservations.json 做 upsert 或 delete，讓分店頁面
// （/branchShop/:id）的預約行事曆跟 gh_finance「活動管理」保持同步。
//
// 用法：
//   新增/更新一筆（同一個 sourceEventId 已存在就直接覆蓋該筆，不存在就新增）：
//     node scripts/manage-reservation.js --action=upsert --branch=Songshan \
//       --sourceEventId=123 --date=2026-09-20 --startTime=20:00 --endTime=21:00 \
//       --label="漫霧與音樂之約"
//   刪除一筆（活動被刪除，或狀態改成「取消」時）：
//     node scripts/manage-reservation.js --action=delete --branch=Songshan --sourceEventId=123
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RESERVATIONS_PATH = path.join(ROOT, 'public', 'data', 'reservations.json');

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

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const action = args.action;
  const branch = args.branch;
  const sourceEventId = args.sourceEventId;

  if (!branch) {
    throw new Error('--branch 為必填（例如 Songshan）');
  }
  if (!sourceEventId) {
    throw new Error('--sourceEventId 為必填（gh_finance 活動管理的活動 id）');
  }

  const reservations = readJson(RESERVATIONS_PATH);
  if (!Array.isArray(reservations[branch])) {
    reservations[branch] = [];
  }

  const list = reservations[branch];
  const existingIndex = list.findIndex((r) => String(r.sourceEventId) === String(sourceEventId));

  if (action === 'delete') {
    if (existingIndex === -1) {
      console.log(`sourceEventId=${sourceEventId}（分店 ${branch}）沒有對應的預定項目，略過刪除。`);
      return;
    }
    list.splice(existingIndex, 1);
    writeJson(RESERVATIONS_PATH, reservations);
    console.log(`已刪除 sourceEventId=${sourceEventId} 的預定項目。`);
    return;
  }

  if (action === 'upsert') {
    const date = args.date;
    const startTime = args.startTime;
    const endTime = args.endTime;
    const label = args.label || '';

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error(`--date 需要 YYYY-MM-DD 格式，收到：${date}`);
    }
    if (!startTime || !endTime) {
      throw new Error('--startTime / --endTime 為必填（HH:mm）');
    }

    const entry = { date, startTime, endTime, label, sourceEventId };

    if (existingIndex === -1) {
      list.push(entry);
      console.log(`已新增 sourceEventId=${sourceEventId} 的預定項目：${date} ${startTime}~${endTime} ${label}`);
    } else {
      list[existingIndex] = entry;
      console.log(`已更新 sourceEventId=${sourceEventId} 的預定項目：${date} ${startTime}~${endTime} ${label}`);
    }

    writeJson(RESERVATIONS_PATH, reservations);
    return;
  }

  throw new Error(`未知的 --action：${action}（可用：upsert, delete）`);
}

try {
  main();
} catch (err) {
  console.error('發生錯誤：', err.message);
  process.exitCode = 1;
}
