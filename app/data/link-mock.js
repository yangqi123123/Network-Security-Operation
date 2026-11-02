(function () {
  const STORAGE_KEY = "linkStatus.globalThresholds";
  const LINKS_KEY = "linkStatus.linksOverride";

  const DEFAULT_THRESHOLDS = {
    utilWarn: 60,
    utilCritical: 85,
    trafficWarn: 500,
    trafficCritical: 800,
  };

  const LEVEL_RANK = { normal: 0, warn: 1, critical: 2 };
  const LEVEL_META = {
    normal: { label: "正常", color: "#14C9BA" },
    warn: { label: "告警", color: "#F7BA1E" },
    critical: { label: "严重", color: "#F53F57" },
  };

  function levelOf(value, warn, critical) {
    if (value >= critical) return "critical";
    if (value >= warn) return "warn";
    return "normal";
  }

  function worse(a, b) {
    return LEVEL_RANK[a] >= LEVEL_RANK[b] ? a : b;
  }

  function resolveThresholds(link, globalThresholds) {
    return link && link.thresholds ? { ...globalThresholds, ...link.thresholds } : { ...globalThresholds };
  }

  function evaluateLinkLevel(link, globalThresholds) {
    const t = resolveThresholds(link, globalThresholds);
    const utilLevel = levelOf(Number(link.utilPercent) || 0, t.utilWarn, t.utilCritical);
    const trafficLevel = levelOf(Number(link.totalTrafficMbps) || 0, t.trafficWarn, t.trafficCritical);
    const level = worse(utilLevel, trafficLevel);
    return { level, ...LEVEL_META[level], thresholds: t };
  }

  function loadGlobalThresholds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_THRESHOLDS };
      return { ...DEFAULT_THRESHOLDS, ...JSON.parse(raw) };
    } catch (_) {
      return { ...DEFAULT_THRESHOLDS };
    }
  }

  function saveGlobalThresholds(thresholds) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(thresholds));
  }

  function makeSeries(seed, base, amplitude, decimals) {
    const times = [];
    const values = [];
    const now = Date.now();
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(now - i * 5 * 60 * 1000);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      times.push(`${hh}:${mm}:${ss}`);
      const wave = Math.sin((seed + i) * 0.7) * amplitude;
      const noise = ((seed * 17 + i * 13) % 10) / 10 * amplitude * 0.2;
      const v = Math.max(0, base + wave + noise);
      values.push(Number(v.toFixed(decimals)));
    }
    return { times, values };
  }

  function buildSeries(seed) {
    return {
      loss: makeSeries(seed, 0.05, 0.08, 2),
      utilIn: makeSeries(seed + 1, 0.2, 0.15, 2),
      bwIn: makeSeries(seed + 2, 50, 40, 2),
      trafficIn: makeSeries(seed + 3, 2.5, 1.5, 2),
      bwInOut: makeSeries(seed + 4, 400, 180, 2),
      trafficInOut: makeSeries(seed + 5, 18, 10, 2),
    };
  }

  const SEED_LINKS = [
    {
      id: "L001",
      name: "办公网-研发AP链路",
      type: "接入链路",
      remark: "研发办公室主链路",
      locked: true,
      description: "办公网核心至研发办公室AP",
      bandwidthMbps: 1000,
      source: { name: "办公网核心交换机", ip: "192.168.1.2", port: "GigabitEthernet0/0/1" },
      target: { name: "研发办公室AP", ip: "192.168.1.254", port: "GigabitEthernet0/0/24" },
      viaDevices: "无",
      realtimeBandwidthKbps: 530.84,
      utilPercent: 0.1,
      totalTrafficMbps: 21.35,
      collectedAt: "2026-01-13 16:15:50",
      series: null,
    },
    {
      id: "L002",
      name: "核心-汇聚互联",
      type: "核心链路",
      remark: "东区核心",
      locked: false,
      description: "核心至汇聚主通道",
      bandwidthMbps: 10000,
      source: { name: "核心交换机-A", ip: "10.0.0.1", port: "100GE1/0/1" },
      target: { name: "汇聚交换机-B", ip: "10.0.0.2", port: "100GE1/0/2" },
      viaDevices: "无",
      realtimeBandwidthKbps: 820000,
      utilPercent: 72,
      totalTrafficMbps: 620,
      collectedAt: "2026-01-13 16:15:50",
      series: null,
    },
    {
      id: "L003",
      name: "机房专线出口",
      type: "专线",
      remark: "运营商A",
      locked: false,
      description: "机房上联运营商",
      bandwidthMbps: 1000,
      source: { name: "出口防火墙", ip: "10.1.1.1", port: "GE0/0/1" },
      target: { name: "运营商PE", ip: "10.1.1.2", port: "GE1/0/1" },
      viaDevices: "无",
      realtimeBandwidthKbps: 950000,
      utilPercent: 92,
      totalTrafficMbps: 910,
      collectedAt: "2026-01-13 16:15:50",
      series: null,
    },
    {
      id: "L004",
      name: "教学楼接入",
      type: "接入链路",
      remark: "一号教学楼",
      locked: false,
      description: "",
      bandwidthMbps: 1000,
      source: { name: "汇聚-教学", ip: "10.2.0.1", port: "GE0/0/8" },
      target: { name: "接入-教学1", ip: "10.2.0.11", port: "GE0/0/1" },
      viaDevices: "无",
      realtimeBandwidthKbps: 12000,
      utilPercent: 18,
      totalTrafficMbps: 45,
      collectedAt: "2026-01-13 16:15:50",
      series: null,
    },
    {
      id: "L005",
      name: "校区间互联",
      type: "互联链路",
      remark: "南北校区",
      locked: true,
      description: "南北校区波分互联",
      bandwidthMbps: 10000,
      source: { name: "南校核心", ip: "10.3.0.1", port: "100GE1/0/3" },
      target: { name: "北校核心", ip: "10.4.0.1", port: "100GE1/0/3" },
      viaDevices: "波分设备-1",
      realtimeBandwidthKbps: 510000,
      utilPercent: 55,
      totalTrafficMbps: 480,
      collectedAt: "2026-01-13 16:15:50",
      series: null,
    },
    {
      id: "L006",
      name: "图书馆接入",
      type: "接入链路",
      remark: "",
      locked: false,
      description: "无",
      bandwidthMbps: 1000,
      source: { name: "汇聚-图情", ip: "10.5.0.1", port: "GE0/0/3" },
      target: { name: "图书馆交换机", ip: "10.5.0.20", port: "GE0/0/1" },
      viaDevices: "无",
      realtimeBandwidthKbps: 8800,
      utilPercent: 12,
      totalTrafficMbps: 30,
      collectedAt: "2026-01-13 16:15:50",
      series: null,
    },
    {
      id: "L007",
      name: "数据中心互联",
      type: "互联链路",
      remark: "DC-A 至 DC-B",
      locked: false,
      description: "双活机房互联",
      bandwidthMbps: 40000,
      source: { name: "DC-A 核心", ip: "10.8.0.1", port: "100GE1/0/5" },
      target: { name: "DC-B 核心", ip: "10.9.0.1", port: "100GE1/0/5" },
      viaDevices: "无",
      realtimeBandwidthKbps: 2100000,
      utilPercent: 68,
      totalTrafficMbps: 760,
      collectedAt: "2026-01-13 16:15:50",
      series: null,
    },
    {
      id: "L008",
      name: "宿舍区上联",
      type: "核心链路",
      remark: "学生宿舍",
      locked: false,
      description: "",
      bandwidthMbps: 10000,
      source: { name: "宿舍汇聚", ip: "10.6.0.1", port: "40GE1/0/1" },
      target: { name: "校园核心", ip: "10.0.0.1", port: "40GE1/0/8" },
      viaDevices: "无",
      realtimeBandwidthKbps: 7800000,
      utilPercent: 88,
      totalTrafficMbps: 850,
      collectedAt: "2026-01-13 16:15:50",
      series: null,
    },
    {
      id: "L009",
      name: "安防专线",
      type: "专线",
      remark: "视频专网",
      locked: false,
      description: "安防监控上联",
      bandwidthMbps: 1000,
      source: { name: "安防汇聚", ip: "10.7.0.1", port: "GE0/0/2" },
      target: { name: "监控中心", ip: "10.7.0.10", port: "GE0/0/1" },
      viaDevices: "无",
      realtimeBandwidthKbps: 420000,
      utilPercent: 65,
      totalTrafficMbps: 510,
      collectedAt: "2026-01-13 16:15:50",
      series: null,
    },
    {
      id: "L010",
      name: "行政楼接入",
      type: "接入链路",
      remark: "行政办公",
      locked: false,
      description: "无",
      bandwidthMbps: 1000,
      source: { name: "行政汇聚", ip: "10.10.0.1", port: "GE0/0/4" },
      target: { name: "行政接入", ip: "10.10.0.15", port: "GE0/0/1" },
      viaDevices: "无",
      realtimeBandwidthKbps: 5600,
      utilPercent: 8,
      totalTrafficMbps: 22,
      collectedAt: "2026-01-13 16:15:50",
      series: null,
    },
  ];

  function cloneSeed() {
    return SEED_LINKS.map((link, index) => ({
      ...link,
      source: { ...link.source },
      target: { ...link.target },
      thresholds: link.thresholds ? { ...link.thresholds } : undefined,
      series: buildSeries(index + 1),
    }));
  }

  function loadLinks() {
    const base = cloneSeed();
    try {
      const raw = localStorage.getItem(LINKS_KEY);
      if (!raw) return base;
      const overrides = JSON.parse(raw);
      if (!Array.isArray(overrides)) return base;
      const map = new Map(overrides.map((item) => [item.id, item]));
      return base.map((link) => {
        const ov = map.get(link.id);
        if (!ov) return link;
        return {
          ...link,
          ...ov,
          source: { ...link.source, ...(ov.source || {}) },
          target: { ...link.target, ...(ov.target || {}) },
          series: link.series,
        };
      }).concat(overrides.filter((item) => !base.some((b) => b.id === item.id)).map((item, i) => ({
        ...item,
        series: item.series || buildSeries(100 + i),
      })));
    } catch (_) {
      return base;
    }
  }

  function persistLinks(links) {
    const slim = links.map(({ series, ...rest }) => rest);
    localStorage.setItem(LINKS_KEY, JSON.stringify(slim));
  }

  function getLinkById(id) {
    return loadLinks().find((link) => String(link.id) === String(id)) || null;
  }

  function formatBandwidth(kbps) {
    if (kbps >= 1000) return `${(kbps / 1000).toFixed(2)}Mb/s`;
    return `${Number(kbps).toFixed(2)}Kb/s`;
  }

  window.LinkStatusStore = {
    DEFAULT_THRESHOLDS,
    LEVEL_META,
    loadGlobalThresholds,
    saveGlobalThresholds,
    evaluateLinkLevel,
    resolveThresholds,
    loadLinks,
    persistLinks,
    getLinkById,
    buildSeries,
    formatBandwidth,
    TYPES: ["核心链路", "接入链路", "互联链路", "专线"],
  };
})();
