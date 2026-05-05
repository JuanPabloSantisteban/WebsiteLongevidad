// ── SCROLLYTELLING ──

const CHART_FONT  = "'Libre Franklin', sans-serif";
const TICK_COLOR  = '#6B6B6B';
const GRID_COLOR  = '#f0f0ea';

const LIFE_COLORS = {
  'África':   '#e07b39',
  'América':  '#2A9D6F',
  'Asia':     '#17365D',
  'Europa':   '#8b5cf6',
  'Oceanía':  '#94a3b8'
};

const FERTILITY_COLORS = {
  'Africa':                        '#e07b39',
  'Asia':                          '#17365D',
  'Europa':                        '#8b5cf6',
  'Latinoamerica y el Caribe':     '#2A9D6F',
  'Canada y EUA.':                 '#f59e0b',
  'Oceania':                       '#94a3b8'
};

let lifeChart      = null;
let fertilityChart = null;

const clipProgressPlugin = {
  id: 'clipProgress',
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea: { left, right, top, bottom } } = chart;
    const progress = chart.options.plugins.clipProgress.progress;
    const clipX = left + (right - left) * progress;
    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, clipX - left, bottom - top);
    ctx.clip();
  },
  afterDatasetsDraw(chart) {
    chart.ctx.restore();
  }
};

function buildLifeChart(data) {
  const ctx = document.getElementById('lifeExpectancyChart');
  if (!ctx) return;

  const datasets = Object.keys(data).map(region => ({
    label: region,
    data: data[region]
      .filter(d => d.Year <= 2020)
      .map(d => ({ x: d.Year, y: d.value })),
    borderColor: LIFE_COLORS[region],
    backgroundColor: 'transparent',
    borderWidth: 2.5,
    pointRadius: 0,
    tension: 0.3
  }));

  lifeChart = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: false,
      plugins: {
        title: {
          display: true,
          text: 'Esperanza de vida al nacer',
          font: { family: CHART_FONT, size: 25, weight: '700' },
          color: '#17365D',
          align: 'start',
          padding: { top: 0, bottom: 16 }
        },
        legend: {
          position: 'bottom',
          labels: {
            font: { family: CHART_FONT, size: 12 },
            color: TICK_COLOR,
            usePointStyle: false,
            boxWidth: 12,
            boxHeight: 12,
            generateLabels(chart) {
              return chart.data.datasets.map((ds, i) => ({
                text: ds.label,
                fillStyle: ds.borderColor,
                strokeStyle: ds.borderColor,
                lineWidth: 0,
                hidden: !chart.isDatasetVisible(i),
                datasetIndex: i
              }));
            }
          }
        },
        tooltip: {
          callbacks: {
            label: c => `${c.dataset.label}: ${c.parsed.y.toFixed(1)} años`
          }
        },
        clipProgress: { progress: 0 }
      },
      scales: {
        x: {
          type: 'linear',
          min: 1800,
          max: 2020,
          ticks: {
            stepSize: 20,
            font: { family: CHART_FONT, size: 11 },
            color: TICK_COLOR,
            callback: val => val
          },
          grid: { color: GRID_COLOR }
        },
        y: {
          min: 25,
          max: 85,
          ticks: {
            stepSize: 10,
            font: { family: CHART_FONT, size: 11 },
            color: TICK_COLOR,
            callback: val => val + ' años'
          },
          grid: { color: GRID_COLOR }
        }
      }
    },
    plugins: [clipProgressPlugin]
  });
}

function setLifeProgress(progress) {
  if (!lifeChart) return;
  lifeChart.options.plugins.clipProgress.progress = Math.min(Math.max(progress, 0), 1);
  lifeChart.draw();
}

