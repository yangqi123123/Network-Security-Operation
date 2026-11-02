(function () {
  const MOCK_TODAY = "2026-11-01";

  const ASSET_TYPE_LABEL = {
    structured: "结构化数据",
    unstructured: "非结构化文件",
    endpoint: "终端本地数据",
  };

  const LEVEL_META = {
    L1: { label: "公开", tagClass: "" },
    L2: { label: "内部", tagClass: "" },
    L3: { label: "敏感", tagClass: "warning" },
    L4: { label: "机密", tagClass: "danger" },
  };

  const STAGE_META = {
    identified: { label: "自动识别", tagClass: "" },
    tagged: { label: "人工打标", tagClass: "" },
    review: { label: "结果审核", tagClass: "warning" },
    accept: { label: "结果验收", tagClass: "warning" },
    published: { label: "结果发布", tagClass: "success" },
    false_positive: { label: "误报", tagClass: "danger" },
  };

  const METHOD_LABEL = {
    metadata: "元数据扫描",
    sample: "内容抽样",
    rule: "规则匹配",
    keyword: "关键字",
    regex: "正则",
    dict: "字典",
    db_fp: "数据库指纹",
    doc_fp: "文档指纹",
    img_fp: "图像指纹",
    semantic: "语义模型",
    ai: "AI模型",
    manual: "人工打标",
  };

  const SCENE_LABEL = {
    gov: "政府",
    finance: "金融",
    medical: "医疗",
    edu: "教育",
    enterprise: "企业",
    industry: "工业",
  };

  const RISK_TYPES = [
    "违规访问",
    "SQL注入",
    "越权操作",
    "拖库",
    "大流量返回",
    "异常登录",
    "敏感表访问",
    "暴力破解",
    "撞库",
    "批量导出",
    "删改表",
    "存储过程滥用",
    "非授权访问",
    "异常时间访问",
    "高危运维操作",
  ];

  const HIGH_RISKS = new Set([
    "SQL注入",
    "拖库",
    "越权操作",
    "暴力破解",
    "撞库",
    "批量导出",
    "删改表",
    "高危运维操作",
    "敏感表访问",
  ]);

  const INGEST_LABEL = {
    bypass: "旁路采集",
    agent: "Agent",
    api: "API",
    log: "日志拉取",
  };

  const DB_HANDLE_META = {
    pending: { label: "未处置", tagClass: "warning" },
    notified: { label: "已告警", tagClass: "success" },
    ticket: { label: "已派单", tagClass: "success" },
    frozen: { label: "已冻结", tagClass: "danger" },
    blocked: { label: "已阻断", tagClass: "danger" },
    ignored: { label: "已忽略", tagClass: "" },
  };

  const CHANNEL_LABEL = {
    database: "数据库",
    endpoint: "终端",
    fileshare: "文件共享",
    email: "邮件",
    cloud: "网盘",
    im: "即时通讯",
    print: "打印",
    usb: "USB",
    remote: "远程控制",
    transfer: "文件传输工具",
  };

  const SEVERITY_META = {
    low: { label: "低", tagClass: "success" },
    medium: { label: "中", tagClass: "warning" },
    high: { label: "高", tagClass: "danger" },
    critical: { label: "严重", tagClass: "danger" },
  };

  const POLICY_ACTION_META = {
    audit: { label: "审计", tagClass: "" },
    remind: { label: "提醒", tagClass: "warning" },
    ask: { label: "询问", tagClass: "warning" },
    block: { label: "阻止", tagClass: "danger" },
    evidence: { label: "上传证据", tagClass: "" },
    approve: { label: "审批放行", tagClass: "success" },
  };

  const FLOW_HANDLE_META = {
    open: { label: "未处置", tagClass: "warning" },
    reminded: { label: "已提醒", tagClass: "success" },
    approved: { label: "已放行", tagClass: "success" },
    blocked: { label: "已阻断", tagClass: "danger" },
    evented: { label: "已生成事件", tagClass: "danger" },
    closed: { label: "已关闭", tagClass: "" },
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

  function levelTag(level) {
    return LEVEL_META[level] ? { ...LEVEL_META[level] } : { label: level || "-", tagClass: "" };
  }

  function stageTag(stage) {
    return STAGE_META[stage] ? { ...STAGE_META[stage] } : { label: stage || "-", tagClass: "" };
  }

  function dbHandleTag(status) {
    return DB_HANDLE_META[status] ? { ...DB_HANDLE_META[status] } : { label: status || "-", tagClass: "" };
  }

  function severityTag(s) {
    return SEVERITY_META[s] ? { ...SEVERITY_META[s] } : { label: s || "-", tagClass: "" };
  }

  function policyActionTag(a) {
    return POLICY_ACTION_META[a] ? { ...POLICY_ACTION_META[a] } : { label: a || "-", tagClass: "" };
  }

  function flowHandleTag(status) {
    return FLOW_HANDLE_META[status] ? { ...FLOW_HANDLE_META[status] } : { label: status || "-", tagClass: "" };
  }

  let assets = [
    { id: "DA-01", name: "核心业务库.hr.employee", type: "structured", location: "MySQL-Prod-01 / hr / employee", owner: "王芳", dept: "人力资源部" },
    { id: "DA-02", name: "核心业务库.fin.payment", type: "structured", location: "Oracle-Fin-01 / fin / payment", owner: "李强", dept: "财务部" },
    { id: "DA-03", name: "客户主数据.crm.customer", type: "structured", location: "SQLServer-CRM / crm / customer", owner: "陈明", dept: "市场部" },
    { id: "DA-04", name: "医疗档案库.his.patient", type: "structured", location: "MySQL-HIS / his / patient", owner: "赵磊", dept: "信息中心" },
    { id: "DA-05", name: "合同扫描件归档", type: "unstructured", location: "\\\\nas\\legal\\contracts", owner: "周敏", dept: "法务部" },
    { id: "DA-06", name: "财务报表导出目录", type: "unstructured", location: "\\\\nas\\finance\\reports", owner: "吴静", dept: "财务部" },
    { id: "DA-07", name: "研发设计图纸", type: "unstructured", location: "\\\\nas\\rnd\\drawings", owner: "孙涛", dept: "研发中心" },
    { id: "DA-08", name: "终端本地通讯录备份", type: "endpoint", location: "PC-FIN-01 / Documents\\contacts.xlsx", owner: "王芳", dept: "财务部" },
    { id: "DA-09", name: "运维脚本与口令备忘", type: "endpoint", location: "PC-OPS-01 / Desktop\\ops-notes.txt", owner: "黄伟", dept: "运维部" },
    { id: "DA-10", name: "教育招生报名表", type: "structured", location: "PG-Edu / enroll / applicant", owner: "徐娜", dept: "行政部" },
  ];

  const methodKeys = Object.keys(METHOD_LABEL);
  const sceneKeys = Object.keys(SCENE_LABEL);
  const stages = ["identified", "tagged", "review", "accept", "published", "false_positive"];

  let labels = [
    { id: "LB-001", assetId: "DA-01", category: "个人信息", level: "L3", method: "regex", confidence: 92, stage: "published", conflict: false, sceneTemplate: "enterprise", protectPolicy: "脱敏展示 + 访问审批", evidence: "命中身份证号正则 18 位", scannedAt: "2026-10-28 10:00:00", reviewedAt: "2026-10-29 09:00:00", publishedAt: "2026-10-30 11:00:00" },
    { id: "LB-002", assetId: "DA-01", category: "联系方式", level: "L2", method: "keyword", confidence: 88, stage: "published", conflict: false, sceneTemplate: "enterprise", protectPolicy: "按部门授权", evidence: "关键字：手机号、电话", scannedAt: "2026-10-28 10:00:00", reviewedAt: "2026-10-29 09:10:00", publishedAt: "2026-10-30 11:00:00" },
    { id: "LB-003", assetId: "DA-02", category: "财务数据", level: "L4", method: "rule", confidence: 95, stage: "accept", conflict: false, sceneTemplate: "finance", protectPolicy: "禁止批量导出 + 审计全开", evidence: "规则：支付金额+银行卡号组合", scannedAt: "2026-10-30 14:20:00", reviewedAt: "2026-10-31 10:00:00", publishedAt: null },
    { id: "LB-004", assetId: "DA-02", category: "账户信息", level: "L3", method: "db_fp", confidence: 78, stage: "review", conflict: true, sceneTemplate: "finance", protectPolicy: "字段级权限控制", evidence: ["库指纹命中 bank_card", "人工建议降为 L2"], scannedAt: "2026-10-30 14:20:00", reviewedAt: null, publishedAt: null },
    { id: "LB-005", assetId: "DA-03", category: "客户隐私", level: "L3", method: "ai", confidence: 54, stage: "review", conflict: false, sceneTemplate: "enterprise", protectPolicy: "外发询问确认", evidence: "AI 模型低置信：疑似住址字段", scannedAt: "2026-10-31 09:30:00", reviewedAt: null, publishedAt: null },
    { id: "LB-006", assetId: "DA-04", category: "健康医疗", level: "L4", method: "dict", confidence: 91, stage: "tagged", conflict: false, sceneTemplate: "medical", protectPolicy: "专网访问 + 水印", evidence: "医疗字典：诊断、病历号", scannedAt: "2026-10-31 16:00:00", reviewedAt: null, publishedAt: null },
    { id: "LB-007", assetId: "DA-05", category: "合同文本", level: "L3", method: "doc_fp", confidence: 86, stage: "identified", conflict: false, sceneTemplate: "gov", protectPolicy: "下载审批", evidence: "文档指纹匹配合同模板", scannedAt: "2026-11-01 08:15:00", reviewedAt: null, publishedAt: null },
    { id: "LB-008", assetId: "DA-06", category: "财务报表", level: "L4", method: "sample", confidence: 48, stage: "identified", conflict: true, sceneTemplate: "finance", protectPolicy: "禁止外发邮箱", evidence: ["抽样命中利润表结构", "规则引擎未命中"], scannedAt: "2026-11-01 08:40:00", reviewedAt: null, publishedAt: null },
    { id: "LB-009", assetId: "DA-07", category: "工业设计", level: "L4", method: "img_fp", confidence: 83, stage: "accept", conflict: false, sceneTemplate: "industry", protectPolicy: "终端禁拷贝", evidence: "图像指纹匹配图纸水印", scannedAt: "2026-10-29 11:00:00", reviewedAt: "2026-10-30 15:00:00", publishedAt: null },
    { id: "LB-010", assetId: "DA-08", category: "通讯录", level: "L2", method: "metadata", confidence: 70, stage: "tagged", conflict: false, sceneTemplate: "enterprise", protectPolicy: "本地加密存储", evidence: "元数据：xlsx 含手机列名", scannedAt: "2026-10-27 13:00:00", reviewedAt: null, publishedAt: null },
    { id: "LB-011", assetId: "DA-09", category: "运维凭证", level: "L4", method: "semantic", confidence: 66, stage: "review", conflict: false, sceneTemplate: "enterprise", protectPolicy: "立即隔离终端文件", evidence: "语义模型：口令/密钥上下文", scannedAt: "2026-11-01 09:05:00", reviewedAt: null, publishedAt: null },
    { id: "LB-012", assetId: "DA-10", category: "学生信息", level: "L3", method: "manual", confidence: 100, stage: "published", conflict: false, sceneTemplate: "edu", protectPolicy: "最小化采集", evidence: "人工打标：报名表含身份证", scannedAt: "2026-10-20 10:00:00", reviewedAt: "2026-10-21 09:00:00", publishedAt: "2026-10-22 16:00:00" },
    { id: "LB-013", assetId: "DA-03", category: "公开目录", level: "L1", method: "metadata", confidence: 40, stage: "false_positive", conflict: false, sceneTemplate: "enterprise", protectPolicy: "-", evidence: "误报：公开产品说明书", scannedAt: "2026-10-25 12:00:00", reviewedAt: "2026-10-26 10:00:00", publishedAt: null },
    { id: "LB-014", assetId: "DA-05", category: "政务公文", level: "L2", method: "keyword", confidence: 75, stage: "identified", conflict: false, sceneTemplate: "gov", protectPolicy: "按密级控制", evidence: "关键字：红头文件", scannedAt: "2026-11-01 10:20:00", reviewedAt: null, publishedAt: null },
    { id: "LB-015", assetId: "DA-07", category: "源代码片段", level: "L3", method: "ai", confidence: 58, stage: "review", conflict: true, sceneTemplate: "industry", protectPolicy: "禁止上传网盘", evidence: ["AI 判定含密钥常量", "规则未命中"], scannedAt: "2026-11-01 11:00:00", reviewedAt: null, publishedAt: null },
    { id: "LB-016", assetId: "DA-04", category: "检验报告", level: "L3", method: "sample", confidence: 81, stage: "published", conflict: false, sceneTemplate: "medical", protectPolicy: "按就诊权限开放", evidence: "内容抽样：检验指标字段", scannedAt: "2026-10-18 09:00:00", reviewedAt: "2026-10-19 14:00:00", publishedAt: "2026-10-20 10:00:00" },
  ];

  // ensure methods coverage (already mostly covered); stages all present above

  const instances = ["MySQL-Prod-01", "Oracle-Fin-01", "SQLServer-CRM", "MySQL-HIS", "PG-Edu"];
  const accounts = ["app_rw", "dba_admin", "etl_job", "report_ro", "tmp_dev", "sec_audit"];
  const opTypes = ["SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "CALL", "LOGIN", "EXPORT"];
  const clients = ["10.20.1.11", "10.20.3.31", "10.20.5.51", "10.30.8.9", "172.16.2.44"];
  const tools = ["Navicat", "DBeaver", "sqlplus", "mysql-cli", "JDBC-App", "DataGrip"];
  const ingests = ["bypass", "agent", "api", "log"];
  const detectBases = ["规则库", "SQL模板分析", "行为基线", "敏感数据标签关联"];

  let dbAuditEvents = [];
  let seq = 1;
  function pushAudit(partial) {
    const id = "DBA-" + String(seq++).padStart(3, "0");
    const riskType = partial.riskType;
    const high = HIGH_RISKS.has(riskType);
    dbAuditEvents.push({
      id,
      time: partial.time,
      instance: partial.instance || instances[seq % instances.length],
      db: partial.db || "biz",
      table: partial.table || "t_data",
      account: partial.account || accounts[seq % accounts.length],
      opType: partial.opType || "SELECT",
      riskType,
      execStatus: partial.execStatus || "success",
      rows: partial.rows != null ? partial.rows : Math.floor(Math.random() * 5000),
      client: partial.client || clients[seq % clients.length],
      clientTool: partial.clientTool || tools[seq % tools.length],
      ingest: partial.ingest || ingests[seq % ingests.length],
      sql: partial.sql || `SELECT * FROM ${partial.table || "t_data"} WHERE 1=1;`,
      resultSummary: partial.resultSummary || "返回正常结果集",
      detectBasis: partial.detectBasis || detectBases[seq % detectBases.length],
      labelIds: partial.labelIds || [],
      handleStatus: partial.handleStatus != null ? partial.handleStatus : high && seq % 3 === 0 ? "pending" : seq % 5 === 0 ? "notified" : "pending",
      handleRemark: partial.handleRemark || "",
    });
  }

  // ensure every risk type at least twice; many on MOCK_TODAY
  RISK_TYPES.forEach((rt, i) => {
    const h = String(8 + (i % 10)).padStart(2, "0");
    const m = String((i * 3) % 60).padStart(2, "0");
    pushAudit({
      riskType: rt,
      time: `${MOCK_TODAY} ${h}:${m}:12`,
      table: rt === "敏感表访问" ? "employee" : rt === "拖库" ? "customer" : "t_" + (i + 1),
      db: i % 2 === 0 ? "hr" : "fin",
      opType: rt === "异常登录" || rt === "暴力破解" ? "LOGIN" : rt === "删改表" ? "DROP" : rt === "存储过程滥用" ? "CALL" : rt === "批量导出" ? "EXPORT" : "SELECT",
      rows: rt === "大流量返回" || rt === "拖库" || rt === "批量导出" ? 120000 + i * 1000 : 20 + i,
      sql:
        rt === "SQL注入"
          ? "SELECT * FROM users WHERE id='1' OR '1'='1';"
          : rt === "拖库"
            ? "SELECT * FROM customer;"
            : rt === "删改表"
              ? "DROP TABLE backup_2025;"
              : `/* ${rt} */ SELECT col FROM t_${i + 1} LIMIT 100;`,
      resultSummary: rt === "SQL注入" ? "疑似注入成功返回多行" : rt === "异常登录" ? "非工作时间登录成功" : "已记录",
      labelIds: rt === "敏感表访问" || rt === "拖库" || rt === "批量导出" ? ["LB-001", "LB-003"] : i % 4 === 0 ? ["LB-002"] : [],
      handleStatus: HIGH_RISKS.has(rt) && i % 2 === 0 ? "pending" : i % 3 === 0 ? "ticket" : "pending",
      ingest: ingests[i % 4],
      instance: instances[i % instances.length],
      account: accounts[i % accounts.length],
    });
  });

  // more events for volume (>=40)
  for (let i = 0; i < 30; i += 1) {
    const rt = RISK_TYPES[i % RISK_TYPES.length];
    const day = i < 18 ? MOCK_TODAY : "2026-10-31";
    pushAudit({
      riskType: rt,
      time: `${day} ${pad(9 + (i % 8))}:${pad((i * 7) % 60)}:${pad((i * 11) % 60)}`,
      table: ["employee", "payment", "customer", "patient", "applicant"][i % 5],
      db: ["hr", "fin", "crm", "his", "enroll"][i % 5],
      rows: (i * 137) % 8000,
      execStatus: i % 11 === 0 ? "fail" : "success",
      labelIds: i % 5 === 0 ? ["LB-001"] : i % 7 === 0 ? ["LB-006"] : [],
      handleStatus: HIGH_RISKS.has(rt) && i % 4 === 0 ? "pending" : i % 6 === 0 ? "blocked" : i % 5 === 0 ? "frozen" : i % 3 === 0 ? "ignored" : "pending",
      clientTool: tools[i % tools.length],
      detectBasis: detectBases[i % detectBases.length],
    });
  }

  const channels = Object.keys(CHANNEL_LABEL);
  const hostGroups = ["财务终端组", "运维终端组", "研发终端组", "行政终端组"];
  const roles = ["业务人员", "DBA", "外包开发", "部门主管", "安全管理员"];
  const flowScenes = [
    "批量下载客户清单",
    "跨部门拷贝合同扫描件",
    "外部邮箱发送财务报表",
    "非授权共享文件夹",
    "敏感文件上传网盘",
    "远程控制传输设计图纸",
    "异常数据库导出",
    "IM 发送通讯录片段",
    "USB 拷贝医疗档案",
    "打印机密图纸",
  ];

  let flowEvents = [];
  let fseq = 1;
  function pushFlow(partial) {
    const id = "FL-" + String(fseq++).padStart(3, "0");
    const channel = partial.channel;
    const level = partial.level || "L3";
    flowEvents.push({
      id,
      time: partial.time,
      subject: partial.subject || "张三",
      role: partial.role || roles[fseq % roles.length],
      hostGroup: partial.hostGroup || hostGroups[fseq % hostGroups.length],
      channel,
      source: partial.source || "核心业务库",
      target: partial.target || "外部目标",
      labelIds: partial.labelIds || [],
      level,
      severity: partial.severity || "medium",
      policyAction: partial.policyAction, // may be undefined
      handleStatus: partial.handleStatus || "open",
      path: partial.path || ["存储位置", "访问主体", CHANNEL_LABEL[channel] || channel, "外发目标"],
      linkedAuditId: partial.linkedAuditId || null,
      linkedEventId: partial.linkedEventId || null,
      remark: partial.remark || "",
      summary: partial.summary || flowScenes[fseq % flowScenes.length],
    });
  }

  channels.forEach((ch, i) => {
    pushFlow({
      channel: ch,
      time: `${MOCK_TODAY} ${pad(8 + i)}:${pad(i * 5)}:30`,
      summary: flowScenes[i % flowScenes.length],
      level: ["L2", "L3", "L4", "L3", "L4", "L2", "L3", "L4", "L4", "L3"][i],
      severity: ["low", "medium", "high", "critical", "high", "medium", "critical", "high", "critical", "medium"][i],
      labelIds: i % 2 === 0 ? ["LB-001"] : ["LB-003", "LB-007"],
      policyAction: i % 3 === 0 ? undefined : ["audit", "remind", "block", "approve", "ask", "evidence"][i % 6],
      handleStatus: i % 4 === 0 ? "open" : "open",
      path: ["存储:" + (assets[i % assets.length].location), "主体:用户", CHANNEL_LABEL[ch], "目标:" + ["外网邮箱", "个人网盘", "USB", "共享盘", "远程主机"][i % 5]],
      linkedAuditId: ch === "database" ? "DBA-001" : null,
      subject: ["王芳", "李强", "陈明", "赵磊", "周敏", "吴静", "孙涛", "黄伟", "徐娜", "郑凯"][i],
    });
  });

  for (let i = 0; i < 25; i += 1) {
    const ch = channels[i % channels.length];
    const day = i < 15 ? MOCK_TODAY : "2026-10-31";
    pushFlow({
      channel: ch,
      time: `${day} ${pad(10 + (i % 6))}:${pad((i * 9) % 60)}:00`,
      summary: flowScenes[i % flowScenes.length],
      level: ["L1", "L2", "L3", "L4"][i % 4],
      severity: ["low", "medium", "high", "critical"][i % 4],
      labelIds: i % 3 === 0 ? ["LB-012"] : i % 4 === 0 ? ["LB-009"] : ["LB-002"],
      policyAction: i % 2 === 0 ? undefined : undefined, // leave empty for resolve demo on many rows
      handleStatus: i % 7 === 0 ? "blocked" : i % 5 === 0 ? "approved" : i % 4 === 0 ? "reminded" : "open",
      target: ["user@external.com", "百度网盘", "\\\\share\\tmp", "TeamViewer会话", "打印机-3F", "U盘-KT88421"][i % 6],
      source: assets[i % assets.length].location,
      role: roles[i % roles.length],
      hostGroup: hostGroups[i % hostGroups.length],
      linkedAuditId: ch === "database" && i % 2 === 0 ? "DBA-004" : null,
    });
  }

  // ensure some approve+open for pendingApprove metric
  pushFlow({
    channel: "email",
    time: `${MOCK_TODAY} 15:20:00`,
    summary: "外部邮箱发送财务报表",
    level: "L4",
    severity: "critical",
    labelIds: ["LB-003"],
    policyAction: "approve",
    handleStatus: "open",
    subject: "吴静",
    role: "业务人员",
    hostGroup: "财务终端组",
    source: "\\\\nas\\finance\\reports",
    target: "private@mail.com",
    path: ["财务报表目录", "吴静", "邮件", "外部邮箱"],
  });

  let flowPolicies = [
    { id: "FP-01", level: "L4", channel: "email", action: "approve" },
    { id: "FP-02", level: "L4", channel: "cloud", action: "block" },
    { id: "FP-03", level: "L4", channel: "usb", action: "block" },
    { id: "FP-04", level: "L3", channel: "email", action: "ask" },
    { id: "FP-05", level: "L3", channel: "im", action: "remind" },
    { id: "FP-06", level: "L3", channel: "transfer", action: "evidence" },
    { id: "FP-07", level: "L2", channel: "fileshare", action: "audit" },
    { id: "FP-08", level: "L4", channel: "remote", action: "block" },
    { id: "FP-09", level: "L3", channel: "database", action: "remind" },
    { id: "FP-10", level: "L4", channel: "print", action: "approve" },
  ];

  function resolvePolicyAction(level, channel) {
    const hit = flowPolicies.find((p) => p.level === level && p.channel === channel);
    return hit ? hit.action : "audit";
  }

  function listAssets(filter) {
    const f = filter || {};
    let rows = assets.slice();
    if (f.type) rows = rows.filter((a) => a.type === f.type);
    if (f.keyword) {
      const kw = String(f.keyword).trim().toLowerCase();
      rows = rows.filter(
        (a) =>
          String(a.name).toLowerCase().includes(kw) ||
          String(a.location).toLowerCase().includes(kw) ||
          String(a.owner).toLowerCase().includes(kw)
      );
    }
    return rows.map(clone);
  }

  function getAsset(id) {
    const row = assets.find((a) => a.id === id);
    return row ? clone(row) : null;
  }

  function listLabels(filter) {
    const f = filter || {};
    let rows = labels.slice();
    if (f.stage) rows = rows.filter((l) => l.stage === f.stage);
    if (f.level) rows = rows.filter((l) => l.level === f.level);
    if (f.method) rows = rows.filter((l) => l.method === f.method);
    if (f.sceneTemplate) rows = rows.filter((l) => l.sceneTemplate === f.sceneTemplate);
    if (f.category) {
      const c = String(f.category).trim().toLowerCase();
      rows = rows.filter((l) => String(l.category).toLowerCase().includes(c));
    }
    if (f.type) {
      rows = rows.filter((l) => {
        const a = assets.find((x) => x.id === l.assetId);
        return a && a.type === f.type;
      });
    }
    if (f.conflict === true || f.conflict === "true") rows = rows.filter((l) => l.conflict);
    if (f.lowConfidence === true || f.lowConfidence === "true") {
      rows = rows.filter((l) => l.confidence < 60 && l.stage !== "false_positive");
    }
    if (f.keyword) {
      const kw = String(f.keyword).trim().toLowerCase();
      rows = rows.filter((l) => {
        const a = assets.find((x) => x.id === l.assetId);
        return (
          String(l.category).toLowerCase().includes(kw) ||
          String(l.id).toLowerCase().includes(kw) ||
          (a && String(a.name).toLowerCase().includes(kw))
        );
      });
    }
    if (f.labelId) rows = rows.filter((l) => l.id === f.labelId);
    return rows.map(clone);
  }

  function getLabel(id) {
    const row = labels.find((l) => l.id === id);
    return row ? clone(row) : null;
  }

  function startScan(payload) {
    const p = payload || {};
    const ids = Array.isArray(p.assetIds) ? p.assetIds : [];
    const scene = p.sceneTemplate || "enterprise";
    const now = formatNow();
    const created = [];
    ids.forEach((assetId, idx) => {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset) return;
      const id = "LB-" + String(200 + labels.length + idx).padStart(3, "0");
      const row = {
        id,
        assetId,
        category: "待确认分类",
        level: "L2",
        method: methodKeys[idx % methodKeys.length],
        confidence: 60 + (idx % 30),
        stage: "identified",
        conflict: false,
        sceneTemplate: scene,
        protectPolicy: "待评估保护策略",
        evidence: "扫描任务生成：" + (SCENE_LABEL[scene] || scene) + "模板",
        scannedAt: now,
        reviewedAt: null,
        publishedAt: null,
      };
      labels.unshift(row);
      created.push(clone(row));
    });
    return created;
  }

  function reviewLabel(id, payload) {
    const row = labels.find((l) => l.id === id);
    if (!row) return null;
    const p = payload || {};
    const now = formatNow();
    if (p.action === "false_positive") {
      row.stage = "false_positive";
      row.conflict = false;
    } else if (p.action === "retarget") {
      if (p.category) row.category = p.category;
      if (p.level) row.level = p.level;
      row.conflict = false;
      if (row.stage === "identified") row.stage = "tagged";
      else if (row.stage === "tagged") row.stage = "review";
    } else if (p.action === "confirm") {
      row.conflict = false;
      if (row.stage === "identified" || row.stage === "tagged") row.stage = "review";
      else if (row.stage === "review") row.stage = "accept";
    }
    row.reviewedAt = now;
    row.reviewRemark = p.remark || "";
    return clone(row);
  }

  function advanceLabelStage(id) {
    const row = labels.find((l) => l.id === id);
    if (!row) return null;
    if (row.stage === "false_positive" || row.stage === "published") return clone(row);
    const order = ["identified", "tagged", "review", "accept", "published"];
    const idx = order.indexOf(row.stage);
    if (idx >= 0 && idx < order.length - 1) {
      row.stage = order[idx + 1];
      if (row.stage === "published") row.publishedAt = formatNow();
      if (row.stage === "tagged" || row.stage === "review") row.reviewedAt = row.reviewedAt || formatNow();
    }
    return clone(row);
  }

  function listDbAuditEvents(filter) {
    const f = filter || {};
    let rows = dbAuditEvents.slice();
    if (f.riskType) rows = rows.filter((e) => e.riskType === f.riskType);
    if (f.instance) rows = rows.filter((e) => e.instance === f.instance);
    if (f.account) {
      const a = String(f.account).trim().toLowerCase();
      rows = rows.filter((e) => String(e.account).toLowerCase().includes(a));
    }
    if (f.execStatus) rows = rows.filter((e) => e.execStatus === f.execStatus);
    if (f.handleStatus) rows = rows.filter((e) => e.handleStatus === f.handleStatus);
    if (f.labelId) rows = rows.filter((e) => (e.labelIds || []).includes(f.labelId));
    if (f.keyword) {
      const kw = String(f.keyword).trim().toLowerCase();
      rows = rows.filter(
        (e) =>
          String(e.sql || "").toLowerCase().includes(kw) ||
          String(e.client || "").toLowerCase().includes(kw) ||
          String(e.clientTool || "").toLowerCase().includes(kw) ||
          String(e.table || "").toLowerCase().includes(kw) ||
          String(e.account || "").toLowerCase().includes(kw)
      );
    }
    if (f.dateFrom) rows = rows.filter((e) => String(e.time).slice(0, 10) >= f.dateFrom);
    if (f.dateTo) rows = rows.filter((e) => String(e.time).slice(0, 10) <= f.dateTo);
    rows.sort((a, b) => String(b.time).localeCompare(String(a.time)));
    return rows.map(clone);
  }

  function getDbAuditEvent(id) {
    const row = dbAuditEvents.find((e) => e.id === id);
    return row ? clone(row) : null;
  }

  function handleDbAuditEvent(id, payload) {
    const row = dbAuditEvents.find((e) => e.id === id);
    if (!row) return null;
    const p = payload || {};
    const action = p.action;
    if (["notified", "ticket", "frozen", "blocked", "ignored"].includes(action)) {
      row.handleStatus = action;
    }
    row.handleRemark = p.remark || "";
    row.handledAt = formatNow();
    return clone(row);
  }

  function listFlowEvents(filter) {
    const f = filter || {};
    let rows = flowEvents.slice();
    if (f.channel) rows = rows.filter((e) => e.channel === f.channel);
    if (f.level) rows = rows.filter((e) => e.level === f.level);
    if (f.severity) rows = rows.filter((e) => e.severity === f.severity);
    if (f.handleStatus) rows = rows.filter((e) => e.handleStatus === f.handleStatus);
    if (f.role) {
      const r = String(f.role).trim().toLowerCase();
      rows = rows.filter((e) => String(e.role).toLowerCase().includes(r));
    }
    if (f.hostGroup) rows = rows.filter((e) => e.hostGroup === f.hostGroup);
    if (f.labelId) rows = rows.filter((e) => (e.labelIds || []).includes(f.labelId));
    if (f.keyword) {
      const kw = String(f.keyword).trim().toLowerCase();
      rows = rows.filter(
        (e) =>
          String(e.summary || "").toLowerCase().includes(kw) ||
          String(e.subject || "").toLowerCase().includes(kw) ||
          String(e.source || "").toLowerCase().includes(kw) ||
          String(e.target || "").toLowerCase().includes(kw)
      );
    }
    if (f.dateFrom) rows = rows.filter((e) => String(e.time).slice(0, 10) >= f.dateFrom);
    if (f.dateTo) rows = rows.filter((e) => String(e.time).slice(0, 10) <= f.dateTo);
    rows.sort((a, b) => String(b.time).localeCompare(String(a.time)));
    return rows.map(clone);
  }

  function getFlowEvent(id) {
    const row = flowEvents.find((e) => e.id === id);
    return row ? clone(row) : null;
  }

  function handleFlowEvent(id, payload) {
    const row = flowEvents.find((e) => e.id === id);
    if (!row) return null;
    const p = payload || {};
    const action = p.action;
    if (["reminded", "approved", "blocked", "evented", "closed"].includes(action)) {
      row.handleStatus = action;
    }
    if (action === "evented") {
      row.linkedEventId = "EVT-" + Date.now();
    }
    row.remark = p.remark || row.remark || "";
    row.handledAt = formatNow();
    return clone(row);
  }

  function listFlowPolicies() {
    return flowPolicies.map(clone);
  }

  function saveFlowPolicy(payload) {
    const p = payload || {};
    if (!p.level || !p.channel || !p.action) return null;
    let row = flowPolicies.find((x) => x.id === p.id) || flowPolicies.find((x) => x.level === p.level && x.channel === p.channel);
    if (row) {
      row.level = p.level;
      row.channel = p.channel;
      row.action = p.action;
    } else {
      row = {
        id: "FP-" + String(flowPolicies.length + 1).padStart(2, "0"),
        level: p.level,
        channel: p.channel,
        action: p.action,
      };
      flowPolicies.push(row);
    }
    return clone(row);
  }

  function dbAuditMetrics() {
    const todayRows = dbAuditEvents.filter((e) => String(e.time).startsWith(MOCK_TODAY));
    return {
      today: todayRows.length,
      highPending: dbAuditEvents.filter((e) => e.handleStatus === "pending" && HIGH_RISKS.has(e.riskType)).length,
      sensitiveTable: dbAuditEvents.filter((e) => e.riskType === "敏感表访问").length,
      abnormalLogin: dbAuditEvents.filter((e) => e.riskType === "异常登录").length,
    };
  }

  function classifyMetrics() {
    const covered = new Set(labels.map((l) => l.assetId));
    return {
      assetCovered: covered.size,
      pendingReview: labels.filter((l) => l.stage === "review" || l.stage === "accept" || l.conflict).length,
      published: labels.filter((l) => l.stage === "published").length,
      lowConfidence: labels.filter((l) => l.confidence < 60 && l.stage !== "false_positive").length,
    };
  }

  function flowMetrics() {
    const todayRows = flowEvents.filter((e) => String(e.time).startsWith(MOCK_TODAY));
    return {
      today: todayRows.length,
      highOutbound: todayRows.filter((e) => e.severity === "high" || e.severity === "critical").length,
      pendingApprove: flowEvents.filter((e) => {
        const action = e.policyAction || resolvePolicyAction(e.level, e.channel);
        return action === "approve" && e.handleStatus === "open";
      }).length,
      blocked: flowEvents.filter((e) => e.handleStatus === "blocked").length,
    };
  }

  window.DataSecurity = {
    MOCK_TODAY,
    ASSET_TYPE_LABEL,
    LEVEL_META,
    STAGE_META,
    METHOD_LABEL,
    SCENE_LABEL,
    RISK_TYPES,
    HIGH_RISKS,
    INGEST_LABEL,
    DB_HANDLE_META,
    CHANNEL_LABEL,
    SEVERITY_META,
    POLICY_ACTION_META,
    FLOW_HANDLE_META,
    levelTag,
    stageTag,
    dbHandleTag,
    severityTag,
    policyActionTag,
    flowHandleTag,
    resolvePolicyAction,
    listAssets,
    getAsset,
    listLabels,
    getLabel,
    startScan,
    reviewLabel,
    advanceLabelStage,
    listDbAuditEvents,
    getDbAuditEvent,
    handleDbAuditEvent,
    listFlowEvents,
    getFlowEvent,
    handleFlowEvent,
    listFlowPolicies,
    saveFlowPolicy,
    dbAuditMetrics,
    classifyMetrics,
    flowMetrics,
  };
})();
