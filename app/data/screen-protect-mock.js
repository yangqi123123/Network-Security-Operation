(function () {
  const MOCK_TODAY = "2026-11-01";

  const CATEGORY_LABEL = {
    porn: "色情",
    politics: "涉政",
    terror: "暴恐",
    abuse: "辱骂",
  };

  const EVENT_TYPE_LABEL = {
    abnormal_play: "异常播放",
    tamper: "内容篡改",
    unauthorized: "未授权操作",
    offline: "设备失联",
  };

  const DEVICE_STATUS_LABEL = { online: "在线", offline: "离线", fault: "故障" };
  const PLAY_STATUS_LABEL = {
    playing: "播放中",
    idle: "空闲",
    blackout: "应急黑屏",
    cut: "已切断",
  };

  const DEVICE_META = {
    online: { label: "在线", tagClass: "success" },
    offline: { label: "离线", tagClass: "danger" },
    fault: { label: "故障", tagClass: "warning" },
  };

  const PLAY_META = {
    playing: { label: "播放中", tagClass: "success" },
    idle: { label: "空闲", tagClass: "" },
    blackout: { label: "应急黑屏", tagClass: "danger" },
    cut: { label: "已切断", tagClass: "warning" },
  };

  const ALARM_META = {
    none: { label: "无告警", tagClass: "success" },
    alarm: { label: "有告警", tagClass: "danger" },
  };

  const CATEGORY_META = {
    porn: { label: "色情", tagClass: "danger" },
    politics: { label: "涉政", tagClass: "warning" },
    terror: { label: "暴恐", tagClass: "danger" },
    abuse: { label: "辱骂", tagClass: "warning" },
  };

  const RISK_META = {
    low: { label: "低", tagClass: "success" },
    medium: { label: "中", tagClass: "warning" },
    high: { label: "高", tagClass: "danger" },
  };

  const ACTION_META = {
    cut: { label: "切断", tagClass: "danger" },
    restore: { label: "恢复", tagClass: "success" },
  };

  const MODE_META = {
    auto: { label: "自动", tagClass: "" },
    manual: { label: "人工", tagClass: "warning" },
  };

  const RESULT_META = {
    cut_done: { label: "已切断", tagClass: "warning" },
    restored: { label: "已恢复", tagClass: "success" },
    pending_confirm: { label: "待确认", tagClass: "warning" },
  };

  const EVENT_META = {
    abnormal_play: { label: "异常播放", tagClass: "warning" },
    tamper: { label: "内容篡改", tagClass: "danger" },
    unauthorized: { label: "未授权操作", tagClass: "warning" },
    offline: { label: "设备失联", tagClass: "danger" },
  };

  const SEVERITY_META = {
    critical: { label: "特急", tagClass: "danger" },
    high: { label: "高", tagClass: "danger" },
    medium: { label: "中", tagClass: "warning" },
  };

  const BLOCK_META = {
    none: { label: "未阻断", tagClass: "" },
    blocking: { label: "阻断中", tagClass: "warning" },
    blocked: { label: "已阻断", tagClass: "danger" },
    released: { label: "已解除", tagClass: "success" },
  };

  const HANDLE_META = {
    pending: { label: "待响应", tagClass: "warning" },
    blocking: { label: "阻断中", tagClass: "warning" },
    handling: { label: "处置中", tagClass: "" },
    closed: { label: "已关闭", tagClass: "success" },
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

  function metaTag(map, key) {
    return map[key] ? { ...map[key] } : { label: key || "-", tagClass: "" };
  }

  function deviceTag(v) { return metaTag(DEVICE_META, v); }
  function playTag(v) { return metaTag(PLAY_META, v); }
  function alarmTag(v) { return metaTag(ALARM_META, v); }
  function categoryTag(v) { return metaTag(CATEGORY_META, v); }
  function riskTag(v) { return metaTag(RISK_META, v); }
  function actionTag(v) { return metaTag(ACTION_META, v); }
  function modeTag(v) { return metaTag(MODE_META, v); }
  function resultTag(v) { return metaTag(RESULT_META, v); }
  function eventTypeTag(v) { return metaTag(EVENT_META, v); }
  function severityTag(v) { return metaTag(SEVERITY_META, v); }
  function blockTag(v) { return metaTag(BLOCK_META, v); }
  function handleTag(v) { return metaTag(HANDLE_META, v); }

  let screens = [
    { id: "SCR-01", name: "图书馆大厅主屏", location: "图书馆1F大厅", program: "校园资讯轮播", deviceStatus: "online", playStatus: "playing", permRemoteSwitch: true, permEmergencyBlack: true, permOperators: "宣传部/信息中心", alarmStatus: "none", lastHeartbeat: "2026-11-01 16:58:12" },
    { id: "SCR-02", name: "行政楼门厅屏", location: "行政楼1F门厅", program: "通知公告", deviceStatus: "online", playStatus: "playing", permRemoteSwitch: true, permEmergencyBlack: true, permOperators: "行政办", alarmStatus: "alarm", lastHeartbeat: "2026-11-01 16:57:40" },
    { id: "SCR-03", name: "食堂入口双屏-左", location: "第一食堂入口", program: "餐饮公示", deviceStatus: "online", playStatus: "cut", permRemoteSwitch: false, permEmergencyBlack: true, permOperators: "后勤集团", alarmStatus: "alarm", lastHeartbeat: "2026-11-01 16:55:01" },
    { id: "SCR-04", name: "食堂入口双屏-右", location: "第一食堂入口", program: "健康饮食宣传", deviceStatus: "online", playStatus: "playing", permRemoteSwitch: false, permEmergencyBlack: true, permOperators: "后勤集团", alarmStatus: "none", lastHeartbeat: "2026-11-01 16:58:02" },
    { id: "SCR-05", name: "教学楼A座中庭", location: "教学楼A座2F", program: "课表与导航", deviceStatus: "online", playStatus: "playing", permRemoteSwitch: true, permEmergencyBlack: true, permOperators: "教务处", alarmStatus: "none", lastHeartbeat: "2026-11-01 16:56:33" },
    { id: "SCR-06", name: "体育馆外立面", location: "体育馆东侧", program: "赛事直播延时", deviceStatus: "online", playStatus: "playing", permRemoteSwitch: true, permEmergencyBlack: true, permOperators: "体育部/信息中心", alarmStatus: "none", lastHeartbeat: "2026-11-01 16:57:18" },
    { id: "SCR-07", name: "宿舍区门禁宣传屏", location: "学生公寓1号门", program: "安全提示", deviceStatus: "fault", playStatus: "idle", permRemoteSwitch: false, permEmergencyBlack: true, permOperators: "学工处", alarmStatus: "alarm", lastHeartbeat: "2026-11-01 15:12:09" },
    { id: "SCR-08", name: "校史馆展厅屏", location: "校史馆2F", program: "校史影像", deviceStatus: "online", playStatus: "playing", permRemoteSwitch: true, permEmergencyBlack: false, permOperators: "宣传部", alarmStatus: "none", lastHeartbeat: "2026-11-01 16:54:44" },
    { id: "SCR-09", name: "南门迎宾屏", location: "南门广场", program: "欢迎与导览", deviceStatus: "offline", playStatus: "idle", permRemoteSwitch: true, permEmergencyBlack: true, permOperators: "保卫处", alarmStatus: "alarm", lastHeartbeat: "2026-10-31 22:08:11" },
    { id: "SCR-10", name: "会议室B301会议屏", location: "行政楼B301", program: "会议候场画面", deviceStatus: "online", playStatus: "blackout", permRemoteSwitch: true, permEmergencyBlack: true, permOperators: "信息中心", alarmStatus: "alarm", lastHeartbeat: "2026-11-01 16:50:20" },
  ];

  let channels = [
    { id: "CH-01", name: "图书馆主通道", screenId: "SCR-01", categories: ["porn", "politics", "terror", "abuse"], delaySec: 5, enabled: true },
    { id: "CH-02", name: "行政楼门厅通道", screenId: "SCR-02", categories: ["porn", "politics", "terror", "abuse"], delaySec: 3, enabled: true },
    { id: "CH-03", name: "食堂左屏通道", screenId: "SCR-03", categories: ["porn", "abuse"], delaySec: 5, enabled: true },
    { id: "CH-04", name: "食堂右屏通道", screenId: "SCR-04", categories: ["porn", "politics", "abuse"], delaySec: 5, enabled: true },
    { id: "CH-05", name: "教学楼中庭通道", screenId: "SCR-05", categories: ["politics", "terror"], delaySec: 8, enabled: true },
    { id: "CH-06", name: "体育馆外立面通道", screenId: "SCR-06", categories: ["porn", "politics", "terror", "abuse"], delaySec: 8, enabled: true },
    { id: "CH-07", name: "宿舍门禁通道", screenId: "SCR-07", categories: ["porn", "abuse"], delaySec: 3, enabled: false },
    { id: "CH-08", name: "会议室B301通道", screenId: "SCR-10", categories: ["porn", "politics", "terror", "abuse"], delaySec: 5, enabled: true },
  ];

  let detections = [
    { id: "DET-001", time: "2026-11-01 09:12:18", screenId: "SCR-03", channelId: "CH-03", category: "porn", confidence: "96%", riskLevel: "high", delayEnabled: true, contentActionId: "CA-001", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-002", time: "2026-11-01 09:12:19", screenId: "SCR-03", channelId: "CH-03", category: "abuse", confidence: "88%", riskLevel: "medium", delayEnabled: true, contentActionId: "CA-002", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-003", time: "2026-11-01 10:05:41", screenId: "SCR-02", channelId: "CH-02", category: "politics", confidence: "91%", riskLevel: "high", delayEnabled: true, contentActionId: "CA-003", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-004", time: "2026-11-01 11:22:03", screenId: "SCR-06", channelId: "CH-06", category: "terror", confidence: "87%", riskLevel: "high", delayEnabled: true, contentActionId: "CA-004", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-005", time: "2026-11-01 11:48:55", screenId: "SCR-01", channelId: "CH-01", category: "abuse", confidence: "79%", riskLevel: "medium", delayEnabled: true, contentActionId: "CA-005", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-006", time: "2026-11-01 13:16:27", screenId: "SCR-05", channelId: "CH-05", category: "politics", confidence: "84%", riskLevel: "medium", delayEnabled: true, contentActionId: null, frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-007", time: "2026-11-01 14:02:11", screenId: "SCR-04", channelId: "CH-04", category: "porn", confidence: "93%", riskLevel: "high", delayEnabled: true, contentActionId: "CA-006", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-008", time: "2026-11-01 14:33:40", screenId: "SCR-10", channelId: "CH-08", category: "terror", confidence: "90%", riskLevel: "high", delayEnabled: true, contentActionId: "CA-007", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-009", time: "2026-11-01 15:01:08", screenId: "SCR-02", channelId: "CH-02", category: "abuse", confidence: "81%", riskLevel: "low", delayEnabled: true, contentActionId: "CA-008", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-010", time: "2026-11-01 15:40:22", screenId: "SCR-06", channelId: "CH-06", category: "porn", confidence: "95%", riskLevel: "high", delayEnabled: true, contentActionId: "CA-009", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-011", time: "2026-10-31 16:18:09", screenId: "SCR-01", channelId: "CH-01", category: "politics", confidence: "86%", riskLevel: "medium", delayEnabled: true, contentActionId: "CA-010", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-012", time: "2026-10-31 17:05:44", screenId: "SCR-03", channelId: "CH-03", category: "abuse", confidence: "77%", riskLevel: "low", delayEnabled: true, contentActionId: "CA-011", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-013", time: "2026-10-31 18:22:01", screenId: "SCR-05", channelId: "CH-05", category: "terror", confidence: "89%", riskLevel: "high", delayEnabled: true, contentActionId: "CA-012", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-014", time: "2026-10-30 09:41:33", screenId: "SCR-04", channelId: "CH-04", category: "porn", confidence: "92%", riskLevel: "high", delayEnabled: true, contentActionId: "CA-013", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-015", time: "2026-10-30 11:12:50", screenId: "SCR-08", channelId: "CH-01", category: "politics", confidence: "80%", riskLevel: "medium", delayEnabled: false, contentActionId: null, frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-016", time: "2026-11-01 16:10:15", screenId: "SCR-02", channelId: "CH-02", category: "politics", confidence: "94%", riskLevel: "high", delayEnabled: true, contentActionId: "CA-014", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-017", time: "2026-11-01 16:20:48", screenId: "SCR-03", channelId: "CH-03", category: "porn", confidence: "97%", riskLevel: "high", delayEnabled: true, contentActionId: "CA-015", frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-018", time: "2026-11-01 16:28:03", screenId: "SCR-10", channelId: "CH-08", category: "abuse", confidence: "85%", riskLevel: "medium", delayEnabled: true, contentActionId: null, frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-019", time: "2026-11-01 08:30:11", screenId: "SCR-01", channelId: "CH-01", category: "terror", confidence: "83%", riskLevel: "medium", delayEnabled: true, contentActionId: null, frameNote: "边缘截帧已脱敏，原型不展示" },
    { id: "DET-020", time: "2026-11-01 08:55:29", screenId: "SCR-06", channelId: "CH-06", category: "abuse", confidence: "76%", riskLevel: "low", delayEnabled: true, contentActionId: null, frameNote: "边缘截帧已脱敏，原型不展示" },
  ];

  let contentActions = [
    { id: "CA-001", time: "2026-11-01 09:12:20", screenId: "SCR-03", detectionId: "DET-001", triggerCategory: "porn", action: "cut", mode: "auto", result: "cut_done", cutAt: "2026-11-01 09:12:20", restoreAt: null },
    { id: "CA-002", time: "2026-11-01 09:12:25", screenId: "SCR-03", detectionId: "DET-002", triggerCategory: "abuse", action: "cut", mode: "auto", result: "pending_confirm", cutAt: "2026-11-01 09:12:25", restoreAt: null },
    { id: "CA-003", time: "2026-11-01 10:05:42", screenId: "SCR-02", detectionId: "DET-003", triggerCategory: "politics", action: "cut", mode: "auto", result: "restored", cutAt: "2026-11-01 10:05:42", restoreAt: "2026-11-01 10:08:01" },
    { id: "CA-004", time: "2026-11-01 11:22:04", screenId: "SCR-06", detectionId: "DET-004", triggerCategory: "terror", action: "cut", mode: "auto", result: "restored", cutAt: "2026-11-01 11:22:04", restoreAt: "2026-11-01 11:25:18" },
    { id: "CA-005", time: "2026-11-01 11:48:56", screenId: "SCR-01", detectionId: "DET-005", triggerCategory: "abuse", action: "cut", mode: "auto", result: "restored", cutAt: "2026-11-01 11:48:56", restoreAt: "2026-11-01 11:50:02" },
    { id: "CA-006", time: "2026-11-01 14:02:12", screenId: "SCR-04", detectionId: "DET-007", triggerCategory: "porn", action: "cut", mode: "auto", result: "restored", cutAt: "2026-11-01 14:02:12", restoreAt: "2026-11-01 14:04:40" },
    { id: "CA-007", time: "2026-11-01 14:33:41", screenId: "SCR-10", detectionId: "DET-008", triggerCategory: "terror", action: "cut", mode: "auto", result: "pending_confirm", cutAt: "2026-11-01 14:33:41", restoreAt: null },
    { id: "CA-008", time: "2026-11-01 15:01:09", screenId: "SCR-02", detectionId: "DET-009", triggerCategory: "abuse", action: "restore", mode: "manual", result: "restored", cutAt: "2026-11-01 15:00:01", restoreAt: "2026-11-01 15:01:09" },
    { id: "CA-009", time: "2026-11-01 15:40:23", screenId: "SCR-06", detectionId: "DET-010", triggerCategory: "porn", action: "cut", mode: "auto", result: "restored", cutAt: "2026-11-01 15:40:23", restoreAt: "2026-11-01 15:42:00" },
    { id: "CA-010", time: "2026-10-31 16:18:10", screenId: "SCR-01", detectionId: "DET-011", triggerCategory: "politics", action: "cut", mode: "auto", result: "restored", cutAt: "2026-10-31 16:18:10", restoreAt: "2026-10-31 16:20:11" },
    { id: "CA-011", time: "2026-10-31 17:05:45", screenId: "SCR-03", detectionId: "DET-012", triggerCategory: "abuse", action: "cut", mode: "auto", result: "restored", cutAt: "2026-10-31 17:05:45", restoreAt: "2026-10-31 17:07:02" },
    { id: "CA-012", time: "2026-10-31 18:22:02", screenId: "SCR-05", detectionId: "DET-013", triggerCategory: "terror", action: "cut", mode: "auto", result: "restored", cutAt: "2026-10-31 18:22:02", restoreAt: "2026-10-31 18:24:30" },
    { id: "CA-013", time: "2026-10-30 09:41:34", screenId: "SCR-04", detectionId: "DET-014", triggerCategory: "porn", action: "cut", mode: "auto", result: "restored", cutAt: "2026-10-30 09:41:34", restoreAt: "2026-10-30 09:43:01" },
    { id: "CA-014", time: "2026-11-01 16:10:16", screenId: "SCR-02", detectionId: "DET-016", triggerCategory: "politics", action: "cut", mode: "auto", result: "cut_done", cutAt: "2026-11-01 16:10:16", restoreAt: null },
    { id: "CA-015", time: "2026-11-01 16:20:49", screenId: "SCR-03", detectionId: "DET-017", triggerCategory: "porn", action: "cut", mode: "auto", result: "pending_confirm", cutAt: "2026-11-01 16:20:49", restoreAt: null },
  ];

  let emergencies = [
    { id: "EM-001", time: "2026-11-01 16:10:18", screenId: "SCR-02", eventType: "tamper", severity: "critical", blockStatus: "blocked", handleStatus: "handling", latencyMs: 86, remark: "门厅节目被异常切换" },
    { id: "EM-002", time: "2026-11-01 16:20:50", screenId: "SCR-03", eventType: "abnormal_play", severity: "high", blockStatus: "blocked", handleStatus: "blocking", latencyMs: 72, remark: "不良内容切断后待确认" },
    { id: "EM-003", time: "2026-11-01 15:12:10", screenId: "SCR-07", eventType: "offline", severity: "high", blockStatus: "none", handleStatus: "pending", latencyMs: 45, remark: "宿舍门禁屏心跳中断" },
    { id: "EM-004", time: "2026-11-01 16:48:02", screenId: "SCR-10", eventType: "unauthorized", severity: "critical", blockStatus: "blocked", handleStatus: "handling", latencyMs: 58, remark: "未授权切源，已应急黑屏" },
    { id: "EM-005", time: "2026-11-01 09:12:21", screenId: "SCR-03", eventType: "abnormal_play", severity: "high", blockStatus: "released", handleStatus: "closed", latencyMs: 91, remark: "上午切断后已关闭" },
    { id: "EM-006", time: "2026-11-01 11:22:05", screenId: "SCR-06", eventType: "tamper", severity: "medium", blockStatus: "released", handleStatus: "closed", latencyMs: 110, remark: "赛事流异常片段已恢复" },
    { id: "EM-007", time: "2026-10-31 22:08:15", screenId: "SCR-09", eventType: "offline", severity: "medium", blockStatus: "none", handleStatus: "pending", latencyMs: 120, remark: "南门迎宾屏失联" },
    { id: "EM-008", time: "2026-11-01 10:05:43", screenId: "SCR-02", eventType: "tamper", severity: "high", blockStatus: "released", handleStatus: "closed", latencyMs: 64, remark: "涉政检出后自动恢复" },
    { id: "EM-009", time: "2026-11-01 14:33:42", screenId: "SCR-10", eventType: "abnormal_play", severity: "critical", blockStatus: "blocking", handleStatus: "blocking", latencyMs: 53, remark: "会议屏暴恐检出阻断中" },
    { id: "EM-010", time: "2026-10-30 14:20:00", screenId: "SCR-01", eventType: "unauthorized", severity: "medium", blockStatus: "released", handleStatus: "closed", latencyMs: 98, remark: "历史未授权操作已关闭" },
    { id: "EM-011", time: "2026-11-01 08:15:33", screenId: "SCR-05", eventType: "abnormal_play", severity: "medium", blockStatus: "released", handleStatus: "closed", latencyMs: 77, remark: "早间误报已关闭" },
    { id: "EM-012", time: "2026-11-01 12:01:09", screenId: "SCR-04", eventType: "tamper", severity: "high", blockStatus: "released", handleStatus: "closed", latencyMs: 69, remark: "午间篡改告警已处置" },
    { id: "EM-013", time: "2026-10-31 19:40:22", screenId: "SCR-08", eventType: "unauthorized", severity: "low", blockStatus: "none", handleStatus: "closed", latencyMs: 140, remark: "校史馆试播权限问题" },
    { id: "EM-014", time: "2026-11-01 13:55:01", screenId: "SCR-06", eventType: "abnormal_play", severity: "medium", blockStatus: "released", handleStatus: "closed", latencyMs: 82, remark: "延时缓冲拦截成功" },
    { id: "EM-015", time: "2026-11-01 16:55:30", screenId: "SCR-07", eventType: "offline", severity: "high", blockStatus: "none", handleStatus: "handling", latencyMs: 40, remark: "二次失联跟进中" },
  ];

  let channelSeq = 9;
  let detectionSeq = 21;
  let contentSeq = 16;
  let emergencySeq = 16;

  function screenName(id) {
    const s = screens.find((x) => x.id === id);
    return s ? s.name : "-";
  }

  function channelName(id) {
    const c = channels.find((x) => x.id === id);
    return c ? c.name : "-";
  }

  function getScreen(id) {
    const s = screens.find((x) => x.id === id);
    return s ? clone(s) : null;
  }

  function listScreens(filter) {
    const f = filter || {};
    return clone(
      screens.filter((s) => {
        if (f.deviceStatus && s.deviceStatus !== f.deviceStatus) return false;
        if (f.alarmStatus && s.alarmStatus !== f.alarmStatus) return false;
        if (f.keyword) {
          const k = String(f.keyword).toLowerCase();
          const hit = `${s.name}${s.location}${s.program}`.toLowerCase().includes(k);
          if (!hit) return false;
        }
        return true;
      })
    );
  }

  function saveScreenPerm(id, patch) {
    const s = screens.find((x) => x.id === id);
    if (!s) return null;
    if (patch.permRemoteSwitch != null) s.permRemoteSwitch = !!patch.permRemoteSwitch;
    if (patch.permEmergencyBlack != null) s.permEmergencyBlack = !!patch.permEmergencyBlack;
    if (patch.permOperators != null) s.permOperators = String(patch.permOperators);
    return clone(s);
  }

  function screenMetrics() {
    return {
      total: screens.length,
      online: screens.filter((s) => s.deviceStatus === "online").length,
      playing: screens.filter((s) => s.playStatus === "playing").length,
      alarm: screens.filter((s) => s.alarmStatus === "alarm").length,
    };
  }

  function listChannels(filter) {
    const f = filter || {};
    return clone(
      channels.filter((c) => {
        if (f.screenId && c.screenId !== f.screenId) return false;
        if (f.enabled != null && f.enabled !== "" && !!c.enabled !== (f.enabled === true || f.enabled === "true" || f.enabled === 1)) {
          if (typeof f.enabled === "boolean" && c.enabled !== f.enabled) return false;
          if (typeof f.enabled === "string" && String(c.enabled) !== f.enabled) return false;
        }
        return true;
      })
    );
  }

  function getChannel(id) {
    const c = channels.find((x) => x.id === id);
    return c ? clone(c) : null;
  }

  function saveChannel(payload) {
    const p = payload || {};
    if (p.id) {
      const c = channels.find((x) => x.id === p.id);
      if (!c) return null;
      if (p.name != null) c.name = p.name;
      if (p.screenId != null) c.screenId = p.screenId;
      if (p.categories != null) c.categories = [...p.categories];
      if (p.delaySec != null) c.delaySec = Number(p.delaySec) || 0;
      if (p.enabled != null) c.enabled = !!p.enabled;
      return clone(c);
    }
    const id = `CH-${String(channelSeq++).padStart(2, "0")}`;
    const row = {
      id,
      name: p.name || `通道${id}`,
      screenId: p.screenId,
      categories: p.categories ? [...p.categories] : ["porn", "politics", "terror", "abuse"],
      delaySec: Number(p.delaySec) || 5,
      enabled: p.enabled != null ? !!p.enabled : true,
    };
    channels.push(row);
    return clone(row);
  }

  function listDetections(filter) {
    const f = filter || {};
    return clone(
      detections.filter((d) => {
        if (f.screenId && d.screenId !== f.screenId) return false;
        if (f.category && d.category !== f.category) return false;
        if (f.riskLevel && d.riskLevel !== f.riskLevel) return false;
        if (f.dateFrom && d.time < f.dateFrom) return false;
        if (f.dateTo && d.time > `${f.dateTo} 23:59:59` && f.dateTo.length <= 10) return false;
        if (f.dateTo && f.dateTo.length > 10 && d.time > f.dateTo) return false;
        if (f.keyword) {
          const k = String(f.keyword).toLowerCase();
          const text = `${screenName(d.screenId)}${channelName(d.channelId)}${d.id}`.toLowerCase();
          if (!text.includes(k)) return false;
        }
        return true;
      })
    );
  }

  function getDetection(id) {
    const d = detections.find((x) => x.id === id);
    return d ? clone(d) : null;
  }

  function protectMetrics() {
    return {
      channelCount: channels.length,
      todayDetections: detections.filter((d) => d.time.startsWith(MOCK_TODAY)).length,
      delayEnabledCount: channels.filter((c) => c.enabled && c.delaySec > 0).length,
    };
  }

  function listContentActions(filter) {
    const f = filter || {};
    return clone(
      contentActions.filter((a) => {
        if (f.screenId && a.screenId !== f.screenId) return false;
        if (f.result && a.result !== f.result) return false;
        if (f.mode && a.mode !== f.mode) return false;
        if (f.triggerCategory && a.triggerCategory !== f.triggerCategory) return false;
        if (f.category && a.triggerCategory !== f.category) return false;
        if (f.dateFrom && a.time < f.dateFrom) return false;
        if (f.dateTo && f.dateTo.length <= 10 && a.time > `${f.dateTo} 23:59:59`) return false;
        if (f.dateTo && f.dateTo.length > 10 && a.time > f.dateTo) return false;
        return true;
      })
    );
  }

  function getContentAction(id) {
    const a = contentActions.find((x) => x.id === id);
    return a ? clone(a) : null;
  }

  function confirmContentRestore(id) {
    const a = contentActions.find((x) => x.id === id);
    if (!a || a.result !== "pending_confirm") return null;
    a.action = "restore";
    a.mode = "manual";
    a.result = "restored";
    a.restoreAt = formatNow();
    a.time = a.restoreAt;
    const s = screens.find((x) => x.id === a.screenId);
    if (s && s.playStatus === "cut") s.playStatus = "playing";
    return clone(a);
  }

  function contentMetrics() {
    const today = contentActions.filter((a) => a.time.startsWith(MOCK_TODAY) || (a.cutAt && a.cutAt.startsWith(MOCK_TODAY)) || (a.restoreAt && a.restoreAt.startsWith(MOCK_TODAY)));
    return {
      todayCut: today.filter((a) => a.action === "cut" || a.cutAt).length,
      todayRestore: contentActions.filter((a) => a.restoreAt && a.restoreAt.startsWith(MOCK_TODAY)).length,
      pendingConfirm: contentActions.filter((a) => a.result === "pending_confirm").length,
    };
  }

  function listEmergencies(filter) {
    const f = filter || {};
    return clone(
      emergencies.filter((e) => {
        if (f.screenId && e.screenId !== f.screenId) return false;
        if (f.eventType && e.eventType !== f.eventType) return false;
        if (f.severity && e.severity !== f.severity) return false;
        if (f.handleStatus && e.handleStatus !== f.handleStatus) return false;
        if (f.dateFrom && e.time < f.dateFrom) return false;
        if (f.dateTo && f.dateTo.length <= 10 && e.time > `${f.dateTo} 23:59:59`) return false;
        if (f.dateTo && f.dateTo.length > 10 && e.time > f.dateTo) return false;
        return true;
      })
    );
  }

  function getEmergency(id) {
    const e = emergencies.find((x) => x.id === id);
    return e ? clone(e) : null;
  }

  function syncScreenAlarm(screenId) {
    const s = screens.find((x) => x.id === screenId);
    if (!s) return;
    const open = emergencies.some((e) => e.screenId === screenId && e.handleStatus !== "closed");
    s.alarmStatus = open ? "alarm" : "none";
  }

  function handleEmergency(id, payload) {
    const e = emergencies.find((x) => x.id === id);
    if (!e) return null;
    const action = (payload && payload.action) || "";
    if (payload && payload.remark != null) e.remark = payload.remark;
    const s = screens.find((x) => x.id === e.screenId);
    if (action === "block") {
      e.blockStatus = "blocked";
      e.handleStatus = "handling";
      if (s) s.playStatus = s.permEmergencyBlack ? "blackout" : "cut";
    } else if (action === "resume") {
      e.blockStatus = "released";
      e.handleStatus = "handling";
      if (s) s.playStatus = "playing";
    } else if (action === "escalate") {
      e.handleStatus = "handling";
    }
    syncScreenAlarm(e.screenId);
    return clone(e);
  }

  function closeEmergency(id) {
    const e = emergencies.find((x) => x.id === id);
    if (!e) return null;
    e.handleStatus = "closed";
    if (e.blockStatus === "blocking" || e.blockStatus === "blocked") e.blockStatus = "released";
    syncScreenAlarm(e.screenId);
    return clone(e);
  }

  function emergencyBlackout(screenIds) {
    let ids = screenIds && screenIds.length ? [...screenIds] : screens.filter((s) => s.alarmStatus === "alarm" || s.deviceStatus === "online").map((s) => s.id);
    const touched = [];
    ids.forEach((sid) => {
      const s = screens.find((x) => x.id === sid);
      if (!s) return;
      s.playStatus = "blackout";
      s.alarmStatus = "alarm";
      const id = `EM-${String(emergencySeq++).padStart(3, "0")}`;
      emergencies.unshift({
        id,
        time: formatNow(),
        screenId: sid,
        eventType: "unauthorized",
        severity: "critical",
        blockStatus: "blocked",
        handleStatus: "handling",
        latencyMs: 30 + Math.floor(Math.random() * 40),
        remark: "一键应急黑屏",
      });
      touched.push(sid);
    });
    return { count: touched.length, screenIds: touched };
  }

  function emergencyMetrics() {
    const today = emergencies.filter((e) => e.time.startsWith(MOCK_TODAY));
    return {
      today: today.length,
      blocking: emergencies.filter((e) => e.handleStatus === "blocking" || e.blockStatus === "blocking" || e.blockStatus === "blocked").filter((e) => e.handleStatus !== "closed").length,
      handling: emergencies.filter((e) => e.handleStatus === "handling").length,
      closed: emergencies.filter((e) => e.handleStatus === "closed").length,
    };
  }

  function listOpenAlarms(limit) {
    const n = limit == null ? 8 : Number(limit);
    return clone(
      emergencies
        .filter((e) => e.handleStatus !== "closed")
        .sort((a, b) => (a.time < b.time ? 1 : -1))
        .slice(0, n)
    );
  }

  function permSummary(s) {
    const a = s.permRemoteSwitch ? "远程切源开" : "远程切源关";
    const b = s.permEmergencyBlack ? "紧急黑屏开" : "紧急黑屏关";
    return `${a} · ${b}`;
  }

  window.ScreenProtect = {
    MOCK_TODAY,
    CATEGORY_LABEL,
    EVENT_TYPE_LABEL,
    DEVICE_STATUS_LABEL,
    PLAY_STATUS_LABEL,
    deviceTag,
    playTag,
    alarmTag,
    categoryTag,
    riskTag,
    actionTag,
    modeTag,
    resultTag,
    eventTypeTag,
    severityTag,
    blockTag,
    handleTag,
    screenName,
    channelName,
    permSummary,
    listScreens,
    getScreen,
    saveScreenPerm,
    screenMetrics,
    listChannels,
    getChannel,
    saveChannel,
    listDetections,
    getDetection,
    protectMetrics,
    listContentActions,
    getContentAction,
    confirmContentRestore,
    contentMetrics,
    listEmergencies,
    getEmergency,
    handleEmergency,
    closeEmergency,
    emergencyBlackout,
    emergencyMetrics,
    listOpenAlarms,
  };
})();
