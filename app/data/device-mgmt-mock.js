(function () {
  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function nextId(prefix, list) {
    let max = 0;
    list.forEach((row) => {
      const m = String(row.id || "").match(/(\d+)$/);
      if (m) max = Math.max(max, Number(m[1]));
    });
    return `${prefix}${pad(max + 1)}`;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function includesIgnoreCase(hay, needle) {
    if (needle == null || needle === "") return true;
    return String(hay || "")
      .toLowerCase()
      .includes(String(needle).toLowerCase());
  }

  function makeHourlyLoad(seed, kind) {
    const now = Date.now();
    const rows = [];
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(now - i * 5 * 60 * 1000);
      const wave = Math.sin((seed + i) * 0.45) * 12;
      const noise = ((seed * 7 + i * 3) % 10) - 5;
      const cpu = Number(Math.min(98, Math.max(5, 42 + wave + noise)).toFixed(1));
      const traffic = Number(Math.max(1, 80 + seed * 3 + wave * 2 + noise).toFixed(1));
      rows.push({
        time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
        cpu: kind === "traffic" ? undefined : cpu,
        traffic: kind === "cpu" ? undefined : traffic,
      });
    }
    return rows.map((r) => ({
      time: r.time,
      cpu: r.cpu != null ? r.cpu : Number((30 + (seed % 20) + Math.random() * 10).toFixed(1)),
      traffic: r.traffic != null ? r.traffic : Number((50 + seed * 2 + Math.random() * 20).toFixed(1)),
    }));
  }

  function makeServerGroups(prefix, os) {
    const ok = "normal";
    const warn = "warning";
    return [
      {
        group: "系统",
        items: [
          { id: `${prefix}-sys-os`, name: os === "Windows" ? "Windows OS" : "Linux OS", status: ok },
          { id: `${prefix}-sys-uptime`, name: "运行时间", status: ok },
          { id: `${prefix}-sys-hostname`, name: "主机名", status: ok },
        ],
      },
      {
        group: "登录信息",
        items: [
          { id: `${prefix}-login-users`, name: "登录用户", status: ok },
          { id: `${prefix}-login-sessions`, name: "会话数", status: ok },
        ],
      },
      {
        group: "CPU",
        items: [
          { id: `${prefix}-cpu-util`, name: "CPU 利用率", status: ok },
          { id: `${prefix}-cpu-load`, name: "负载", status: warn },
        ],
      },
      {
        group: "内存",
        items: [
          { id: `${prefix}-mem-used`, name: "已用内存", status: ok },
          { id: `${prefix}-mem-swap`, name: "交换分区", status: ok },
        ],
      },
      {
        group: "磁盘 I/O",
        items: [
          { id: `${prefix}-disk-root`, name: os === "Windows" ? "C:" : "/", status: ok },
          { id: `${prefix}-disk-data`, name: os === "Windows" ? "D:" : "/data", status: ok },
        ],
      },
      {
        group: "网卡",
        items: [
          { id: `${prefix}-nic-0`, name: os === "Windows" ? "Ethernet0" : "eth0", status: ok },
          { id: `${prefix}-nic-1`, name: os === "Windows" ? "Ethernet1" : "eth1", status: ok },
        ],
      },
      {
        group: "TCP",
        items: [
          { id: `${prefix}-tcp-estab`, name: "已建立连接", status: ok },
          { id: `${prefix}-tcp-listen`, name: "监听端口", status: ok },
        ],
      },
    ];
  }

  function makeSwitchGroups(prefix) {
    return [
      {
        group: "系统",
        items: [
          { id: `${prefix}-sys-model`, name: "设备型号", status: "normal" },
          { id: `${prefix}-sys-fw`, name: "固件版本", status: "normal" },
        ],
      },
      {
        group: "端口",
        items: [
          { id: `${prefix}-port-up`, name: "Up 端口", status: "normal" },
          { id: `${prefix}-port-down`, name: "Down 端口", status: "warning" },
        ],
      },
      {
        group: "流量",
        items: [
          { id: `${prefix}-traf-in`, name: "入向流量", status: "normal" },
          { id: `${prefix}-traf-out`, name: "出向流量", status: "normal" },
        ],
      },
      {
        group: "CPU / 内存",
        items: [
          { id: `${prefix}-cpu`, name: "CPU", status: "normal" },
          { id: `${prefix}-mem`, name: "内存", status: "normal" },
        ],
      },
    ];
  }

  function makeNetDeviceGroups(prefix, kind) {
    return [
      {
        group: "系统",
        items: [
          { id: `${prefix}-sys`, name: `${kind}系统`, status: "normal" },
          { id: `${prefix}-ver`, name: "版本信息", status: "normal" },
        ],
      },
      {
        group: "接口",
        items: [
          { id: `${prefix}-if-up`, name: "可用接口", status: "normal" },
          { id: `${prefix}-if-err`, name: "错误计数", status: "warning" },
        ],
      },
      {
        group: "会话",
        items: [
          { id: `${prefix}-sess`, name: "会话数", status: "normal" },
          { id: `${prefix}-policy`, name: "策略命中", status: "normal" },
        ],
      },
    ];
  }

  let icons = [
    { id: "ICO01", name: "三层交换机", category: "三层交换机", enabled: true, asset: "fa-solid fa-network-wired", refCount: 2, remark: "核心/汇聚三层交换" },
    { id: "ICO02", name: "二层交换机", category: "二层交换机", enabled: true, asset: "fa-solid fa-sitemap", refCount: 1, remark: "接入层二层交换" },
    { id: "ICO03", name: "路由器", category: "路由器", enabled: true, asset: "fa-solid fa-route", refCount: 1, remark: "" },
    { id: "ICO04", name: "防火墙", category: "防火墙", enabled: true, asset: "fa-solid fa-shield-halved", refCount: 1, remark: "边界安全" },
    { id: "ICO05", name: "网闸", category: "网闸", enabled: true, asset: "fa-solid fa-door-closed", refCount: 1, remark: "内外网隔离" },
    { id: "ICO06", name: "负载均衡", category: "负载均衡", enabled: true, asset: "fa-solid fa-scale-balanced", refCount: 1, remark: "" },
    { id: "ICO07", name: "Windows 服务器", category: "Windows服务器", enabled: true, asset: "fa-brands fa-windows", refCount: 2, remark: "" },
    { id: "ICO08", name: "Linux 服务器", category: "Linux服务器", enabled: true, asset: "fa-brands fa-linux", refCount: 2, remark: "" },
    { id: "ICO09", name: "存储设备", category: "存储", enabled: true, asset: "fa-solid fa-hard-drive", refCount: 1, remark: "SAN/NAS" },
    { id: "ICO10", name: "数据库", category: "数据库", enabled: true, asset: "fa-solid fa-database", refCount: 1, remark: "" },
    { id: "ICO11", name: "中间件", category: "中间件", enabled: true, asset: "fa-solid fa-cubes", refCount: 1, remark: "应用中间件" },
  ];

  let devices = [
    { id: "DEV01", name: "SW-CORE-A", ip: "10.10.0.1", mac: "00:1A:2B:3C:4D:01", category: "switch_l3", online: true, protocol: "SNMPv2c", dept: "网络运维部", business: "核心交换", iconId: "ICO01" },
    { id: "DEV02", name: "SW-ACCESS-B1", ip: "10.10.0.21", mac: "00:1A:2B:3C:4D:21", category: "switch_l2", online: true, protocol: "SNMPv2c", dept: "网络运维部", business: "办公接入", iconId: "ICO02" },
    { id: "DEV03", name: "RT-EDGE-01", ip: "10.10.0.254", mac: "00:1A:2B:3C:4D:FE", category: "router", online: true, protocol: "SNMPv3", dept: "网络运维部", business: "出口路由", iconId: "ICO03" },
    { id: "DEV04", name: "FW-BORDER-01", ip: "10.20.0.1", mac: "00:1A:2B:3C:5D:01", category: "firewall", online: true, protocol: "SNMPv2c", dept: "安全运维部", business: "边界防护", iconId: "ICO04" },
    { id: "DEV05", name: "GAP-ISO-01", ip: "10.20.0.10", mac: "00:1A:2B:3C:5D:10", category: "gatekeeper", online: true, protocol: "Agent", dept: "安全运维部", business: "内外网隔离", iconId: "ICO05" },
    { id: "DEV06", name: "LB-APP-01", ip: "10.30.0.5", mac: "00:1A:2B:3C:6D:05", category: "loadbalancer", online: true, protocol: "SNMPv2c", dept: "应用运维部", business: "应用负载", iconId: "ICO06" },
    { id: "DEV07", name: "win-ad-01", ip: "10.10.2.21", mac: "00:50:56:A1:B2:C1", category: "server_windows", online: true, protocol: "WMI/Agent", dept: "系统运维部", business: "域控", iconId: "ICO07" },
    { id: "DEV08", name: "win-sql-01", ip: "10.10.2.23", mac: "00:50:56:A1:B2:C3", category: "server_windows", online: true, protocol: "WMI/Agent", dept: "系统运维部", business: "HR 库", iconId: "ICO07" },
    { id: "DEV09", name: "linux-web-01", ip: "10.10.3.31", mac: "00:50:56:A2:C3:D1", category: "server_linux", online: true, protocol: "SSH/Agent", dept: "系统运维部", business: "门户 Web", iconId: "ICO08" },
    { id: "DEV10", name: "linux-db-01", ip: "10.10.4.41", mac: "00:50:56:A2:C3:D2", category: "server_linux", online: true, protocol: "SSH/Agent", dept: "系统运维部", business: "核心库主机", iconId: "ICO08" },
    { id: "DEV11", name: "ST-SAN-01", ip: "10.10.5.10", mac: "00:1A:2B:3C:7D:10", category: "storage", online: true, protocol: "SNMPv2c", dept: "存储运维部", business: "集中存储", iconId: "ICO09" },
    { id: "DEV12", name: "MW-MQ-01", ip: "10.10.4.43", mac: "00:50:56:A3:D4:E1", category: "middleware", online: false, protocol: "Agent", dept: "应用运维部", business: "消息中间件", iconId: "ICO11" },
  ];

  const componentsByDevice = {
    DEV01: {
      groups: makeSwitchGroups("DEV01"),
      metrics: [
        { name: "CPU", value: 28, unit: "%" },
        { name: "内存", value: 46, unit: "%" },
        { name: "温度", value: 42, unit: "℃" },
        { name: "Up 端口", value: 18, unit: "个" },
        { name: "Down 端口", value: 6, unit: "个" },
      ],
      hourlyLoad: makeHourlyLoad(1, "traffic"),
    },
    DEV02: {
      groups: makeSwitchGroups("DEV02"),
      metrics: [
        { name: "CPU", value: 15, unit: "%" },
        { name: "内存", value: 32, unit: "%" },
        { name: "Up 端口", value: 20, unit: "个" },
        { name: "Down 端口", value: 4, unit: "个" },
      ],
      hourlyLoad: makeHourlyLoad(2, "traffic"),
    },
    DEV03: {
      groups: makeNetDeviceGroups("DEV03", "路由器"),
      metrics: [
        { name: "CPU", value: 35, unit: "%" },
        { name: "内存", value: 51, unit: "%" },
        { name: "会话", value: 1280, unit: "个" },
      ],
      hourlyLoad: makeHourlyLoad(3, "traffic"),
    },
    DEV04: {
      groups: makeNetDeviceGroups("DEV04", "防火墙"),
      metrics: [
        { name: "CPU", value: 41, unit: "%" },
        { name: "内存", value: 58, unit: "%" },
        { name: "并发连接", value: 8420, unit: "个" },
      ],
      hourlyLoad: makeHourlyLoad(4, "traffic"),
    },
    DEV05: {
      groups: makeNetDeviceGroups("DEV05", "网闸"),
      metrics: [
        { name: "CPU", value: 22, unit: "%" },
        { name: "摆渡任务", value: 12, unit: "个" },
      ],
      hourlyLoad: makeHourlyLoad(5, "cpu"),
    },
    DEV06: {
      groups: makeNetDeviceGroups("DEV06", "负载均衡"),
      metrics: [
        { name: "CPU", value: 48, unit: "%" },
        { name: "活跃连接", value: 3200, unit: "个" },
        { name: "吞吐量", value: 1.2, unit: "Gbps" },
      ],
      hourlyLoad: makeHourlyLoad(6, "traffic"),
    },
    DEV07: {
      groups: makeServerGroups("DEV07", "Windows"),
      metrics: [
        { name: "CPU", value: 55, unit: "%" },
        { name: "内存", value: 68, unit: "%" },
        { name: "磁盘", value: 42, unit: "%" },
        { name: "进程数", value: 186, unit: "个" },
      ],
      hourlyLoad: makeHourlyLoad(7, "cpu"),
    },
    DEV08: {
      groups: makeServerGroups("DEV08", "Windows"),
      metrics: [
        { name: "CPU", value: 72, unit: "%" },
        { name: "内存", value: 81, unit: "%" },
        { name: "磁盘", value: 63, unit: "%" },
        { name: "进程数", value: 214, unit: "个" },
      ],
      hourlyLoad: makeHourlyLoad(8, "cpu"),
    },
    DEV09: {
      groups: makeServerGroups("DEV09", "Linux"),
      metrics: [
        { name: "CPU", value: 38, unit: "%" },
        { name: "内存", value: 54, unit: "%" },
        { name: "磁盘", value: 47, unit: "%" },
        { name: "Load1", value: 0.62, unit: "" },
      ],
      hourlyLoad: makeHourlyLoad(9, "cpu"),
    },
    DEV10: {
      groups: makeServerGroups("DEV10", "Linux"),
      metrics: [
        { name: "CPU", value: 73, unit: "%" },
        { name: "内存", value: 79, unit: "%" },
        { name: "磁盘", value: 71, unit: "%" },
        { name: "Load1", value: 2.1, unit: "" },
      ],
      hourlyLoad: makeHourlyLoad(10, "cpu"),
    },
    DEV11: {
      groups: [
        {
          group: "存储池",
          items: [
            { id: "DEV11-pool-a", name: "Pool-A", status: "normal" },
            { id: "DEV11-pool-b", name: "Pool-B", status: "warning" },
          ],
        },
        {
          group: "卷",
          items: [
            { id: "DEV11-lun-1", name: "LUN-01", status: "normal" },
            { id: "DEV11-lun-2", name: "LUN-02", status: "normal" },
          ],
        },
      ],
      metrics: [
        { name: "容量使用", value: 64, unit: "%" },
        { name: "IOPS", value: 3200, unit: "" },
        { name: "延迟", value: 1.8, unit: "ms" },
      ],
      hourlyLoad: makeHourlyLoad(11, "cpu"),
    },
    DEV12: {
      groups: [
        {
          group: "中间件",
          items: [
            { id: "DEV12-broker", name: "Broker", status: "danger" },
            { id: "DEV12-queue", name: "队列", status: "warning" },
          ],
        },
        {
          group: "连接",
          items: [
            { id: "DEV12-conn", name: "客户端连接", status: "danger" },
          ],
        },
      ],
      metrics: [
        { name: "CPU", value: 0, unit: "%" },
        { name: "队列积压", value: 0, unit: "条" },
      ],
      hourlyLoad: makeHourlyLoad(12, "cpu"),
    },
  };

  let processes = [
    { id: "P001", deviceId: "DEV07", name: "lsass.exe", pid: 688, ppid: 580, user: "SYSTEM", priority: "Normal", critical: true, tty: "-", state: "alive", cpu: 1.2 },
    { id: "P002", deviceId: "DEV07", name: "svchost.exe", pid: 1024, ppid: 668, user: "SYSTEM", priority: "Normal", critical: false, tty: "-", state: "alive", cpu: 0.8 },
    { id: "P003", deviceId: "DEV07", name: "explorer.exe", pid: 3102, ppid: 2980, user: "admin", priority: "Normal", critical: false, tty: "Console", state: "alive", cpu: 2.4 },
    { id: "P004", deviceId: "DEV07", name: "Spooler", pid: 1880, ppid: 668, user: "SYSTEM", priority: "BelowNormal", critical: false, tty: "-", state: "sleep", cpu: 0.1 },
    { id: "P005", deviceId: "DEV08", name: "sqlservr.exe", pid: 2456, ppid: 668, user: "NETWORK SERVICE", priority: "High", critical: true, tty: "-", state: "alive", cpu: 28.5 },
    { id: "P006", deviceId: "DEV08", name: "sqlagent.exe", pid: 2680, ppid: 668, user: "NETWORK SERVICE", priority: "Normal", critical: true, tty: "-", state: "alive", cpu: 3.1 },
    { id: "P007", deviceId: "DEV08", name: "chrome.exe", pid: 4520, ppid: 3102, user: "dba", priority: "Normal", critical: false, tty: "Console", state: "wait", cpu: 5.6 },
    { id: "P008", deviceId: "DEV08", name: "old-backup.exe", pid: 5012, ppid: 1, user: "SYSTEM", priority: "Low", critical: false, tty: "-", state: "dead", cpu: 0 },
    { id: "P009", deviceId: "DEV09", name: "nginx", pid: 1201, ppid: 1, user: "nginx", priority: "20", critical: true, tty: "?", state: "alive", cpu: 4.2 },
    { id: "P010", deviceId: "DEV09", name: "php-fpm", pid: 1340, ppid: 1, user: "www", priority: "20", critical: true, tty: "?", state: "alive", cpu: 6.8 },
    { id: "P011", deviceId: "DEV09", name: "sshd", pid: 892, ppid: 1, user: "root", priority: "20", critical: true, tty: "?", state: "alive", cpu: 0.3 },
    { id: "P012", deviceId: "DEV09", name: "cron", pid: 755, ppid: 1, user: "root", priority: "20", critical: false, tty: "?", state: "sleep", cpu: 0 },
    { id: "P013", deviceId: "DEV10", name: "mysqld", pid: 2100, ppid: 1, user: "mysql", priority: "0", critical: true, tty: "?", state: "alive", cpu: 35.2 },
    { id: "P014", deviceId: "DEV10", name: "redis-server", pid: 1890, ppid: 1, user: "redis", priority: "20", critical: true, tty: "?", state: "alive", cpu: 8.4 },
    { id: "P015", deviceId: "DEV10", name: "node", pid: 3321, ppid: 2100, user: "app", priority: "20", critical: false, tty: "pts/0", state: "wait", cpu: 2.1 },
    { id: "P016", deviceId: "DEV10", name: "zombie-job", pid: 4011, ppid: 1, user: "app", priority: "20", critical: false, tty: "?", state: "dead", cpu: 0 },
  ];

  let processAlertRules = [
    { id: "PAR01", name: "MySQL 关键进程", matchName: "mysqld", onStart: true, onZombie: true, level: "告警", channel: "钉钉", method: "钉钉", notifyTo: "张三", departmentIds: ["ops"], peopleIds: ["zhang"], escalate: true, escalateHours: "1", escalateTo: "运维主管", enabled: true, description: "mysqld 启动或僵死告警", deviceScope: "全部" },
    { id: "PAR02", name: "SQL Server 关键进程", matchName: "sqlservr.exe", onStart: true, onZombie: true, level: "告警", channel: "邮件", method: "邮件", notifyTo: "王工", departmentIds: ["dba"], peopleIds: ["wang"], escalate: true, escalateHours: "2", escalateTo: "DBA主管", enabled: true, description: "SQL Server 主进程监测", deviceScope: "全部" },
    { id: "PAR03", name: "Nginx 僵死监测", matchName: "nginx", onStart: false, onZombie: true, level: "预警", channel: "微信", method: "微信", notifyTo: "周工", departmentIds: ["app"], peopleIds: ["zhou"], escalate: false, escalateHours: "", escalateTo: "", enabled: true, description: "仅僵死告警", deviceScope: "全部" },
  ];

  const processHistories = {
    P001: [
      { time: "2026-10-30 09:12:01", operator: "系统", action: "检测到关键进程启动" },
      { time: "2026-10-30 10:05:22", operator: "张三", action: "标记关注" },
    ],
    P005: [
      { time: "2026-10-29 18:20:11", operator: "系统", action: "CPU 占用持续偏高" },
      { time: "2026-10-30 08:01:00", operator: "王工", action: "调整优先级为 High" },
      { time: "2026-10-30 11:30:45", operator: "系统", action: "触发进程告警规则「SQL Server 关键进程」" },
    ],
    P009: [
      { time: "2026-10-30 07:00:00", operator: "系统", action: "进程存活检测正常" },
      { time: "2026-10-30 12:18:33", operator: "李四", action: "查看进程详情" },
    ],
    P013: [
      { time: "2026-10-30 06:45:10", operator: "系统", action: "检测到关键进程启动" },
      { time: "2026-10-30 13:02:18", operator: "孙工", action: "确认运行正常，备注：业务高峰" },
    ],
    P016: [
      { time: "2026-10-29 22:11:00", operator: "系统", action: "进程僵死告警" },
      { time: "2026-10-30 08:40:12", operator: "管理员", action: "停止进程" },
    ],
  };

  let software = [
    { id: "SW01", deviceId: "DEV07", name: "Active Directory Domain Services", version: "10.0.17763", publisher: "Microsoft", path: "C:\\Windows\\System32", status: "running", os: "Windows", checkedAt: "2026-10-30 14:10:00" },
    { id: "SW02", deviceId: "DEV07", name: "IIS", version: "10.0", publisher: "Microsoft", path: "C:\\Windows\\System32\\inetsrv", status: "running", os: "Windows", checkedAt: "2026-10-30 14:10:00" },
    { id: "SW03", deviceId: "DEV07", name: "7-Zip", version: "23.01", publisher: "Igor Pavlov", path: "C:\\Program Files\\7-Zip", status: "stopped", os: "Windows", checkedAt: "2026-10-30 14:10:00" },
    { id: "SW04", deviceId: "DEV08", name: "SQL Server 2019", version: "15.0.2000.5", publisher: "Microsoft", path: "C:\\Program Files\\Microsoft SQL Server", status: "running", os: "Windows", checkedAt: "2026-10-30 14:12:00" },
    { id: "SW05", deviceId: "DEV08", name: "SSMS", version: "19.2", publisher: "Microsoft", path: "C:\\Program Files\\Microsoft SQL Server Management Studio 19", status: "stopped", os: "Windows", checkedAt: "2026-10-30 14:12:00" },
    { id: "SW06", deviceId: "DEV09", name: "nginx", version: "1.24.0", publisher: "Nginx Inc.", path: "/usr/sbin/nginx", status: "running", os: "Linux", checkedAt: "2026-10-30 14:15:00" },
    { id: "SW07", deviceId: "DEV09", name: "PHP-FPM", version: "8.1.27", publisher: "PHP Group", path: "/usr/sbin/php-fpm", status: "running", os: "Linux", checkedAt: "2026-10-30 14:15:00" },
    { id: "SW08", deviceId: "DEV09", name: "fail2ban", version: "1.0.2", publisher: "Community", path: "/usr/bin/fail2ban-server", status: "stopped", os: "Linux", checkedAt: "2026-10-30 14:15:00" },
    { id: "SW09", deviceId: "DEV10", name: "MySQL", version: "8.0.36", publisher: "Oracle", path: "/usr/sbin/mysqld", status: "running", os: "Linux", checkedAt: "2026-10-30 14:18:00" },
    { id: "SW10", deviceId: "DEV10", name: "Redis", version: "7.2.4", publisher: "Redis Ltd.", path: "/usr/bin/redis-server", status: "running", os: "Linux", checkedAt: "2026-10-30 14:18:00" },
    { id: "SW11", deviceId: "DEV10", name: "Node.js", version: "20.11.1", publisher: "OpenJS", path: "/usr/bin/node", status: "stopped", os: "Linux", checkedAt: "2026-10-30 14:18:00" },
  ];

  function makeSwitchPorts(deviceId, portCount, upCount) {
    const ports = [];
    for (let i = 1; i <= portCount; i += 1) {
      const up = i <= upCount;
      const warn = up && i % 7 === 0;
      const row = Math.ceil(i / 12);
      const col = ((i - 1) % 12) + 1;
      ports.push({
        name: `GE0/0/${i}`,
        adminStatus: "up",
        operStatus: !up ? "down" : warn ? "warn" : "up",
        inRate: up ? Number((10 + i * 1.7 + (deviceId === "DEV01" ? 20 : 0)).toFixed(1)) : 0,
        outRate: up ? Number((8 + i * 1.3 + (deviceId === "DEV01" ? 15 : 0)).toFixed(1)) : 0,
        panelRow: row,
        panelCol: col,
      });
    }
    return ports;
  }

  const portsByDevice = {
    DEV01: makeSwitchPorts("DEV01", 24, 18),
    DEV02: makeSwitchPorts("DEV02", 24, 20),
  };

  let portBindings = [
    { terminalIp: "192.168.10.56", terminalMac: "AA:BB:CC:11:22:01", terminalName: "办公PC-张三", switchId: "DEV02", switchName: "SW-ACCESS-B1", portName: "GE0/0/3", vlan: 10, lastSeen: "2026-10-30 13:42:18" },
    { terminalIp: "192.168.10.88", terminalMac: "AA:BB:CC:11:22:08", terminalName: "办公PC-李四", switchId: "DEV02", switchName: "SW-ACCESS-B1", portName: "GE0/0/8", vlan: 10, lastSeen: "2026-10-30 14:01:05" },
    { terminalIp: "192.168.20.15", terminalMac: "AA:BB:CC:22:33:15", terminalName: "打印服务器", switchId: "DEV02", switchName: "SW-ACCESS-B1", portName: "GE0/0/15", vlan: 20, lastSeen: "2026-10-30 12:55:40" },
    { terminalIp: "10.10.3.31", terminalMac: "00:50:56:A2:C3:D1", terminalName: "linux-web-01", switchId: "DEV01", switchName: "SW-CORE-A", portName: "GE0/0/5", vlan: 30, lastSeen: "2026-10-30 14:20:00" },
    { terminalIp: "10.10.2.21", terminalMac: "00:50:56:A1:B2:C1", terminalName: "win-ad-01", switchId: "DEV01", switchName: "SW-CORE-A", portName: "GE0/0/7", vlan: 30, lastSeen: "2026-10-30 14:19:33" },
    { terminalIp: "192.168.50.100", terminalMac: "B8:27:EB:AA:BB:01", terminalName: "会议平板", switchId: "DEV02", switchName: "SW-ACCESS-B1", portName: "GE0/0/12", vlan: 50, lastSeen: "2026-10-30 11:08:22" },
    { terminalIp: "10.30.0.88", terminalMac: "00:0C:29:DE:AD:01", terminalName: "测试终端", switchId: "DEV01", switchName: "SW-CORE-A", portName: "GE0/0/16", vlan: 100, lastSeen: "2026-10-29 18:30:00" },
  ];

  /* ---------- icons ---------- */

  function listIcons(filter) {
    const f = filter || {};
    return icons
      .filter((row) => {
        if (f.name && !includesIgnoreCase(row.name, f.name)) return false;
        if (f.category && row.category !== f.category) return false;
        if (f.enabled != null && f.enabled !== "" && Boolean(row.enabled) !== Boolean(f.enabled)) return false;
        return true;
      })
      .map((row) => ({ ...row }));
  }

  function getIcon(id) {
    const row = icons.find((x) => x.id === id);
    return row ? { ...row } : null;
  }

  function saveIcon(payload) {
    const data = payload || {};
    if (data.id) {
      const i = icons.findIndex((x) => x.id === data.id);
      if (i < 0) return null;
      icons[i] = {
        ...icons[i],
        name: data.name != null ? data.name : icons[i].name,
        category: data.category != null ? data.category : icons[i].category,
        enabled: data.enabled != null ? Boolean(data.enabled) : icons[i].enabled,
        asset: data.asset != null ? data.asset : icons[i].asset,
        refCount: data.refCount != null ? Number(data.refCount) : icons[i].refCount,
        remark: data.remark != null ? data.remark : icons[i].remark,
      };
      return { ...icons[i] };
    }
    const row = {
      id: nextId("ICO", icons),
      name: data.name || "未命名图标",
      category: data.category || "中间件",
      enabled: data.enabled != null ? Boolean(data.enabled) : true,
      asset: data.asset || "fa-solid fa-server",
      refCount: data.refCount != null ? Number(data.refCount) : 0,
      remark: data.remark || "",
    };
    icons.push(row);
    return { ...row };
  }

  function removeIcon(id) {
    const before = icons.length;
    icons = icons.filter((x) => x.id !== id);
    return icons.length < before;
  }

  function toggleIcon(id) {
    const row = icons.find((x) => x.id === id);
    if (!row) return null;
    row.enabled = !row.enabled;
    return { ...row };
  }

  /* ---------- devices / snapshot ---------- */

  function listDevices(filter) {
    const f = filter || {};
    return devices
      .filter((row) => {
        if (f.name && !includesIgnoreCase(row.name, f.name)) return false;
        if (f.ip && !includesIgnoreCase(row.ip, f.ip)) return false;
        if (f.category && row.category !== f.category) return false;
        if (f.online != null && f.online !== "" && Boolean(row.online) !== Boolean(f.online)) return false;
        if (f.dept && !includesIgnoreCase(row.dept, f.dept)) return false;
        if (f.keyword) {
          const k = f.keyword;
          if (
            !includesIgnoreCase(row.name, k) &&
            !includesIgnoreCase(row.ip, k) &&
            !includesIgnoreCase(row.mac, k)
          ) {
            return false;
          }
        }
        return true;
      })
      .map((row) => ({ ...row }));
  }

  function getDevice(id) {
    const row = devices.find((x) => x.id === id);
    return row ? { ...row } : null;
  }

  function listSwitchDevices() {
    return devices
      .filter((d) => String(d.category || "").toLowerCase().includes("switch"))
      .map((d) => ({ ...d }));
  }

  function getDeviceSnapshot(deviceId) {
    const device = getDevice(deviceId);
    if (!device) return null;
    const snap = componentsByDevice[deviceId] || { groups: [], metrics: [], hourlyLoad: [] };
    return {
      device,
      groups: clone(snap.groups || []),
      metrics: clone(snap.metrics || []),
      hourlyLoad: clone(snap.hourlyLoad || []),
    };
  }

  /* ---------- processes ---------- */

  function listProcesses(filter) {
    const f = filter || {};
    return processes
      .filter((row) => {
        if (f.deviceId && row.deviceId !== f.deviceId) return false;
        if (f.name && !includesIgnoreCase(row.name, f.name)) return false;
        if (f.user && !includesIgnoreCase(row.user, f.user)) return false;
        if (f.state && row.state !== f.state) return false;
        if (f.critical != null && f.critical !== "" && Boolean(row.critical) !== Boolean(f.critical)) return false;
        return true;
      })
      .map((row) => ({ ...row }));
  }

  function stampNow() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function appendProcessHistory(id, action, operator) {
    if (!processHistories[id]) processHistories[id] = [];
    processHistories[id].unshift({
      time: stampNow(),
      operator: operator || "当前用户",
      action: action || "-",
    });
  }

  function getProcessHistory(id) {
    return (processHistories[id] || []).map((h) => ({ ...h }));
  }

  function updateProcess(id, patch) {
    const row = processes.find((x) => x.id === id);
    if (!row) return null;
    const p = patch || {};
    if (p.priority != null && p.priority !== row.priority) {
      appendProcessHistory(id, `调整优先级为 ${p.priority}`);
      row.priority = p.priority;
    }
    if (p.critical != null && Boolean(p.critical) !== row.critical) {
      appendProcessHistory(id, p.critical ? "标记关注" : "取消关注");
      row.critical = Boolean(p.critical);
    }
    if (p.state != null) row.state = p.state;
    if (p.cpu != null) row.cpu = Number(p.cpu);
    return { ...row };
  }

  function killProcess(id) {
    const row = processes.find((x) => x.id === id);
    if (!row) return null;
    row.state = "dead";
    row.cpu = 0;
    appendProcessHistory(id, "停止进程");
    return { ...row };
  }

  function listProcessAlertRules() {
    return processAlertRules.map((r) => ({ ...r }));
  }

  function getProcessAlertRule(id) {
    const row = processAlertRules.find((x) => x.id === id);
    return row ? { ...row } : null;
  }

  function saveProcessAlertRule(payload) {
    const data = payload || {};
    const fields = {
      name: data.name,
      matchName: data.matchName,
      onStart: data.onStart != null ? Boolean(data.onStart) : undefined,
      onZombie: data.onZombie != null ? Boolean(data.onZombie) : undefined,
      level: data.level,
      channel: data.channel != null ? data.channel : data.method,
      method: data.method != null ? data.method : data.channel,
      notifyTo: data.notifyTo,
      departmentIds: data.departmentIds,
      peopleIds: data.peopleIds,
      escalate: data.escalate != null ? Boolean(data.escalate) : undefined,
      escalateHours: data.escalateHours,
      escalateTo: data.escalateTo,
      enabled: data.enabled != null ? Boolean(data.enabled) : undefined,
      description: data.description,
      deviceScope: data.deviceScope,
    };
    if (data.id) {
      const i = processAlertRules.findIndex((x) => x.id === data.id);
      if (i < 0) return null;
      Object.keys(fields).forEach((k) => {
        if (fields[k] !== undefined) processAlertRules[i][k] = fields[k];
      });
      return { ...processAlertRules[i] };
    }
    const row = {
      id: nextId("PAR", processAlertRules),
      name: data.name || data.matchName || "未命名规则",
      matchName: data.matchName || "",
      onStart: Boolean(data.onStart),
      onZombie: data.onZombie != null ? Boolean(data.onZombie) : true,
      level: data.level || "告警",
      channel: data.channel || data.method || "邮件",
      method: data.method || data.channel || "邮件",
      notifyTo: data.notifyTo || "",
      departmentIds: Array.isArray(data.departmentIds) ? data.departmentIds : [],
      peopleIds: Array.isArray(data.peopleIds) ? data.peopleIds : [],
      escalate: Boolean(data.escalate),
      escalateHours: data.escalateHours || "",
      escalateTo: data.escalateTo || "",
      enabled: data.enabled != null ? Boolean(data.enabled) : true,
      description: data.description || "",
      deviceScope: data.deviceScope || "全部",
    };
    processAlertRules.push(row);
    return { ...row };
  }

  function toggleProcessAlertRule(id) {
    const row = processAlertRules.find((x) => x.id === id);
    if (!row) return null;
    row.enabled = !row.enabled;
    return { ...row };
  }

  function removeProcessAlertRule(id) {
    const before = processAlertRules.length;
    processAlertRules = processAlertRules.filter((x) => x.id !== id);
    return processAlertRules.length < before;
  }

  /* ---------- software ---------- */

  function listSoftware(filter) {
    const f = filter || {};
    return software
      .filter((row) => {
        if (f.deviceId && row.deviceId !== f.deviceId) return false;
        if (f.name && !includesIgnoreCase(row.name, f.name)) return false;
        if (f.os && row.os !== f.os) return false;
        if (f.status && row.status !== f.status) return false;
        return true;
      })
      .map((row) => ({ ...row }));
  }

  /* ---------- ports ---------- */

  function getPorts(deviceId) {
    const ports = portsByDevice[deviceId];
    return ports ? clone(ports) : [];
  }

  function queryPortBinding(q) {
    const query = String(q || "").trim();
    // 无关键字时返回全部绑定，供端口分布页默认展示
    if (!query) return portBindings.map((row) => ({ ...row }));
    const lower = query.toLowerCase();
    return portBindings
      .filter(
        (row) =>
          String(row.terminalIp || "").toLowerCase().includes(lower) ||
          String(row.terminalMac || "").toLowerCase().includes(lower) ||
          String(row.terminalName || "").toLowerCase().includes(lower)
      )
      .map((row) => ({ ...row }));
  }

  /* ---------- tag helpers ---------- */

  function processStateTag(state) {
    const map = {
      alive: { label: "活", tagClass: "success" },
      dead: { label: "死", tagClass: "danger" },
      sleep: { label: "sleep", tagClass: "warning" },
      wait: { label: "等待", tagClass: "muted" },
    };
    return map[state] || { label: state || "-", tagClass: "muted" };
  }

  function softwareStatusTag(status) {
    if (status === "running") return { label: "运行中", tagClass: "success" };
    if (status === "stopped") return { label: "已停止", tagClass: "muted" };
    return { label: status || "-", tagClass: "muted" };
  }

  function portOperTag(operStatus) {
    const map = {
      up: { label: "up", tagClass: "success" },
      down: { label: "down", tagClass: "danger" },
      warn: { label: "warn", tagClass: "warning" },
      idle: { label: "idle", tagClass: "muted" },
    };
    return map[operStatus] || { label: operStatus || "-", tagClass: "muted" };
  }

  window.DeviceMgmt = {
    listIcons,
    getIcon,
    saveIcon,
    removeIcon,
    toggleIcon,
    listDevices,
    getDevice,
    listSwitchDevices,
    getDeviceSnapshot,
    listProcesses,
    updateProcess,
    killProcess,
    listProcessAlertRules,
    getProcessAlertRule,
    saveProcessAlertRule,
    removeProcessAlertRule,
    toggleProcessAlertRule,
    getProcessHistory,
    listSoftware,
    getPorts,
    queryPortBinding,
    processStateTag,
    softwareStatusTag,
    portOperTag,
  };
})();
