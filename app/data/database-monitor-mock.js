(function () {
  const CHART_LINE = "#5B83FF";
  const DEFAULT_SPACE_THRESHOLD = 85;
  const DEFAULT_SESSION_THRESHOLD = 200;

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
      return Number(clamp(base + wave + noise, 0, base + amp * 2.2).toFixed(decimals));
    });
    return { times, values };
  }

  function bumpSeries(series, nextVal) {
    const values = series.values.slice(1).concat(Number(nextVal));
    return { times: makeTimes(values.length, series.times.length > 20 ? 60 : 5), values };
  }

  function topSqlSeed(prefix, n) {
    return Array.from({ length: n }, (_, i) => ({
      id: `${prefix}-S${i + 1}`,
      sql: `SELECT /* ${prefix} */ col_${i} FROM t_${i} WHERE id = :1`,
      elapsedMs: Number((20 + i * 37 + Math.random() * 80).toFixed(1)),
      execCount: 100 + i * 40,
      cpuMs: Number((10 + i * 12).toFixed(1)),
    }));
  }

  function locksSeed(prefix) {
    return [
      { time: formatNow(), type: "行锁等待", detail: `${prefix} SID 128 等待 TX` },
      { time: formatNow(), type: "死锁", detail: `${prefix} 会话 45/67 死锁已回滚` },
    ];
  }

  const SEED = [
    { id: "DB01", name: "ORCL_CORE", type: "Oracle", version: "19c", host: "db-ora-01", ip: "10.20.1.11", port: 1521, online: true, sessions: 86, spaceUsage: 62 },
    { id: "DB02", name: "ORCL_RAC1", type: "Oracle RAC", version: "19c", host: "db-rac-01", ip: "10.20.1.21", port: 1521, online: true, sessions: 210, spaceUsage: 88 },
    { id: "DB03", name: "ORCL_BATCH", type: "Oracle", version: "12c", host: "db-ora-02", ip: "10.20.1.12", port: 1521, online: true, sessions: 54, spaceUsage: 71 },
    { id: "DB04", name: "MSSQL_ERP", type: "SQL Server", version: "2019", host: "db-mssql-01", ip: "10.20.2.11", port: 1433, online: true, sessions: 120, spaceUsage: 55 },
    { id: "DB05", name: "MSSQL_HR", type: "SQL Server", version: "2017", host: "db-mssql-02", ip: "10.20.2.12", port: 1433, online: true, sessions: 230, spaceUsage: 91 },
    { id: "DB06", name: "MSSQL_BI", type: "SQL Server", version: "2019", host: "db-mssql-03", ip: "10.20.2.13", port: 1433, online: false, sessions: 0, spaceUsage: 0 },
    { id: "DB07", name: "MYSQL_WEB", type: "MySQL", version: "8.0", host: "db-mysql-01", ip: "10.20.3.11", port: 3306, online: true, sessions: 48, spaceUsage: 44 },
    { id: "DB08", name: "MYSQL_LOG", type: "MySQL", version: "5.7", host: "db-mysql-02", ip: "10.20.3.12", port: 3306, online: true, sessions: 95, spaceUsage: 86 },
    { id: "DB09", name: "MYSQL_CACHE", type: "MySQL", version: "8.0", host: "db-mysql-03", ip: "10.20.3.13", port: 3306, online: true, sessions: 32, spaceUsage: 38 },
    { id: "DB10", name: "ORCL_DW", type: "Oracle", version: "19c", host: "db-ora-03", ip: "10.20.1.13", port: 1521, online: true, sessions: 150, spaceUsage: 79 },
    { id: "DB11", name: "MSSQL_OA", type: "SQL Server", version: "2019", host: "db-mssql-04", ip: "10.20.2.14", port: 1433, online: true, sessions: 70, spaceUsage: 48 },
    { id: "DB12", name: "MYSQL_PAY", type: "MySQL", version: "8.0", host: "db-mysql-04", ip: "10.20.3.14", port: 3306, online: true, sessions: 205, spaceUsage: 67 },
    { id: "DB13", name: "ORCL_RAC2", type: "Oracle RAC", version: "19c", host: "db-rac-02", ip: "10.20.1.22", port: 1521, online: true, sessions: 98, spaceUsage: 58 },
    { id: "DB14", name: "MYSQL_OFF", type: "MySQL", version: "8.0", host: "db-mysql-05", ip: "10.20.3.15", port: 3306, online: false, sessions: 0, spaceUsage: 0 },
  ];

  let instances = SEED.map((row, index) => {
    const spaceThreshold = DEFAULT_SPACE_THRESHOLD;
    const sessionThreshold = row.type.indexOf("MySQL") >= 0 ? 180 : DEFAULT_SESSION_THRESHOLD;
    const tablespaces = row.type.indexOf("Oracle") >= 0
      ? [
          { name: "SYSTEM", usage: clamp(row.spaceUsage - 10, 5, 99), threshold: spaceThreshold },
          { name: "SYSAUX", usage: clamp(row.spaceUsage - 5, 5, 99), threshold: spaceThreshold },
          { name: "USERS", usage: row.spaceUsage, threshold: spaceThreshold },
          { name: "UNDOTBS1", usage: clamp(row.spaceUsage * 0.6, 5, 99), threshold: spaceThreshold },
        ]
      : [
          { name: row.type === "SQL Server" ? "PRIMARY" : "datadir", usage: row.spaceUsage, threshold: spaceThreshold },
          { name: row.type === "SQL Server" ? "TEMPDB" : "tmpdir", usage: clamp(row.spaceUsage * 0.5, 5, 99), threshold: spaceThreshold },
        ];
    return {
      ...row,
      spaceThreshold,
      sessionThreshold,
      swapUsage: row.type.indexOf("Oracle") >= 0 ? Number((20 + (index % 40)).toFixed(1)) : null,
      slowQueries: row.type === "MySQL" ? 12 + (index % 20) : 5 + (index % 10),
      sampledAt: formatNow(),
      tablespaces: tablespaces.map((t) => ({
        ...t,
        status: !row.online ? "离线" : t.usage >= t.threshold ? "告警" : "正常",
      })),
      topSql: topSqlSeed(row.id, 5),
      locks: row.online ? locksSeed(row.id) : [],
      series: {
        sessions: makeSeries(index + 1, row.sessions || 10, 25, 24, 0),
        space: makeSeries(index + 2, row.spaceUsage || 20, 8, 24, 1),
        slow: makeSeries(index + 3, row.slowQueries || 5, 4, 12, 0),
      },
    };
  });

  function typeGroup(type) {
    if (type === "Oracle" || type === "Oracle RAC") return "Oracle";
    if (type === "SQL Server") return "SQL Server";
    return "MySQL";
  }

  function getStatus(inst) {
    if (!inst || inst.online === false) return { ...STATUS_META.offline };
    const spaceTh = inst.spaceThreshold != null ? inst.spaceThreshold : DEFAULT_SPACE_THRESHOLD;
    const sessTh = inst.sessionThreshold != null ? inst.sessionThreshold : DEFAULT_SESSION_THRESHOLD;
    if (Number(inst.spaceUsage) >= spaceTh || Number(inst.sessions) >= sessTh) return { ...STATUS_META.alert };
    return { ...STATUS_META.normal };
  }

  function listInstances() {
    return instances.slice();
  }

  function getInstance(id) {
    return instances.find((d) => d.id === id) || null;
  }

  function filterByTab(list, tab) {
    if (!tab || tab === "overview") return list.slice();
    return list.filter((d) => typeGroup(d.type) === tab);
  }

  function refreshInstance(inst) {
    if (!inst) return inst;
    if (!inst.online) {
      inst.sampledAt = formatNow();
      return inst;
    }
    const f = 0.94 + Math.random() * 0.12;
    inst.sessions = Math.round(clamp(inst.sessions * f, 5, 400));
    inst.spaceUsage = Number(clamp(inst.spaceUsage * (0.97 + Math.random() * 0.06), 10, 99).toFixed(1));
    inst.slowQueries = Math.round(clamp((inst.slowQueries || 5) * f, 0, 200));
    if (inst.swapUsage != null) inst.swapUsage = Number(clamp(inst.swapUsage * f, 5, 95).toFixed(1));
    inst.tablespaces = (inst.tablespaces || []).map((t, i) => {
      const usage = Number(clamp((i === 2 ? inst.spaceUsage : t.usage) * (0.97 + Math.random() * 0.06), 5, 99).toFixed(1));
      return { ...t, usage, status: usage >= t.threshold ? "告警" : "正常" };
    });
    inst.series.sessions = bumpSeries(inst.series.sessions, inst.sessions);
    inst.series.space = bumpSeries(inst.series.space, inst.spaceUsage);
    inst.series.slow = bumpSeries(inst.series.slow, inst.slowQueries);
    inst.sampledAt = formatNow();
    return inst;
  }

  function refreshAll() {
    instances.forEach(refreshInstance);
    return listInstances();
  }

  function aggregateSummary(list) {
    const source = list || instances;
    let normal = 0;
    let alert = 0;
    let offline = 0;
    source.forEach((d) => {
      const k = getStatus(d).key;
      if (k === "offline") offline += 1;
      else if (k === "alert") alert += 1;
      else normal += 1;
    });
    const online = source.filter((d) => d.online);
    const times = makeTimes(24, 60);
    const sessionTrend = times.map((_, i) => {
      if (!online.length) return 0;
      const sum = online.reduce((a, d) => a + Number(d.series.sessions.values[Math.min(i, d.series.sessions.values.length - 1)] || 0), 0);
      return Number((sum / online.length).toFixed(1));
    });
    const byType = ["Oracle", "SQL Server", "MySQL"].map((name) => ({
      name,
      value: source.filter((d) => typeGroup(d.type) === name).length,
    }));
    return {
      pie: [
        { name: "正常", value: normal },
        { name: "告警", value: alert },
        { name: "离线", value: offline },
      ],
      sessionTrend: { times, values: sessionTrend },
      typeBars: byType,
    };
  }

  function areaOption(times, values, unit) {
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
        name: unit || "",
        nameTextStyle: { color: "#86909C", fontSize: 11 },
        min: 0,
        axisLabel: { color: "#86909C", fontSize: 10 },
        splitLine: { lineStyle: { color: "#EDF1F7" } },
      },
      series: [
        {
          type: "line",
          data: values,
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
      series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "46%"], label: { formatter: "{b}\n{c}", fontSize: 12 }, data: pie }],
    };
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
        minInterval: 1,
        axisLabel: { color: "#86909C", fontSize: 10 },
        splitLine: { lineStyle: { color: "#EDF1F7" } },
      },
      series: [{ type: "bar", barWidth: 28, data: bars.map((b) => b.value), itemStyle: { color: CHART_LINE, borderRadius: [4, 4, 0, 0] } }],
    };
  }

  function dualTrendOption(inst) {
    return {
      color: [CHART_LINE, "#14C9BA"],
      legend: { data: ["会话/连接", "空间使用率%"], top: 0, textStyle: { color: "#86909C", fontSize: 12 } },
      grid: { left: 44, right: 44, top: 36, bottom: 28 },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: inst.series.sessions.times,
        boundaryGap: false,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#EDF1F7" } },
        axisLabel: { color: "#86909C", fontSize: 10, interval: 2 },
      },
      yAxis: [
        { type: "value", name: "会话", axisLabel: { color: "#86909C", fontSize: 10 }, splitLine: { lineStyle: { color: "#EDF1F7" } } },
        { type: "value", name: "%", max: 100, axisLabel: { color: "#86909C", fontSize: 10 }, splitLine: { show: false } },
      ],
      series: [
        { name: "会话/连接", type: "line", smooth: true, showSymbol: false, data: inst.series.sessions.values, lineStyle: { width: 3 } },
        { name: "空间使用率%", type: "line", yAxisIndex: 1, smooth: true, showSymbol: false, data: inst.series.space.values, lineStyle: { width: 2 } },
      ],
    };
  }

  window.DatabaseMonitor = {
    CHART_LINE,
    DEFAULT_SPACE_THRESHOLD,
    DEFAULT_SESSION_THRESHOLD,
    typeGroup,
    getStatus,
    listInstances,
    getInstance,
    filterByTab,
    refreshInstance,
    refreshAll,
    aggregateSummary,
    areaOption,
    pieOption,
    barOption,
    dualTrendOption,
    formatNow,
  };
})();
