(function () {
  const RANGES = ["24h", "7d", "30d"];
  const DEPARTMENTS = ["全部", "网络运维部", "安全运营中心", "信息中心", "数据中心"];

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function scaleInt(n, factor) {
    return Math.max(1, Math.round(n * factor));
  }

  function scaleKpis(kpis, factor, pctKeys) {
    return kpis.map((k) => {
      const next = { ...k };
      if (typeof k.value === "number") {
        next.value = scaleInt(k.value, factor);
      } else if (typeof k.value === "string" && k.value.endsWith("%") && !pctKeys) {
        /* keep percentage-like KPIs mostly stable with slight drift */
        const base = parseFloat(k.value);
        if (!Number.isNaN(base)) {
          const drift = factor === 1 ? 0 : factor > 1 ? -0.4 : 0.6;
          next.value = `${(base + drift).toFixed(1)}%`;
        }
      }
      return next;
    });
  }

  function scaleNamed(list, factor) {
    return list.map((item) => ({ ...item, value: scaleInt(item.value, factor) }));
  }

  function scaleSeries(arr, factor) {
    return arr.map((n) => scaleInt(n, factor));
  }

  const labels6 = ["00", "04", "08", "12", "16", "20"];
  const labels7 = ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "今日"];

  const networkBase = {
    kpis: [
      { label: "设备在线率", value: "98.6%", sub: "安全+网络设备" },
      { label: "关键链路健康", value: "96.2%", sub: "核心/汇聚" },
      { label: "日志接入成功率", value: "99.1%", sub: "采集探针" },
      { label: "策略命中数", value: 12840, sub: "本周期累计" },
      { label: "阻断次数", value: 326, sub: "本周期累计" },
      { label: "组件平均占用", value: "42%", sub: "CPU/内存均值" },
    ],
    deviceStatus: [
      { name: "正常", value: 86 },
      { name: "告警", value: 9 },
      { name: "离线", value: 3 },
    ],
    trafficTrend: {
      labels: labels6,
      in: [320, 410, 580, 760, 690, 520],
      out: [280, 360, 520, 710, 640, 470],
    },
    linkQuality: {
      labels: labels6,
      loss: [0.12, 0.18, 0.09, 0.22, 0.15, 0.11],
      latency: [8, 12, 9, 18, 14, 10],
    },
    alarmLevels: [
      { name: "严重", value: 6 },
      { name: "主要", value: 14 },
      { name: "次要", value: 28 },
      { name: "提示", value: 41 },
    ],
    logFailTop: [
      { name: "防火墙-A", value: 18 },
      { name: "WAF-集群", value: 12 },
      { name: "核心交换机", value: 9 },
      { name: "堡垒机", value: 7 },
      { name: "日志中心", value: 5 },
    ],
    policyHit: [
      { name: "命中", value: 12840 },
      { name: "阻断", value: 326 },
    ],
    rows: [
      { id: 1, name: "下一代防火墙-A", type: "安全设备", status: "正常", traffic: "1.2Gbps", alarms: 2, logStatus: "正常", policyHits: 4200, cpu: "38%" },
      { id: 2, name: "WAF-集群-01", type: "安全设备", status: "告警", traffic: "860Mbps", alarms: 5, logStatus: "延迟", policyHits: 3100, cpu: "71%" },
      { id: 3, name: "核心交换机-CR1", type: "网络设备", status: "正常", traffic: "8.4Gbps", alarms: 0, logStatus: "正常", policyHits: 0, cpu: "29%" },
      { id: 4, name: "汇聚交换机-AGG2", type: "网络设备", status: "正常", traffic: "3.1Gbps", alarms: 1, logStatus: "正常", policyHits: 0, cpu: "33%" },
      { id: 5, name: "入侵检测-IDS", type: "安全设备", status: "正常", traffic: "640Mbps", alarms: 3, logStatus: "正常", policyHits: 1860, cpu: "45%" },
      { id: 6, name: "堡垒机-BAM", type: "安全设备", status: "离线", traffic: "-", alarms: 4, logStatus: "失败", policyHits: 0, cpu: "-" },
      { id: 7, name: "日志采集探针-03", type: "平台组件", status: "告警", traffic: "210Mbps", alarms: 2, logStatus: "失败", policyHits: 0, cpu: "82%" },
      { id: 8, name: "策略引擎-PE", type: "平台组件", status: "正常", traffic: "-", alarms: 0, logStatus: "正常", policyHits: 3680, cpu: "51%" },
      { id: 9, name: "出口路由器-ER", type: "网络设备", status: "正常", traffic: "4.6Gbps", alarms: 1, logStatus: "正常", policyHits: 0, cpu: "41%" },
      { id: 10, name: "抗DDoS-清洗", type: "安全设备", status: "正常", traffic: "1.8Gbps", alarms: 0, logStatus: "正常", policyHits: 920, cpu: "36%" },
      { id: 11, name: "态势分析组件", type: "平台组件", status: "正常", traffic: "-", alarms: 0, logStatus: "正常", policyHits: 0, cpu: "48%" },
      { id: 12, name: "边界防火墙-B", type: "安全设备", status: "告警", traffic: "980Mbps", alarms: 3, logStatus: "延迟", policyHits: 2140, cpu: "66%" },
    ],
  };

  const situationBase = {
    kpis: [
      { label: "告警数", value: 186, sub: "本周期" },
      { label: "安全事件数", value: 42, sub: "已确认" },
      { label: "高危占比", value: "18.6%", sub: "事件维度" },
      { label: "平均响应时长", value: "26分钟", sub: "发现→处置" },
      { label: "重复事件数", value: 11, sub: "同源聚合" },
      { label: "情报命中数", value: 9, sub: "IOC/规则" },
    ],
    alarmTrend: {
      labels: labels7,
      alarms: [18, 22, 31, 27, 36, 29, 23],
      events: [3, 5, 8, 6, 9, 7, 4],
    },
    attackTypes: [
      { name: "漏洞利用", value: 28 },
      { name: "暴力破解", value: 22 },
      { name: "恶意软件", value: 18 },
      { name: "钓鱼", value: 14 },
      { name: "扫描探测", value: 31 },
      { name: "其他", value: 9 },
    ],
    sourceRegions: [
      { name: "境外-亚太", value: 46 },
      { name: "境外-北美", value: 28 },
      { name: "境内-华东", value: 22 },
      { name: "境内-华北", value: 17 },
      { name: "未知", value: 12 },
    ],
    victimBiz: [
      { name: "政务门户", value: 19 },
      { name: "办公OA", value: 15 },
      { name: "业务中台", value: 12 },
      { name: "数据交换", value: 8 },
      { name: "运维管理", value: 6 },
    ],
    handleStatus: [
      { name: "待处置", value: 14 },
      { name: "处置中", value: 11 },
      { name: "已关闭", value: 17 },
    ],
    securityTrend: {
      labels: labels7,
      score: [78, 76, 74, 72, 75, 77, 79],
      highRisk: [6, 8, 11, 9, 12, 8, 5],
    },
    rows: [
      { id: 1, type: "漏洞利用", level: "高危", source: "境外-亚太", asset: "政务门户-Web", status: "处置中", responseMin: 18, dept: "安全运营中心" },
      { id: 2, type: "暴力破解", level: "中危", source: "境内-华东", asset: "堡垒机-BAM", status: "已关闭", responseMin: 32, dept: "网络运维部" },
      { id: 3, type: "扫描探测", level: "低危", source: "未知", asset: "出口路由器-ER", status: "待处置", responseMin: 0, dept: "网络运维部" },
      { id: 4, type: "钓鱼", level: "高危", source: "境外-北美", asset: "办公邮箱网关", status: "处置中", responseMin: 22, dept: "安全运营中心" },
      { id: 5, type: "恶意软件", level: "高危", source: "境内-华北", asset: "终端-PC-8821", status: "已关闭", responseMin: 45, dept: "信息中心" },
      { id: 6, type: "漏洞利用", level: "中危", source: "境外-亚太", asset: "业务中台-API", status: "待处置", responseMin: 0, dept: "数据中心" },
      { id: 7, type: "扫描探测", level: "低危", source: "境内-华东", asset: "汇聚交换机-AGG2", status: "已关闭", responseMin: 15, dept: "网络运维部" },
      { id: 8, type: "暴力破解", level: "中危", source: "未知", asset: "VPN网关", status: "处置中", responseMin: 28, dept: "安全运营中心" },
      { id: 9, type: "其他", level: "低危", source: "境内-华北", asset: "日志中心", status: "已关闭", responseMin: 40, dept: "信息中心" },
      { id: 10, type: "恶意软件", level: "高危", source: "境外-北美", asset: "文件服务器-FS01", status: "待处置", responseMin: 0, dept: "数据中心" },
      { id: 11, type: "钓鱼", level: "中危", source: "境外-亚太", asset: "办公OA", status: "处置中", responseMin: 19, dept: "信息中心" },
      { id: 12, type: "漏洞利用", level: "高危", source: "境内-华东", asset: "数据交换平台", status: "已关闭", responseMin: 55, dept: "数据中心" },
    ],
  };

  const vulnBase = {
    kpis: [
      { label: "新增漏洞", value: 36, sub: "本周期" },
      { label: "已修复", value: 28, sub: "含复测通过" },
      { label: "未修复", value: 47, sub: "含超期" },
      { label: "高危漏洞", value: 19, sub: "未闭环" },
      { label: "外网暴露", value: 8, sub: "互联网可达" },
      { label: "超期漏洞", value: 12, sub: "超SLA" },
      { label: "补丁覆盖率", value: "81%", sub: "重点资产" },
    ],
    funnel: [
      { name: "新增", value: 36 },
      { name: "已修复", value: 28 },
      { name: "复测通过", value: 24 },
    ],
    riskStatus: [
      { name: "未修复", value: 22 },
      { name: "超期未修", value: 12 },
      { name: "无法修复", value: 5 },
      { name: "临时例外", value: 6 },
      { name: "利用迹象", value: 2 },
    ],
    assetTop: [
      { name: "政务门户", value: 9 },
      { name: "业务中台", value: 7 },
      { name: "数据交换", value: 6 },
      { name: "办公OA", value: 5 },
      { name: "VPN网关", value: 4 },
    ],
    deptRank: [
      { name: "信息中心", value: 14 },
      { name: "数据中心", value: 11 },
      { name: "网络运维部", value: 9 },
      { name: "安全运营中心", value: 8 },
    ],
    patchTrend: {
      labels: labels7,
      rate: [72, 74, 76, 78, 79, 80, 81],
    },
    retestVsException: [
      { name: "复测失败", value: 4 },
      { name: "例外审批", value: 6 },
    ],
    rows: [
      { id: 1, cve: "CVE-2024-21762", title: "FortiOS 越界写入", level: "高危", asset: "防火墙-A", exposure: "外网", status: "未修复", overdue: true, dept: "网络运维部", exceptionNote: "-" },
      { id: 2, cve: "CVE-2023-4966", title: "Citrix Bleed", level: "高危", asset: "VPN网关", exposure: "外网", status: "临时例外", overdue: false, dept: "安全运营中心", exceptionNote: "等待厂商热补丁，例外至 2026-11-15" },
      { id: 3, cve: "CVE-2024-3400", title: "PAN-OS 命令注入", level: "高危", asset: "边界防火墙-B", exposure: "外网", status: "利用迹象", overdue: true, dept: "网络运维部", exceptionNote: "-" },
      { id: 4, cve: "CVE-2021-44228", title: "Log4Shell 残留", level: "高危", asset: "业务中台", exposure: "内网", status: "未修复", overdue: true, dept: "数据中心", exceptionNote: "-" },
      { id: 5, cve: "CVE-2022-22965", title: "Spring4Shell", level: "中危", asset: "政务门户", exposure: "外网", status: "已修复", overdue: false, dept: "信息中心", exceptionNote: "-" },
      { id: 6, cve: "CVE-2023-3519", title: "NetScaler RCE", level: "高危", asset: "负载均衡", exposure: "外网", status: "超期未修", overdue: true, dept: "网络运维部", exceptionNote: "-" },
      { id: 7, cve: "CVE-2020-1472", title: "Zerologon", level: "高危", asset: "域控-AD01", exposure: "内网", status: "无法修复", overdue: false, dept: "信息中心", exceptionNote: "遗留系统，已网络隔离" },
      { id: 8, cve: "CVE-2024-27198", title: "TeamCity 认证绕过", level: "中危", asset: "CI服务器", exposure: "内网", status: "未修复", overdue: false, dept: "数据中心", exceptionNote: "-" },
      { id: 9, cve: "CVE-2019-0708", title: "BlueKeep", level: "中危", asset: "旧版终端跳板", exposure: "内网", status: "临时例外", overdue: false, dept: "信息中心", exceptionNote: "下线计划中，例外至年底" },
      { id: 10, cve: "CVE-2023-46604", title: "ActiveMQ RCE", level: "高危", asset: "消息中间件", exposure: "内网", status: "已修复", overdue: false, dept: "数据中心", exceptionNote: "-" },
      { id: 11, cve: "CVE-2024-23897", title: "Jenkins 任意读", level: "中危", asset: "构建节点", exposure: "内网", status: "复测失败", overdue: true, dept: "数据中心", exceptionNote: "-" },
      { id: 12, cve: "CVE-2022-26134", title: "Confluence OGNL", level: "高危", asset: "知识库", exposure: "外网", status: "未修复", overdue: false, dept: "信息中心", exceptionNote: "-" },
    ],
  };

  const incidentBase = {
    eventKpis: [
      { label: "发现数", value: 42, sub: "本周期" },
      { label: "研判中", value: 8, sub: "待定性" },
      { label: "处置中", value: 11, sub: "进行中" },
      { label: "已关闭", value: 23, sub: "含复盘" },
      { label: "平均响应", value: "26分钟", sub: "发现→响应" },
      { label: "复盘完成率", value: "78%", sub: "已关闭事件" },
    ],
    severity: [
      { name: "特别重大", value: 1 },
      { name: "重大", value: 4 },
      { name: "较大", value: 12 },
      { name: "一般", value: 25 },
    ],
    sources: [
      { name: "态势感知", value: 16 },
      { name: "防火墙", value: 9 },
      { name: "终端EDR", value: 7 },
      { name: "人工上报", value: 5 },
      { name: "情报命中", value: 5 },
    ],
    responseTrend: {
      labels: labels7,
      avgMin: [34, 31, 28, 27, 25, 24, 26],
    },
    closeStatus: [
      { name: "已关闭", value: 23 },
      { name: "未关闭", value: 19 },
    ],
    rows: [
      {
        id: 1, no: "INC-20261101-001", type: "Web入侵", level: "重大", source: "态势感知", asset: "政务门户",
        dept: "安全运营中心", responseMin: 18, status: "处置中",
        process: "封禁源IP → 加固WAF规则 → 排查后门", evidence: "pcap-001.pcap; screenshot-waf.png",
        review: "-", improvement: "-",
      },
      {
        id: 2, no: "INC-20261030-014", type: "勒索预警", level: "较大", source: "终端EDR", asset: "文件服务器-FS01",
        dept: "数据中心", responseMin: 22, status: "已关闭",
        process: "隔离主机 → 清除样本 → 恢复备份", evidence: "edr-alert.pdf; sample-hash.txt",
        review: "备份链路有效，响应达标", improvement: "对同类共享目录加强权限审计",
      },
      {
        id: 3, no: "INC-20261029-008", type: "账号异常", level: "一般", source: "人工上报", asset: "域控-AD01",
        dept: "信息中心", responseMin: 40, status: "已关闭",
        process: "锁定账号 → 重置口令 → 复核登录日志", evidence: "ad-log-export.csv",
        review: "弱口令策略未覆盖服务账号", improvement: "服务账号纳入季度审计",
      },
      {
        id: 4, no: "INC-20261028-021", type: "数据外泄嫌疑", level: "重大", source: "情报命中", asset: "数据交换平台",
        dept: "数据中心", responseMin: 15, status: "研判中",
        process: " assemb 流量镜像 → 关联出境策略", evidence: "flow-mirror-note.md",
        review: "-", improvement: "-",
      },
      {
        id: 5, no: "INC-20261027-003", type: "扫描攻击", level: "一般", source: "防火墙", asset: "出口路由器-ER",
        dept: "网络运维部", responseMin: 12, status: "已关闭",
        process: "下发封禁 → 观察24h", evidence: "fw-block-list.txt",
        review: "常规扫描，无进一步利用", improvement: "-",
      },
      {
        id: 6, no: "INC-20261026-019", type: "钓鱼邮件", level: "较大", source: "态势感知", asset: "办公邮箱网关",
        dept: "安全运营中心", responseMin: 28, status: "处置中",
        process: "撤回邮件 → 用户通报 → IOC入库", evidence: "phish-eml.eml; ioc.json",
        review: "-", improvement: "-",
      },
      {
        id: 7, no: "INC-20261025-011", type: "配置违规", level: "一般", source: "人工上报", asset: "策略引擎-PE",
        dept: "安全运营中心", responseMin: 55, status: "已关闭",
        process: "回滚策略 → 双人复核", evidence: "policy-diff.txt",
        review: "变更未走审批", improvement: "强制变更工单关联",
      },
      {
        id: 8, no: "INC-20261024-006", type: "漏洞利用", level: "特别重大", source: "态势感知", asset: "VPN网关",
        dept: "网络运维部", responseMin: 9, status: "已关闭",
        process: "紧急下线 → 热补丁 → 全量日志取证", evidence: "vpn-forensic.zip; patch-log.txt",
        review: "外网暴露面处置及时", improvement: "VPN纳入月度漏洞专项",
      },
      {
        id: 9, no: "INC-20261023-017", type: "DDoS", level: "较大", source: "防火墙", asset: "抗DDoS-清洗",
        dept: "网络运维部", responseMin: 6, status: "已关闭",
        process: "启用清洗 → 通报运营商", evidence: "ddos-traffic.png",
        review: "清洗策略有效", improvement: "-",
      },
      {
        id: 10, no: "INC-20261022-002", type: "横向移动嫌疑", level: "重大", source: "终端EDR", asset: "跳板机-JB01",
        dept: "安全运营中心", responseMin: 20, status: "处置中",
        process: "隔离网段 → 凭证重置 → 链路追踪", evidence: "edr-timeline.pdf",
        review: "-", improvement: "-",
      },
      {
        id: 11, no: "INC-20261021-009", type: "日志中断", level: "一般", source: "人工上报", asset: "日志采集探针-03",
        dept: "信息中心", responseMin: 35, status: "已关闭",
        process: "重启探针 → 补采校验", evidence: "collector-restart.log",
        review: "磁盘占满导致中断", improvement: "增加磁盘水位告警",
      },
      {
        id: 12, no: "INC-20261020-015", type: "弱口令暴破", level: "较大", source: "情报命中", asset: "堡垒机-BAM",
        dept: "网络运维部", responseMin: 24, status: "研判中",
        process: " assemb 来源画像 → 评估影响面", evidence: "brute-src.csv",
        review: "-", improvement: "-",
      },
    ],
    complianceKpis: [
      { label: "等保自评估", value: "86%", sub: "完成度" },
      { label: "日志留存达标", value: "98%", sub: "≥180天" },
      { label: "策略审计覆盖", value: "92%", sub: "本周期" },
      { label: "账号审计异常", value: 7, sub: "待核查" },
      { label: "数据安全通过率", value: "94%", sub: "检查项" },
    ],
    complianceBars: [
      { name: "等保", value: 86 },
      { name: "日志", value: 98 },
      { name: "策略", value: 92 },
      { name: "账号", value: 88 },
      { name: "数据安全", value: 94 },
    ],
  };

  // fix typos in process text introduced accidentally
  incidentBase.rows[3].process = "流量镜像 → 关联出境策略";
  incidentBase.rows[11].process = "来源画像 → 评估影响面";

  function buildNetwork(factor, labelSet) {
    const src = clone(networkBase);
    src.kpis = scaleKpis(src.kpis, factor);
    src.deviceStatus = scaleNamed(src.deviceStatus, factor === 1 ? 1 : Math.max(0.85, Math.min(factor, 1.2)));
    src.trafficTrend.labels = labelSet;
    src.trafficTrend.in = scaleSeries(src.trafficTrend.in, factor);
    src.trafficTrend.out = scaleSeries(src.trafficTrend.out, factor);
    src.linkQuality.labels = labelSet;
    src.alarmLevels = scaleNamed(src.alarmLevels, factor);
    src.logFailTop = scaleNamed(src.logFailTop, factor);
    src.policyHit = scaleNamed(src.policyHit, factor);
    src.kpis[3].value = src.policyHit[0].value;
    src.kpis[4].value = src.policyHit[1].value;
    return src;
  }

  function buildSituation(factor, labelSet) {
    const src = clone(situationBase);
    src.kpis = src.kpis.map((k, i) => {
      if (i === 2 || i === 3) return { ...k }; // 高危占比、平均响应保持字符串
      if (typeof k.value === "number") return { ...k, value: scaleInt(k.value, factor) };
      return { ...k };
    });
    if (factor < 1) {
      src.kpis[2].value = "15.2%";
      src.kpis[3].value = "18分钟";
    } else if (factor > 1) {
      src.kpis[2].value = "21.4%";
      src.kpis[3].value = "31分钟";
    }
    src.alarmTrend.labels = labelSet;
    src.alarmTrend.alarms = scaleSeries(src.alarmTrend.alarms, factor);
    src.alarmTrend.events = scaleSeries(src.alarmTrend.events, factor);
    src.attackTypes = scaleNamed(src.attackTypes, factor);
    src.sourceRegions = scaleNamed(src.sourceRegions, factor);
    src.victimBiz = scaleNamed(src.victimBiz, factor);
    src.handleStatus = scaleNamed(src.handleStatus, factor);
    src.securityTrend.labels = labelSet;
    src.securityTrend.highRisk = scaleSeries(src.securityTrend.highRisk, factor);
    return src;
  }

  function buildVuln(factor, labelSet) {
    const src = clone(vulnBase);
    src.kpis = src.kpis.map((k, i) => {
      if (i === 6) return { ...k };
      if (typeof k.value === "number") return { ...k, value: scaleInt(k.value, factor) };
      return { ...k };
    });
    if (factor < 1) src.kpis[6].value = "84%";
    else if (factor > 1) src.kpis[6].value = "76%";
    src.funnel = scaleNamed(src.funnel, factor);
    src.riskStatus = scaleNamed(src.riskStatus, factor);
    src.assetTop = scaleNamed(src.assetTop, factor);
    src.deptRank = scaleNamed(src.deptRank, factor);
    src.patchTrend.labels = labelSet;
    src.retestVsException = scaleNamed(src.retestVsException, factor);
    return src;
  }

  function buildIncident(factor, labelSet) {
    const src = clone(incidentBase);
    src.eventKpis = src.eventKpis.map((k, i) => {
      if (i === 4 || i === 5) return { ...k };
      if (typeof k.value === "number") return { ...k, value: scaleInt(k.value, factor) };
      return { ...k };
    });
    if (factor < 1) {
      src.eventKpis[4].value = "18分钟";
      src.eventKpis[5].value = "85%";
    } else if (factor > 1) {
      src.eventKpis[4].value = "33分钟";
      src.eventKpis[5].value = "71%";
    }
    src.severity = scaleNamed(src.severity, factor);
    src.sources = scaleNamed(src.sources, factor);
    src.responseTrend.labels = labelSet;
    src.closeStatus = scaleNamed(src.closeStatus, factor);
    src.complianceKpis = src.complianceKpis.map((k) => {
      if (typeof k.value === "number") return { ...k, value: scaleInt(k.value, factor > 1 ? 1.3 : factor < 1 ? 0.7 : 1) };
      return { ...k };
    });
    return src;
  }

  const byRange = {
    "24h": {
      network: buildNetwork(0.25, labels6),
      situation: buildSituation(0.25, labels6),
      vuln: buildVuln(0.3, labels6),
      incident: buildIncident(0.25, labels6),
    },
    "7d": {
      network: buildNetwork(1, labels7),
      situation: buildSituation(1, labels7),
      vuln: buildVuln(1, labels7),
      incident: buildIncident(1, labels7),
    },
    "30d": {
      network: buildNetwork(4.5, labels7),
      situation: buildSituation(4.2, labels7),
      vuln: buildVuln(3.8, labels7),
      incident: buildIncident(4.5, labels7),
    },
  };

  function getRange(range) {
    return byRange[range] || byRange["7d"];
  }

  window.ReportMock = {
    ranges: RANGES,
    departments: DEPARTMENTS,
    getNetwork(range) {
      return clone(getRange(range).network);
    },
    getSituation(range) {
      return clone(getRange(range).situation);
    },
    getVuln(range) {
      return clone(getRange(range).vuln);
    },
    getIncident(range) {
      return clone(getRange(range).incident);
    },
  };
})();
