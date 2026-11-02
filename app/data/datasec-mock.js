(function () {
  const MOCK_TODAY = "2026-11-01";
  const LEVEL_META = {
    general: { label: "一般", tagClass: "" },
    important: { label: "重要", tagClass: "warning" },
    core: { label: "核心", tagClass: "danger" },
  };
  const SCOPE_META = {
    internal: { label: "内部", tagClass: "" },
    limited: { label: "受限共享", tagClass: "warning" },
    public: { label: "可公开", tagClass: "success" },
  };
  const CATALOG_META = {
    draft: { label: "草稿", tagClass: "warning" },
    filed: { label: "已备案", tagClass: "success" },
    updated: { label: "已更新", tagClass: "" },
  };
  const CONCLUSION_META = {
    low: { label: "低风险", tagClass: "success" },
    medium: { label: "中风险", tagClass: "warning" },
    high: { label: "高风险", tagClass: "danger" },
  };
  const PROTECT_META = {
    none: { label: "未覆盖", tagClass: "danger" },
    partial: { label: "部分", tagClass: "warning" },
    full: { label: "已覆盖", tagClass: "success" },
  };
  const RISK_TYPE_LABEL = {
    over_collect: "过度收集",
    face_abuse: "滥用人脸",
    privacy_leak: "隐私泄露",
    illegal_publish: "违规发布",
    abnormal_access: "异常访问",
    exfil: "异常外传",
  };
  const SEVERITY_META = {
    low: { label: "低", tagClass: "" },
    medium: { label: "中", tagClass: "warning" },
    high: { label: "高", tagClass: "danger" },
    critical: { label: "严重", tagClass: "danger" },
  };
  const EVENT_STATUS_META = {
    pending: { label: "待研判", tagClass: "warning" },
    confirmed: { label: "待整改", tagClass: "danger" },
    false_positive: { label: "误报", tagClass: "" },
    fixing: { label: "整改中", tagClass: "warning" },
    fixed: { label: "已修复", tagClass: "success" },
  };

  function pad(n) { return String(n).padStart(2, "0"); }
  function formatNow(d) {
    const x = d || new Date();
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())} ${pad(x.getHours())}:${pad(x.getMinutes())}:${pad(x.getSeconds())}`;
  }
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function metaTag(map, v) { return map[v] ? { ...map[v] } : { label: v || "-", tagClass: "" }; }
  function levelTag(v) { return metaTag(LEVEL_META, v); }
  function scopeTag(v) { return metaTag(SCOPE_META, v); }
  function catalogTag(v) { return metaTag(CATALOG_META, v); }
  function conclusionTag(v) { return metaTag(CONCLUSION_META, v); }
  function protectTag(v) { return metaTag(PROTECT_META, v); }
  function severityTag(v) { return metaTag(SEVERITY_META, v); }
  function eventStatusTag(v) { return metaTag(EVENT_STATUS_META, v); }
  function riskTypeLabel(v) { return RISK_TYPE_LABEL[v] || v || "-"; }
  function paginate(list, page, pageSize) {
    const p = Math.max(1, Number(page) || 1);
    const size = Math.max(1, Number(pageSize) || 10);
    const start = (p - 1) * size;
    return { total: list.length, page: p, pageSize: size, list: list.slice(start, start + size).map(clone) };
  }
  function nextId(prefix, list) {
    return `${prefix}-${String(list.length + 1).padStart(3, "0")}-${Date.now().toString(36).slice(-4)}`;
  }

  let assets = [
    { id: "DA-001", name: "自然人基础身份库", system: "一网通办", category: "身份信息", level: "core", openScope: "internal", owner: "张敏", dept: "政务服务中心", catalogStatus: "filed", filingNo: "FL-2025-0018", filingNote: "核心身份库已完成目录备案", businessAttr: "实名核验与办事材料关联", scene: "窗口办件 / 线上申报", needsRegrade: false, gradedAt: "2026-08-12 10:20:00", changeLogs: [{ at: "2026-05-10 09:00:00", from: "important", to: "core", reason: "纳入全市人口主数据", operator: "张敏" }, { at: "2026-08-12 10:20:00", from: "core", to: "core", reason: "年度复核保持核心", operator: "张敏" }] },
    { id: "DA-002", name: "社保缴费明细库", system: "人社业务系统", category: "业务流水", level: "important", openScope: "limited", owner: "李华", dept: "人力资源和社会保障局", catalogStatus: "filed", filingNo: "FL-2025-0042", filingNote: "跨部门共享需审批", businessAttr: "缴费核定与待遇计发", scene: "经办审核 / 部门共享", needsRegrade: false, gradedAt: "2026-09-01 14:10:00", changeLogs: [{ at: "2026-09-01 14:10:00", from: "general", to: "important", reason: "含个人缴费敏感字段", operator: "李华" }] },
    { id: "DA-003", name: "电子证照共享目录", system: "一网通办", category: "证照信息", level: "important", openScope: "limited", owner: "王倩", dept: "政务服务中心", catalogStatus: "updated", filingNo: "FL-2025-0060", filingNote: "公开范围拟扩大", businessAttr: "证照核验与亮证", scene: "跨部门调用 / 企业授权查询", needsRegrade: true, gradedAt: "2026-07-20 11:00:00", changeLogs: [{ at: "2026-07-20 11:00:00", from: "general", to: "important", reason: "增加人脸比对关联字段", operator: "王倩" }] },
    { id: "DA-004", name: "医院就诊挂号流水", system: "卫健平台", category: "健康医疗", level: "important", openScope: "internal", owner: "赵磊", dept: "卫生健康委", catalogStatus: "filed", filingNo: "FL-2025-0088", filingNote: "", businessAttr: "就诊预约与排班", scene: "院内系统 / 区域平台", needsRegrade: false, gradedAt: "2026-06-18 16:40:00", changeLogs: [] },
    { id: "DA-005", name: "公安人口轨迹研判集", system: "公安大数据", category: "行踪轨迹", level: "core", openScope: "internal", owner: "陈刚", dept: "公安局网安支队", catalogStatus: "filed", filingNo: "FL-2025-0101", filingNote: "仅授权研判席位访问", businessAttr: "治安研判", scene: "专网分析席", needsRegrade: false, gradedAt: "2026-04-02 09:30:00", changeLogs: [{ at: "2026-04-02 09:30:00", from: "important", to: "core", reason: "含高精度行踪", operator: "陈刚" }] },
    { id: "DA-006", name: "政务云运维日志归档", system: "政务云", category: "运维日志", level: "general", openScope: "internal", owner: "周凯", dept: "信息中心", catalogStatus: "filed", filingNo: "FL-2025-0120", filingNote: "脱敏后可内部共享", businessAttr: "故障溯源", scene: "运维排障", needsRegrade: false, gradedAt: "2026-10-05 10:00:00", changeLogs: [] },
    { id: "DA-007", name: "不动产登记权利人信息", system: "不动产登记系统", category: "财产信息", level: "core", openScope: "internal", owner: "孙悦", dept: "自然资源局", catalogStatus: "updated", filingNo: "FL-2025-0133", filingNote: "新增金融核验场景", businessAttr: "权属登记与查询", scene: "窗口查询 / 金融核验（新增）", needsRegrade: true, gradedAt: "2026-05-22 15:20:00", changeLogs: [{ at: "2026-05-22 15:20:00", from: "important", to: "core", reason: "权利人敏感属性扩展", operator: "孙悦" }] },
    { id: "DA-008", name: "公开政策文件库", system: "一网通办", category: "政策文件", level: "general", openScope: "public", owner: "吴婷", dept: "办公室", catalogStatus: "filed", filingNo: "FL-2025-0150", filingNote: "主动公开类", businessAttr: "政策发布", scene: "门户网站", needsRegrade: false, gradedAt: "2026-03-11 09:00:00", changeLogs: [] },
    { id: "DA-009", name: "企业信用评价明细", system: "市场监管平台", category: "信用信息", level: "important", openScope: "limited", owner: "郑浩", dept: "市场监管局", catalogStatus: "draft", filingNo: "", filingNote: "", businessAttr: "信用监管", scene: "部门共享 / 有限社会查询", needsRegrade: false, gradedAt: "2026-10-20 11:30:00", changeLogs: [] },
    { id: "DA-010", name: "视频卡口人脸特征库", system: "公安大数据", category: "生物特征", level: "core", openScope: "internal", owner: "马超", dept: "公安局科信支队", catalogStatus: "filed", filingNo: "FL-2025-0166", filingNote: "禁止对外共享", businessAttr: "治安防控比对", scene: "专网比对服务", needsRegrade: false, gradedAt: "2026-02-18 13:00:00", changeLogs: [{ at: "2026-02-18 13:00:00", from: "important", to: "core", reason: "生物识别特征", operator: "马超" }] },
    { id: "DA-011", name: "公积金缴存明细", system: "公积金中心系统", category: "业务流水", level: "important", openScope: "limited", owner: "刘洋", dept: "住房公积金中心", catalogStatus: "filed", filingNo: "FL-2025-0178", filingNote: "", businessAttr: "缴存提取业务", scene: "线上服务 / 银行核验", needsRegrade: false, gradedAt: "2026-09-28 09:45:00", changeLogs: [] },
    { id: "DA-012", name: "门户访问统计日汇总", system: "政务云", category: "统计分析", level: "general", openScope: "internal", owner: "周凯", dept: "信息中心", catalogStatus: "filed", filingNo: "FL-2025-0189", filingNote: "聚合后无个人标识", businessAttr: "运营分析", scene: "内部报表", needsRegrade: false, gradedAt: "2026-10-12 08:30:00", changeLogs: [] },
    { id: "DA-013", name: "教育考试成绩明细", system: "教育考试院系统", category: "教育信息", level: "important", openScope: "limited", owner: "何静", dept: "教育局", catalogStatus: "draft", filingNo: "", filingNote: "", businessAttr: "成绩管理与通知", scene: "考生查询 / 学校核验", needsRegrade: false, gradedAt: "2026-10-25 16:00:00", changeLogs: [] },
    { id: "DA-014", name: "应急指挥一张图图层", system: "应急指挥平台", category: "空间地理", level: "important", openScope: "internal", owner: "黄伟", dept: "应急管理局", catalogStatus: "filed", filingNo: "FL-2025-0201", filingNote: "", businessAttr: "应急调度", scene: "指挥大厅", needsRegrade: false, gradedAt: "2026-08-30 10:10:00", changeLogs: [] },
  ];

  let audits = [
    { id: "AU-001", name: "自然人身份库安全评估", assetId: "DA-001", level: "core", conclusion: "high", hazards: ["跨系统调用缺少字段级授权", "备份介质未强制加密", "运维账号共用"], requirements: "落实字段级授权、备份加密与运维双人复核", encrypt: "partial", mask: "partial", dlp: "none", protectNote: "库内敏感字段部分加密，导出通道未纳管", assessedAt: "2026-10-18 14:20:00" },
    { id: "AU-002", name: "社保缴费明细评估", assetId: "DA-002", level: "important", conclusion: "medium", hazards: ["接口日志含证件号明文", "脱敏规则未覆盖历史库"], requirements: "日志脱敏、历史库补脱敏任务", encrypt: "full", mask: "partial", dlp: "partial", protectNote: "", assessedAt: "2026-10-22 09:40:00" },
    { id: "AU-003", name: "电子证照共享评估", assetId: "DA-003", level: "important", conclusion: "medium", hazards: ["共享审批留痕不完整", "第三方调用频控偏弱"], requirements: "完善共享审批链与调用频控", encrypt: "full", mask: "full", dlp: "partial", protectNote: "", assessedAt: "2026-09-30 11:15:00" },
    { id: "AU-004", name: "就诊挂号流水评估", assetId: "DA-004", level: "important", conclusion: "low", hazards: ["测试环境曾同步生产样例"], requirements: "测试库去标识化并隔离", encrypt: "full", mask: "full", dlp: "full", protectNote: "防泄漏策略已覆盖外发通道", assessedAt: "2026-10-08 16:05:00" },
    { id: "AU-005", name: "人口轨迹研判集评估", assetId: "DA-005", level: "core", conclusion: "high", hazards: ["席位账号可批量导出", "水印策略未启用", "脱敏仅覆盖展示层"], requirements: "禁用批量导出、强制水印与导出审批", encrypt: "partial", mask: "none", dlp: "none", protectNote: "核心数据防护缺口较大", assessedAt: "2026-10-28 10:00:00" },
    { id: "AU-006", name: "不动产权利人信息评估", assetId: "DA-007", level: "core", conclusion: "medium", hazards: ["金融核验新场景未重评", "接口证书即将过期"], requirements: "新场景补充评估并轮换证书", encrypt: "full", mask: "partial", dlp: "partial", protectNote: "", assessedAt: "2026-10-15 13:25:00" },
    { id: "AU-007", name: "人脸特征库评估", assetId: "DA-010", level: "core", conclusion: "high", hazards: ["比对接口缺少用途声明校验", "特征库访问审计粒度粗"], requirements: "用途声明强制校验与细粒度审计", encrypt: "full", mask: "none", dlp: "partial", protectNote: "生物特征不可逆脱敏，需靠访问控制", assessedAt: "2026-10-26 09:10:00" },
    { id: "AU-008", name: "公积金缴存明细评估", assetId: "DA-011", level: "important", conclusion: "low", hazards: ["银行核验通道偶发明文回传"], requirements: "核验回传全链路加密", encrypt: "full", mask: "full", dlp: "full", protectNote: "", assessedAt: "2026-10-12 15:50:00" },
    { id: "AU-009", name: "企业信用评价明细评估", assetId: "DA-009", level: "important", conclusion: "medium", hazards: ["目录尚未备案", "导出未加水印"], requirements: "完成备案并启用导出水印", encrypt: "partial", mask: "partial", dlp: "none", protectNote: "", assessedAt: "2026-10-29 11:00:00" },
    { id: "AU-010", name: "教育考试成绩评估", assetId: "DA-013", level: "important", conclusion: "medium", hazards: ["成绩发布窗口存在批量爬取风险"], requirements: "加强发布接口防爬与验证码", encrypt: "full", mask: "partial", dlp: "partial", protectNote: "", assessedAt: "2026-10-30 17:20:00" },
  ];

  let events = [
    { id: "EV-001", detectedAt: "2026-11-01 08:12:33", riskType: "over_collect", summary: "办事表单采集非必要联系人手机号字段", system: "一网通办", subject: "app:gov-form-v3", severity: "medium", status: "pending", sourceHint: "", advice: "复核表单字段最小必要原则并下线冗余项", context: { account: "svc_form", path: "/api/form/submit", target: "formId=T-882" } },
    { id: "EV-002", detectedAt: "2026-11-01 09:05:10", riskType: "face_abuse", summary: "非授权业务调用人脸比对接口超阈值", system: "公安大数据", subject: "user:ops_temp01", severity: "high", status: "confirmed", sourceHint: "临时运维账号绑定了比对角色", advice: "回收角色并启用用途声明校验", context: { account: "ops_temp01", path: "/face/match", target: "10.30.2.18", volume: "1200次/时" } },
    { id: "EV-003", detectedAt: "2026-11-01 09:40:22", riskType: "privacy_leak", summary: "社保接口响应日志写入证件号明文", system: "人社业务系统", subject: "app:si-gateway", severity: "high", status: "fixing", sourceHint: "日志组件未启用脱敏过滤器", advice: "上线日志脱敏规则并清理历史明文", context: { account: "si_logger", path: "/var/log/si/access.log", target: "log-store-02" } },
    { id: "EV-004", detectedAt: "2026-11-01 10:18:01", riskType: "illegal_publish", summary: "门户疑似发布含个人住址的办事截图", system: "一网通办", subject: "user:editor_wu", severity: "critical", status: "pending", sourceHint: "", advice: "下架内容并核查发布审批流", context: { account: "editor_wu", path: "/cms/article/4421", target: "portal-public" } },
    { id: "EV-005", detectedAt: "2026-11-01 11:02:44", riskType: "abnormal_access", summary: "深夜批量查询不动产权利人信息", system: "不动产登记系统", subject: "user:bank_chk_03", severity: "high", status: "confirmed", sourceHint: "金融核验账号偏离常规时段", advice: "限制夜间批量查询并二次认证", context: { account: "bank_chk_03", path: "/api/owner/query", volume: "860条" } },
    { id: "EV-006", detectedAt: "2026-11-01 11:35:18", riskType: "exfil", summary: "就诊流水导出至非授信终端", system: "卫健平台", subject: "user:hosp_stat", severity: "critical", status: "fixing", sourceHint: "统计终端未加入 DLP 策略组", advice: "阻断外发并补全终端策略", context: { account: "hosp_stat", path: "C:/export/visit_oct.xlsx", target: "USB-未知" } },
    { id: "EV-007", detectedAt: "2026-11-01 12:10:05", riskType: "over_collect", summary: "小程序申请通讯录权限但业务未使用", system: "一网通办", subject: "app:mini-gov", severity: "low", status: "false_positive", sourceHint: "权限声明残留，实际未调用", advice: "清理权限声明即可", context: { account: "mini_gov", path: "scope=contact" } },
    { id: "EV-008", detectedAt: "2026-11-01 13:22:40", riskType: "privacy_leak", summary: "成绩查询接口可遍历考号返回姓名", system: "教育考试院系统", subject: "anon:public-api", severity: "high", status: "pending", sourceHint: "", advice: "增加验证码与频控，禁止遍历", context: { path: "/api/score/query", target: "public-edge" } },
    { id: "EV-009", detectedAt: "2026-11-01 14:05:55", riskType: "face_abuse", summary: "考勤场景外调用人脸识别门禁接口", system: "政务云", subject: "app:attendance-x", severity: "medium", status: "fixed", sourceHint: "业务方误配生产比对地址", advice: "已切回本地特征库并复核配置", context: { account: "svc_att", path: "/face/attendance", target: "face-core" } },
    { id: "EV-010", detectedAt: "2026-11-01 14:48:12", riskType: "abnormal_access", summary: "跨区域账号访问轨迹研判集", system: "公安大数据", subject: "user:analyst_b2", severity: "medium", status: "pending", sourceHint: "", advice: "核验席位授权与来源 IP", context: { account: "analyst_b2", path: "/trail/query", target: "10.88.1.20" } },
    { id: "EV-011", detectedAt: "2026-11-01 15:16:30", riskType: "illegal_publish", summary: "工作群传播含患者姓名的截图", system: "卫健平台", subject: "user:nurse_li", severity: "high", status: "confirmed", sourceHint: "IM 外发未拦截", advice: "IM 通道纳入 DLP 并开展提醒培训", context: { account: "nurse_li", path: "im://corp-wechat", target: "群:病区沟通" } },
    { id: "EV-012", detectedAt: "2026-11-01 15:55:01", riskType: "exfil", summary: "公积金明细通过邮件附件外发", system: "公积金中心系统", subject: "user:clerk_yan", severity: "medium", status: "fixed", sourceHint: "个人邮箱误操作", advice: "已撤回并启用外发审批", context: { account: "clerk_yan", path: "mailto:personal@mail.com", volume: "1附件" } },
    { id: "EV-013", detectedAt: "2026-10-31 22:10:18", riskType: "abnormal_access", summary: "非工作时间拉取信用评价全量接口", system: "市场监管平台", subject: "app:credit-etl", severity: "medium", status: "false_positive", sourceHint: "夜间批处理任务", advice: "登记白名单作业窗口", context: { account: "etl_credit", path: "/api/credit/full", volume: "全量" } },
    { id: "EV-014", detectedAt: "2026-11-01 16:20:44", riskType: "privacy_leak", summary: "测试环境暴露生产样例身份证号", system: "人社业务系统", subject: "user:dev_qa", severity: "high", status: "fixing", sourceHint: "测试库同步未去标识", advice: "测试库重建并禁止生产直连", context: { account: "dev_qa", path: "jdbc://si-test", target: "si-test-db" } },
    { id: "EV-015", detectedAt: "2026-11-01 16:58:09", riskType: "over_collect", summary: "预约挂号要求上传手持证件照片", system: "卫健平台", subject: "app:appoint-h5", severity: "medium", status: "pending", sourceHint: "", advice: "改为证件 OCR 或核验码，取消照片采集", context: { path: "/h5/appoint/upload", target: "appoint-h5" } },
    { id: "EV-016", detectedAt: "2026-11-01 17:25:33", riskType: "exfil", summary: "身份库子集同步到未备案第三方", system: "一网通办", subject: "app:partner-sync", severity: "critical", status: "confirmed", sourceHint: "共享协议未更新备案", advice: "立即停用同步任务并补备案", context: { account: "svc_partner", path: "/sync/identity", target: "partner-api-07" } },
    { id: "EV-017", detectedAt: "2026-11-01 18:02:11", riskType: "face_abuse", summary: "营销活动页面嵌入人脸活体检测", system: "一网通办", subject: "app:campaign-x", severity: "medium", status: "pending", sourceHint: "", advice: "评估必要性，非必要即下线活体组件", context: { path: "/campaign/live", target: "cdn-face-sdk" } },
    { id: "EV-018", detectedAt: "2026-10-31 19:40:00", riskType: "illegal_publish", summary: "公开报表含未脱敏手机号中间位", system: "政务云", subject: "user:report_bot", severity: "low", status: "fixed", sourceHint: "脱敏规则漏配", advice: "已修补规则并重跑报表", context: { path: "/report/daily.html", target: "intranet-portal" } },
  ];

  function classifyMetrics() {
    return {
      total: assets.length,
      general: assets.filter((a) => a.level === "general").length,
      important: assets.filter((a) => a.level === "important").length,
      core: assets.filter((a) => a.level === "core").length,
      needsRegrade: assets.filter((a) => a.needsRegrade).length,
    };
  }
  function listSystems() { return [...new Set(assets.map((a) => a.system))].sort(); }
  function listAssets(filter) {
    const f = filter || {};
    let rows = assets.slice();
    if (f.level) rows = rows.filter((a) => a.level === f.level);
    if (f.system) rows = rows.filter((a) => a.system === f.system);
    if (f.openScope) rows = rows.filter((a) => a.openScope === f.openScope);
    if (f.needsRegrade === true || f.needsRegrade === "true") rows = rows.filter((a) => a.needsRegrade);
    if (f.keyword) {
      const k = String(f.keyword).trim().toLowerCase();
      rows = rows.filter((a) => [a.name, a.owner, a.dept, a.system, a.category].join("|").toLowerCase().includes(k));
    }
    return paginate(rows, f.page, f.pageSize || (f.page != null ? 10 : rows.length || 10));
  }
  function getAsset(id) { const row = assets.find((a) => a.id === id); return row ? clone(row) : null; }
  function createAsset(payload) {
    const p = payload || {};
    const row = {
      id: nextId("DA", assets), name: p.name || "未命名资产", system: p.system || "", category: p.category || "",
      level: p.level || "general", openScope: p.openScope || "internal", owner: p.owner || "", dept: p.dept || "",
      catalogStatus: "draft", filingNo: "", filingNote: "", businessAttr: p.businessAttr || "", scene: p.scene || "",
      needsRegrade: false, gradedAt: formatNow(), changeLogs: [],
    };
    assets.unshift(row);
    return clone(row);
  }
  function regradeAsset(id, payload) {
    const row = assets.find((a) => a.id === id);
    if (!row) return null;
    const p = payload || {};
    const from = row.level;
    if (p.level) row.level = p.level;
    if (p.openScope) row.openScope = p.openScope;
    if (p.businessAttr != null) row.businessAttr = p.businessAttr;
    if (p.scene != null) row.scene = p.scene;
    row.needsRegrade = false;
    row.gradedAt = formatNow();
    if (row.catalogStatus === "filed") row.catalogStatus = "updated";
    row.changeLogs = row.changeLogs || [];
    row.changeLogs.unshift({ at: row.gradedAt, from, to: row.level, reason: p.reason || "重新定级", operator: p.operator || "当前用户" });
    return clone(row);
  }
  function fileCatalog(id, payload) {
    const row = assets.find((a) => a.id === id);
    if (!row) return null;
    const p = payload || {};
    row.filingNo = p.filingNo || row.filingNo || "";
    if (p.filingNote != null) row.filingNote = p.filingNote;
    row.catalogStatus = "filed";
    return clone(row);
  }
  function getAssetName(assetId) { const row = assets.find((a) => a.id === assetId); return row ? row.name : "-"; }
  function rateOf(field) {
    if (!audits.length) return 0;
    return Math.round((audits.filter((a) => a[field] === "full").length / audits.length) * 100);
  }
  function auditMetrics() {
    return {
      total: audits.length,
      highRisk: audits.filter((a) => a.conclusion === "high").length,
      encryptRate: rateOf("encrypt"),
      maskRate: rateOf("mask"),
      dlpCount: audits.filter((a) => a.dlp !== "none").length,
    };
  }
  function listAudits(filter) {
    const f = filter || {};
    let rows = audits.slice();
    if (f.level) rows = rows.filter((a) => a.level === f.level);
    if (f.conclusion) rows = rows.filter((a) => a.conclusion === f.conclusion);
    if (f.protectGap === "encrypt" || f.protectGap === "mask" || f.protectGap === "dlp") {
      rows = rows.filter((a) => a[f.protectGap] !== "full");
    }
    if (f.keyword) {
      const k = String(f.keyword).trim().toLowerCase();
      rows = rows.filter((a) => [a.name, getAssetName(a.assetId), (a.hazards || []).join("|")].join("|").toLowerCase().includes(k));
    }
    return paginate(rows, f.page, f.pageSize || (f.page != null ? 10 : rows.length || 10));
  }
  function getAudit(id) { const row = audits.find((a) => a.id === id); return row ? clone(row) : null; }
  function createAudit(payload) {
    const p = payload || {};
    const asset = assets.find((a) => a.id === p.assetId);
    const hazards = Array.isArray(p.hazards) ? p.hazards.slice() : String(p.hazards || "").split(/\n+/).map((s) => s.trim()).filter(Boolean);
    const row = {
      id: nextId("AU", audits), name: p.name || "未命名评估", assetId: p.assetId || "",
      level: p.level || (asset ? asset.level : "important"), conclusion: p.conclusion || "medium",
      hazards, requirements: p.requirements || "", encrypt: p.encrypt || "none", mask: p.mask || "none",
      dlp: p.dlp || "none", protectNote: p.protectNote || "", assessedAt: formatNow(),
    };
    audits.unshift(row);
    return clone(row);
  }
  function updateAudit(id, payload) {
    const row = audits.find((a) => a.id === id);
    if (!row) return null;
    const p = payload || {};
    if (p.conclusion) row.conclusion = p.conclusion;
    if (p.hazards != null) {
      row.hazards = Array.isArray(p.hazards) ? p.hazards.slice() : String(p.hazards).split(/\n+/).map((s) => s.trim()).filter(Boolean);
    }
    if (p.requirements != null) row.requirements = p.requirements;
    row.assessedAt = formatNow();
    return clone(row);
  }
  function setProtection(id, payload) {
    const row = audits.find((a) => a.id === id);
    if (!row) return null;
    const p = payload || {};
    if (p.encrypt) row.encrypt = p.encrypt;
    if (p.mask) row.mask = p.mask;
    if (p.dlp) row.dlp = p.dlp;
    if (p.protectNote != null) row.protectNote = p.protectNote;
    return clone(row);
  }
  function situationMetrics() {
    return {
      today: events.filter((e) => String(e.detectedAt).startsWith(MOCK_TODAY)).length,
      pending: events.filter((e) => e.status === "pending").length,
      sourced: events.filter((e) => ["confirmed", "fixing", "fixed"].includes(e.status)).length,
      fixed: events.filter((e) => e.status === "fixed").length,
    };
  }
  function situationCharts() {
    const byType = Object.keys(RISK_TYPE_LABEL).map((key) => ({
      key, label: RISK_TYPE_LABEL[key], count: events.filter((e) => e.riskType === key).length,
    }));
    const trend24h = [];
    for (let h = 0; h < 24; h += 1) {
      const hour = pad(h);
      const count = events.filter((e) => {
        const m = String(e.detectedAt).match(/\s(\d{2}):/);
        return m && m[1] === hour;
      }).length;
      trend24h.push({ hour, count });
    }
    return { byType, trend24h };
  }
  function listEvents(filter) {
    const f = filter || {};
    let rows = events.slice();
    if (f.riskType) rows = rows.filter((e) => e.riskType === f.riskType);
    if (f.severity) rows = rows.filter((e) => e.severity === f.severity);
    if (f.status) rows = rows.filter((e) => e.status === f.status);
    if (f.dateFrom) rows = rows.filter((e) => String(e.detectedAt).slice(0, 10) >= f.dateFrom);
    if (f.dateTo) rows = rows.filter((e) => String(e.detectedAt).slice(0, 10) <= f.dateTo);
    if (f.keyword) {
      const k = String(f.keyword).trim().toLowerCase();
      rows = rows.filter((e) => [e.summary, e.system, e.subject].join("|").toLowerCase().includes(k));
    }
    rows.sort((a, b) => String(b.detectedAt).localeCompare(String(a.detectedAt)));
    return paginate(rows, f.page, f.pageSize || (f.page != null ? 10 : rows.length || 10));
  }
  function getEvent(id) { const row = events.find((e) => e.id === id); return row ? clone(row) : null; }
  function handleEvent(id, payload) {
    const row = events.find((e) => e.id === id);
    if (!row) return null;
    const p = payload || {};
    if (p.sourceHint != null) row.sourceHint = p.sourceHint;
    if (p.advice != null) row.advice = p.advice;
    if (p.verdict === "false_positive") row.status = "false_positive";
    else if (p.verdict === "confirm") {
      row.status = p.status === "fixing" || p.status === "fixed" || p.status === "confirmed" ? p.status : "confirmed";
    } else if (p.status) row.status = p.status;
    return clone(row);
  }

  window.DataSec = {
    MOCK_TODAY, RISK_TYPE_LABEL,
    levelTag, scopeTag, catalogTag, conclusionTag, protectTag, severityTag, eventStatusTag, riskTypeLabel,
    classifyMetrics, listAssets, getAsset, createAsset, regradeAsset, fileCatalog, listSystems,
    auditMetrics, listAudits, getAudit, createAudit, updateAudit, setProtection, getAssetName,
    situationMetrics, situationCharts, listEvents, getEvent, handleEvent,
  };
})();
