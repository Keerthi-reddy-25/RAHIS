/* ============================================
   Analytics Module
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (!App.requireAuth()) return;

  const username = App.getCurrentUser();
  const data = App.getHabitData(username);

  // Get all logged data sorted by date
  const allSorted = getAllData(data);

  // Update summary cards
  updateSummary(data, allSorted);

  // Render charts
  if (allSorted.length > 0) {
    renderScoreChart(allSorted);
    renderHabitBreakdownChart(allSorted);
    renderStressVsSleepChart(allSorted);
    renderCompletionChart(allSorted);
    document.getElementById('emptyState').style.display = 'none';
  } else {
    document.getElementById('chartsSection').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
  }

  // ── Load & Render Kaggle Dataset Insights ──
  if (typeof KaggleData !== 'undefined') {
    KaggleData.load().then(dsData => {
      renderKaggleInsights(dsData);
    });
  }
});

// ── Get All Data (sorted by date) ──
function getAllData(data) {
  return [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ── Update Summary ──
function updateSummary(allData, sortedData) {
  // Overall average score
  const avg = sortedData.length > 0
    ? Math.round(sortedData.reduce((s, e) => s + e.score, 0) / sortedData.length)
    : 0;
  document.getElementById('weekAvg').textContent = sortedData.length > 0 ? `${avg}%` : '--';

  // Best day
  if (sortedData.length > 0) {
    const best = sortedData.reduce((max, e) => e.score > max.score ? e : max, sortedData[0]);
    document.getElementById('bestDay').textContent = App.formatDate(best.date);
  } else {
    document.getElementById('bestDay').textContent = '--';
  }

  // Days logged (out of 365)
  document.getElementById('daysLogged').textContent = `${sortedData.length}/365`;

  // Exercise rate across all data
  const exerciseDays = sortedData.filter(e => e.exercise === 'yes').length;
  const exercisePct = sortedData.length > 0 ? Math.round((exerciseDays / sortedData.length) * 100) : 0;
  document.getElementById('exerciseRate').textContent = sortedData.length > 0 ? `${exercisePct}%` : '--';

  // Total all-time entries
  document.getElementById('totalAllTime').textContent = allData.length;

  // Current streak
  const username = App.getCurrentUser();
  document.getElementById('currentStreak').textContent = App.getStreak(username);
}

// ── Chart Theme Colors ──
function getChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text: isDark ? '#94a3b8' : '#64748b',
    grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    bg: isDark ? '#111827' : '#ffffff',
    primary: '#6366f1',
    primaryBg: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
    accent: '#10b981',
    accentBg: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
    warning: '#f59e0b',
    warningBg: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
    danger: '#ef4444',
    dangerBg: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
  };
}

// ── Common Chart Options ──
function baseOptions(c) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: c.text,
          font: { family: 'Inter', size: 12, weight: '500' },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        }
      },
      tooltip: {
        backgroundColor: c.bg,
        titleColor: c.text,
        bodyColor: c.text,
        borderColor: c.grid,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { family: 'Inter', weight: '600', size: 13 },
        bodyFont: { family: 'Inter', size: 12 },
        displayColors: true,
        boxPadding: 4,
      }
    },
    scales: {
      x: {
        ticks: { color: c.text, font: { family: 'Inter', size: 11 } },
        grid: { color: c.grid, drawBorder: false }
      },
      y: {
        ticks: { color: c.text, font: { family: 'Inter', size: 11 } },
        grid: { color: c.grid, drawBorder: false },
        beginAtZero: true
      }
    }
  };
}

// ── 1. Habit Score Trend ──
function renderScoreChart(data) {
  const c = getChartColors();
  const ctx = document.getElementById('scoreChart').getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 280);
  gradient.addColorStop(0, c.primaryBg);
  gradient.addColorStop(1, 'transparent');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(e => App.getDayName(e.date) + ' ' + App.formatDate(e.date)),
      datasets: [{
        label: 'Habit Score',
        data: data.map(e => e.score),
        borderColor: c.primary,
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: c.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
      }]
    },
    options: {
      ...baseOptions(c),
      scales: {
        ...baseOptions(c).scales,
        y: { ...baseOptions(c).scales.y, max: 100 }
      }
    }
  });
}

// ── 2. Habit Breakdown Radar ──
function renderHabitBreakdownChart(data) {
  const c = getChartColors();
  const ctx = document.getElementById('breakdownChart').getContext('2d');

  // Average each metric
  const n = data.length;
  const avgSleep = data.reduce((s, e) => s + e.sleep, 0) / n;
  const avgStress = data.reduce((s, e) => s + e.stress, 0) / n;
  const avgScreen = data.reduce((s, e) => s + e.screenTime, 0) / n;
  const exerciseRate = (data.filter(e => e.exercise === 'yes').length / n) * 10;
  const avgWork = data.reduce((s, e) => s + e.workHours, 0) / n;

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Sleep (hrs)', 'Stress Level', 'Screen Time', 'Exercise Rate', 'Work Hours'],
      datasets: [{
        label: 'This Week Average',
        data: [avgSleep, avgStress, avgScreen, exerciseRate, avgWork],
        borderColor: c.primary,
        backgroundColor: c.primaryBg,
        borderWidth: 2,
        pointBackgroundColor: c.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }, {
        label: 'Ideal Range',
        data: [8, 3, 2, 10, 6],
        borderColor: c.accent,
        backgroundColor: c.accentBg,
        borderWidth: 2,
        borderDash: [6, 4],
        pointBackgroundColor: c.accent,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: c.text,
            font: { family: 'Inter', size: 12, weight: '500' },
            usePointStyle: true,
          }
        }
      },
      scales: {
        r: {
          angleLines: { color: c.grid },
          grid: { color: c.grid },
          pointLabels: {
            color: c.text,
            font: { family: 'Inter', size: 11, weight: '500' }
          },
          ticks: {
            color: c.text,
            backdropColor: 'transparent',
            font: { size: 10 }
          },
          suggestedMin: 0,
          suggestedMax: 10,
        }
      }
    }
  });
}

// ── 3. Stress vs Sleep Scatter ──
function renderStressVsSleepChart(data) {
  const c = getChartColors();
  const ctx = document.getElementById('scatterChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(e => App.getDayName(e.date)),
      datasets: [{
        label: 'Sleep Hours',
        data: data.map(e => e.sleep),
        backgroundColor: c.primaryBg,
        borderColor: c.primary,
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.6,
      }, {
        label: 'Stress Level',
        data: data.map(e => e.stress),
        backgroundColor: c.dangerBg,
        borderColor: c.danger,
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.6,
      }, {
        label: 'Screen Time',
        data: data.map(e => e.screenTime),
        backgroundColor: c.warningBg,
        borderColor: c.warning,
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.6,
      }]
    },
    options: baseOptions(c)
  });
}

// ── 4. Completion Doughnut ──
function renderCompletionChart(data) {
  const c = getChartColors();
  const ctx = document.getElementById('completionChart').getContext('2d');

  const highDays = data.filter(e => e.score >= 80).length;
  const midDays = data.filter(e => e.score >= 50 && e.score < 80).length;
  const lowDays = data.filter(e => e.score < 50).length;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Excellent (≥80%)', 'Good (50-79%)', 'Needs Work (<50%)'],
      datasets: [{
        data: [highDays, midDays, lowDays],
        backgroundColor: [c.accent, c.primary, c.danger],
        borderWidth: 0,
        hoverOffset: 8,
        borderRadius: 4,
        spacing: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: c.text,
            font: { family: 'Inter', size: 12, weight: '500' },
            padding: 16,
            usePointStyle: true,
          }
        }
      }
    }
  });
}

// ══════════════════════════════════════════════
//  KAGGLE DATASET INSIGHT CHARTS
// ══════════════════════════════════════════════

function renderKaggleInsights(data) {
  if (!data || data.length === 0) return;

  // Update dataset summary cards
  const summary = KaggleData.getSummary(data);
  const el = (id) => document.getElementById(id);

  if (el('dsRecords')) el('dsRecords').textContent = summary.totalRecords;
  if (el('dsUsers')) el('dsUsers').textContent = summary.totalUsers;
  if (el('dsAvgScore')) el('dsAvgScore').textContent = summary.averages.habitScore + '%';
  if (el('dsAvgSleep')) el('dsAvgSleep').textContent = summary.averages.sleep + 'h';
  if (el('dsExerciseRate')) el('dsExerciseRate').textContent = summary.exerciseRate + '%';
  if (el('dsLikelyRate')) el('dsLikelyRate').textContent = summary.likelyRate + '%';

  // Render all dataset charts
  renderDsSleepStressChart(data);
  renderDsScreenMoodChart(data);
  renderDsAgeChart(data);
  renderDsPerformanceChart(data);
  renderDsGenderChart(data);
  renderDsDistributionChart(data);
}

// ── DS1: Sleep vs Stress Correlation ──
function renderDsSleepStressChart(data) {
  const c = getChartColors();
  const ctx = document.getElementById('dsSleepStressChart');
  if (!ctx) return;

  const corr = KaggleData.getSleepStressCorrelation(data);

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 280);
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
  gradient.addColorStop(1, 'transparent');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: corr.map(d => d.sleepHours + 'h'),
      datasets: [{
        label: 'Avg Stress Level',
        data: corr.map(d => d.avgStress),
        borderColor: c.danger,
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: c.danger,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }]
    },
    options: {
      ...baseOptions(c),
      plugins: {
        ...baseOptions(c).plugins,
        tooltip: {
          ...baseOptions(c).plugins.tooltip,
          callbacks: {
            afterBody: (items) => {
              const idx = items[0].dataIndex;
              return `Sample size: ${corr[idx].count} records`;
            }
          }
        }
      },
      scales: {
        x: { ...baseOptions(c).scales.x, title: { display: true, text: 'Sleep Hours', color: c.text, font: { family: 'Inter', size: 12 } } },
        y: { ...baseOptions(c).scales.y, title: { display: true, text: 'Stress Level', color: c.text, font: { family: 'Inter', size: 12 } }, max: 10 }
      }
    }
  });
}

// ── DS2: Screen Time Impact on Mood ──
function renderDsScreenMoodChart(data) {
  const c = getChartColors();
  const ctx = document.getElementById('dsScreenMoodChart');
  if (!ctx) return;

  const impact = KaggleData.getScreenTimeMoodImpact(data);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: impact.map(d => d.range),
      datasets: [{
        label: 'Avg Mood Score',
        data: impact.map(d => d.avgMood),
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)'
        ],
        borderColor: [c.accent, c.primary, c.warning, c.danger],
        borderWidth: 2,
        borderRadius: 8,
        barPercentage: 0.65,
      }, {
        label: 'Avg Habit Score',
        data: impact.map(d => d.avgScore),
        backgroundColor: [
          'rgba(16, 185, 129, 0.15)',
          'rgba(99, 102, 241, 0.15)',
          'rgba(245, 158, 11, 0.15)',
          'rgba(239, 68, 68, 0.15)'
        ],
        borderColor: [c.accent, c.primary, c.warning, c.danger],
        borderWidth: 2,
        borderRadius: 8,
        borderDash: [4, 4],
        barPercentage: 0.65,
      }]
    },
    options: {
      ...baseOptions(c),
      scales: {
        x: { ...baseOptions(c).scales.x, title: { display: true, text: 'Screen Time Range', color: c.text, font: { family: 'Inter', size: 12 } } },
        y: { ...baseOptions(c).scales.y, max: 100 }
      }
    }
  });
}

// ── DS3: Age Group Analysis ──
function renderDsAgeChart(data) {
  const c = getChartColors();
  const ctx = document.getElementById('dsAgeChart');
  if (!ctx) return;

  const ageData = KaggleData.getAgeGroupAnalysis(data);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ageData.map(d => d.range),
      datasets: [{
        label: 'Avg Score',
        data: ageData.map(d => d.avgScore),
        backgroundColor: c.primaryBg,
        borderColor: c.primary,
        borderWidth: 2,
        borderRadius: 8,
        barPercentage: 0.5,
      }, {
        label: 'Exercise Rate %',
        data: ageData.map(d => d.exerciseRate),
        backgroundColor: c.accentBg,
        borderColor: c.accent,
        borderWidth: 2,
        borderRadius: 8,
        barPercentage: 0.5,
      }]
    },
    options: {
      ...baseOptions(c),
      scales: {
        x: { ...baseOptions(c).scales.x, title: { display: true, text: 'Age Group', color: c.text, font: { family: 'Inter', size: 12 } } },
        y: { ...baseOptions(c).scales.y, max: 100, title: { display: true, text: 'Percentage', color: c.text, font: { family: 'Inter', size: 12 } } }
      }
    }
  });
}

// ── DS4: Top vs Bottom Performers ──
function renderDsPerformanceChart(data) {
  const c = getChartColors();
  const ctx = document.getElementById('dsPerformanceChart');
  if (!ctx) return;

  const perf = KaggleData.getPerformanceComparison(data);
  const labels = ['Sleep (hrs)', 'Stress', 'Screen (hrs)', 'Steps (k)', 'Water (L)'];

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Top 20% Performers',
        data: [
          perf.topPerformers.avgSleep,
          perf.topPerformers.avgStress,
          perf.topPerformers.avgScreen,
          perf.topPerformers.avgSteps / 1000,
          perf.topPerformers.avgWater
        ],
        borderColor: c.accent,
        backgroundColor: c.accentBg,
        borderWidth: 2,
        pointBackgroundColor: c.accent,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }, {
        label: 'Bottom 20% Performers',
        data: [
          perf.strugglers.avgSleep,
          perf.strugglers.avgStress,
          perf.strugglers.avgScreen,
          perf.strugglers.avgSteps / 1000,
          perf.strugglers.avgWater
        ],
        borderColor: c.danger,
        backgroundColor: c.dangerBg,
        borderWidth: 2,
        borderDash: [5, 5],
        pointBackgroundColor: c.danger,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: c.text, font: { family: 'Inter', size: 12, weight: '500' }, usePointStyle: true }
        }
      },
      scales: {
        r: {
          angleLines: { color: c.grid },
          grid: { color: c.grid },
          pointLabels: { color: c.text, font: { family: 'Inter', size: 11, weight: '500' } },
          ticks: { color: c.text, backdropColor: 'transparent', font: { size: 10 } },
          suggestedMin: 0,
          suggestedMax: 10,
        }
      }
    }
  });
}

// ── DS5: Gender Comparison ──
function renderDsGenderChart(data) {
  const c = getChartColors();
  const ctx = document.getElementById('dsGenderChart');
  if (!ctx) return;

  const gender = KaggleData.getGenderComparison(data);
  const labels = ['Avg Sleep', 'Avg Stress', 'Avg Screen', 'Avg Score/10', 'Exercise %/10'];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: `Male (${gender.male.count} records)`,
        data: [gender.male.avgSleep, gender.male.avgStress, gender.male.avgScreen, gender.male.avgScore / 10, gender.male.exerciseRate / 10],
        backgroundColor: c.primaryBg,
        borderColor: c.primary,
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.6,
      }, {
        label: `Female (${gender.female.count} records)`,
        data: [gender.female.avgSleep, gender.female.avgStress, gender.female.avgScreen, gender.female.avgScore / 10, gender.female.exerciseRate / 10],
        backgroundColor: c.accentBg,
        borderColor: c.accent,
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.6,
      }]
    },
    options: baseOptions(c)
  });
}

// ── DS6: Score Distribution (dataset-wide) ──
function renderDsDistributionChart(data) {
  const c = getChartColors();
  const ctx = document.getElementById('dsDistributionChart');
  if (!ctx) return;

  const dist = KaggleData.getScoreDistribution(data);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Excellent (≥80%)', 'Good (50-79%)', 'Needs Work (<50%)'],
      datasets: [{
        data: [dist.excellent, dist.good, dist.needsWork],
        backgroundColor: [c.accent, c.primary, c.danger],
        borderWidth: 0,
        hoverOffset: 10,
        borderRadius: 6,
        spacing: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: c.text, font: { family: 'Inter', size: 12, weight: '500' }, padding: 16, usePointStyle: true }
        },
        tooltip: {
          ...baseOptions(c).plugins.tooltip,
          callbacks: {
            label: (item) => {
              const total = dist.excellent + dist.good + dist.needsWork;
              const pct = Math.round((item.raw / total) * 100);
              return ` ${item.label}: ${item.raw} records (${pct}%)`;
            }
          }
        }
      }
    }
  });
}
