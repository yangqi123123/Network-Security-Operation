(function () {
  const MOCK_TODAY = "2026-11-01";

  const SECURITY_CLASS = [
    "安全物理环境",
    "安全通信网络",
    "安全区域边界",
    "安全计算环境",
    "安全管理中心",
    "安全管理制度",
  ];

  const CHECK_STATUS = {
    satisfied: "满足",
    partial: "部分满足",
    unsatisfied: "不满足",
    na: "不适用",
  };

  const CHECK_STATUS_META = {
    satisfied: { label: "满足", tagClass: "success" },
    partial: { label: "部分满足", tagClass: "warning" },
    unsatisfied: { label: "不满足", tagClass: "danger" },
    na: { label: "不适用", tagClass: "" },
  };

  const REMEDIATION_META = {
    "": { label: "-", tagClass: "" },
    pending: { label: "待整改", tagClass: "warning" },
    doing: { label: "整改中", tagClass: "" },
    review: { label: "待复核", tagClass: "warning" },
    done: { label: "已闭环", tagClass: "success" },
  };

  const POLICY_TYPES = [
    "终端",
    "外设",
    "数据防泄露",
    "访问控制",
    "告警",
    "响应",
    "日志留存",
    "报表订阅",
    "联动处置",
  ];

  const APPROVAL_META = {
    draft: { label: "草稿", tagClass: "" },
    pending: { label: "待审批", tagClass: "warning" },
    approved: { label: "已通过", tagClass: "success" },
    rejected: { label: "已驳回", tagClass: "danger" },
    dual: { label: "待双人复核", tagClass: "warning" },
  };

  const EFFECT_LABEL = {
    immediate: "立即生效",
    scheduled: "定时生效",
    canary: "灰度发布",
  };

  const LOG_TYPES = ["安全", "操作", "审计", "告警", "系统", "工单"];

  const SEVERITY_META = {
    critical: { label: "严重", tagClass: "danger" },
    high: { label: "高", tagClass: "warning" },
    medium: { label: "中", tagClass: "" },
    low: { label: "低", tagClass: "success" },
  };

  const HANDLE_META = {
    open: { label: "未处置", tagClass: "warning" },
    done: { label: "已处置", tagClass: "success" },
  };

  const ANOMALY_TYPES = [
    "日志缺失",
    "采集异常",
    "时间漂移",
    "日志突增",
    "日志突降",
    "关键资产无日志",
    "审计策略未启用",
  ];

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

  function nextId(prefix, list) {
    const max = list.reduce((m, item) => {
      const n = Number(String(item.id).replace(/\D/g, "")) || 0;
      return Math.max(m, n);
    }, 0);
    return `${prefix}-${String(max + 1).padStart(3, "0")}`;
  }

  function bumpVersion(v) {
    const n = Number(String(v || "v1").replace(/\D/g, "")) || 1;
    return `v${n + 1}`;
  }

  function requireDual(policy, opts) {
    if (policy.highRisk && !(opts && opts.dualConfirmed)) {
      return { ok: false, message: "高风险策略变更需完成双人复核" };
    }
    return null;
  }

  function pushAudit(policy, action, changeSummary, approvalResult) {
    policy.audits = policy.audits || [];
    policy.audits.unshift({
      time: formatNow(),
      actor: "管理员",
      action,
      changeSummary,
      scope: policy.scopeSummary || "-",
      approvalResult: approvalResult || (policy.highRisk ? "双人复核通过" : "已通过"),
    });
  }

  let batches = [
    { id: "B-2026-01", name: "2026年度等保自评估", startAt: "2026-09-01", endAt: "2026-11-30", status: "进行中" },
    { id: "B-2025-02", name: "2025年中复核批次", startAt: "2025-06-01", endAt: "2025-08-31", status: "已归档" },
  ];

  let checkItems = [
    { id: "CI-001", clauseNo: "8.1.1", name: "机房出入控制", securityClass: "安全物理环境", batchId: "B-2026-01", mappedObjects: "资产:中心机房门禁 | 日志:门禁刷卡日志 | 报表:机房巡检表", status: "satisfied", score: 100, evidence: [{ name: "门禁策略截图.png", uploadedAt: "2026-10-12 09:20:00", uploader: "王敏" }], riskLinks: [], remediationStatus: "", owner: "", dueAt: "", remediationNote: "", reviewResult: "" },
    { id: "CI-002", clauseNo: "8.1.3", name: "电力供应冗余", securityClass: "安全物理环境", batchId: "B-2026-01", mappedObjects: "资产:UPS-A/B | 基线:供电巡检", status: "partial", score: 70, evidence: [{ name: "UPS巡检记录.pdf", uploadedAt: "2026-10-18 14:00:00", uploader: "李强" }], riskLinks: [{ kind: "asset", summary: "备用市电切换演练超期" }], remediationStatus: "doing", owner: "李强", dueAt: "2026-11-15", remediationNote: "补充切换演练记录", reviewResult: "" },
    { id: "CI-003", clauseNo: "8.1.5", name: "防盗窃与防破坏", securityClass: "安全物理环境", batchId: "B-2026-01", mappedObjects: "资产:机房摄像头 | 事件:入侵告警", status: "satisfied", score: 95, evidence: [], riskLinks: [], remediationStatus: "", owner: "", dueAt: "", remediationNote: "", reviewResult: "" },
    { id: "CI-004", clauseNo: "8.2.1", name: "网络架构分区", securityClass: "安全通信网络", batchId: "B-2026-01", mappedObjects: "资产:核心交换机 | 策略:VLAN隔离 | 报表:网络拓扑", status: "satisfied", score: 90, evidence: [{ name: "网络分区说明.docx", uploadedAt: "2026-09-20 10:00:00", uploader: "陈明" }], riskLinks: [], remediationStatus: "", owner: "", dueAt: "", remediationNote: "", reviewResult: "" },
    { id: "CI-005", clauseNo: "8.2.2", name: "通信传输完整性", securityClass: "安全通信网络", batchId: "B-2026-01", mappedObjects: "策略:链路加密 | 日志:VPN会话", status: "unsatisfied", score: 40, evidence: [], riskLinks: [{ kind: "policy", summary: "分支专线未启用完整性校验" }, { kind: "log", summary: "VPN完整性告警缺失" }], remediationStatus: "pending", owner: "", dueAt: "", remediationNote: "", reviewResult: "" },
    { id: "CI-006", clauseNo: "8.2.3", name: "通信传输保密性", securityClass: "安全通信网络", batchId: "B-2026-01", mappedObjects: "策略:TLS强制 | 资产:负载均衡", status: "partial", score: 65, evidence: [], riskLinks: [{ kind: "vuln", summary: "部分内网接口仍使用弱密码套件" }], remediationStatus: "", owner: "", dueAt: "", remediationNote: "", reviewResult: "" },
    { id: "CI-007", clauseNo: "8.3.1", name: "边界访问控制", securityClass: "安全区域边界", batchId: "B-2026-01", mappedObjects: "资产:边界防火墙 | 策略:ACL | 日志:放行拒绝日志", status: "satisfied", score: 92, evidence: [{ name: "ACL清单.xlsx", uploadedAt: "2026-10-01 11:30:00", uploader: "赵磊" }], riskLinks: [], remediationStatus: "", owner: "", dueAt: "", remediationNote: "", reviewResult: "" },
    { id: "CI-008", clauseNo: "8.3.2", name: "入侵防范", securityClass: "安全区域边界", batchId: "B-2026-01", mappedObjects: "资产:IDS | 事件:入侵事件 | 报表:周报", status: "partial", score: 75, evidence: [], riskLinks: [{ kind: "log", summary: "DMZ区 IDS 日志缺口 2 天" }], remediationStatus: "doing", owner: "赵磊", dueAt: "2026-11-10", remediationNote: "修复采集器配置", reviewResult: "" },
    { id: "CI-009", clauseNo: "8.3.4", name: "恶意代码防范（边界）", securityClass: "安全区域边界", batchId: "B-2026-01", mappedObjects: "资产:网关杀毒 | 策略:文件过滤", status: "satisfied", score: 88, evidence: [], riskLinks: [], remediationStatus: "", owner: "", dueAt: "", remediationNote: "", reviewResult: "" },
    { id: "CI-010", clauseNo: "8.4.1", name: "身份鉴别", securityClass: "安全计算环境", batchId: "B-2026-01", mappedObjects: "账号:域账号策略 | 基线:密码复杂度 | 日志:登录失败", status: "unsatisfied", score: 35, evidence: [], riskLinks: [{ kind: "account", summary: "服务账号未启用双因子" }, { kind: "baseline", summary: "3 台主机密码策略偏离" }], remediationStatus: "pending", owner: "", dueAt: "", remediationNote: "", reviewResult: "" },
    { id: "CI-011", clauseNo: "8.4.3", name: "安全审计（主机）", securityClass: "安全计算环境", batchId: "B-2026-01", mappedObjects: "日志:系统审计 | 策略:审计策略 | 资产:服务器组", status: "partial", score: 60, evidence: [{ name: "审计策略截图.png", uploadedAt: "2026-10-22 16:10:00", uploader: "孙涛" }], riskLinks: [{ kind: "log", summary: "数据库审计未覆盖从库" }], remediationStatus: "review", owner: "孙涛", dueAt: "2026-11-05", remediationNote: "已扩容采集，待复核", reviewResult: "" },
    { id: "CI-012", clauseNo: "8.4.5", name: "入侵防范（主机）", securityClass: "安全计算环境", batchId: "B-2026-01", mappedObjects: "资产:EDR | 漏洞:主机漏洞 | 事件:木马告警", status: "satisfied", score: 85, evidence: [], riskLinks: [], remediationStatus: "", owner: "", dueAt: "", remediationNote: "", reviewResult: "" },
    { id: "CI-013", clauseNo: "8.4.8", name: "数据完整性", securityClass: "安全计算环境", batchId: "B-2026-01", mappedObjects: "策略:校验和 | 报表:备份校验报告", status: "na", score: null, evidence: [], riskLinks: [], remediationStatus: "", owner: "", dueAt: "", remediationNote: "", reviewResult: "该系统无本地结构化库，标记不适用" },
    { id: "CI-014", clauseNo: "8.5.1", name: "系统管理", securityClass: "安全管理中心", batchId: "B-2026-01", mappedObjects: "账号:三权分立 | 策略:管理员角色 | 日志:特权操作", status: "partial", score: 68, evidence: [], riskLinks: [{ kind: "account", summary: "审计员与系统员账号交叉授权" }], remediationStatus: "doing", owner: "周敏", dueAt: "2026-11-20", remediationNote: "拆分角色权限矩阵", reviewResult: "" },
    { id: "CI-015", clauseNo: "8.5.2", name: "审计管理", securityClass: "安全管理中心", batchId: "B-2026-01", mappedObjects: "日志:集中审计 | 报表:审计日报 | 策略:留存周期", status: "satisfied", score: 90, evidence: [{ name: "留存策略.pdf", uploadedAt: "2026-09-15 09:00:00", uploader: "周敏" }], riskLinks: [], remediationStatus: "", owner: "", dueAt: "", remediationNote: "", reviewResult: "" },
    { id: "CI-016", clauseNo: "8.5.3", name: "安全管理", securityClass: "安全管理中心", batchId: "B-2026-01", mappedObjects: "策略:集中策略 | 事件:联动处置", status: "unsatisfied", score: 45, evidence: [], riskLinks: [{ kind: "policy", summary: "高风险变更缺少双人复核流程" }], remediationStatus: "pending", owner: "", dueAt: "", remediationNote: "", reviewResult: "" },
    { id: "CI-017", clauseNo: "8.6.1", name: "安全管理制度", securityClass: "安全管理制度", batchId: "B-2026-01", mappedObjects: "制度材料:总纲 | 报表:制度清单", status: "satisfied", score: 100, evidence: [{ name: "信息安全管理制度V3.pdf", uploadedAt: "2026-08-01 10:00:00", uploader: "刘洋" }], riskLinks: [], remediationStatus: "", owner: "", dueAt: "", remediationNote: "", reviewResult: "" },
    { id: "CI-018", clauseNo: "8.6.3", name: "人员安全管理", securityClass: "安全管理制度", batchId: "B-2026-01", mappedObjects: "账号:入职离岗流程 | 制度材料:保密协议", status: "partial", score: 72, evidence: [], riskLinks: [{ kind: "doc", summary: "外包人员保密协议抽检缺 2 份" }], remediationStatus: "doing", owner: "黄伟", dueAt: "2026-11-12", remediationNote: "补签并归档", reviewResult: "" },
    { id: "CI-019", clauseNo: "8.6.5", name: "安全建设管理", securityClass: "安全管理制度", batchId: "B-2025-02", mappedObjects: "报表:建设立项 | 制度材料:变更评审", status: "satisfied", score: 88, evidence: [], riskLinks: [], remediationStatus: "done", owner: "陈明", dueAt: "2025-08-10", remediationNote: "已归档", reviewResult: "复核通过" },
    { id: "CI-020", clauseNo: "8.6.7", name: "安全运维管理", securityClass: "安全管理制度", batchId: "B-2026-01", mappedObjects: "事件:运维工单 | 日志:变更操作 | 基线:运维检查表", status: "unsatisfied", score: 50, evidence: [], riskLinks: [{ kind: "doc", summary: "重大变更审批单缺失" }, { kind: "event", summary: "未关联应急预案演练记录" }], remediationStatus: "pending", owner: "", dueAt: "", remediationNote: "", reviewResult: "" },
  ];

  let policyTemplates = [
    { id: "TPL-01", name: "办公终端基线模板", type: "终端" },
    { id: "TPL-02", name: "外设管控标准模板", type: "外设" },
    { id: "TPL-03", name: "敏感文件外发管控", type: "数据防泄露" },
    { id: "TPL-04", name: "最小权限访问模板", type: "访问控制" },
    { id: "TPL-05", name: "高危告警联动响应", type: "联动处置" },
    { id: "TPL-06", name: "日志留存180天", type: "日志留存" },
  ];

  function makePolicy(p) {
    return Object.assign(
      {
        inheritFrom: "-",
        effectMode: "immediate",
        highRisk: false,
        exceptions: [],
        versions: [
          { version: "v1", summary: "初始版本", updatedAt: "2026-08-01 10:00:00" },
          { version: p.version || "v2", summary: p.contentSummary || "当前生效版本", updatedAt: p.updatedAt || "2026-10-01 10:00:00" },
        ],
        audits: [
          {
            time: p.updatedAt || "2026-10-01 10:00:00",
            actor: p.updatedBy || "管理员",
            action: "发布",
            changeSummary: "策略发布",
            scope: p.scopeSummary || "-",
            approvalResult: "已通过",
          },
        ],
      },
      p
    );
  }

  let policies = [
    makePolicy({ id: "POL-001", name: "办公终端安全基线", type: "终端", group: "办公终端", inheritFrom: "办公终端基线模板", scopeSummary: "部门:全员办公 | 终端组:办公PC", version: "v3", enabled: true, approvalStatus: "approved", effectMode: "immediate", highRisk: false, contentSummary: "禁止未授权软件、强制屏保锁屏、启用磁盘加密", updatedBy: "王敏", updatedAt: "2026-10-20 09:15:00" }),
    makePolicy({ id: "POL-002", name: "财务外设管控", type: "外设", group: "核心业务", inheritFrom: "外设管控标准模板", scopeSummary: "部门:财务部 | 数据等级:机密", version: "v2", enabled: true, approvalStatus: "approved", effectMode: "immediate", highRisk: true, contentSummary: "禁用蓝牙/刻录，打印机仅白名单", updatedBy: "李强", updatedAt: "2026-10-18 11:20:00", exceptions: [{ scope: "财务共享打印机 PRN-FIN-01", reason: "月结批量打印", validUntil: "2026-12-31", approver: "财务总监" }] }),
    makePolicy({ id: "POL-003", name: "敏感数据外发阻断", type: "数据防泄露", group: "等保专区", scopeSummary: "业务系统:OA/财务 | 数据等级:敏感及以上", version: "v4", enabled: true, approvalStatus: "dual", effectMode: "canary", highRisk: true, contentSummary: "识别身份证/银行卡并阻断外发，灰度 20%", updatedBy: "陈明", updatedAt: "2026-10-28 16:40:00" }),
    makePolicy({ id: "POL-004", name: "堡垒机访问控制", type: "访问控制", group: "核心业务", scopeSummary: "资产组:核心网络/业务服务器 | 风险等级:高", version: "v5", enabled: true, approvalStatus: "approved", effectMode: "immediate", highRisk: true, contentSummary: "高风险资产必须经堡垒机，会话录像", updatedBy: "赵磊", updatedAt: "2026-10-15 14:05:00" }),
    makePolicy({ id: "POL-005", name: "高危漏洞告警升级", type: "告警", group: "默认分组", scopeSummary: "资产组:业务服务器", version: "v2", enabled: true, approvalStatus: "approved", effectMode: "immediate", highRisk: false, contentSummary: "CVSS≥9 自动升级为紧急并短信通知", updatedBy: "孙涛", updatedAt: "2026-09-30 10:00:00" }),
    makePolicy({ id: "POL-006", name: "勒索行为自动隔离", type: "响应", group: "等保专区", scopeSummary: "终端组:全部终端", version: "v3", enabled: true, approvalStatus: "pending", effectMode: "scheduled", highRisk: true, contentSummary: "检测到勒索特征后断网隔离并开单", updatedBy: "周敏", updatedAt: "2026-10-30 09:00:00" }),
    makePolicy({ id: "POL-007", name: "安全日志留存180天", type: "日志留存", group: "默认分组", scopeSummary: "来源:防火墙/EDR/堡垒机", version: "v2", enabled: true, approvalStatus: "approved", effectMode: "immediate", highRisk: false, contentSummary: "热数据 30 天，冷数据 150 天", updatedBy: "刘洋", updatedAt: "2026-09-12 08:30:00" }),
    makePolicy({ id: "POL-008", name: "周安全态势报表订阅", type: "报表订阅", group: "默认分组", scopeSummary: "部门:信息中心/安全部", version: "v1", enabled: true, approvalStatus: "approved", effectMode: "scheduled", highRisk: false, contentSummary: "每周一 09:00 推送 PDF", updatedBy: "黄伟", updatedAt: "2026-08-20 09:00:00" }),
    makePolicy({ id: "POL-009", name: "告警-工单联动", type: "联动处置", group: "核心业务", scopeSummary: "严重性:严重/高", version: "v3", enabled: true, approvalStatus: "approved", effectMode: "immediate", highRisk: false, contentSummary: "严重告警自动建单并指派值班", updatedBy: "王敏", updatedAt: "2026-10-05 13:20:00" }),
    makePolicy({ id: "POL-010", name: "研发终端宽松基线", type: "终端", group: "办公终端", inheritFrom: "办公终端安全基线", scopeSummary: "部门:研发部 | 终端组:研发PC", version: "v2", enabled: false, approvalStatus: "rejected", effectMode: "immediate", highRisk: false, contentSummary: "允许本地管理员，关闭 USB 只读", updatedBy: "陈明", updatedAt: "2026-10-12 17:10:00" }),
    makePolicy({ id: "POL-011", name: "摄像头禁用策略", type: "外设", group: "办公终端", scopeSummary: "部门:行政部", version: "v1", enabled: true, approvalStatus: "draft", effectMode: "immediate", highRisk: false, contentSummary: "禁用摄像头与麦克风", updatedBy: "吴静", updatedAt: "2026-10-31 10:00:00" }),
    makePolicy({ id: "POL-012", name: "数据库访问白名单", type: "访问控制", group: "等保专区", scopeSummary: "业务系统:核心库 | 风险等级:高", version: "v4", enabled: true, approvalStatus: "dual", effectMode: "canary", highRisk: true, contentSummary: "仅应用账号可访，灰度先覆盖生产只读副本", updatedBy: "赵磊", updatedAt: "2026-10-29 15:45:00" }),
  ];

  const assets = ["SW-Core-01", "SRV-WEB-02", "SRV-DB-01", "FW-Edge-01", "PC-财务-11", "PC-运维-03", "IDS-DMZ-01", "EDR-平台"];
  const accounts = ["admin", "zhangsan", "lisi", "wangwu", "svc_backup", "auditor", "ops_duty"];
  const sources = ["防火墙", "EDR", "堡垒机", "工单系统", "平台自身", "IDS", "数据库审计"];
  const severities = ["critical", "high", "medium", "low"];
  const summaries = [
    "检测到异常登录失败次数超阈值",
    "策略下发成功",
    "审计日志完整性校验通过",
    "高危端口扫描告警",
    "系统服务重启",
    "工单超时升级",
    "敏感文件外发被阻断",
    "时间同步偏移超过阈值",
    "账号权限变更",
    "漏洞扫描任务完成",
  ];

  let logs = [];
  for (let i = 1; i <= 42; i += 1) {
    const type = LOG_TYPES[(i - 1) % LOG_TYPES.length];
    const severity = severities[i % severities.length];
    const handleStatus = i % 5 === 0 ? "done" : "open";
    const hour = pad((i * 3) % 24);
    const minute = pad((i * 7) % 60);
    const day = i % 3 === 0 ? "2026-10-31" : MOCK_TODAY;
    const item = {
      id: `LOG-${String(i).padStart(3, "0")}`,
      time: `${day} ${hour}:${minute}:00`,
      type,
      asset: assets[i % assets.length],
      account: accounts[i % accounts.length],
      summary: summaries[i % summaries.length],
      severity,
      source: sources[i % sources.length],
      handleStatus,
      rawSummary: `[${type}] host=${assets[i % assets.length]} user=${accounts[i % accounts.length]} msg=${summaries[i % summaries.length]}`,
      relatedAlerts: i % 4 === 0 ? [`ALERT-${1000 + i}`] : [],
      attachments: i % 6 === 0 ? [`evidence-${i}.png`] : [],
      timeline: [],
    };
    if (i % 3 === 0) {
      item.timeline = [
        { time: item.time, title: "事件产生", detail: item.summary },
        { time: `${day} ${hour}:${pad((Number(minute) + 5) % 60)}:00`, title: "归并告警", detail: item.relatedAlerts[0] || "无归并" },
        { time: `${day} ${hour}:${pad((Number(minute) + 12) % 60)}:00`, title: handleStatus === "done" ? "已处置" : "待处置", detail: handleStatus === "done" ? "值班确认误报/已闭环" : "等待值班确认" },
      ];
    }
    logs.push(item);
  }

  let logAnomalies = [
    { id: "AN-001", type: "日志缺失", summary: "SRV-DB-01 近 2 小时无审计日志", foundAt: "2026-11-01 08:20:00", asset: "SRV-DB-01" },
    { id: "AN-002", type: "采集异常", summary: "IDS-DMZ-01 采集器心跳中断", foundAt: "2026-11-01 07:55:00", asset: "IDS-DMZ-01" },
    { id: "AN-003", type: "时间漂移", summary: "PC-财务-11 与 NTP 偏差  thr 分钟", foundAt: "2026-11-01 09:10:00", asset: "PC-财务-11" },
    { id: "AN-004", type: "日志突增", summary: "防火墙拒绝日志 15 分钟内增长 8 倍", foundAt: "2026-11-01 10:05:00", asset: "FW-Edge-01" },
    { id: "AN-005", type: "日志突降", summary: "EDR 终端上报量下降 70%", foundAt: "2026-11-01 09:40:00", asset: "EDR-平台" },
    { id: "AN-006", type: "关键资产无日志", summary: "SW-Core-01 今日无运行日志", foundAt: "2026-11-01 11:00:00", asset: "SW-Core-01" },
    { id: "AN-007", type: "审计策略未启用", summary: "SRV-WEB-02 本地审计策略关闭", foundAt: "2026-11-01 08:00:00", asset: "SRV-WEB-02" },
  ];
  // fix typo in AN-003
  logAnomalies[2].summary = "PC-财务-11 与 NTP 偏差 120 秒";

  const meta = {
    securityClasses: SECURITY_CLASS.slice(),
    policyTypes: POLICY_TYPES.slice(),
    logTypes: LOG_TYPES.slice(),
    groups: ["默认分组", "核心业务", "办公终端", "等保专区"],
    departments: ["信息中心", "运维部", "安全部", "研发部", "财务部"],
    assetGroups: ["核心网络", "业务服务器", "桌面终端"],
    hosts: assets.slice(),
    sources: sources.slice(),
    dataLevels: ["公开", "内部", "敏感", "机密"],
    riskLevels: ["低", "中", "高"],
  };

  function checkStatusTag(status) {
    return CHECK_STATUS_META[status] ? { ...CHECK_STATUS_META[status] } : { label: status || "-", tagClass: "" };
  }

  function remediationTag(status) {
    const key = status || "";
    return REMEDIATION_META[key] ? { ...REMEDIATION_META[key] } : { label: status || "-", tagClass: "" };
  }

  function policyEnabledTag(enabled) {
    return enabled ? { label: "启用", tagClass: "success" } : { label: "停用", tagClass: "danger" };
  }

  function approvalTag(status) {
    return APPROVAL_META[status] ? { ...APPROVAL_META[status] } : { label: status || "-", tagClass: "" };
  }

  function severityTag(severity) {
    return SEVERITY_META[severity] ? { ...SEVERITY_META[severity] } : { label: severity || "-", tagClass: "" };
  }

  function handleTag(status) {
    return HANDLE_META[status] ? { ...HANDLE_META[status] } : { label: status || "-", tagClass: "" };
  }

  function effectModeLabel(mode) {
    return EFFECT_LABEL[mode] || mode || "-";
  }

  function listBatches() {
    return clone(batches);
  }

  function listCheckItems(filter) {
    const f = filter || {};
    return clone(
      checkItems.filter((item) => {
        if (f.batchId && item.batchId !== f.batchId) return false;
        if (f.securityClass && item.securityClass !== f.securityClass) return false;
        if (f.status && item.status !== f.status) return false;
        if (f.keyword) {
          const kw = f.keyword.toLowerCase();
          const blob = `${item.clauseNo} ${item.name} ${item.mappedObjects} ${item.owner}`.toLowerCase();
          if (!blob.includes(kw)) return false;
        }
        return true;
      })
    );
  }

  function getCheckItem(id) {
    const item = checkItems.find((x) => String(x.id) === String(id));
    return item ? clone(item) : null;
  }

  function assessCheckItem(id, payload) {
    const item = checkItems.find((x) => String(x.id) === String(id));
    if (!item) return { ok: false, message: "检查项不存在" };
    const p = payload || {};
    if (p.status) item.status = p.status;
    if (p.score !== undefined && p.score !== "") item.score = Number(p.score);
    if (p.remark) item.reviewResult = p.remark;
    if (p.evidenceNote) {
      item.evidence = item.evidence || [];
      item.evidence.unshift({
        name: p.evidenceNote,
        uploadedAt: formatNow(),
        uploader: "管理员",
      });
    }
    return { ok: true, item: clone(item) };
  }

  function createRemediation(id, payload) {
    const item = checkItems.find((x) => String(x.id) === String(id));
    if (!item) return { ok: false, message: "检查项不存在" };
    if (item.status !== "partial" && item.status !== "unsatisfied") {
      return { ok: false, message: "仅不满足/部分满足可生成整改" };
    }
    const p = payload || {};
    if (!p.owner || !p.dueAt || !p.note) return { ok: false, message: "请填写责任人、计划完成时间与整改说明" };
    item.owner = p.owner;
    item.dueAt = p.dueAt;
    item.remediationNote = p.note;
    item.remediationStatus = "doing";
    return { ok: true, item: clone(item) };
  }

  function runSelfAssessment() {
    const candidates = checkItems.filter((x) => x.batchId === "B-2026-01" && x.status !== "na");
    candidates.slice(0, 3).forEach((item, idx) => {
      if (item.status === "unsatisfied" && idx === 0) item.score = Math.min(100, (item.score || 0) + 5);
    });
    return mlpsMetrics();
  }

  function mlpsMetrics() {
    const total = checkItems.length;
    const satisfied = checkItems.filter((x) => x.status === "satisfied").length;
    const unsatisfied = checkItems.filter((x) => x.status === "unsatisfied").length;
    const remediating = checkItems.filter((x) => x.remediationStatus === "doing" || x.remediationStatus === "review").length;
    return { total, satisfied, unsatisfied, remediating };
  }

  function listPolicyTemplates() {
    return clone(policyTemplates);
  }

  function listPolicies(filter) {
    const f = filter || {};
    return clone(
      policies.filter((p) => {
        if (f.type && p.type !== f.type) return false;
        if (f.group && p.group !== f.group) return false;
        if (f.enabled === "true" && !p.enabled) return false;
        if (f.enabled === "false" && p.enabled) return false;
        if (f.approvalStatus && p.approvalStatus !== f.approvalStatus) return false;
        if (f.keyword) {
          const kw = f.keyword.toLowerCase();
          const blob = `${p.name} ${p.scopeSummary} ${p.contentSummary}`.toLowerCase();
          if (!blob.includes(kw)) return false;
        }
        return true;
      })
    );
  }

  function getPolicy(id) {
    const item = policies.find((x) => String(x.id) === String(id));
    return item ? clone(item) : null;
  }

  function savePolicy(payload) {
    const p = payload || {};
    if (p.id) {
      const idx = policies.findIndex((x) => String(x.id) === String(p.id));
      if (idx < 0) return { ok: false, message: "策略不存在" };
      const cur = policies[idx];
      const nextVersion = bumpVersion(cur.version);
      Object.assign(cur, {
        name: p.name || cur.name,
        type: p.type || cur.type,
        group: p.group || cur.group,
        inheritFrom: p.inheritFrom || cur.inheritFrom,
        scopeSummary: p.scopeSummary || cur.scopeSummary,
        effectMode: p.effectMode || cur.effectMode,
        contentSummary: p.contentSummary || cur.contentSummary,
        highRisk: !!p.highRisk,
        version: nextVersion,
        updatedBy: "管理员",
        updatedAt: formatNow(),
        approvalStatus: p.highRisk ? "dual" : cur.approvalStatus === "draft" ? "pending" : cur.approvalStatus,
      });
      cur.versions = cur.versions || [];
      cur.versions.push({ version: nextVersion, summary: cur.contentSummary, updatedAt: cur.updatedAt });
      pushAudit(cur, "修改", `更新至 ${nextVersion}`, cur.highRisk ? "待双人复核" : "已提交");
      return { ok: true, item: clone(cur) };
    }
    const id = nextId("POL", policies);
    const created = makePolicy({
      id,
      name: p.name || "未命名策略",
      type: p.type || POLICY_TYPES[0],
      group: p.group || "默认分组",
      inheritFrom: p.inheritFrom || "-",
      scopeSummary: p.scopeSummary || "-",
      version: "v1",
      enabled: false,
      approvalStatus: p.highRisk ? "dual" : "pending",
      effectMode: p.effectMode || "immediate",
      highRisk: !!p.highRisk,
      contentSummary: p.contentSummary || "",
      updatedBy: "管理员",
      updatedAt: formatNow(),
      versions: [{ version: "v1", summary: p.contentSummary || "新建", updatedAt: formatNow() }],
      audits: [],
      exceptions: [],
    });
    pushAudit(created, "新建", "创建策略", created.approvalStatus === "dual" ? "待双人复核" : "待审批");
    policies.unshift(created);
    return { ok: true, item: clone(created) };
  }

  function setPolicyEnabled(id, enabled, opts) {
    const policy = policies.find((x) => String(x.id) === String(id));
    if (!policy) return { ok: false, message: "策略不存在" };
    const dual = requireDual(policy, opts);
    if (dual) return dual;
    policy.enabled = !!enabled;
    policy.updatedAt = formatNow();
    policy.updatedBy = "管理员";
    if (policy.approvalStatus === "dual") policy.approvalStatus = "approved";
    pushAudit(policy, enabled ? "启用" : "停用", enabled ? "策略已启用" : "策略已停用", "已通过");
    return { ok: true, item: clone(policy) };
  }

  function dispatchPolicy(id, opts) {
    const policy = policies.find((x) => String(x.id) === String(id));
    if (!policy) return { ok: false, message: "策略不存在" };
    const dual = requireDual(policy, opts);
    if (dual) return dual;
    policy.updatedAt = formatNow();
    policy.updatedBy = "管理员";
    if (policy.approvalStatus === "dual" || policy.approvalStatus === "pending") policy.approvalStatus = "approved";
    pushAudit(policy, "下发", `按${effectModeLabel(policy.effectMode)}下发`, "已通过");
    return { ok: true, item: clone(policy) };
  }

  function rollbackPolicy(id, opts) {
    const policy = policies.find((x) => String(x.id) === String(id));
    if (!policy) return { ok: false, message: "策略不存在" };
    const dual = requireDual(policy, opts);
    if (dual) return dual;
    const versions = policy.versions || [];
    if (versions.length < 2) return { ok: false, message: "没有可回滚的历史版本" };
    const prev = versions[versions.length - 2];
    policy.version = prev.version;
    policy.contentSummary = prev.summary;
    policy.updatedAt = formatNow();
    policy.updatedBy = "管理员";
    pushAudit(policy, "回滚", `回滚到 ${prev.version}`, "已通过");
    return { ok: true, item: clone(policy) };
  }

  function addPolicyException(id, payload) {
    const policy = policies.find((x) => String(x.id) === String(id));
    if (!policy) return { ok: false, message: "策略不存在" };
    const p = payload || {};
    if (!p.scope || !p.reason || !p.validUntil || !p.approver) {
      return { ok: false, message: "请完整填写例外信息" };
    }
    policy.exceptions = policy.exceptions || [];
    policy.exceptions.unshift({
      scope: p.scope,
      reason: p.reason,
      validUntil: p.validUntil,
      approver: p.approver,
    });
    pushAudit(policy, "例外", `新增例外：${p.scope}`, `审批人 ${p.approver}`);
    return { ok: true, item: clone(policy) };
  }

  function listPolicyAudits(id) {
    const policy = policies.find((x) => String(x.id) === String(id));
    return policy ? clone(policy.audits || []) : [];
  }

  function policyMetrics() {
    return {
      total: policies.length,
      enabled: policies.filter((p) => p.enabled).length,
      pendingApproval: policies.filter((p) => p.approvalStatus === "pending").length,
      dualPending: policies.filter((p) => p.approvalStatus === "dual").length,
    };
  }

  function listLogs(filter) {
    const f = filter || {};
    return clone(
      logs.filter((row) => {
        if (f.type && row.type !== f.type) return false;
        if (f.asset && row.asset !== f.asset) return false;
        if (f.account && !String(row.account).includes(f.account)) return false;
        if (f.severity && row.severity !== f.severity) return false;
        if (f.source && row.source !== f.source) return false;
        if (f.handleStatus && row.handleStatus !== f.handleStatus) return false;
        if (f.dateFrom && row.time < f.dateFrom) return false;
        if (f.dateTo && row.time > `${f.dateTo} 23:59:59`) return false;
        if (f.keyword) {
          const kw = f.keyword.toLowerCase();
          const blob = `${row.summary} ${row.rawSummary} ${row.asset} ${row.account}`.toLowerCase();
          if (!blob.includes(kw)) return false;
        }
        return true;
      })
    );
  }

  function getLog(id) {
    const item = logs.find((x) => String(x.id) === String(id));
    return item ? clone(item) : null;
  }

  function markLogDone(id) {
    const item = logs.find((x) => String(x.id) === String(id));
    if (!item) return { ok: false, message: "日志不存在" };
    item.handleStatus = "done";
    return { ok: true, item: clone(item) };
  }

  function listLogAnomalies() {
    return clone(logAnomalies);
  }

  function logMetrics() {
    const todayCount = logs.filter((l) => String(l.time).startsWith(MOCK_TODAY)).length;
    const anomalyCount = logAnomalies.length;
    const criticalNoLog = logAnomalies.filter((a) => a.type === "关键资产无日志").length;
    const auditDisabled = logAnomalies.filter((a) => a.type === "审计策略未启用").length;
    return { todayCount, anomalyCount, criticalNoLog, auditDisabled };
  }

  const REPORT_PURPOSE = ["管理汇报", "监管检查", "内部审计"];

  function scaleByRange(range) {
    if (range === "24h") return 0.7;
    if (range === "30d") return 1.25;
    return 1;
  }

  function scaleByPurpose(purpose) {
    if (purpose === "监管检查") return 1.05;
    if (purpose === "内部审计") return 0.95;
    return 1;
  }

  function getComplianceReport(range, purpose) {
    const f = scaleByRange(range || "7d") * scaleByPurpose(purpose || "管理汇报");
    const n = (v) => Math.max(0, Math.round(v * f));
    const mlps = mlpsMetrics();
    const pol = policyMetrics();
    const logM = logMetrics();

    const kpis = [
      { label: "综合合规率", value: `${Math.min(99, Math.round(72 + f * 8))}%`, sub: "汇聚九类对象" },
      { label: "纳管资产", value: String(n(1286)), sub: "在线率 96%" },
      { label: "未闭环漏洞", value: String(n(47)), sub: "高危 12" },
      { label: "基线偏离", value: String(n(23)), sub: "待复核 6" },
      { label: "策略启用", value: String(pol.enabled), sub: `共 ${pol.total} 条` },
      { label: "整改闭环率", value: `${Math.min(98, Math.round(58 + f * 12))}%`, sub: `整改中 ${mlps.remediating}` },
    ];

    const radar = {
      indicators: [
        { name: "资产", max: 100 },
        { name: "漏洞", max: 100 },
        { name: "基线", max: 100 },
        { name: "日志", max: 100 },
        { name: "事件", max: 100 },
        { name: "策略", max: 100 },
        { name: "账号", max: 100 },
        { name: "数据安全", max: 100 },
        { name: "整改", max: 100 },
      ],
      values: [
        n(88),
        n(71),
        n(79),
        n(84),
        n(76),
        n(82),
        n(74),
        n(80),
        Math.min(100, Math.round((mlps.satisfied / Math.max(mlps.total, 1)) * 100)),
      ],
    };

    const domainBars = [
      { name: "资产", value: n(88) },
      { name: "漏洞", value: n(71) },
      { name: "基线", value: n(79) },
      { name: "日志", value: n(84) },
      { name: "事件", value: n(76) },
      { name: "策略", value: n(82) },
      { name: "账号", value: n(74) },
      { name: "数据安全", value: n(80) },
      { name: "整改", value: Math.min(100, Math.round((mlps.satisfied / Math.max(mlps.total, 1)) * 100)) },
    ];

    const checkStatusPie = [
      { name: "满足", value: mlps.satisfied },
      { name: "部分满足", value: checkItems.filter((x) => x.status === "partial").length },
      { name: "不满足", value: mlps.unsatisfied },
      { name: "不适用", value: checkItems.filter((x) => x.status === "na").length },
    ];

    const remediationPie = [
      { name: "待整改", value: checkItems.filter((x) => x.remediationStatus === "pending").length },
      { name: "整改中", value: checkItems.filter((x) => x.remediationStatus === "doing").length },
      { name: "待复核", value: checkItems.filter((x) => x.remediationStatus === "review").length },
      { name: "已闭环", value: checkItems.filter((x) => x.remediationStatus === "done").length },
    ];

    const labels7 = range === "24h"
      ? ["00", "04", "08", "12", "16", "20"]
      : range === "30d"
        ? ["W1", "W2", "W3", "W4"]
        : ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

    const trend = {
      labels: labels7,
      score: labels7.map((_, i) => Math.min(99, Math.round(68 + i * 2 * f + (i % 2) * 3))),
      events: labels7.map((_, i) => n(12 + i * 3)),
      logs: labels7.map((_, i) => n(820 + i * 40)),
    };

    const assetRisk = [
      { name: "高危", value: n(18) },
      { name: "中危", value: n(56) },
      { name: "低危", value: n(142) },
      { name: "正常", value: n(1070) },
    ];

    const vulnFunnel = [
      { name: "发现", value: n(126) },
      { name: "确认", value: n(98) },
      { name: "修复中", value: n(51) },
      { name: "已复测", value: n(39) },
    ];

    const baselineBars = [
      { name: "主机", pass: n(210), fail: n(18) },
      { name: "网络", pass: n(86), fail: n(9) },
      { name: "数据库", pass: n(42), fail: n(7) },
      { name: "中间件", pass: n(55), fail: n(6) },
    ];

    const logHealth = [
      { name: "正常采集", value: n(92) },
      { name: "采集异常", value: logM.anomalyCount },
      { name: "关键无日志", value: logM.criticalNoLog },
      { name: "策略未启用", value: logM.auditDisabled },
    ];

    const eventLevel = [
      { name: "严重", value: n(6) },
      { name: "高", value: n(14) },
      { name: "中", value: n(31) },
      { name: "低", value: n(48) },
    ];

    const policyTypeBars = POLICY_TYPES.map((t, i) => ({
      name: t,
      value: policies.filter((p) => p.type === t).length || (i % 3 === 0 ? 1 : 0),
    }));

    const accountRisk = [
      { name: "特权未双因子", value: n(9) },
      { name: "长期未登录", value: n(21) },
      { name: "权限过大", value: n(14) },
      { name: "共享账号", value: n(5) },
    ];

    const dataSec = [
      { name: "已分级", value: n(68) },
      { name: "流转风险", value: n(17) },
      { name: "外发阻断", value: n(11) },
      { name: "审计覆盖", value: n(81) },
    ];

    const mlpsClassBars = SECURITY_CLASS.map((name, i) => {
      const items = checkItems.filter((x) => x.securityClass === name);
      const scored = items.filter((x) => x.score != null);
      const avg = scored.length
        ? Math.round(scored.reduce((s, x) => s + Number(x.score), 0) / scored.length)
        : n(70 + i * 3);
      return { name: name.replace(/^安全/, ""), value: Math.min(100, Math.round(avg * (0.95 + (f - 1) * 0.2))) };
    });

    const evidenceReady = [
      { name: "制度材料", value: n(86) },
      { name: "配置截图", value: n(78) },
      { name: "日志留存", value: n(91) },
      { name: "整改证明", value: n(72) },
      { name: "审批记录", value: n(84) },
    ];

    const snapshots = [
      {
        id: "CR-001",
        name: `${purpose || "管理汇报"}-合规周报`,
        purpose: purpose || "管理汇报",
        range: range || "7d",
        score: Math.min(99, Math.round(72 + f * 8)),
        owner: "安全部",
        generatedAt: `${MOCK_TODAY} 09:30:00`,
        status: "已生成",
        summary: "汇聚资产/漏洞/基线/日志/事件/策略/账号/数据安全/整改九维结果",
      },
      {
        id: "CR-002",
        name: "监管迎检材料包",
        purpose: "监管检查",
        range: "30d",
        score: 81,
        owner: "信息中心",
        generatedAt: "2026-10-28 16:20:00",
        status: "已归档",
        summary: "含等保检查项证据索引与整改台账",
      },
      {
        id: "CR-003",
        name: "内部审计抽查报表",
        purpose: "内部审计",
        range: "7d",
        score: 76,
        owner: "审计部",
        generatedAt: "2026-10-25 11:05:00",
        status: "已生成",
        summary: "聚焦账号特权、策略审批与日志留存",
      },
    ];

    return {
      kpis,
      radar,
      domainBars,
      checkStatusPie,
      remediationPie,
      trend,
      assetRisk,
      vulnFunnel,
      baselineBars,
      logHealth,
      eventLevel,
      policyTypeBars,
      accountRisk,
      dataSec,
      mlpsClassBars,
      evidenceReady,
      snapshots,
      purpose: purpose || "管理汇报",
      range: range || "7d",
    };
  }

  window.Compliance = {
    REPORT_PURPOSE,
    SECURITY_CLASS,
    CHECK_STATUS,
    POLICY_TYPES,
    LOG_TYPES,
    ANOMALY_TYPES,
    EFFECT_LABEL,
    meta,
    listBatches,
    listCheckItems,
    getCheckItem,
    assessCheckItem,
    createRemediation,
    runSelfAssessment,
    mlpsMetrics,
    listPolicyTemplates,
    listPolicies,
    getPolicy,
    savePolicy,
    setPolicyEnabled,
    dispatchPolicy,
    rollbackPolicy,
    addPolicyException,
    listPolicyAudits,
    policyMetrics,
    listLogs,
    getLog,
    markLogDone,
    listLogAnomalies,
    logMetrics,
    getComplianceReport,
    checkStatusTag,
    remediationTag,
    policyEnabledTag,
    approvalTag,
    severityTag,
    handleTag,
    effectModeLabel,
  };
})();
