(function () {
  const CHART_LINE = "#5B83FF";
  const CHART_LABEL = "#135AFA";
  const DEFAULT_CPU_THRESHOLD = 80;

  const STATUS_META = {
    normal: { key: "normal", label: "正常", tagClass: "success" },
    alert: { key: "alert", label: "告警", tagClass: "danger" },
    offline: { key: "offline", label: "离线", tagClass: "muted" },
  };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatNow(d = new Date()) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function makeTimes(count, stepMin) {
    const times = [];
    const now = Date.now();
    for (let i = count - 1; i >= 0; i -= 1) {
      const d = new Date(now - i * stepMin * 60 * 1000);
      times.push(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
    }
    return times;
  }

  function makeSeries(seed, base, amp, count, decimals) {
    const times = makeTimes(count, count > 20 ? 60 : 5);
    const values = times.map((_, i) => {
      const wave = Math.sin((seed + i) * 0.55) * amp;
      const noise = (((seed * 17 + i * 13) % 10) / 10) * amp * 0.25;
      return Number(clamp(base + wave + noise, 0, base + amp * 2).toFixed(decimals));
    });
    return { times, values };
  }

  function seriesPoints(series) {
    return series.times.map((time, i) => ({ time, in: series.values[i] }));
  }

  function buildHostSeries(seed, cpuBase) {
    return {
      cpu: makeSeries(seed, cpuBase, 12, 24, 1),
      fs: makeSeries(seed + 1, 35 + (seed % 20), 15, 12, 1),
      process: makeSeries(seed + 2, 120 + seed * 3, 40, 12, 0),
      buffer: makeSeries(seed + 3, 40 + (seed % 15), 12, 12, 1),
      queue: makeSeries(seed + 4, 2 + (seed % 4), 3, 12, 1),
      network: makeSeries(seed + 5, 80 + seed * 2, 35, 12, 1),
      load1: makeSeries(seed + 6, 0.8 + (seed % 5) * 0.3, 0.6, 12, 2),
      load5: makeSeries(seed + 7, 0.7 + (seed % 4) * 0.25, 0.45, 12, 2),
      load15: makeSeries(seed + 8, 0.6 + (seed % 3) * 0.2, 0.35, 12, 2),
      cpuUser: makeSeries(seed + 9, 35, 10, 12, 1),
      cpuSystem: makeSeries(seed + 10, 18, 6, 12, 1),
      cpuIowait: makeSeries(seed + 11, 8, 4, 12, 1),
      cpuIdle: makeSeries(seed + 12, 39, 12, 12, 1),
    };
  }

  const SEED = [
    { id: "H001", name: "core-aix-01", os: "AIX", ip: "10.10.1.11", region: "核心机房", online: true, cpuUsage: 42, load1: 0.85, load5: 0.72, load15: 0.61 },
    { id: "H002", name: "core-aix-02", os: "AIX", ip: "10.10.1.12", region: "核心机房", online: true, cpuUsage: 86, load1: 3.2, load5: 2.8, load15: 2.1 },
    { id: "H003", name: "win-ad-01", os: "Windows", ip: "10.10.2.21", region: "办公区", online: true, cpuUsage: 55, load1: 1.1, load5: 0.9, load15: 0.8 },
    { id: "H004", name: "win-file-02", os: "Windows", ip: "10.10.2.22", region: "办公区", online: true, cpuUsage: 91, load1: 4.5, load5: 3.9, load15: 3.2 },
    { id: "H005", name: "linux-web-01", os: "Linux", ip: "10.10.3.31", region: "DMZ", online: true, cpuUsage: 38, load1: 0.6, load5: 0.55, load15: 0.5 },
    { id: "H006", name: "linux-web-02", os: "Linux", ip: "10.10.3.32", region: "DMZ", online: true, cpuUsage: 67, load1: 1.8, load5: 1.5, load15: 1.2 },
    { id: "H007", name: "linux-db-01", os: "Linux", ip: "10.10.4.41", region: "数据中心", online: true, cpuUsage: 73, load1: 2.1, load5: 1.9, load15: 1.7 },
    { id: "H008", name: "linux-db-02", os: "Linux", ip: "10.10.4.42", region: "数据中心", online: false, cpuUsage: 0, load1: 0, load5: 0, load15: 0 },
    { id: "H009", name: "aix-app-03", os: "AIX", ip: "10.10.1.13", region: "核心机房", online: true, cpuUsage: 48, load1: 1.0, load5: 0.88, load15: 0.7 },
    { id: "H010", name: "win-sql-01", os: "Windows", ip: "10.10.2.23", region: "数据中心", online: true, cpuUsage: 82, load1: 2.9, load5: 2.5, load15: 2.2 },
    { id: "H011", name: "linux-cache-01", os: "Linux", ip: "10.10.3.33", region: "DMZ", online: true, cpuUsage: 29, load1: 0.4, load5: 0.35, load15: 0.3 },
    { id: "H012", name: "linux-mq-01", os: "Linux", ip: "10.10.4.43", region: "数据中心", online: true, cpuUsage: 61, load1: 1.4, load5: 1.2, load15: 1.0 },
    { id: "H013", name: "win-iis-03", os: "Windows", ip: "10.10.2.24", region: "办公区", online: true, cpuUsage: 44, load1: 0.95, load5: 0.8, load15: 0.7 },
    { id: "H014", name: "aix-batch-01", os: "AIX", ip: "10.10.1.14", region: "核心机房", online: true, cpuUsage: 88, load1: 3.6, load5: 3.1, load15: 2.7 },
    { id: "H015", name: "linux-log-01", os: "Linux", ip: "10.10.5.51", region: "灾备机房", online: false, cpuUsage: 0, load1: 0, load5: 0, load15: 0 },
    { id: "H016", name: "linux-gw-01", os: "Linux", ip: "10.10.5.52", region: "灾备机房", online: true, cpuUsage: 52, load1: 1.2, load5: 1.0, load15: 0.9 },
  ];

  let hosts = SEED.map((row, index) => {
    const cpuUser = row.online ? clamp(row.cpuUsage * 0.55, 5, 70) : 0;
    const cpuSystem = row.online ? clamp(row.cpuUsage * 0.25, 2, 30) : 0;
    const cpuIowait = row.online ? clamp(row.cpuUsage * 0.12, 0, 20) : 0;
    const cpuIdle = row.online ? clamp(100 - cpuUser - cpuSystem - cpuIowait, 0, 100) : 100;
    return {
      ...row,
      cpuThreshold: DEFAULT_CPU_THRESHOLD,
      cpuUser: Number(cpuUser.toFixed(1)),
      cpuSystem: Number(cpuSystem.toFixed(1)),
      cpuIowait: Number(cpuIowait.toFixed(1)),
      cpuIdle: Number(cpuIdle.toFixed(1)),
      fsUtil: row.online ? 30 + (index % 50) : 0,
      processCount: row.online ? 80 + index * 7 : 0,
      bufferUsed: row.online ? 25 + (index % 40) : 0,
      queueRun: row.online ? 1 + (index % 6) : 0,
      queueBlock: row.online ? index % 3 : 0,
      netThroughput: row.online ? 40 + index * 8 : 0,
      loginUsers: row.online ? 1 + (index % 8) : 0,
      sampledAt: formatNow(),
      series: buildHostSeries(index + 1, row.cpuUsage || 10),
    };
  });

  function getStatus(host) {
    if (!host || host.online === false) return { ...STATUS_META.offline };
    const threshold = host.cpuThreshold != null ? host.cpuThreshold : DEFAULT_CPU_THRESHOLD;
    if (Number(host.cpuUsage) >= threshold) return { ...STATUS_META.alert };
    return { ...STATUS_META.normal };
  }

  function listHosts() {
    return hosts.slice();
  }

  function getHost(id) {
    return hosts.find((h) => h.id === id) || null;
  }

  function bumpSeries(series, nextVal) {
    const values = series.values.slice(1).concat(Number(nextVal));
    const times = makeTimes(values.length, series.times.length > 20 ? 60 : 5);
    return { times, values };
  }

  function refreshHost(host) {
    if (!host) return host;
    if (!host.online) {
      host.sampledAt = formatNow();
      return host;
    }
    const factor = 0.94 + Math.random() * 0.12;
    host.cpuUsage = Number(clamp(host.cpuUsage * factor, 5, 99).toFixed(1));
    host.load1 = Number(clamp(host.load1 * factor, 0.05, 8).toFixed(2));
    host.load5 = Number(clamp(host.load5 * (0.96 + Math.random() * 0.08), 0.05, 8).toFixed(2));
    host.load15 = Number(clamp(host.load15 * (0.97 + Math.random() * 0.06), 0.05, 8).toFixed(2));
    host.cpuUser = Number(clamp(host.cpuUsage * 0.55, 5, 70).toFixed(1));
    host.cpuSystem = Number(clamp(host.cpuUsage * 0.25, 2, 30).toFixed(1));
    host.cpuIowait = Number(clamp(host.cpuUsage * 0.12, 0, 20).toFixed(1));
    host.cpuIdle = Number(clamp(100 - host.cpuUser - host.cpuSystem - host.cpuIowait, 0, 100).toFixed(1));
    host.fsUtil = Number(clamp(host.fsUtil * (0.95 + Math.random() * 0.1), 5, 98).toFixed(1));
    host.processCount = Math.round(clamp(host.processCount * (0.97 + Math.random() * 0.06), 20, 400));
    host.bufferUsed = Number(clamp(host.bufferUsed * (0.95 + Math.random() * 0.1), 5, 95).toFixed(1));
    host.queueRun = Number(clamp(host.queueRun + (Math.random() - 0.5), 0, 20).toFixed(1));
    host.queueBlock = Number(clamp(host.queueBlock + (Math.random() - 0.5) * 0.5, 0, 10).toFixed(1));
    host.netThroughput = Number(clamp(host.netThroughput * (0.94 + Math.random() * 0.12), 5, 500).toFixed(1));
    host.loginUsers = Math.max(0, Math.round(host.loginUsers + (Math.random() > 0.7 ? 1 : Math.random() > 0.85 ? -1 : 0)));
    host.series.cpu = bumpSeries(host.series.cpu, host.cpuUsage);
    host.series.fs = bumpSeries(host.series.fs, host.fsUtil);
    host.series.process = bumpSeries(host.series.process, host.processCount);
    host.series.buffer = bumpSeries(host.series.buffer, host.bufferUsed);
    host.series.queue = bumpSeries(host.series.queue, host.queueRun);
    host.series.network = bumpSeries(host.series.network, host.netThroughput);
    host.series.load1 = bumpSeries(host.series.load1, host.load1);
    host.series.load5 = bumpSeries(host.series.load5, host.load5);
    host.series.load15 = bumpSeries(host.series.load15, host.load15);
    host.series.cpuUser = bumpSeries(host.series.cpuUser, host.cpuUser);
    host.series.cpuSystem = bumpSeries(host.series.cpuSystem, host.cpuSystem);
    host.series.cpuIowait = bumpSeries(host.series.cpuIowait, host.cpuIowait);
    host.series.cpuIdle = bumpSeries(host.series.cpuIdle, host.cpuIdle);
    host.sampledAt = formatNow();
    return host;
  }

  function refreshAll() {
    hosts.forEach(refreshHost);
    return listHosts();
  }

  function aggregateSummary(list) {
    const source = list || hosts;
    let normal = 0;
    let alert = 0;
    let offline = 0;
    source.forEach((h) => {
      const s = getStatus(h).key;
      if (s === "offline") offline += 1;
      else if (s === "alert") alert += 1;
      else normal += 1;
    });

    const online = source.filter((h) => h.online);
    const trendTimes = makeTimes(24, 60);
    const cpuTrendValues = trendTimes.map((_, i) => {
      if (!online.length) return 0;
      const sum = online.reduce((acc, h) => {
        const vals = h.series.cpu.values;
        const idx = Math.min(i, vals.length - 1);
        return acc + Number(vals[idx] || 0);
      }, 0);
      return Number((sum / online.length).toFixed(1));
    });

    const avg = (key) => {
      if (!online.length) return 0;
      return Number((online.reduce((a, h) => a + Number(h[key] || 0), 0) / online.length).toFixed(1));
    };

    return {
      pie: [
        { name: "正常", value: normal },
        { name: "告警", value: alert },
        { name: "离线", value: offline },
      ],
      cpuTrend: { times: trendTimes, values: cpuTrendValues },
      resourceBars: [
        { name: "CPU", value: avg("cpuUsage") },
        { name: "磁盘 IO", value: avg("fsUtil") },
        { name: "内存缓冲", value: avg("bufferUsed") },
        { name: "网络", value: avg("netThroughput") > 100 ? Number((avg("netThroughput") / 5).toFixed(1)) : avg("netThroughput") },
      ],
    };
  }

  function buildVizMetrics(host) {
    const defs = [
      { code: "cpu", title: "CPU 使用率", unit: "%", series: host.series.cpu, current: host.cpuUsage },
      { code: "fs", title: "文件系统操作", unit: "%", series: host.series.fs, current: host.fsUtil },
      { code: "process", title: "进程", unit: "个", series: host.series.process, current: host.processCount },
      { code: "buffer", title: "缓冲区", unit: "%", series: host.series.buffer, current: host.bufferUsed },
      { code: "queue", title: "队列", unit: "个", series: host.series.queue, current: host.queueRun, sub: `阻塞 ${host.queueBlock}` },
      {
        code: "network",
        title: "网络 / 用户登入",
        unit: "Mbps",
        series: host.series.network,
        current: host.netThroughput,
        sub: `登入用户 ${host.loginUsers}`,
      },
    ];
    return defs.map((d) => ({
      code: d.code,
      title: d.title,
      unit: d.unit,
      currentValue: d.current,
      sub: d.sub || "",
      series: seriesPoints(d.series),
    }));
  }

  function buildCpuMetrics(host) {
    return {
      cards: [
        { label: "1 分钟负载", value: host.load1 },
        { label: "5 分钟负载", value: host.load5 },
        { label: "15 分钟负载", value: host.load15 },
        { label: "用户态", value: `${host.cpuUser}%` },
        { label: "系统态", value: `${host.cpuSystem}%` },
        { label: "等待 IO", value: `${host.cpuIowait}%` },
        { label: "空闲", value: `${host.cpuIdle}%` },
      ],
      load: {
        times: host.series.load1.times,
        load1: host.series.load1.values,
        load5: host.series.load5.values,
        load15: host.series.load15.values,
      },
      stack: {
        times: host.series.cpuUser.times,
        user: host.series.cpuUser.values,
        system: host.series.cpuSystem.values,
        iowait: host.series.cpuIowait.values,
        idle: host.series.cpuIdle.values,
      },
      cpuUsage: host.cpuUsage,
      threshold: host.cpuThreshold != null ? host.cpuThreshold : DEFAULT_CPU_THRESHOLD,
      status: getStatus(host),
    };
  }

  function areaChartOption(metric) {
    const times = metric.series.map((p) => p.time);
    const data = metric.series.map((p) => p.in);
    return {
      color: [CHART_LINE],
      grid: { left: 44, right: 16, top: 28, bottom: 28 },
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
        nameTextStyle: { color: "#86909C", fontSize: 11 },
        min: 0,
        axisLabel: { color: "#86909C", fontSize: 10 },
        splitLine: { lineStyle: { color: "#EDF1F7" } },
      },
      series: [
        {
          type: "line",
          data,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 3, color: CHART_LINE },
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
        },
      ],
    };
  }

  function pieOption(pie) {
    return {
      tooltip: { trigger: "item" },
      legend: { bottom: 0, textStyle: { color: "#86909C", fontSize: 12 } },
      color: ["#14C9BA", "#F53F57", "#86909C"],
      series: [
        {
          type: "pie",
          radius: ["42%", "68%"],
          center: ["50%", "46%"],
          label: { formatter: "{b}\n{c}", fontSize: 12 },
          data: pie,
        },
      ],
    };
  }

  function trendOption(trend) {
    return areaChartOption({
      unit: "%",
      series: trend.times.map((time, i) => ({ time, in: trend.values[i] })),
    });
  }

  function barOption(bars) {
    return {
      color: [CHART_LINE],
      grid: { left: 48, right: 16, top: 24, bottom: 32 },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: bars.map((b) => b.name),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#EDF1F7" } },
        axisLabel: { color: "#86909C", fontSize: 12 },
      },
      yAxis: {
        type: "value",
        min: 0,
        axisLabel: { color: "#86909C", fontSize: 10 },
        splitLine: { lineStyle: { color: "#EDF1F7" } },
      },
      series: [
        {
          type: "bar",
          barWidth: 28,
          data: bars.map((b) => b.value),
          itemStyle: { color: CHART_LINE, borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  }

  function cpuLoadOption(load) {
    return {
      color: [CHART_LINE, "#14C9BA", "#F7BA1E"],
      legend: { data: ["1分钟", "5分钟", "15分钟"], top: 0, textStyle: { color: "#86909C", fontSize: 12 } },
      grid: { left: 44, right: 16, top: 36, bottom: 28 },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: load.times,
        boundaryGap: false,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#EDF1F7" } },
        axisLabel: { color: "#86909C", fontSize: 10, interval: 2 },
      },
      yAxis: {
        type: "value",
        min: 0,
        axisLabel: { color: "#86909C", fontSize: 10 },
        splitLine: { lineStyle: { color: "#EDF1F7" } },
      },
      series: [
        { name: "1分钟", type: "line", smooth: true, showSymbol: false, data: load.load1, lineStyle: { width: 3 } },
        { name: "5分钟", type: "line", smooth: true, showSymbol: false, data: load.load5, lineStyle: { width: 2 } },
        { name: "15分钟", type: "line", smooth: true, showSymbol: false, data: load.load15, lineStyle: { width: 2 } },
      ],
    };
  }

  function cpuStackOption(stack) {
    return {
      color: [CHART_LINE, "#14C9BA", "#F7BA1E", "#C9CDD4"],
      legend: { data: ["用户态", "系统态", "等待IO", "空闲"], top: 0, textStyle: { color: "#86909C", fontSize: 12 } },
      grid: { left: 44, right: 16, top: 36, bottom: 28 },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: stack.times,
        boundaryGap: false,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#EDF1F7" } },
        axisLabel: { color: "#86909C", fontSize: 10, interval: 2 },
      },
      yAxis: {
        type: "value",
        max: 100,
        axisLabel: { color: "#86909C", fontSize: 10, formatter: "{value}%" },
        splitLine: { lineStyle: { color: "#EDF1F7" } },
      },
      series: [
        { name: "用户态", type: "line", stack: "cpu", areaStyle: {}, showSymbol: false, data: stack.user },
        { name: "系统态", type: "line", stack: "cpu", areaStyle: {}, showSymbol: false, data: stack.system },
        { name: "等待IO", type: "line", stack: "cpu", areaStyle: {}, showSymbol: false, data: stack.iowait },
        { name: "空闲", type: "line", stack: "cpu", areaStyle: {}, showSymbol: false, data: stack.idle },
      ],
    };
  }

  function renderVizCharts(container, metrics, echartsApi, chartBag) {
    if (!container || !echartsApi) return;
    (chartBag || []).forEach((c) => c.dispose?.());
    if (chartBag) chartBag.length = 0;
    container.innerHTML = (metrics || [])
      .map(
        (m, i) => `
      <article class="sm-chart-card card">
        <div class="sm-chart-head">
          <h3>${m.title} <span class="sm-curr-tag">当前: ${m.currentValue}${m.unit === "%" ? "%" : m.unit === "个" ? "" : m.unit === "Mbps" ? "Mbps" : ""}</span>${m.sub ? `<span class="sm-sub-tag">${m.sub}</span>` : ""}</h3>
        </div>
        <div class="sm-chart-el" id="smViz_${i}"></div>
      </article>`
      )
      .join("");
    metrics.forEach((m, i) => {
      const el = document.getElementById(`smViz_${i}`);
      if (!el) return;
      const chart = echartsApi.init(el);
      chart.setOption(areaChartOption(m));
      chartBag?.push(chart);
    });
  }

  window.ServerMonitor = {
    CHART_LINE,
    CHART_LABEL,
    DEFAULT_CPU_THRESHOLD,
    getStatus,
    listHosts,
    getHost,
    refreshHost,
    refreshAll,
    aggregateSummary,
    buildVizMetrics,
    buildCpuMetrics,
    areaChartOption,
    pieOption,
    trendOption,
    barOption,
    cpuLoadOption,
    cpuStackOption,
    renderVizCharts,
    formatNow,
  };
})();
