/**
 * Dashboard Page Logic — Stats, Map, Live Updates
 */

const DashboardPage = (() => {
  let selectedIntersection = null;
  let vehicles = [];
  let animFrame = null;

  /* ---------- Stats Cards ---------- */
  async function renderStats() {
    const res = await API.getDashboardStats();
    if (!res.success) return;
    const d = res.data;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('stat-intersections', d.activeIntersections);
    set('stat-vehicles', d.totalVehicles);
    set('stat-density', d.densityLabel);
    set('stat-cameras', `${d.camerasOnline}/${d.totalCameras}`);
    set('stat-emergency', d.emergencyVehicles);
    set('stat-incidents', d.activeIncidents);
    set('stat-status', d.systemStatus);

    // Density color
    const densEl = document.getElementById('stat-density');
    if (densEl) {
      densEl.style.color = d.densityPercent > 65 ? 'var(--accent-orange)' :
        d.densityPercent > 40 ? 'var(--accent-yellow)' : 'var(--accent-green)';
    }
  }

  /* ---------- City Map ---------- */
  function renderMap() {
    const map = document.querySelector('.city-map');
    if (!map) return;

    // Update intersection states
    API.getIntersections().then(res => {
      if (!res.success) return;
      res.data.forEach(int => {
        const el = document.querySelector(`.map-intersection[data-id="${int.id}"]`);
        if (!el) return;
        el.classList.toggle('has-emergency', int.emergency);
        el.classList.toggle('active', selectedIntersection === int.id);
      });
    });
  }

  function initMapClicks() {
    document.querySelectorAll('.map-intersection').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        selectedIntersection = id;
        document.querySelectorAll('.map-intersection').forEach(i => i.classList.remove('active'));
        el.classList.add('active');
        showIntersectionDetail(id);
      });
    });
  }

  async function showIntersectionDetail(id) {
    const res = await API.getIntersection(id);
    if (!res.success || !res.data) return;
    const int = res.data;
    const panel = document.getElementById('intersection-detail-panel');
    if (!panel) return;

    panel.innerHTML = `
      <h3>${int.name}</h3>
      <div class="detail-row"><span class="label">ID</span><span class="value font-mono">${int.id}</span></div>
      <div class="detail-row"><span class="label">Location</span><span class="value">${int.location}</span></div>
      <div class="detail-row"><span class="label">Camera</span><span class="value">${App.statusBadge(int.cameraStatus)}</span></div>
      <div class="detail-row"><span class="label">Vehicles</span><span class="value">${int.totalVehicles}</span></div>
      <div class="detail-row"><span class="label">Density</span><span class="value">${int.density} (${int.densityPercent}%)</span></div>
      <div class="detail-row"><span class="label">Green Direction</span>
        <span class="value light-indicator"><span class="dot green"></span> ${int.greenDirection.toUpperCase()}</span>
      </div>
      <div class="detail-row"><span class="label">Green Remaining</span><span class="value font-mono">${int.greenRemaining}s</span></div>
      <div class="detail-row"><span class="label">Avg Speed</span><span class="value">${int.avgSpeed} km/h</span></div>
      <div class="detail-row"><span class="label">Emergency</span>
        <span class="value">${int.emergency ? '<span class="badge badge-critical">Yes</span>' : '<span class="badge badge-success">No</span>'}</span>
      </div>
      <div class="detail-row"><span class="label">Incident</span>
        <span class="value">${int.incident ? '<span class="badge badge-high">Active</span>' : '<span class="badge badge-success">None</span>'}</span>
      </div>
    `;
  }

  /* ---------- Animated Vehicles on Map ---------- */
  function initVehicles() {
    const map = document.querySelector('.city-map');
    if (!map) return;

    // Create some vehicle elements
    for (let i = 0; i < 12; i++) {
      const v = document.createElement('div');
      v.className = 'map-vehicle';
      if (i === 0) v.classList.add('emergency');
      if (i === 1 || i === 2) v.classList.add('bus');
      map.appendChild(v);
      vehicles.push({
        el: v,
        // Road paths: horizontal or vertical
        axis: Math.random() > 0.5 ? 'h' : 'v',
        road: Math.random() > 0.5 ? 1 : 2,
        pos: Math.random() * 100,
        speed: 0.15 + Math.random() * 0.25,
        dir: Math.random() > 0.5 ? 1 : -1
      });
    }

    function animate() {
      vehicles.forEach(v => {
        v.pos += v.speed * v.dir;
        if (v.pos > 92) { v.pos = 92; v.dir = -1; }
        if (v.pos < 8) { v.pos = 8; v.dir = 1; }

        if (v.axis === 'h') {
          const top = v.road === 1 ? 28 : 68;
          v.el.style.left = v.pos + '%';
          v.el.style.top = `calc(${top}% + 10px)`;
        } else {
          const left = v.road === 1 ? 28 : 68;
          v.el.style.top = v.pos + '%';
          v.el.style.left = `calc(${left}% + 10px)`;
        }
      });
      animFrame = requestAnimationFrame(animate);
    }
    animate();
  }

  /* ---------- Live Updates ---------- */
  function onSimulationUpdate() {
    renderStats();
    renderMap();
    if (selectedIntersection) {
      showIntersectionDetail(selectedIntersection);
    }
  }

  function init() {
    renderStats();
    initMapClicks();
    renderMap();
    initVehicles();
    TrafficSimulation.onUpdate(onSimulationUpdate);

    // Default select first intersection
    selectedIntersection = 'INT-01';
    showIntersectionDetail('INT-01');
    document.querySelector('.map-intersection[data-id="INT-01"]')?.classList.add('active');
  }

  return { init };
})();

