(function () {
  const menu = window.APP_MENU || [];

  const navIcons = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z"></path><path d="M9 21v-6h6v6"></path>',
    device: '<path d="m12 3 8 4-8 4-8-4 8-4Z"></path><path d="m4 12 8 4 8-4"></path><path d="m4 16 8 4 8-4"></path>',
    network: '<circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49"></path><path d="M7.76 16.24a6 6 0 0 1 0-8.49"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M4.93 19.07a10 10 0 0 1 0-14.14"></path>',
    performance: '<path d="M3 3v18h18"></path><path d="m7 14 4-4 3 3 5-6"></path>',
    system: '<path d="M12.22 2h-.44a2 2 0 0 0-1.99 1.82l-.18 1.37a7 7 0 0 0-1.24.72l-1.31-.5a2 2 0 0 0-2.5 1.16l-.16.4a2 2 0 0 0 .78 2.65l1.13.71a7 7 0 0 0 0 1.43l-1.13.71a2 2 0 0 0-.78 2.65l.16.4a2 2 0 0 0 2.5 1.16l1.31-.5c.39.28.8.52 1.24.72l.18 1.37A2 2 0 0 0 11.78 22h.44a2 2 0 0 0 1.99-1.82l.18-1.37a7 7 0 0 0 1.24-.72l1.31.5a2 2 0 0 0 2.5-1.16l.16-.4a2 2 0 0 0-.78-2.65l-1.13-.71a7 7 0 0 0 0-1.43l1.13-.71a2 2 0 0 0 .78-2.65l-.16-.4a2 2 0 0 0-2.5-1.16l-1.31.5a7 7 0 0 0-1.24-.72l-.18-1.37A2 2 0 0 0 12.22 2Z"></path><circle cx="12" cy="12" r="3"></circle>',
    report: '<path d="M3 3v18h18"></path><path d="M7 14v4"></path><path d="M12 10v8"></path><path d="M17 6v12"></path>',
    threat: '<path d="M12 3 4 7v5c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-4Z"></path><path d="M12 8v5"></path><path d="M12 16h.01"></path>',
    secops: '<path d="M12 3 4 7v5c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-4Z"></path><path d="M9 12l2 2 4-4"></path>',
    datasec: '<ellipse cx="12" cy="5" rx="8" ry="3"></ellipse><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"></path><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"></path>',
  };

  function renderNavIcon(item) {
    const paths = navIcons[item.key] || '<rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M8 9h8M8 13h8M8 17h5"></path>';
    return `<span class="nav-icon nav-icon-${item.key}" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">${paths}</svg></span>`;
  }

  function isActive(item, currentKey) {
    if (item.key === currentKey) return true;
    return Array.isArray(item.children) && item.children.some((child) => isActive(child, currentKey));
  }

  function firstHref(item) {
    if (item.href) return item.href;
    const child = Array.isArray(item.children) ? item.children.find((entry) => firstHref(entry)) : null;
    return child ? firstHref(child) : "#";
  }

  function renderChildren(children, currentKey, depth = 1) {
    if (!children || !children.length) return "";
    return `
      <div class="submenu submenu-depth-${depth}">
        ${children.map((child) => {
          const active = isActive(child, currentKey);
          const href = firstHref(child);
          return child.children?.length
            ? `<div class="submenu-group ${active ? "open" : ""}">
                <a class="submenu-group-label ${active ? "active" : ""}" href="#" data-nav-subtoggle="${child.key}"><span>${child.label}</span><i class="fa-solid ${active ? "fa-chevron-up" : "fa-chevron-down"}" aria-hidden="true"></i></a>
                ${renderChildren(child.children, currentKey, depth + 1)}
              </div>`
            : `<a class="submenu-item ${child.key === currentKey ? "active" : ""}" href="${href}"${child.target ? ` target="${child.target}" rel="noopener noreferrer"` : ""}><span>${child.label}</span></a>`;
        }).join("")}
      </div>
    `;
  }

  function renderItem(item, currentKey) {
    const active = isActive(item, currentKey);
    const href = firstHref(item);
    return `
      <div class="nav-block ${active ? "open" : ""}">
        <a class="nav-item ${active ? "active" : ""}" href="${item.children ? "#" : href}" ${item.children ? `data-nav-toggle="${item.key}"` : ""}>
          ${renderNavIcon(item)}
          <span class="nav-text">${item.label}</span>
          ${item.children ? `<i class="nav-arrow fa-solid ${active ? "fa-chevron-up" : "fa-chevron-down"}" aria-hidden="true"></i>` : '<i class="nav-arrow fa-solid fa-chevron-right" aria-hidden="true"></i>'}
        </a>
        ${renderChildren(item.children, currentKey)}
      </div>
    `;
  }

  function mountSidebar() {
    const target = document.getElementById("app-sidebar");
    if (!target) return;

    const currentKey = document.body.dataset.menuKey || "home";
    target.innerHTML = `
      <div class="brand">
        <a class="brand-link" href="../home/home.html" aria-label="返回工作台">
          <span class="brand-mark" aria-hidden="true"><img src="../../assets/images/platform-logo.svg" alt=""></span>
          <span class="brand-name">网络安全运维管理平台</span>
        </a>
      </div>
      <nav class="nav" aria-label="主导航">
        ${menu.map((item) => renderItem(item, currentKey)).join("")}
      </nav>
    `;
    target.querySelectorAll("[data-nav-toggle]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const block = link.closest(".nav-block");
        const shouldOpen = !block.classList.contains("open");
        target.querySelectorAll(".nav > .nav-block.open").forEach((item) => item.classList.remove("open"));
        target.querySelectorAll(".nav > .nav-block [data-nav-toggle] .nav-arrow").forEach((arrow) => { arrow.classList.remove("fa-chevron-up"); arrow.classList.add("fa-chevron-down"); });
        target.querySelectorAll(".submenu-group.open").forEach((item) => item.classList.remove("open"));
        target.querySelectorAll(".submenu-group-label i").forEach((arrow) => { arrow.classList.remove("fa-chevron-up"); arrow.classList.add("fa-chevron-down"); });
        if (shouldOpen) {
          block.classList.add("open");
          link.querySelector(".nav-arrow")?.classList.remove("fa-chevron-down");
          link.querySelector(".nav-arrow")?.classList.add("fa-chevron-up");
        }
      });
    });
    target.querySelectorAll("[data-nav-subtoggle]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const group = link.closest(".submenu-group");
        const shouldOpen = !group.classList.contains("open");
        group.parentElement.querySelectorAll(":scope > .submenu-group.open").forEach((item) => item.classList.remove("open"));
        group.parentElement.querySelectorAll(":scope > .submenu-group .submenu-group-label i").forEach((arrow) => { arrow.classList.remove("fa-chevron-up"); arrow.classList.add("fa-chevron-down"); });
        if (shouldOpen) {
          group.classList.add("open");
          const arrow = link.querySelector("i");
          arrow?.classList.remove("fa-chevron-down");
          arrow?.classList.add("fa-chevron-up");
        }
      });
    });
    target.querySelectorAll("a[href]:not([data-nav-toggle]):not([data-nav-subtoggle])").forEach((link) => {
      link.addEventListener("click", () => {
        if (link.getAttribute("target") === "_blank") return;
        const href = new URL(link.getAttribute("href"), location.href).pathname;
        const title = link.querySelector("span")?.textContent?.trim() || document.body.dataset.pageTitle || "页面";
        const key = "app-route-tabs";
        const tabs = JSON.parse(sessionStorage.getItem(key) || "[]");
        const existing = tabs.find((item) => item.path === href);
        if (existing) existing.title = title;
        else tabs.push({ path: href, title, closable: href !== location.pathname });
        sessionStorage.setItem(key, JSON.stringify(tabs));
      });
    });
  }

  document.addEventListener("DOMContentLoaded", mountSidebar);
})();
