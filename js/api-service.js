/**
 * API Service Layer
 * Central data service — mock data now, ready for real backend endpoints.
 * Replace fetch methods with actual API calls when connecting to Flask/Supabase.
 *
 * Planned endpoints:
 *   GET  /api/intersections
 *   GET  /api/traffic-data
 *   GET  /api/cameras
 *   GET  /api/incidents
 *   GET  /api/system-status
 *   POST /api/control/traffic-lights
 *   POST /api/control/cameras
 */

const API = (() => {
  // Base URL for future backend
  const BASE_URL = '/api';

  // Flag to toggle between mock and real API
  const USE_MOCK = true;

  /* ---------- Mock Data Store ---------- */
  let mockState = {
    intersections: [
      {
        id: 'INT-01',
        name: 'Central Plaza',
        location: 'Main St & 1st Ave',
        cameraStatus: 'online',
        status: 'active',
        totalVehicles: 28,
        density: 'medium',
        densityPercent: 55,
        avgSpeed: 32,
        emergency: false,
        incident: false,
        greenDirection: 'north',
        greenRemaining: 28,
        directions: {
          north: { vehicles: 12, density: 'high', densityPercent: 72, light: 'green', remaining: 28 },
          south: { vehicles: 5, density: 'low', densityPercent: 25, light: 'red', remaining: 42 },
          east: { vehicles: 7, density: 'medium', densityPercent: 40, light: 'red', remaining: 42 },
          west: { vehicles: 4, density: 'low', densityPercent: 20, light: 'red', remaining: 42 }
        }
      },
      {
        id: 'INT-02',
        name: 'Tech Park Junction',
        location: 'Innovation Blvd & 2nd St',
        cameraStatus: 'online',
        status: 'active',
        totalVehicles: 41,
        density: 'high',
        densityPercent: 78,
        avgSpeed: 18,
        emergency: true,
        incident: false,
        greenDirection: 'east',
        greenRemaining: 15,
        directions: {
          north: { vehicles: 8, density: 'medium', densityPercent: 45, light: 'red', remaining: 35 },
          south: { vehicles: 6, density: 'low', densityPercent: 30, light: 'red', remaining: 35 },
          east: { vehicles: 18, density: 'high', densityPercent: 85, light: 'green', remaining: 15 },
          west: { vehicles: 9, density: 'medium', densityPercent: 50, light: 'red', remaining: 35 }
        }
      },
      {
        id: 'INT-03',
        name: 'Harbor Crossing',
        location: 'Coastal Rd & Pier Ave',
        cameraStatus: 'online',
        status: 'active',
        totalVehicles: 19,
        density: 'low',
        densityPercent: 32,
        avgSpeed: 45,
        emergency: false,
        incident: false,
        greenDirection: 'south',
        greenRemaining: 35,
        directions: {
          north: { vehicles: 3, density: 'low', densityPercent: 15, light: 'red', remaining: 25 },
          south: { vehicles: 9, density: 'medium', densityPercent: 48, light: 'green', remaining: 35 },
          east: { vehicles: 4, density: 'low', densityPercent: 20, light: 'red', remaining: 25 },
          west: { vehicles: 3, density: 'low', densityPercent: 18, light: 'red', remaining: 25 }
        }
      },
      {
        id: 'INT-04',
        name: 'University Circle',
        location: 'Campus Dr & College Ave',
        cameraStatus: 'online',
        status: 'active',
        totalVehicles: 36,
        density: 'high',
        densityPercent: 68,
        avgSpeed: 22,
        emergency: false,
        incident: false,
        greenDirection: 'west',
        greenRemaining: 20,
        directions: {
          north: { vehicles: 10, density: 'medium', densityPercent: 55, light: 'red', remaining: 40 },
          south: { vehicles: 7, density: 'medium', densityPercent: 38, light: 'red', remaining: 40 },
          east: { vehicles: 5, density: 'low', densityPercent: 28, light: 'red', remaining: 40 },
          west: { vehicles: 14, density: 'high', densityPercent: 70, light: 'green', remaining: 20 }
        }
      }
    ],

    cameras: [
      {
        id: 'CAM-01',
        intersectionId: 'INT-01',
        intersectionName: 'Central Plaza',
        status: 'online',
        vehicleCount: 28,
        fps: 28,
        confidence: 94.2,
        lastUpdate: Date.now(),
        detections: [
          { type: 'car', confidence: 96, x: 15, y: 40, w: 18, h: 22 },
          { type: 'car', confidence: 93, x: 45, y: 35, w: 16, h: 20 },
          { type: 'bus', confidence: 92, x: 65, y: 30, w: 25, h: 35 },
          { type: 'motorcycle', confidence: 89, x: 30, y: 55, w: 8, h: 12 }
        ]
      },
      {
        id: 'CAM-02',
        intersectionId: 'INT-02',
        intersectionName: 'Tech Park Junction',
        status: 'online',
        vehicleCount: 41,
        fps: 30,
        confidence: 95.8,
        lastUpdate: Date.now(),
        detections: [
          { type: 'car', confidence: 97, x: 10, y: 30, w: 20, h: 25 },
          { type: 'truck', confidence: 94, x: 40, y: 25, w: 28, h: 40 },
          { type: 'ambulance', confidence: 98, x: 70, y: 40, w: 22, h: 28 },
          { type: 'car', confidence: 91, x: 25, y: 60, w: 15, h: 18 },
          { type: 'car', confidence: 95, x: 55, y: 55, w: 14, h: 17 }
        ]
      },
      {
        id: 'CAM-03',
        intersectionId: 'INT-03',
        intersectionName: 'Harbor Crossing',
        status: 'online',
        vehicleCount: 19,
        fps: 27,
        confidence: 93.5,
        lastUpdate: Date.now(),
        detections: [
          { type: 'car', confidence: 95, x: 20, y: 35, w: 17, h: 21 },
          { type: 'car', confidence: 92, x: 50, y: 45, w: 16, h: 20 },
          { type: 'motorcycle', confidence: 88, x: 70, y: 50, w: 7, h: 11 }
        ]
      },
      {
        id: 'CAM-04',
        intersectionId: 'INT-04',
        intersectionName: 'University Circle',
        status: 'online',
        vehicleCount: 36,
        fps: 29,
        confidence: 94.7,
        lastUpdate: Date.now(),
        detections: [
          { type: 'car', confidence: 96, x: 12, y: 28, w: 18, h: 23 },
          { type: 'bus', confidence: 93, x: 35, y: 20, w: 26, h: 38 },
          { type: 'car', confidence: 94, x: 60, y: 40, w: 15, h: 19 },
          { type: 'truck', confidence: 91, x: 75, y: 30, w: 20, h: 32 },
          { type: 'motorcycle', confidence: 87, x: 40, y: 60, w: 8, h: 12 }
        ]
      }
    ],

    incidents: [
      {
        id: 'ALT-001',
        type: 'Emergency Vehicle Detected',
        intersection: 'INT-02',
        intersectionName: 'Tech Park Junction',
        priority: 'critical',
        timestamp: Date.now() - 120000,
        status: 'active',
        description: 'Ambulance detected approaching from east direction. Priority routing activated.'
      },
      {
        id: 'ALT-002',
        type: 'Heavy Traffic',
        intersection: 'INT-04',
        intersectionName: 'University Circle',
        priority: 'high',
        timestamp: Date.now() - 480000,
        status: 'active',
        description: 'Traffic density exceeded 65% threshold on west approach.'
      },
      {
        id: 'ALT-003',
        type: 'Heavy Traffic',
        intersection: 'INT-02',
        intersectionName: 'Tech Park Junction',
        priority: 'medium',
        timestamp: Date.now() - 900000,
        status: 'active',
        description: 'Elevated vehicle count on east-west corridor.'
      },
      {
        id: 'ALT-004',
        type: 'Unusual Vehicle Movement',
        intersection: 'INT-01',
        intersectionName: 'Central Plaza',
        priority: 'low',
        timestamp: Date.now() - 1800000,
        status: 'resolved',
        description: 'Vehicle stopped in intersection for 15 seconds. Cleared automatically.'
      },
      {
        id: 'ALT-005',
        type: 'Camera Offline',
        intersection: 'INT-03',
        intersectionName: 'Harbor Crossing',
        priority: 'high',
        timestamp: Date.now() - 3600000,
        status: 'resolved',
        description: 'CAM-03 connection lost for 2 minutes. Auto-reconnected.'
      }
    ],

    systemStatus: {
      backend: 'online',
      database: 'online',
      esp32Devices: 4,
      esp32Online: 4,
      lastSync: Date.now(),
      mode: 'automatic',
      uptime: 86400 * 3 + 3600 * 5
    },

    analytics: {
      hourlyVehicles: [12, 8, 5, 3, 4, 15, 42, 68, 85, 72, 65, 70, 78, 82, 75, 80, 88, 95, 70, 55, 40, 30, 22, 15],
      densityByIntersection: [55, 78, 32, 68],
      vehicleTypes: { cars: 62, buses: 12, trucks: 10, motorcycles: 12, emergency: 4 },
      avgSpeeds: [32, 18, 45, 22]
    }
  };

  /* ---------- Helpers ---------- */
  function delay(ms = 100) {
    return new Promise(r => setTimeout(r, ms));
  }

  function getMockState() {
    return mockState;
  }

  function updateMockState(updater) {
    if (typeof updater === 'function') {
      mockState = updater(mockState);
    } else {
      mockState = { ...mockState, ...updater };
    }
  }

  /* ---------- Public API Methods ---------- */

  async function getIntersections() {
    if (USE_MOCK) {
      await delay(50);
      return { success: true, data: mockState.intersections };
    }
    const res = await fetch(`${BASE_URL}/intersections`);
    return res.json();
  }

  async function getIntersection(id) {
    if (USE_MOCK) {
      await delay(30);
      const item = mockState.intersections.find(i => i.id === id);
      return { success: !!item, data: item };
    }
    const res = await fetch(`${BASE_URL}/intersections/${id}`);
    return res.json();
  }

  async function getCameras() {
    if (USE_MOCK) {
      await delay(50);
      return { success: true, data: mockState.cameras };
    }
    const res = await fetch(`${BASE_URL}/cameras`);
    return res.json();
  }

  async function getIncidents(filters = {}) {
    if (USE_MOCK) {
      await delay(50);
      let data = [...mockState.incidents];
      if (filters.status) data = data.filter(i => i.status === filters.status);
      if (filters.priority) data = data.filter(i => i.priority === filters.priority);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        data = data.filter(i =>
          i.type.toLowerCase().includes(q) ||
          i.intersectionName.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)
        );
      }
      return { success: true, data };
    }
    const params = new URLSearchParams(filters);
    const res = await fetch(`${BASE_URL}/incidents?${params}`);
    return res.json();
  }

  async function resolveIncident(id) {
    if (USE_MOCK) {
      await delay(100);
      const incident = mockState.incidents.find(i => i.id === id);
      if (incident) incident.status = 'resolved';
      return { success: true, data: incident };
    }
    const res = await fetch(`${BASE_URL}/incidents/${id}/resolve`, { method: 'POST' });
    return res.json();
  }

  async function getSystemStatus() {
    if (USE_MOCK) {
      await delay(30);
      return { success: true, data: { ...mockState.systemStatus, lastSync: Date.now() } };
    }
    const res = await fetch(`${BASE_URL}/system-status`);
    return res.json();
  }

  async function getAnalytics(range = 'today') {
    if (USE_MOCK) {
      await delay(80);
      return { success: true, data: mockState.analytics };
    }
    const res = await fetch(`${BASE_URL}/analytics?range=${range}`);
    return res.json();
  }

  async function getDashboardStats() {
    if (USE_MOCK) {
      await delay(40);
      const ints = mockState.intersections;
      const totalVehicles = ints.reduce((s, i) => s + i.totalVehicles, 0);
      const avgDensity = Math.round(ints.reduce((s, i) => s + i.densityPercent, 0) / ints.length);
      const densityLabel = avgDensity > 65 ? 'High' : avgDensity > 40 ? 'Medium' : 'Low';
      const emergencyCount = ints.filter(i => i.emergency).length;
      const activeIncidents = mockState.incidents.filter(i => i.status === 'active').length;
      const camerasOnline = mockState.cameras.filter(c => c.status === 'online').length;

      return {
        success: true,
        data: {
          activeIntersections: ints.length,
          totalVehicles,
          densityLabel,
          densityPercent: avgDensity,
          camerasOnline,
          totalCameras: mockState.cameras.length,
          emergencyVehicles: emergencyCount,
          activeIncidents,
          systemStatus: mockState.systemStatus.backend === 'online' ? 'Operational' : 'Degraded'
        }
      };
    }
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    return res.json();
  }

  async function setTrafficMode(mode) {
    if (USE_MOCK) {
      await delay(150);
      mockState.systemStatus.mode = mode;
      return { success: true, data: { mode } };
    }
    const res = await fetch(`${BASE_URL}/control/mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    return res.json();
  }

  async function controlTrafficLights(action, params = {}) {
    if (USE_MOCK) {
      await delay(200);
      return { success: true, data: { action, ...params } };
    }
    const res = await fetch(`${BASE_URL}/control/traffic-lights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...params })
    });
    return res.json();
  }

  async function controlCamera(cameraId, action) {
    if (USE_MOCK) {
      await delay(200);
      const cam = mockState.cameras.find(c => c.id === cameraId);
      if (cam) {
        if (action === 'disable') cam.status = 'offline';
        if (action === 'enable' || action === 'restart') cam.status = 'online';
      }
      return { success: true, data: cam };
    }
    const res = await fetch(`${BASE_URL}/control/cameras/${cameraId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    return res.json();
  }

  // Expose mock state updater for simulation engine
  return {
    getIntersections,
    getIntersection,
    getCameras,
    getIncidents,
    resolveIncident,
    getSystemStatus,
    getAnalytics,
    getDashboardStats,
    setTrafficMode,
    controlTrafficLights,
    controlCamera,
    getMockState,
    updateMockState,
    USE_MOCK
  };
})();