/* ---------- Intersections Page ---------- */
const IntersectionsPage = (() => {
  async function render() {
    const res = await API.getIntersections();
    if (!res.success) return;
    const grid = document.getElementById('intersections-grid');
    if (!grid) return;

    grid.innerHTML = res.data.map(int => `
      <div class="intersection-card" data-id="${int.id}">
        <div class="int-card-header">
          <div class="int-card-title">
            <span class="status-dot ${int.cameraStatus === 'online' ? 'online' : 'offline'}"></span>
            <div>
              <h3>${int.name}</h3>
              <div class="int-id">${int.id} · ${int.location}</div>
            </div>
          </div>
          ${int.emergency ? '<span class="badge badge-critical">Emergency</span>' : ''}
        </div>
        <div class="int-card-body">
          <div class="detail-row"><span class="label">Total Vehicles</span><span class="value">${int.totalVehicles}</span></div>
          <div class="detail-row"><span class="label">Density</span>
            <span class="value">${int.density} (${int.densityPercent}%)</span>
          </div>
          <div class="progress-bar" style="margin: 0.5rem 0 1rem;">
            <div class="progress-fill ${int.density}" style="width: ${int.densityPercent}%"></div>
          </div>
          <div class="detail-row"><span class="label">Avg Speed</span><span class="value">${int.avgSpeed} km/h</span></div>
          <div class="detail-row"><span class="label">Green Light</span>
            <span class="value light-indicator"><span class="dot green"></span> ${int.greenDirection.toUpperCase()} · ${int.greenRemaining}s</span>
          </div>
          <div class="directions-grid">
            ${['north', 'south', 'east', 'west'].map(d => {
              const dir = int.directions[d];
              return `
                <div class="direction-card">
                  <div class="dir-name">
                    ${d.toUpperCase()}
                    <span class="light-indicator"><span class="dot ${dir.light}"></span></span>
                  </div>
                  <div class="dir-stats">
                    <span>Vehicles <span class="val">${dir.vehicles}</span></span>
                    <span>Density <span class="val">${dir.density}</span></span>
                    <span>Time <span class="val font-mono">${dir.remaining}s</span></span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `).join('');
  }

  function init() {
    render();
    TrafficSimulation.onUpdate(render);
  }

  return { init };
})();

/* ---------- Cameras Page ---------- */
const CamerasPage = (() => {
  async function render() {
    const res = await API.getCameras();
    if (!res.success) return;
    const grid = document.getElementById('cameras-grid');
    if (!grid) return;

    grid.innerHTML = res.data.map(cam => `
      <div class="camera-card" data-id="${cam.id}">
        <div class="camera-feed">
          <div class="camera-feed-placeholder">
            <div class="camera-scanline"></div>
            ${cam.detections.map(d => `
              <div class="bbox ${d.type}" style="left:${d.x}%;top:${d.y}%;width:${d.w}%;height:${d.h}%;">
                <span class="bbox-label">${d.type} — ${d.confidence}%</span>
              </div>
            `).join('')}
          </div>
          <div class="camera-overlay-info">
            <div class="cam-status">
              <span class="status-dot ${cam.status === 'online' ? 'online' : 'offline'}"></span>
              ${cam.status.toUpperCase()}
            </div>
            <div class="cam-fps">${cam.fps} FPS</div>
          </div>
        </div>
        <div class="camera-card-body">
          <h3>${cam.id} — ${cam.intersectionName}</h3>
          <div class="camera-meta">
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              ${cam.vehicleCount} vehicles
            </span>
            <span>Confidence: ${cam.confidence}%</span>
            <span>Updated: ${App.timeAgo(cam.lastUpdate)}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function init() {
    render();
    TrafficSimulation.onUpdate(render);
  }

  return { init };
})();

/* ---------- Incidents Page ---------- */
const IncidentsPage = (() => {
  let currentFilter = 'all';
  let searchQuery = '';

  async function render() {
    const filters = {};
    if (currentFilter === 'active' || currentFilter === 'resolved') filters.status = currentFilter;
    if (['critical', 'high', 'medium', 'low'].includes(currentFilter)) filters.priority = currentFilter;
    if (searchQuery) filters.search = searchQuery;

    const res = await API.getIncidents(filters);
    if (!res.success) return;

    const tbody = document.getElementById('incidents-tbody');
    if (!tbody) return;

    if (res.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><h3>No alerts found</h3><p>No incidents match your current filters.</p></div></td></tr>`;
      return;
    }

    tbody.innerHTML = res.data.map(inc => `
      <tr class="alert-row ${inc.priority === 'critical' && inc.status === 'active' ? 'critical' : ''}" data-id="${inc.id}">
        <td class="font-mono">${inc.id}</td>
        <td>${inc.type}</td>
        <td>${inc.intersectionName}</td>
        <td>${App.priorityBadge(inc.priority)}</td>
        <td class="hide-mobile">${App.formatDateTime(inc.timestamp)}</td>
        <td>${App.statusBadge(inc.status)}</td>
        <td>
          ${inc.status === 'active' ? `
            <button class="btn btn-sm btn-secondary resolve-btn" data-id="${inc.id}">Resolve</button>
          ` : `<span class="text-muted" style="font-size:0.8rem">—</span>`}
        </td>
      </tr>
    `).join('');

    // Resolve buttons
    tbody.querySelectorAll('.resolve-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        App.showModal({
          title: 'Resolve Alert',
          body: `Mark alert <strong>${id}</strong> as resolved?`,
          confirmText: 'Resolve',
          onConfirm: async () => {
            await API.resolveIncident(id);
            App.showToast('Alert Resolved', `${id} has been marked as resolved.`, 'success');
            render();
          }
        });
      });
    });
  }

  function init() {
    // Filters
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
      });
    });

    // Search
    const searchInput = document.getElementById('incident-search');
    if (searchInput) {
      let debounce;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          searchQuery = searchInput.value.trim();
          render();
        }, 300);
      });
    }

    render();
    TrafficSimulation.onUpdate(render);
  }

  return { init };
})();

/* ---------- Control Page ---------- */
const ControlPage = (() => {
  async function renderStatus() {
    const res = await API.getSystemStatus();
    if (!res.success) return;
    const s = res.data;

    const set = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    set('status-backend', `<span class="status-dot ${s.backend === 'online' ? 'online' : 'offline'}"></span> ${s.backend}`);
    set('status-database', `<span class="status-dot ${s.database === 'online' ? 'online' : 'offline'}"></span> ${s.database}`);
    set('status-esp32', `<span class="status-dot online"></span> ${s.esp32Online}/${s.esp32Devices} Online`);
    set('status-sync', App.formatTime(s.lastSync));
    set('status-mode', s.mode === 'automatic' ? 'Automatic' : 'Manual');

    // Mode toggle
    document.querySelectorAll('.mode-toggle button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === s.mode);
    });
  }

  function init() {
    renderStatus();
    TrafficSimulation.onUpdate(renderStatus);

    // Mode toggle
    document.querySelectorAll('.mode-toggle button').forEach(btn => {
      btn.addEventListener('click', async () => {
        const mode = btn.dataset.mode;
        await API.setTrafficMode(mode);
        App.showToast('Mode Changed', `System switched to ${mode} mode.`, 'success');
        renderStatus();
      });
    });

    // Control actions
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const labels = {
          'force-red': 'Force all traffic lights to RED?',
          'emergency-priority': 'Activate emergency priority mode for all intersections?',
          'enable-all-cameras': 'Enable all AI cameras?',
          'disable-all-cameras': 'Disable all AI cameras?',
          'restart-cameras': 'Restart all camera modules?'
        };

        App.showModal({
          title: 'Confirm Action',
          body: labels[action] || `Perform action: ${action}?`,
          confirmText: 'Execute',
          danger: action.includes('force') || action.includes('disable'),
          onConfirm: async () => {
            if (action.startsWith('force') || action === 'emergency-priority') {
              await API.controlTrafficLights(action);
            } else {
              await API.controlCamera('all', action.replace('-all-cameras', '').replace('-cameras', ''));
            }
            App.showToast('Action Executed', `Command "${action}" sent successfully.`, 'success');
            renderStatus();
          }
        });
      });
    });

    // Duration slider
    const slider = document.getElementById('green-duration');
    const valEl = document.getElementById('green-duration-val');
    if (slider && valEl) {
      slider.addEventListener('input', () => {
        valEl.textContent = slider.value + 's';
      });
      document.getElementById('apply-duration')?.addEventListener('click', () => {
        App.showModal({
          title: 'Update Green Duration',
          body: `Set default green-light duration to <strong>${slider.value} seconds</strong>?`,
          confirmText: 'Apply',
          onConfirm: async () => {
            await API.controlTrafficLights('set-duration', { duration: parseInt(slider.value) });
            App.showToast('Duration Updated', `Green light duration set to ${slider.value}s.`, 'success');
          }
        });
      });
    }
  }

  return { init };
})();

/* ---------- Analytics Page ---------- */
const AnalyticsPage = (() => {
  async function renderCharts(range = 'today') {
    const res = await API.getAnalytics(range);
    if (!res.success) return;
    const d = res.data;

    Charts.createVehicleOverTime('chart-vehicles', d.hourlyVehicles);
    Charts.createDensityByIntersection('chart-density', d.densityByIntersection);
    Charts.createVehicleTypes('chart-types', d.vehicleTypes);
    Charts.createAvgSpeed('chart-speed', d.avgSpeeds);
  }

  function init() {
    renderCharts();

    document.querySelectorAll('.filter-btn[data-range]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn[data-range]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCharts(btn.dataset.range);
      });
    });

    // Light refresh of charts on simulation
    TrafficSimulation.onUpdate(() => {
      const active = document.querySelector('.filter-btn[data-range].active');
      renderCharts(active?.dataset.range || 'today');
    });
  }

  return { init };
})();

/* ---------- Settings Page ---------- */
const SettingsPage = (() => {
  function init() {
    const settings = App.getSettings();

    // Toggle switches
    document.querySelectorAll('.toggle-switch input').forEach(input => {
      const key = input.dataset.key;
      if (key && settings[key] !== undefined) {
        input.checked = settings[key];
      }
      input.addEventListener('change', () => {
        const s = App.getSettings();
        s[key] = input.checked;
        App.saveSettings(s);
        App.showToast('Settings Saved', `${input.closest('.setting-row').querySelector('h4').textContent} updated.`, 'success');
      });
    });

    // Settings nav tabs
    document.querySelectorAll('.settings-nav button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.settings-nav button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        document.querySelectorAll('.settings-panel').forEach(p => {
          p.style.display = p.dataset.panel === tab ? 'block' : 'none';
        });
      });
    });
  }

  return { init };
})();
