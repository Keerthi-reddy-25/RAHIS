/* ============================================
   History Module — View, Search, Export, Delete
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (!App.requireAuth()) return;

  renderHistory();
  updateHistoryStats();

  // Search
  document.getElementById('searchInput').addEventListener('input', renderHistory);

  // Sort
  document.getElementById('sortOrder').addEventListener('change', renderHistory);

  // Modal cancel
  document.getElementById('cancelDelete').addEventListener('click', () => {
    document.getElementById('deleteModal').style.display = 'none';
  });
});

let pendingDeleteDate = null;

function renderHistory() {
  const username = App.getCurrentUser();
  let data = App.getHabitData(username);
  const search = document.getElementById('searchInput').value.trim().toLowerCase();
  const sort = document.getElementById('sortOrder').value;

  // Filter
  if (search) {
    data = data.filter(e => e.date.includes(search));
  }

  // Sort
  switch (sort) {
    case 'newest': data.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
    case 'oldest': data.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
    case 'highest': data.sort((a, b) => b.score - a.score); break;
    case 'lowest': data.sort((a, b) => a.score - b.score); break;
  }

  const tbody = document.getElementById('historyBody');
  const emptyState = document.getElementById('emptyHistory');
  const showingEl = document.getElementById('showingCount');

  if (data.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    showingEl.textContent = 'No entries found';
    return;
  }

  emptyState.style.display = 'none';
  showingEl.textContent = `Showing ${data.length} entries`;

  tbody.innerHTML = data.map(e => {
    const scoreColor = e.score >= 80 ? 'var(--accent-500)' : e.score >= 50 ? 'var(--primary-500)' : 'var(--danger-400)';
    const statusBadge = e.prediction === 'likely'
      ? '<span class="badge badge-success">✅ Likely</span>'
      : '<span class="badge badge-danger">⚠️ Unlikely</span>';

    return `
      <tr class="fade-in">
        <td><strong>${App.formatDate(e.date)}</strong><br><small style="color:var(--text-muted)">${App.getDayName(e.date)}</small></td>
        <td>${e.sleep}h</td>
        <td>${e.stress}/10</td>
        <td>${e.screenTime}h</td>
        <td>${e.exercise === 'yes' ? '✅' : '❌'}</td>
        <td>${e.workHours}h</td>
        <td>${['','😫','😔','😐','😊','🤩'][e.mood] || '—'}</td>
        <td>${e.water !== undefined ? '💧' + e.water : '—'}</td>
        <td><strong style="color:${scoreColor}">${e.score}%</strong></td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn-icon" onclick="deleteEntry('${e.date}')" title="Delete">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

function updateHistoryStats() {
  const username = App.getCurrentUser();
  const data = App.getHabitData(username);

  document.getElementById('histTotal').textContent = data.length;

  if (data.length > 0) {
    const avg = Math.round(data.reduce((s, e) => s + e.score, 0) / data.length);
    const best = Math.max(...data.map(e => e.score));
    document.getElementById('histAvg').textContent = avg + '%';
    document.getElementById('histBest').textContent = best + '%';
  }

  document.getElementById('histStreak').textContent = App.getStreak(username);
}

// ── Delete Entry ──
function deleteEntry(date) {
  pendingDeleteDate = date;
  document.getElementById('deleteDate').textContent = App.formatDate(date);
  document.getElementById('deleteModal').style.display = 'flex';

  document.getElementById('confirmDelete').onclick = () => {
    const username = App.getCurrentUser();
    const all = JSON.parse(localStorage.getItem('habitiq-habits') || '{}');
    if (all[username]) {
      all[username] = all[username].filter(e => e.date !== pendingDeleteDate);
      localStorage.setItem('habitiq-habits', JSON.stringify(all));
    }
    document.getElementById('deleteModal').style.display = 'none';
    renderHistory();
    updateHistoryStats();
    App.showToast('Entry deleted', '🗑️');
  };
}

// ── Export CSV ──
function exportCSV() {
  const username = App.getCurrentUser();
  const data = App.getHabitData(username);
  if (data.length === 0) { App.showToast('No data to export', '⚠️'); return; }

  const headers = ['Date', 'Sleep Hours', 'Stress Level', 'Screen Time', 'Exercise', 'Work Hours', 'Habit Score', 'Prediction'];
  const rows = data.map(e => [e.date, e.sleep, e.stress, e.screenTime, e.exercise, e.workHours, e.score, e.prediction]);

  let csv = headers.join(',') + '\n';
  rows.forEach(r => csv += r.join(',') + '\n');

  downloadFile(csv, `habitiq_history_${username}.csv`, 'text/csv');
  App.showToast('CSV exported successfully!', '📥');
}

// ── Export JSON ──
function exportJSON() {
  const username = App.getCurrentUser();
  const data = App.getHabitData(username);
  if (data.length === 0) { App.showToast('No data to export', '⚠️'); return; }

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `habitiq_history_${username}.json`, 'application/json');
  App.showToast('JSON exported successfully!', '📦');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
