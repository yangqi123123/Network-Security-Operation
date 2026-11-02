(function () {
  const TYPES = ["路由器", "交换机", "安全设备", "负载均衡"];
  const SNMP = ["V1", "V2c", "V3"];

  const seedDevices = [
    {
      id: "D001",
      name: "焊装楼核心交换机",
      ip: "192.168.1.233",
      type: "交换机",
      snmpVersion: "V2c",
      community: "public",
      status: "online",
      cpu: 42,
      mem: 58,
      availability: 99.8,
      portUp: 46,
      portDown: 2,
      alarmCount: 1,
      protocol: "SNMP+Telnet",
    },
    {
      id: "D002",
      name: "汇聚路由器-A",
      ip: "10.0.0.1",
      type: "路由器",
      snmpVersion: "V3",
      community: "netops",
      status: "alarm",
      cpu: 78,
      mem: 81,
      availability: 98.2,
      portUp: 12,
      portDown: 0,
      alarmCount: 3,
      protocol: "SNMPv3",
    },
    {
      id: "D003",
      name: "边界防火墙",
      ip: "10.0.0.8",
      type: "安全设备",
      snmpVersion: "V2c",
      community: "secure",
      status: "online",
      cpu: 35,
      mem: 44,
      availability: 99.9,
      portUp: 8,
      portDown: 0,
      alarmCount: 0,
      protocol: "SNMPv2c",
    },
    {
      id: "D004",
      name: "应用负载均衡",
      ip: "10.0.1.20",
      type: "负载均衡",
      snmpVersion: "V1",
      community: "public",
      status: "offline",
      cpu: 0,
      mem: 0,
      availability: 0,
      portUp: 0,
      portDown: 16,
      alarmCount: 5,
      protocol: "SNMPv1",
    },
    {
      id: "D005",
      name: "接入交换机-B12",
      ip: "192.168.12.1",
      type: "交换机",
      snmpVersion: "V2c",
      community: "public",
      status: "online",
      cpu: 22,
      mem: 31,
      availability: 99.5,
      portUp: 22,
      portDown: 2,
      alarmCount: 0,
      protocol: "SNMPv2c",
    },
  ];

  let devices = seedDevices.map((d) => ({ ...d }));

  function maskCommunity(c) {
    if (!c) return "—";
    if (c.length <= 3) return "***";
    return `${c.slice(0, 3)}***`;
  }

  function summarize() {
    return {
      total: devices.length,
      online: devices.filter((d) => d.status === "online").length,
      alarm: devices.filter((d) => d.status === "alarm").length,
      offline: devices.filter((d) => d.status === "offline").length,
    };
  }

  function listDevices(filters = {}) {
    return devices
      .filter((d) => {
        if (filters.name && !d.name.includes(filters.name)) return false;
        if (filters.ip && !d.ip.includes(filters.ip)) return false;
        if (filters.type && d.type !== filters.type) return false;
        if (filters.snmpVersion && d.snmpVersion !== filters.snmpVersion) return false;
        if (filters.status && d.status !== filters.status) return false;
        return true;
      })
      .map((d) => ({
        ...d,
        communityMasked: maskCommunity(d.community),
        portSummary: `${d.portUp}↑ / ${d.portDown}↓`,
      }));
  }

  function getDevice(id) {
    const d = devices.find((x) => x.id === id) || devices[0];
    return { ...d, communityMasked: maskCommunity(d.community) };
  }

  function addDevice(payload) {
    const id = `D${String(devices.length + 1).padStart(3, "0")}`;
    const row = {
      id,
      name: payload.name || `设备-${payload.ip}`,
      ip: payload.ip,
      type: payload.type || "交换机",
      snmpVersion: payload.snmpVersion || "V2c",
      community: payload.community || "public",
      status: "online",
      cpu: 10 + Math.floor(Math.random() * 40),
      mem: 20 + Math.floor(Math.random() * 40),
      availability: 99,
      portUp: 8,
      portDown: 0,
      alarmCount: 0,
      protocol: `SNMP${payload.snmpVersion || "V2c"}`,
    };
    devices.push(row);
    return row;
  }

  function removeDevice(id) {
    devices = devices.filter((d) => d.id !== id);
  }

  function updateDevice(id, patch) {
    const i = devices.findIndex((d) => d.id === id);
    if (i < 0) return null;
    devices[i] = { ...devices[i], ...patch };
    return devices[i];
  }

  function discover(opts) {
    const mode = opts.mode || "网段";
    const base = (opts.ip || "192.168.50").replace(/\.\d+$/, "");
    return [1, 2, 3].map((n, idx) => ({
      tempId: `T${idx + 1}`,
      name: `${mode}发现-设备${n}`,
      ip: `${base}.${10 + n}`,
      type: TYPES[idx % TYPES.length],
      snmpVersion: opts.snmpVersion || "V2c",
      community: opts.community || "public",
      selected: true,
    }));
  }

  function importDiscovered(rows) {
    return rows
      .filter((r) => r.selected !== false)
      .map((r) =>
        addDevice({
          name: r.name,
          ip: r.ip,
          type: r.type,
          snmpVersion: r.snmpVersion,
          community: r.community,
        })
      );
  }

  function makeSeries(base, amp, points = 24) {
    const now = Date.now();
    const out = [];
    for (let i = points - 1; i >= 0; i -= 1) {
      const t = new Date(now - i * 5 * 60 * 1000);
      const hh = String(t.getHours()).padStart(2, "0");
      const mm = String(t.getMinutes()).padStart(2, "0");
      out.push({
        t: `${hh}:${mm}`,
        v: Number((base + Math.sin(i / 3) * amp + Math.random() * amp * 0.3).toFixed(1)),
      });
    }
    return out;
  }

  function getRealtime(deviceId) {
    const d = getDevice(deviceId);
    return {
      cpu: makeSeries(d.cpu || 30, 8),
      mem: makeSeries(d.mem || 40, 6),
      throughput: makeSeries(120, 40),
    };
  }

  function refreshRealtime(deviceId) {
    const d = getDevice(deviceId);
    const cpu = Math.min(99, Math.max(1, (d.cpu || 30) + (Math.random() * 6 - 3)));
    const mem = Math.min(99, Math.max(1, (d.mem || 40) + (Math.random() * 4 - 2)));
    updateDevice(d.id, { cpu: Number(cpu.toFixed(1)), mem: Number(mem.toFixed(1)) });
    return getRealtime(d.id);
  }

  function getPorts(deviceId) {
    const d = getDevice(deviceId);
    const n = Math.min(12, (d.portUp || 0) + (d.portDown || 0) || 8);
    const ports = [];
    for (let i = 1; i <= n; i += 1) {
      const down = i > (d.portUp || n - 1);
      ports.push({
        id: `P${i}`,
        deviceId: d.id,
        name: `GigabitEthernet1/0/${i}`,
        adminStatus: "up",
        operStatus: down ? "down" : "up",
        txRate: down ? 0 : Number((Math.random() * 80 + 5).toFixed(2)),
        rxRate: down ? 0 : Number((Math.random() * 60 + 3).toFixed(2)),
        icmpRate: down ? 0 : Number((Math.random() * 2).toFixed(2)),
        txPktRate: down ? 0 : Math.floor(Math.random() * 5000 + 200),
        rxPktRate: down ? 0 : Math.floor(Math.random() * 4000 + 150),
      });
    }
    return ports;
  }

  function runTool(deviceId, kind, extra) {
    const d = getDevice(deviceId);
    if (kind === "ping") {
      return {
        kind,
        title: `Ping ${d.ip}`,
        text: `PING ${d.ip}: 56 data bytes\n64 bytes: icmp_seq=1 ttl=64 time=1.2 ms\n64 bytes: icmp_seq=2 ttl=64 time=1.1 ms\n64 bytes: icmp_seq=3 ttl=64 time=1.3 ms\n--- ${d.ip} ping statistics ---\n3 packets transmitted, 3 received, 0% loss\nrtt min/avg/max = 1.1/1.2/1.3 ms`,
      };
    }
    if (kind === "arp") {
      return {
        kind,
        title: "ARP 表",
        rows: [
          { ip: "192.168.1.1", mac: "00:11:22:33:44:55", iface: "Vlan1", type: "dynamic" },
          { ip: "192.168.1.10", mac: "aa:bb:cc:dd:ee:01", iface: "GE1/0/1", type: "dynamic" },
          { ip: d.ip, mac: "80:e4:55:5c:4a:68", iface: "GE1/0/24", type: "static" },
        ],
      };
    }
    if (kind === "route") {
      return {
        kind,
        title: "路由表",
        rows: [
          { dest: "0.0.0.0/0", nextHop: "10.0.0.1", proto: "static", metric: 1 },
          { dest: "192.168.1.0/24", nextHop: "直接连接", proto: "connected", metric: 0 },
          { dest: "10.0.0.0/8", nextHop: "10.0.0.2", proto: "ospf", metric: 20 },
        ],
      };
    }
    if (kind === "trace") {
      return {
        kind,
        title: `TraceRoute ${extra?.target || "8.8.8.8"}`,
        text: `1  192.168.1.1  0.8 ms\n2  10.0.0.1  2.1 ms\n3  10.1.0.1  5.4 ms\n4  ${extra?.target || "8.8.8.8"}  12.0 ms`,
      };
    }
    if (kind === "tcp") {
      const port = extra?.port || 22;
      return {
        kind,
        title: `TCP ${d.ip}:${port}`,
        text: `探测 ${d.ip}:${port} → 开放 (Mock)\n耗时 3 ms`,
      };
    }
    if (kind === "url") {
      const url = extra?.url || "https://example.com";
      return {
        kind,
        title: "URL 检测",
        text: `GET ${url}\n状态 200 OK\n跳转链: ${url} → /home (302) → 200\n耗时 86 ms`,
      };
    }
    return {
      kind: "cmd",
      title: "自定义命令",
      text: `> ${extra?.cmd || "display version"}\nH3C Comware Software, Version 7.1\nUptime is 120 weeks\n(Mock output)`,
    };
  }

  function getHistory(deviceId, rangeKey) {
    const points = rangeKey === "1h" ? 12 : rangeKey === "7d" ? 28 : rangeKey === "14d" ? 28 : 30;
    return {
      range: rangeKey,
      availability: makeSeries(99, 0.5, points),
      cpu: makeSeries(45, 15, points),
      mem: makeSeries(50, 12, points),
    };
  }

  const REPORT_TYPES = [
    { key: "device-avail", label: "网络设备可用率" },
    { key: "link-conn", label: "线路连通率" },
    { key: "device-load", label: "网络设备负载分析" },
    { key: "link-load", label: "线路负载分析" },
    { key: "alarm-stat", label: "网络告警统计" },
  ];

  function getReport(type, rangeKey) {
    const label = (REPORT_TYPES.find((t) => t.key === type) || REPORT_TYPES[0]).label;
    const series = makeSeries(type === "alarm-stat" ? 12 : 95, type === "alarm-stat" ? 5 : 3, 14);
    const rows = devices.slice(0, 5).map((d, i) => ({
      name: d.name,
      ip: d.ip,
      value: type === "alarm-stat" ? d.alarmCount : Number((96 + Math.random() * 3).toFixed(2)),
      unit: type === "alarm-stat" ? "次" : "%",
      rank: i + 1,
    }));
    return {
      type,
      label,
      range: rangeKey,
      summary: {
        avg: type === "alarm-stat" ? rows.reduce((s, r) => s + r.value, 0) : 98.6,
        max: type === "alarm-stat" ? Math.max(...rows.map((r) => r.value)) : 99.9,
        min: type === "alarm-stat" ? Math.min(...rows.map((r) => r.value)) : 96.1,
      },
      rows,
      series,
    };
  }

  function getTopologyPreview() {
    const nodes = devices.slice(0, 6).map((d, i) => ({
      id: d.id,
      name: d.name,
      x: 80 + (i % 3) * 160,
      y: 50 + Math.floor(i / 3) * 100,
      status: d.status,
    }));
    const links = [];
    for (let i = 1; i < nodes.length; i += 1) {
      links.push({ from: nodes[0].id, to: nodes[i].id });
    }
    return { nodes, links };
  }

  window.PerfMonitor = {
    TYPES,
    SNMP,
    REPORT_TYPES,
    maskCommunity,
    summarize,
    listDevices,
    getDevice,
    addDevice,
    removeDevice,
    updateDevice,
    discover,
    importDiscovered,
    getRealtime,
    refreshRealtime,
    getPorts,
    runTool,
    getHistory,
    getReport,
    getTopologyPreview,
  };
})();
