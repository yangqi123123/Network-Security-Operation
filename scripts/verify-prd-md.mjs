import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dir = path.join(root, "docs", "PRD");

const KEYS = [
  "home",
  "device.list",
  "profile",
  "system.user",
  "system.role",
  "system.menu",
  "system.department",
  "system.post",
  "system.dictionary",
  "system.parameter",
  "system.notice",
  "system.operation-log",
  "system.login-log",
];

const REQUIRED = [
  "需求说明",
  "操作入口",
  "交互动作",
  "数据来源",
  "状态流转",
  "顶部统计卡片说明",
  "输出结果",
  "字段说明",
];

const banned = [/mock-data\.js/i, /\bmock\b/i, /模拟数据/, /模拟接口/, /原型演示数据/, /不会真实保存/, /不会修改数据/];

let failed = 0;
for (const key of KEYS) {
  const file = path.join(dir, `${key}.md`);
  if (!fs.existsSync(file)) {
    console.error("MISSING", key);
    failed++;
    continue;
  }
  const text = fs.readFileSync(file, "utf8");
  if (text.includes("\uFFFD")) {
    console.error("ENCODING CORRUPTION", key);
    failed++;
  }
  for (const heading of REQUIRED) {
    if (!text.includes(`## ${heading}`)) {
      console.error("MISSING HEADING", key, heading);
      failed++;
    }
  }
  if (!text.includes("| 字段名称 |")) {
    console.error("MISSING FIELD TABLE", key);
    failed++;
  }
  for (const re of banned) {
    if (re.test(text)) {
      console.error("BANNED TERM", key, re);
      failed++;
    }
  }
}

const reqJs = fs.readFileSync(path.join(root, "app", "components", "requirement.js"), "utf8");
if (/const docs\s*=/.test(reqJs)) {
  console.error("requirement.js still embeds const docs =");
  failed++;
}
if (!reqJs.includes("docs/PRD/")) {
  console.error("requirement.js missing docs/PRD path logic");
  failed++;
}
if (!reqJs.includes("__PRD_BUNDLE__")) {
  console.error("requirement.js missing bundle fallback");
  failed++;
}

const bundlePath = path.join(root, "app", "data", "prd-bundle.js");
if (!fs.existsSync(bundlePath)) {
  console.error("MISSING app/data/prd-bundle.js — run: node scripts/build-prd-bundle.mjs");
  failed++;
} else {
  const bundle = fs.readFileSync(bundlePath, "utf8");
  if (bundle.includes("\uFFFD")) {
    console.error("ENCODING CORRUPTION in prd-bundle.js");
    failed++;
  }
  for (const key of KEYS) {
    if (!bundle.includes(`"${key}"`)) {
      console.error("BUNDLE MISSING KEY", key);
      failed++;
    }
  }
}

if (failed) {
  console.error(`FAILED checks: ${failed}`);
  process.exit(1);
}
console.log("OK: 13 PRD files + requirement.js loader + prd-bundle");
