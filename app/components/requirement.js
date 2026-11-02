(function () {
  const SECTION_CLASS = "requirement-section";

  function resolveRootRelative(pathFromRoot) {
    const pathname = String(location.pathname || "").replace(/\\/g, "/");
    const webIdx = pathname.indexOf("/web/");
    if (webIdx >= 0) {
      const afterWeb = pathname.slice(webIdx + "/web/".length);
      const depth = afterWeb.split("/").filter(Boolean).length;
      return `${"../".repeat(depth)}${pathFromRoot}`;
    }
    return pathFromRoot;
  }

  function resolvePrdUrl(menuKey) {
    const key = menuKey || "home";
    return `${resolveRootRelative(`docs/PRD/${key}.md`)}?t=${Date.now()}`;
  }

  function resolveBundleUrl() {
    return resolveRootRelative("app/data/prd-bundle.js");
  }

  function loadScript(src, datasetKey) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.dataset[datasetKey] = "1";
      script.onload = resolve;
      script.onerror = () => reject(new Error(`脚本加载失败: ${src}`));
      document.head.appendChild(script);
    });
  }

  async function ensureMarked() {
    if (window.marked && typeof window.marked.parse === "function") {
      return window.marked;
    }
    try {
      await loadScript(resolveRootRelative("app/vendor/marked.min.js"), "prdMarked");
    } catch (_) {
      await loadScript("https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js", "prdMarkedCdn");
    }
    if (!window.marked || typeof window.marked.parse !== "function") {
      throw new Error("marked 加载失败");
    }
    return window.marked;
  }

  function ensureBundle() {
    if (window.__PRD_BUNDLE__ && typeof window.__PRD_BUNDLE__ === "object") {
      return Promise.resolve(window.__PRD_BUNDLE__);
    }
    return new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-prd-bundle]");
      if (existing) {
        existing.addEventListener("load", () => {
          if (window.__PRD_BUNDLE__) resolve(window.__PRD_BUNDLE__);
          else reject(new Error("prd-bundle 未正确导出"));
        });
        existing.addEventListener("error", () => reject(new Error("prd-bundle 加载失败")));
        return;
      }
      const script = document.createElement("script");
      script.src = resolveBundleUrl();
      script.dataset.prdBundle = "1";
      script.onload = () => {
        if (window.__PRD_BUNDLE__) resolve(window.__PRD_BUNDLE__);
        else reject(new Error("prd-bundle 未正确导出"));
      };
      script.onerror = () => reject(new Error("prd-bundle 加载失败"));
      document.head.appendChild(script);
    });
  }

  function enhanceMarkdownHtml(html) {
    const wrap = document.createElement("div");
    wrap.innerHTML = html;
    wrap.querySelectorAll("h2").forEach((h2) => {
      const section = document.createElement("section");
      section.className = SECTION_CLASS;
      h2.replaceWith(section);
      section.appendChild(h2);
      let node = section.nextSibling;
      while (node && !(node.nodeType === 1 && /^H[1-2]$/.test(node.tagName))) {
        const next = node.nextSibling;
        section.appendChild(node);
        node = next;
      }
    });
    wrap.querySelectorAll("table").forEach((table) => {
      table.classList.add("requirement-table");
    });
    return wrap.innerHTML;
  }

  function extractTitle(markdown, fallback) {
    const match = String(markdown).match(/^#\s+(.+)$/m);
    return (match && match[1].trim()) || fallback || "需求说明";
  }

  function errorBody(message, detail) {
    return `<div class="requirement-document"><section class="${SECTION_CLASS}"><h3>无法加载需求说明</h3><p>${message}</p>${
      detail ? `<p><code>${detail}</code></p>` : ""
    }</section></div>`;
  }

  async function loadMarkdownText(menuKey) {
    const key = menuKey || "home";

    if (location.protocol !== "file:") {
      const url = resolvePrdUrl(key);
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const text = await res.text();
          if (text && !text.includes("\uFFFD")) return { markdown: text, source: "fetch" };
        }
      } catch (_) {
        /* fall through to bundle */
      }
    }

    const bundle = await ensureBundle();
    const markdown = bundle[key] || (!menuKey ? bundle.home : null);
    if (!markdown) {
      throw new Error(`未找到需求文档：${key}.md（请确认 docs/PRD 已打包到 prd-bundle.js）`);
    }
    return { markdown, source: "bundle" };
  }

  async function loadRequirement(menuKey) {
    const key = menuKey || "home";
    const missingKey = !menuKey;
    const urlHint = resolvePrdUrl(key).split("?")[0];

    try {
      const marked = await ensureMarked();
      const { markdown } = await loadMarkdownText(menuKey);
      const title = extractTitle(markdown, key);
      let html = marked.parse(markdown);
      html = enhanceMarkdownHtml(html);
      const hint = missingKey
        ? `<section class="${SECTION_CLASS}"><h3>提示</h3><p>页面缺少 data-menu-key，已回退加载 home.md。</p></section>`
        : "";
      return {
        title,
        body: `<div class="requirement-document">${hint}${html}</div>`,
      };
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      return {
        title: "需求说明",
        body: errorBody(msg, urlHint),
      };
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.openAppDrawer) return;
    const button = document.createElement("button");
    button.className = "requirement-fab";
    button.type = "button";
    button.setAttribute("aria-label", "打开需求说明");
    button.innerHTML =
      '<i class="fa-solid fa-book-open" aria-hidden="true"></i><span class="requirement-tooltip">需求说明</span>';
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        const menuKey = document.body.dataset.menuKey;
        const doc = await loadRequirement(menuKey);
        window.openAppDrawer({
          title: `${doc.title} · 需求说明`,
          subtitle: "",
          body: doc.body,
        });
      } finally {
        button.disabled = false;
      }
    });
    document.body.append(button);
  });
})();
