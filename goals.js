/* ============================================
   Goals & Achievements Module
   ============================================ */

// ── Motivational Quotes Database ──
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Your habits will determine your future.", author: "Jack Canfield" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Healthy habits harvest health, joy and prosperity.", author: "Debasish Mridha" },
  { text: "First we form habits, then they form us.", author: "Rob Gilbert" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "It's not about being the best. It's about being better than you were yesterday.", author: "Unknown" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Health is not about the weight you lose, but about the life you gain.", author: "Josh Axe" },
];

// ── Achievement Badges ──
const BADGES = [
  { id: 'first_log', icon: '🌟', name: 'First Step', desc: 'Log your first habit entry', check: (data) => data.length >= 1 },
  { id: 'week_warrior', icon: '⚔️', name: 'Week Warrior', desc: 'Log 7 consecutive days', check: (data, streak) => streak >= 7 },
  { id: 'streak_3', icon: '🔥', name: 'On Fire', desc: 'Maintain a 3-day streak', check: (data, streak) => streak >= 3 },
  { id: 'streak_14', icon: '💎', name: 'Diamond Streak', desc: 'Maintain a 14-day streak', check: (data, streak) => streak >= 14 },
  { id: 'perfect_score', icon: '💯', name: 'Perfect Day', desc: 'Achieve a 100% habit score', check: (data) => data.some(e => e.score >= 100) },
  { id: 'high_scorer', icon: '🏅', name: 'High Scorer', desc: 'Average score above 75%', check: (data) => data.length >= 3 && (data.reduce((s, e) => s + e.score, 0) / data.length) >= 75 },
  { id: 'exercise_5', icon: '💪', name: 'Fitness Freak', desc: 'Exercise 5+ days in a week', check: (data) => { const last7 = data.slice(-7); return last7.filter(e => e.exercise === 'yes').length >= 5; }},
  { id: 'early_bird', icon: '🐦', name: 'Sleep Master', desc: 'Sleep 7+ hours for 5 consecutive days', check: (data) => { const last5 = data.slice(-5); return last5.length >= 5 && last5.every(e => e.sleep >= 7); }},
  { id: 'zen_master', icon: '🧘', name: 'Zen Master', desc: 'Keep stress ≤ 3 for 5 days', check: (data) => { const last5 = data.slice(-5); return last5.length >= 5 && last5.every(e => e.stress <= 3); }},
  { id: 'digital_detox', icon: '📵', name: 'Digital Detox', desc: 'Screen time under 2h for 3 days', check: (data) => { const last3 = data.slice(-3); return last3.length >= 3 && last3.every(e => e.screenTime <= 2); }},
  { id: 'ten_entries', icon: '📝', name: 'Committed', desc: 'Log 10 total entries', check: (data) => data.length >= 10 },
  { id: 'twenty_entries', icon: '🎖️', name: 'Dedicated', desc: 'Log 20 total entries', check: (data) => data.length >= 20 },
];

document.addEventListener('DOMContentLoaded', () => {
  if (!App.requireAuth()) return;

  showDailyQuote();
  loadGoals();
  updateGoalProgress();
  renderWeeklyOverview();
  renderBadges();

  // Save goals
  document.getElementById('goalsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveGoals();
    updateGoalProgress();
    App.showToast('Goals saved successfully!', '🎯');
  });
});

// ── Daily Quote ──
function showDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const quote = QUOTES[dayOfYear % QUOTES.length];
  document.getElementById('dailyQuote').textContent = `"${quote.text}"`;
  document.getElementById('quoteAuthor').textContent = `— ${quote.author}`;
}

// ── Goals Storage ──
function getGoals() {
  const username = App.getCurrentUser();
  const all = JSON.parse(localStorage.getItem('habitiq-goals') || '{}');
  return all[username] || { sleep: 7.5, stress: 4, screen: 3, exercise: 5, work: 7, score: 75 };
}

function saveGoals() {
  const username = App.getCurrentUser();
  const all = JSON.parse(localStorage.getItem('habitiq-goals') || '{}');
  all[username] = {
    sleep: parseFloat(document.getElementById('goalSleep').value),
    stress: parseInt(document.getElementById('goalStress').value),
    screen: parseFloat(document.getElementById('goalScreen').value),
    exercise: parseInt(document.getElementById('goalExercise').value),
    work: parseFloat(document.getElementById('goalWork').value),
    score: parseInt(document.getElementById('goalScore').value),
  };
  localStorage.setItem('habitiq-goals', JSON.stringify(all));
}

