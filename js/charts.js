/**
 * Charts Module — Chart.js wrappers for analytics page
 */

const Charts = (() => {
  let chartInstances = {};

  const COLORS = {
    cyan: '#00d4ff',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    green: '#10b981',
    yellow: '#f59e0b',
    orange: '#f97316',
    red: '#ef4444',
    muted: '#5a7194'
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#8ba3c7',
          font: { family: 'Inter, sans-serif', size: 12 },
          usePointStyle: true,
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 21, 32, 0.95)',
        titleColor: '#e8f0ff',
        bodyColor: '#8ba3c7',
        borderColor: 'rgba(64, 120, 200, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(64, 120, 200, 0.08)' },
        ticks: { color: '#5a7194', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(64, 120, 200, 0.08)' },
        ticks: { color: '#5a7194', font: { size: 11 } }
      }
    }
  };

  function destroy(id) {
    if (chartInstances[id]) {
      chartInstances[id].destroy();
      delete chartInstances[id];
    }
  }

  function createVehicleOverTime(canvasId, data) {
    destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = Array.from({ length: 24 }, (_, i) =>
      `${String(i).padStart(2, '0')}:00`
    );

    chartInstances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Vehicles Detected',
          data: data,
          borderColor: COLORS.cyan,
          backgroundColor: 'rgba(0, 212, 255, 0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: COLORS.cyan,
          borderWidth: 2
        }]
      },
      options: {
        ...defaultOptions,
        plugins: {
          ...defaultOptions.plugins,
          legend: { display: false }
        }
      }
    });
  }

  function createDensityByIntersection(canvasId, data) {
    destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    chartInstances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Central Plaza', 'Tech Park', 'Harbor Crossing', 'University Circle'],
        datasets: [{
          label: 'Density %',
          data: data,
          backgroundColor: [
            'rgba(0, 212, 255, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(139, 92, 246, 0.7)'
          ],
          borderColor: [COLORS.cyan, COLORS.blue, COLORS.green, COLORS.purple],
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 40
        }]
      },
      options: {
        ...defaultOptions,
        plugins: {
          ...defaultOptions.plugins,
          legend: { display: false }
        },
        scales: {
          ...defaultOptions.scales,
          y: {
            ...defaultOptions.scales.y,
            max: 100,
            ticks: {
              ...defaultOptions.scales.y.ticks,
              callback: v => v + '%'
            }
          }
        }
      }
    });
  }

  function createVehicleTypes(canvasId, data) {
    destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    chartInstances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Cars', 'Buses', 'Trucks', 'Motorcycles', 'Emergency'],
        datasets: [{
          data: [data.cars, data.buses, data.trucks, data.motorcycles, data.emergency],
          backgroundColor: [
            COLORS.cyan,
            COLORS.yellow,
            COLORS.purple,
            COLORS.green,
            COLORS.red
          ],
          borderColor: '#0f1520',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#8ba3c7',
              font: { family: 'Inter, sans-serif', size: 12 },
              usePointStyle: true,
              padding: 14
            }
          },
          tooltip: defaultOptions.plugins.tooltip
        }
      }
    });
  }

  function createAvgSpeed(canvasId, data) {
    destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    chartInstances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Central Plaza', 'Tech Park', 'Harbor Crossing', 'University Circle'],
        datasets: [{
          label: 'Avg Speed (km/h)',
          data: data,
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: COLORS.green,
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 40
        }]
      },
      options: {
        ...defaultOptions,
        indexAxis: 'y',
        plugins: {
          ...defaultOptions.plugins,
          legend: { display: false }
        },
        scales: {
          x: {
            ...defaultOptions.scales.x,
            ticks: {
              ...defaultOptions.scales.x.ticks,
              callback: v => v + ' km/h'
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#8ba3c7', font: { size: 11 } }
          }
        }
      }
    });
  }

  return {
    createVehicleOverTime,
    createDensityByIntersection,
    createVehicleTypes,
    createAvgSpeed,
    destroy
  };
})();
