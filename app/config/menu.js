(function () {
  window.APP_MENU = [
    {
      key: "home",
      label: "工作台",
      icon: "fa-solid fa-house",
      href: "../home/home.html",
    },
    {
      key: "network",
      label: "网络管理",
      icon: "fa-solid fa-network-wired",
      children: [
        { key: "network.topology", label: "网络拓扑", href: "../network/topology.html" },
        { key: "network.link-status", label: "链路状态", href: "../network/link-status.html" },
        { key: "network.fault", label: "故障显示", href: "../network/fault.html" },
      ],
    },
    {
      key: "performance",
      label: "性能监测管理",
      icon: "fa-solid fa-gauge-high",
      children: [
        { key: "network.perf-monitor", label: "网络设备监测", href: "../network/perf-monitor.html" },
        { key: "monitor.server", label: "服务器监测管理", href: "../monitor/server.html" },
        { key: "monitor.database", label: "数据库监测管理", href: "../monitor/database.html" },
        { key: "perf.charts", label: "性能监测图表", href: "../perf/charts.html" },
        { key: "perf.alert", label: "性能预警", href: "../perf/alert.html" },
        { key: "perf.param", label: "性能监视参数", href: "../perf/param.html" },
      ],
    },
    {
      key: "fault",
      label: "故障管理",
      icon: "fa-solid fa-bell",
      children: [
        { key: "fault.notify", label: "告警通知", href: "../alarm-center/alarm-info.html" },
        { key: "fault.analysis", label: "告警分析", href: "../alarm-center/alarm-analysis.html" },
        { key: "fault.handle", label: "告警处理", href: "../alarm-center/alarm-rule.html" },
        { key: "fault.source", label: "故障告警源", href: "../alarm-center/alarm-source.html" },
      ],
    },
    {
      key: "device",
      label: "设备管理",
      icon: "fa-solid fa-server",
      children: [
        { key: "device.icons", label: "设备图标", href: "../device/icons.html" },
        { key: "device.snapshot", label: "设备管理", href: "../device/snapshot.html" },
        { key: "device.processes", label: "设备活动进程", href: "../device/processes.html" },
        { key: "device.software", label: "安装软件", href: "../device/software.html" },
        { key: "device.ports", label: "交换机端口管理", href: "../device/ports.html" },
      ],
    },
    {
      key: "desktop",
      label: "桌面安全管理",
      icon: "fa-solid fa-desktop",
      children: [
        { key: "desktop.storage", label: "储存设备管理", href: "../desktop/storage.html" },
        { key: "desktop.peripheral", label: "终端外设控制", href: "../desktop/peripheral.html" },
        { key: "desktop.monitor", label: "终端操作监控", href: "../desktop/monitor.html" },
      ],
    },
    {
      key: "asset",
      label: "资产安全管理",
      icon: "fa-solid fa-shield-halved",
      children: [
        { key: "asset.ledger", label: "资产台账", href: "../asset/ledger.html" },
        { key: "asset.vuln", label: "脆弱性管理", href: "../asset/vuln.html" },
        { key: "asset.risk", label: "资产风险评级", href: "../asset/risk.html" },
      ],
    },
    {
      key: "threat",
      label: "威胁监测与响应",
      icon: "fa-solid fa-shield-virus",
      children: [
        { key: "threat.siem", label: "安全事件分析", href: "../threat/siem.html" },
        { key: "threat.ids", label: "入侵检测监控", href: "../threat/ids.html" },
        { key: "threat.malware", label: "恶意代码防护", href: "../threat/malware.html" },
        { key: "threat.ueba", label: "异常行为分析", href: "../threat/ueba.html" },
        { key: "threat.soar", label: "自动化响应", href: "../threat/soar.html" },
        { key: "threat.intel", label: "威胁情报应用", href: "../threat/intel.html" },
      ],
    },
    {
      key: "data",
      label: "数据安全管理",
      icon: "fa-solid fa-database",
      children: [
        { key: "data.db-audit", label: "数据库安全审计", href: "../data/db-audit.html" },
        { key: "data.classify", label: "敏感数据分类分级", href: "../data/classify.html" },
        { key: "data.flow", label: "数据流转风险预警", href: "../data/flow.html" },
      ],
    },
    {
      key: "access",
      label: "访问控制管理",
      icon: "fa-solid fa-key",
      children: [
        { key: "access.encryption", label: "文件加密监控", href: "../access/encryption.html" },
        { key: "access.audit", label: "权限异常审计", href: "../access/audit.html" },
      ],
    },
    {
      key: "compliance",
      label: "安全合规与审计",
      icon: "fa-solid fa-clipboard-check",
      children: [
        { key: "compliance.mlps", label: "等保自评估", href: "../compliance/mlps.html" },
        { key: "compliance.policy", label: "策略管理与审计", href: "../compliance/policy.html" },
        { key: "compliance.log-audit", label: "日志集中审计", href: "../compliance/log-audit.html" },
        { key: "compliance.report", label: "合规报表", href: "../compliance/report.html" },
      ],
    },
    {
      key: "secops",
      label: "安全运营管理",
      icon: "fa-solid fa-user-shield",
      children: [
        { key: "secops.knowledge", label: "安全知识库", href: "../security-ops/knowledge.html" },
        { key: "secops.screen", label: "安全态势大屏", href: "../security-ops/screen.html", target: "_blank" },
        { key: "secops.ticket", label: "安全工单管理", href: "../security-ops/ticket.html" },
        { key: "secops.config", label: "安全配置管理", href: "../security-ops/config.html" },
        { key: "secops.drill", label: "攻防演练", href: "../security-ops/drill.html" },
      ],
    },
    {
      key: "report",
      label: "报表管理",
      icon: "fa-solid fa-chart-column",
      children: [
        { key: "report.network", label: "网络运行报表", href: "../report/network.html" },
        { key: "report.situation", label: "安全态势分析报表", href: "../report/situation.html" },
        { key: "report.vuln", label: "漏洞与风险态势报表", href: "../report/vuln.html" },
        { key: "report.incident", label: "事件与合规报表", href: "../report/incident.html" },
      ],
    },
    {
      key: "screen",
      label: "电子屏防护管理",
      icon: "fa-solid fa-tv",
      children: [
        { key: "screen.control", label: "统一管控", href: "../screen/control.html" },
        { key: "screen.protect", label: "智能防护", href: "../screen/protect.html" },
        { key: "screen.content", label: "规范内容管理", href: "../screen/content.html" },
        { key: "screen.emergency", label: "应急能力管理", href: "../screen/emergency.html" },
      ],
    },
    {
      key: "datasec",
      label: "数据安全",
      icon: "fa-solid fa-layer-group",
      children: [
        { key: "datasec.classify", label: "数据分类分级", href: "../data-security/classify.html" },
        { key: "datasec.audit", label: "数据安全审计", href: "../data-security/audit.html" },
        { key: "datasec.situation", label: "数据风险态势", href: "../data-security/situation.html" },
      ],
    },
    {
      key: "system",
      label: "系统管理",
      icon: "fa-solid fa-gear",
      children: [
        { key: "system.user", label: "用户管理", href: "../system/user.html" },
        { key: "system.role", label: "角色管理", href: "../system/role.html" },
        { key: "system.menu", label: "菜单管理", href: "../system/menu.html" },
        { key: "system.department", label: "部门管理", href: "../system/department.html" },
        { key: "system.post", label: "岗位管理", href: "../system/post.html" },
        { key: "system.dictionary", label: "字典管理", href: "../system/dictionary.html" },
        { key: "system.parameter", label: "参数设置", href: "../system/parameter.html" },
        { key: "system.notice", label: "通知公告", href: "../system/notice.html" },
        {
          key: "system.logs",
          label: "日志管理",
          children: [
            { key: "system.operation-log", label: "操作日志", href: "../system/operation-log.html" },
            { key: "system.login-log", label: "登录日志", href: "../system/login-log.html" },
          ],
        },
      ],
    },
  ];
})();
