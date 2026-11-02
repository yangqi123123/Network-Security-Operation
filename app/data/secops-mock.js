(function () {
  const meta = {
    threatTypes: ["恶意软件", "钓鱼", "漏洞利用", "内网渗透", "数据泄露", "拒绝服务"],
    stages: ["侦察", "武器化", "投递", "利用", "安装", "命令控制", "行动"],
    assetTypes: ["终端", "服务器", "网络设备", "数据库", "中间件", "安全设备", "云资源"],
    actions: ["隔离", "封禁IP", "重置凭据", "打补丁", "加固基线", "取证", "通报"],
    industries: ["政务", "金融", "能源", "医疗", "教育"],
    compliance: ["等保2.0", "密评", "数据安全法", "个人信息保护法"],
    knowledgeTypes: ["事件处置", "漏洞修复", "攻击样本", "威胁情报", "合规条款", "策略模板", "演练复盘"],
    ticketTypes: ["告警处置", "漏洞整改", "配置不合规", "演练任务", "其他"],
    priorities: ["紧急", "高", "中", "低"],
    ticketStatuses: ["待派单", "处理中", "待复核", "已关闭", "已转派", "已升级"],
    checkResults: ["合规", "不合规", "例外"],
    remediates: ["待整改", "整改中", "待复核", "已闭环", "例外中"],
    severities: ["严重", "高", "中", "低"],
    drillScenes: ["热点漏洞", "钓鱼攻击", "勒索病毒", "Web入侵", "内网横向移动", "数据外泄"],
    drillStatuses: ["筹划中", "进行中", "复盘中", "已归档"],
    screenViews: [
      { key: "all", label: "全网" },
      { key: "dept", label: "部门" },
      { key: "biz", label: "业务系统" },
      { key: "region", label: "区域" },
      { key: "group", label: "资产组" },
      { key: "source", label: "数据源" },
    ],
  };

  const TAG_MAP = {
    knowledgeStatus: { 启用: "success", 停用: "danger" },
    ticketStatus: {
      待派单: "warning",
      处理中: "warning",
      待复核: "warning",
      已关闭: "success",
      已转派: "",
      已升级: "danger",
    },
    priority: { 紧急: "danger", 高: "warning", 中: "", 低: "success" },
    checkResult: { 合规: "success", 不合规: "danger", 例外: "warning" },
    remediate: {
      待整改: "warning",
      整改中: "warning",
      待复核: "warning",
      已闭环: "success",
      例外中: "warning",
    },
    severity: { 严重: "danger", 高: "warning", 中: "", 低: "success" },
    drillStatus: { 筹划中: "warning", 进行中: "warning", 复盘中: "warning", 已归档: "success" },
    alarmLevel: { 严重: "danger", 主要: "warning", 次要: "warning", 提示: "", 未知: "" },
  };

  function tagOf(kind, value) {
    const map = TAG_MAP[kind] || {};
    const tagClass = map[value];
    return { label: value == null || value === "" ? "-" : String(value), tagClass: tagClass == null ? "" : tagClass };
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function nowStr(d) {
    const x = d || new Date();
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())} ${pad(x.getHours())}:${pad(x.getMinutes())}:${pad(x.getSeconds())}`;
  }

  function nextId(list) {
    return list.reduce((m, i) => Math.max(m, Number(i.id) || 0), 0) + 1;
  }

  function matchKeyword(text, keyword) {
    if (!keyword) return true;
    return String(text || "").toLowerCase().includes(String(keyword).toLowerCase());
  }

  const knowledge = [
    {
      id: 1,
      title: "勒索病毒主机隔离与恢复",
      type: "事件处置",
      threatType: "恶意软件",
      stage: "行动",
      assetType: "服务器",
      cve: "-",
      action: "隔离",
      industry: "政务",
      compliance: "等保2.0",
      tags: ["勒索", "隔离", "备份恢复"],
      status: "启用",
      refCount: 28,
      updater: "李明",
      updatedAt: "2026-10-28 09:20:00",
      advice: "确认加密后缀与勒索信后立即断网隔离，保留内存镜像后清除持久化。",
      steps: "1. 断网隔离\n2. 采集样本与日志\n3. 查杀与补丁\n4. 从备份恢复\n5. 监控回连",
      impact: "可能导致业务文件不可用与横向扩散。",
      hardenCmd: "systemctl stop smbd\niptables -A INPUT -s <C2> -j DROP",
      commTemplate: "【事件通报】发现疑似勒索，已隔离主机 {host}，请业务确认影响范围。",
    },
    {
      id: 2,
      title: "Log4j 远程代码执行应急",
      type: "漏洞修复",
      threatType: "漏洞利用",
      stage: "利用",
      assetType: "中间件",
      cve: "CVE-2021-44228",
      action: "打补丁",
      industry: "金融",
      compliance: "等保2.0",
      tags: ["Log4j", "RCE"],
      status: "启用",
      refCount: 41,
      updater: "王芳",
      updatedAt: "2026-10-26 15:10:00",
      advice: "优先升级 Log4j 至安全版本，临时可用 JVM 参数禁用 lookup。",
      steps: "1. 资产排查\n2. 临时缓解\n3. 升级组件\n4. 复查外连",
      impact: "可导致远程代码执行与沦陷。",
      hardenCmd: "-Dlog4j2.formatMsgNoLookups=true",
      commTemplate: "【漏洞通报】请各系统负责人 24 小时内完成 Log4j 排查与修复。",
    },
    {
      id: 3,
      title: "钓鱼邮件研判清单",
      type: "事件处置",
      threatType: "钓鱼",
      stage: "投递",
      assetType: "终端",
      cve: "-",
      action: "取证",
      industry: "政务",
      compliance: "个人信息保护法",
      tags: ["钓鱼", "邮件"],
      status: "启用",
      refCount: 19,
      updater: "赵强",
      updatedAt: "2026-10-25 11:00:00",
      advice: "核对发件域、链接落地页与附件宏，阻断后通知收件人。",
      steps: "1. 隔离邮件\n2. 提取 IOC\n3. 全网检索\n4. 重置凭据",
      impact: "可能造成凭据泄露与后续入侵。",
      hardenCmd: "Get-MessageTrace -Subject '*急*' | Export-Csv ioc.csv",
      commTemplate: "请勿点击可疑链接，已发现钓鱼样本，主题：{subject}。",
    },
    {
      id: 4,
      title: "WebShell 排查步骤",
      type: "事件处置",
      threatType: "漏洞利用",
      stage: "安装",
      assetType: "服务器",
      cve: "-",
      action: "取证",
      industry: "教育",
      compliance: "等保2.0",
      tags: ["WebShell", "Web"],
      status: "启用",
      refCount: 33,
      updater: "陈晨",
      updatedAt: "2026-10-24 16:40:00",
      advice: "按目录哈希与异常进程定位 WebShell，清理后门并加固上传点。",
      steps: "1. 比对文件哈希\n2. 查异常进程/端口\n3. 清理后门\n4. 修复漏洞",
      impact: "可持续控制站点并拖库。",
      hardenCmd: "find /var/www -name '*.php' -mtime -3 -ls",
      commTemplate: "站点 {site} 发现 WebShell，已下线清理，请确认业务影响。",
    },
    {
      id: 5,
      title: "内网横向移动监测要点",
      type: "威胁情报",
      threatType: "内网渗透",
      stage: "命令控制",
      assetType: "网络设备",
      cve: "-",
      action: "封禁IP",
      industry: "能源",
      compliance: "等保2.0",
      tags: ["横向移动", "SMB"],
      status: "启用",
      refCount: 22,
      updater: "刘洋",
      updatedAt: "2026-10-23 10:05:00",
      advice: "关注非常规 SMB/RDP/WMI 源宿对与黄金票据特征。",
      steps: "1. 梳理特权账号\n2. 关联流量\n3. 隔离可疑主机\n4. 重置票据",
      impact: "可扩大沦陷面。",
      hardenCmd: "netsh advfirewall firewall add rule name=BlockSMB dir=in protocol=TCP localport=445 action=block",
      commTemplate: "检测到横向移动迹象，源 {src} → 宿 {dst}，请协同排查。",
    },
    {
      id: 6,
      title: "数据库弱口令加固模板",
      type: "策略模板",
      threatType: "漏洞利用",
      stage: "利用",
      assetType: "数据库",
      cve: "-",
      action: "加固基线",
      industry: "金融",
      compliance: "密评",
      tags: ["弱口令", "基线"],
      status: "启用",
      refCount: 15,
      updater: "周敏",
      updatedAt: "2026-10-22 14:30:00",
      advice: "禁用默认账户、强制复杂度与失败锁定。",
      steps: "1. 盘点账号\n2. 修改口令策略\n3. 关闭远程高危端口\n4. 复核",
      impact: "弱口令可导致拖库。",
      hardenCmd: "ALTER PROFILE DEFAULT LIMIT FAILED_LOGIN_ATTEMPTS 5;",
      commTemplate: "请在本周完成数据库口令策略加固并回传截图。",
    },
    {
      id: 7,
      title: "敏感数据外泄应急沟通",
      type: "事件处置",
      threatType: "数据泄露",
      stage: "行动",
      assetType: "云资源",
      cve: "-",
      action: "通报",
      industry: "医疗",
      compliance: "数据安全法",
      tags: ["外泄", "DLP"],
      status: "启用",
      refCount: 12,
      updater: "孙悦",
      updatedAt: "2026-10-21 09:50:00",
      advice: "先切断外发通道，评估泄露范围后按法规通报。",
      steps: "1. 阻断外发\n2. 评估范围\n3. 取证留存\n4. 合规通报",
      impact: "可能触发合规处罚与舆情。",
      hardenCmd: "aws s3api put-bucket-policy --bucket <name> --policy file://deny-public.json",
      commTemplate: "疑似敏感数据外泄，通道已阻断，评估报告将于 4 小时内出具。",
    },
    {
      id: 8,
      title: "等保测评常用条款摘录",
      type: "合规条款",
      threatType: "拒绝服务",
      stage: "侦察",
      assetType: "安全设备",
      cve: "-",
      action: "通报",
      industry: "政务",
      compliance: "等保2.0",
      tags: ["等保", "条款"],
      status: "启用",
      refCount: 9,
      updater: "马超",
      updatedAt: "2026-10-20 17:20:00",
      advice: "对照安全计算环境与通信网络条款落实基线。",
      steps: "1. 条款映射\n2. 差距分析\n3. 整改跟踪",
      impact: "不合规影响测评结论。",
      hardenCmd: "-",
      commTemplate: "请对照等保条款 {clause} 完成整改并上传证据。",
    },
    {
      id: 9,
      title: "Cobalt Strike beacon 样本特征",
      type: "攻击样本",
      threatType: "恶意软件",
      stage: "命令控制",
      assetType: "终端",
      cve: "-",
      action: "取证",
      industry: "金融",
      compliance: "等保2.0",
      tags: ["CS", "样本"],
      status: "启用",
      refCount: 27,
      updater: "郑凯",
      updatedAt: "2026-10-19 13:15:00",
      advice: "关注默认证书 JA3 与异常 DNS 隧道。",
      steps: "1. 提取样本\n2. 沙箱分析\n3. IOC 入库\n4. 全网狩猎",
      impact: "表明已建立 C2。",
      hardenCmd: "yara -r cobaltstrike.yar /",
      commTemplate: "检出 CS beacon，主机 {host} 已隔离。",
    },
    {
      id: 10,
      title: "红蓝对抗复盘：钓鱼专项",
      type: "演练复盘",
      threatType: "钓鱼",
      stage: "投递",
      assetType: "终端",
      cve: "-",
      action: "通报",
      industry: "政务",
      compliance: "等保2.0",
      tags: ["演练", "钓鱼"],
      status: "启用",
      refCount: 8,
      updater: "黄磊",
      updatedAt: "2026-10-18 18:00:00",
      advice: "将点击率与上报时延纳入常态培训指标。",
      steps: "1. 统计点击\n2. 梳理漏报\n3. 更新剧本\n4. 培训宣贯",
      impact: "人员意识不足会放大风险。",
      hardenCmd: "-",
      commTemplate: "本轮钓鱼演练点击率 {rate}%，请各部门组织复盘。",
    },
    {
      id: 11,
      title: "防火墙策略缺失排查",
      type: "策略模板",
      threatType: "内网渗透",
      stage: "侦察",
      assetType: "安全设备",
      cve: "-",
      action: "加固基线",
      industry: "能源",
      compliance: "等保2.0",
      tags: ["防火墙", "策略"],
      status: "停用",
      refCount: 5,
      updater: "吴婷",
      updatedAt: "2026-10-17 10:40:00",
      advice: "核对南北向与东西向默认放行规则。",
      steps: "1. 导出策略\n2. 识别 any-any\n3. 收敛\n4. 变更复核",
      impact: "过度放行导致横向无阻。",
      hardenCmd: "show running-config | include permit ip any any",
      commTemplate: "请在变更窗口收敛防火墙 any-any 策略。",
    },
    {
      id: 12,
      title: "DDoS 清洗联动流程",
      type: "事件处置",
      threatType: "拒绝服务",
      stage: "行动",
      assetType: "网络设备",
      cve: "-",
      action: "封禁IP",
      industry: "政务",
      compliance: "等保2.0",
      tags: ["DDoS", "清洗"],
      status: "启用",
      refCount: 14,
      updater: "徐涛",
      updatedAt: "2026-10-16 08:55:00",
      advice: "流量超阈后一键牵引至清洗中心并通知业务。",
      steps: "1. 确认超阈\n2. 牵引清洗\n3. 观察恢复\n4. 解除牵引",
      impact: "业务可用性下降。",
      hardenCmd: "bgp dampening / blackhole community",
      commTemplate: "正在对 {vip} 进行流量清洗，预计 15 分钟内恢复。",
    },
  ];

  const tickets = [
    { id: 1, no: "WO-20261028-001", title: "核心交换机高频告警处置", type: "告警处置", priority: "紧急", status: "处理中", handler: "张三", overdue: true, asset: "SW-CORE-A", vuln: "-", alarm: "ALM-9021", createdAt: "2026-10-28 08:10:00", related: ["资产:SW-CORE-A", "告警:ALM-9021"], attachments: ["syslog-snippet.txt"], satisfaction: null, retest: "" },
    { id: 2, no: "WO-20261028-002", title: "Log4j 资产整改跟踪", type: "漏洞整改", priority: "高", status: "待复核", handler: "李四", overdue: false, asset: "APP-WEB-03", vuln: "CVE-2021-44228", alarm: "-", createdAt: "2026-10-28 09:00:00", related: ["漏洞:CVE-2021-44228"], attachments: ["scan-report.pdf"], satisfaction: null, retest: "" },
    { id: 3, no: "WO-20261027-003", title: "数据库弱口令不合规", type: "配置不合规", priority: "高", status: "待派单", handler: "-", overdue: false, asset: "ORCL-RAC1", vuln: "-", alarm: "-", createdAt: "2026-10-27 16:20:00", related: ["基线:口令复杂度"], attachments: [], satisfaction: null, retest: "" },
    { id: 4, no: "WO-20261027-004", title: "钓鱼演练失陷终端处置", type: "演练任务", priority: "中", status: "已关闭", handler: "王五", overdue: false, asset: "PC-0812", vuln: "-", alarm: "ALM-7710", createdAt: "2026-10-27 11:05:00", related: ["演练:钓鱼专项"], attachments: ["screenshot.png"], satisfaction: 5, retest: "复测无回连" },
    { id: 5, no: "WO-20261026-005", title: "异常外联封禁", type: "告警处置", priority: "紧急", status: "已升级", handler: "赵六", overdue: true, asset: "SRV-FILE-02", vuln: "-", alarm: "ALM-6601", createdAt: "2026-10-26 21:40:00", related: ["告警:ALM-6601"], attachments: ["pcap.pcapng"], satisfaction: null, retest: "" },
    { id: 6, no: "WO-20261026-006", title: "云存储桶公开访问整改", type: "配置不合规", priority: "高", status: "已转派", handler: "钱七", overdue: false, asset: "oss-backup", vuln: "-", alarm: "-", createdAt: "2026-10-26 14:10:00", related: ["云资源:oss-backup"], attachments: [], satisfaction: null, retest: "" },
    { id: 7, no: "WO-20261025-007", title: "中间件未授权访问", type: "漏洞整改", priority: "中", status: "处理中", handler: "孙八", overdue: false, asset: "REDIS-01", vuln: "弱认证", alarm: "-", createdAt: "2026-10-25 10:30:00", related: ["漏洞:弱认证"], attachments: ["redis.conf.bak"], satisfaction: null, retest: "" },
    { id: 8, no: "WO-20261025-008", title: "终端杀软停用排查", type: "告警处置", priority: "中", status: "待派单", handler: "-", overdue: false, asset: "PC-1022", vuln: "-", alarm: "ALM-4412", createdAt: "2026-10-25 09:12:00", related: ["告警:ALM-4412"], attachments: [], satisfaction: null, retest: "" },
    { id: 9, no: "WO-20261024-009", title: "VPN 异常登录复核", type: "告警处置", priority: "高", status: "待复核", handler: "周九", overdue: false, asset: "VPN-GW", vuln: "-", alarm: "ALM-3309", createdAt: "2026-10-24 19:50:00", related: ["日志:VPN"], attachments: ["login.csv"], satisfaction: null, retest: "" },
    { id: 10, no: "WO-20261024-010", title: "横向移动狩猎任务", type: "演练任务", priority: "高", status: "处理中", handler: "吴十", overdue: false, asset: "AD-DC01", vuln: "-", alarm: "-", createdAt: "2026-10-24 15:00:00", related: ["演练:横向移动"], attachments: [], satisfaction: null, retest: "" },
    { id: 11, no: "WO-20261023-011", title: "防火墙策略 any-any 收敛", type: "配置不合规", priority: "中", status: "已关闭", handler: "郑一", overdue: false, asset: "FW-EDGE-1", vuln: "-", alarm: "-", createdAt: "2026-10-23 13:25:00", related: ["基线:策略收敛"], attachments: ["diff.txt"], satisfaction: 4, retest: "策略已收敛" },
    { id: 12, no: "WO-20261023-012", title: "邮件网关误拦申诉", type: "其他", priority: "低", status: "已关闭", handler: "冯二", overdue: false, asset: "MAIL-GW", vuln: "-", alarm: "-", createdAt: "2026-10-23 10:00:00", related: [], attachments: [], satisfaction: 3, retest: "白名单生效" },
    { id: 13, no: "WO-20261022-013", title: "勒索演练备份验证", type: "演练任务", priority: "中", status: "待派单", handler: "-", overdue: false, asset: "BAK-01", vuln: "-", alarm: "-", createdAt: "2026-10-22 16:40:00", related: ["演练:勒索"], attachments: [], satisfaction: null, retest: "" },
    { id: 14, no: "WO-20261022-014", title: "API 未鉴权接口修复", type: "漏洞整改", priority: "紧急", status: "处理中", handler: "陈三", overdue: true, asset: "API-GW", vuln: "未鉴权", alarm: "-", createdAt: "2026-10-22 11:20:00", related: ["漏洞:未鉴权"], attachments: ["api-list.xlsx"], satisfaction: null, retest: "" },
    { id: 15, no: "WO-20261021-015", title: "安全设备许可证到期", type: "其他", priority: "低", status: "待派单", handler: "-", overdue: false, asset: "IDS-01", vuln: "-", alarm: "ALM-1102", createdAt: "2026-10-21 09:05:00", related: ["告警:ALM-1102"], attachments: [], satisfaction: null, retest: "" },
  ];

  tickets.forEach((t) => {
    if (Array.isArray(t.history) && t.history.length) return;
    const hist = [{ time: t.createdAt, operator: "系统", action: `创建工单 ${t.no}` }];
    if (t.handler && t.handler !== "-" && t.status !== "待派单") {
      hist.push({ time: t.createdAt, operator: "系统", action: `派单给 ${t.handler}` });
    }
    if (t.status === "已转派") hist.push({ time: t.createdAt, operator: t.handler || "当前用户", action: `工单已转派至 ${t.handler}` });
    if (t.status === "已升级") hist.push({ time: t.createdAt, operator: "系统", action: "超时未闭环，催办升级至安全主管" });
    if (t.status === "待复核") hist.push({ time: t.createdAt, operator: t.handler || "当前用户", action: "提交复核，等待审批" });
    if (t.status === "已关闭") {
      hist.push({ time: t.createdAt, operator: t.handler || "当前用户", action: `复测关闭：${t.retest || "已闭环"}` });
      if (t.satisfaction != null) hist.push({ time: t.createdAt, operator: "评价人", action: `满意度 ${t.satisfaction} 星` });
    }
    if (t.status === "处理中") hist.push({ time: t.createdAt, operator: t.handler || "当前用户", action: "开始处理工单" });
    t.history = hist;
  });

  const orgDepts = [
    { id: "all", name: "全部人员", parent: null },
    { id: "soc", name: "网络安全运维中心", parent: null },
    { id: "ops", name: "安全运营组", parent: "soc" },
    { id: "threat", name: "威胁监测组", parent: "soc" },
    { id: "ir", name: "应急响应组", parent: "soc" },
    { id: "duty", name: "值班中心", parent: "soc" },
    { id: "net", name: "网络科", parent: "soc" },
    { id: "it", name: "信息中心", parent: "soc" },
  ];

  const orgPeople = [
    { id: "p1", name: "张三", phone: "13800001001", deptId: "ops", color: "#165dff" },
    { id: "p2", name: "李四", phone: "13800001002", deptId: "ops", color: "#0fc6c2" },
    { id: "p3", name: "王五", phone: "13800001003", deptId: "threat", color: "#722ed1" },
    { id: "p4", name: "赵六", phone: "13800001004", deptId: "threat", color: "#f77234" },
    { id: "p5", name: "钱七", phone: "13800001005", deptId: "ir", color: "#f53f3f" },
    { id: "p6", name: "孙八", phone: "13800001006", deptId: "ir", color: "#00b42a" },
    { id: "p7", name: "周九", phone: "13800001007", deptId: "duty", color: "#3491fa" },
    { id: "p8", name: "吴十", phone: "13800001008", deptId: "duty", color: "#f7ba1e" },
    { id: "p9", name: "郑一", phone: "13800001009", deptId: "net", color: "#eb0aa4" },
    { id: "p10", name: "陈三", phone: "13800001010", deptId: "net", color: "#7bc616" },
    { id: "p11", name: "安全主管", phone: "13800001011", deptId: "ops", color: "#0e42d2" },
    { id: "p12", name: "值班员", phone: "13800001012", deptId: "duty", color: "#d91ad9" },
    { id: "p13", name: "刘洋", phone: "13800001013", deptId: "it", color: "#14c9c9" },
  ];

  const HANDLER_POOL = orgPeople.map((p) => p.name);

  let autoDispatch = {
    enabled: true,
    matchBy: "priority",
    timeoutHours: 2,
    escalateTo: "安全主管",
    rules: [
      { id: 1, match: "紧急", handlers: ["张三", "李四"], enabled: true },
      { id: 2, match: "高", handlers: ["李四"], enabled: true },
      { id: 3, match: "中", handlers: ["王五", "赵六"], enabled: true },
      { id: 4, match: "低", handlers: ["赵六"], enabled: true },
    ],
  };

  const configs = [
    { id: 1, assetName: "SRV-WEB-01", ip: "10.1.1.11", assetType: "服务器", dept: "信息中心", baseline: "禁用不必要高危端口", result: "不合规", severity: "高", remediate: "待整改", checkedAt: "2026-10-28 08:00:00", beforeEvidence: "开放 23/TCP", afterEvidence: "-", exceptionReason: "", exceptionUntil: "", approver: "" },
    { id: 2, assetName: "ORCL-RAC1", ip: "10.1.2.20", assetType: "数据库", dept: "数据中心", baseline: "口令复杂度策略", result: "不合规", severity: "严重", remediate: "整改中", checkedAt: "2026-10-28 08:05:00", beforeEvidence: "无失败锁定", afterEvidence: "-", exceptionReason: "", exceptionUntil: "", approver: "" },
    { id: 3, assetName: "SW-CORE-A", ip: "10.1.0.1", assetType: "网络设备", dept: "网络科", baseline: "SNMP community 非默认", result: "合规", severity: "中", remediate: "已闭环", checkedAt: "2026-10-27 18:00:00", beforeEvidence: "public", afterEvidence: "已改为复杂串", exceptionReason: "", exceptionUntil: "", approver: "" },
    { id: 4, assetName: "PC-0812", ip: "10.2.3.88", assetType: "终端", dept: "行政部", baseline: "屏幕锁定 ≤5 分钟", result: "例外", severity: "低", remediate: "例外中", checkedAt: "2026-10-27 12:00:00", beforeEvidence: "15 分钟", afterEvidence: "-", exceptionReason: "大屏展示终端", exceptionUntil: "2026-12-31", approver: "王主管" },
    { id: 5, assetName: "REDIS-01", ip: "10.1.2.33", assetType: "中间件", dept: "研发部", baseline: "禁用未授权访问", result: "不合规", severity: "严重", remediate: "待复核", checkedAt: "2026-10-26 16:20:00", beforeEvidence: "bind 0.0.0.0 无密码", afterEvidence: "已加 requirepass", exceptionReason: "", exceptionUntil: "", approver: "" },
    { id: 6, assetName: "FW-EDGE-1", ip: "10.1.0.2", assetType: "安全设备", dept: "网络科", baseline: "禁止 any-any", result: "合规", severity: "高", remediate: "已闭环", checkedAt: "2026-10-26 10:00:00", beforeEvidence: "存在 any-any", afterEvidence: "已删除", exceptionReason: "", exceptionUntil: "", approver: "" },
    { id: 7, assetName: "VM-APP-09", ip: "10.3.1.19", assetType: "云资源", dept: "云平台", baseline: "安全组最小权限", result: "不合规", severity: "中", remediate: "待整改", checkedAt: "2026-10-25 09:30:00", beforeEvidence: "0.0.0.0/0:22", afterEvidence: "-", exceptionReason: "", exceptionUntil: "", approver: "" },
    { id: 8, assetName: "NGINX-02", ip: "10.1.1.22", assetType: "中间件", dept: "运维部", baseline: "关闭目录遍历", result: "合规", severity: "中", remediate: "已闭环", checkedAt: "2026-10-25 09:40:00", beforeEvidence: "autoindex on", afterEvidence: "autoindex off", exceptionReason: "", exceptionUntil: "", approver: "" },
    { id: 9, assetName: "PC-1022", ip: "10.2.4.12", assetType: "终端", dept: "财务部", baseline: "杀软实时防护开启", result: "不合规", severity: "高", remediate: "整改中", checkedAt: "2026-10-24 15:10:00", beforeEvidence: "防护关闭", afterEvidence: "-", exceptionReason: "", exceptionUntil: "", approver: "" },
    { id: 10, assetName: "MYSQL-03", ip: "10.1.2.45", assetType: "数据库", dept: "数据中心", baseline: "禁用来宾账户", result: "合规", severity: "中", remediate: "已闭环", checkedAt: "2026-10-24 11:00:00", beforeEvidence: "guest 存在", afterEvidence: "已删除", exceptionReason: "", exceptionUntil: "", approver: "" },
    { id: 11, assetName: "IDS-01", ip: "10.1.0.8", assetType: "安全设备", dept: "安全运营", baseline: "特征库更新时效", result: "不合规", severity: "中", remediate: "待整改", checkedAt: "2026-10-23 08:20:00", beforeEvidence: "滞后 30 天", afterEvidence: "-", exceptionReason: "", exceptionUntil: "", approver: "" },
    { id: 12, assetName: "K8S-NODE-2", ip: "10.4.0.12", assetType: "云资源", dept: "云平台", baseline: "禁止特权容器默认", result: "例外", severity: "高", remediate: "例外中", checkedAt: "2026-10-23 08:30:00", beforeEvidence: "allowPrivilegeEscalation", afterEvidence: "-", exceptionReason: "遗留监控探针", exceptionUntil: "2026-11-30", approver: "云平台负责人" },
    { id: 13, assetName: "SW-ACCESS-12", ip: "10.1.0.42", assetType: "网络设备", dept: "网络科", baseline: "禁用明文 TELNET", result: "合规", severity: "高", remediate: "已闭环", checkedAt: "2026-10-22 17:00:00", beforeEvidence: "telnet 启用", afterEvidence: "仅 SSH", exceptionReason: "", exceptionUntil: "", approver: "" },
    { id: 14, assetName: "SRV-FILE-02", ip: "10.1.1.55", assetType: "服务器", dept: "信息中心", baseline: "共享权限最小化", result: "不合规", severity: "严重", remediate: "待复核", checkedAt: "2026-10-22 14:00:00", beforeEvidence: "Everyone 完全控制", afterEvidence: "已改为指定组", exceptionReason: "", exceptionUntil: "", approver: "" },
    { id: 15, assetName: "TOMCAT-07", ip: "10.1.1.70", assetType: "中间件", dept: "研发部", baseline: "删除默认管理页", result: "合规", severity: "中", remediate: "已闭环", checkedAt: "2026-10-21 10:10:00", beforeEvidence: "manager 存在", afterEvidence: "已删除", exceptionReason: "", exceptionUntil: "", approver: "" },
    { id: 16, assetName: "PC-2201", ip: "10.2.5.21", assetType: "终端", dept: "人事部", baseline: "禁用不必要 USB", result: "不合规", severity: "低", remediate: "待整改", checkedAt: "2026-10-21 09:00:00", beforeEvidence: "USB 全开", afterEvidence: "-", exceptionReason: "", exceptionUntil: "", approver: "" },
  ];

  const drills = [
    { id: 1, name: "Log4j 热点漏洞专项", scene: "热点漏洞", status: "复盘中", redTeam: "红队A", blueTeam: "蓝队一室", owner: "李明", startAt: "2026-10-20 09:00:00", rulePacks: ["RCE-Log4j"], intelPacks: ["IOC-Log4j"], playbooks: ["漏洞应急剧本"], knowledgeIds: [2], settled: [] },
    { id: 2, name: "全员钓鱼演练 10 月", scene: "钓鱼攻击", status: "已归档", redTeam: "红队B", blueTeam: "安全运营", owner: "王芳", startAt: "2026-10-12 10:00:00", rulePacks: ["Mail-Phish"], intelPacks: ["Phish-Kit"], playbooks: ["钓鱼处置"], knowledgeIds: [3, 10], settled: ["培训案例", "响应剧本"] },
    { id: 3, name: "勒索重保值守演练", scene: "勒索病毒", status: "进行中", redTeam: "红队A", blueTeam: "重保小组", owner: "赵强", startAt: "2026-10-28 08:00:00", rulePacks: ["Ransom-Behavior"], intelPacks: ["Ransom-Note"], playbooks: ["勒索隔离"], knowledgeIds: [1], settled: [] },
    { id: 4, name: "Web 入侵攻防对抗", scene: "Web入侵", status: "筹划中", redTeam: "红队C", blueTeam: "应用安全", owner: "陈晨", startAt: "2026-11-05 09:00:00", rulePacks: [], intelPacks: [], playbooks: ["WebShell清理"], knowledgeIds: [4], settled: [] },
    { id: 5, name: "内网横向移动红蓝赛", scene: "内网横向移动", status: "进行中", redTeam: "红队B", blueTeam: "蓝队二室", owner: "刘洋", startAt: "2026-10-27 13:00:00", rulePacks: ["Lateral-SMB"], intelPacks: ["AD-Abuse"], playbooks: ["横向遏制"], knowledgeIds: [5], settled: [] },
    { id: 6, name: "数据外泄应急演练", scene: "数据外泄", status: "复盘中", redTeam: "红队C", blueTeam: "数据安全组", owner: "孙悦", startAt: "2026-10-15 14:00:00", rulePacks: ["DLP-Exfil"], intelPacks: ["Sensitive-Tag"], playbooks: ["外泄通报"], knowledgeIds: [7], settled: ["检测规则"] },
    { id: 7, name: "政务外网钓鱼突击", scene: "钓鱼攻击", status: "筹划中", redTeam: "红队A", blueTeam: "值班组", owner: "黄磊", startAt: "2026-11-10 09:30:00", rulePacks: [], intelPacks: ["Phish-Kit"], playbooks: [], knowledgeIds: [], settled: [] },
    { id: 8, name: "边界 DDoS 联防演练", scene: "热点漏洞", status: "已归档", redTeam: "外部支撑", blueTeam: "网络科", owner: "徐涛", startAt: "2026-09-28 09:00:00", rulePacks: ["DDoS-Threshold"], intelPacks: [], playbooks: ["清洗牵引"], knowledgeIds: [12], settled: ["配置基线", "响应剧本"] },
  ];

  function makeHeat(scale) {
    const y = ["服务器", "中间件", "数据库", "虚拟机", "PC", "交换机"];
    const x = ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "今日"];
    const data = [];
    for (let yi = 0; yi < y.length; yi++) {
      for (let xi = 0; xi < x.length; xi++) {
        data.push([xi, yi, Math.max(1, Math.round((3 + ((xi + yi * 2) % 7)) * scale))]);
      }
    }
    return { y, x, data };
  }

  function makeView(scale, labelPrefix) {
    const assetTotal = Math.round(1280 * scale);
    return {
      kpis: {
        assetTotal,
        onlineRate: Math.min(99, Math.round(92 + scale * 4)),
        highRisk: Math.round(48 * scale),
        vulnRisk: Math.round(126 * scale),
        sensitiveDist: Math.round(860 * scale),
        complianceScore: Math.min(98, Math.round(78 + scale * 12)),
        platformHealth: Math.min(100, Math.round(94 + scale * 4)),
      },
      health: {
        online: Math.min(100, Math.round(80 + scale * 10)),
        healthy: Math.min(100, Math.round(76 + scale * 12)),
        platform: Math.min(100, Math.round(90 + scale * 8)),
      },
      trend24h: {
        hours: ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"],
        counts: [4, 3, 2, 5, 12, 18, 22, 19, 15, 11, 8, 6].map((n) => Math.max(1, Math.round(n * scale))),
      },
      levels: [
        { name: "严重", value: Math.round(26 * scale), color: "#ff6d78" },
        { name: "主要", value: Math.round(18 * scale), color: "#f2a65a" },
        { name: "次要", value: Math.round(24 * scale), color: "#f2c75c" },
        { name: "提示", value: Math.round(17 * scale), color: "#37e7ff" },
        { name: "未知", value: Math.round(12 * scale), color: "#2e5a8f" },
      ],
      topRisk: [
        { name: `${labelPrefix}核心交换`, ip: "10.1.0.1", count: Math.round(42 * scale) },
        { name: `${labelPrefix}文件服务`, ip: "10.1.1.55", count: Math.round(36 * scale) },
        { name: `${labelPrefix}Web集群`, ip: "10.1.1.11", count: Math.round(28 * scale) },
        { name: `${labelPrefix}AD域控`, ip: "10.1.3.10", count: Math.round(21 * scale) },
        { name: `${labelPrefix}出口防火墙`, ip: "10.1.0.2", count: Math.round(17 * scale) },
      ],
      assetTypes: [
        { name: "服务器", value: Math.round(120 * scale) },
        { name: "交换机", value: Math.round(48 * scale) },
        { name: "终端", value: Math.round(520 * scale) },
        { name: "防火墙", value: Math.round(25 * scale) },
        { name: "数据库", value: Math.round(34 * scale) },
        { name: "其他", value: Math.round(80 * scale) },
      ],
      heat: makeHeat(scale),
      topology: {
        nodes: [
          { id: "inet", label: "互联网", kind: "zone" },
          { id: "att", label: "攻击源集群", kind: "attacker", risk: "高" },
          { id: "fw", label: "边界防护", kind: "zone" },
          { id: "core", label: `${labelPrefix}核心区`, kind: "core" },
          { id: "biz", label: "业务系统区", kind: "zone" },
          { id: "vic1", label: "受害-Web", kind: "victim", risk: "高" },
          { id: "vic2", label: "受害-DB", kind: "victim", risk: "中" },
          { id: "dmz", label: "DMZ", kind: "zone" },
        ],
        links: [
          { source: "att", target: "inet" },
          { source: "inet", target: "fw" },
          { source: "fw", target: "dmz" },
          { source: "fw", target: "core" },
          { source: "core", target: "biz" },
          { source: "dmz", target: "vic1" },
          { source: "biz", target: "vic2" },
        ],
      },
      events: [
        { net: `${labelPrefix}政务外网`, ip: "10.1.1.11", resource: "SRV-WEB-01", type: "Web攻击", level: "严重", value: "阻断", time: "2026-10-28 14:22:10", progress: "处理中" },
        { net: `${labelPrefix}核心网`, ip: "10.1.0.1", resource: "SW-CORE-A", type: "异常流量", level: "主要", value: "82%", time: "2026-10-28 14:18:03", progress: "待派单" },
        { net: `${labelPrefix}数据中心`, ip: "10.1.2.20", resource: "ORCL-RAC1", type: "违规访问", level: "严重", value: "3次", time: "2026-10-28 14:05:41", progress: "待复核" },
        { net: `${labelPrefix}办公网`, ip: "10.2.3.88", resource: "PC-0812", type: "钓鱼点击", level: "次要", value: "1", time: "2026-10-28 13:50:12", progress: "已关闭" },
        { net: `${labelPrefix}云平台`, ip: "10.4.0.12", resource: "K8S-NODE-2", type: "配置偏离", level: "提示", value: "基线", time: "2026-10-28 13:40:00", progress: "处理中" },
        { net: `${labelPrefix}分支`, ip: "10.8.1.5", resource: "FW-BR-3", type: "暴力破解", level: "主要", value: "126", time: "2026-10-28 13:22:55", progress: "已升级" },
        { net: `${labelPrefix}DMZ`, ip: "10.1.5.9", resource: "MAIL-GW", type: "恶意附件", level: "严重", value: "拦截", time: "2026-10-28 13:10:08", progress: "处理中" },
        { net: `${labelPrefix}存储区`, ip: "10.1.1.55", resource: "SRV-FILE-02", type: "敏感外发", level: "严重", value: "阻断", time: "2026-10-28 12:58:33", progress: "待复核" },
      ],
    };
  }

  const screen = {
    views: {
      all: makeView(1, ""),
      dept: makeView(0.28, "部门-"),
      biz: makeView(0.42, "业务-"),
      region: makeView(0.55, "区域-"),
      group: makeView(0.35, "资产组-"),
      source: makeView(0.48, "数据源-"),
    },
  };

  function listKnowledge(filter) {
    const f = filter || {};
    return knowledge.filter((item) => {
      if (f.type && item.type !== f.type) return false;
      if (f.threatType && item.threatType !== f.threatType) return false;
      if (f.stage && item.stage !== f.stage) return false;
      if (f.assetType && item.assetType !== f.assetType) return false;
      if (f.status && item.status !== f.status) return false;
      if (f.tag && !(item.tags || []).some((t) => t.includes(f.tag))) return false;
      if (f.keyword) {
        const blob = [item.title, item.cve, item.action, item.industry, item.compliance, ...(item.tags || [])].join(" ");
        if (!matchKeyword(blob, f.keyword)) return false;
      }
      return true;
    });
  }

  function getKnowledge(id) {
    return knowledge.find((x) => String(x.id) === String(id)) || null;
  }

  function saveKnowledge(payload) {
    const data = Object.assign({}, payload);
    if (!data.id) {
      data.id = nextId(knowledge);
      data.refCount = Number(data.refCount) || 0;
      data.tags = Array.isArray(data.tags) ? data.tags : String(data.tags || "").split(/[,，]/).map((s) => s.trim()).filter(Boolean);
      data.updatedAt = nowStr();
      knowledge.unshift(data);
      return data;
    }
    const idx = knowledge.findIndex((x) => String(x.id) === String(data.id));
    if (idx < 0) return null;
    data.tags = Array.isArray(data.tags) ? data.tags : String(data.tags || "").split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    data.updatedAt = nowStr();
    knowledge[idx] = Object.assign({}, knowledge[idx], data);
    return knowledge[idx];
  }

  function removeKnowledge(id) {
    const idx = knowledge.findIndex((x) => String(x.id) === String(id));
    if (idx < 0) return false;
    knowledge.splice(idx, 1);
    return true;
  }

  function listTickets(filter) {
    const f = filter || {};
    return tickets.filter((item) => {
      if (f.status && item.status !== f.status) return false;
      if (f.priority && item.priority !== f.priority) return false;
      if (f.type && item.type !== f.type) return false;
      if (f.handler && item.handler !== f.handler) return false;
      if (f.keyword) {
        const blob = [item.no, item.title, item.asset, item.vuln, item.alarm, item.handler].join(" ");
        if (!matchKeyword(blob, f.keyword)) return false;
      }
      return true;
    });
  }

  function getTicket(id) {
    return tickets.find((x) => String(x.id) === String(id)) || null;
  }

  function pushTicketHistory(item, action, operator) {
    if (!item) return;
    if (!Array.isArray(item.history)) item.history = [];
    item.history.push({
      time: nowStr(),
      operator: operator || "当前用户",
      action: action || "-",
    });
  }

  function createTicket(payload) {
    const d = new Date();
    const day = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const seq = pad(tickets.length + 1);
    const row = Object.assign(
      {
        id: nextId(tickets),
        no: `WO-${day}-${seq}`,
        title: "",
        type: "其他",
        priority: "中",
        status: "待派单",
        handler: "-",
        overdue: false,
        asset: "-",
        vuln: "-",
        alarm: "-",
        createdAt: nowStr(d),
        related: [],
        attachments: [],
        satisfaction: null,
        retest: "",
        history: [],
      },
      payload || {}
    );
    if (!row.status) row.status = "待派单";
    if (!Array.isArray(row.history)) row.history = [];
    if (!row.history.length) {
      row.history.push({ time: row.createdAt, operator: "系统", action: `创建工单 ${row.no}` });
      if (row.handler && row.handler !== "-") {
        row.history.push({ time: row.createdAt, operator: "当前用户", action: `派单给 ${row.handler}` });
      }
    }
    tickets.unshift(row);
    return row;
  }

  function updateTicket(id, patch, historyAction) {
    const item = getTicket(id);
    if (!item) return null;
    const p = patch || {};
    Object.assign(item, p);
    if (historyAction) {
      pushTicketHistory(item, historyAction, p.handler && p.handler !== "-" ? p.handler : "当前用户");
    } else if (p.status || p.handler || p.retest) {
      const bits = [];
      if (p.status) bits.push(`状态→${p.status}`);
      if (p.handler) bits.push(`处理人→${p.handler}`);
      if (p.retest) bits.push(`复测：${p.retest}`);
      if (p.satisfaction != null) bits.push(`满意度 ${p.satisfaction} 星`);
      pushTicketHistory(item, bits.join("；") || "更新工单");
    }
    return item;
  }

  function getAutoDispatch() {
    const data = JSON.parse(JSON.stringify(autoDispatch));
    data.rules = (data.rules || []).map((r) => ({
      ...r,
      handlers: normalizeHandlers(r),
    }));
    return data;
  }

  function normalizeHandlers(r) {
    if (Array.isArray(r?.handlers)) return r.handlers.map(String).filter(Boolean);
    if (r?.handler) return String(r.handler).split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
    return [];
  }

  function saveAutoDispatch(payload) {
    const p = payload || {};
    autoDispatch = {
      enabled: !!p.enabled,
      matchBy: p.matchBy === "type" ? "type" : "priority",
      timeoutHours: Number(p.timeoutHours) || 2,
      escalateTo: p.escalateTo || "安全主管",
      rules: Array.isArray(p.rules)
        ? p.rules.map((r, i) => ({
            id: r.id || i + 1,
            match: r.match || "",
            handlers: normalizeHandlers(r),
            enabled: r.enabled !== false,
          }))
        : autoDispatch.rules,
    };
    return getAutoDispatch();
  }

  function listHandlers() {
    return HANDLER_POOL.slice();
  }

  function listOrgDepts() {
    return orgDepts.map((d) => ({
      ...d,
      count: d.id === "all" || d.id === "soc"
        ? orgPeople.length
        : orgPeople.filter((p) => p.deptId === d.id).length,
    }));
  }

  function listOrgPeople(filter) {
    const f = filter || {};
    return orgPeople.filter((p) => {
      if (f.deptId && f.deptId !== "all" && f.deptId !== "soc" && p.deptId !== f.deptId) return false;
      if (f.keyword) {
        const blob = `${p.name} ${p.phone}`;
        if (!matchKeyword(blob, f.keyword)) return false;
      }
      return true;
    }).map((p) => {
      const dept = orgDepts.find((d) => d.id === p.deptId);
      return { ...p, deptName: dept ? dept.name : "-" };
    });
  }

  function getOrgPersonByName(name) {
    return orgPeople.find((p) => p.name === name) || null;
  }

  function listConfigs(filter) {
    const f = filter || {};
    return configs.filter((item) => {
      if (f.assetType && item.assetType !== f.assetType) return false;
      if (f.dept && item.dept !== f.dept) return false;
      if (f.result && item.result !== f.result) return false;
      if (f.severity && item.severity !== f.severity) return false;
      if (f.remediate && item.remediate !== f.remediate) return false;
      if (f.keyword) {
        const blob = [item.assetName, item.ip, item.baseline, item.dept].join(" ");
        if (!matchKeyword(blob, f.keyword)) return false;
      }
      return true;
    });
  }

  function getConfig(id) {
    return configs.find((x) => String(x.id) === String(id)) || null;
  }

  function runCheck(ids) {
    const targets = ids && ids.length ? configs.filter((c) => ids.map(String).includes(String(c.id))) : configs;
    targets.forEach((c) => {
      c.checkedAt = nowStr();
      if (c.result === "合规" && Math.random() < 0.15) {
        c.result = "不合规";
        c.remediate = "待整改";
      } else if (c.result === "不合规" && Math.random() < 0.2) {
        c.afterEvidence = "自动复核：部分项已修复";
      }
    });
    return targets.length;
  }

  function createTicketFromConfig(id) {
    const c = getConfig(id);
    if (!c) return null;
    const ticket = createTicket({
      title: `配置不合规整改：${c.assetName} / ${c.baseline}`,
      type: "配置不合规",
      priority: c.severity === "严重" || c.severity === "高" ? "高" : "中",
      asset: c.assetName,
      related: [`配置核查:#${c.id}`, `基线:${c.baseline}`],
      status: "待派单",
    });
    if (c.remediate === "待整改") c.remediate = "整改中";
    return ticket;
  }

  function applyException(id, payload) {
    const c = getConfig(id);
    if (!c) return null;
    const p = payload || {};
    c.result = "例外";
    c.remediate = "例外中";
    c.exceptionReason = p.reason || "";
    c.exceptionUntil = p.until || "";
    c.approver = p.approver || "";
    return c;
  }

  function reviewConfig(id, payload) {
    const c = getConfig(id);
    if (!c) return null;
    const p = payload || {};
    if (p.afterEvidence) c.afterEvidence = p.afterEvidence;
    if (p.pass) {
      c.result = "合规";
      c.remediate = "已闭环";
    }
    c.checkedAt = nowStr();
    return c;
  }

  function listDrills(filter) {
    const f = filter || {};
    return drills.filter((item) => {
      if (f.scene && item.scene !== f.scene) return false;
      if (f.status && item.status !== f.status) return false;
      if (f.keyword) {
        const blob = [item.name, item.scene, item.owner, item.redTeam, item.blueTeam].join(" ");
        if (!matchKeyword(blob, f.keyword)) return false;
      }
      return true;
    });
  }

  function getDrill(id) {
    return drills.find((x) => String(x.id) === String(id)) || null;
  }

  function saveDrill(payload) {
    const data = Object.assign({}, payload);
    if (!data.id) {
      data.id = nextId(drills);
      data.rulePacks = data.rulePacks || [];
      data.intelPacks = data.intelPacks || [];
      data.playbooks = data.playbooks || [];
      data.knowledgeIds = data.knowledgeIds || [];
      data.settled = data.settled || [];
      drills.unshift(data);
      return data;
    }
    const idx = drills.findIndex((x) => String(x.id) === String(data.id));
    if (idx < 0) return null;
    drills[idx] = Object.assign({}, drills[idx], data);
    return drills[idx];
  }

  function linkDrillResources(id, payload) {
    const d = getDrill(id);
    if (!d) return null;
    const p = payload || {};
    if (p.rulePacks) d.rulePacks = p.rulePacks;
    if (p.intelPacks) d.intelPacks = p.intelPacks;
    if (p.playbooks) d.playbooks = p.playbooks;
    if (p.knowledgeIds) d.knowledgeIds = p.knowledgeIds;
    return d;
  }

  function archiveDrill(id, reviewNote) {
    const d = getDrill(id);
    if (!d) return null;
    d.status = "已归档";
    d.reviewNote = reviewNote || "";
    return d;
  }

  function settleDrill(id, settled) {
    const d = getDrill(id);
    if (!d) return null;
    d.settled = Array.isArray(settled) ? settled.slice() : [];
    return d;
  }

  function getScreenView(viewKey) {
    const key = viewKey && screen.views[viewKey] ? viewKey : "all";
    return screen.views[key];
  }

  function listScreenViews() {
    return meta.screenViews.slice();
  }

  window.SecOps = {
    meta,
    tagOf,
    listKnowledge,
    getKnowledge,
    saveKnowledge,
    removeKnowledge,
    listTickets,
    getTicket,
    createTicket,
    updateTicket,
    getAutoDispatch,
    saveAutoDispatch,
    listHandlers,
    listOrgDepts,
    listOrgPeople,
    getOrgPersonByName,
    listConfigs,
    getConfig,
    runCheck,
    createTicketFromConfig,
    applyException,
    reviewConfig,
    listDrills,
    getDrill,
    saveDrill,
    linkDrillResources,
    archiveDrill,
    settleDrill,
    getScreenView,
    listScreenViews,
  };
})();