function loadGoals() {
  const goals = getGoals();
  document.getElementById('goalSleep').value = goals.sleep;
  document.getElementById('goalStress').value = goals.stress;
  document.getElementById('goalScreen').value = goals.screen;
  document.getElementById('goalExercise').value = goals.exercise;
  document.getElementById('goalWork').value = goals.work;
  document.getElementById('goalScore').value = goals.score;
}

// ── Goal Progress ──
function updateGoalProgress() {
  const username = App.getCurrentUser();
  const data = App.getHabitData(username);
  const goals = getGoals();

  // Get this week's data (last 7 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);

  const weekData = data.filter(e => {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    return d >= weekAgo && d <= today;
  });

  const n = weekData.length || 1;
  const avgSleep = weekData.reduce((s, e) => s + e.sleep, 0) / n;
  const avgStress = weekData.reduce((s, e) => s + e.stress, 0) / n;
  const avgScreen = weekData.reduce((s, e) => s + e.screenTime, 0) / n;
  const exerciseDays = weekData.filter(e => e.exercise === 'yes').length;
  const avgWork = weekData.reduce((s, e) => s + e.workHours, 0) / n;
  const avgScore = weekData.reduce((s, e) => s + e.score, 0) / n;

  const progressItems = [
    { label: '🛏️ Avg Sleep', current: avgSleep.toFixed(1) + 'h', target: goals.sleep + 'h', pct: Math.min(100, (avgSleep / goals.sleep) * 100), good: avgSleep >= goals.sleep },
    { label: '😰 Avg Stress', current: avgStress.toFixed(1), target: '≤' + goals.stress, pct: Math.min(100, ((10 - avgStress) / (10 - goals.stress)) * 100), good: avgStress <= goals.stress },
    { label: '📱 Avg Screen', current: avgScreen.toFixed(1) + 'h', target: '≤' + goals.screen + 'h', pct: Math.min(100, ((24 - avgScreen) / (24 - goals.screen)) * 100), good: avgScreen <= goals.screen },
    { label: '🏃 Exercise Days', current: exerciseDays + ' days', target: goals.exercise + ' days', pct: Math.min(100, (exerciseDays / goals.exercise) * 100), good: exerciseDays >= goals.exercise },
    { label: '💼 Avg Work', current: avgWork.toFixed(1) + 'h', target: goals.work + 'h', pct: Math.min(100, (avgWork / goals.work) * 100), good: Math.abs(avgWork - goals.work) <= 1.5 },
    { label: '🎯 Avg Score', current: Math.round(avgScore) + '%', target: goals.score + '%', pct: Math.min(100, (avgScore / goals.score) * 100), good: avgScore >= goals.score },
  ];

  const container = document.getElementById('goalProgressList');
  container.innerHTML = progressItems.map(item => `
    <div class="goal-item">
      <div class="goal-item-header">
        <span>${item.label}</span>
        <span class="goal-values">
          <strong>${item.current}</strong> / ${item.target}
          ${item.good ? '<span class="goal-check">✅</span>' : '<span class="goal-check">🔴</span>'}
        </span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${item.good ? 'fill-good' : 'fill-warn'}" style="width:${Math.min(100, item.pct)}%"></div>
      </div>
    </div>
  `).join('');
}

// ── Weekly Overview ──
function renderWeeklyOverview() {
  const username = App.getCurrentUser();
  const data = App.getHabitData(username);
  const container = document.getElementById('weeklyOverview');

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const entry = data.find(e => e.date === key);
    days.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      entry,
    });
  }

  container.innerHTML = days.map(d => {
    let cls = 'day-empty';
    let icon = '—';
    if (d.entry) {
      if (d.entry.score >= 80) { cls = 'day-great'; icon = '🟢'; }
      else if (d.entry.score >= 50) { cls = 'day-good'; icon = '🟡'; }
      else { cls = 'day-bad'; icon = '🔴'; }
    }
    return `
      <div class="day-cell ${cls}">
        <div class="day-name">${d.day}</div>
        <div class="day-number">${d.date}</div>
        <div class="day-icon">${icon}</div>
        ${d.entry ? `<div class="day-score">${d.entry.score}%</div>` : ''}
      </div>
    `;
  }).join('');
}

// ── Achievements / Badges ──
function renderBadges() {
  const username = App.getCurrentUser();
  const data = App.getHabitData(username);
  const streak = App.getStreak(username);
  const container = document.getElementById('badgeGrid');

  container.innerHTML = BADGES.map(badge => {
    const unlocked = badge.check(data, streak);
    return `
      <div class="badge-card ${unlocked ? 'badge-unlocked' : 'badge-locked'}">
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-name">${badge.name}</div>
        <div class="badge-desc">${badge.desc}</div>
        <div class="badge-status">${unlocked ? '✅ Unlocked' : '🔒 Locked'}</div>
      </div>
    `;
  }).join('');
}
