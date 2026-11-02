(function () {
  // Mock「今天」固定为种子数据中的业务日，与 opsEvents 时间前缀一致，便于 opsMetrics 稳定可测。
  const MOCK_TODAY = "2026-10-30";

  const TYPE_LABEL = {
    usb: "U盘",
    hdd: "移动硬盘",
    optical: "光盘刻录",
    portable: "便携存储",
  };

  const AUDIT_ACTION_LABEL = {
    mount: "挂载",
    eject: "弹出",
    read: "读取",
    write: "写入",
    copy: "拷贝",
    scan: "病毒扫描",
  };

  const RISK_STATUS_META = {
    normal: { label: "正常", tagClass: "success" },
    pending: { label: "待处置", tagClass: "warning" },
    isolated: { label: "已隔离", tagClass: "danger" },
    false_positive: { label: "误报", tagClass: "" },
  };

  const SIGN_META = {
    compromise: { label: "疑似失陷", tagClass: "danger" },
  };

  const CATEGORY_LABEL = {
    power: "开关机",
    syslog: "系统日志",
    software: "软件安装",
    hardware: "硬件变更",
    account: "账号变更",
    process: "进程服务",
    network: "网络连接",
    share: "共享访问",
    file: "文件目录",
    usb: "USB操作",
    traffic: "主机流量",
  };

  const CHANNEL_KEYS = ["printer", "burner", "bluetooth", "camera", "serial"];

  const CHANNEL_LABEL = {
    printer: "打印机",
    burner: "刻录机",
    bluetooth: "蓝牙",
    camera: "摄像头",
    serial: "串口",
    remote: "远程控制工具",
    fileTransfer: "文件传输工具",
  };

  const REMOTE_TOOLS = ["向日葵", "ToDesk", "TeamViewer", "AnyDesk", "Windows远程桌面"];
  const FT_TOOLS = ["微信文件传输", "QQ文件传输", "飞书云盘", "企业网盘同步", "百度网盘"];

  const MODE_META = {
    allow: { label: "允许", tagClass: "success" },
    restrict: { label: "受限", tagClass: "warning" },
    deny: { label: "禁止", tagClass: "danger" },
  };

  const AUTH_META = {
    pending: { label: "待审批", tagClass: "warning" },
    authorized: { label: "已授权", tagClass: "success" },
    readonly: { label: "只读", tagClass: "" },
    revoked: { label: "已撤销", tagClass: "danger" },
  };

  const RISK_META = {
    none: { label: "无", tagClass: "" },
    low: { label: "低", tagClass: "success" },
    medium: { label: "中", tagClass: "warning" },
    high: { label: "高", tagClass: "danger" },
  };

  const SYNC_META = {
    synced: { label: "已下发", tagClass: "success" },
    pending: { label: "待同步", tagClass: "warning" },
    conflict: { label: "冲突", tagClass: "danger" },
  };

  const HANDLE_META = {
    open: { label: "未处置", tagClass: "warning" },
    done: { label: "已处理", tagClass: "success" },
  };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatNow(d) {
    const x = d || new Date();
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())} ${pad(x.getHours())}:${pad(x.getMinutes())}:${pad(x.getSeconds())}`;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function authTag(status) {
    return AUTH_META[status] ? { ...AUTH_META[status] } : { label: status || "-", tagClass: "" };
  }

  function riskTag(level) {
    return RISK_META[level] ? { ...RISK_META[level] } : { label: level || "-", tagClass: "" };
  }

  function riskStatusTag(status) {
    return RISK_STATUS_META[status] ? { ...RISK_STATUS_META[status] } : { label: status || "-", tagClass: "" };
  }

  function auditActionLabel(action) {
    return AUDIT_ACTION_LABEL[action] || action || "-";
  }

  function signTag(sign) {
    if (!sign) return null;
    return SIGN_META[sign] ? { ...SIGN_META[sign] } : { label: sign, tagClass: "danger" };
  }

  function syncTag(status) {
    return SYNC_META[status] ? { ...SYNC_META[status] } : { label: status || "-", tagClass: "" };
  }

  function handleTag(status) {
    return HANDLE_META[status] ? { ...HANDLE_META[status] } : { label: status || "-", tagClass: "" };
  }

  function modeTag(mode) {
    return MODE_META[mode] ? { ...MODE_META[mode] } : { label: mode || "-", tagClass: "" };
  }

  function resolvePolicyChannels(bindingOrPolicy) {
    if (!bindingOrPolicy) return null;
    if (bindingOrPolicy.printer != null) return bindingOrPolicy;
    const policy = peripheralPolicies.find((p) => p.id === bindingOrPolicy.policyId);
    return policy || null;
  }

  function summarizePeripheral(bindingOrPolicy) {
    const src = resolvePolicyChannels(bindingOrPolicy);
    if (!src) return "-";
    const parts = [
      `打印${modeTag(src.printer).label}`,
      `蓝牙${modeTag(src.bluetooth).label}`,
    ];
    if (src.burner) parts.push(`刻录${modeTag(src.burner).label}`);
    return parts.join(" · ");
  }

  let hosts = [
    { id: "H-FIN-01", name: "PC-FIN-01", ip: "10.20.1.11", dept: "财务部", os: "Windows 11", online: true },
    { id: "H-FIN-02", name: "PC-FIN-02", ip: "10.20.1.12", dept: "财务部", os: "Windows 10", online: true },
    { id: "H-HR-01", name: "PC-HR-01", ip: "10.20.2.21", dept: "人力资源部", os: "Windows 11", online: true },
    { id: "H-IT-01", name: "PC-IT-01", ip: "10.20.3.31", dept: "信息中心", os: "Windows 11", online: true },
    { id: "H-IT-02", name: "PC-IT-02", ip: "10.20.3.32", dept: "信息中心", os: "Windows 10", online: false },
    { id: "H-MKT-01", name: "PC-MKT-01", ip: "10.20.4.41", dept: "市场部", os: "Windows 11", online: true },
    { id: "H-OPS-01", name: "PC-OPS-01", ip: "10.20.5.51", dept: "运维部", os: "Windows 11", online: true },
    { id: "H-OPS-02", name: "PC-OPS-02", ip: "10.20.5.52", dept: "运维部", os: "麒麟 V10", online: true },
    { id: "H-RND-01", name: "PC-RND-01", ip: "10.20.6.61", dept: "研发中心", os: "Windows 11", online: true },
    { id: "H-ADM-01", name: "PC-ADM-01", ip: "10.20.7.71", dept: "行政部", os: "Windows 10", online: true },
    { id: "H-LEG-01", name: "PC-LEG-01", ip: "10.20.8.81", dept: "法务部", os: "Windows 11", online: true },
    { id: "H-AUD-01", name: "PC-AUD-01", ip: "10.20.9.91", dept: "审计部", os: "Windows 10", online: true },
    { id: "H-SEC-01", name: "PC-SEC-01", ip: "10.20.10.11", dept: "信息中心", os: "麒麟 V10", online: true },
  ];

  let storages = [
    {
      id: "ST-001",
      name: "金士顿 DataTraveler 32G",
      sn: "KT-DT-32G-88421",
      capacity: "32GB",
      type: "usb",
      owner: "王芳",
      dept: "财务部",
      hostId: "H-FIN-01",
      authStatus: "authorized",
      riskLevel: "none",
      riskStatus: "normal",
      registeredAt: "2026-09-12 09:20:00",
      lastUsedAt: "2026-10-30 08:41:12",
    },
    {
      id: "ST-002",
      name: "闪迪 Ultra Fit 64G",
      sn: "SD-UF-64G-10293",
      capacity: "64GB",
      type: "usb",
      owner: "李强",
      dept: "人力资源部",
      hostId: "H-HR-01",
      authStatus: "pending",
      riskLevel: "low",
      riskStatus: "pending",
      registeredAt: "2026-10-28 14:05:33",
      lastUsedAt: "2026-10-29 16:22:08",
    },
    {
      id: "ST-003",
      name: "希捷 Backup Plus 1T",
      sn: "SG-BP-1T-55018",
      capacity: "1TB",
      type: "hdd",
      owner: "陈明",
      dept: "信息中心",
      hostId: "H-IT-01",
      authStatus: "authorized",
      riskLevel: "medium",
      riskStatus: "pending",
      registeredAt: "2026-08-03 10:11:00",
      lastUsedAt: "2026-10-30 11:03:45",
    },
    {
      id: "ST-004",
      name: "西部数据 My Passport 2T",
      sn: "WD-MP-2T-77102",
      capacity: "2TB",
      type: "hdd",
      owner: "赵磊",
      dept: "运维部",
      hostId: "H-OPS-01",
      authStatus: "readonly",
      riskLevel: "none",
      riskStatus: "normal",
      registeredAt: "2026-07-21 15:40:20",
      lastUsedAt: "2026-10-29 09:18:01",
    },
    {
      id: "ST-005",
      name: "华硕外置 DVD 刻录机",
      sn: "AS-DVD-XR-3301",
      capacity: "DVD±RW",
      type: "optical",
      owner: "周敏",
      dept: "行政部",
      hostId: "H-ADM-01",
      authStatus: "authorized",
      riskLevel: "none",
      riskStatus: "normal",
      registeredAt: "2026-06-15 11:00:00",
      lastUsedAt: "2026-10-27 13:55:40",
    },
    {
      id: "ST-006",
      name: "先锋 BDR-XD08",
      sn: "PN-BDR-XD08-9912",
      capacity: "BD-R",
      type: "optical",
      owner: "孙涛",
      dept: "研发中心",
      hostId: "H-RND-01",
      authStatus: "revoked",
      riskLevel: "high",
      riskStatus: "isolated",
      registeredAt: "2026-05-08 09:30:00",
      lastUsedAt: "2026-10-20 17:12:09",
    },
    {
      id: "ST-007",
      name: "联想移动固态 512G",
      sn: "LN-SSD-512-44190",
      capacity: "512GB",
      type: "portable",
      owner: "刘洋",
      dept: "市场部",
      hostId: "H-MKT-01",
      authStatus: "authorized",
      riskLevel: "low",
      riskStatus: "normal",
      registeredAt: "2026-09-01 08:50:00",
      lastUsedAt: "2026-10-30 10:22:33",
    },
    {
      id: "ST-008",
      name: "三星 T7 Shield 1T",
      sn: "SS-T7-1T-22881",
      capacity: "1TB",
      type: "portable",
      owner: "黄伟",
      dept: "运维部",
      hostId: "H-OPS-02",
      authStatus: "pending",
      riskLevel: "none",
      riskStatus: "normal",
      registeredAt: "2026-10-29 16:40:00",
      lastUsedAt: "2026-10-29 17:05:12",
    },
    {
      id: "ST-009",
      name: "爱国者 U330 16G",
      sn: "AG-U330-16G-1092",
      capacity: "16GB",
      type: "usb",
      owner: "吴静",
      dept: "财务部",
      hostId: "H-FIN-02",
      authStatus: "authorized",
      riskLevel: "high",
      riskStatus: "pending",
      registeredAt: "2026-10-10 09:05:00",
      lastUsedAt: "2026-10-30 09:48:20",
    },
    {
      id: "ST-010",
      name: "东芝 Canvio Basics 4T",
      sn: "TS-CB-4T-66001",
      capacity: "4TB",
      type: "hdd",
      owner: "郑凯",
      dept: "信息中心",
      hostId: "H-IT-02",
      authStatus: "readonly",
      riskLevel: "medium",
      riskStatus: "false_positive",
      registeredAt: "2026-04-18 13:20:00",
      lastUsedAt: "2026-10-25 15:33:44",
    },
    {
      id: "ST-011",
      name: "朗科 U盘 128G",
      sn: "NK-U128-88210",
      capacity: "128GB",
      type: "usb",
      owner: "徐娜",
      dept: "研发中心",
      hostId: "H-RND-01",
      authStatus: "authorized",
      riskLevel: "none",
      riskStatus: "normal",
      registeredAt: "2026-08-22 10:45:00",
      lastUsedAt: "2026-10-28 11:10:05",
    },
    {
      id: "ST-012",
      name: "雷克沙 JumpDrive 256G",
      sn: "LX-JD-256-33441",
      capacity: "256GB",
      type: "portable",
      owner: "何军",
      dept: "市场部",
      hostId: "H-MKT-01",
      authStatus: "revoked",
      riskLevel: "medium",
      riskStatus: "isolated",
      registeredAt: "2026-03-11 09:00:00",
      lastUsedAt: "2026-10-15 18:02:50",
    },
  ];

  let storageAudits = [
    { id: "SA-001", storageId: "ST-001", time: "2026-10-30 08:41:12", action: "mount", path: "E:\\", hostId: "H-FIN-01", result: "成功" },
    { id: "SA-002", storageId: "ST-001", time: "2026-10-30 08:42:05", action: "read", path: "E:\\报表\\Q3汇总.xlsx", hostId: "H-FIN-01", result: "成功" },
    { id: "SA-003", storageId: "ST-001", time: "2026-10-30 08:45:18", action: "copy", path: "E:\\报表\\Q3汇总.xlsx → C:\\Users\\王芳\\Desktop", hostId: "H-FIN-01", result: "成功" },
    { id: "SA-004", storageId: "ST-001", time: "2026-10-29 17:20:00", action: "eject", path: "E:\\", hostId: "H-FIN-01", result: "成功" },
    { id: "SA-005", storageId: "ST-002", time: "2026-10-29 16:22:08", action: "mount", path: "F:\\", hostId: "H-HR-01", result: "成功" },
    { id: "SA-006", storageId: "ST-002", time: "2026-10-29 16:23:40", action: "write", path: "F:\\人事\\花名册.xlsx", hostId: "H-HR-01", result: "拦截-待授权" },
    { id: "SA-007", storageId: "ST-003", time: "2026-10-30 11:03:45", action: "mount", path: "G:\\", hostId: "H-IT-01", result: "成功" },
    { id: "SA-008", storageId: "ST-003", time: "2026-10-30 11:05:12", action: "write", path: "G:\\备份\\cfg-export.zip", hostId: "H-IT-01", result: "成功" },
    { id: "SA-009", storageId: "ST-003", time: "2026-10-30 11:08:00", action: "copy", path: "G:\\备份\\cfg-export.zip → \\\\filesrv\\ops", hostId: "H-IT-01", result: "告警-异常外传" },
    { id: "SA-010", storageId: "ST-004", time: "2026-10-29 09:18:01", action: "mount", path: "H:\\", hostId: "H-OPS-01", result: "成功-只读" },
    { id: "SA-011", storageId: "ST-004", time: "2026-10-29 09:20:33", action: "read", path: "H:\\日志\\syslog-202610.tgz", hostId: "H-OPS-01", result: "成功" },
    { id: "SA-012", storageId: "ST-004", time: "2026-10-29 09:21:10", action: "write", path: "H:\\临时\\test.txt", hostId: "H-OPS-01", result: "拒绝-只读策略" },
    { id: "SA-013", storageId: "ST-005", time: "2026-10-27 13:55:40", action: "mount", path: "D:\\", hostId: "H-ADM-01", result: "成功" },
    { id: "SA-014", storageId: "ST-005", time: "2026-10-27 14:10:22", action: "write", path: "光盘:\\会议纪要_202610.pdf", hostId: "H-ADM-01", result: "成功" },
    { id: "SA-015", storageId: "ST-005", time: "2026-10-27 14:25:00", action: "eject", path: "D:\\", hostId: "H-ADM-01", result: "成功" },
    { id: "SA-016", storageId: "ST-006", time: "2026-10-20 17:12:09", action: "mount", path: "D:\\", hostId: "H-RND-01", result: "隔离阻断" },
    { id: "SA-016a", storageId: "ST-006", time: "2026-10-20 17:11:40", action: "scan", path: "D:\\autorun.inf", hostId: "H-RND-01", result: "拦截-发现木马 Trojan.Win32.Generic" },
    { id: "SA-017", storageId: "ST-006", time: "2026-10-18 10:05:00", action: "write", path: "光盘:\\源码备份.iso", hostId: "H-RND-01", result: "告警-高风险" },
    { id: "SA-018", storageId: "ST-007", time: "2026-10-30 10:22:33", action: "mount", path: "E:\\", hostId: "H-MKT-01", result: "成功" },
    { id: "SA-019", storageId: "ST-007", time: "2026-10-30 10:24:01", action: "read", path: "E:\\方案\\客户提案.pptx", hostId: "H-MKT-01", result: "成功" },
    { id: "SA-020", storageId: "ST-007", time: "2026-10-30 10:26:40", action: "copy", path: "E:\\方案\\客户提案.pptx → D:\\工作区", hostId: "H-MKT-01", result: "成功" },
    { id: "SA-021", storageId: "ST-008", time: "2026-10-29 17:05:12", action: "mount", path: "F:\\", hostId: "H-OPS-02", result: "待审批挂载" },
    { id: "SA-022", storageId: "ST-009", time: "2026-10-30 09:48:20", action: "mount", path: "E:\\", hostId: "H-FIN-02", result: "成功" },
    { id: "SA-022a", storageId: "ST-009", time: "2026-10-30 09:48:35", action: "scan", path: "E:\\", hostId: "H-FIN-02", result: "告警-发现宏病毒 W97M.Downloader" },
    { id: "SA-023", storageId: "ST-009", time: "2026-10-30 09:50:05", action: "copy", path: "E:\\工资\\10月明细.xlsx → 微信文件传输助手", hostId: "H-FIN-02", result: "告警-敏感外发" },
    { id: "SA-024", storageId: "ST-009", time: "2026-10-30 09:51:30", action: "read", path: "E:\\工资\\10月明细.xlsx", hostId: "H-FIN-02", result: "成功" },
    { id: "SA-025", storageId: "ST-010", time: "2026-10-25 15:33:44", action: "mount", path: "G:\\", hostId: "H-IT-02", result: "成功-只读" },
    { id: "SA-026", storageId: "ST-010", time: "2026-10-25 15:40:00", action: "read", path: "G:\\镜像\\win11.iso", hostId: "H-IT-02", result: "成功" },
    { id: "SA-027", storageId: "ST-011", time: "2026-10-28 11:10:05", action: "mount", path: "E:\\", hostId: "H-RND-01", result: "成功" },
    { id: "SA-028", storageId: "ST-011", time: "2026-10-28 11:12:44", action: "write", path: "E:\\调试\\dump.log", hostId: "H-RND-01", result: "成功" },
    { id: "SA-029", storageId: "ST-011", time: "2026-10-28 11:30:00", action: "eject", path: "E:\\", hostId: "H-RND-01", result: "成功" },
    { id: "SA-030", storageId: "ST-012", time: "2026-10-15 18:02:50", action: "mount", path: "F:\\", hostId: "H-MKT-01", result: "隔离阻断" },
    { id: "SA-030a", storageId: "ST-012", time: "2026-10-15 18:02:20", action: "scan", path: "F:\\客户资料\\名单.csv", hostId: "H-MKT-01", result: "拦截-带毒入网 Worm.AutoRun.AH" },
    { id: "SA-031", storageId: "ST-012", time: "2026-10-14 09:10:00", action: "copy", path: "F:\\客户资料\\名单.csv → 桌面", hostId: "H-MKT-01", result: "告警-已撤销仍访问" },
    { id: "SA-032", storageId: "ST-003", time: "2026-10-28 16:00:00", action: "eject", path: "G:\\", hostId: "H-IT-01", result: "成功" },
    { id: "SA-033", storageId: "ST-001", time: "2026-10-28 10:05:00", action: "write", path: "E:\\凭证\\凭证扫描.zip", hostId: "H-FIN-01", result: "成功" },
    { id: "SA-034", storageId: "ST-007", time: "2026-10-29 14:20:00", action: "eject", path: "E:\\", hostId: "H-MKT-01", result: "成功" },
    { id: "SA-035", storageId: "ST-004", time: "2026-10-28 08:30:00", action: "eject", path: "H:\\", hostId: "H-OPS-01", result: "成功" },
  ];

  let peripheralPolicies = [
    {
      id: "PP-01",
      name: "办公默认策略",
      version: "v3",
      printer: "allow",
      burner: "deny",
      bluetooth: "restrict",
      camera: "allow",
      serial: "deny",
      remoteToolsMode: "restrict",
      fileTransferMode: "restrict",
      remoteTools: ["向日葵", "Windows远程桌面"],
      fileTransferTools: ["企业网盘同步"],
    },
    {
      id: "PP-02",
      name: "研发加强策略",
      version: "v2",
      printer: "restrict",
      burner: "deny",
      bluetooth: "deny",
      camera: "deny",
      serial: "restrict",
      remoteToolsMode: "deny",
      fileTransferMode: "deny",
      remoteTools: [],
      fileTransferTools: [],
    },
    {
      id: "PP-03",
      name: "运维放宽策略",
      version: "v4",
      printer: "allow",
      burner: "restrict",
      bluetooth: "allow",
      camera: "allow",
      serial: "allow",
      remoteToolsMode: "allow",
      fileTransferMode: "restrict",
      remoteTools: [],
      fileTransferTools: ["企业网盘同步", "飞书云盘"],
    },
    {
      id: "PP-04",
      name: "财务严格策略",
      version: "v1",
      printer: "allow",
      burner: "deny",
      bluetooth: "deny",
      camera: "deny",
      serial: "deny",
      remoteToolsMode: "deny",
      fileTransferMode: "deny",
      remoteTools: [],
      fileTransferTools: [],
    },
  ];

  let peripheralBindings = [
    { hostId: "H-FIN-01", policyId: "PP-04", version: "v1", syncStatus: "synced", syncedAt: "2026-10-29 09:00:00" },
    { hostId: "H-FIN-02", policyId: "PP-04", version: "v1", syncStatus: "synced", syncedAt: "2026-10-29 09:01:00" },
    { hostId: "H-HR-01", policyId: "PP-01", version: "v3", syncStatus: "synced", syncedAt: "2026-10-28 18:20:00" },
    { hostId: "H-IT-01", policyId: "PP-03", version: "v4", syncStatus: "pending", syncedAt: "2026-10-27 10:00:00" },
    { hostId: "H-IT-02", policyId: "PP-03", version: "v4", syncStatus: "conflict", syncedAt: "2026-10-20 11:30:00" },
    { hostId: "H-MKT-01", policyId: "PP-01", version: "v3", syncStatus: "synced", syncedAt: "2026-10-29 14:15:00" },
    { hostId: "H-OPS-01", policyId: "PP-03", version: "v4", syncStatus: "synced", syncedAt: "2026-10-30 08:00:00" },
    { hostId: "H-OPS-02", policyId: "PP-03", version: "v4", syncStatus: "pending", syncedAt: "2026-10-28 16:40:00" },
    { hostId: "H-RND-01", policyId: "PP-02", version: "v2", syncStatus: "synced", syncedAt: "2026-10-29 11:05:00" },
    { hostId: "H-ADM-01", policyId: "PP-01", version: "v3", syncStatus: "synced", syncedAt: "2026-10-26 09:50:00" },
    { hostId: "H-LEG-01", policyId: "PP-04", version: "v1", syncStatus: "synced", syncedAt: "2026-10-30 07:40:00" },
    { hostId: "H-AUD-01", policyId: "PP-04", version: "v1", syncStatus: "pending", syncedAt: "2026-10-28 15:10:00" },
    { hostId: "H-SEC-01", policyId: "PP-02", version: "v2", syncStatus: "synced", syncedAt: "2026-10-30 08:25:00" },
  ];

  let opsEvents = [
    {
      id: "OE-001",
      time: "2026-10-30 08:05:12",
      hostId: "H-FIN-01",
      account: "wangfang",
      category: "power",
      summary: "终端开机登录",
      riskLevel: "none",
      handleStatus: "done",
      detail: { event: "startup", loginType: "本地" },
    },
    {
      id: "OE-002",
      time: "2026-10-30 08:06:40",
      hostId: "H-OPS-01",
      account: "zhaolei",
      category: "power",
      summary: "终端关机",
      riskLevel: "none",
      handleStatus: "done",
      detail: { event: "shutdown", reason: "用户主动" },
    },
    {
      id: "OE-003",
      time: "2026-10-30 08:20:11",
      hostId: "H-IT-01",
      account: "chenming",
      category: "syslog",
      summary: "系统日志服务重启",
      riskLevel: "low",
      handleStatus: "done",
      detail: { service: "EventLog", action: "restart" },
    },
    {
      id: "OE-004",
      time: "2026-10-29 22:15:00",
      hostId: "H-RND-01",
      account: "SYSTEM",
      category: "syslog",
      summary: "审计日志被清空",
      riskLevel: "high",
      sign: "compromise",
      handleStatus: "open",
      detail: { channel: "Security", clearedBy: "unknown" },
    },
    {
      id: "OE-005",
      time: "2026-10-30 09:12:33",
      hostId: "H-MKT-01",
      account: "liuyang",
      category: "software",
      summary: "安装软件 微信 3.9.12",
      riskLevel: "low",
      handleStatus: "done",
      detail: { app: "微信", version: "3.9.12", publisher: "腾讯" },
    },
    {
      id: "OE-006",
      time: "2026-10-30 09:40:00",
      hostId: "H-RND-01",
      account: "suntao",
      category: "software",
      summary: "卸载软件 Wireshark",
      riskLevel: "medium",
      handleStatus: "open",
      detail: { app: "Wireshark", action: "uninstall" },
    },
    {
      id: "OE-007",
      time: "2026-10-29 16:05:20",
      hostId: "H-OPS-02",
      account: "huangwei",
      category: "software",
      summary: "安装未知签名程序 setup_tmp.exe",
      riskLevel: "high",
      handleStatus: "open",
      detail: { app: "setup_tmp.exe", signed: false },
    },
    {
      id: "OE-008",
      time: "2026-10-30 10:01:05",
      hostId: "H-ADM-01",
      account: "zhoumin",
      category: "hardware",
      summary: "检测到外接显示器接入",
      riskLevel: "none",
      handleStatus: "done",
      detail: { device: "HDMI Display", action: "plug" },
    },
    {
      id: "OE-009",
      time: "2026-10-29 11:22:00",
      hostId: "H-IT-02",
      account: "admin",
      category: "hardware",
      summary: "内存条容量变更 16G→32G",
      riskLevel: "medium",
      handleStatus: "open",
      detail: { component: "RAM", before: "16GB", after: "32GB" },
    },
    {
      id: "OE-010",
      time: "2026-10-30 10:15:40",
      hostId: "H-HR-01",
      account: "liqiang",
      category: "account",
      summary: "本地账号密码修改",
      riskLevel: "low",
      handleStatus: "done",
      detail: { account: "liqiang", action: "password_change" },
    },
    {
      id: "OE-011",
      time: "2026-10-30 10:30:00",
      hostId: "H-FIN-02",
      account: "wujing",
      category: "account",
      summary: "新增本地管理员账号 temp_admin",
      riskLevel: "high",
      sign: "compromise",
      handleStatus: "open",
      detail: { account: "temp_admin", groups: ["Administrators"] },
    },
    {
      id: "OE-012",
      time: "2026-10-28 19:40:00",
      hostId: "H-OPS-01",
      account: "SYSTEM",
      category: "account",
      summary: "域账号锁定",
      riskLevel: "medium",
      handleStatus: "done",
      detail: { account: "zhaolei", reason: "多次失败登录" },
    },
    {
      id: "OE-013",
      time: "2026-10-30 11:05:18",
      hostId: "H-IT-01",
      account: "chenming",
      category: "process",
      summary: "进程 powershell.exe 以管理员启动",
      riskLevel: "medium",
      handleStatus: "open",
      detail: { process: "powershell.exe", pid: 4820, elevated: true },
    },
    {
      id: "OE-014",
      time: "2026-10-30 11:20:00",
      hostId: "H-RND-01",
      account: "suntao",
      category: "process",
      summary: "服务 Spooler 停止",
      riskLevel: "low",
      handleStatus: "done",
      detail: { service: "Spooler", action: "stop" },
    },
    {
      id: "OE-015",
      time: "2026-10-29 08:55:00",
      hostId: "H-MKT-01",
      account: "liuyang",
      category: "process",
      summary: "可疑进程 mimikatz.exe 启动被拦截",
      riskLevel: "high",
      handleStatus: "open",
      sign: "compromise",
      detail: { process: "mimikatz.exe", action: "blocked" },
    },
    {
      id: "OE-016",
      time: "2026-10-30 11:40:22",
      hostId: "H-OPS-01",
      account: "zhaolei",
      category: "network",
      summary: "建立到 203.0.113.88:443 的出站连接",
      riskLevel: "medium",
      handleStatus: "open",
      detail: { remote: "203.0.113.88:443", protocol: "TCP", process: "chrome.exe" },
    },
    {
      id: "OE-017",
      time: "2026-10-30 12:01:00",
      hostId: "H-FIN-01",
      account: "wangfang",
      category: "network",
      summary: "Wi-Fi 切换到访客网络",
      riskLevel: "low",
      handleStatus: "done",
      detail: { ssid: "Guest-WiFi", action: "connect" },
    },
    {
      id: "OE-018",
      time: "2026-10-28 15:10:00",
      hostId: "H-IT-02",
      account: "admin",
      category: "network",
      summary: "禁用有线网卡",
      riskLevel: "medium",
      handleStatus: "done",
      detail: { adapter: "以太网", action: "disable" },
    },
    {
      id: "OE-019",
      time: "2026-10-30 12:20:15",
      hostId: "H-ADM-01",
      account: "zhoumin",
      category: "share",
      summary: "访问共享 \\\\filesrv\\行政",
      riskLevel: "none",
      handleStatus: "done",
      detail: { path: "\\\\filesrv\\行政", access: "read" },
    },
    {
      id: "OE-020",
      time: "2026-10-30 12:35:00",
      hostId: "H-HR-01",
      account: "liqiang",
      category: "share",
      summary: "创建本地共享 HR-TEMP",
      riskLevel: "high",
      handleStatus: "open",
      detail: { shareName: "HR-TEMP", path: "D:\\临时", permission: "Everyone:Full" },
    },
    {
      id: "OE-021",
      time: "2026-10-29 13:40:00",
      hostId: "H-OPS-02",
      account: "huangwei",
      category: "share",
      summary: "映射网络驱动器 Z:",
      riskLevel: "low",
      handleStatus: "done",
      detail: { drive: "Z:", unc: "\\\\nas01\\backup" },
    },
    {
      id: "OE-022",
      time: "2026-10-30 13:05:40",
      hostId: "H-FIN-02",
      account: "wujing",
      category: "file",
      summary: "批量删除目录 D:\\归档\\2024",
      riskLevel: "medium",
      handleStatus: "open",
      detail: { path: "D:\\归档\\2024", action: "delete", count: 128 },
    },
    {
      id: "OE-023",
      time: "2026-10-30 13:18:00",
      hostId: "H-RND-01",
      account: "xuna",
      category: "file",
      summary: "修改敏感文件 hosts",
      riskLevel: "high",
      handleStatus: "open",
      detail: { path: "C:\\Windows\\System32\\drivers\\etc\\hosts", action: "modify" },
    },
    {
      id: "OE-024",
      time: "2026-10-29 09:30:00",
      hostId: "H-MKT-01",
      account: "liuyang",
      category: "file",
      summary: "加密压缩客户资料.zip",
      riskLevel: "low",
      handleStatus: "done",
      detail: { path: "D:\\工作区\\客户资料.zip", encrypted: true },
    },
    {
      id: "OE-025",
      time: "2026-10-30 13:40:12",
      hostId: "H-FIN-01",
      account: "wangfang",
      category: "usb",
      summary: "U盘挂载 ST-001",
      riskLevel: "none",
      handleStatus: "done",
      detail: { storageId: "ST-001", action: "mount" },
    },
    {
      id: "OE-026",
      time: "2026-10-30 09:50:05",
      hostId: "H-FIN-02",
      account: "wujing",
      category: "usb",
      summary: "U盘敏感文件外发告警 ST-009",
      riskLevel: "high",
      handleStatus: "open",
      detail: { storageId: "ST-009", action: "copy", path: "E:\\工资\\10月明细.xlsx" },
    },
    {
      id: "OE-027",
      time: "2026-10-29 17:05:12",
      hostId: "H-OPS-02",
      account: "huangwei",
      category: "usb",
      summary: "未授权便携存储挂载 ST-008",
      riskLevel: "medium",
      handleStatus: "open",
      detail: { storageId: "ST-008", action: "mount", authStatus: "pending" },
    },
    {
      id: "OE-028",
      time: "2026-10-30 14:02:00",
      hostId: "H-IT-01",
      account: "chenming",
      category: "traffic",
      summary: "主机出站流量突增 850Mbps",
      riskLevel: "high",
      handleStatus: "open",
      detail: { direction: "out", peakMbps: 850, baselineMbps: 40 },
    },
    {
      id: "OE-029",
      time: "2026-10-30 14:10:30",
      hostId: "H-OPS-01",
      account: "zhaolei",
      category: "traffic",
      summary: "内网横向扫描端口探测",
      riskLevel: "high",
      handleStatus: "open",
      sign: "compromise",
      detail: { targets: 120, ports: "22,3389,445", process: "nmap.exe" },
    },
    {
      id: "OE-030",
      time: "2026-10-29 20:00:00",
      hostId: "H-ADM-01",
      account: "zhoumin",
      category: "traffic",
      summary: "夜间异常上传至公网网盘",
      riskLevel: "medium",
      handleStatus: "done",
      detail: { destination: "pan.baidu.com", bytes: "2.1GB" },
    },
    {
      id: "OE-031",
      time: "2026-10-30 07:55:00",
      hostId: "H-OPS-02",
      account: "huangwei",
      category: "power",
      summary: "异常重启（非计划）",
      riskLevel: "medium",
      handleStatus: "open",
      detail: { event: "unexpected_reboot", uptimeSec: 420 },
    },
    {
      id: "OE-032",
      time: "2026-10-30 08:30:00",
      hostId: "H-HR-01",
      account: "liqiang",
      category: "syslog",
      summary: "安全审计策略被修改",
      riskLevel: "high",
      handleStatus: "open",
      detail: { policy: "Audit Object Access", action: "disable" },
    },
    {
      id: "OE-033",
      time: "2026-10-30 09:00:00",
      hostId: "H-ADM-01",
      account: "zhoumin",
      category: "software",
      summary: "安装打印机驱动",
      riskLevel: "none",
      handleStatus: "done",
      detail: { app: "HP Universal Print Driver", version: "7.1" },
    },
    {
      id: "OE-034",
      time: "2026-10-30 09:25:00",
      hostId: "H-IT-01",
      account: "chenming",
      category: "hardware",
      summary: "USB 扩展坞接入",
      riskLevel: "low",
      handleStatus: "done",
      detail: { device: "USB Dock", vendor: "绿联" },
    },
    {
      id: "OE-035",
      time: "2026-10-30 10:45:00",
      hostId: "H-OPS-01",
      account: "zhaolei",
      category: "account",
      summary: "远程桌面登录成功",
      riskLevel: "low",
      handleStatus: "done",
      detail: { account: "zhaolei", sourceIp: "10.20.3.31" },
    },
    {
      id: "OE-036",
      time: "2026-10-30 11:55:00",
      hostId: "H-FIN-01",
      account: "wangfang",
      category: "process",
      summary: "定时任务新增 at_backup.bat",
      riskLevel: "medium",
      handleStatus: "open",
      detail: { task: "at_backup.bat", trigger: "每天 23:00" },
    },
    {
      id: "OE-037",
      time: "2026-10-30 12:50:00",
      hostId: "H-RND-01",
      account: "suntao",
      category: "network",
      summary: "开启本地 HTTP 代理 127.0.0.1:7890",
      riskLevel: "medium",
      handleStatus: "open",
      detail: { proxy: "127.0.0.1:7890", process: "clash.exe" },
    },
    {
      id: "OE-038",
      time: "2026-10-30 13:30:00",
      hostId: "H-MKT-01",
      account: "hejun",
      category: "share",
      summary: "访问共享失败（权限不足）",
      riskLevel: "low",
      handleStatus: "done",
      detail: { path: "\\\\filesrv\\财务", result: "ACCESS_DENIED" },
    },
    {
      id: "OE-039",
      time: "2026-10-30 14:25:00",
      hostId: "H-HR-01",
      account: "liqiang",
      category: "file",
      summary: "复制人事档案到桌面",
      riskLevel: "medium",
      handleStatus: "open",
      detail: { path: "\\\\hrdb\\档案\\员工A.pdf", action: "copy" },
    },
    {
      id: "OE-040",
      time: "2026-10-30 14:40:00",
      hostId: "H-OPS-02",
      account: "huangwei",
      category: "usb",
      summary: "光驱刻录操作 ST-005 关联终端旁路",
      riskLevel: "low",
      handleStatus: "done",
      detail: { storageId: "ST-005", note: "旁路观察" },
    },
    {
      id: "OE-041",
      time: "2026-10-30 15:00:00",
      hostId: "H-IT-02",
      account: "admin",
      category: "traffic",
      summary: "DNS 查询异常域名高峰",
      riskLevel: "medium",
      handleStatus: "open",
      detail: { qps: 320, sample: "xjk92.evil.example" },
    },
    {
      id: "OE-042",
      time: "2026-10-29 18:20:00",
      hostId: "H-FIN-02",
      account: "wujing",
      category: "power",
      summary: "休眠唤醒",
      riskLevel: "none",
      handleStatus: "done",
      detail: { event: "resume_from_sleep" },
    },
  ];

  let storageSeq = storages.length;
  let auditSeq = storageAudits.length;
  let policySeq = peripheralPolicies.length;
  let opsSeq = opsEvents.length;

  function listHosts() {
    return hosts.map((h) => clone(h));
  }

  function getHost(id) {
    const h = hosts.find((x) => x.id === id);
    return h ? clone(h) : null;
  }

  function listStorages(filter) {
    const f = filter || {};
    let rows = storages.slice();
    if (f.type) rows = rows.filter((s) => s.type === f.type);
    if (f.authStatus) rows = rows.filter((s) => s.authStatus === f.authStatus);
    if (f.hostId) rows = rows.filter((s) => s.hostId === f.hostId);
    if (f.keyword) {
      const kw = String(f.keyword).trim().toLowerCase();
      rows = rows.filter(
        (s) =>
          String(s.name || "").toLowerCase().includes(kw) ||
          String(s.sn || "").toLowerCase().includes(kw)
      );
    }
    if (f.registeredFrom) {
      const from = String(f.registeredFrom);
      rows = rows.filter((s) => String(s.registeredAt || "").slice(0, from.length) >= from);
    }
    if (f.registeredTo) {
      const to = String(f.registeredTo);
      rows = rows.filter((s) => String(s.registeredAt || "").slice(0, to.length) <= to);
    }
    return rows.map((s) => clone(s));
  }

  function getStorage(id) {
    const s = storages.find((x) => x.id === id);
    return s ? clone(s) : null;
  }

  function registerStorage(payload) {
    const p = payload || {};
    storageSeq += 1;
    const id = "ST-" + String(storageSeq).padStart(3, "0");
    const now = formatNow();
    const row = {
      id,
      name: p.name || "未命名介质",
      sn: p.sn || ("SN-" + Date.now()),
      capacity: p.capacity || "-",
      type: p.type || "usb",
      owner: p.owner || "-",
      dept: p.dept || "-",
      hostId: p.hostId || null,
      authStatus: "pending",
      riskLevel: "none",
      riskStatus: "normal",
      registeredAt: now,
      lastUsedAt: p.lastUsedAt || now,
    };
    storages.unshift(row);
    return clone(row);
  }

  function authorizeStorage(id, patch) {
    const s = storages.find((x) => x.id === id);
    if (!s) return null;
    const p = patch || {};
    if (p.authStatus != null) s.authStatus = p.authStatus;
    if (p.hostId != null) s.hostId = p.hostId;
    if (p.owner != null) s.owner = p.owner;
    if (p.allowedUser != null) s.allowedUser = p.allowedUser;
    if (p.validUntil != null) s.validUntil = p.validUntil;
    if (p.encryptRequired != null) s.encryptRequired = p.encryptRequired;
    if (p.remark != null) s.remark = p.remark;
    return clone(s);
  }

  function handleStorageRisk(id, payload) {
    const s = storages.find((x) => x.id === id);
    if (!s) return null;
    const action = (payload && payload.action) || "";
    if (payload && payload.remark != null) s.riskRemark = payload.remark;
    if (action === "isolate") {
      s.riskStatus = "isolated";
    } else if (action === "revoke") {
      s.authStatus = "revoked";
      // 撤销授权视为风险已处置，避免「风险待处置」指标不下降
      if (s.riskStatus === "pending") s.riskStatus = "normal";
    } else if (action === "false_positive") {
      s.riskStatus = "false_positive";
      s.riskLevel = "none";
    }
    return clone(s);
  }

  function listStorageAudits(storageId, limit) {
    const lim = limit == null ? 10 : Number(limit);
    const rows = storageAudits
      .filter((a) => a.storageId === storageId)
      .slice()
      .sort((a, b) => String(b.time).localeCompare(String(a.time)));
    return rows.slice(0, lim).map((a) => clone(a));
  }

  function listPeripheralPolicies() {
    return peripheralPolicies.map((p) => clone(p));
  }

  function getPeripheralPolicy(id) {
    const p = peripheralPolicies.find((x) => x.id === id);
    return p ? clone(p) : null;
  }

  function bumpVersion(ver) {
    const m = String(ver || "v0").match(/v?(\d+)/i);
    const n = m ? Number(m[1]) + 1 : 1;
    return "v" + n;
  }

  function savePeripheralPolicy(payload) {
    const p = payload || {};
    if (p.id) {
      const idx = peripheralPolicies.findIndex((x) => x.id === p.id);
      if (idx < 0) return null;
      const next = { ...peripheralPolicies[idx], ...p };
      next.version = bumpVersion(peripheralPolicies[idx].version);
      peripheralPolicies[idx] = next;
      return clone(next);
    }
    policySeq += 1;
    const id = "PP-" + String(policySeq).padStart(2, "0");
    const row = {
      id,
      name: p.name || "未命名策略",
      version: "v1",
      printer: p.printer || "allow",
      burner: p.burner || "deny",
      bluetooth: p.bluetooth || "deny",
      camera: p.camera || "allow",
      serial: p.serial || "deny",
      remoteToolsMode: p.remoteToolsMode || "deny",
      fileTransferMode: p.fileTransferMode || "deny",
      remoteTools: Array.isArray(p.remoteTools) ? p.remoteTools.slice() : [],
      fileTransferTools: Array.isArray(p.fileTransferTools) ? p.fileTransferTools.slice() : [],
    };
    peripheralPolicies.push(row);
    return clone(row);
  }

  function listPeripheralBindings(filter) {
    const f = filter || {};
    let rows = peripheralBindings.slice();
    if (f.syncStatus) rows = rows.filter((b) => b.syncStatus === f.syncStatus);
    if (f.dept || f.keyword) {
      rows = rows.filter((b) => {
        const host = hosts.find((h) => h.id === b.hostId);
        if (!host) return false;
        if (f.dept && host.dept !== f.dept) return false;
        if (f.keyword) {
          const kw = String(f.keyword).trim().toLowerCase();
          const hit =
            String(host.name || "").toLowerCase().includes(kw) ||
            String(host.ip || "").toLowerCase().includes(kw);
          if (!hit) return false;
        }
        return true;
      });
    }
    return rows.map((b) => {
      const host = hosts.find((h) => h.id === b.hostId);
      const policy = peripheralPolicies.find((p) => p.id === b.policyId);
      return clone({
        ...b,
        hostName: host ? host.name : "-",
        hostIp: host ? host.ip : "-",
        dept: host ? host.dept : "-",
        online: host ? host.online : false,
        policyName: policy ? policy.name : "-",
      });
    });
  }

  function getPeripheralBinding(hostId) {
    const b = peripheralBindings.find((x) => x.hostId === hostId);
    if (!b) return null;
    const host = hosts.find((h) => h.id === hostId);
    const policy = peripheralPolicies.find((p) => p.id === b.policyId);
    return clone({
      ...b,
      hostName: host ? host.name : "-",
      hostIp: host ? host.ip : "-",
      dept: host ? host.dept : "-",
      online: host ? host.online : false,
      policy: policy ? clone(policy) : null,
    });
  }

  function applyPolicyFieldsToBinding(binding, policy) {
    if (!policy) return;
    binding.policyId = policy.id;
    binding.version = policy.version;
  }

  function savePeripheralBinding(hostId, policyPatchOrPolicyId) {
    let binding = peripheralBindings.find((x) => x.hostId === hostId);
    if (!binding) {
      binding = {
        hostId,
        policyId: null,
        version: "v1",
        syncStatus: "pending",
        syncedAt: null,
      };
      peripheralBindings.push(binding);
    }

    if (typeof policyPatchOrPolicyId === "string") {
      const policy = peripheralPolicies.find((p) => p.id === policyPatchOrPolicyId);
      applyPolicyFieldsToBinding(binding, policy);
    } else if (policyPatchOrPolicyId && typeof policyPatchOrPolicyId === "object") {
      const patch = policyPatchOrPolicyId;
      if (patch.policyId) {
        const policy = peripheralPolicies.find((p) => p.id === patch.policyId);
        applyPolicyFieldsToBinding(binding, policy);
      }
      const channelFields = [
        "printer",
        "burner",
        "bluetooth",
        "camera",
        "serial",
        "remoteToolsMode",
        "fileTransferMode",
        "remoteTools",
        "fileTransferTools",
      ];
      const hasInline = channelFields.some((k) => patch[k] != null);
      if (hasInline) {
        // 内联改通道：写入绑定覆盖字段，并标记待同步
        channelFields.forEach((k) => {
          if (patch[k] != null) binding[k] = patch[k];
        });
        if (patch.version != null) {
          binding.version = patch.version;
        } else {
          const n = parseInt(String(binding.version || "v1").replace(/\D/g, ""), 10) || 1;
          binding.version = "v" + (n + 1);
        }
      }
    }

    binding.syncStatus = "pending";
    return getPeripheralBinding(hostId);
  }

  function applyPeripheralBatch(hostIds, policyId) {
    const ids = Array.isArray(hostIds) ? hostIds : [];
    const policy = peripheralPolicies.find((p) => p.id === policyId);
    const results = [];
    ids.forEach((hostId) => {
      let binding = peripheralBindings.find((x) => x.hostId === hostId);
      if (!binding) {
        binding = {
          hostId,
          policyId: null,
          version: "v1",
          syncStatus: "pending",
          syncedAt: null,
        };
        peripheralBindings.push(binding);
      }
      applyPolicyFieldsToBinding(binding, policy);
      binding.syncStatus = "pending";
      results.push(clone(binding));
    });
    return results;
  }

  function refreshPeripheralSync(hostId) {
    const now = formatNow();
    const targets = hostId
      ? peripheralBindings.filter((b) => b.hostId === hostId)
      : peripheralBindings;
    targets.forEach((b) => {
      if (b.syncStatus === "pending") {
        b.syncStatus = "synced";
        b.syncedAt = now;
      }
    });
    return hostId ? getPeripheralBinding(hostId) : listPeripheralBindings();
  }

  function listOpsEvents(filter) {
    const f = filter || {};
    let rows = opsEvents.slice();
    if (f.category) rows = rows.filter((e) => e.category === f.category);
    if (f.hostId) rows = rows.filter((e) => e.hostId === f.hostId);
    if (f.riskLevel) rows = rows.filter((e) => e.riskLevel === f.riskLevel);
    if (f.keyword) {
      const kw = String(f.keyword).trim().toLowerCase();
      rows = rows.filter(
        (e) =>
          String(e.summary || "").toLowerCase().includes(kw) ||
          String(e.account || "").toLowerCase().includes(kw) ||
          String(e.id || "").toLowerCase().includes(kw)
      );
    }
    if (f.dateFrom) {
      const from = String(f.dateFrom);
      rows = rows.filter((e) => String(e.time) >= from);
    }
    if (f.dateTo) {
      const to = String(f.dateTo);
      rows = rows.filter((e) => String(e.time).slice(0, to.length) <= to);
    }
    rows = rows.slice().sort((a, b) => String(b.time).localeCompare(String(a.time)));
    return rows.map((e) => clone(e));
  }

  function getOpsEvent(id) {
    const e = opsEvents.find((x) => x.id === id);
    return e ? clone(e) : null;
  }

  function markOpsEventDone(id) {
    const e = opsEvents.find((x) => x.id === id);
    if (!e) return null;
    e.handleStatus = "done";
    return clone(e);
  }

  function storageMetrics() {
    return {
      total: storages.length,
      authorized: storages.filter((s) => s.authStatus === "authorized").length,
      pendingAuth: storages.filter((s) => s.authStatus === "pending").length,
      riskPending: storages.filter((s) => s.riskStatus === "pending").length,
    };
  }

  function opsMetrics() {
    // 「今天」= MOCK_TODAY（与种子事件日期对齐），非运行时系统日期。
    const todayPrefix = MOCK_TODAY;
    const todayRows = opsEvents.filter((e) => String(e.time).startsWith(todayPrefix));
    return {
      today: todayRows.length,
      todayRisk: todayRows.filter((e) => e.riskLevel === "medium" || e.riskLevel === "high").length,
      open: opsEvents.filter((e) => e.handleStatus === "open").length,
      hostCount: hosts.length,
    };
  }

  window.DesktopSecurity = {
    TYPE_LABEL,
    CATEGORY_LABEL,
    AUDIT_ACTION_LABEL,
    CHANNEL_KEYS,
    CHANNEL_LABEL,
    REMOTE_TOOLS,
    FT_TOOLS,
    MOCK_TODAY,
    authTag,
    riskTag,
    riskStatusTag,
    auditActionLabel,
    signTag,
    syncTag,
    handleTag,
    modeTag,
    summarizePeripheral,
    listHosts,
    getHost,
    listStorages,
    getStorage,
    registerStorage,
    authorizeStorage,
    handleStorageRisk,
    listStorageAudits,
    listPeripheralPolicies,
    getPeripheralPolicy,
    savePeripheralPolicy,
    listPeripheralBindings,
    getPeripheralBinding,
    savePeripheralBinding,
    applyPeripheralBatch,
    refreshPeripheralSync,
    listOpsEvents,
    getOpsEvent,
    markOpsEventDone,
    storageMetrics,
    opsMetrics,
  };
})();
