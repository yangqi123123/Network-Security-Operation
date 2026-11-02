(function () {
  const PROFILE_HREF = "../profile/profile.html";
  const LOGIN_HREF = "../../../index.html";

  function applyTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("app-theme", nextTheme);
  }

  function applySidebar(collapsed) {
    const nextState = collapsed ? "collapsed" : "expanded";
    document.documentElement.dataset.sidebar = nextState;
    localStorage.setItem("app-sidebar-collapsed", String(collapsed));
  }

  function isSidebarCollapsed() {
    return localStorage.getItem("app-sidebar-collapsed") === "true";
  }

  function setupFilterLayouts() {
    document.querySelectorAll(".filters .filter-actions").forEach((container) => {
      if (container.dataset.filterLayoutReady === "true") return;
      const fields = [...container.children].filter((item) => item.matches(".form-field"));
      if (!fields.length) return;
      const children = [...container.children];
      const existingToggle = children.find((item) => item.matches("button.btn-ghost") && /收起|展开/.test(item.textContent));
      const fieldWrap = document.createElement("div");
      fieldWrap.className = "filter-fields";
      fields.forEach((field, index) => {
        if (index >= 4) field.classList.add("filter-field-extra");
        fieldWrap.append(field);
      });

      const controlWrap = document.createElement("div");
      controlWrap.className = "filter-controls";
      const controls = children.filter((item) => item.matches("button"));
      let toggle = fields.length > 4 ? existingToggle : null;
      if (fields.length > 4 && !toggle) {
        toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "btn btn-ghost filter-toggle";
      }
      if (toggle) {
        toggle.classList.add("filter-toggle");
        toggle.dataset.filterToggle = "true";
        toggle.innerHTML = `展开 <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>`;
        toggle.addEventListener("click", (event) => {
          event.preventDefault();
          const expanded = container.classList.toggle("is-expanded");
          toggle.innerHTML = `${expanded ? "收起" : "展开"} <i class="fa-solid ${expanded ? "fa-chevron-up" : "fa-chevron-down"}" aria-hidden="true"></i>`;
        });
      }
      if (toggle) controlWrap.append(toggle);
      controls.filter((item) => item !== existingToggle && item !== toggle).forEach((button) => controlWrap.append(button));
      container.replaceChildren(fieldWrap, controlWrap);
      container.classList.add("filter-layout");
      container.dataset.filterLayoutReady = "true";
    });
  }

  applyTheme(localStorage.getItem("app-theme") || "dark");
  applySidebar(isSidebarCollapsed());

  function mountHeader() {
    const target = document.getElementById("app-header");
    if (!target) return;

    const title = document.body.dataset.pageTitle || "工作台";
    const section = document.body.dataset.pageSection || "网络安全运维管理平台";
    const theme = document.documentElement.dataset.theme || "dark";
    const collapsed = isSidebarCollapsed();
    const isDark = theme === "dark";
    target.innerHTML = `
      <div class="header-top">
       <div class="header-left">
        <button class="sidebar-toggle" type="button" title="${collapsed ? "展开侧边栏" : "收缩侧边栏"}" aria-label="${collapsed ? "展开侧边栏" : "收缩侧边栏"}" data-sidebar-toggle>
          <i class="fa-solid ${collapsed ? "fa-menu-unfold" : "fa-menu-fold"}" aria-hidden="true"></i>
        </button>
        <div class="breadcrumb">${section} / <strong>${title}</strong></div>
       </div>
      <div class="search-wrap">
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        <input class="search" type="search" placeholder="搜索导航菜单" aria-label="搜索导航菜单">
      </div>
       <div class="header-actions">
        <span class="header-action"><i class="fa-regular fa-bell"></i><span class="label">消息</span></span>
        <button class="theme-toggle" type="button" title="${isDark ? "切换浅色模式" : "切换夜间模式"}" aria-label="${isDark ? "切换浅色模式" : "切换夜间模式"}" data-theme-toggle>
          <i class="fa-regular ${isDark ? "fa-sun" : "fa-moon"}" aria-hidden="true"></i>
        </button>
        <div class="user-menu">
          <button class="user-trigger" type="button" aria-expanded="false" aria-label="打开用户菜单">
            <span class="user-avatar">Li</span>
            <span class="label">疯狂的狮子Li</span>
            <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
          </button>
          <div class="user-dropdown" role="menu">
            <a class="user-dropdown-item" href="${PROFILE_HREF}" role="menuitem"><i class="fa-regular fa-user"></i>个人中心</a>
            <a class="user-dropdown-item danger" href="${LOGIN_HREF}" role="menuitem"><i class="fa-solid fa-right-from-bracket"></i>退出登录</a>
          </div>
        </div>
       </div>
      </div>
      <div class="route-tabs" data-route-tabs>
        <button class="tabs-arrow" type="button" data-tabs-prev aria-label="向左滚动标签">‹</button>
        <div class="tabs-viewport" data-tabs-viewport><div class="tabs-list" data-tabs-list></div></div>
        <button class="tabs-arrow" type="button" data-tabs-next aria-label="向右滚动标签">›</button>
      </div>
    `;

    setupFilterLayouts();

    const searchWrap = target.querySelector(".search-wrap");
    const searchInput = searchWrap.querySelector(".search");
    const searchPanel = document.createElement("div");
    searchPanel.className = "nav-search-panel";
    searchPanel.innerHTML = `<div class="nav-search-title">菜单导航</div><div class="nav-search-results"></div>`;
    searchWrap.append(searchPanel);
    function flattenMenu(items) {
      return (items || []).flatMap((item) => item.children?.length ? flattenMenu(item.children) : [item]);
    }
    const menuItems = flattenMenu(window.APP_MENU || []);
    function renderMenuResults(keyword = "") {
      const results = menuItems.filter((item) => item.href && item.href !== "#" && (!keyword || item.label.includes(keyword)));
      searchPanel.querySelector(".nav-search-results").innerHTML = results.length ? results.map((item) => `<button class="nav-search-item" type="button" data-search-href="${item.href}"><span>${item.label}</span></button>`).join("") : `<div class="nav-search-empty">未找到匹配菜单</div>`;
    }
    renderMenuResults();
    searchInput.addEventListener("focus", () => { renderMenuResults(searchInput.value.trim()); searchPanel.classList.add("open"); });
    searchInput.addEventListener("input", () => { renderMenuResults(searchInput.value.trim()); searchPanel.classList.add("open"); });
    searchPanel.addEventListener("click", (event) => { const item = event.target.closest("[data-search-href]"); if (item) location.href = item.dataset.searchHref; });
    document.addEventListener("click", (event) => { if (!searchWrap.contains(event.target)) searchPanel.classList.remove("open"); });

    const currentPath = location.pathname;
    const homePath = new URL("../home/home.html", location.href).pathname;
    const tabsKey = "app-route-tabs";
    const defaultTab = { path: currentPath, title, closable: currentPath === homePath ? false : true };
    let tabs = JSON.parse(sessionStorage.getItem(tabsKey) || "[]");
    tabs = tabs.filter((item) => item && item.path);
    const homeTab = tabs.find((item) => item.path === homePath) || { path: homePath, title: "工作台", closable: false };
    homeTab.title = "工作台";
    homeTab.closable = false;
    tabs = [homeTab, ...tabs.filter((item) => item.path !== homePath)];
    if (!tabs.some((item) => item.path === currentPath)) tabs.push(defaultTab);
    tabs = tabs.map((item) => ({ ...item, closable: item.path === homePath ? false : true }));
    sessionStorage.setItem(tabsKey, JSON.stringify(tabs));

    const list = target.querySelector("[data-tabs-list]");
    const viewport = target.querySelector("[data-tabs-viewport]");
    function renderTabs() {
      list.innerHTML = tabs.map((item) => `
        <div class="route-tab ${item.path === currentPath ? "active" : ""}" data-tab-path="${item.path}">
          <button class="route-tab-label" type="button">${item.title}</button>
          ${item.closable !== false ? `<button class="route-tab-close" type="button" aria-label="关闭${item.title}" data-tab-close="${item.path}">×</button>` : ""}
        </div>
      `).join("");
      const overflow = viewport.scrollWidth > viewport.clientWidth + 1;
      target.querySelector("[data-tabs-prev]").classList.toggle("visible", overflow);
      target.querySelector("[data-tabs-next]").classList.toggle("visible", overflow);
      const active = list.querySelector(".route-tab.active");
      active?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    renderTabs();
    list.addEventListener("click", (event) => {
      const close = event.target.closest("[data-tab-close]");
      if (close) {
        event.stopPropagation();
        const index = tabs.findIndex((item) => item.path === close.dataset.tabClose);
        if (index < 0 || tabs[index].closable === false) return;
        const wasActive = tabs[index].path === currentPath;
        tabs.splice(index, 1);
        sessionStorage.setItem(tabsKey, JSON.stringify(tabs));
        if (wasActive) location.href = tabs[Math.max(0, index - 1)]?.path || tabs[0]?.path || currentPath;
        else renderTabs();
        return;
      }
      const tab = event.target.closest("[data-tab-path]");
      if (tab && tab.dataset.tabPath !== currentPath) location.href = tab.dataset.tabPath;
    });
    target.querySelector("[data-tabs-prev]").addEventListener("click", () => viewport.scrollBy({ left: -180, behavior: "smooth" }));
    target.querySelector("[data-tabs-next]").addEventListener("click", () => viewport.scrollBy({ left: 180, behavior: "smooth" }));

    const themeToggle = target.querySelector("[data-theme-toggle]");
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme || "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      const nextDark = next === "dark";
      themeToggle.title = nextDark ? "切换浅色模式" : "切换夜间模式";
      themeToggle.setAttribute("aria-label", themeToggle.title);
      themeToggle.innerHTML = `<i class="fa-regular ${nextDark ? "fa-sun" : "fa-moon"}" aria-hidden="true"></i>`;
    });

    const sidebarToggle = target.querySelector("[data-sidebar-toggle]");
    sidebarToggle.addEventListener("click", () => {
      const nextCollapsed = document.documentElement.dataset.sidebar !== "collapsed";
      applySidebar(nextCollapsed);
      sidebarToggle.title = nextCollapsed ? "展开侧边栏" : "收缩侧边栏";
      sidebarToggle.setAttribute("aria-label", sidebarToggle.title);
      sidebarToggle.innerHTML = `<i class="fa-solid ${nextCollapsed ? "fa-menu-unfold" : "fa-menu-fold"}" aria-hidden="true"></i>`;
    });

    const userMenu = target.querySelector(".user-menu");
    const userTrigger = target.querySelector(".user-trigger");
    userTrigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = userMenu.classList.toggle("open");
      userTrigger.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("click", () => {
      userMenu.classList.remove("open");
      userTrigger.setAttribute("aria-expanded", "false");
    });
  }

  document.addEventListener("DOMContentLoaded", mountHeader);
})();
