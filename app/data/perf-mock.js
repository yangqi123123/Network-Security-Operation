(function () {
  const databases = [
    { id: 1, name: "ORCL_CORE", engine: "Oracle", host: "10.0.1.11", port: 1521, connections: 128, cpu: 42, mem: 61, slowQuery: 3, status: "正常", account: "monitor", remark: "核心业务库" },
    { id: 2, name: "ORCL_RAC1", engine: "Oracle RAC", host: "10.0.1.21", port: 1521, connections: 210, cpu: 68, mem: 74, slowQuery: 12, status: "告警", account: "monitor", remark: "RAC 节点1" },
    { id: 3, name: "MSSQL_ERP", engine: "SQLServer", host: "10.0.2.31", port: 1433, connections: 86, cpu: 35, mem: 48, slowQuery: 1, status: "正常", account: "sa_ro", remark: "ERP 只读" },
    { id: 4, name: "MYSQL_PORTAL", engine: "MySQL", host: "10.0.3.41", port: 3306, connections: 54, cpu: 28, mem: 39, slowQuery: 0, status: "正常", account: "portal", remark: "门户库" },
    { id: 5, name: "MYSQL_LOG", engine: "MySQL", host: "10.0.3.42", port: 3306, connections: 33, cpu: 81, mem: 70, slowQuery: 27, status: "告警", account: "logger", remark: "日志库" },
    ...Array.from({ length: 12 }, (_, i) => ({
      id: i + 6,
      name: `DB_INST_${i + 6}`,
      engine: ["Oracle", "Oracle RAC", "SQLServer", "MySQL"][i % 4],
      host: `10.0.${4 + (i % 3)}.${50 + i}`,
      port: [1521, 1521, 1433, 3306][i % 4],
      connections: 20 + i * 7,
      cpu: 20 + ((i * 11) % 70),
      mem: 30 + ((i * 13) % 60),
      slowQuery: i % 5,
      status: i % 4 === 0 ? "告警" : "正常",
      account: "monitor",
      remark: "-",
    })),
  ];

  const alerts = [
    { id: 1, name: "主机 CPU 高负载", resourceType: "主机", metric: "cpu.usage", interval: "60s", threshold: "≥ 85%", level: "严重", status: "正常", remark: "" },
    { id: 2, name: "网络接口丢包", resourceType: "网络", metric: "if.loss", interval: "30s", threshold: "≥ 1%", level: "告警", status: "正常", remark: "" },
    { id: 3, name: "数据库连接数", resourceType: "数据库", metric: "db.sessions", interval: "60s", threshold: "≥ 200", level: "告警", status: "正常", remark: "" },
    { id: 4, name: "中间件堆内存", resourceType: "中间件", metric: "jvm.heap", interval: "120s", threshold: "≥ 80%", level: "严重", status: "停用", remark: "" },
    ...Array.from({ length: 10 }, (_, i) => ({
      id: i + 5,
      name: `统一策略-${i + 5}`,
      resourceType: ["主机", "网络", "数据库", "中间件"][i % 4],
      metric: `metric.${i + 5}`,
      interval: `${(i % 3 + 1) * 30}s`,
      threshold: `≥ ${50 + i * 3}%`,
      level: i % 2 === 0 ? "告警" : "严重",
      status: i % 5 === 0 ? "停用" : "正常",
      remark: "",
    })),
  ];

  const params = [
    { id: 1, name: "自定义磁盘 IO", model: "主机", method: "脚本", key: "disk.io.custom", unit: "IOPS", interval: "60s", status: "正常", script: "/opt/scripts/disk_io.sh", note: "" },
    { id: 2, name: "业务队列深度", model: "中间件", method: "自定义", key: "mq.depth", unit: "条", interval: "30s", status: "正常", script: "", note: "HTTP 拉取 /metrics" },
    { id: 3, name: "表空间使用率", model: "数据库", method: "内置", key: "db.tablespace.used", unit: "%", interval: "120s", status: "正常", script: "", note: "" },
    { id: 4, name: "专线时延探测", model: "网络", method: "脚本", key: "link.latency", unit: "ms", interval: "60s", status: "停用", script: "/opt/scripts/ping_rtt.sh", note: "" },
    ...Array.from({ length: 10 }, (_, i) => ({
      id: i + 5,
      name: `扩展指标-${i + 5}`,
      model: ["主机", "网络", "数据库", "中间件"][i % 4],
      method: ["脚本", "自定义", "内置"][i % 3],
      key: `ext.metric.${i + 5}`,
      unit: ["%", "ms", "个"][i % 3],
      interval: `${(i % 4 + 1) * 30}s`,
      status: i % 4 === 0 ? "停用" : "正常",
      script: i % 3 === 0 ? `/opt/scripts/ext_${i + 5}.sh` : "",
      note: "",
    })),
  ];

  function chartBundle(seed) {
    const shift = Number(seed) || 0;
    return {
      subtitle: shift ? `筛选视图 #${shift}` : "近 24 小时",
      deviceAvail: [92, 94, 93, 95, 96, 94, 97, 95, 96, 98, 97, 99].map((v) => Math.min(100, v - (shift % 3))),
      linkConn: [98, 97, 99, 98, 96, 97, 98, 99, 97, 98, 99, 100].map((v) => Math.min(100, v - (shift % 2))),
      deviceLoad: [
        { name: "核心SW", value: 62 + shift },
        { name: "汇聚SW", value: 48 + shift },
        { name: "接入SW", value: 35 + shift },
        { name: "防火墙", value: 71 + shift },
        { name: "负载均衡", value: 54 + shift },
      ],
      linkLoad: [
        { name: "专线A", value: 58 + shift },
        { name: "专线B", value: 41 + shift },
        { name: "互联C", value: 73 + shift },
        { name: "接入D", value: 29 + shift },
        { name: "出口E", value: 66 + shift },
      ],
      alarms: [
        { name: "严重", value: 8 + (shift % 3), color: "#F53F57" },
        { name: "告警", value: 18 + (shift % 5), color: "#F7BA1E" },
        { name: "提示", value: 34 + (shift % 4), color: "#5B83FF" },
      ],
      serverPerf: [45, 48, 52, 49, 58, 61, 55, 63, 59, 67, 64, 70].map((v) => v + shift),
    };
  }

  window.PERF_DATA = { databases, alerts, params, chartBundle };
})();
