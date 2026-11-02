(function () {
  const MOCK_TODAY = "2026-11-01";

  const BIZ_SYSTEMS = ["电子政务外网", "OA协同", "财务核心", "运维堡垒", "数据交换"];
  const TERMINAL_GROUPS = ["机关办公网", "机房服务器", "开发测试", "远程接入"];
  const DATA_LEVELS = ["公开", "内部", "敏感", "机密"];
  const DEPT_GROUPS = ["信息中心", "运维一组", "财务处", "办公室", "第三方驻场"];

  const ENCRYPT_MODE_LABEL = {
    transparent: "透明加解密",
    semi: "半透明加密",
    atrest: "落地加密",
    dir_protect: "关键目录保护",
  };

  const ACCOUNT_TYPE_LABEL = {
    system: "系统账号",
    db: "数据库账号",
    local: "终端本地账号",
    domain: "域账号",
    admin: "管理员账号",
    third_party: "第三方运维账号",
  };

  const ALERT_TYPES = {
    unencrypted: "未按策略加密",
    client_offline: "加密客户端离线",
    policy_mismatch: "策略版本不一致",
    abnormal_decrypt: "异常解密",
    outbound_decrypt: "外发前脱密",
    dir_write_anomaly: "关键目录写入异常",
    mass_rename: "批量重命名",
    ransomware_suspect: "疑似勒索加密",
  };

  const ANOMALY_TYPES = {
    weak_password: "弱口令",
    brute_force: "暴力破解",
    credential_stuffing: "撞库",
    geo_anomaly: "异地登录",
    off_hours: "非工作时间登录",
    fail_burst: "异常失败次数",
    shared_account: "共享账号使用",
    privilege_abuse: "越权访问",
  };

  const PROTECT_META = {
    encrypted: { label: "已加密", tagClass: "success" },
    partial: { label: "部分加密", tagClass: "warning" },
    plaintext: { label: "明文", tagClass: "danger" },
    unknown: { label: "未知", tagClass: "" },
  };

  const CLIENT_META = {
    online: { label: "在线", tagClass: "success" },
    offline: { label: "离线", tagClass: "danger" },
    outdated: { label: "版本落后", tagClass: "warning" },
  };

  const ENCRYPT_HANDLE_META = {
    none: { label: "无", tagClass: "" },
    pending: { label: "待处置", tagClass: "warning" },
    blocked: { label: "已阻断", tagClass: "danger" },
    restored: { label: "已恢复", tagClass: "success" },
    ticketed: { label: "已建工单", tagClass: "" },
  };

  const ACCOUNT_STATUS_META = {
    active: { label: "正常", tagClass: "success" },
    disabled: { label: "停用", tagClass: "danger" },
    locked: { label: "已锁定", tagClass: "danger" },
  };

  const RISK_META = {
    low: { label: "低", tagClass: "success" },
    medium: { label: "中", tagClass: "warning" },
    high: { label: "高", tagClass: "danger" },
  };

  const ACCOUNT_HANDLE_META = {
    normal: { label: "正常", tagClass: "success" },
    pending: { label: "待处置", tagClass: "warning" },
    locked: { label: "已锁定", tagClass: "danger" },
    pwd_reset: { label: "已强制改密", tagClass: "warning" },
    session_blocked: { label: "已阻断会话", tagClass: "danger" },
    review: { label: "审批复核中", tagClass: "warning" },
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

  function bumpVersion(v) {
    const m = String(v || "v0").match(/v?(\d+)/i);
    const n = m ? Number(m[1]) + 1 : 1;
    return `v${n}`;
  }

  function protectTag(status) {
    return PROTECT_META[status] ? { ...PROTECT_META[status] } : { label: status || "-", tagClass: "" };
  }

  function clientTag(status) {
    return CLIENT_META[status] ? { ...CLIENT_META[status] } : { label: status || "-", tagClass: "" };
  }

  function encryptHandleTag(status) {
    return ENCRYPT_HANDLE_META[status] ? { ...ENCRYPT_HANDLE_META[status] } : { label: status || "-", tagClass: "" };
  }

  function accountStatusTag(status) {
    return ACCOUNT_STATUS_META[status] ? { ...ACCOUNT_STATUS_META[status] } : { label: status || "-", tagClass: "" };
  }

  function riskTag(level) {
    return RISK_META[level] ? { ...RISK_META[level] } : { label: level || "-", tagClass: "" };
  }

  function accountHandleTag(status) {
    return ACCOUNT_HANDLE_META[status] ? { ...ACCOUNT_HANDLE_META[status] } : { label: status || "-", tagClass: "" };
  }

  function encryptModeLabel(mode) {
    return ENCRYPT_MODE_LABEL[mode] || mode || "-";
  }

  function accountTypeLabel(type) {
    return ACCOUNT_TYPE_LABEL[type] || type || "-";
  }

  function alertTypeLabel(type) {
    return ALERT_TYPES[type] || type || "-";
  }

  function anomalyTypeLabel(type) {
    return ANOMALY_TYPES[type] || type || "-";
  }

  let policies = [
    {
      id: "POL-001",
      name: "财务敏感文档策略",
      version: "v3",
      fileTypes: ["文档", "表格"],
      suffixes: [".docx", ".xlsx", ".pdf"],
      binaryHints: ["OLE复合文档"],
      paths: ["D:\\Finance\\*", "\\\\nas\\finance\\*"],
      bizSystems: ["财务核心"],
      dataLevels: ["敏感", "机密"],
      terminalGroups: ["机关办公网"],
      encryptMode: "transparent",
      enabled: true,
      updatedAt: "2026-10-28 09:12:00",
    },
    {
      id: "POL-002",
      name: "OA半透明策略",
      version: "v2",
      fileTypes: ["文档"],
      suffixes: [".doc", ".docx"],
      binaryHints: [],
      paths: ["C:\\Users\\*\\Documents\\OA\\*"],
      bizSystems: ["OA协同"],
      dataLevels: ["内部", "敏感"],
      terminalGroups: ["机关办公网", "远程接入"],
      encryptMode: "semi",
      enabled: true,
      updatedAt: "2026-10-20 14:30:00",
    },
    {
      id: "POL-003",
      name: "机房落地加密",
      version: "v4",
      fileTypes: ["数据库备份", "日志"],
      suffixes: [".bak", ".dump", ".log"],
      binaryHints: ["SQL dump"],
      paths: ["/data/backup/*", "/var/db/*"],
      bizSystems: ["运维堡垒", "数据交换"],
      dataLevels: ["敏感", "机密"],
      terminalGroups: ["机房服务器"],
      encryptMode: "atrest",
      enabled: true,
      updatedAt: "2026-10-30 11:05:00",
    },
    {
      id: "POL-004",
      name: "关键目录保护",
      version: "v1",
      fileTypes: ["目录"],
      suffixes: [],
      binaryHints: [],
      paths: ["D:\\Secrets\\*", "/opt/secure/*"],
      bizSystems: ["电子政务外网", "数据交换"],
      dataLevels: ["机密"],
      terminalGroups: ["机房服务器", "开发测试"],
      encryptMode: "dir_protect",
      enabled: true,
      updatedAt: "2026-10-15 16:40:00",
    },
  ];

  let encryptObjects = [
    {
      id: "EO-001", name: "预算编制表.xlsx", path: "D:\\Finance\\2026\\预算编制表.xlsx", objectType: "file",
      bizSystem: "财务核心", dataLevel: "机密", terminalGroup: "机关办公网",
      encryptMode: "transparent", protectStatus: "encrypted", policyId: "POL-001", policyName: "财务敏感文档策略", policyVersion: "v3",
      matchRuleSummary: "后缀 .xlsx · 路径 D:\\Finance\\* · 数据等级 机密",
      clientStatus: "online", alertType: "", handleStatus: "none", lastReportAt: "2026-11-01 08:12:00",
    },
    {
      id: "EO-002", name: "合同扫描件.pdf", path: "D:\\Finance\\contracts\\合同扫描件.pdf", objectType: "file",
      bizSystem: "财务核心", dataLevel: "敏感", terminalGroup: "机关办公网",
      encryptMode: "transparent", protectStatus: "plaintext", policyId: "POL-001", policyName: "财务敏感文档策略", policyVersion: "v3",
      matchRuleSummary: "后缀 .pdf · 路径 D:\\Finance\\* · 未按策略加密",
      clientStatus: "online", alertType: "unencrypted", handleStatus: "pending", lastReportAt: "2026-11-01 09:05:11",
    },
    {
      id: "EO-003", name: "OA草稿.docx", path: "C:\\Users\\zhang\\Documents\\OA\\草稿.docx", objectType: "file",
      bizSystem: "OA协同", dataLevel: "内部", terminalGroup: "机关办公网",
      encryptMode: "semi", protectStatus: "partial", policyId: "POL-002", policyName: "OA半透明策略", policyVersion: "v2",
      matchRuleSummary: "后缀 .docx · OA 半透明 · 部分落地明文",
      clientStatus: "online", alertType: "outbound_decrypt", handleStatus: "pending", lastReportAt: "2026-11-01 07:48:22",
    },
    {
      id: "EO-004", name: "会议纪要.doc", path: "C:\\Users\\li\\Documents\\OA\\会议纪要.doc", objectType: "file",
      bizSystem: "OA协同", dataLevel: "内部", terminalGroup: "远程接入",
      encryptMode: "semi", protectStatus: "encrypted", policyId: "POL-002", policyName: "OA半透明策略", policyVersion: "v1",
      matchRuleSummary: "策略版本不一致（对象 v1 / 策略 v2）",
      clientStatus: "outdated", alertType: "policy_mismatch", handleStatus: "pending", lastReportAt: "2026-10-31 18:20:00",
    },
    {
      id: "EO-005", name: "core_db.bak", path: "/data/backup/core_db.bak", objectType: "file",
      bizSystem: "运维堡垒", dataLevel: "机密", terminalGroup: "机房服务器",
      encryptMode: "atrest", protectStatus: "encrypted", policyId: "POL-003", policyName: "机房落地加密", policyVersion: "v4",
      matchRuleSummary: "后缀 .bak · /data/backup/* · 落地加密",
      clientStatus: "online", alertType: "", handleStatus: "none", lastReportAt: "2026-11-01 06:30:00",
    },
    {
      id: "EO-006", name: "exchange.dump", path: "/data/backup/exchange.dump", objectType: "file",
      bizSystem: "数据交换", dataLevel: "敏感", terminalGroup: "机房服务器",
      encryptMode: "atrest", protectStatus: "unknown", policyId: "POL-003", policyName: "机房落地加密", policyVersion: "v4",
      matchRuleSummary: "客户端离线，状态未知",
      clientStatus: "offline", alertType: "client_offline", handleStatus: "pending", lastReportAt: "2026-10-30 22:11:00",
    },
    {
      id: "EO-007", name: "Secrets", path: "D:\\Secrets", objectType: "dir",
      bizSystem: "电子政务外网", dataLevel: "机密", terminalGroup: "机房服务器",
      encryptMode: "dir_protect", protectStatus: "encrypted", policyId: "POL-004", policyName: "关键目录保护", policyVersion: "v1",
      matchRuleSummary: "关键目录 D:\\Secrets\\*",
      clientStatus: "online", alertType: "", handleStatus: "none", lastReportAt: "2026-11-01 08:00:00",
    },
    {
      id: "EO-008", name: "secure", path: "/opt/secure", objectType: "dir",
      bizSystem: "数据交换", dataLevel: "机密", terminalGroup: "开发测试",
      encryptMode: "dir_protect", protectStatus: "partial", policyId: "POL-004", policyName: "关键目录保护", policyVersion: "v1",
      matchRuleSummary: "关键目录写入异常",
      clientStatus: "online", alertType: "dir_write_anomaly", handleStatus: "pending", lastReportAt: "2026-11-01 10:15:33",
    },
    {
      id: "EO-009", name: "人事花名册.xlsx", path: "\\\\nas\\finance\\hr\\人事花名册.xlsx", objectType: "file",
      bizSystem: "财务核心", dataLevel: "敏感", terminalGroup: "机关办公网",
      encryptMode: "transparent", protectStatus: "encrypted", policyId: "POL-001", policyName: "财务敏感文档策略", policyVersion: "v3",
      matchRuleSummary: "异常解密尝试已记录",
      clientStatus: "online", alertType: "abnormal_decrypt", handleStatus: "pending", lastReportAt: "2026-11-01 09:40:00",
    },
    {
      id: "EO-010", name: "归档2024", path: "D:\\Finance\\archive\\2024", objectType: "dir",
      bizSystem: "财务核心", dataLevel: "内部", terminalGroup: "机关办公网",
      encryptMode: "transparent", protectStatus: "partial", policyId: "POL-001", policyName: "财务敏感文档策略", policyVersion: "v3",
      matchRuleSummary: "批量重命名疑似绕过",
      clientStatus: "online", alertType: "mass_rename", handleStatus: "pending", lastReportAt: "2026-11-01 11:02:18",
    },
    {
      id: "EO-011", name: "研发资料包.zip", path: "D:\\Dev\\发包\\研发资料包.zip", objectType: "file",
      bizSystem: "电子政务外网", dataLevel: "内部", terminalGroup: "开发测试",
      encryptMode: "atrest", protectStatus: "plaintext", policyId: "POL-003", policyName: "机房落地加密", policyVersion: "v4",
      matchRuleSummary: "疑似勒索加密特征",
      clientStatus: "online", alertType: "ransomware_suspect", handleStatus: "pending", lastReportAt: "2026-11-01 11:28:00",
    },
    {
      id: "EO-012", name: "公开公告.docx", path: "C:\\Users\\public\\Documents\\公开公告.docx", objectType: "file",
      bizSystem: "OA协同", dataLevel: "公开", terminalGroup: "机关办公网",
      encryptMode: "semi", protectStatus: "encrypted", policyId: "POL-002", policyName: "OA半透明策略", policyVersion: "v2",
      matchRuleSummary: "公开等级，策略可选加密",
      clientStatus: "online", alertType: "", handleStatus: "none", lastReportAt: "2026-10-31 15:00:00",
    },
    {
      id: "EO-013", name: "堡垒日志.log", path: "/var/db/bastion.log", objectType: "file",
      bizSystem: "运维堡垒", dataLevel: "内部", terminalGroup: "机房服务器",
      encryptMode: "atrest", protectStatus: "encrypted", policyId: "POL-003", policyName: "机房落地加密", policyVersion: "v4",
      matchRuleSummary: "后缀 .log · 落地加密",
      clientStatus: "outdated", alertType: "", handleStatus: "none", lastReportAt: "2026-10-29 12:00:00",
    },
    {
      id: "EO-014", name: "远程办公包", path: "C:\\Users\\remote\\Documents\\OA\\远程办公包", objectType: "dir",
      bizSystem: "OA协同", dataLevel: "敏感", terminalGroup: "远程接入",
      encryptMode: "semi", protectStatus: "encrypted", policyId: "POL-002", policyName: "OA半透明策略", policyVersion: "v2",
      matchRuleSummary: "远程接入终端 · 半透明",
      clientStatus: "online", alertType: "", handleStatus: "restored", lastReportAt: "2026-11-01 08:55:00",
    },
  ];

  let recentAlerts = [
    { id: "EA-001", objectId: "EO-002", time: "2026-11-01 09:05:11", alertType: "unencrypted", summary: "命中策略但文件为明文", result: "待处置" },
    { id: "EA-002", objectId: "EO-002", time: "2026-10-31 16:20:00", alertType: "unencrypted", summary: "保存后仍未加密", result: "待处置" },
    { id: "EA-003", objectId: "EO-003", time: "2026-11-01 07:48:22", alertType: "outbound_decrypt", summary: "外发前检测到脱密", result: "待处置" },
    { id: "EA-004", objectId: "EO-003", time: "2026-10-30 19:10:00", alertType: "outbound_decrypt", summary: "邮件附件明文落地", result: "已忽略" },
    { id: "EA-005", objectId: "EO-004", time: "2026-10-31 18:20:00", alertType: "policy_mismatch", summary: "客户端策略版本落后", result: "待处置" },
    { id: "EA-006", objectId: "EO-004", time: "2026-10-28 10:00:00", alertType: "policy_mismatch", summary: "策略下发失败重试", result: "已重试" },
    { id: "EA-007", objectId: "EO-006", time: "2026-10-30 22:11:00", alertType: "client_offline", summary: "加密客户端超过 24h 离线", result: "待处置" },
    { id: "EA-008", objectId: "EO-006", time: "2026-10-29 08:00:00", alertType: "client_offline", summary: "心跳中断", result: "待处置" },
    { id: "EA-009", objectId: "EO-008", time: "2026-11-01 10:15:33", alertType: "dir_write_anomaly", summary: "非授权进程写入关键目录", result: "待处置" },
    { id: "EA-010", objectId: "EO-008", time: "2026-10-31 21:00:00", alertType: "dir_write_anomaly", summary: "批量新建临时文件", result: "已观察" },
    { id: "EA-011", objectId: "EO-009", time: "2026-11-01 09:40:00", alertType: "abnormal_decrypt", summary: "非工作账号解密尝试", result: "待处置" },
    { id: "EA-012", objectId: "EO-009", time: "2026-10-30 14:22:00", alertType: "abnormal_decrypt", summary: "短时多次解密失败", result: "待处置" },
    { id: "EA-013", objectId: "EO-010", time: "2026-11-01 11:02:18", alertType: "mass_rename", summary: "目录内 120+ 文件批量重命名", result: "待处置" },
    { id: "EA-014", objectId: "EO-010", time: "2026-10-31 11:00:00", alertType: "mass_rename", summary: "扩展名批量变更", result: "待处置" },
    { id: "EA-015", objectId: "EO-011", time: "2026-11-01 11:28:00", alertType: "ransomware_suspect", summary: "熵值突变 + 批量加密后缀", result: "待处置" },
    { id: "EA-016", objectId: "EO-011", time: "2026-11-01 11:25:00", alertType: "ransomware_suspect", summary: "可疑进程写入", result: "待处置" },
    { id: "EA-017", objectId: "EO-001", time: "2026-10-28 09:00:00", alertType: "unencrypted", summary: "历史明文已纠正", result: "已恢复" },
    { id: "EA-018", objectId: "EO-005", time: "2026-10-27 12:00:00", alertType: "client_offline", summary: "短暂离线后恢复", result: "已恢复" },
    { id: "EA-019", objectId: "EO-014", time: "2026-10-30 08:00:00", alertType: "outbound_decrypt", summary: "误报后恢复", result: "已恢复" },
    { id: "EA-020", objectId: "EO-007", time: "2026-10-25 16:00:00", alertType: "dir_write_anomaly", summary: "巡检写入已放行", result: "已忽略" },
    { id: "EA-021", objectId: "EO-012", time: "2026-10-20 10:00:00", alertType: "policy_mismatch", summary: "公开文档策略校准", result: "已完成" },
  ];

  let accounts = [
    {
      id: "AC-001", account: "sys_portal", displayName: "门户系统账号", accountType: "system",
      group: "信息中心", roles: "应用只读", accessTargets: "门户后台",
      status: "active", lastLoginAt: "2026-11-01 08:10:00", loginSource: "10.20.1.8", loginResult: "成功",
      riskLevel: "low", anomalyType: "", idle: false, handleStatus: "normal",
      lastPermissionChangeAt: "2026-09-01 10:00:00", privilegeNote: "",
    },
    {
      id: "AC-002", account: "db_finance", displayName: "财务库账号", accountType: "db",
      group: "财务处", roles: "读写", accessTargets: "财务核心库",
      status: "active", lastLoginAt: "2026-11-01 09:22:00", loginSource: "10.20.3.40", loginResult: "成功",
      riskLevel: "high", anomalyType: "privilege_abuse", idle: false, handleStatus: "pending",
      lastPermissionChangeAt: "2026-10-20 11:00:00", privilegeNote: "权限过大，含删表权限",
    },
    {
      id: "AC-003", account: "PC-FIN-01\\localadmin", displayName: "财务终端本地管理员", accountType: "local",
      group: "财务处", roles: "本地管理员", accessTargets: "PC-FIN-01",
      status: "active", lastLoginAt: "2026-08-12 09:00:00", loginSource: "本机", loginResult: "成功",
      riskLevel: "medium", anomalyType: "", idle: true, handleStatus: "normal",
      lastPermissionChangeAt: "2026-05-01 09:00:00", privilegeNote: "闲置超过 60 天",
    },
    {
      id: "AC-004", account: "DOMAIN\\zhang.wei", displayName: "张伟", accountType: "domain",
      group: "运维一组", roles: "域用户", accessTargets: "文件共享",
      status: "active", lastLoginAt: "2026-11-01 07:55:00", loginSource: "外网 VPN 118.22.*.*", loginResult: "成功",
      riskLevel: "high", anomalyType: "geo_anomaly", idle: false, handleStatus: "pending",
      lastPermissionChangeAt: "2026-10-01 09:00:00", privilegeNote: "异地登录",
    },
    {
      id: "AC-005", account: "admin_root", displayName: "平台超级管理员", accountType: "admin",
      group: "信息中心", roles: "超级管理员", accessTargets: "全平台",
      status: "active", lastLoginAt: "2026-11-01 06:40:00", loginSource: "10.20.3.31", loginResult: "成功",
      riskLevel: "medium", anomalyType: "off_hours", idle: false, handleStatus: "pending",
      lastPermissionChangeAt: "2026-07-15 10:00:00", privilegeNote: "非工作时间登录",
    },
    {
      id: "AC-006", account: "vendor_ops", displayName: "驻场运维账号", accountType: "third_party",
      group: "第三方驻场", roles: "临时运维", accessTargets: "运维堡垒",
      status: "active", lastLoginAt: "2026-11-01 10:05:00", loginSource: "堡垒机", loginResult: "失败",
      riskLevel: "high", anomalyType: "brute_force", idle: false, handleStatus: "pending",
      lastPermissionChangeAt: "2026-10-28 14:00:00", privilegeNote: "临时授权将到期",
    },
    {
      id: "AC-007", account: "db_oa_ro", displayName: "OA只读库账号", accountType: "db",
      group: "办公室", roles: "只读", accessTargets: "OA 库",
      status: "active", lastLoginAt: "2026-10-15 11:00:00", loginSource: "10.20.2.15", loginResult: "成功",
      riskLevel: "low", anomalyType: "", idle: true, handleStatus: "normal",
      lastPermissionChangeAt: "2026-06-01 09:00:00", privilegeNote: "",
    },
    {
      id: "AC-008", account: "DOMAIN\\shared.ops", displayName: "运维共享账号", accountType: "domain",
      group: "运维一组", roles: "运维", accessTargets: "多主机",
      status: "active", lastLoginAt: "2026-11-01 09:50:00", loginSource: "10.20.5.51", loginResult: "成功",
      riskLevel: "high", anomalyType: "shared_account", idle: false, handleStatus: "pending",
      lastPermissionChangeAt: "2026-09-10 09:00:00", privilegeNote: "多人共用",
    },
    {
      id: "AC-009", account: "svc_exchange", displayName: "交换服务账号", accountType: "system",
      group: "信息中心", roles: "服务账号", accessTargets: "数据交换",
      status: "active", lastLoginAt: "2026-11-01 08:00:00", loginSource: "本机服务", loginResult: "成功",
      riskLevel: "medium", anomalyType: "weak_password", idle: false, handleStatus: "pending",
      lastPermissionChangeAt: "2026-04-01 09:00:00", privilegeNote: "弱口令检测命中",
    },
    {
      id: "AC-010", account: "PC-IT-02\\guest", displayName: "测试机访客", accountType: "local",
      group: "信息中心", roles: "访客", accessTargets: "PC-IT-02",
      status: "disabled", lastLoginAt: "2026-07-01 10:00:00", loginSource: "本机", loginResult: "成功",
      riskLevel: "low", anomalyType: "", idle: false, handleStatus: "normal",
      lastPermissionChangeAt: "2026-07-02 09:00:00", privilegeNote: "已停用",
    },
    {
      id: "AC-011", account: "DOMAIN\\chen.li", displayName: "陈丽", accountType: "domain",
      group: "办公室", roles: "域用户", accessTargets: "OA",
      status: "active", lastLoginAt: "2026-11-01 08:30:00", loginSource: "10.20.7.71", loginResult: "失败",
      riskLevel: "high", anomalyType: "credential_stuffing", idle: false, handleStatus: "pending",
      lastPermissionChangeAt: "2026-10-05 09:00:00", privilegeNote: "撞库特征",
    },
    {
      id: "AC-012", account: "bastion_admin", displayName: "堡垒管理员", accountType: "admin",
      group: "运维一组", roles: "堡垒管理员", accessTargets: "运维堡垒",
      status: "locked", lastLoginAt: "2026-10-31 23:10:00", loginSource: "外网", loginResult: "失败",
      riskLevel: "high", anomalyType: "fail_burst", idle: false, handleStatus: "locked",
      lastPermissionChangeAt: "2026-10-31 23:15:00", privilegeNote: "异常失败次数触发锁定",
    },
    {
      id: "AC-013", account: "outsource_dev", displayName: "外包开发", accountType: "third_party",
      group: "第三方驻场", roles: "开发只读", accessTargets: "开发测试环境",
      status: "active", lastLoginAt: "2026-09-20 14:00:00", loginSource: "VPN", loginResult: "成功",
      riskLevel: "medium", anomalyType: "", idle: true, handleStatus: "normal",
      lastPermissionChangeAt: "2026-08-01 09:00:00", privilegeNote: "闲置待清理",
    },
    {
      id: "AC-014", account: "sys_monitor", displayName: "监控采集账号", accountType: "system",
      group: "信息中心", roles: "采集", accessTargets: "性能监测",
      status: "active", lastLoginAt: "2026-11-01 00:05:00", loginSource: "采集节点", loginResult: "成功",
      riskLevel: "low", anomalyType: "", idle: false, handleStatus: "normal",
      lastPermissionChangeAt: "2026-03-01 09:00:00", privilegeNote: "",
    },
  ];

  let recentLogins = [
    { id: "LG-001", accountId: "AC-001", time: "2026-11-01 08:10:00", source: "10.20.1.8", result: "成功", client: "Chrome" },
    { id: "LG-002", accountId: "AC-001", time: "2026-10-31 08:05:00", source: "10.20.1.8", result: "成功", client: "Chrome" },
    { id: "LG-003", accountId: "AC-002", time: "2026-11-01 09:22:00", source: "10.20.3.40", result: "成功", client: "Navicat" },
    { id: "LG-004", accountId: "AC-002", time: "2026-11-01 09:18:00", source: "10.20.3.40", result: "失败", client: "Navicat" },
    { id: "LG-005", accountId: "AC-004", time: "2026-11-01 07:55:00", source: "118.22.9.12", result: "成功", client: "Edge" },
    { id: "LG-006", accountId: "AC-004", time: "2026-10-30 21:00:00", source: "10.20.5.51", result: "成功", client: "Edge" },
    { id: "LG-007", accountId: "AC-005", time: "2026-11-01 06:40:00", source: "10.20.3.31", result: "成功", client: "Chrome" },
    { id: "LG-008", accountId: "AC-005", time: "2026-10-31 02:10:00", source: "10.20.3.31", result: "成功", client: "Chrome" },
    { id: "LG-009", accountId: "AC-006", time: "2026-11-01 10:05:00", source: "堡垒机", result: "失败", client: "SSH" },
    { id: "LG-010", accountId: "AC-006", time: "2026-11-01 10:04:00", source: "堡垒机", result: "失败", client: "SSH" },
    { id: "LG-011", accountId: "AC-006", time: "2026-11-01 10:03:00", source: "堡垒机", result: "失败", client: "SSH" },
    { id: "LG-012", accountId: "AC-008", time: "2026-11-01 09:50:00", source: "10.20.5.51", result: "成功", client: "RDP" },
    { id: "LG-013", accountId: "AC-008", time: "2026-11-01 08:20:00", source: "10.20.5.52", result: "成功", client: "RDP" },
    { id: "LG-014", accountId: "AC-009", time: "2026-11-01 08:00:00", source: "本机服务", result: "成功", client: "Service" },
    { id: "LG-015", accountId: "AC-011", time: "2026-11-01 08:30:00", source: "10.20.7.71", result: "失败", client: "Chrome" },
    { id: "LG-016", accountId: "AC-011", time: "2026-11-01 08:29:00", source: "外网 45.*.*.*", result: "失败", client: "Unknown" },
    { id: "LG-017", accountId: "AC-012", time: "2026-10-31 23:10:00", source: "外网", result: "失败", client: "SSH" },
    { id: "LG-018", accountId: "AC-012", time: "2026-10-31 23:09:00", source: "外网", result: "失败", client: "SSH" },
    { id: "LG-019", accountId: "AC-014", time: "2026-11-01 00:05:00", source: "采集节点", result: "成功", client: "Agent" },
    { id: "LG-020", accountId: "AC-003", time: "2026-08-12 09:00:00", source: "本机", result: "成功", client: "Winlogon" },
    { id: "LG-021", accountId: "AC-007", time: "2026-10-15 11:00:00", source: "10.20.2.15", result: "成功", client: "DBeaver" },
    { id: "LG-022", accountId: "AC-013", time: "2026-09-20 14:00:00", source: "VPN", result: "成功", client: "VS Code" },
    { id: "LG-023", accountId: "AC-002", time: "2026-10-31 16:00:00", source: "10.20.3.40", result: "成功", client: "Navicat" },
    { id: "LG-024", accountId: "AC-004", time: "2026-11-01 07:50:00", source: "118.22.9.12", result: "失败", client: "Edge" },
    { id: "LG-025", accountId: "AC-008", time: "2026-10-30 19:00:00", source: "10.20.5.51", result: "成功", client: "RDP" },
  ];

  let sensitiveOps = [
    { id: "SO-001", accountId: "AC-002", time: "2026-11-01 09:25:00", action: "授权变更", target: "财务核心库 DELETE", result: "成功" },
    { id: "SO-002", accountId: "AC-002", time: "2026-10-20 11:00:00", action: "角色提升", target: "db_finance → DBA", result: "成功" },
    { id: "SO-003", accountId: "AC-005", time: "2026-11-01 06:45:00", action: "策略修改", target: "全局加密策略", result: "成功" },
    { id: "SO-004", accountId: "AC-005", time: "2026-10-31 02:15:00", action: "用户停用", target: "临时账号 batch", result: "成功" },
    { id: "SO-005", accountId: "AC-006", time: "2026-10-28 14:00:00", action: "临时授权", target: "堡垒会话 7 天", result: "成功" },
    { id: "SO-006", accountId: "AC-008", time: "2026-11-01 09:52:00", action: "提权执行", target: "sudo systemctl", result: "成功" },
    { id: "SO-007", accountId: "AC-008", time: "2026-11-01 08:22:00", action: "共享登录", target: "多终端并发", result: "告警" },
    { id: "SO-008", accountId: "AC-004", time: "2026-11-01 07:56:00", action: "下载敏感文件", target: "人事花名册.xlsx", result: "拦截" },
    { id: "SO-009", accountId: "AC-011", time: "2026-11-01 08:30:00", action: "登录爆破", target: "域控", result: "失败" },
    { id: "SO-010", accountId: "AC-012", time: "2026-10-31 23:12:00", action: "账号锁定", target: "bastion_admin", result: "成功" },
    { id: "SO-011", accountId: "AC-009", time: "2026-10-01 09:00:00", action: "口令检测", target: "弱口令规则", result: "命中" },
    { id: "SO-012", accountId: "AC-001", time: "2026-09-01 10:00:00", action: "权限收缩", target: "应用只读", result: "成功" },
    { id: "SO-013", accountId: "AC-013", time: "2026-08-01 09:00:00", action: "开通账号", target: "开发测试只读", result: "成功" },
    { id: "SO-014", accountId: "AC-003", time: "2026-05-01 09:00:00", action: "本地提权", target: "localadmin", result: "成功" },
    { id: "SO-015", accountId: "AC-007", time: "2026-06-01 09:00:00", action: "只读授权", target: "OA 库", result: "成功" },
    { id: "SO-016", accountId: "AC-014", time: "2026-03-01 09:00:00", action: "服务账号创建", target: "sys_monitor", result: "成功" },
    { id: "SO-017", accountId: "AC-006", time: "2026-11-01 10:06:00", action: "暴力破解", target: "堡垒登录", result: "失败" },
  ];

  let policySeq = 4;
  let objectSeq = 14;
  let alertSeq = 21;
  let accountSeq = 14;

  function listBizSystems() {
    return BIZ_SYSTEMS.slice();
  }

  function listTerminalGroups() {
    return TERMINAL_GROUPS.slice();
  }

  function listDataLevels() {
    return DATA_LEVELS.slice();
  }

  function listDeptGroups() {
    return DEPT_GROUPS.slice();
  }

  function listPolicies() {
    return policies.map(clone);
  }

  function getPolicy(id) {
    const row = policies.find((p) => p.id === id);
    return row ? clone(row) : null;
  }

  function savePolicy(payload) {
    const data = { ...payload };
    if (!data.id) {
      policySeq += 1;
      data.id = `POL-${String(policySeq).padStart(3, "0")}`;
      data.version = "v1";
      data.updatedAt = formatNow();
      if (data.enabled == null) data.enabled = true;
      policies.push(data);
      return clone(data);
    }
    const idx = policies.findIndex((p) => p.id === data.id);
    if (idx < 0) return null;
    const nextVersion = bumpVersion(policies[idx].version);
    const merged = {
      ...policies[idx],
      ...data,
      version: nextVersion,
      updatedAt: formatNow(),
    };
    policies[idx] = merged;
    encryptObjects.forEach((obj, i) => {
      if (obj.policyId === merged.id) {
        encryptObjects[i] = {
          ...obj,
          policyName: merged.name,
          policyVersion: merged.version,
          encryptMode: merged.encryptMode || obj.encryptMode,
          clientStatus: obj.clientStatus === "offline" ? "offline" : "outdated",
        };
      }
    });
    return clone(merged);
  }

  function listEncryptObjects(filter) {
    const f = filter || {};
    return encryptObjects
      .filter((row) => {
        if (f.objectType && row.objectType !== f.objectType) return false;
        if (f.encryptMode && row.encryptMode !== f.encryptMode) return false;
        if (f.protectStatus && row.protectStatus !== f.protectStatus) return false;
        if (f.dataLevel && row.dataLevel !== f.dataLevel) return false;
        if (f.bizSystem && row.bizSystem !== f.bizSystem) return false;
        if (f.terminalGroup && row.terminalGroup !== f.terminalGroup) return false;
        if (f.keyword) {
          const kw = String(f.keyword).toLowerCase();
          const hit = `${row.name} ${row.path}`.toLowerCase().includes(kw);
          if (!hit) return false;
        }
        return true;
      })
      .map(clone);
  }

  function getEncryptObject(id) {
    const row = encryptObjects.find((o) => o.id === id);
    return row ? clone(row) : null;
  }

  function encryptMetrics() {
    const total = encryptObjects.length;
    const compliant = encryptObjects.filter((o) => o.protectStatus === "encrypted").length;
    const policyAbnormal = encryptObjects.filter(
      (o) => o.clientStatus === "outdated" || o.alertType === "policy_mismatch" || o.protectStatus === "partial"
    ).length;
    const alertPending = encryptObjects.filter((o) => o.handleStatus === "pending").length;
    return { total, compliant, policyAbnormal, alertPending };
  }

  function disposeEncryptAlert(id, payload) {
    const idx = encryptObjects.findIndex((o) => o.id === id);
    if (idx < 0) return null;
    const action = payload && payload.action;
    const alertType = (payload && payload.alertType) || encryptObjects[idx].alertType || "";
    let handleStatus = encryptObjects[idx].handleStatus;
    let protectStatus = encryptObjects[idx].protectStatus;
    if (action === "block") handleStatus = "blocked";
    if (action === "restore") {
      handleStatus = "restored";
      protectStatus = "encrypted";
    }
    if (action === "ticket") handleStatus = "ticketed";
    encryptObjects[idx] = {
      ...encryptObjects[idx],
      alertType,
      handleStatus,
      protectStatus,
      lastReportAt: formatNow(),
    };
    alertSeq += 1;
    recentAlerts.unshift({
      id: `EA-${String(alertSeq).padStart(3, "0")}`,
      objectId: id,
      time: formatNow(),
      alertType,
      summary: (payload && payload.remark) || `处置动作：${action || "-"}`,
      result: encryptHandleTag(handleStatus).label,
    });
    return clone(encryptObjects[idx]);
  }

  function listRecentAlerts(objectId, limit) {
    const lim = limit == null ? 10 : limit;
    return recentAlerts
      .filter((a) => a.objectId === objectId)
      .slice(0, lim)
      .map(clone);
  }

  function listAccounts(filter) {
    const f = filter || {};
    return accounts
      .filter((row) => {
        if (f.accountType && row.accountType !== f.accountType) return false;
        if (f.status && row.status !== f.status) return false;
        if (f.riskLevel && row.riskLevel !== f.riskLevel) return false;
        if (f.anomalyType && row.anomalyType !== f.anomalyType) return false;
        if (f.group && row.group !== f.group) return false;
        if (f.keyword) {
          const kw = String(f.keyword).toLowerCase();
          const hit = `${row.account} ${row.displayName}`.toLowerCase().includes(kw);
          if (!hit) return false;
        }
        return true;
      })
      .map(clone);
  }

  function getAccount(id) {
    const row = accounts.find((a) => a.id === id);
    return row ? clone(row) : null;
  }

  function auditMetrics() {
    const total = accounts.length;
    const highRisk = accounts.filter((a) => a.riskLevel === "high").length;
    const idlePending = accounts.filter((a) => a.idle === true && a.status === "active").length;
    // todayAnomaly: 异常类型非空且最近登录日为 MOCK_TODAY 的账号数
    const todayAnomaly = accounts.filter(
      (a) => a.anomalyType && String(a.lastLoginAt || "").startsWith(MOCK_TODAY)
    ).length;
    return { total, highRisk, idlePending, todayAnomaly };
  }

  function disposeAccount(id, payload) {
    const idx = accounts.findIndex((a) => a.id === id);
    if (idx < 0) return null;
    const action = payload && payload.action;
    const next = { ...accounts[idx] };
    if (payload && payload.anomalyType) next.anomalyType = payload.anomalyType;
    if (action === "lock") {
      next.status = "locked";
      next.handleStatus = "locked";
    } else if (action === "force_pwd") {
      next.handleStatus = "pwd_reset";
    } else if (action === "block_session") {
      next.handleStatus = "session_blocked";
    } else if (action === "review") {
      next.handleStatus = "review";
    } else if (action === "temp_expire") {
      next.handleStatus = "review";
      next.privilegeNote = (payload && payload.remark) || "临时授权到期提醒已发起";
    }
    if (payload && payload.remark && action !== "temp_expire") {
      next.privilegeNote = payload.remark;
    }
    accounts[idx] = next;
    return clone(next);
  }

  function listRecentLogins(accountId, limit) {
    const lim = limit == null ? 10 : limit;
    return recentLogins
      .filter((l) => l.accountId === accountId)
      .slice(0, lim)
      .map(clone);
  }

  function listSensitiveOps(accountId, limit) {
    const lim = limit == null ? 10 : limit;
    return sensitiveOps
      .filter((s) => s.accountId === accountId)
      .slice(0, lim)
      .map(clone);
  }

  function runAuditCheck(payload) {
    const checks = (payload && payload.checks) || [];
    const labelMap = {
      inventory: "权限清单核查",
      idle: "闲置账号清理",
      admin_review: "管理员账号复核",
      least_privilege: "最小权限检查",
      temp_expire: "临时授权到期提醒",
    };
    const hits = [];
    checks.forEach((check) => {
      let matched = [];
      if (check === "inventory") matched = accounts.filter((a) => a.status === "active");
      if (check === "idle") matched = accounts.filter((a) => a.idle && a.status === "active");
      if (check === "admin_review") matched = accounts.filter((a) => a.accountType === "admin");
      if (check === "least_privilege") {
        matched = accounts.filter((a) => a.riskLevel === "high" || (a.privilegeNote && a.privilegeNote.includes("权限过大")));
      }
      if (check === "temp_expire") {
        matched = accounts.filter((a) => a.accountType === "third_party" || (a.privilegeNote && a.privilegeNote.includes("临时")));
      }
      if (check === "idle") {
        matched.forEach((a) => {
          const i = accounts.findIndex((x) => x.id === a.id);
          if (i >= 0) accounts[i] = { ...accounts[i], handleStatus: "pending" };
        });
      }
      hits.push({
        check,
        label: labelMap[check] || check,
        count: matched.length,
        sampleAccounts: matched.slice(0, 5).map((a) => a.account),
      });
    });
    const summary = hits.map((h) => `${h.label} ${h.count} 项`).join("；") || "未选择核查项";
    return { ranAt: formatNow(), summary, hits };
  }

  function markIdleCleanup(accountIds) {
    let count = 0;
    accounts = accounts.map((a) => {
      const hit = accountIds && accountIds.length
        ? accountIds.includes(a.id)
        : a.idle === true && a.status === "active";
      if (!hit) return a;
      count += 1;
      return { ...a, handleStatus: "pending" };
    });
    return count;
  }

  window.AccessControl = {
    MOCK_TODAY,
    BIZ_SYSTEMS,
    TERMINAL_GROUPS,
    DATA_LEVELS,
    DEPT_GROUPS,
    ENCRYPT_MODE_LABEL,
    ACCOUNT_TYPE_LABEL,
    ALERT_TYPES,
    ANOMALY_TYPES,
    protectTag,
    clientTag,
    encryptHandleTag,
    accountStatusTag,
    riskTag,
    accountHandleTag,
    encryptModeLabel,
    accountTypeLabel,
    alertTypeLabel,
    anomalyTypeLabel,
    listBizSystems,
    listTerminalGroups,
    listDataLevels,
    listDeptGroups,
    listPolicies,
    getPolicy,
    savePolicy,
    listEncryptObjects,
    getEncryptObject,
    encryptMetrics,
    disposeEncryptAlert,
    listRecentAlerts,
    listAccounts,
    getAccount,
    auditMetrics,
    disposeAccount,
    listRecentLogins,
    listSensitiveOps,
    runAuditCheck,
    markIdleCleanup,
  };
})();
