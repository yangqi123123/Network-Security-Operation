(function () {
  const MOCK_TODAY = "2026-11-01";

  const SOURCE_TYPES = ["网络设备", "安全设备", "终端", "服务器", "数据库", "应用系统", "云平台", "业务日志"];
  const EVENT_LEVELS = ["严重", "高", "中", "低"];
  const EVENT_STATUSES = ["待研判", "研判中", "已分派", "处置中", "已关闭"];
  const DEVICE_TYPES = ["IDS", "IPS", "WAF", "下一代防火墙", "流量探针", "蜜罐", "NDR"];
  const ATTACK_TYPES = ["扫描探测", "漏洞利用", "Web攻击", "暴力破解", "横向移动", "数据外联", "隐蔽隧道"];
  const RISK_TYPES = ["病毒", "木马", "勒索", "挖矿", "脚本攻击", "后门", "无"];
  const ENTITY_TYPES = ["用户", "资产", "账号", "进程", "网络连接", "数据库访问"];
  const SYSTEMS = ["防火墙", "WAF", "EDR", "IDS/IPS", "堡垒机", "数据库审计", "工单", "短信邮件", "企微/钉钉"];
  const OBJECT_TYPES = ["IP", "域名", "URL", "文件哈希", "邮箱", "证书", "漏洞编号", "攻击组织", "恶意家族", "技战术"];

  const LEVEL_META = {
    严重: { label: "严重", tagClass: "danger" },
    高: { label: "高", tagClass: "warning" },
    中: { label: "中", tagClass: "" },
    低: { label: "低", tagClass: "success" },
  };

  const EVENT_STATUS_META = {
    待研判: { label: "待研判", tagClass: "warning" },
    研判中: { label: "研判中", tagClass: "" },
    已分派: { label: "已分派", tagClass: "" },
    处置中: { label: "处置中", tagClass: "warning" },
    已关闭: { label: "已关闭", tagClass: "success" },
  };

  const HEALTH_META = {
    正常: { label: "正常", tagClass: "success" },
    异常: { label: "异常", tagClass: "danger" },
    告警: { label: "告警", tagClass: "warning" },
  };

  const PROTECT_META = {
    正常: { label: "正常", tagClass: "success" },
    隔离中: { label: "隔离中", tagClass: "warning" },
    风险: { label: "风险", tagClass: "danger" },
    引擎异常: { label: "引擎异常", tagClass: "danger" },
  };

  const ANOMALY_STATUS_META = {
    待复核: { label: "待复核", tagClass: "warning" },
    已确认: { label: "已确认", tagClass: "danger" },
    误报: { label: "误报", tagClass: "" },
    已升级: { label: "已升级", tagClass: "" },
  };

  const TASK_STATUS_META = {
    待执行: { label: "待执行", tagClass: "warning" },
    执行中: { label: "执行中", tagClass: "" },
    待复核: { label: "待复核", tagClass: "warning" },
    已关闭: { label: "已关闭", tagClass: "success" },
    失败: { label: "失败", tagClass: "danger" },
  };

  const CONF_META = {
    高: { label: "高", tagClass: "success" },
    中: { label: "中", tagClass: "warning" },
    低: { label: "低", tagClass: "" },
  };

  const DISPOSE_META = {
    待处置: { label: "待处置", tagClass: "warning" },
    已封禁: { label: "已封禁", tagClass: "danger" },
    已加白: { label: "已加白", tagClass: "success" },
    误报: { label: "误报", tagClass: "" },
    已生成规则: { label: "已生成规则", tagClass: "" },
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

  function statusTag(status) {
    return EVENT_STATUS_META[status]
      ? { ...EVENT_STATUS_META[status] }
      : { label: status || "-", tagClass: "" };
  }

  function healthTag(v) {
    return HEALTH_META[v] ? { ...HEALTH_META[v] } : { label: v || "-", tagClass: "" };
  }

  function protectTag(v) {
    return PROTECT_META[v] ? { ...PROTECT_META[v] } : { label: v || "-", tagClass: "" };
  }

  function anomalyStatusTag(v) {
    return ANOMALY_STATUS_META[v] ? { ...ANOMALY_STATUS_META[v] } : { label: v || "-", tagClass: "" };
  }

  function taskStatusTag(v) {
    return TASK_STATUS_META[v] ? { ...TASK_STATUS_META[v] } : { label: v || "-", tagClass: "" };
  }

  function confidenceTag(v) {
    return CONF_META[v] ? { ...CONF_META[v] } : { label: v || "-", tagClass: "" };
  }

  function disposeTag(v) {
    return DISPOSE_META[v] ? { ...DISPOSE_META[v] } : { label: v || "-", tagClass: "" };
  }

  function matchKeyword(text, keyword) {
    if (!keyword) return true;
    return String(text || "").toLowerCase().includes(String(keyword).toLowerCase());
  }

  function inDateRange(time, dateFrom, dateTo) {
    if (!time) return true;
    const day = String(time).slice(0, 10);
    if (dateFrom && day < dateFrom) return false;
    if (dateTo && day > dateTo) return false;
    return true;
  }

  const assets = [
    "核心交换机-01", "边界防火墙", "OA Web", "财务库", "邮件网关",
    "域控 DC01", "堡垒机", "对象存储 OSS", "VPN 网关", "业务 API 网关",
  ];

  const eventTitles = [
    "多源日志归并：异常登录簇", "WAF 命中 SQL 注入特征", "终端外联可疑域名",
    "数据库高危语句审计告警", "云主机安全组变更异常", "暴力破解失败超阈值",
    "横向扫描探测告警归并", "勒索样本落地后隔离", "蜜罐交互疑似内网探测",
    "应用系统未授权接口访问", "证书异常吊销列表命中", "管理员账号异地登录",
  ];

  let events = Array.from({ length: 32 }, (_, i) => {
    const id = `EVT-${1001 + i}`;
    const level = EVENT_LEVELS[i % EVENT_LEVELS.length];
    const status = EVENT_STATUSES[i % EVENT_STATUSES.length];
    const sourceType = SOURCE_TYPES[i % SOURCE_TYPES.length];
    const hour = pad(8 + (i % 10));
    const min = pad((i * 3) % 60);
    const day = i % 3 === 0 ? "2026-10-31" : MOCK_TODAY;
    const time = `${day} ${hour}:${min}:0${i % 10}`;
    return {
      id,
      time,
      title: eventTitles[i % eventTitles.length] + (i > 11 ? ` #${i + 1}` : ""),
      sourceType,
      asset: assets[i % assets.length],
      level,
      mergeCount: 1 + (i % 18),
      status,
      logs: [
        { time, raw: `[${sourceType}] ${eventTitles[i % eventTitles.length]} src=10.30.${i % 40}.${10 + i}` },
        { time: `${day} ${hour}:${pad((i * 3 + 1) % 60)}:12`, raw: `关联资产=${assets[i % assets.length]} rule=R-${200 + i}` },
      ],
      timeline: [
        { time, actor: "系统", action: "归并入库", note: `合并重复告警 ${1 + (i % 18)} 条` },
        ...(status !== "待研判"
          ? [{ time: `${day} ${hour}:${pad((i * 3 + 5) % 60)}:00`, actor: "分析员A", action: "开始研判", note: "-" }]
          : []),
      ],
    };
  });

  let devices = DEVICE_TYPES.map((type, i) => ({
    id: `DEV-${i + 1}`,
    name: `${type}-${pad(i + 1)}`,
    type,
    ip: `10.40.${i + 1}.10`,
    policyHits: 120 + i * 37,
    blockStatus: i % 3 === 0 ? "阻断中" : "正常",
    health: i === 5 ? "异常" : i === 2 ? "告警" : "正常",
    lastHeartbeat: `${MOCK_TODAY} ${pad(9 + i)}:${pad(10 + i)}:00`,
  })).concat([
    {
      id: "DEV-8",
      name: "WAF-备用",
      type: "WAF",
      ip: "10.40.8.10",
      policyHits: 88,
      blockStatus: "正常",
      health: "正常",
      lastHeartbeat: `${MOCK_TODAY} 10:05:00`,
    },
  ]);

  let attacks = Array.from({ length: 28 }, (_, i) => {
    const attackType = ATTACK_TYPES[i % ATTACK_TYPES.length];
    const device = devices[i % devices.length];
    const day = i % 4 === 0 ? "2026-10-31" : MOCK_TODAY;
    return {
      id: `ATK-${2001 + i}`,
      time: `${day} ${pad(7 + (i % 12))}:${pad((i * 7) % 60)}:${pad(i % 60)}`,
      attackType,
      src: `203.0.${i % 50}.${20 + (i % 30)}`,
      dst: `10.50.${i % 20}.${30 + (i % 40)}`,
      deviceId: device.id,
      action: i % 5 === 0 ? "观察" : i % 3 === 0 ? "已阻断" : "告警",
      status: i % 5 === 0 ? "待联动" : i % 3 === 0 ? "已处置" : "未处置",
      timeline: [],
    };
  });

  let hosts = Array.from({ length: 14 }, (_, i) => {
    const riskType = RISK_TYPES[i % RISK_TYPES.length];
    let protectStatus = "正常";
    if (riskType !== "无" && i % 4 === 0) protectStatus = "隔离中";
    else if (riskType !== "无" && i % 3 === 0) protectStatus = "风险";
    else if (i === 11) protectStatus = "引擎异常";
    return {
      id: `MH-${pad(i + 1)}`,
      name: i % 2 === 0 ? `PC-SEC-${pad(i + 1)}` : `SRV-APP-${pad(i + 1)}`,
      ip: `10.60.${1 + (i % 10)}.${20 + i}`,
      hostType: i % 2 === 0 ? "终端" : "服务器",
      riskType,
      engineStatus: protectStatus === "引擎异常" ? "异常" : "正常",
      policyVersion: `AV-${3 + (i % 4)}.${i % 9}`,
      protectStatus,
      lastScan: `${MOCK_TODAY} ${pad(6 + (i % 8))}:15:00`,
    };
  });

  let malwareLogs = Array.from({ length: 24 }, (_, i) => {
    const host = hosts[i % hosts.length];
    return {
      id: `ML-${3001 + i}`,
      hostId: host.id,
      time: `${MOCK_TODAY} ${pad(8 + (i % 10))}:${pad((i * 5) % 60)}:00`,
      action: ["检测", "查杀", "隔离", "恢复", "免疫"][i % 5],
      result: i % 7 === 0 ? "失败" : "成功",
      malwareName: ["Trojan.Generic", "Ransom.LockBit", "Miner.XMRig", "Backdoor.Agent", "Script.PS1"][i % 5],
    };
  });

  let entities = Array.from({ length: 12 }, (_, i) => {
    const type = ENTITY_TYPES[i % ENTITY_TYPES.length];
    const sensitivity = i % 3 === 0 ? "高" : "普通";
    const name =
      type === "用户" ? `用户-U${pad(i + 1)}` :
      type === "账号" ? (sensitivity === "高" ? `admin_ops_${i}` : `svc_app_${i}`) :
      type === "资产" ? `资产-${assets[i % assets.length]}` :
      type === "进程" ? `proc-powershell-${i}` :
      type === "网络连接" ? `conn-10.70.1.${i}` :
      `db-acct-finance-${i}`;
    return {
      id: `ENT-${i + 1}`,
      name,
      type,
      sensitivity,
      attrs: {
        dept: ["信息中心", "财务部", "运维部", "研发中心"][i % 4],
        owner: ["张伟", "李娜", "王强", "赵敏"][i % 4],
        riskScore: 40 + i * 3,
      },
      recentBehaviors: [
        `${MOCK_TODAY} 登录堡垒机`,
        `${MOCK_TODAY} 访问核心库`,
        `2026-10-31 下载配置包`,
      ],
      relatedAnomalyIds: [],
    };
  });

  let anomalies = Array.from({ length: 26 }, (_, i) => {
    const entity = entities[i % entities.length];
    const day = i % 5 === 0 ? "2026-10-31" : MOCK_TODAY;
    const status = ["待复核", "已确认", "误报", "已升级", "待复核"][i % 5];
    const id = `AN-${4001 + i}`;
    if (!entity.relatedAnomalyIds.includes(id)) entity.relatedAnomalyIds.push(id);
    return {
      id,
      time: `${day} ${pad(9 + (i % 10))}:${pad((i * 4) % 60)}:00`,
      entityId: entity.id,
      entityLabel: entity.name,
      entityType: entity.type,
      summary: ["非常规时间登录", "批量敏感表查询", "异常外联流量", "进程父子链偏离", "跨域权限提升"][i % 5],
      score: 55 + (i % 40),
      sensitivity: entity.sensitivity,
      status,
      eventRef: status === "已升级" ? `EVT-UP-${i}` : "",
      context: {
        who: entity.name,
        when: `${day} ${pad(9 + (i % 10))}:00`,
        where: `10.80.${i % 20}.${10 + i}`,
        what: ["财务库", "域控", "对象存储", "VPN", "工单系统"][i % 5],
        action: ["查询", "登录", "上传", "执行脚本", "修改ACL"][i % 5],
        result: i % 2 === 0 ? "成功" : "被拒绝",
        baseline: "相对30日基线偏离 +2.4σ",
      },
    };
  });

  let playbooks = [
    {
      id: "PB-1",
      name: "暴力破解自动封禁",
      trigger: "同一源IP 5分钟失败≥20次",
      stepCount: 5,
      systems: ["防火墙", "短信邮件", "企微/钉钉"],
      enabled: true,
      updatedAt: "2026-10-28 11:00:00",
      steps: ["匹配规则", "提取源IP", "防火墙封禁", "通知值班", "写回事件"],
    },
    {
      id: "PB-2",
      name: "勒索落地隔离终端",
      trigger: "终端检出勒索家族",
      stepCount: 6,
      systems: ["EDR", "工单", "短信邮件"],
      enabled: true,
      updatedAt: "2026-10-29 09:20:00",
      steps: ["确认样本", "EDR隔离", "阻断外联", "创建工单", "取证快照", "复核关闭"],
    },
    {
      id: "PB-3",
      name: "Web注入联动WAF",
      trigger: "WAF 高危注入连续命中",
      stepCount: 4,
      systems: ["WAF", "IDS/IPS", "工单"],
      enabled: true,
      updatedAt: "2026-10-30 15:10:00",
      steps: ["聚合告警", "加严WAF规则", "通知应用负责人", "复核"],
    },
    {
      id: "PB-4",
      name: "失陷账号重置联动",
      trigger: "UEBA 标记账号失陷",
      stepCount: 5,
      systems: ["堡垒机", "EDR", "短信邮件", "企微/钉钉"],
      enabled: false,
      updatedAt: "2026-10-25 16:40:00",
      steps: ["锁定账号", "踢出会话", "通知本人与管理员", "强制改密", "复核"],
    },
    {
      id: "PB-5",
      name: "数据外联应急阻断",
      trigger: "大流量外联+敏感标签",
      stepCount: 5,
      systems: ["防火墙", "数据库审计", "工单", "短信邮件"],
      enabled: true,
      updatedAt: "2026-10-31 10:05:00",
      steps: ["确认会话", "防火墙阻断", "审计取证", "派单", "关闭"],
    },
    {
      id: "PB-6",
      name: "情报命中自动提级",
      trigger: "高可信情报命中日志",
      stepCount: 4,
      systems: ["防火墙", "WAF", "工单", "企微/钉钉"],
      enabled: true,
      updatedAt: `${MOCK_TODAY} 08:30:00`,
      steps: ["命中匹配", "提升事件等级", "可选封禁", "通知"],
    },
  ];

  const taskStatuses = ["待执行", "执行中", "待复核", "已关闭", "失败"];
  let tasks = Array.from({ length: 16 }, (_, i) => {
    const pb = playbooks[i % playbooks.length];
    const status = taskStatuses[i % taskStatuses.length];
    const startedAt = `${i % 3 === 0 ? "2026-10-31" : MOCK_TODAY} ${pad(8 + (i % 9))}:20:00`;
    return {
      id: `TK-${5001 + i}`,
      code: `SOAR-${20261100 + i}`,
      eventTitle: eventTitles[i % eventTitles.length],
      playbookId: pb.id,
      status,
      executor: i % 2 === 0 ? "自动化引擎" : "值班员B",
      startedAt,
      duration: status === "待执行" ? "-" : `${5 + (i % 40)}m`,
      timeline: [
        { time: startedAt, actor: "系统", action: "创建任务", note: `剧本 ${pb.name}` },
        ...(status !== "待执行"
          ? [{ time: startedAt, actor: "系统", action: "开始执行", note: pb.steps[0] || "-" }]
          : []),
      ],
    };
  });

  const intelSeeds = [
    { value: "185.220.101.45", objectType: "IP", source: "外部威胁情报" },
    { value: "evil-cdn.example.com", objectType: "域名", source: "行业情报" },
    { value: "https://phish.example/login", objectType: "URL", source: "监管通报" },
    { value: "d41d8cd98f00b204e9800998ecf8427e", objectType: "文件哈希", source: "内部事件沉淀" },
    { value: "attacker@darkmail.example", objectType: "邮箱", source: "外部威胁情报" },
    { value: "CN=Fake CA Intermediate", objectType: "证书", source: "本地黑白名单" },
    { value: "CVE-2024-3400", objectType: "漏洞编号", source: "监管通报" },
    { value: "APT-Sandstorm", objectType: "攻击组织", source: "攻击组织画像" },
    { value: "LockBit 3.0", objectType: "恶意家族", source: "外部威胁情报" },
    { value: "T1059.001 PowerShell", objectType: "技战术", source: "内部事件沉淀" },
  ];

  let intel = Array.from({ length: 22 }, (_, i) => {
    const base = intelSeeds[i % intelSeeds.length];
    const confidence = ["高", "中", "低"][i % 3];
    const disposeStatus = ["待处置", "已封禁", "已加白", "误报", "已生成规则"][i % 5];
    return {
      id: `TI-${6001 + i}`,
      value: i < 10 ? base.value : `${base.value}-${i}`,
      objectType: base.objectType,
      source: base.source,
      confidence,
      expireAt: `2026-1${i % 2}-${pad(10 + (i % 18))}`,
      hitCount: i * 3 + (i % 5),
      assets: assets[i % assets.length],
      disposeStatus,
      advice: confidence === "高" ? "建议立即封禁并提级事件" : "建议人工复核后处置",
    };
  });

  let seq = {
    event: 1100,
    attack: 2100,
    host: 100,
    malwareLog: 3100,
    anomaly: 4100,
    entity: 100,
    playbook: 100,
    task: 5100,
    intel: 6100,
  };

  function metricsSiem() {
    const todayEvents = events.filter((e) => String(e.time).startsWith(MOCK_TODAY));
    return {
      today: todayEvents.length,
      open: events.filter((e) => e.status !== "已关闭").length,
      highPending: events.filter((e) => (e.level === "严重" || e.level === "高") && e.status === "待研判").length,
      mergeRate: "62%",
    };
  }

  function listEvents(filter = {}) {
    return clone(
      events.filter((e) => {
        if (filter.level && e.level !== filter.level) return false;
        if (filter.status && e.status !== filter.status) return false;
        if (filter.sourceType && e.sourceType !== filter.sourceType) return false;
        if (!matchKeyword(`${e.title} ${e.asset} ${e.id}`, filter.keyword)) return false;
        if (!inDateRange(e.time, filter.dateFrom, filter.dateTo)) return false;
        return true;
      })
    );
  }

  function getEvent(id) {
    const item = events.find((e) => String(e.id) === String(id));
    return item ? clone(item) : null;
  }

  function updateEvent(id, patch = {}) {
    const item = events.find((e) => String(e.id) === String(id));
    if (!item) return null;
    Object.assign(item, patch);
    if (patch._timelineEntry) {
      item.timeline = item.timeline || [];
      item.timeline.push(patch._timelineEntry);
      delete item._timelineEntry;
    }
    return clone(item);
  }

  function metricsIds() {
    return {
      online: devices.filter((d) => d.health !== "异常").length,
      todayAlarms: attacks.filter((a) => String(a.time).startsWith(MOCK_TODAY)).length,
      blocked: attacks.filter((a) => a.action === "已阻断" || String(a.action).includes("阻断")).length,
      pendingLink: attacks.filter((a) => a.status === "待联动" || a.status === "未处置").length,
    };
  }

  function listDevices(filter = {}) {
    return clone(
      devices.filter((d) => {
        if (filter.type && d.type !== filter.type) return false;
        if (filter.health && d.health !== filter.health) return false;
        if (!matchKeyword(`${d.name} ${d.ip}`, filter.keyword)) return false;
        return true;
      })
    );
  }

  function listAttacks(filter = {}) {
    return clone(
      attacks.filter((a) => {
        if (filter.attackType && a.attackType !== filter.attackType) return false;
        if (filter.status && a.status !== filter.status) return false;
        if (!matchKeyword(`${a.src} ${a.dst} ${a.attackType} ${a.id}`, filter.keyword)) return false;
        if (!inDateRange(a.time, filter.dateFrom, filter.dateTo)) return false;
        return true;
      })
    );
  }

  function getAttack(id) {
    const item = attacks.find((a) => String(a.id) === String(id));
    if (!item) return null;
    const out = clone(item);
    const device = devices.find((d) => d.id === item.deviceId);
    out.deviceName = device ? device.name : "-";
    out.deviceType = device ? device.type : "-";
    return out;
  }

  function getDevice(id) {
    const item = devices.find((d) => String(d.id) === String(id));
    return item ? clone(item) : null;
  }

  function linkAction(attackId, { actions, remark } = {}) {
    const item = attacks.find((a) => String(a.id) === String(attackId));
    if (!item) return null;
    const list = Array.isArray(actions) ? actions : actions ? [actions] : [];
    item.action = list.length ? list.join("、") : item.action;
    item.status = "已处置";
    item.timeline = item.timeline || [];
    item.timeline.push({
      time: formatNow(),
      actor: "值班员",
      action: "联动处置",
      note: `${list.join("、") || "-"}${remark ? "；" + remark : ""}`,
    });
    return getAttack(attackId);
  }

  function metricsMalware() {
    return {
      hosts: hosts.length,
      riskHosts: hosts.filter((h) => h.riskType !== "无" || h.protectStatus === "风险").length,
      isolated: hosts.filter((h) => h.protectStatus === "隔离中").length,
      engineError: hosts.filter((h) => h.protectStatus === "引擎异常" || h.engineStatus === "异常").length,
    };
  }

  function listMalwareHosts(filter = {}) {
    return clone(
      hosts.filter((h) => {
        if (filter.hostType && h.hostType !== filter.hostType) return false;
        if (filter.riskType && h.riskType !== filter.riskType) return false;
        if (filter.protectStatus && h.protectStatus !== filter.protectStatus) return false;
        if (!matchKeyword(`${h.name} ${h.ip}`, filter.keyword)) return false;
        return true;
      })
    );
  }

  function getMalwareHost(id) {
    const item = hosts.find((h) => String(h.id) === String(id));
    return item ? clone(item) : null;
  }

  function isolateHost(id) {
    const item = hosts.find((h) => String(h.id) === String(id));
    if (!item) return null;
    item.protectStatus = "隔离中";
    malwareLogs.unshift({
      id: `ML-${++seq.malwareLog}`,
      hostId: item.id,
      time: formatNow(),
      action: "隔离",
      result: "成功",
      malwareName: item.riskType === "无" ? "-" : item.riskType,
    });
    return clone(item);
  }

  function restoreHost(id) {
    const item = hosts.find((h) => String(h.id) === String(id));
    if (!item) return null;
    item.protectStatus = item.riskType === "无" ? "正常" : "风险";
    malwareLogs.unshift({
      id: `ML-${++seq.malwareLog}`,
      hostId: item.id,
      time: formatNow(),
      action: "恢复",
      result: "成功",
      malwareName: "-",
    });
    return clone(item);
  }

  function updateHostPolicy(id, { policyVersion } = {}) {
    const item = hosts.find((h) => String(h.id) === String(id));
    if (!item) return null;
    if (policyVersion) item.policyVersion = policyVersion;
    return clone(item);
  }

  function listMalwareLogs(hostId, limit = 10) {
    return clone(
      malwareLogs.filter((l) => String(l.hostId) === String(hostId)).slice(0, limit)
    );
  }

  function metricsUeba() {
    return {
      today: anomalies.filter((a) => String(a.time).startsWith(MOCK_TODAY)).length,
      highSens: entities.filter((e) => e.sensitivity === "高").length,
      pending: anomalies.filter((a) => a.status === "待复核").length,
      confirmed: anomalies.filter((a) => a.status === "已确认").length,
    };
  }

  function listAnomalies(filter = {}) {
    return clone(
      anomalies.filter((a) => {
        if (filter.entityType && a.entityType !== filter.entityType) return false;
        if (filter.sensitivity && a.sensitivity !== filter.sensitivity) return false;
        if (filter.status && a.status !== filter.status) return false;
        if (!matchKeyword(`${a.entityLabel} ${a.summary} ${a.id}`, filter.keyword)) return false;
        if (!inDateRange(a.time, filter.dateFrom, filter.dateTo)) return false;
        return true;
      })
    );
  }

  function getAnomaly(id) {
    const item = anomalies.find((a) => String(a.id) === String(id));
    return item ? clone(item) : null;
  }

  function getEntity(id) {
    const item = entities.find((e) => String(e.id) === String(id));
    return item ? clone(item) : null;
  }

  function markAnomaly(id, status) {
    const item = anomalies.find((a) => String(a.id) === String(id));
    if (!item) return null;
    item.status = status || item.status;
    return clone(item);
  }

  function escalateAnomaly(id) {
    const item = anomalies.find((a) => String(a.id) === String(id));
    if (!item) return null;
    item.status = "已升级";
    item.eventRef = item.eventRef || `EVT-UP-${++seq.event}`;
    return clone(item);
  }

  function listPlaybooks(filter = {}) {
    return clone(
      playbooks.filter((p) => {
        if (filter.enabled != null && filter.enabled !== "" && Boolean(p.enabled) !== Boolean(filter.enabled === true || filter.enabled === "true" || filter.enabled === "启用")) {
          if (filter.enabled === "启用" && !p.enabled) return false;
          if (filter.enabled === "停用" && p.enabled) return false;
          if (filter.enabled === true && !p.enabled) return false;
          if (filter.enabled === false && p.enabled) return false;
        }
        if (!matchKeyword(`${p.name} ${p.trigger}`, filter.keyword)) return false;
        return true;
      })
    );
  }

  function getPlaybook(id) {
    const item = playbooks.find((p) => String(p.id) === String(id));
    return item ? clone(item) : null;
  }

  function savePlaybook(payload = {}) {
    if (payload.id) {
      const item = playbooks.find((p) => String(p.id) === String(payload.id));
      if (!item) return null;
      Object.assign(item, payload, { updatedAt: formatNow() });
      item.stepCount = Array.isArray(item.steps) ? item.steps.length : item.stepCount;
      return clone(item);
    }
    const id = `PB-${++seq.playbook}`;
    const item = {
      id,
      name: payload.name || "未命名剧本",
      trigger: payload.trigger || "-",
      steps: payload.steps || ["匹配", "联动", "通知", "关闭"],
      stepCount: (payload.steps || ["匹配", "联动", "通知", "关闭"]).length,
      systems: payload.systems || ["工单"],
      enabled: payload.enabled !== false,
      updatedAt: formatNow(),
    };
    playbooks.unshift(item);
    return clone(item);
  }

  function togglePlaybook(id) {
    const item = playbooks.find((p) => String(p.id) === String(id));
    if (!item) return null;
    item.enabled = !item.enabled;
    item.updatedAt = formatNow();
    return clone(item);
  }

  function listTasks(filter = {}) {
    return clone(
      tasks.filter((t) => {
        if (filter.status && t.status !== filter.status) return false;
        if (!matchKeyword(`${t.code} ${t.eventTitle} ${t.executor}`, filter.keyword)) return false;
        return true;
      })
    ).map((t) => {
      const pb = playbooks.find((p) => p.id === t.playbookId);
      t.playbookName = pb ? pb.name : "-";
      return t;
    });
  }

  function getTask(id) {
    const item = tasks.find((t) => String(t.id) === String(id));
    if (!item) return null;
    const out = clone(item);
    const pb = playbooks.find((p) => p.id === item.playbookId);
    out.playbookName = pb ? pb.name : "-";
    out.playbook = pb ? clone(pb) : null;
    return out;
  }

  function runTask(id) {
    const item = tasks.find((t) => String(t.id) === String(id));
    if (!item) return null;
    item.status = "执行中";
    item.startedAt = formatNow();
    item.duration = "进行中";
    item.timeline = item.timeline || [];
    item.timeline.push({ time: formatNow(), actor: item.executor, action: "执行/重试", note: "开始执行剧本步骤" });
    return getTask(id);
  }

  function completeTask(id, { action } = {}) {
    const item = tasks.find((t) => String(t.id) === String(id));
    if (!item) return null;
    if (action === "collect") {
      item.status = "待复核";
      item.timeline.push({ time: formatNow(), actor: "系统", action: "回收结果", note: "联动结果已回收" });
    } else if (action === "close") {
      item.status = "已关闭";
      item.duration = item.duration === "进行中" ? "12m" : item.duration;
      item.timeline.push({ time: formatNow(), actor: "复核人", action: "复核关闭", note: "流程闭环" });
    }
    return getTask(id);
  }

  function metricsIntel() {
    return {
      valid: intel.filter((i) => i.disposeStatus !== "误报").length,
      todayHits: intel.reduce((sum, i) => sum + (i.hitCount > 0 && i.confidence !== "低" ? 1 : 0), 0),
      highConf: intel.filter((i) => i.confidence === "高").length,
      falsePending: intel.filter((i) => i.disposeStatus === "待处置" && i.confidence === "低").length,
    };
  }

  function listIntel(filter = {}) {
    return clone(
      intel.filter((i) => {
        if (filter.objectType && i.objectType !== filter.objectType) return false;
        if (filter.source && i.source !== filter.source) return false;
        if (filter.confidence && i.confidence !== filter.confidence) return false;
        if (filter.disposeStatus && i.disposeStatus !== filter.disposeStatus) return false;
        if (!matchKeyword(`${i.value} ${i.assets} ${i.id}`, filter.keyword)) return false;
        return true;
      })
    );
  }

  function getIntel(id) {
    const item = intel.find((i) => String(i.id) === String(id));
    return item ? clone(item) : null;
  }

  function saveIntel(payload = {}) {
    if (payload.id) {
      const item = intel.find((i) => String(i.id) === String(payload.id));
      if (!item) return null;
      Object.assign(item, payload);
      return clone(item);
    }
    const item = {
      id: `TI-${++seq.intel}`,
      value: payload.value || "",
      objectType: payload.objectType || "IP",
      source: payload.source || "本地黑白名单",
      confidence: payload.confidence || "中",
      expireAt: payload.expireAt || "2026-12-31",
      hitCount: payload.hitCount || 0,
      assets: payload.assets || "-",
      disposeStatus: payload.disposeStatus || "待处置",
      advice: payload.advice || "-",
    };
    intel.unshift(item);
    return clone(item);
  }

  function generateRule(id) {
    const item = intel.find((i) => String(i.id) === String(id));
    if (!item) return null;
    item.disposeStatus = "已生成规则";
    item.advice = (item.advice || "") + "；已生成检测规则（Mock）";
    return clone(item);
  }

  function banIntel(id) {
    const item = intel.find((i) => String(i.id) === String(id));
    if (!item) return null;
    item.disposeStatus = "已封禁";
    return clone(item);
  }

  function feedbackFalsePositive(id, remark) {
    const item = intel.find((i) => String(i.id) === String(id));
    if (!item) return null;
    item.disposeStatus = "误报";
    if (remark) item.advice = remark;
    return clone(item);
  }

  const api = {
    MOCK_TODAY,
    SOURCE_TYPES,
    EVENT_LEVELS,
    EVENT_STATUSES,
    DEVICE_TYPES,
    ATTACK_TYPES,
    RISK_TYPES,
    ENTITY_TYPES,
    SYSTEMS,
    OBJECT_TYPES,
    levelTag,
    statusTag,
    healthTag,
    protectTag,
    anomalyStatusTag,
    taskStatusTag,
    confidenceTag,
    disposeTag,
    metricsSiem,
    listEvents,
    getEvent,
    updateEvent,
    metricsIds,
    listDevices,
    getDevice,
    listAttacks,
    getAttack,
    linkAction,
    metricsMalware,
    listMalwareHosts,
    getMalwareHost,
    isolateHost,
    restoreHost,
    updateHostPolicy,
    listMalwareLogs,
    metricsUeba,
    listAnomalies,
    getAnomaly,
    getEntity,
    markAnomaly,
    escalateAnomaly,
    listPlaybooks,
    getPlaybook,
    savePlaybook,
    togglePlaybook,
    listTasks,
    getTask,
    runTask,
    completeTask,
    metricsIntel,
    listIntel,
    getIntel,
    saveIntel,
    generateRule,
    banIntel,
    feedbackFalsePositive,
  };

  window.Threat = api;
})();