function buildFertilityChart(data) {
  const ctx = document.getElementById('fertilityChart');
  if (!ctx) return;

  const datasets = Object.keys(data).map(region => ({
    label: region,
    data: data[region]
      .filter(d => d.Year <= 2020)
      .map(d => ({ x: d.Year, y: d.value })),
    borderColor: FERTILITY_COLORS[region],
    backgroundColor: 'transparent',
    borderWidth: 2.5,
    pointRadius: 0,
    tension: 0.3
  }));

  fertilityChart = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: false,
      plugins: {
        title: {
          display: true,
          text: 'Tasa de fertilidad: nacimientos por mujer',
          font: { family: CHART_FONT, size: 25, weight: '700' },
          color: '#17365D',
          align: 'start',
          padding: { top: 0, bottom: 16 }
        },
        legend: {
          position: 'bottom',
          labels: {
            font: { family: CHART_FONT, size: 12 },
            color: TICK_COLOR,
            usePointStyle: false,
            boxWidth: 12,
            boxHeight: 12,
            generateLabels(chart) {
              return chart.data.datasets.map((ds, i) => ({
                text: ds.label,
                fillStyle: ds.borderColor,
                strokeStyle: ds.borderColor,
                lineWidth: 0,
                hidden: !chart.isDatasetVisible(i),
                datasetIndex: i
              }));
            }
          }
        },
        tooltip: {
          callbacks: {
            label: c => `${c.dataset.label}: ${c.parsed.y.toFixed(2)}`
          }
        },
        clipProgress: { progress: 0 }
      },
      scales: {
        x: {
          type: 'linear',
          min: 1950,
          max: 2020,
          ticks: {
            stepSize: 10,
            font: { family: CHART_FONT, size: 11 },
            color: TICK_COLOR,
            callback: val => val
          },
          grid: { color: GRID_COLOR }
        },
        y: {
          min: 1,
          max: 8,
          ticks: {
            stepSize: 1,
            font: { family: CHART_FONT, size: 11 },
            color: TICK_COLOR,
            callback: val => val + ' hijos'
          },
          grid: { color: GRID_COLOR }
        }
      }
    },
    plugins: [clipProgressPlugin]
  });
}

function setFertilityProgress(progress) {
  if (!fertilityChart) return;
  fertilityChart.options.plugins.clipProgress.progress = Math.min(Math.max(progress, 0), 1);
  fertilityChart.draw();
}

function initScrollytelling() {
  Promise.all([
    fetch('data/life_expectancy.json').then(r => r.json()),
    fetch('data/fertility_rate.json').then(r => r.json())
  ]).then(([lifeData, fertilityData]) => {
    buildLifeChart(lifeData);
    setLifeProgress(0);

    buildFertilityChart(fertilityData);
    setFertilityProgress(0);

    const lifeScroller = scrollama();
    lifeScroller
      .setup({ step: '.scrolly-step-life', offset: 0.5, progress: true })
      .onStepEnter(response => {
        document.querySelectorAll('.scrolly-step-life').forEach(el => el.classList.remove('is-active'));
        response.element.classList.add('is-active');
        if (response.element.dataset.step === 'diverge' && response.direction === 'down') setLifeProgress(1);
      })
      .onStepProgress(response => {
        if (response.element.dataset.step === 'intro') setLifeProgress(response.progress);
      })
      .onStepExit(response => {
        if (response.direction === 'down' && response.element.dataset.step === 'diverge') setLifeProgress(1);
        if (response.direction === 'up'   && response.element.dataset.step === 'intro')   setLifeProgress(0);
      });

    const fertilityScroller = scrollama();
    fertilityScroller
      .setup({ step: '.scrolly-step-fertility', offset: 0.5, progress: true })
      .onStepEnter(response => {
        document.querySelectorAll('.scrolly-step-fertility').forEach(el => el.classList.remove('is-active'));
        response.element.classList.add('is-active');
        if (response.element.dataset.step === 'fertility-fall' && response.direction === 'down') setFertilityProgress(1);
      })
      .onStepProgress(response => {
        if (response.element.dataset.step === 'fertility-high') setFertilityProgress(response.progress);
      })
      .onStepExit(response => {
        if (response.direction === 'down' && response.element.dataset.step === 'fertility-fall') setFertilityProgress(1);
        if (response.direction === 'up'   && response.element.dataset.step === 'fertility-high') setFertilityProgress(0);
      });

    window.addEventListener('resize', () => {
      lifeScroller.resize();
      fertilityScroller.resize();
    });
  }).catch(err => console.error('Error loading data:', err));
}

document.addEventListener('DOMContentLoaded', initScrollytelling);
