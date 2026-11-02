import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcPath = path.join(root, "app", "components", "requirement.js");
const outDir = path.join(root, "docs", "PRD");

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

const source = fs.readFileSync(srcPath, "utf8");
if (!source.includes("const docs =")) {
  console.error("requirement.js 中未找到 const docs =，请确认尚未被改写为空壳。");
  process.exit(1);
}

const sandbox = {
  document: {
    addEventListener() {},
    createElement() {
      return {
        className: "",
        type: "",
        setAttribute() {},
        innerHTML: "",
        addEventListener() {},
      };
    },
    body: { append() {} },
  },
  window: {},
  console,
  globalThis: null,
};

sandbox.globalThis = sandbox;

const stripped = source
  .replace(/^\(function\s*\(\)\s*\{/, "")
  .replace(/\}\)\s*\(\)\s*;?\s*$/, "");

const code = `
  ${stripped}
  if (typeof docs === "undefined") throw new Error("docs not found");
  globalThis.__PRD_DOCS__ = docs;
`;

vm.runInNewContext(code, sandbox, { filename: "requirement.js" });
const docs = sandbox.__PRD_DOCS__;
if (!docs || typeof docs !== "object") {
  console.error("未能从 requirement.js 提取 docs");
  process.exit(1);
}

function escapeCell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

function toMarkdown(menuKey, doc) {
  const lines = [`# ${doc.title}`, ""];
  for (const [title, content] of doc.sections) {
    lines.push(`## ${title}`, "");
    if (title === "字段说明" && Array.isArray(content)) {
      lines.push("| 字段名称 | 类型 | 是否必填 | 默认值 | 取值范围 |");
      lines.push("| --- | --- | --- | --- | --- |");
      for (const row of content) {
        lines.push(`| ${row.map(escapeCell).join(" | ")} |`);
      }
      lines.push("");
      continue;
    }
    const text = String(content ?? "");
    lines.push(text, "");
  }
  for (const heading of REQUIRED) {
    if (!doc.sections.some(([t]) => t === heading)) {
      throw new Error(`${menuKey} 缺少章节: ${heading}`);
    }
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

fs.mkdirSync(outDir, { recursive: true });
const keys = Object.keys(docs);
for (const key of keys) {
  const md = toMarkdown(key, docs[key]);
  const file = path.join(outDir, `${key}.md`);
  fs.writeFileSync(file, md, "utf8");
  console.log("wrote", path.relative(root, file));
}

console.log(`done: ${keys.length} files`);
