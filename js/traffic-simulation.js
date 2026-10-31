/**
 * Traffic Simulation Engine
 * Simulates real-time changes to vehicle counts, lights, density, emergencies.
 * Designed so real WebSocket / polling can replace the interval later.
 */

const TrafficSimulation = (() => {
  let intervalId = null;
  let listeners = [];
  const TICK_MS = 3000; // update every 3 seconds

  const DENSITIES = ['low', 'medium', 'high'];
  const DIRECTIONS = ['north', 'south', 'east', 'west'];

  function densityFromPercent(p) {
    if (p >= 70) return 'high';
    if (p >= 40) return 'medium';
    return 'low';
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  /**
   * Advance one simulation tick
   */
  function tick() {
    const state = API.getMockState();
    const intersections = state.intersections;

    intersections.forEach(int => {
      // Update green light timer
      int.greenRemaining -= 3;
      if (int.greenRemaining <= 0) {
        // Cycle to next direction based on highest demand
        const dirs = DIRECTIONS.map(d => ({
          dir: d,
          vehicles: int.directions[d].vehicles
        })).sort((a, b) => b.vehicles - a.vehicles);

        // Prefer highest vehicle count, but also rotate
        const currentIdx = DIRECTIONS.indexOf(int.greenDirection);
        let nextDir = dirs[0].dir;
        // Avoid immediate same direction if others have traffic
        if (nextDir === int.greenDirection && dirs[1].vehicles > 0) {
          nextDir = dirs[1].dir;
        }
        // Occasionally just rotate
        if (Math.random() < 0.3) {
          nextDir = DIRECTIONS[(currentIdx + 1) % 4];
        }

        int.greenDirection = nextDir;
        int.greenRemaining = randomInt(20, 45);

        // Update lights
        DIRECTIONS.forEach(d => {
          if (d === nextDir) {
            int.directions[d].light = 'green';
            int.directions[d].remaining = int.greenRemaining;
          } else {
            int.directions[d].light = 'red';
            int.directions[d].remaining = int.greenRemaining;
          }
        });
      } else {
        // Update remaining times
        DIRECTIONS.forEach(d => {
          if (int.directions[d].light === 'green') {
            int.directions[d].remaining = int.greenRemaining;
          } else {
            int.directions[d].remaining = Math.max(0, int.directions[d].remaining - 3);
          }
        });
      }

      // Fluctuate vehicle counts
      DIRECTIONS.forEach(d => {
        const dir = int.directions[d];
        let change = randomInt(-3, 4);
        // Green light tends to decrease vehicles
        if (dir.light === 'green') change = randomInt(-5, 1);
        dir.vehicles = clamp(dir.vehicles + change, 0, 30);
        dir.densityPercent = clamp(Math.round(dir.vehicles * 4.5 + randomInt(-5, 5)), 5, 95);
        dir.density = densityFromPercent(dir.densityPercent);
      });

      // Recalculate totals
      int.totalVehicles = DIRECTIONS.reduce((s, d) => s + int.directions[d].vehicles, 0);
      int.densityPercent = Math.round(
        DIRECTIONS.reduce((s, d) => s + int.directions[d].densityPercent, 0) / 4
      );
      int.density = densityFromPercent(int.densityPercent);
      int.avgSpeed = clamp(
        Math.round(55 - int.densityPercent * 0.45 + randomInt(-3, 3)),
        8, 60
      );

      // Random emergency (rare)
      if (!int.emergency && Math.random() < 0.02) {
        int.emergency = true;
        // Add incident
        state.incidents.unshift({
          id: 'ALT-' + String(Date.now()).slice(-4),
          type: 'Emergency Vehicle Detected',
          intersection: int.id,
          intersectionName: int.name,
          priority: 'critical',
          timestamp: Date.now(),
          status: 'active',
          description: `Emergency vehicle detected at ${int.name}. Priority routing engaged.`
        });
      } else if (int.emergency && Math.random() < 0.15) {
        int.emergency = false;
      }
    });

    // Update cameras to match intersections
    state.cameras.forEach(cam => {
      const int = intersections.find(i => i.id === cam.intersectionId);
      if (int) {
        cam.vehicleCount = int.totalVehicles;
        cam.fps = randomInt(26, 30);
        cam.confidence = +(93 + Math.random() * 5).toFixed(1);
        cam.lastUpdate = Date.now();

        // Occasionally reshuffle detections
        if (Math.random() < 0.4) {
          const types = ['car', 'car', 'car', 'bus', 'truck', 'motorcycle'];
          if (int.emergency) types.push('ambulance');
          const count = clamp(Math.round(int.totalVehicles / 8), 2, 6);
          cam.detections = [];
          for (let i = 0; i < count; i++) {
            const type = types[randomInt(0, types.length - 1)];
            cam.detections.push({
              type,
              confidence: randomInt(85, 99),
              x: randomInt(5, 75),
              y: randomInt(15, 60),
              w: type === 'bus' || type === 'truck' ? randomInt(20, 30) : type === 'motorcycle' ? randomInt(6, 10) : randomInt(12, 20),
              h: type === 'bus' || type === 'truck' ? randomInt(28, 40) : type === 'motorcycle' ? randomInt(10, 14) : randomInt(16, 24)
            });
          }
        }
      }
    });

    // Update analytics lightly
    const hour = new Date().getHours();
    if (state.analytics.hourlyVehicles[hour] !== undefined) {
      state.analytics.hourlyVehicles[hour] = clamp(
        state.analytics.hourlyVehicles[hour] + randomInt(-2, 3),
        0, 120
      );
    }
    state.analytics.densityByIntersection = intersections.map(i => i.densityPercent);
    state.analytics.avgSpeeds = intersections.map(i => i.avgSpeed);

    state.systemStatus.lastSync = Date.now();

    // Notify listeners
    listeners.forEach(fn => {
      try { fn(state); } catch (e) { console.error('Simulation listener error:', e); }
    });
  }

  function start() {
    if (intervalId) return;
    intervalId = setInterval(tick, TICK_MS);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function onUpdate(callback) {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter(fn => fn !== callback);
    };
  }

  return { start, stop, onUpdate, tick };
})();
