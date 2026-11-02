(function () {
  // Mock「当前时刻」固定，便于逾期 / closedThisWeek 等指标稳定可测。
  const MOCK_TODAY = "2026-11-01";
  const MOCK_NOW = "2026-11-01 10:00:00";
  // 本周一 00:00（相对 MOCK_TODAY 所在周：2026-10-26）
  const WEEK_START = "2026-10-26 00:00:00";

  const TYPE_LABEL = {
    server: "服务器",
    endpoint: "终端",
    network: "网络设备",
    security: "安全设备",
    database: "数据库",
    middleware: "中间件",
    cloud: "云资源",
    bizsys: "业务系统",
    datasource: "数据源",
    exposure: "外部暴露面",
  };
  const TYPE_ORDER = Object.keys(TYPE_LABEL);

  const STATUS_META = {
    normal: { label: "正常", tagClass: "success" },
    shadow: { label: "影子资产", tagClass: "warning" },
    inconsistent: { label: "配置不一致", tagClass: "danger" },
    offline: { label: "离线", tagClass: "" },
  };

  const SOURCE_LABEL = { auto: "自动发现", manual: "手工登记" };

  const VULN_TYPE_LABEL = {
    cve: "漏洞",
    weak_password: "弱口令",
    baseline: "配置基线偏离",
    high_port: "高危端口暴露",
    plaintext: "明文传输",
    missing_patch: "补丁缺失",
    unsafe_component: "不安全组件",
  };

  const LEVEL_META = {
    critical: { label: "严重", tagClass: "danger" },
    high: { label: "高", tagClass: "danger" },
    medium: { label: "中", tagClass: "warning" },
    low: { label: "低", tagClass: "success" },
  };

  const STAGE_ORDER = ["discovered", "verified", "assigned", "fixing", "retest", "closed"];
  const STAGE_META = {
    discovered: { label: "发现", tagClass: "warning" },
    verified: { label: "验证", tagClass: "warning" },
    assigned: { label: "派单", tagClass: "" },
    fixing: { label: "修复", tagClass: "" },
    retest: { label: "复测", tagClass: "" },
    closed: { label: "关闭", tagClass: "success" },
  };

  const GRADE_META = {
    high: { label: "高", tagClass: "danger" },
    medium: { label: "中", tagClass: "warning" },
    low: { label: "低", tagClass: "success" },
  };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatNow(d) {
    const x = d || new Date(MOCK_NOW.replace(/-/g, "/"));
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())} ${pad(x.getHours())}:${pad(x.getMinutes())}:${pad(x.getSeconds())}`;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function nextId(prefix, list) {
    let max = 0;
    list.forEach((row) => {
      const m = String(row.id || "").match(/(\d+)$/);
      if (m) max = Math.max(max, Number(m[1]));
    });
    return `${prefix}${String(max + 1).padStart(3, "0")}`;
  }

  function includesIgnoreCase(hay, needle) {
    if (needle == null || needle === "") return true;
    return String(hay || "")
      .toLowerCase()
      .includes(String(needle).toLowerCase());
  }

  function typeLabel(type) {
    return TYPE_LABEL[type] || type || "-";
  }

  function statusMeta(status) {
    return STATUS_META[status] ? { ...STATUS_META[status] } : { label: status || "-", tagClass: "" };
  }

  function sourceLabel(source) {
    return SOURCE_LABEL[source] || source || "-";
  }

  function vulnTypeLabel(t) {
    return VULN_TYPE_LABEL[t] || t || "-";
  }

  function levelMeta(level) {
    return LEVEL_META[level] ? { ...LEVEL_META[level] } : { label: level || "-", tagClass: "" };
  }

  function stageMeta(stage) {
    return STAGE_META[stage] ? { ...STAGE_META[stage] } : { label: stage || "-", tagClass: "" };
  }

  function gradeMeta(grade) {
    return GRADE_META[grade] ? { ...GRADE_META[grade] } : { label: grade || "-", tagClass: "" };
  }

  let assets = [
    {
      id: "AS001",
      name: "核心业务应用服务器",
      type: "server",
      identity: "10.10.1.11",
      owner: "王磊",
      dept: "运维部",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-09-01 09:00:00",
      configSummary: "CentOS 7.9 · 8C16G · Nginx+Java",
      sensitivity: "high",
      accessLinks: [
        { name: "内网核心交换机", direction: "in" },
        { name: "OA 业务系统", direction: "out" },
      ],
      tags: ["核心", "生产"],
      extra: { os: "CentOS 7.9", cpu: "8C", mem: "16G" },
      alarmCount: 3,
    },
    {
      id: "AS002",
      name: "日志采集服务器",
      type: "server",
      identity: "10.10.1.12",
      owner: "陈明",
      dept: "运维部",
      source: "auto",
      status: "normal",
      discoveredAt: "2026-09-05 11:20:00",
      configSummary: "Ubuntu 22.04 · Filebeat+ELK",
      sensitivity: "medium",
      accessLinks: [{ name: "ES 集群", direction: "out" }],
      tags: ["日志"],
      extra: { os: "Ubuntu 22.04", role: "log" },
      alarmCount: 1,
    },
    {
      id: "AS003",
      name: "备份文件服务器",
      type: "server",
      identity: "10.10.1.13",
      owner: "赵磊",
      dept: "运维部",
      source: "manual",
      status: "offline",
      discoveredAt: "2026-08-18 14:00:00",
      configSummary: "Windows Server 2019 · 离线备份",
      sensitivity: "medium",
      accessLinks: [],
      tags: ["备份"],
      extra: { os: "Windows Server 2019" },
      alarmCount: 2,
    },
    {
      id: "AS004",
      name: "财务部办公终端",
      type: "endpoint",
      identity: "10.20.1.21",
      owner: "王芳",
      dept: "财务部",
      source: "auto",
      status: "normal",
      discoveredAt: "2026-09-12 08:30:00",
      configSummary: "Windows 11 · 域加入",
      sensitivity: "high",
      accessLinks: [{ name: "财务系统", direction: "out" }],
      tags: ["终端"],
      extra: { os: "Windows 11", hostname: "PC-FIN-01" },
      alarmCount: 0,
    },
    {
      id: "AS005",
      name: "研发测试终端",
      type: "endpoint",
      identity: "10.20.6.61",
      owner: "刘洋",
      dept: "研发中心",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-09-20 10:00:00",
      configSummary: "Windows 11 · 开发工具链",
      sensitivity: "medium",
      accessLinks: [{ name: "GitLab", direction: "out" }],
      tags: ["研发"],
      extra: { os: "Windows 11", hostname: "PC-RND-01" },
      alarmCount: 1,
    },
    {
      id: "AS006",
      name: "未登记办公终端",
      type: "endpoint",
      identity: "10.20.9.99",
      owner: "",
      dept: "行政部",
      source: "auto",
      status: "shadow",
      discoveredAt: "2026-10-28 16:40:00",
      configSummary: "Windows 10 · 未纳管",
      sensitivity: "low",
      accessLinks: [],
      tags: ["影子"],
      extra: { os: "Windows 10", hostname: "PC-UNK-99" },
      alarmCount: 2,
    },
    {
      id: "AS007",
      name: "核心交换机 SW-CORE-01",
      type: "network",
      identity: "10.10.0.1",
      owner: "陈明",
      dept: "运维部",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-07-01 09:00:00",
      configSummary: "Huawei CE6850 · 双上联",
      sensitivity: "high",
      accessLinks: [
        { name: "AS001", direction: "out" },
        { name: "边界防火墙", direction: "out" },
      ],
      tags: ["核心网络"],
      extra: { vendor: "Huawei", model: "CE6850" },
      alarmCount: 1,
    },
    {
      id: "AS008",
      name: "汇聚交换机 SW-AGG-02",
      type: "network",
      identity: "10.10.0.2",
      owner: "赵磊",
      dept: "运维部",
      source: "auto",
      status: "inconsistent",
      discoveredAt: "2026-08-10 13:15:00",
      configSummary: "配置基线偏离：SNMP 团体字不一致",
      sensitivity: "medium",
      accessLinks: [{ name: "SW-CORE-01", direction: "in" }],
      tags: ["汇聚"],
      extra: { vendor: "H3C", model: "S5560" },
      alarmCount: 4,
    },
    {
      id: "AS009",
      name: "办公接入交换机",
      type: "network",
      identity: "10.10.0.15",
      owner: "李强",
      dept: "运维部",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-09-03 09:40:00",
      configSummary: "Cisco 2960 · PoE",
      sensitivity: "low",
      accessLinks: [],
      tags: ["接入"],
      extra: { vendor: "Cisco", model: "2960" },
      alarmCount: 0,
    },
    {
      id: "AS010",
      name: "边界防火墙 FW-EDGE-01",
      type: "security",
      identity: "10.10.255.1",
      owner: "王磊",
      dept: "信息中心",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-07-15 10:00:00",
      configSummary: "山石防火墙 · 主备",
      sensitivity: "high",
      accessLinks: [
        { name: "互联网", direction: "out" },
        { name: "DMZ", direction: "out" },
      ],
      tags: ["边界", "安全"],
      extra: { vendor: "Hillstone", ha: true },
      alarmCount: 2,
    },
    {
      id: "AS011",
      name: "Web 应用防火墙 WAF-01",
      type: "security",
      identity: "10.10.255.8",
      owner: "陈明",
      dept: "信息中心",
      source: "auto",
      status: "normal",
      discoveredAt: "2026-08-22 11:00:00",
      configSummary: "长亭雷池 · 反向代理模式",
      sensitivity: "high",
      accessLinks: [{ name: "对外门户", direction: "out" }],
      tags: ["WAF"],
      extra: { vendor: "长亭", mode: "reverse" },
      alarmCount: 1,
    },
    {
      id: "AS012",
      name: "入侵检测 IDS-01",
      type: "security",
      identity: "10.10.255.12",
      owner: "",
      dept: "信息中心",
      source: "auto",
      status: "shadow",
      discoveredAt: "2026-10-29 09:20:00",
      configSummary: "旁路镜像 · 未登记责任人",
      sensitivity: "medium",
      accessLinks: [{ name: "核心交换机镜像口", direction: "in" }],
      tags: ["IDS", "影子"],
      extra: { mode: "span" },
      alarmCount: 3,
    },
    {
      id: "AS013",
      name: "生产 MySQL 主库",
      type: "database",
      identity: "mysql-prod-01.local",
      owner: "孙伟",
      dept: "运维部",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-07-20 09:00:00",
      configSummary: "MySQL 8.0 · 主从 · 敏感库",
      sensitivity: "high",
      accessLinks: [
        { name: "OA 业务系统", direction: "in" },
        { name: "从库 mysql-prod-02", direction: "out" },
      ],
      tags: ["生产库", "敏感"],
      extra: { engine: "MySQL", version: "8.0.36" },
      alarmCount: 2,
    },
    {
      id: "AS014",
      name: "报表 Oracle 库",
      type: "database",
      identity: "oracle-rpt-01.local",
      owner: "孙伟",
      dept: "运维部",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-08-01 10:30:00",
      configSummary: "Oracle 19c · 报表专用",
      sensitivity: "medium",
      accessLinks: [{ name: "报表平台", direction: "in" }],
      tags: ["报表"],
      extra: { engine: "Oracle", version: "19c" },
      alarmCount: 0,
    },
    {
      id: "AS015",
      name: "测试 Redis 实例",
      type: "database",
      identity: "10.30.2.44:6379",
      owner: "刘洋",
      dept: "研发中心",
      source: "auto",
      status: "inconsistent",
      discoveredAt: "2026-10-15 15:00:00",
      configSummary: "Redis 6 · 无密码 / 与台账不符",
      sensitivity: "low",
      accessLinks: [],
      tags: ["测试"],
      extra: { engine: "Redis", version: "6.2" },
      alarmCount: 5,
    },
    {
      id: "AS016",
      name: "Nginx 反向代理集群",
      type: "middleware",
      identity: "nginx-gw-01",
      owner: "王磊",
      dept: "运维部",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-08-05 09:00:00",
      configSummary: "Nginx 1.24 · Keepalived",
      sensitivity: "high",
      accessLinks: [
        { name: "WAF-01", direction: "in" },
        { name: "业务应用", direction: "out" },
      ],
      tags: ["网关"],
      extra: { software: "Nginx", version: "1.24" },
      alarmCount: 1,
    },
    {
      id: "AS017",
      name: "RabbitMQ 消息队列",
      type: "middleware",
      identity: "mq-prod-01.local",
      owner: "陈明",
      dept: "运维部",
      source: "auto",
      status: "normal",
      discoveredAt: "2026-09-08 14:20:00",
      configSummary: "RabbitMQ 3.12 · 三节点",
      sensitivity: "medium",
      accessLinks: [{ name: "订单服务", direction: "in" }],
      tags: ["MQ"],
      extra: { software: "RabbitMQ", version: "3.12" },
      alarmCount: 0,
    },
    {
      id: "AS018",
      name: "Tomcat 应用容器",
      type: "middleware",
      identity: "10.10.1.31:8080",
      owner: "刘洋",
      dept: "研发中心",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-09-18 11:00:00",
      configSummary: "Tomcat 9 · JDK 11",
      sensitivity: "medium",
      accessLinks: [{ name: "MySQL 主库", direction: "out" }],
      tags: ["应用容器"],
      extra: { software: "Tomcat", version: "9.0.80" },
      alarmCount: 1,
    },
    {
      id: "AS019",
      name: "对象存储桶 prod-files",
      type: "cloud",
      identity: "oss://prod-files",
      owner: "赵磊",
      dept: "运维部",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-08-28 09:30:00",
      configSummary: "私有云对象存储 · 私有读写",
      sensitivity: "high",
      accessLinks: [{ name: "文件服务", direction: "in" }],
      tags: ["对象存储"],
      extra: { region: "cn-east", acl: "private" },
      alarmCount: 0,
    },
    {
      id: "AS020",
      name: "弹性计算实例 ecs-app-03",
      type: "cloud",
      identity: "ecs-cn-east-03",
      owner: "王磊",
      dept: "运维部",
      source: "auto",
      status: "normal",
      discoveredAt: "2026-09-25 16:00:00",
      configSummary: "4C8G · VPC-prod",
      sensitivity: "medium",
      accessLinks: [{ name: "SLB", direction: "in" }],
      tags: ["云主机"],
      extra: { flavor: "4C8G", vpc: "VPC-prod" },
      alarmCount: 1,
    },
    {
      id: "AS021",
      name: "临时测试云主机",
      type: "cloud",
      identity: "ecs-test-88",
      owner: "",
      dept: "研发中心",
      source: "auto",
      status: "shadow",
      discoveredAt: "2026-10-30 08:10:00",
      configSummary: "2C4G · 公网 IP 暴露",
      sensitivity: "medium",
      accessLinks: [{ name: "公网", direction: "out" }],
      tags: ["临时", "影子"],
      extra: { flavor: "2C4G", publicIp: "203.0.113.88" },
      alarmCount: 4,
    },
    {
      id: "AS022",
      name: "OA 办公系统",
      type: "bizsys",
      identity: "https://oa.corp.local",
      owner: "李强",
      dept: "信息中心",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-07-01 08:00:00",
      configSummary: "致远 OA · 生产",
      sensitivity: "high",
      accessLinks: [
        { name: "MySQL 主库", direction: "out" },
        { name: "统一认证", direction: "out" },
      ],
      tags: ["业务系统", "核心"],
      extra: { vendor: "致远", env: "prod" },
      alarmCount: 2,
    },
    {
      id: "AS023",
      name: "人力资源系统",
      type: "bizsys",
      identity: "https://hr.corp.local",
      owner: "王芳",
      dept: "人力资源部",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-07-12 09:00:00",
      configSummary: "自研 HR · 内网",
      sensitivity: "high",
      accessLinks: [{ name: "Oracle 报表库", direction: "out" }],
      tags: ["HR"],
      extra: { env: "prod" },
      alarmCount: 0,
    },
    {
      id: "AS024",
      name: "运维工单门户",
      type: "bizsys",
      identity: "https://itsm.corp.local",
      owner: "陈明",
      dept: "运维部",
      source: "auto",
      status: "normal",
      discoveredAt: "2026-08-16 10:00:00",
      configSummary: "ITSM · 对接告警平台",
      sensitivity: "medium",
      accessLinks: [{ name: "告警平台", direction: "in" }],
      tags: ["ITSM"],
      extra: { env: "prod" },
      alarmCount: 1,
    },
    {
      id: "AS025",
      name: "客户主数据源 MDM",
      type: "datasource",
      identity: "jdbc:mysql://mdm.local:3306/mdm",
      owner: "孙伟",
      dept: "数据中心",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-08-08 09:00:00",
      configSummary: "主数据 · 只读账号",
      sensitivity: "high",
      accessLinks: [{ name: "数据中台", direction: "out" }],
      tags: ["主数据"],
      extra: { dialect: "mysql", mode: "readonly" },
      alarmCount: 0,
    },
    {
      id: "AS026",
      name: "日志分析数据源",
      type: "datasource",
      identity: "es://logs-prod/_all",
      owner: "陈明",
      dept: "运维部",
      source: "auto",
      status: "normal",
      discoveredAt: "2026-09-02 11:00:00",
      configSummary: "Elasticsearch · 日志索引",
      sensitivity: "medium",
      accessLinks: [{ name: "日志采集服务器", direction: "in" }],
      tags: ["日志"],
      extra: { dialect: "elasticsearch" },
      alarmCount: 1,
    },
    {
      id: "AS027",
      name: "外部订单同步源",
      type: "datasource",
      identity: "api://partner-orders/v1",
      owner: "刘洋",
      dept: "研发中心",
      source: "manual",
      status: "offline",
      discoveredAt: "2026-09-28 14:00:00",
      configSummary: "合作方 API · 当前不可达",
      sensitivity: "medium",
      accessLinks: [{ name: "订单服务", direction: "out" }],
      tags: ["外部"],
      extra: { protocol: "https", statusCode: 0 },
      alarmCount: 3,
    },
    {
      id: "AS028",
      name: "官网 HTTPS 入口",
      type: "exposure",
      identity: "https://www.example.com",
      owner: "王磊",
      dept: "信息中心",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-07-05 09:00:00",
      configSummary: "443 · 经 WAF 与防火墙",
      sensitivity: "high",
      accessLinks: [
        { name: "WAF-01", direction: "in" },
        { name: "互联网", direction: "in" },
      ],
      tags: ["对外", "官网"],
      extra: { port: 443, protocol: "https" },
      alarmCount: 2,
    },
    {
      id: "AS029",
      name: "VPN 接入门户",
      type: "exposure",
      identity: "https://vpn.example.com",
      owner: "陈明",
      dept: "信息中心",
      source: "auto",
      status: "normal",
      discoveredAt: "2026-08-12 10:00:00",
      configSummary: "SSL VPN · 双因素",
      sensitivity: "high",
      accessLinks: [{ name: "互联网", direction: "in" }],
      tags: ["VPN", "对外"],
      extra: { port: 443, mfa: true },
      alarmCount: 1,
    },
    {
      id: "AS030",
      name: "未登记外网测试端口",
      type: "exposure",
      identity: "203.0.113.50:8443",
      owner: "",
      dept: "研发中心",
      source: "auto",
      status: "shadow",
      discoveredAt: "2026-10-30 17:30:00",
      configSummary: "公网 8443 · 无备案",
      sensitivity: "high",
      accessLinks: [{ name: "互联网", direction: "in" }],
      tags: ["暴露面", "影子"],
      extra: { port: 8443, protocol: "https" },
      alarmCount: 6,
    },
    {
      id: "AS031",
      name: "监控跳板机",
      type: "server",
      identity: "10.10.1.50",
      owner: "赵磊",
      dept: "运维部",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-09-10 09:00:00",
      configSummary: "Debian 12 · Zabbix Proxy",
      sensitivity: "medium",
      accessLinks: [{ name: "监控平台", direction: "out" }],
      tags: ["监控"],
      extra: { os: "Debian 12" },
      alarmCount: 0,
    },
    {
      id: "AS032",
      name: "行政部共享终端",
      type: "endpoint",
      identity: "10.20.7.71",
      owner: "周敏",
      dept: "行政部",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-09-15 08:50:00",
      configSummary: "Windows 10 · 公共账号",
      sensitivity: "low",
      accessLinks: [],
      tags: ["公共终端"],
      extra: { os: "Windows 10", hostname: "PC-ADM-01" },
      alarmCount: 0,
    },
    {
      id: "AS033",
      name: "DMZ 负载均衡",
      type: "network",
      identity: "10.10.8.10",
      owner: "王磊",
      dept: "运维部",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-08-20 09:00:00",
      configSummary: "F5 BIG-IP · 四层",
      sensitivity: "high",
      accessLinks: [
        { name: "官网入口", direction: "in" },
        { name: "Nginx 集群", direction: "out" },
      ],
      tags: ["LB", "DMZ"],
      extra: { vendor: "F5", model: "BIG-IP" },
      alarmCount: 1,
    },
    {
      id: "AS034",
      name: "堡垒机 BH-01",
      type: "security",
      identity: "10.10.255.20",
      owner: "王磊",
      dept: "信息中心",
      source: "manual",
      status: "normal",
      discoveredAt: "2026-07-28 10:00:00",
      configSummary: "齐治堡垒机 · 运维审计",
      sensitivity: "high",
      accessLinks: [{ name: "生产服务器区", direction: "out" }],
      tags: ["堡垒机"],
      extra: { vendor: "齐治" },
      alarmCount: 0,
    },
    {
      id: "AS035",
      name: "数据仓库 Hive",
      type: "datasource",
      identity: "hive://dw.corp.local/default",
      owner: "孙伟",
      dept: "数据中心",
      source: "auto",
      status: "normal",
      discoveredAt: "2026-09-22 13:00:00",
      configSummary: "Hive 3 · 数仓层",
      sensitivity: "high",
      accessLinks: [{ name: "ETL 作业", direction: "in" }],
      tags: ["数仓"],
      extra: { dialect: "hive" },
      alarmCount: 1,
    },
  ];

  let discoverCandidates = [
    {
      id: "DC001",
      name: "新上线缓存节点",
      type: "middleware",
      identity: "10.10.1.77:11211",
      reason: "端口扫描发现 Memcached 11211",
    },
    {
      id: "DC002",
      name: "未知 Windows 终端",
      type: "endpoint",
      identity: "10.20.3.88",
      reason: "DHCP 租约新增，未匹配台账",
    },
    {
      id: "DC003",
      name: "临时 API 网关",
      type: "exposure",
      identity: "https://api-temp.example.com",
      reason: "证书透明度日志发现子域",
    },
    {
      id: "DC004",
      name: "测试 PostgreSQL",
      type: "database",
      identity: "10.30.2.90:5432",
      reason: "内网存活探测开放 5432",
    },
    {
      id: "DC005",
      name: "边缘路由器 ER-LAB",
      type: "network",
      identity: "10.10.0.250",
      reason: "SNMP 发现，厂商未登记",
    },
    {
      id: "DC006",
      name: "沙箱云主机",
      type: "cloud",
      identity: "ecs-sandbox-12",
      reason: "云平台 API 同步新增实例",
    },
  ];

  const CANDIDATE_POOL = [
    {
      name: "分支防火墙旁路节点",
      type: "security",
      identity: "10.40.1.1",
      reason: "流量镜像发现旁路设备",
    },
    {
      name: "旧版文件共享",
      type: "server",
      identity: "10.10.1.201",
      reason: "SMB 445 存活且无资产标签",
    },
    {
      name: "合作方回调地址",
      type: "exposure",
      identity: "https://callback.partner.example",
      reason: "出口流量 DNS 解析新增",
    },
    {
      name: "BI 只读数据源",
      type: "datasource",
      identity: "jdbc:oracle://bi-ro.local:1521/ORCL",
      reason: "连接串出现在配置仓库",
    },
    {
      name: "客服工作站",
      type: "endpoint",
      identity: "10.20.8.15",
      reason: "终端安全代理首次上报",
    },
  ];

  function makeTimeline(entries) {
    return entries.map((e) => ({
      at: e.at,
      action: e.action,
      by: e.by || "系统",
      note: e.note || "",
    }));
  }

  let vulns = [
    {
      id: "VL001",
      title: "CVE-2024-21626 runc 容器逃逸",
      vulnType: "cve",
      assetId: "AS001",
      level: "critical",
      stage: "discovered",
      owner: "",
      foundAt: "2026-10-28 09:10:00",
      dueAt: "2026-10-30 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-28 09:10:00", action: "discovered", by: "扫描引擎", note: "主机漏洞扫描命中" },
      ]),
    },
    {
      id: "VL002",
      title: "管理后台默认弱口令",
      vulnType: "weak_password",
      assetId: "AS016",
      level: "high",
      stage: "verified",
      owner: "",
      foundAt: "2026-10-27 11:00:00",
      dueAt: "2026-10-31 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-27 11:00:00", action: "discovered", by: "扫描引擎", note: "口令字典命中" },
        { at: "2026-10-27 15:20:00", action: "verify", by: "当前用户", note: "已人工复现登录" },
      ]),
    },
    {
      id: "VL003",
      title: "SSH 允许 root 密码登录",
      vulnType: "baseline",
      assetId: "AS002",
      level: "medium",
      stage: "assigned",
      owner: "陈明",
      foundAt: "2026-10-26 10:00:00",
      dueAt: "2026-11-05 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-26 10:00:00", action: "discovered", by: "基线检查", note: "" },
        { at: "2026-10-26 14:00:00", action: "verify", by: "当前用户", note: "确认配置项" },
        { at: "2026-10-27 09:00:00", action: "assign", by: "当前用户", note: "指派陈明" },
      ]),
    },
    {
      id: "VL004",
      title: "Redis 未授权访问 6379",
      vulnType: "high_port",
      assetId: "AS015",
      level: "critical",
      stage: "fixing",
      owner: "刘洋",
      foundAt: "2026-10-25 09:30:00",
      dueAt: "2026-10-29 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-25 09:30:00", action: "discovered", by: "端口扫描", note: "" },
        { at: "2026-10-25 11:00:00", action: "verify", by: "当前用户", note: "确认无认证" },
        { at: "2026-10-25 14:00:00", action: "assign", by: "当前用户", note: "指派刘洋" },
        { at: "2026-10-26 10:00:00", action: "fix", by: "刘洋", note: "加密码并限制来源" },
      ]),
    },
    {
      id: "VL005",
      title: "内网接口明文 HTTP 传输",
      vulnType: "plaintext",
      assetId: "AS022",
      level: "medium",
      stage: "retest",
      owner: "李强",
      foundAt: "2026-10-20 09:00:00",
      dueAt: "2026-11-03 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-20 09:00:00", action: "discovered", by: "流量探针", note: "" },
        { at: "2026-10-20 14:00:00", action: "verify", by: "当前用户", note: "" },
        { at: "2026-10-21 09:00:00", action: "assign", by: "当前用户", note: "指派李强" },
        { at: "2026-10-28 16:00:00", action: "fix", by: "李强", note: "切换 HTTPS" },
        { at: "2026-10-30 10:00:00", action: "retest", by: "当前用户", note: "待复测" },
      ]),
    },
    {
      id: "VL006",
      title: "Windows 关键补丁缺失 KB5034441",
      vulnType: "missing_patch",
      assetId: "AS004",
      level: "high",
      stage: "closed",
      owner: "王芳",
      foundAt: "2026-10-18 09:00:00",
      dueAt: "2026-10-25 18:00:00",
      closeReason: "fixed",
      timeline: makeTimeline([
        { at: "2026-10-18 09:00:00", action: "discovered", by: "补丁扫描", note: "" },
        { at: "2026-10-18 11:00:00", action: "verify", by: "当前用户", note: "" },
        { at: "2026-10-18 14:00:00", action: "assign", by: "当前用户", note: "指派王芳" },
        { at: "2026-10-22 10:00:00", action: "fix", by: "王芳", note: "安装补丁" },
        { at: "2026-10-23 09:00:00", action: "retest", by: "当前用户", note: "" },
        { at: "2026-10-27 11:00:00", action: "close", by: "当前用户", note: "复测通过" },
      ]),
    },
    {
      id: "VL007",
      title: "Log4j 1.x 不安全组件",
      vulnType: "unsafe_component",
      assetId: "AS018",
      level: "critical",
      stage: "assigned",
      owner: "刘洋",
      foundAt: "2026-10-24 10:00:00",
      dueAt: "2026-11-02 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-24 10:00:00", action: "discovered", by: "组件分析", note: "" },
        { at: "2026-10-24 15:00:00", action: "verify", by: "当前用户", note: "确认依赖树" },
        { at: "2026-10-25 09:30:00", action: "assign", by: "当前用户", note: "指派刘洋" },
      ]),
    },
    {
      id: "VL008",
      title: "CVE-2023-44487 HTTP/2 Rapid Reset",
      vulnType: "cve",
      assetId: "AS016",
      level: "high",
      stage: "fixing",
      owner: "王磊",
      foundAt: "2026-10-22 09:00:00",
      dueAt: "2026-11-04 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-22 09:00:00", action: "discovered", by: "扫描引擎", note: "" },
        { at: "2026-10-22 13:00:00", action: "verify", by: "当前用户", note: "" },
        { at: "2026-10-23 09:00:00", action: "assign", by: "当前用户", note: "指派王磊" },
        { at: "2026-10-29 10:00:00", action: "fix", by: "王磊", note: "升级 Nginx" },
      ]),
    },
    {
      id: "VL009",
      title: "数据库 sa 弱口令",
      vulnType: "weak_password",
      assetId: "AS013",
      level: "critical",
      stage: "discovered",
      owner: "",
      foundAt: "2026-10-30 08:40:00",
      dueAt: "2026-11-01 12:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-30 08:40:00", action: "discovered", by: "口令审计", note: "命中弱口令字典" },
      ]),
    },
    {
      id: "VL010",
      title: "SNMP 团体字 public",
      vulnType: "baseline",
      assetId: "AS008",
      level: "medium",
      stage: "verified",
      owner: "",
      foundAt: "2026-10-21 09:00:00",
      dueAt: "2026-11-06 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-21 09:00:00", action: "discovered", by: "基线检查", note: "" },
        { at: "2026-10-21 16:00:00", action: "verify", by: "当前用户", note: "与台账不一致" },
      ]),
    },
    {
      id: "VL011",
      title: "公网 8443 管理端口暴露",
      vulnType: "high_port",
      assetId: "AS030",
      level: "critical",
      stage: "discovered",
      owner: "",
      foundAt: "2026-10-30 17:35:00",
      dueAt: "2026-10-31 12:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-30 17:35:00", action: "discovered", by: "互联网测绘", note: "未备案端口" },
      ]),
    },
    {
      id: "VL012",
      title: "对象存储预签名 URL 明文传递",
      vulnType: "plaintext",
      assetId: "AS019",
      level: "low",
      stage: "closed",
      owner: "赵磊",
      foundAt: "2026-10-10 09:00:00",
      dueAt: "2026-10-20 18:00:00",
      closeReason: "false_positive",
      timeline: makeTimeline([
        { at: "2026-10-10 09:00:00", action: "discovered", by: "流量探针", note: "" },
        { at: "2026-10-12 10:00:00", action: "false_positive", by: "当前用户", note: "内网通道已加密" },
      ]),
    },
    {
      id: "VL013",
      title: "OpenSSL 补丁滞后",
      vulnType: "missing_patch",
      assetId: "AS010",
      level: "high",
      stage: "retest",
      owner: "王磊",
      foundAt: "2026-10-19 09:00:00",
      dueAt: "2026-11-02 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-19 09:00:00", action: "discovered", by: "补丁扫描", note: "" },
        { at: "2026-10-19 14:00:00", action: "verify", by: "当前用户", note: "" },
        { at: "2026-10-20 09:00:00", action: "assign", by: "当前用户", note: "指派王磊" },
        { at: "2026-10-28 11:00:00", action: "fix", by: "王磊", note: "已升级固件" },
        { at: "2026-10-31 09:30:00", action: "retest", by: "当前用户", note: "进入复测" },
      ]),
    },
    {
      id: "VL014",
      title: "Fastjson 1.2.68 不安全组件",
      vulnType: "unsafe_component",
      assetId: "AS022",
      level: "high",
      stage: "fixing",
      owner: "李强",
      foundAt: "2026-10-23 10:00:00",
      dueAt: "2026-11-05 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-23 10:00:00", action: "discovered", by: "组件分析", note: "" },
        { at: "2026-10-23 15:00:00", action: "verify", by: "当前用户", note: "" },
        { at: "2026-10-24 09:00:00", action: "assign", by: "当前用户", note: "指派李强" },
        { at: "2026-10-30 14:00:00", action: "fix", by: "李强", note: "升级至安全版本" },
      ]),
    },
    {
      id: "VL015",
      title: "CVE-2024-6387 OpenSSH 竞态",
      vulnType: "cve",
      assetId: "AS031",
      level: "medium",
      stage: "verified",
      owner: "",
      foundAt: "2026-10-29 09:00:00",
      dueAt: "2026-11-08 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-29 09:00:00", action: "discovered", by: "扫描引擎", note: "" },
        { at: "2026-10-29 16:00:00", action: "verify", by: "当前用户", note: "版本受影响" },
      ]),
    },
    {
      id: "VL016",
      title: "VPN 门户测试账号弱口令",
      vulnType: "weak_password",
      assetId: "AS029",
      level: "high",
      stage: "assigned",
      owner: "陈明",
      foundAt: "2026-10-27 09:00:00",
      dueAt: "2026-11-03 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-27 09:00:00", action: "discovered", by: "口令审计", note: "" },
        { at: "2026-10-27 12:00:00", action: "verify", by: "当前用户", note: "" },
        { at: "2026-10-28 09:00:00", action: "assign", by: "当前用户", note: "指派陈明" },
      ]),
    },
    {
      id: "VL017",
      title: "云主机安全组过于宽松",
      vulnType: "baseline",
      assetId: "AS021",
      level: "high",
      stage: "discovered",
      owner: "",
      foundAt: "2026-10-30 08:20:00",
      dueAt: "2026-11-01 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-30 08:20:00", action: "discovered", by: "云配置审计", note: "0.0.0.0/0 开放 22" },
      ]),
    },
    {
      id: "VL018",
      title: "调试端口 5005 对外开放",
      vulnType: "high_port",
      assetId: "AS018",
      level: "medium",
      stage: "closed",
      owner: "刘洋",
      foundAt: "2026-10-12 09:00:00",
      dueAt: "2026-10-18 18:00:00",
      closeReason: "fixed",
      timeline: makeTimeline([
        { at: "2026-10-12 09:00:00", action: "discovered", by: "端口扫描", note: "" },
        { at: "2026-10-12 11:00:00", action: "verify", by: "当前用户", note: "" },
        { at: "2026-10-12 14:00:00", action: "assign", by: "当前用户", note: "指派刘洋" },
        { at: "2026-10-15 10:00:00", action: "fix", by: "刘洋", note: "关闭调试端口" },
        { at: "2026-10-16 09:00:00", action: "retest", by: "当前用户", note: "" },
        { at: "2026-10-28 15:00:00", action: "close", by: "当前用户", note: "复测通过" },
      ]),
    },
    {
      id: "VL019",
      title: "合作方 API 明文回调",
      vulnType: "plaintext",
      assetId: "AS027",
      level: "medium",
      stage: "assigned",
      owner: "刘洋",
      foundAt: "2026-10-26 09:00:00",
      dueAt: "2026-11-07 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-26 09:00:00", action: "discovered", by: "流量探针", note: "" },
        { at: "2026-10-26 15:00:00", action: "verify", by: "当前用户", note: "" },
        { at: "2026-10-27 10:00:00", action: "assign", by: "当前用户", note: "指派刘洋" },
      ]),
    },
    {
      id: "VL020",
      title: "内核补丁缺失 CVE-2024-1086",
      vulnType: "missing_patch",
      assetId: "AS001",
      level: "critical",
      stage: "fixing",
      owner: "王磊",
      foundAt: "2026-10-21 09:00:00",
      dueAt: "2026-10-28 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-21 09:00:00", action: "discovered", by: "补丁扫描", note: "" },
        { at: "2026-10-21 12:00:00", action: "verify", by: "当前用户", note: "" },
        { at: "2026-10-22 09:00:00", action: "assign", by: "当前用户", note: "指派王磊" },
        { at: "2026-10-27 16:00:00", action: "fix", by: "王磊", note: "安排窗口升级" },
      ]),
    },
    {
      id: "VL021",
      title: "旧版 jQuery 不安全组件",
      vulnType: "unsafe_component",
      assetId: "AS023",
      level: "low",
      stage: "closed",
      owner: "王芳",
      foundAt: "2026-10-08 09:00:00",
      dueAt: "2026-10-20 18:00:00",
      closeReason: "fixed",
      timeline: makeTimeline([
        { at: "2026-10-08 09:00:00", action: "discovered", by: "组件分析", note: "" },
        { at: "2026-10-08 14:00:00", action: "verify", by: "当前用户", note: "" },
        { at: "2026-10-09 09:00:00", action: "assign", by: "当前用户", note: "指派王芳" },
        { at: "2026-10-14 10:00:00", action: "fix", by: "王芳", note: "升级前端依赖" },
        { at: "2026-10-15 09:00:00", action: "retest", by: "当前用户", note: "" },
        { at: "2026-10-29 10:30:00", action: "close", by: "当前用户", note: "本周关闭" },
      ]),
    },
    {
      id: "VL022",
      title: "WAF 规则集过期",
      vulnType: "baseline",
      assetId: "AS011",
      level: "medium",
      stage: "retest",
      owner: "陈明",
      foundAt: "2026-10-22 09:00:00",
      dueAt: "2026-11-04 18:00:00",
      closeReason: null,
      timeline: makeTimeline([
        { at: "2026-10-22 09:00:00", action: "discovered", by: "基线检查", note: "" },
        { at: "2026-10-22 14:00:00", action: "verify", by: "当前用户", note: "" },
        { at: "2026-10-23 09:00:00", action: "assign", by: "当前用户", note: "指派陈明" },
        { at: "2026-10-30 11:00:00", action: "fix", by: "陈明", note: "更新规则包" },
        { at: "2026-10-31 15:00:00", action: "retest", by: "当前用户", note: "待确认" },
      ]),
    },
  ];

  // —— assets API ——

  function listAssets(filter) {
    const f = filter || {};
    let rows = assets.slice();
    if (f.type) rows = rows.filter((a) => a.type === f.type);
    if (f.owner != null && f.owner !== "") {
      const ow = String(f.owner);
      if (ow === "__empty__" || ow === "(empty)") {
        rows = rows.filter((a) => !a.owner);
      } else {
        rows = rows.filter((a) => includesIgnoreCase(a.owner, ow));
      }
    }
    if (f.dept) rows = rows.filter((a) => includesIgnoreCase(a.dept, f.dept));
    if (f.source) rows = rows.filter((a) => a.source === f.source);
    if (f.status) rows = rows.filter((a) => a.status === f.status);
    if (f.keyword) {
      const kw = String(f.keyword).trim().toLowerCase();
      rows = rows.filter(
        (a) =>
          String(a.name || "").toLowerCase().includes(kw) ||
          String(a.identity || "").toLowerCase().includes(kw) ||
          String(a.id || "").toLowerCase().includes(kw)
      );
    }
    return rows.map((a) => clone(a));
  }

  function getAsset(id) {
    const a = assets.find((x) => x.id === id);
    return a ? clone(a) : null;
  }

  function saveAsset(payload) {
    const p = payload || {};
    if (p.id) {
      const idx = assets.findIndex((x) => x.id === p.id);
      if (idx < 0) return null;
      const prev = assets[idx];
      const next = {
        ...prev,
        ...p,
        id: prev.id,
        accessLinks: Array.isArray(p.accessLinks) ? p.accessLinks : prev.accessLinks,
        tags: Array.isArray(p.tags) ? p.tags : prev.tags,
        extra: p.extra != null ? p.extra : prev.extra,
      };
      assets[idx] = next;
      return clone(next);
    }
    const row = {
      id: nextId("AS", assets),
      name: p.name || "未命名资产",
      type: p.type || "server",
      identity: p.identity || "",
      owner: p.owner != null ? p.owner : "",
      dept: p.dept || "",
      source: p.source || "manual",
      status: p.status || "normal",
      discoveredAt: p.discoveredAt || formatNow(),
      configSummary: p.configSummary || "",
      sensitivity: p.sensitivity || "medium",
      accessLinks: Array.isArray(p.accessLinks) ? p.accessLinks : [],
      tags: Array.isArray(p.tags) ? p.tags : [],
      extra: p.extra || {},
      alarmCount: p.alarmCount != null ? p.alarmCount : 0,
    };
    assets.push(row);
    return clone(row);
  }

  function assignOwner(id, owner) {
    const a = assets.find((x) => x.id === id);
    if (!a) return null;
    a.owner = owner != null ? String(owner) : "";
    if (a.status === "shadow" && a.owner) {
      a.status = "normal";
    }
    return clone(a);
  }

  // —— discovery ——

  function listDiscoverCandidates() {
    return discoverCandidates.map((c) => clone(c));
  }

  function runDiscovery() {
    if (discoverCandidates.length === 0) {
      CANDIDATE_POOL.forEach((item) => {
        discoverCandidates.push({
          id: nextId("DC", discoverCandidates),
          name: item.name,
          type: item.type,
          identity: item.identity,
          reason: item.reason,
        });
      });
    }
    return listDiscoverCandidates();
  }

  function confirmDiscovery(ids) {
    const idSet = new Set(Array.isArray(ids) ? ids : []);
    const confirmed = [];
    const remain = [];
    discoverCandidates.forEach((c) => {
      if (!idSet.has(c.id)) {
        remain.push(c);
        return;
      }
      const owner = "";
      const row = {
        id: nextId("AS", assets),
        name: c.name,
        type: c.type,
        identity: c.identity,
        owner,
        dept: "",
        source: "auto",
        status: "shadow",
        discoveredAt: formatNow(),
        configSummary: c.reason || "自动发现入库",
        sensitivity: "medium",
        accessLinks: [],
        tags: ["自动发现"],
        extra: { fromCandidate: c.id, reason: c.reason },
        alarmCount: 0,
      };
      assets.push(row);
      confirmed.push(clone(row));
    });
    discoverCandidates = remain;
    return confirmed;
  }

  // —— vulns ——

  function listVulns(filter) {
    const f = filter || {};
    let rows = vulns.slice();
    if (f.assetId) rows = rows.filter((v) => v.assetId === f.assetId);
    if (f.vulnType) rows = rows.filter((v) => v.vulnType === f.vulnType);
    if (f.level) rows = rows.filter((v) => v.level === f.level);
    if (f.owner != null && f.owner !== "") {
      rows = rows.filter((v) => includesIgnoreCase(v.owner, f.owner));
    }
    if (f.stage) rows = rows.filter((v) => v.stage === f.stage);
    if (f.keyword) {
      const kw = String(f.keyword).trim().toLowerCase();
      rows = rows.filter(
        (v) =>
          String(v.title || "").toLowerCase().includes(kw) ||
          String(v.id || "").toLowerCase().includes(kw)
      );
    }
    return rows.map((v) => clone(v));
  }

  function getVuln(id) {
    const v = vulns.find((x) => x.id === id);
    return v ? clone(v) : null;
  }

  function advanceVulnStage(id, action, note) {
    const v = vulns.find((x) => x.id === id);
    if (!v) return { ok: false, message: "漏洞不存在" };
    const act = String(action || "");
    const noteText = note != null ? String(note) : "";
    let nextStage = null;
    let closeReason = null;

    if (act === "verify") {
      if (v.stage !== "discovered") return { ok: false, message: "仅「发现」阶段可验证" };
      nextStage = "verified";
    } else if (act === "false_positive") {
      if (v.stage !== "discovered" && v.stage !== "verified") {
        return { ok: false, message: "仅「发现/验证」阶段可标记误报" };
      }
      nextStage = "closed";
      closeReason = "false_positive";
    } else if (act === "assign") {
      if (v.stage !== "verified") return { ok: false, message: "仅「验证」阶段可派单" };
      nextStage = "assigned";
      if (noteText && !v.owner) v.owner = noteText;
    } else if (act === "fix") {
      if (v.stage !== "assigned") return { ok: false, message: "仅「派单」阶段可进入修复" };
      nextStage = "fixing";
    } else if (act === "retest") {
      if (v.stage !== "fixing") return { ok: false, message: "仅「修复」阶段可复测" };
      nextStage = "retest";
    } else if (act === "close") {
      if (v.stage !== "retest") return { ok: false, message: "仅「复测」阶段可关闭" };
      nextStage = "closed";
      closeReason = "fixed";
    } else {
      return { ok: false, message: "未知动作: " + act };
    }

    v.stage = nextStage;
    if (closeReason) v.closeReason = closeReason;
    v.timeline.push({
      at: formatNow(),
      action: act,
      by: "当前用户",
      note: noteText,
    });
    return { ok: true, data: clone(v) };
  }

  // —— risk profiles ——

  function deriveScore(asset, vulnsForAsset) {
    const open = vulnsForAsset.filter((v) => v.stage !== "closed");
    const vulnPart = Math.min(
      40,
      open.length * 8 + open.filter((v) => v.level === "critical" || v.level === "high").length * 6
    );
    const sensPart = asset.sensitivity === "high" ? 25 : asset.sensitivity === "medium" ? 15 : 5;
    const exposurePart =
      asset.type === "exposure" ? 20 : Math.min(15, (asset.accessLinks || []).length * 3);
    const alarmPart = Math.min(20, (asset.alarmCount != null ? asset.alarmCount : 2) * 4);
    const score = Math.min(100, vulnPart + sensPart + exposurePart + alarmPart);
    const grade = score >= 70 ? "high" : score >= 40 ? "medium" : "low";
    return {
      score,
      grade,
      scoreBreakdown: { vuln: vulnPart, alarm: alarmPart, sensitivity: sensPart, exposure: exposurePart },
      vulnCount: open.length,
    };
  }

  function buildRelated(asset, openVulns) {
    const id = asset.id;
    const events = [
      { id: "EV-" + id + "-1", title: "登录异常", at: "2026-10-30 08:12:00" },
      { id: "EV-" + id + "-2", title: "配置变更", at: "2026-10-28 14:20:00" },
    ].slice(0, asset.alarmCount > 0 ? 2 : 1);
    const configs = [
      { id: "CFG-" + id, name: "安全基线策略", status: asset.status === "inconsistent" ? "偏离" : "合规" },
    ];
    const permissions = [
      { id: "PERM-" + id, name: "运维账号权限", count: asset.sensitivity === "high" ? 6 : 3 },
    ];
    const dataAssets = asset.sensitivity === "high"
      ? [{ id: "DA-" + id, name: "关联敏感数据表", level: "高" }]
      : [];
    const tickets = openVulns.slice(0, 3).map((v, i) => ({
      id: "TK-" + v.id,
      title: "处置: " + v.title,
      status: v.stage === "closed" ? "已关闭" : "处理中",
      priority: v.level === "critical" || v.level === "high" ? "P1" : "P2",
    }));
    if (asset.status === "shadow" || !asset.owner) {
      tickets.push({
        id: "TK-OWN-" + id,
        title: "补登责任人",
        status: "处理中",
        priority: "P2",
      });
    }
    return { events, configs, permissions, dataAssets, tickets };
  }

  function buildProfile(asset) {
    const relatedVulns = vulns.filter((v) => v.assetId === asset.id);
    const derived = deriveScore(asset, relatedVulns);
    const openVulns = relatedVulns.filter((v) => v.stage !== "closed");
    const alarmCount = asset.alarmCount != null ? asset.alarmCount : 0;
    const related = buildRelated(asset, openVulns);
    const openTicketCount = related.tickets.filter((t) => t.status !== "已关闭").length;
    let priority = "P3";
    if (derived.grade === "high" || openVulns.some((v) => v.level === "critical")) priority = "P1";
    else if (derived.grade === "medium" || openVulns.length > 0) priority = "P2";

    const lastTimeline = relatedVulns
      .flatMap((v) => v.timeline || [])
      .map((t) => t.at)
      .sort()
      .reverse()[0];

    return {
      assetId: asset.id,
      score: derived.score,
      grade: derived.grade,
      vulnCount: derived.vulnCount,
      alarmCount,
      openTicketCount,
      priority,
      lastHandledAt: lastTimeline || asset.discoveredAt,
      scoreBreakdown: derived.scoreBreakdown,
      related,
      // 列表展示常用字段
      name: asset.name,
      type: asset.type,
      identity: asset.identity,
      owner: asset.owner,
      dept: asset.dept,
      sensitivity: asset.sensitivity,
      status: asset.status,
    };
  }

  function listRiskProfiles(filter) {
    const f = filter || {};
    let rows = assets.map((a) => buildProfile(a));
    if (f.type) rows = rows.filter((r) => r.type === f.type);
    if (f.grade) rows = rows.filter((r) => r.grade === f.grade);
    if (f.sensitivity) rows = rows.filter((r) => r.sensitivity === f.sensitivity);
    if (f.priority) rows = rows.filter((r) => r.priority === f.priority);
    if (f.keyword) {
      const kw = String(f.keyword).trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          String(r.name || "").toLowerCase().includes(kw) ||
          String(r.identity || "").toLowerCase().includes(kw) ||
          String(r.assetId || "").toLowerCase().includes(kw)
      );
    }
    rows = rows.slice().sort((a, b) => b.score - a.score);
    return rows.map((r) => clone(r));
  }

  function getAssetProfile(assetId) {
    const asset = assets.find((x) => x.id === assetId);
    if (!asset) return null;
    const profile = buildProfile(asset);
    return clone({
      ...profile,
      asset: clone(asset),
      vulns: vulns.filter((v) => v.assetId === assetId).map((v) => clone(v)),
    });
  }

  // —— metrics ——

  function ledgerMetrics() {
    return {
      total: assets.length,
      shadow: assets.filter((a) => a.status === "shadow").length,
      missingOwner: assets.filter((a) => !a.owner).length,
      inconsistent: assets.filter((a) => a.status === "inconsistent").length,
    };
  }

  function vulnMetrics() {
    const now = MOCK_NOW;
    const pendingVerify = vulns.filter((v) => v.stage === "discovered").length;
    const inProgress = vulns.filter(
      (v) => v.stage === "assigned" || v.stage === "fixing" || v.stage === "retest"
    ).length;
    const overdue = vulns.filter((v) => v.stage !== "closed" && String(v.dueAt) < now).length;
    const closedThisWeek = vulns.filter((v) => {
      if (v.stage !== "closed") return false;
      const last = (v.timeline || [])[(v.timeline || []).length - 1];
      return last && String(last.at) >= WEEK_START;
    }).length;
    return { pendingVerify, inProgress, overdue, closedThisWeek };
  }

  function riskMetrics() {
    const profiles = assets.map((a) => buildProfile(a));
    const high = profiles.filter((p) => p.grade === "high").length;
    const medium = profiles.filter((p) => p.grade === "medium").length;
    const low = profiles.filter((p) => p.grade === "low").length;
    const priorityOpen = profiles.filter((p) => {
      if (p.grade !== "high") return false;
      if (p.openTicketCount > 0) return true;
      const openHigh = vulns.some(
        (v) =>
          v.assetId === p.assetId &&
          v.stage !== "closed" &&
          (v.level === "critical" || v.level === "high")
      );
      return openHigh;
    }).length;
    return { high, medium, low, priorityOpen };
  }

  window.AssetSecurity = {
    TYPE_LABEL,
    TYPE_ORDER,
    STATUS_META,
    SOURCE_LABEL,
    VULN_TYPE_LABEL,
    LEVEL_META,
    STAGE_ORDER,
    STAGE_META,
    GRADE_META,
    MOCK_TODAY,
    MOCK_NOW,
    typeLabel,
    statusMeta,
    sourceLabel,
    vulnTypeLabel,
    levelMeta,
    stageMeta,
    gradeMeta,
    listAssets,
    getAsset,
    saveAsset,
    assignOwner,
    listDiscoverCandidates,
    runDiscovery,
    confirmDiscovery,
    listVulns,
    getVuln,
    advanceVulnStage,
    listRiskProfiles,
    getAssetProfile,
    ledgerMetrics,
    vulnMetrics,
    riskMetrics,
  };
})();
