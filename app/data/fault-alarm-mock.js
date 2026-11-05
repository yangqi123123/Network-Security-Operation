(function () {
  const CHART_LINE = "#5B83FF";

  const CHANNELS = ["邮件", "微信", "钉钉"];

  const alarms = [
    {
      id: 1,
      device: "core-aix-02",
      deviceCode: "HOST-AIX-02",
      system: "服务器监测",
      category: "主机",
      domain: "核心机房",
      type: "CPU超阈",
      message: "CPU 使用率 91%，超过阈值 80%",
      level: "告警",
      time: "2026-10-30 14:22:16",
      status: "未处理",
      channels: ["邮件", "钉钉"],
      escalated: false,
      escalateHours: 2,
      template: "主机性能告警模板",
      history: [{ time: "2026-10-30 14:22:16", operator: "系统", action: "创建告警并按分级发送邮件/钉钉" }],
    },
    {
      id: 2,
      device: "ORCL_RAC1",
      deviceCode: "DB-ORCL-RAC1",
      system: "数据库监测",
      category: "数据库",
      domain: "数据中心",
      type: "表空间超阈",
      message: "USERS 表空间使用率 88%，超过阈值 85%",
      level: "告警",
      time: "2026-10-30 13:05:40",
      status: "处理中",
      transferStatus: "已转单",
      workOrderNo: "WO20261030001",
      channels: ["邮件", "微信", "钉钉"],
      escalated: true,
      escalateHours: 2,
      escalateTo: "运维主管-王工",
      escalateAt: "2026-10-30 15:10:00",
      template: "数据库严重告警模板",
      history: [
        { time: "2026-10-30 13:05:40", operator: "系统", action: "创建告警，邮件/微信/钉钉通知" },
        { time: "2026-10-30 15:10:00", operator: "系统", action: "超时未解决，升级通知运维主管-王工" },
        { time: "2026-10-30 15:20:12", operator: "张三", action: "开始处理，已转工单" },
      ],
    },
    {
      id: 3,
      device: "SW-CORE-A",
      deviceCode: "NET-SW-01",
      system: "网络设备监测",
      category: "网络设备",
      domain: "核心网络",
      type: "设备离线",
      message: "核心交换机 SNMP 采集失败，判定离线",
      level: "告警",
      time: "2026-10-30 12:48:11",
      status: "未处理",
      channels: ["钉钉", "邮件"],
      escalated: false,
      escalateHours: 1,
      template: "网络可用性告警模板",
      history: [{ time: "2026-10-30 12:48:11", operator: "系统", action: "创建告警并发送钉钉/邮件" }],
    },
    {
      id: 4,
      device: "linux-web-02",
      deviceCode: "HOST-LNX-02",
      system: "服务器监测",
      category: "主机",
      domain: "DMZ",
      type: "磁盘IO异常",
      message: "文件系统操作延迟升高，IOPS 波动超阈值",
      level: "预警",
      time: "2026-10-30 11:16:24",
      status: "未处理",
      channels: ["微信"],
      escalated: false,
      escalateHours: 4,
      template: "主机性能预警模板",
      history: [{ time: "2026-10-30 11:16:24", operator: "系统", action: "创建预警并发送微信" }],
    },
    {
      id: 5,
      device: "MSSQL_HR",
      deviceCode: "DB-MSSQL-02",
      system: "数据库监测",
      category: "数据库",
      domain: "办公区",
      type: "会话超阈",
      message: "SQL Server 会话数 230，超过阈值 200",
      level: "告警",
      time: "2026-10-30 10:42:00",
      status: "已处理",
      channels: ["邮件", "钉钉"],
      escalated: false,
      escalateHours: 3,
      template: "数据库告警模板",
      closeReason: "告警已解决",
      closeRemark: "终止异常会话后恢复。",
      closedAt: "2026-10-30 11:05:18",
      closedBy: "李四",
      history: [
        { time: "2026-10-30 10:42:00", operator: "系统", action: "创建告警" },
        { time: "2026-10-30 11:05:18", operator: "李四", action: "完成处理：终止异常会话" },
      ],
    },
    {
      id: 6,
      device: "L002-核心互联",
      deviceCode: "LINK-L002",
      system: "链路状态",
      category: "链路",
      domain: "核心网络",
      type: "带宽利用率超阈",
      message: "带宽利用率 92%，进入严重档",
      level: "告警",
      time: "2026-10-29 22:11:08",
      status: "未处理",
      channels: ["邮件", "微信", "钉钉"],
      escalated: true,
      escalateHours: 2,
      escalateTo: "网络主管-赵工",
      escalateAt: "2026-10-30 00:15:00",
      template: "链路严重告警模板",
      history: [
        { time: "2026-10-29 22:11:08", operator: "系统", action: "创建告警，三渠道通知" },
        { time: "2026-10-30 00:15:00", operator: "系统", action: "超时升级通知网络主管-赵工" },
      ],
    },
    {
      id: 7,
      device: "MYSQL_LOG",
      deviceCode: "DB-MYSQL-02",
      system: "数据库监测",
      category: "数据库",
      domain: "DMZ",
      type: "慢查询激增",
      message: "近 15 分钟慢查询数超过基线 3 倍",
      level: "预警",
      time: "2026-10-29 18:35:27",
      status: "已处理",
      channels: ["微信", "钉钉"],
      escalated: false,
      escalateHours: 4,
      template: "数据库预警模板",
      closeReason: "告警已解决",
      closeRemark: "优化索引后慢查询回落。",
      closedAt: "2026-10-29 19:10:06",
      closedBy: "王五",
      history: [
        { time: "2026-10-29 18:35:27", operator: "系统", action: "创建预警" },
        { time: "2026-10-29 19:10:06", operator: "王五", action: "误报排查后确认已恢复" },
      ],
    },
    {
      id: 8,
      device: "win-sql-01",
      deviceCode: "HOST-WIN-03",
      system: "服务器监测",
      category: "主机",
      domain: "数据中心",
      type: "进程僵死",
      message: "关键进程 sqlservr 进入僵死状态",
      level: "告警",
      time: "2026-10-29 16:20:00",
      status: "未处理",
      channels: ["钉钉", "邮件"],
      escalated: false,
      escalateHours: 2,
      template: "主机关键进程告警模板",
      history: [{ time: "2026-10-29 16:20:00", operator: "系统", action: "创建告警" }],
    },
    {
      id: 9,
      device: "FW-EDGE-01",
      deviceCode: "NET-FW-01",
      system: "网络设备监测",
      category: "安全设备",
      domain: "边界网络",
      type: "接口故障",
      message: "ge-0/0/1 操作状态 down",
      level: "告警",
      time: "2026-10-28 09:12:00",
      status: "处理中",
      transferStatus: "已转单",
      workOrderNo: "WO20261028003",
      channels: ["邮件", "钉钉"],
      escalated: false,
      escalateHours: 2,
      template: "网络接口告警模板",
      history: [
        { time: "2026-10-28 09:12:00", operator: "系统", action: "创建告警" },
        { time: "2026-10-28 09:30:00", operator: "赵工", action: "已转工单处理" },
      ],
    },
    {
      id: 10,
      device: "linux-db-01",
      deviceCode: "HOST-LNX-DB01",
      system: "服务器监测",
      category: "主机",
      domain: "数据中心",
      type: "内存缓冲告警",
      message: "Buffer/Cache 占用持续高于阈值",
      level: "提醒",
      time: "2026-10-28 08:20:00",
      status: "未处理",
      channels: ["邮件"],
      escalated: false,
      escalateHours: 6,
      template: "主机提醒模板",
      history: [{ time: "2026-10-28 08:20:00", operator: "系统", action: "创建提醒并发送邮件" }],
    },
    {
      id: 11,
      device: "ORCL_CORE",
      deviceCode: "DB-ORCL-01",
      system: "数据库监测",
      category: "数据库",
      domain: "核心机房",
      type: "死锁",
      message: "检测到死锁，会话 45/67 已回滚",
      level: "预警",
      time: "2026-10-27 21:05:40",
      status: "已处理",
      channels: ["微信", "钉钉"],
      escalated: false,
      escalateHours: 3,
      template: "数据库锁告警模板",
      closeReason: "告警已解决",
      closeRemark: "应用侧调整事务顺序。",
      closedAt: "2026-10-27 21:40:00",
      closedBy: "张三",
      history: [
        { time: "2026-10-27 21:05:40", operator: "系统", action: "创建预警" },
        { time: "2026-10-27 21:40:00", operator: "张三", action: "完成处理" },
      ],
    },
    {
      id: 12,
      device: "AP-B1-12",
      deviceCode: "NET-AP-12",
      system: "网络设备监测",
      category: "无线",
      domain: "办公区",
      type: "设备离线",
      message: "AP 心跳超时",
      level: "提醒",
      time: "2026-10-27 10:18:05",
      status: "未处理",
      channels: ["微信"],
      escalated: false,
      escalateHours: 8,
      template: "无线可用性提醒模板",
      history: [{ time: "2026-10-27 10:18:05", operator: "系统", action: "创建提醒" }],
    },
  ];

  const rules = [
    {
      id: 1,
      name: "主机CPU超阈分级通知",
      type: "CPU超阈",
      level: "告警",
      domain: "核心机房",
      devices: "AIX/Windows/Linux 主机",
      status: "启用",
      channels: ["邮件", "钉钉"],
      receivers: "运维一组、值班长",
      escalate: true,
      escalateHours: 2,
      escalateTo: "运维主管",
      template: "主机性能告警模板",
      description: "CPU 使用率超过阈值时按分级发送邮件/钉钉，超时升级主管。",
    },
    {
      id: 2,
      name: "Oracle表空间与会话告警",
      type: "表空间超阈",
      level: "告警",
      domain: "数据中心",
      devices: "Oracle / Oracle RAC",
      status: "启用",
      channels: ["邮件", "微信", "钉钉"],
      receivers: "DBA组",
      escalate: true,
      escalateHours: 2,
      escalateTo: "DBA主管",
      template: "数据库严重告警模板",
      description: "表空间或会话超阈触发，三渠道通知并可升级。",
    },
    {
      id: 3,
      name: "网络设备离线告警",
      type: "设备离线",
      level: "告警",
      domain: "核心网络",
      devices: "核心/汇聚交换机、防火墙",
      status: "启用",
      channels: ["钉钉", "邮件"],
      receivers: "网络组",
      escalate: true,
      escalateHours: 1,
      escalateTo: "网络主管",
      template: "网络可用性告警模板",
      description: "设备离线持续超过阈值秒数触发。",
    },
    {
      id: 4,
      name: "链路带宽严重告警",
      type: "带宽利用率超阈",
      level: "告警",
      domain: "核心网络",
      devices: "核心互联链路",
      status: "启用",
      channels: ["邮件", "微信", "钉钉"],
      receivers: "网络组、值班长",
      escalate: true,
      escalateHours: 2,
      escalateTo: "网络主管",
      template: "链路严重告警模板",
      description: "带宽利用率进入严重档时全渠道通知。",
    },
    {
      id: 5,
      name: "SQL Server会话预警",
      type: "会话超阈",
      level: "预警",
      domain: "办公区",
      devices: "SQL Server 实例",
      status: "启用",
      channels: ["微信"],
      receivers: "应用运维",
      escalate: false,
      escalateHours: 4,
      escalateTo: "",
      template: "数据库预警模板",
      description: "会话接近阈值时微信提醒。",
    },
    {
      id: 6,
      name: "主机磁盘IO提醒",
      type: "磁盘IO异常",
      level: "提醒",
      domain: "DMZ",
      devices: "Web 主机",
      status: "停用",
      channels: ["邮件"],
      receivers: "运维二组",
      escalate: false,
      escalateHours: 6,
      escalateTo: "",
      template: "主机提醒模板",
      description: "磁盘 IO 异常提醒（可停用）。",
    },
  ];

  const templates = [
    { id: "T1", name: "主机性能告警模板", channel: "邮件/钉钉", sample: "【告警】${device} CPU=${value}% 超过阈值 ${threshold}%" },
    { id: "T2", name: "数据库严重告警模板", channel: "邮件/微信/钉钉", sample: "【告警】${instance} 表空间 ${tablespace}=${usage}%" },
    { id: "T3", name: "网络可用性告警模板", channel: "钉钉/邮件", sample: "【告警】${device} 离线，请立即排查" },
    { id: "T4", name: "链路严重告警模板", channel: "三渠道", sample: "【严重】链路 ${link} 利用率 ${util}%" },
  ];

  function analysisSummary(list = alarms) {
    const byLevel = { 告警: 0, 预警: 0, 提醒: 0 };
    const byCategory = {};
    const byStatus = { 未处理: 0, 处理中: 0, 已处理: 0 };
    let rawEvents = 0;
    let compressed = list.length;
    list.forEach((a) => {
      byLevel[a.level] = (byLevel[a.level] || 0) + 1;
      byCategory[a.category] = (byCategory[a.category] || 0) + 1;
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
      rawEvents += 3 + (a.id % 5);
    });
    const rootCauses = [
      { name: "主机资源瓶颈", value: byCategory["主机"] || 0 },
      { name: "数据库容量/会话", value: byCategory["数据库"] || 0 },
      { name: "网络连通/带宽", value: (byCategory["网络设备"] || 0) + (byCategory["链路"] || 0) + (byCategory["无线"] || 0) },
      { name: "安全设备接口", value: byCategory["安全设备"] || 0 },
    ];
    const correlate = [
      { from: "core-aix-02 CPU超阈", to: "ORCL_RAC1 会话升高", strength: 0.86 },
      { from: "SW-CORE-A 离线", to: "多条接入链路丢包", strength: 0.92 },
      { from: "MSSQL_HR 会话超阈", to: "win-sql-01 进程僵死", strength: 0.71 },
      { from: "L002 带宽严重", to: "DMZ Web 响应变慢", strength: 0.78 },
    ];
    const filterFlow = [
      { name: "原始事件", value: rawEvents },
      { name: "过滤后", value: Math.round(rawEvents * 0.55) },
      { name: "压缩后", value: compressed },
      { name: "关联根因", value: rootCauses.filter((r) => r.value > 0).length },
    ];
    const trendTimes = [];
    const trendValues = [];
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(Date.now() - i * 3600 * 1000);
      trendTimes.push(`${String(d.getHours()).padStart(2, "0")}:00`);
      trendValues.push(4 + ((i * 7) % 9) + (i % 3));
    }
    return {
      byLevel: Object.keys(byLevel).map((name) => ({ name, value: byLevel[name] })),
      byCategory: Object.keys(byCategory).map((name) => ({ name, value: byCategory[name] })),
      byStatus: Object.keys(byStatus).map((name) => ({ name, value: byStatus[name] })),
      rootCauses,
      correlate,
      filterFlow,
      trend: { times: trendTimes, values: trendValues },
      rawEvents,
      compressed,
      compressRatio: rawEvents ? Number(((1 - compressed / rawEvents) * 100).toFixed(1)) : 0,
      escalatedCount: list.filter((a) => a.escalated).length,
    };
  }

  function pieOption(data, colors) {
    return {
      tooltip: { trigger: "item" },
      legend: { bottom: 0, textStyle: { color: "#86909C", fontSize: 12 } },
      color: colors || ["#F53F57", "#F7BA1E", "#14C9BA", "#5B83FF", "#86909C"],
      series: [{ type: "pie", radius: ["40%", "65%"], center: ["50%", "45%"], label: { formatter: "{b}\n{c}", fontSize: 12 }, data }],
    };
  }

  function barOption(data) {
    return {
      color: [CHART_LINE],
      grid: { left: 48, right: 16, top: 24, bottom: 32 },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: data.map((d) => d.name),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#EDF1F7" } },
        axisLabel: { color: "#86909C", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { color: "#86909C", fontSize: 10 },
        splitLine: { lineStyle: { color: "#EDF1F7" } },
      },
      series: [{ type: "bar", barWidth: 26, data: data.map((d) => d.value), itemStyle: { color: CHART_LINE, borderRadius: [4, 4, 0, 0] } }],
    };
  }

  function lineOption(trend) {
    return {
      color: [CHART_LINE],
      grid: { left: 44, right: 16, top: 28, bottom: 28 },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: trend.times,
        boundaryGap: false,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#EDF1F7" } },
        axisLabel: { color: "#86909C", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        min: 0,
        axisLabel: { color: "#86909C", fontSize: 10 },
        splitLine: { lineStyle: { color: "#EDF1F7" } },
      },
      series: [
        {
          type: "line",
          data: trend.values,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 3 },
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

  const SOURCE_LEVELS = ["掉线", "严重", "主要", "次要", "未知"];
  const SOURCE_LEVEL_COLORS = {
    掉线: "#86909C",
    严重: "#F53F57",
    主要: "#F77234",
    次要: "#F7BA1E",
    未知: "#8B5CF6",
  };

  const realtimeAlarms = [
    { id: "RA01", network: "核心业务网", device: "core-aix-02", ip: "10.10.1.12", resource: "CPU", type: "CPU Utilization", level: "严重", value: "91%", time: "2026-10-30 16:12:08", confirmed: false },
    { id: "RA02", network: "数据中心网", device: "ORCL_RAC1", ip: "10.20.1.21", resource: "Tablespace", type: "Disk Space", level: "主要", value: "88%", time: "2026-10-30 15:48:22", confirmed: true },
    { id: "RA03", network: "核心业务网", device: "SW-CORE-A", ip: "10.30.1.1", resource: "SNMP", type: "Device Offline", level: "掉线", value: "-", time: "2026-10-30 15:20:11", confirmed: false },
    { id: "RA04", network: "DMZ接入网", device: "linux-web-02", ip: "10.10.3.32", resource: "Disk IO", type: "IO Latency", level: "次要", value: "76ms", time: "2026-10-30 14:55:40", confirmed: false },
    { id: "RA05", network: "办公网", device: "MSSQL_HR", ip: "10.20.2.12", resource: "Sessions", type: "Session Count", level: "严重", value: "230", time: "2026-10-30 14:22:16", confirmed: true },
    { id: "RA06", network: "核心互联", device: "L002-核心", ip: "10.30.2.2", resource: "Bandwidth", type: "Utilization", level: "严重", value: "92%", time: "2026-10-30 13:40:05", confirmed: false },
    { id: "RA07", network: "DMZ接入网", device: "MYSQL_LOG", ip: "10.20.3.12", resource: "Slow Query", type: "Slow SQL", level: "主要", value: "36", time: "2026-10-30 12:18:33", confirmed: true },
    { id: "RA08", network: "数据中心网", device: "win-sql-01", ip: "10.10.2.23", resource: "Process", type: "Process Hang", level: "主要", value: "僵死", time: "2026-10-30 11:05:19", confirmed: false },
    { id: "RA09", network: "边界安全网", device: "FW-EDGE-01", ip: "10.40.1.1", resource: "ge-0/0/1", type: "Interface Down", level: "掉线", value: "down", time: "2026-10-30 10:42:00", confirmed: true },
    { id: "RA10", network: "办公网", device: "AP-B1-12", ip: "10.50.1.12", resource: "Heartbeat", type: "AP Offline", level: "未知", value: "-", time: "2026-10-30 09:16:24", confirmed: false },
  ];

  function sourceDashboard() {
    const summary = analysisSummary(alarms);
    const todayByLevel = [
      { name: "掉线", value: 8 },
      { name: "严重", value: 18 },
      { name: "主要", value: 22 },
      { name: "次要", value: 20 },
      { name: "未知", value: 16 },
    ];
    const todayTotal = todayByLevel.reduce((a, b) => a + b.value, 0);
    const confirmed = realtimeAlarms.filter((a) => a.confirmed).length;
    const unconfirmed = realtimeAlarms.length - confirmed;
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(`${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`);
    }
    const trend7 = [72, 100, 86, 94, 78, 110, 84];
    const levelStack = {
      days,
      series: [
        { name: "掉线", data: [6, 8, 5, 7, 4, 9, 8] },
        { name: "严重", data: [12, 18, 14, 16, 11, 20, 18] },
        { name: "主要", data: [20, 24, 22, 21, 19, 28, 22] },
        { name: "次要", data: [18, 30, 25, 28, 22, 32, 20] },
        { name: "未知", data: [10, 12, 11, 14, 9, 15, 16] },
      ],
    };
    const topDevices = [
      { name: "10.10.1.12", value: 40 },
      { name: "10.20.1.21", value: 28 },
      { name: "10.30.1.1", value: 22 },
      { name: "10.20.2.12", value: 16 },
      { name: "10.30.2.2", value: 12 },
    ];
    return {
      rootCauses: summary.rootCauses,
      todayByLevel,
      todayTotal,
      todayEvents: 112,
      todayCenterLabel: "次要",
      todayCenterValue: 20,
      confirmed: 84,
      unconfirmed: 112,
      confirmedCenter: 150,
      trend7: { times: days, values: trend7 },
      levelStack,
      topDevices,
      realtime: realtimeAlarms,
    };
  }

  function donutWithSideOption(parts, centerText, centerSub, colors) {
    return {
      color: colors,
      tooltip: { trigger: "item" },
      legend: { show: false },
      series: [
        {
          type: "pie",
          radius: ["52%", "72%"],
          center: ["32%", "50%"],
          label: { show: false },
          data: parts,
        },
      ],
      graphic: [
        {
          type: "text",
          left: "28%",
          top: "42%",
          style: { text: String(centerText), textAlign: "center", fill: "#1d2129", fontSize: 22, fontWeight: 700 },
        },
        {
          type: "text",
          left: "26%",
          top: "56%",
          style: { text: centerSub, textAlign: "center", fill: "#86909C", fontSize: 12 },
        },
      ],
    };
  }

  function stackedBarOption(stack) {
    return {
      color: SOURCE_LEVELS.map((l) => SOURCE_LEVEL_COLORS[l]),
      legend: { top: 0, textStyle: { color: "#86909C", fontSize: 11 } },
      grid: { left: 40, right: 16, top: 36, bottom: 28 },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: stack.days,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#EDF1F7" } },
        axisLabel: { color: "#86909C", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { color: "#86909C", fontSize: 10 },
        splitLine: { lineStyle: { color: "#EDF1F7" } },
      },
      series: stack.series.map((s) => ({
        name: s.name,
        type: "bar",
        stack: "level",
        barWidth: 18,
        data: s.data,
      })),
    };
  }

  function hBarOption(rows) {
    return {
      color: [CHART_LINE],
      grid: { left: 88, right: 36, top: 12, bottom: 20 },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: {
        type: "value",
        axisLabel: { color: "#86909C", fontSize: 10 },
        splitLine: { lineStyle: { color: "#EDF1F7" } },
      },
      yAxis: {
        type: "category",
        data: rows.map((r) => r.name).reverse(),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: "#4E5969", fontSize: 11 },
      },
      series: [
        {
          type: "bar",
          barWidth: 14,
          data: rows.map((r) => r.value).reverse(),
          label: { show: true, position: "right", color: "#86909C", fontSize: 11 },
          itemStyle: { color: CHART_LINE, borderRadius: [0, 4, 4, 0] },
        },
      ],
    };
  }

  // 与网络拓扑页打通：区域/设备/探针对齐 topology.html 校区机房拓扑
  const TOPO_DEVICES = {
    "core-hx": { name: "三层核心交换", region: "数据机房区", layer: "核心层", probe: "数据机房核心探针-01", ip: "10.78.0.254", iconType: "switch" },
    "fw-edge": { name: "防火墙", region: "数据机房区", layer: "核心层", probe: "数据机房核心探针-01", ip: "10.78.0.1", iconType: "firewall" },
    "acm": { name: "全网行为管理", region: "数据机房区", layer: "汇聚层", probe: "数据机房核心探针-01", ip: "10.78.0.252", iconType: "box" },
    "srv-av": { name: "防病毒服务器", region: "数据机房区", layer: "接入层", probe: "数据机房核心探针-01", ip: "10.78.0.10", iconType: "server" },
    "srv-oa": { name: "OA服务器", region: "数据机房区", layer: "接入层", probe: "数据机房核心探针-01", ip: "10.78.0.12", iconType: "server" },
    "ac-1": { name: "AC控制器", region: "行政楼", layer: "核心层", probe: "行政楼汇聚探针-02", ip: "10.78.123.254/22", iconType: "ac" },
    "sw-wifi-1": { name: "接入交换机(无网管)", region: "行政楼", layer: "汇聚层", probe: "行政楼汇聚探针-02", ip: "10.78.123.11", iconType: "switch" },
    "ap-1": { name: "AP-行政办", region: "行政楼", layer: "接入层", probe: "行政楼接入探针-05", ip: "10.78.124.11", iconType: "ap" },
    "ap-2": { name: "AP-会议室", region: "行政楼", layer: "接入层", probe: "行政楼接入探针-05", ip: "10.78.124.12", iconType: "ap" },
    "agg-teach": { name: "千兆汇聚交换机", region: "第一教学楼", layer: "核心层", probe: "第一教学楼汇聚探针-03", ip: "172.65.200.254/23", iconType: "switch" },
    "sw-t1": { name: "接入交换机 SW1", region: "第一教学楼", layer: "汇聚层", probe: "第一教学楼汇聚探针-03", ip: "172.65.200.11", iconType: "switch" },
    "sw-t2": { name: "接入交换机 SW2", region: "第一教学楼", layer: "汇聚层", probe: "第一教学楼汇聚探针-03", ip: "172.65.200.12", iconType: "switch" },
    "pc-1": { name: "教室1-Vlan101", region: "第一教学楼", layer: "接入层", probe: "第一教学楼接入探针-07", ip: "172.65.201.11", iconType: "pc" },
    "pc-3": { name: "教研室-Vlan103", region: "第一教学楼", layer: "接入层", probe: "第一教学楼接入探针-07", ip: "172.65.201.13", iconType: "pc" },
    "agg-sec": { name: "安防监控汇聚交换机", region: "第二教学楼", layer: "核心层", probe: "第二教学楼汇聚探针-04", ip: "172.65.202.254/23", iconType: "switch" },
    "olt-1": { name: "OLT多业务交换机", region: "第二教学楼", layer: "汇聚层", probe: "第二教学楼汇聚探针-04", ip: "192.168.0.65/24", iconType: "switch" },
    "vms-1": { name: "视频管理一体机", region: "第二教学楼", layer: "汇聚层", probe: "第二教学楼汇聚探针-04", ip: "172.65.202.10", iconType: "box" },
    "nvr-2": { name: "NVR2", region: "第二教学楼", layer: "接入层", probe: "第二教学楼接入探针-08", ip: "172.65.202.32", iconType: "cylinder" },
    "cam-1": { name: "走廊摄像头", region: "第二教学楼", layer: "接入层", probe: "第二教学楼接入探针-08", ip: "172.65.203.11", iconType: "camera" },
  };

  const DOMAIN_POOL = {
    核心机房: ["core-hx", "fw-edge", "srv-av", "srv-oa"],
    数据中心: ["agg-teach", "sw-t1", "sw-t2", "pc-1"],
    核心网络: ["core-hx", "acm", "fw-edge"],
    DMZ: ["ac-1", "sw-wifi-1", "ap-1", "ap-2"],
    办公区: ["pc-1", "pc-3", "sw-t1", "agg-teach"],
    边界网络: ["agg-sec", "olt-1", "vms-1", "nvr-2", "cam-1"],
  };

  const MESSAGE_OVERRIDE = {
    "srv-av": "防病毒特征库更新超时，部分终端防护策略未同步",
    "nvr-2": "NVR2 磁盘异常，监控回放中断",
    "core-hx": "三层核心交换 SNMP 采集抖动，端口利用率升高",
    "fw-edge": "防火墙会话数超阈，教育专线上联拥塞",
    "ac-1": "AC 控制器关联 AP 数异常，无线认证延迟升高",
    "ap-1": "AP-行政办 离线，802.1X 认证中断",
    "agg-teach": "千兆汇聚交换机上联光模块光衰超阈",
    "pc-1": "教室1-Vlan101 终端流量异常，疑似环路",
    "cam-1": "走廊摄像头码流中断，ONU 上联闪断",
  };

  alarms.forEach((item, index) => {
    const pool = DOMAIN_POOL[item.domain] || ["core-hx"];
    const topoId = pool[index % pool.length];
    const dev = TOPO_DEVICES[topoId] || TOPO_DEVICES["core-hx"];
    item.region = dev.region;
    item.layer = dev.layer;
    item.probe = dev.probe;
    item.device = dev.name;
    item.deviceId = topoId;
    item.deviceCode = topoId.toUpperCase();
    item.ip = dev.ip;
    item.iconType = dev.iconType;
    if (MESSAGE_OVERRIDE[topoId]) item.message = MESSAGE_OVERRIDE[topoId];
  });

  function faultLevelKey(level) {
    if (level === "告警") return "critical";
    if (level === "预警") return "major";
    return "info";
  }

  function faultLevelText(level) {
    if (level === "告警") return "严重";
    if (level === "预警") return "主要";
    return "提示";
  }

  /** 供故障显示页使用的统一视图（与告警通知同源） */
  function alarmsForFaultDisplay(list = alarms) {
    return list.map((item) => ({
      ...item,
      levelKey: faultLevelKey(item.level),
      levelText: faultLevelText(item.level),
      content: item.message,
      confirmed: item.status === "已处理",
    }));
  }

  window.FaultAlarm = {
    CHANNELS,
    alarms,
    rules,
    templates,
    realtimeAlarms,
    SOURCE_LEVELS,
    SOURCE_LEVEL_COLORS,
    analysisSummary,
    sourceDashboard,
    pieOption,
    barOption,
    lineOption,
    donutWithSideOption,
    stackedBarOption,
    hBarOption,
    alarmsForFaultDisplay,
    faultLevelKey,
    faultLevelText,
  };
})();
