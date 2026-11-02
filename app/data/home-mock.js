(function () {
  const PRIORITY_RANK = { 紧急: 0, 高: 1, 中: 2, 低: 3, 告警: 1, 预警: 2, 提醒: 3 };
  const CLOSED_TICKET = "已关闭";
  const OPEN_ALARM = new Set(["未处理", "处理中"]);
  const OPEN_TICKET = new Set(["待派单", "处理中", "待复核", "已转派", "已升级"]);
  const OPEN_DRILL = new Set(["进行中", "复盘中"]);
  const OPEN_CONFIG = new Set(["待整改", "整改中", "待复核"]);
  const HIGH_THREAT = new Set(["严重", "高"]);
  const HIGH_VULN = new Set(["critical", "high"]);
  const MOCK_TODAY = "2026-11-01";

  const NOTICE_SEED = [
    { id: 1, type: "公告", title: "温馨提醒：平台安全运营工作台已升级", status: "正常", publisher: "admin", publishedAt: "2026-11-01 09:00:00", content: "工作台已切换为安全运营混合门户，请关注告警、工单与脆弱资产待办。" },
    { id: 2, type: "通知", title: "本周攻防演练安排通知", status: "正常", publisher: "admin", publishedAt: "2026-10-28 10:02:28", content: "请相关蓝队按时参与勒索重保值守演练。" },
    { id: 3, type: "公告", title: "高危漏洞整改时限提醒", status: "正常", publisher: "admin", publishedAt: "2026-10-27 11:00:00", content: "critical / high 漏洞请于截止日前完成整改并复测。" },
    { id: 4, type: "通知", title: "告警升级策略调整说明", status: "正常", publisher: "admin", publishedAt: "2026-10-20 15:30:00", content: "超时未处理告警将自动升级至运维主管。" },
    { id: 5, type: "通知", title: "已关闭示例（不应展示）", status: "关闭", publisher: "admin", publishedAt: "2026-10-01 08:00:00", content: "关闭公告。" },
  ];

  const QUICK_LINKS = [
    { title: "告警通知", desc: "未处理告警处置", href: "../alarm-center/alarm-info.html", icon: "fa-solid fa-bell", tone: "blue" },
    { title: "安全工单", desc: "派单协同与闭环", href: "../security-ops/ticket.html", icon: "fa-solid fa-ticket", tone: "green" },
    { title: "安全事件分析", desc: "SIEM 事件研判", href: "../threat/siem.html", icon: "fa-solid fa-shield-halved", tone: "blue" },
    { title: "资产台账", desc: "资产全量台账", href: "../asset/ledger.html", icon: "fa-solid fa-database", tone: "blue" },
    { title: "网络拓扑", desc: "全局拓扑全景", href: "../network/topology.html", icon: "fa-solid fa-diagram-project", tone: "green" },
    { title: "脆弱性管理", desc: "漏洞发现与整改", href: "../asset/vuln.html", icon: "fa-solid fa-bug", tone: "blue" },
    { title: "安全态势大屏", desc: "运营态势总览", href: "../security-ops/screen.html", icon: "fa-solid fa-display", tone: "green", target: "_blank" },
    { title: "数据风险态势", desc: "数据安全风险", href: "../data-security/situation.html", icon: "fa-solid fa-chart-pie", tone: "blue" },
  ];

  function safeList(getter, fallback) {
    try {
      const v = typeof getter === "function" ? getter() : getter;
      return Array.isArray(v) ? v : fallback || [];
    } catch (e) {
      return fallback || [];
    }
  }

  function alarms() {
    return safeList(function () {
      return window.FaultAlarm && window.FaultAlarm.alarms;
    }, []);
  }

  function events() {
    return safeList(function () {
      return window.Threat && window.Threat.listEvents && window.Threat.listEvents();
    }, []);
  }

  function vulns() {
    return safeList(function () {
      return window.AssetSecurity && window.AssetSecurity.listVulns && window.AssetSecurity.listVulns();
    }, []);
  }

  function assets() {
    return safeList(function () {
      return window.AssetSecurity && window.AssetSecurity.listAssets && window.AssetSecurity.listAssets();
    }, []);
  }

  function tickets() {
    return safeList(function () {
      return window.SecOps && window.SecOps.listTickets && window.SecOps.listTickets();
    }, []);
  }

  function drills() {
    return safeList(function () {
      return window.SecOps && window.SecOps.listDrills && window.SecOps.listDrills();
    }, []);
  }

  function configs() {
    return safeList(function () {
      return window.SecOps && window.SecOps.listConfigs && window.SecOps.listConfigs();
    }, []);
  }

  function assetName(id) {
    const a = assets().find(function (x) { return String(x.id) === String(id); });
    return (a && (a.name || a.identity)) || id || "-";
  }

  function pct(n, d) {
    if (!d) return 0;
    return Math.round((n / d) * 1000) / 10;
  }

  function getKpis() {
    const al = alarms();
    const openAlarms = al.filter(function (a) { return OPEN_ALARM.has(a.status); });
    const alarmLevel = openAlarms.filter(function (a) { return a.level === "告警"; }).length;

    const ev = events();
    const openHigh = ev.filter(function (e) {
      return HIGH_THREAT.has(e.level) && e.status !== "已关闭";
    });
    const todayNew = openHigh.filter(function (e) {
      return String(e.time || "").indexOf(MOCK_TODAY) === 0;
    }).length;

    const tk = tickets();
    const openTk = tk.filter(function (t) { return t.status !== CLOSED_TICKET; });
    const overdue = openTk.filter(function (t) { return t.overdue; }).length;

    const vl = vulns();
    const highVl = vl.filter(function (v) {
      return HIGH_VULN.has(v.level) && v.stage !== "closed" && v.stage !== "accepted";
    });
    const pendingFix = highVl.filter(function (v) {
      return v.stage !== "fixing" && v.stage !== "closed";
    }).length;

    return [
      { key: "alarm", label: "未处理告警", value: String(openAlarms.length), subHtml: '其中告警级 <strong class="status-danger">' + alarmLevel + "</strong> 条", href: "../alarm-center/alarm-info.html" },
      { key: "threat", label: "高危威胁", value: String(openHigh.length), subHtml: "今日新增 <strong class=\"status-warning\">" + todayNew + "</strong>", href: "../threat/siem.html" },
      { key: "ticket", label: "待办工单", value: String(openTk.length), subHtml: '逾期 <strong class="status-danger">' + overdue + "</strong> 条", href: "../security-ops/ticket.html" },
      { key: "vuln", label: "脆弱资产", value: String(highVl.length), subHtml: "待整改 <strong class=\"status-warning\">" + pendingFix + "</strong>", href: "../asset/vuln.html" },
    ];
  }

  /** 中部图表指标：近 7 日告警趋势 / 工单状态 / 漏洞等级 */
  function getChartPanels() {
    const days = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(2026, 9, 26 + (6 - i)); // 锚定演示周
      days.push(
        d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0")
      );
    }
    // 稳定演示序列（与告警总量量级接近）
    var alarmSeries = [18, 22, 15, 28, 24, 19, Math.max(alarms().length, 12)];
    var threatSeries = [8, 11, 9, 14, 12, 10, Math.max(events().filter(function (e) {
      return HIGH_THREAT.has(e.level) && e.status !== "已关闭";
    }).length, 6)];

    var tk = tickets();
    var ticketBars = ["待派单", "处理中", "待复核", "已关闭"].map(function (st) {
      return { label: st, value: tk.filter(function (t) { return t.status === st; }).length };
    });

    var vl = vulns().filter(function (v) {
      return v.stage !== "closed" && v.stage !== "accepted";
    });
    var vulnBars = [
      { label: "严重", key: "critical", tone: "danger" },
      { label: "高危", key: "high", tone: "danger" },
      { label: "中危", key: "medium", tone: "warning" },
      { label: "低危", key: "low", tone: "success" },
    ].map(function (b) {
      return {
        label: b.label,
        value: vl.filter(function (v) { return v.level === b.key; }).length,
        tone: b.tone,
      };
    });

    return {
      alarmTrend: {
        title: "近 7 日告警与高危威胁",
        labels: days.map(function (x) { return x.slice(5); }),
        series: [
          { name: "告警数", color: "#5B83FF", values: alarmSeries },
          { name: "高危威胁", color: "#F53F57", values: threatSeries },
        ],
      },
      ticketStatus: {
        title: "工单状态分布",
        bars: ticketBars,
      },
      vulnLevel: {
        title: "未关闭漏洞等级",
        bars: vulnBars,
      },
    };
  }

  function getThreatAlarmPanel() {
    const al = alarms().slice().sort(function (a, b) {
      return String(b.time).localeCompare(String(a.time));
    });
    const levels = ["告警", "预警", "提醒"];
    const dist = levels.map(function (lv) {
      return { label: lv, count: al.filter(function (a) { return a.level === lv; }).length };
    });
    const total = dist.reduce(function (s, x) { return s + x.count; }, 0) || 1;
    const latest = al.slice(0, 4).map(function (a) {
      return {
        id: a.id,
        title: a.message || a.type || "-",
        level: a.level,
        tagClass: a.level === "告警" ? "danger" : a.level === "预警" ? "warning" : "",
        time: a.time,
        status: a.status,
        device: a.device,
        system: a.system,
        href: "../alarm-center/alarm-info.html",
        detail: {
          告警内容: a.message || "-",
          级别: a.level,
          状态: a.status,
          设备: a.device || "-",
          系统: a.system || "-",
          时间: a.time || "-",
        },
      };
    });
    return {
      moreHref: "../alarm-center/alarm-info.html",
      distribution: dist.map(function (d) {
        return { label: d.label, count: d.count, percent: pct(d.count, total) };
      }),
      latest: latest,
    };
  }

  function getAssetVulnPanel() {
    const vl = vulns();
    const buckets = [
      { label: "严重/高危", levels: ["critical", "high"], tone: "danger" },
      { label: "中危", levels: ["medium"], tone: "warning" },
      { label: "低危", levels: ["low"], tone: "success" },
    ];
    const open = vl.filter(function (v) { return v.stage !== "closed" && v.stage !== "accepted"; });
    const total = open.length || 1;
    const distribution = buckets.map(function (b) {
      const count = open.filter(function (v) { return b.levels.indexOf(v.level) >= 0; }).length;
      return { label: b.label, count: count, percent: pct(count, total), tone: b.tone };
    });
    const top = open
      .filter(function (v) { return HIGH_VULN.has(v.level); })
      .slice()
      .sort(function (a, b) {
        const ra = HIGH_VULN.has(a.level) ? (a.level === "critical" ? 0 : 1) : 2;
        const rb = HIGH_VULN.has(b.level) ? (b.level === "critical" ? 0 : 1) : 2;
        if (ra !== rb) return ra - rb;
        return String(b.foundAt || "").localeCompare(String(a.foundAt || ""));
      })
      .slice(0, 4)
      .map(function (v) {
        var levelLabel =
          v.level === "critical"
            ? "严重"
            : v.level === "high"
              ? "高危"
              : v.level === "medium"
                ? "中危"
                : v.level === "low"
                  ? "低危"
                  : v.level || "-";
        return {
          id: v.id,
          title: v.title,
          level: levelLabel,
          tagClass: v.level === "critical" || v.level === "high" ? "danger" : v.level === "medium" ? "warning" : "success",
          owner: v.owner || "-",
          asset: assetName(v.assetId),
          stage: v.stage,
          href: "../asset/vuln.html",
          detail: {
            漏洞标题: v.title,
            等级: levelLabel,
            阶段: v.stage,
            资产: assetName(v.assetId),
            责任人: v.owner || "-",
            发现时间: v.foundAt || "-",
            截止时间: v.dueAt || "-",
          },
        };
      });
    return {
      moreHref: "../asset/vuln.html",
      healthRate: pct(open.filter(function (v) { return v.level === "low"; }).length, total),
      distribution: distribution,
      top: top,
    };
  }

  function mapPriority(raw, type) {
    if (type === "alarm") {
      if (raw === "告警") return "高";
      if (raw === "预警") return "中";
      return "低";
    }
    return raw || "中";
  }

  function getMergedTodos() {
    const items = [];

    tickets().forEach(function (t) {
      if (!OPEN_TICKET.has(t.status)) return;
      items.push({
        id: "ticket-" + t.id,
        type: "ticket",
        typeLabel: "工单",
        priority: t.priority || "中",
        overdue: !!t.overdue,
        title: t.title,
        meta: (t.handler || "-") + " · " + (t.createdAt || ""),
        time: t.createdAt || "",
        href: "../security-ops/ticket.html",
        detail: {
          工单号: t.no,
          标题: t.title,
          类型: t.type,
          优先级: t.priority,
          状态: t.status,
          处理人: t.handler || "-",
          关联资产: t.asset || "-",
          创建时间: t.createdAt || "-",
        },
      });
    });

    alarms().forEach(function (a) {
      if (!OPEN_ALARM.has(a.status)) return;
      if (a.level !== "告警") return;
      items.push({
        id: "alarm-" + a.id,
        type: "alarm",
        typeLabel: "告警",
        priority: mapPriority(a.level, "alarm"),
        overdue: !!a.escalated,
        title: a.message || a.type,
        meta: (a.device || "-") + " · " + (a.time || ""),
        time: a.time || "",
        href: "../alarm-center/alarm-info.html",
        detail: {
          告警内容: a.message || "-",
          级别: a.level,
          状态: a.status,
          设备: a.device || "-",
          时间: a.time || "-",
        },
      });
    });

    drills().forEach(function (d) {
      if (!OPEN_DRILL.has(d.status)) return;
      items.push({
        id: "drill-" + d.id,
        type: "drill",
        typeLabel: "演练",
        priority: "高",
        overdue: false,
        title: d.name,
        meta: (d.owner || "-") + " · " + (d.startAt || ""),
        time: d.startAt || "",
        href: "../security-ops/drill.html",
        detail: {
          演练名称: d.name,
          场景: d.scene,
          状态: d.status,
          负责人: d.owner || "-",
          开始时间: d.startAt || "-",
        },
      });
    });

    configs().forEach(function (c) {
      // secops-mock 字段：result / remediate / severity / dept / assetName / baseline / checkedAt
      if (c.result !== "不合规") return;
      if (!OPEN_CONFIG.has(c.remediate)) return;
      items.push({
        id: "config-" + c.id,
        type: "config",
        typeLabel: "配置",
        priority: c.severity === "严重" ? "紧急" : c.severity === "高" ? "高" : "中",
        overdue: false,
        title: (c.assetName || "配置项") + " · " + (c.baseline || "基线偏离"),
        meta: (c.dept || "-") + " · " + (c.checkedAt || ""),
        time: c.checkedAt || "",
        href: "../security-ops/config.html",
        detail: {
          资产: c.assetName || "-",
          基线项: c.baseline || "-",
          检查结果: c.result || "-",
          严重性: c.severity || "-",
          整改状态: c.remediate || "-",
        },
      });
    });

    items.sort(function (a, b) {
      const pa = PRIORITY_RANK[a.priority] != null ? PRIORITY_RANK[a.priority] : 9;
      const pb = PRIORITY_RANK[b.priority] != null ? PRIORITY_RANK[b.priority] : 9;
      if (pa !== pb) return pa - pb;
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      return String(b.time).localeCompare(String(a.time));
    });

    var summary = {
      ticket: items.filter(function (x) { return x.type === "ticket"; }).length,
      alarm: items.filter(function (x) { return x.type === "alarm"; }).length,
      drill: items.filter(function (x) { return x.type === "drill"; }).length,
      config: items.filter(function (x) { return x.type === "config"; }).length,
    };

    return {
      moreHref: "../security-ops/ticket.html",
      items: items.slice(0, 5),
      summary: summary,
    };
  }

  function getQuickLinks() {
    return QUICK_LINKS.slice();
  }

  function getNotices() {
    return NOTICE_SEED.filter(function (n) { return n.status === "正常"; })
      .sort(function (a, b) { return String(b.publishedAt).localeCompare(String(a.publishedAt)); })
      .slice(0, 5);
  }

  function createTicket(payload) {
    if (window.SecOps && typeof window.SecOps.createTicket === "function") {
      return window.SecOps.createTicket(payload || {});
    }
    return null;
  }

  window.HomeWorkbench = {
    getKpis: getKpis,
    getChartPanels: getChartPanels,
    getThreatAlarmPanel: getThreatAlarmPanel,
    getAssetVulnPanel: getAssetVulnPanel,
    getMergedTodos: getMergedTodos,
    getQuickLinks: getQuickLinks,
    getNotices: getNotices,
    createTicket: createTicket,
  };
})();
