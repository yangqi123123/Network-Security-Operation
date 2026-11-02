(function () {
  const ICON_CLASS = {
    switch: "fa-solid fa-network-wired",
    ap: "fa-solid fa-wifi",
    camera: "fa-solid fa-video",
    firewall: "fa-solid fa-shield-halved",
    server: "fa-solid fa-server",
  };

  /* 工作台曲线主色（home.html #5B83FF / #135AFA） */
  const CHART_LINE = "#5B83FF";
  const CHART_LABEL = "#135AFA";

  const LINK_TYPES = ["核心链路", "接入链路", "互联链路", "专线"];
  const THRESHOLD_KEY = "linkMonitor.globalThresholds";
  const DEFAULT_THRESHOLDS = {
    utilWarn: 60,
    utilCritical: 85,
    trafficWarn: 500,
    trafficCritical: 800,
  };
  const LEVEL_RANK = { normal: 0, warn: 1, down: 2 };
  const LEVEL_META = {
    normal: { label: "正常", color: "#16a34a" },
    warn: { label: "告警", color: "#f59e0b" },
    down: { label: "严重", color: "#dc2626" },
  };

  function loadGlobalThresholds() {
    try {
      const raw = localStorage.getItem(THRESHOLD_KEY);
      if (!raw) return { ...DEFAULT_THRESHOLDS };
      return { ...DEFAULT_THRESHOLDS, ...JSON.parse(raw) };
    } catch (_) {
      return { ...DEFAULT_THRESHOLDS };
    }
  }

  function saveGlobalThresholds(thresholds) {
    localStorage.setItem(THRESHOLD_KEY, JSON.stringify(thresholds));
  }

  function resolveThresholds(link, globalThresholds) {
    const base = globalThresholds || loadGlobalThresholds();
    return link?.thresholds ? { ...base, ...link.thresholds } : { ...base };
  }

  function levelOf(value, warn, critical) {
    if (value >= critical) return "down";
    if (value >= warn) return "warn";
    return "normal";
  }

  function worse(a, b) {
    return LEVEL_RANK[a] >= LEVEL_RANK[b] ? a : b;
  }

  /** 按总流量 + 带宽利用率阈值判定链路颜色档；有告警时保留严重态演示 */
  function evaluateLinkStatus(link, globalThresholds) {
    if (link?.source?.alarm) {
      return { level: "down", ...LEVEL_META.down, reason: "存在重要告警" };
    }
    const t = resolveThresholds(link, globalThresholds || loadGlobalThresholds());
    const util =
      link.utilPercent != null
        ? Number(link.utilPercent)
        : Math.max(Number(link.utilIn) || 0, Number(link.utilOut) || 0);
    const traffic = Number(link.totalTrafficMbps) || 0;
    const utilLevel = levelOf(util, t.utilWarn, t.utilCritical);
    const trafficLevel = levelOf(traffic, t.trafficWarn, t.trafficCritical);
    const level = worse(utilLevel, trafficLevel);
    return {
      level,
      ...LEVEL_META[level],
      util,
      traffic,
      thresholds: t,
    };
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatNow(d = new Date()) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function buildTimes(endH, endM, endS, count, stepSec) {
    const times = [];
    let total = endH * 3600 + endM * 60 + endS;
    for (let i = count - 1; i >= 0; i -= 1) {
      const t = total - i * stepSec;
      const h = Math.floor(t / 3600) % 24;
      const m = Math.floor((t % 3600) / 60);
      const s = t % 60;
      times.push(`${pad(h)}:${pad(m)}:${pad(s)}`);
    }
    return times;
  }

  function seriesFromValues(times, values) {
    return times.map((time, i) => ({ time, in: values[i], out: undefined }));
  }

  /** 监控页截图对齐的 6 组数据 */
  function buildMonitorMetrics() {
    const times = buildTimes(16, 15, 47, 12, 300);
    const defs = [
      {
        code: "loss",
        title: "网口丢包率监控",
        unit: "%",
        currentValue: 0,
        values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        markValues: [],
      },
      {
        code: "utilIn",
        title: "网口输入带宽利用率",
        unit: "%",
        currentValue: 0.1,
        values: [0.08, 0.09, 0.1, 0.1, 0.09, 0.1, 0.11, 0.1, 0.1, 0.09, 0.1, 0.1],
        markValues: [],
      },
      {
        code: "bwIn",
        title: "网口输入带宽监控",
        unit: "kb/s",
        currentValue: 72.24,
        values: [38, 52, 71, 88, 76, 61, 48, 55, 69, 84, 78, 72.24],
        markValues: [96.29, 82.56],
      },
      {
        code: "trafficIn",
        title: "网口输入流量监控",
        unit: "MB",
        currentValue: 3.46,
        values: [1.2, 2.1, 3.4, 4.7, 4.1, 3.2, 2.4, 2.8, 3.6, 4.2, 3.9, 3.46],
        markValues: [4.7, 0.82],
      },
      {
        code: "bwIO",
        title: "网口输入输出带宽监控",
        unit: "kb/s",
        currentValue: 530.84,
        values: [420, 510, 620, 690, 650, 580, 520, 560, 640, 610, 570, 530.84],
        markValues: [],
      },
      {
        code: "trafficIO",
        title: "网口输入输出流量监控",
        unit: "MB",
        currentValue: 21.35,
        values: [12, 16, 22, 28, 32.56, 29, 24, 21, 26, 30, 25, 21.35],
        markValues: [32.56, 2.58],
      },
    ];
    return defs.map((d) => ({
      code: d.code,
      title: d.title,
      unit: d.unit,
      dual: false,
      scope: "source",
      currentValue: d.currentValue,
      series: seriesFromValues(times, d.values),
      markValues: d.markValues || [],
    }));
  }

  function makeHourSeries(seed, base, amp) {
    const times = [];
    const values = [];
    const now = Date.now();
    for (let i = 0; i < 12; i += 1) {
      const t = new Date(now - (11 - i) * 5 * 60 * 1000);
      times.push(`${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`);
      const wave = Math.sin((seed + i) * 0.55) * amp;
      const noise = ((seed * 11 + i * 7) % 9) / 9 * amp * 0.25;
      values.push(Number(Math.max(0, base + wave + noise).toFixed(2)));
    }
    return seriesFromValues(times, values);
  }

  function buildGenericMetrics(seed, scope) {
    const defs = [
      { code: "loss", title: "网口丢包率监控", unit: "%", base: 0, amp: 0.02 },
      { code: "utilIn", title: "网口输入带宽利用率", unit: "%", base: 0.2, amp: 0.1 },
      { code: "bwIn", title: "网口输入带宽监控", unit: "kb/s", base: 60, amp: 30 },
      { code: "trafficIn", title: "网口输入流量监控", unit: "MB", base: 3, amp: 1.5 },
      { code: "bwIO", title: "网口输入输出带宽监控", unit: "kb/s", base: 400, amp: 160 },
      { code: "trafficIO", title: "网口输入输出流量监控", unit: "MB", base: 18, amp: 10 },
    ];
    return defs.map((d, idx) => {
      const series = makeHourSeries(seed + idx * 3, d.base, d.amp);
      return {
        code: d.code,
        title: d.title,
        unit: d.unit,
        dual: false,
        scope,
        currentValue: series[series.length - 1].in,
        series,
        markValues: [],
      };
    });
  }

  const LINKS = {
    L001: {
      id: "L001",
      name: "test",
      type: "专线",
      remark: "视频监控上联",
      bandwidth: "1000 Mbps",
      viaDevices: [],
      locked: true,
      desc: "无",
      utilIn: 0.16,
      utilOut: 0.34,
      utilPercent: 92,
      totalTrafficMbps: 910,
      status: "down",
      realtimeBw: null,
      realtimeIn: 1.59,
      realtimeOut: 3.37,
      collectedAt: "2026-03-27 14:04:54",
      timeStart: "2026-03-27 13:04:55",
      timeEnd: "2026-03-27 14:04:55",
      infoLayout: "detail",
      source: {
        role: "source",
        deviceName: "xxx核心交换机",
        ip: "192.168.1.10",
        ifName: "GigabitEthernet0/0/4",
        slotNo: "0",
        ifNo: "8",
        moduleNo: "无",
        iconType: "switch",
        nodeStatus: "down",
        alarm: {
          time: "2026-02-28 11:23:39",
          scope: "网络接口",
          device: "xxx核心交换机",
          content: "网络接口(GigabitEthernet0/0/4)因触发链路时延(3000ms)发生严重告警:Ping延迟过高",
          level: "critical",
        },
      },
      target: {
        role: "target",
        deviceName: "监控摄像头",
        ip: "192.168.1.20",
        ifName: "",
        slotNo: "无",
        ifNo: "无",
        moduleNo: "无",
        iconType: "camera",
        nodeStatus: "normal",
        alarm: null,
      },
    },
    L002: {
      id: "L002",
      name: "",
      type: "接入链路",
      remark: "研发办公室主链路",
      bandwidth: "1000 Mbps",
      viaDevices: [],
      locked: true,
      desc: "无",
      utilIn: null,
      utilOut: null,
      utilPercent: 72,
      totalTrafficMbps: 620,
      status: "warn",
      realtimeBw: 530.84,
      realtimeIn: null,
      realtimeOut: null,
      collectedAt: "2026-01-13 16:15:50",
      timeStart: "2026-01-13 15:15:50",
      timeEnd: "2026-01-13 16:15:50",
      infoLayout: "monitor",
      source: {
        role: "source",
        deviceName: "办公网核心交换机",
        ip: "192.168.1.2",
        ifName: "GigabitEthernet0/0/1",
        slotNo: "无",
        ifNo: "无",
        moduleNo: "无",
        iconType: "switch",
        nodeStatus: "down",
        alarm: null,
      },
      target: {
        role: "target",
        deviceName: "研发办公室AP",
        ip: "192.168.1.254",
        ifName: "",
        slotNo: "无",
        ifNo: "无",
        moduleNo: "无",
        iconType: "ap",
        nodeStatus: "normal",
        alarm: null,
      },
    },
  };

  function hydrate(link) {
    const copy = JSON.parse(JSON.stringify(link));
    if (copy.id === "L002") {
      copy.sourceMetrics = buildMonitorMetrics();
    } else {
      copy.sourceMetrics = buildGenericMetrics(7, "source");
    }
    copy.targetMetrics = copy.target?.ifName ? buildGenericMetrics(17, "target") : [];
    const evaluated = evaluateLinkStatus(copy);
    copy.status = evaluated.level;
    copy.statusMeta = evaluated;
    return copy;
  }

  function getLink(id) {
    const key = id && LINKS[id] ? id : "L002";
    return hydrate(LINKS[key] || LINKS.L002);
  }

  function applyStatus(link) {
    const evaluated = evaluateLinkStatus(link);
    link.status = evaluated.level;
    link.statusMeta = evaluated;
    return evaluated;
  }

  function nodeTone(endpoint, linkStatus) {
    if (endpoint?.alarm) return "down";
    if (endpoint?.nodeStatus && linkStatus === "down" && endpoint.role === "source") return "down";
    if (endpoint?.role === "target" && !endpoint.alarm) return "normal";
    if (endpoint?.nodeStatus === "down" && linkStatus !== "normal") return "down";
    return linkStatus || endpoint?.nodeStatus || "normal";
  }

  function renderToolbar(container) {
    // 采集时间工具条已按需求移除
    if (container) container.innerHTML = "";
  }

  function renderLinkStrip(container, link) {
    if (!container || !link) return;
    const meta = link.statusMeta || applyStatus(link);
    const lineTone = meta.level === "down" ? "down" : meta.level === "warn" ? "warn" : "normal";
    const srcTone = nodeTone(link.source, meta.level);
    const dstTone = nodeTone(link.target, meta.level);
    const srcIcon = ICON_CLASS[link.source.iconType] || ICON_CLASS.switch;
    const dstIcon = ICON_CLASS[link.target.iconType] || ICON_CLASS.ap;
    const showAlarmSrc = !!link.source.alarm;

    const bubble =
      meta.level === "down" && link.realtimeIn != null
        ? `<div class="lm-bw-bubble fault"><div>实时输入带宽：${link.realtimeIn}Mb/s</div><div>实时输出带宽：${link.realtimeOut}Mb/s</div></div>`
        : `<div class="lm-bw-bubble">实时带宽：${link.realtimeBw != null ? link.realtimeBw : "—"}Kb/s</div>`;

    const ifMark =
      srcTone === "down"
        ? `<span class="lm-if-mark down" title="告警"><i class="fa-solid fa-exclamation"></i></span>`
        : meta.level === "warn"
          ? `<span class="lm-if-mark warn" title="关注"></span>`
          : `<span class="lm-if-mark normal" title="正常"></span>`;
    const leftIf = link.source.ifName
      ? `<div class="lm-line-if"><span>${link.source.ifName}</span>${ifMark}</div>`
      : "";
    const flowDots =
      meta.level === "down"
        ? `<span class="lm-flow-dot"></span><span class="lm-flow-dot d2"></span>`
        : "";

    container.innerHTML = `
      <div class="lm-strip-panel">
        <div class="lm-strip">
          <div class="lm-node">
            <div class="lm-node-icon ${srcTone}">
              <i class="${srcIcon}"></i>
              ${showAlarmSrc ? '<span class="lm-alarm-badge"><i class="fa-solid fa-exclamation"></i></span>' : ""}
            </div>
            <div class="lm-node-name">${link.source.deviceName}</div>
            <div class="lm-node-ip">${link.source.ip}</div>
          </div>
          <div class="lm-line-wrap">
            ${leftIf}
            <div class="lm-line ${lineTone}">${flowDots}</div>
            ${bubble}
          </div>
          <div class="lm-node">
            <div class="lm-node-icon ${dstTone}">
              <i class="${dstIcon}"></i>
            </div>
            <div class="lm-node-name">${link.target.deviceName}</div>
            <div class="lm-node-ip">${link.target.ip}</div>
          </div>
        </div>
      </div>
    `;
  }

  function fieldHtml(label, valueHtml) {
    return `
      <div class="lm-desc-item">
        <span class="lm-desc-label">${label}</span>
        <span class="lm-desc-value">${valueHtml}</span>
      </div>`;
  }

  function renderLinkInfo(container, link, { onEditLink, onToggleLock, onThresholds } = {}) {
    if (!container) return;
    const via = !link.viaDevices || link.viaDevices.length === 0 ? "无" : link.viaDevices.join("、");
    const util =
      link.utilIn == null && link.utilOut == null
        ? `<span class="lm-util-unknown">未知</span>`
        : `<span class="lm-util"><span class="down">▼ ${Number(link.utilIn).toFixed(2)}%</span><span class="sep">;</span><span class="up">▲ ${Number(link.utilOut).toFixed(2)}%</span></span>`;
    const meta = link.statusMeta || applyStatus(link);
    const th = meta.thresholds || resolveThresholds(link, loadGlobalThresholds());

    const lock = `
      <label class="lm-switch ${link.locked ? "on" : ""}">
        <input type="checkbox" data-lm-lock ${link.locked ? "checked" : ""}>
        <span class="lm-switch-ui"></span>
      </label>`;

    const typeHtml = `${link.type || "未标注"}`;
    const remarkHtml = `${link.remark || "无"}`;
    const trafficHtml = `${link.totalTrafficMbps != null ? link.totalTrafficMbps : "—"} Mbps`;
    const ruleText = `利用率告警 ${th.utilWarn}% / 严重 ${th.utilCritical}%；总流量告警 ${th.trafficWarn} / 严重 ${th.trafficCritical} Mbps（两项取更差）${link.thresholds ? " · 本链路已覆盖全局" : ""}`;
    const colorHtml = `<i class="lm-status-dot ${meta.level}"></i>${meta.label}<span class="lm-color-rule">颜色规则：${ruleText}</span>`;

    const isDetail = link.infoLayout === "detail";
    const body = isDetail
      ? `
        <div class="lm-desc-grid cols-3">
          ${fieldHtml("链路名称", link.name || "无")}
          ${fieldHtml("链路类型", typeHtml)}
          ${fieldHtml("备注信息", remarkHtml)}
          ${fieldHtml("链路描述", link.desc || "无")}
          ${fieldHtml("链路带宽", link.bandwidth)}
          <div class="lm-desc-item"><span class="lm-desc-label">带宽利用率</span><span class="lm-desc-value">${util}</span></div>
          ${fieldHtml("总流量", trafficHtml)}
          ${fieldHtml("途经设备", via)}
          <div class="lm-desc-item"><span class="lm-desc-label">链路锁定</span><span class="lm-desc-value">${lock}</span></div>
          <div class="lm-desc-item lm-desc-item-wide"><span class="lm-desc-label">链路颜色</span><span class="lm-desc-value">${colorHtml}</span></div>
        </div>`
      : `
        <div class="lm-desc-grid cols-4">
          ${fieldHtml("链路名称", link.name ? link.name : "—")}
          ${fieldHtml("链路类型", typeHtml)}
          ${fieldHtml("备注信息", remarkHtml)}
          ${fieldHtml("链路带宽", link.bandwidth)}
          ${fieldHtml("途经设备", via)}
          <div class="lm-desc-item"><span class="lm-desc-label">链路锁定</span><span class="lm-desc-value">${lock}</span></div>
          ${fieldHtml("链路描述", link.desc || "无")}
          <div class="lm-desc-item"><span class="lm-desc-label">带宽利用率</span><span class="lm-desc-value">${util}</span></div>
          ${fieldHtml("总流量", trafficHtml)}
          <div class="lm-desc-item lm-desc-item-wide"><span class="lm-desc-label">链路颜色</span><span class="lm-desc-value">${colorHtml}</span></div>
        </div>`;

    container.innerHTML = `
      <div class="lm-info-card">
        <div class="lm-info-head">
          <h2>链路信息</h2>
          <div class="lm-info-actions">
            <div class="lm-time-range-box">
              <i class="fa-regular fa-calendar"></i>
              <input class="lm-time-range" type="text" value="${link.timeStart} - ${link.timeEnd}" readonly>
            </div>
            <button type="button" class="btn btn-secondary" data-lm-edit-link>链路编辑</button>
            <button type="button" class="btn btn-secondary" data-lm-thresholds>指标设置</button>
          </div>
        </div>
        ${body}
      </div>
    `;

    container.querySelector("[data-lm-lock]")?.addEventListener("change", (e) => onToggleLock?.(e.target.checked));
    container.querySelector("[data-lm-edit-link]")?.addEventListener("click", () => onEditLink?.());
    container.querySelector("[data-lm-thresholds]")?.addEventListener("click", () => onThresholds?.());
  }

  function formatCurrent(metric) {
    if (metric.unit === "%") return `${metric.currentValue}%`;
    if (metric.unit === "kb/s") return `${metric.currentValue}Kb/s`;
    if (metric.unit === "MB") return `${metric.currentValue}MB`;
    return String(metric.currentValue);
  }

  /** 复用工作台「平台运行概览」：#5B83FF 线宽3 + 浅蓝渐变面积 + 峰值圆点标注 */
  function chartOption(metric) {
    const times = metric.series.map((p) => p.time);
    const data = metric.series.map((p) => p.in);
    const allZero = data.every((v) => Number(v) === 0);
    const flatNearZero = !allZero && data.every((v) => Number(v) <= 0.2);
    let yMax;
    if (allZero || flatNearZero) yMax = 1;
    else if (metric.unit === "kb/s" && metric.code === "bwIn") yMax = 100;
    else if (metric.unit === "MB" && metric.code === "trafficIn") yMax = 5;
    else if (metric.unit === "kb/s" && metric.code === "bwIO") yMax = 700;
    else if (metric.unit === "MB" && metric.code === "trafficIO") yMax = 35;

    const markPoint = allZero || flatNearZero
      ? undefined
      : {
          symbol: "circle",
          symbolSize: 28,
          label: { color: "#fff", fontSize: 9, fontWeight: 600 },
          itemStyle: { color: CHART_LINE, borderColor: "#fff", borderWidth: 2 },
          data: [
            {
              type: "max",
              name: "峰值",
              label: { formatter: ({ value }) => String(value) },
            },
            {
              type: "min",
              name: "谷值",
              itemStyle: { color: "#7AA2FF" },
              label: { formatter: ({ value }) => String(value) },
            },
          ],
        };

    return {
      color: [CHART_LINE],
      grid: { left: 44, right: 16, top: 32, bottom: 28 },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: times,
        boundaryGap: false,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#EDF1F7" } },
        axisLabel: { color: "#86909C", fontSize: 10, interval: 2 },
      },
      yAxis: {
        type: "value",
        name: metric.unit,
        nameGap: 8,
        nameTextStyle: { color: "#86909C", fontSize: 11, padding: [0, 28, 0, 0] },
        min: 0,
        max: yMax,
        splitNumber: allZero || flatNearZero ? 1 : 4,
        axisLabel: { color: "#86909C", fontSize: 10 },
        splitLine: { lineStyle: { color: "#EDF1F7", type: "solid" } },
      },
      series: [
        {
          type: "line",
          data,
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          showSymbol: false,
          lineStyle: { width: 3, color: CHART_LINE },
          itemStyle: { color: CHART_LINE, borderColor: "#fff", borderWidth: 2 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(91,131,255,0.28)" },
                { offset: 1, color: "rgba(91,131,255,0)" },
              ],
            },
          },
          markPoint,
        },
      ],
    };
  }

  function renderMetricCharts(container, metrics, echartsApi, chartBag) {
    if (!container || !echartsApi) return;
    (chartBag || []).forEach((c) => c.dispose?.());
    if (chartBag) chartBag.length = 0;

    container.innerHTML = (metrics || [])
      .map(
        (m, i) => `
      <article class="lm-chart-card card">
        <div class="lm-chart-head">
          <h3>${m.title} <span class="lm-curr-tag">当前: ${formatCurrent(m)}</span></h3>
        </div>
        <div class="lm-chart-el chart" id="lmChart_${m.scope}_${i}"></div>
      </article>`
      )
      .join("");

    metrics.forEach((m, i) => {
      const el = document.getElementById(`lmChart_${m.scope}_${i}`);
      if (!el) return;
      const chart = echartsApi.init(el);
      chart.setOption(chartOption(m));
      chartBag?.push(chart);
    });
  }

  function renderEndpointCard(container, endpoint, title, { onEdit, onMore } = {}) {
    if (!container) return;
    const isSource = title.indexOf("起点") >= 0;
    const fields = [
      { key: "deviceName", label: isSource ? "起点设备" : "终点设备" },
      { key: "ifName", label: isSource ? "起点资源" : "终点资源" },
      { key: "slotNo", label: isSource ? "起点槽口号" : "终点槽口号" },
      { key: "ifNo", label: isSource ? "起点接口号" : "终点接口号" },
      { key: "moduleNo", label: isSource ? "起点模块号" : "终点模块号" },
    ];

    const fieldsHtml = fields
      .map((f) => {
        const raw = endpoint[f.key];
        const val = raw === "" || raw == null ? "无" : raw;
        return `<div class="lm-ep-row">
          <span class="lm-ep-label">${f.label}</span>
          <span class="lm-ep-value">${val}
            <button type="button" class="lm-edit" data-ep-edit="${f.key}"><i class="fa-solid fa-pen"></i></button>
          </span>
        </div>`;
      })
      .join("");

    const alarmHtml = endpoint.alarm
      ? `<div class="lm-alarm-panel">
          <div class="lm-alarm-head"><strong>最新重要告警</strong><button type="button" class="lm-more" data-alarm-more>更多</button></div>
          <div class="lm-alarm-item">
            <span class="lm-alarm-icon"><i class="fa-solid fa-exclamation"></i></span>
            <div>
              <div class="lm-alarm-time">${endpoint.alarm.time}</div>
              <div class="lm-alarm-content">${endpoint.alarm.content}</div>
            </div>
          </div>
        </div>`
      : `<div class="lm-alarm-panel empty">
          <div class="lm-alarm-head"><strong>最新重要告警</strong><button type="button" class="lm-more" data-alarm-more>更多</button></div>
          <div class="lm-empty">
            <svg width="72" height="56" viewBox="0 0 72 56" fill="none" aria-hidden="true">
              <path d="M18 22h36v24H18V22Z" stroke="#C9CDD4" stroke-width="2" fill="#F7F8FA"/>
              <path d="M26 22v-4a10 10 0 0 1 20 0v4" stroke="#C9CDD4" stroke-width="2" stroke-linecap="round"/>
              <path d="M30 34h12" stroke="#E5EAF3" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p>暂无数据</p>
          </div>
        </div>`;

    container.innerHTML = `
      <article class="lm-endpoint-card">
        <div class="lm-ep-title">${title}</div>
        <div class="lm-ep-body">
          <div class="lm-ep-fields">${fieldsHtml}</div>
          ${alarmHtml}
        </div>
      </article>
    `;
    container.querySelectorAll("[data-ep-edit]").forEach((btn) => {
      btn.addEventListener("click", () => onEdit?.(btn.dataset.epEdit));
    });
    container.querySelectorAll("[data-alarm-more]").forEach((btn) => {
      btn.addEventListener("click", () => onMore?.(endpoint.alarm));
    });
  }

  function refreshMetrics(link) {
    if (link.id === "L002") link.sourceMetrics = buildMonitorMetrics();
    else link.sourceMetrics = buildGenericMetrics(Date.now() % 40, "source");
    if (link.target?.ifName) link.targetMetrics = buildGenericMetrics((Date.now() % 40) + 5, "target");
    link.collectedAt = formatNow();
    applyStatus(link);
    return link;
  }

  window.LinkMonitor = {
    CHART_LINE,
    CHART_LABEL,
    LINK_TYPES,
    DEFAULT_THRESHOLDS,
    LEVEL_META,
    getLink,
    getDetailDefault: () => getLink("L001"),
    getMonitorDefault: () => getLink("L002"),
    loadGlobalThresholds,
    saveGlobalThresholds,
    resolveThresholds,
    evaluateLinkStatus,
    applyStatus,
    renderToolbar,
    renderLinkStrip,
    renderLinkInfo,
    renderMetricCharts,
    renderEndpointCard,
    refreshMetrics,
    formatNow,
  };
})();
