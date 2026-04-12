/* ============================================
   Dashboard Module
   ============================================ */

// ── Health Tips Database ──
const HEALTH_TIPS = [
  { icon: '🛏️', category: 'Sleep', tip: 'Maintain a consistent sleep schedule, even on weekends. Your circadian rhythm thrives on regularity.' },
  { icon: '🧊', category: 'Hydration', tip: 'Drink a glass of water immediately after waking up to kickstart your metabolism.' },
  { icon: '🏋️', category: 'Exercise', tip: 'Just 20 minutes of moderate exercise can boost your mood for up to 12 hours.' },
  { icon: '🧘', category: 'Stress', tip: 'Try the 4-7-8 breathing technique: inhale 4s, hold 7s, exhale 8s to reduce anxiety.' },
  { icon: '📵', category: 'Screen', tip: 'Follow the 20-20-20 rule: every 20 min, look at something 20ft away for 20 seconds.' },
  { icon: '🥗', category: 'Nutrition', tip: 'Eating whole grains, fruits, and vegetables is linked to 30% lower stress levels.' },
  { icon: '☀️', category: 'Wellness', tip: '15 minutes of morning sunlight helps regulate your sleep-wake cycle naturally.' },
  { icon: '🧠', category: 'Focus', tip: 'The Pomodoro Technique (25 min work, 5 min break) increases productivity by 25%.' },
  { icon: '🚶', category: 'Activity', tip: 'A 10-minute walk after meals can reduce blood sugar spikes by up to 22%.' },
  { icon: '📝', category: 'Habits', tip: 'It takes an average of 66 days to form a new habit. Stay consistent!' },
  { icon: '😴', category: 'Recovery', tip: 'Avoid caffeine at least 6 hours before bedtime for better sleep quality.' },
  { icon: '💪', category: 'Fitness', tip: 'Strength training just twice a week reduces all-cause mortality risk by 23%.' },
];

document.addEventListener('DOMContentLoaded', () => {
  if (!App.requireAuth()) return;

  const username = App.getCurrentUser();
  const greetEl = document.getElementById('greetUser');
  if (greetEl) greetEl.textContent = username;

  // Load today's data if exists
  loadTodayData();
  updateStats();
  renderHealthTips();
  renderHeatmap();
  initMoodPicker();
  initWaterTracker();

  // ── Form Submission ──
  const habitForm = document.getElementById('habitForm');
  if (habitForm) {
    habitForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const sleep = parseFloat(document.getElementById('sleepHours').value);
      const stress = parseInt(document.getElementById('stressLevel').value);
      const screenTime = parseFloat(document.getElementById('screenTime').value);
      const exercise = document.getElementById('exercise').value;
      const workHours = parseFloat(document.getElementById('workHours').value);
      const mood = parseInt(document.getElementById('moodScore').value) || 3;
      const water = parseInt(document.getElementById('waterCount').textContent) || 0;

      // Validation
      if (isNaN(sleep) || isNaN(stress) || isNaN(screenTime) || !exercise || isNaN(workHours)) {
        App.showToast('Please fill in all fields!', '⚠️');
        return;
      }

      // Calculate habit score
      const score = calculateHabitScore(sleep, stress, screenTime, exercise, workHours);

      // Generate suggestions
      const suggestions = generateSuggestions(sleep, stress, screenTime, exercise, workHours);

      // Prediction
      const prediction = score >= 60 ? 'likely' : 'unlikely';

      // Build entry
      const entry = {
        date: App.getTodayKey(),
        sleep,
        stress,
        screenTime,
        exercise,
        workHours,
        mood,
        water,
        score,
        prediction,
        suggestions
      };

      // Save
      App.saveHabitEntry(username, entry);

      // Update UI
      displayResults(entry);
      updateStats();
      renderHeatmap();

      // Streak notification
      const streak = App.getStreak(username);
      if (streak > 1) {
        App.showToast(`🔥 ${streak}-day streak! Keep it going!`, '🔥');
      } else {
        App.showToast('Habits logged successfully!', '✅');
      }
    });
  }
});

// ── Mood Picker ──
function initMoodPicker() {
  const picker = document.getElementById('moodPicker');
  if (!picker) return;

  picker.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      picker.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('moodScore').value = btn.dataset.mood;
    });
  });
}

// ── Water Tracker ──
function initWaterTracker() {
  const countEl = document.getElementById('waterCount');
  const plusBtn = document.getElementById('waterPlus');
  const minusBtn = document.getElementById('waterMinus');
  if (!countEl || !plusBtn || !minusBtn) return;

  plusBtn.addEventListener('click', () => {
    let val = parseInt(countEl.textContent) || 0;
    if (val < 20) countEl.textContent = val + 1;
  });

  minusBtn.addEventListener('click', () => {
    let val = parseInt(countEl.textContent) || 0;
    if (val > 0) countEl.textContent = val - 1;
  });
}

// ── Load Today's Existing Data ──
function loadTodayData() {
  const username = App.getCurrentUser();
  const data = App.getHabitData(username);
  const todayKey = App.getTodayKey();
  const todayEntry = data.find(e => e.date === todayKey);

  if (todayEntry) {
    document.getElementById('sleepHours').value = todayEntry.sleep;
    document.getElementById('stressLevel').value = todayEntry.stress;
    document.getElementById('screenTime').value = todayEntry.screenTime;
    document.getElementById('exercise').value = todayEntry.exercise;
    document.getElementById('workHours').value = todayEntry.workHours;

    // Restore mood
    if (todayEntry.mood) {
      const moodBtn = document.querySelector(`.mood-btn[data-mood="${todayEntry.mood}"]`);
      if (moodBtn) {
        moodBtn.classList.add('active');
        document.getElementById('moodScore').value = todayEntry.mood;
      }
    }

    // Restore water
    if (todayEntry.water !== undefined) {
      document.getElementById('waterCount').textContent = todayEntry.water;
    }

    displayResults(todayEntry);
  }
}

// ── Calculate Habit Score ──
function calculateHabitScore(sleep, stress, screenTime, exercise, workHours) {
  let completed = 0;
  const total = 5;

  // Sleep: good if 7-9 hours
  if (sleep >= 7 && sleep <= 9) completed++;
  else if (sleep >= 6) completed += 0.5;

  // Stress: good if <= 4
  if (stress <= 4) completed++;
  else if (stress <= 6) completed += 0.5;

  // Screen time: good if <= 3 hours
  if (screenTime <= 3) completed++;
  else if (screenTime <= 5) completed += 0.5;

  // Exercise: good if yes
  if (exercise === 'yes') completed++;

  // Work hours: good if 4-8 hours
  if (workHours >= 4 && workHours <= 8) completed++;
  else if (workHours >= 2) completed += 0.5;

  return Math.round((completed / total) * 100);
}

// ── Generate Adaptive Suggestions ──
function generateSuggestions(sleep, stress, screenTime, exercise, workHours) {
  const suggestions = [];

  if (sleep < 6) {
    suggestions.push({
      icon: '😴',
      text: 'You\'re not getting enough sleep. Aim for 7-9 hours for optimal health and cognitive function.'
    });
  } else if (sleep > 9) {
    suggestions.push({
      icon: '⏰',
      text: 'Oversleeping can cause fatigue. Try to keep sleep between 7-9 hours.'
    });
  } else {
    suggestions.push({
      icon: '🌙',
      text: 'Great sleep habits! Keep maintaining your 7-9 hour sleep schedule.'
    });
  }

  if (stress > 7) {
    suggestions.push({
      icon: '🧘',
      text: 'Your stress level is high. Try meditation, deep breathing, or a relaxing walk to unwind.'
    });
  } else if (stress > 4) {
    suggestions.push({
      icon: '💆',
      text: 'Moderate stress detected. Consider short breaks and mindfulness exercises during the day.'
    });
  }

  if (screenTime > 5) {
    suggestions.push({
      icon: '📵',
      text: 'High screen time! Take regular breaks using the 20-20-20 rule and limit non-essential screen use.'
    });
  } else if (screenTime > 3) {
    suggestions.push({
      icon: '👀',
      text: 'Screen time is moderate. Try to reduce to under 3 hours for non-work activities.'
    });
  }

  if (exercise === 'no') {
    suggestions.push({
      icon: '🏃',
      text: 'No exercise today! Even a 15-minute walk or quick stretches can boost your mood and energy.'
    });
  } else {
    suggestions.push({
      icon: '💪',
      text: 'Awesome! You exercised today. Consistency is the key to long-term health.'
    });
  }

  if (workHours > 10) {
    suggestions.push({
      icon: '⚡',
      text: 'You\'re overworking. Take regular breaks to avoid burnout and maintain productivity.'
    });
  } else if (workHours < 2) {
    suggestions.push({
      icon: '📚',
      text: 'Low work hours today. Set small goals to build momentum if you\'re feeling unmotivated.'
    });
  }

  return suggestions;
}

// ── Display Results ──
function displayResults(entry) {
  const resultsSection = document.getElementById('resultsSection');
  resultsSection.style.display = 'block';
  resultsSection.classList.add('slide-up');

  // Update score ring
  updateScoreRing(entry.score);

  // Update prediction
  const predEl = document.getElementById('prediction');
  if (entry.prediction === 'likely') {
    predEl.className = 'prediction-badge positive';
    predEl.innerHTML = '✅ Likely to Complete Goals';
  } else {
    predEl.className = 'prediction-badge negative';
    predEl.innerHTML = '⚠️ Needs Improvement';
  }

  // Update suggestions
  const sugList = document.getElementById('suggestionsList');
  sugList.innerHTML = '';
  entry.suggestions.forEach(s => {
    const li = document.createElement('li');
    li.className = 'suggestion-item';
    li.innerHTML = `<span class="suggestion-icon">${s.icon}</span><span>${s.text}</span>`;
    sugList.appendChild(li);
  });
}

// ── Score Ring Animation ──
function updateScoreRing(score) {
  const scoreNum = document.getElementById('scoreNumber');
  scoreNum.textContent = `${score}%`;

  const ringFill = document.getElementById('ringFill');
  const circumference = 2 * Math.PI * 70; // r=70
  const offset = circumference - (score / 100) * circumference;

  // Reset for animation
  ringFill.style.transition = 'none';
  ringFill.style.strokeDashoffset = circumference;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ringFill.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
      ringFill.style.strokeDashoffset = offset;
    });
  });

  // Update gradient color based on score
  const stop1 = document.getElementById('gradStop1');
  const stop2 = document.getElementById('gradStop2');
  if (score >= 80) {
    stop1.setAttribute('stop-color', '#10b981');
    stop2.setAttribute('stop-color', '#059669');
  } else if (score >= 60) {
    stop1.setAttribute('stop-color', '#6366f1');
    stop2.setAttribute('stop-color', '#4f46e5');
  } else if (score >= 40) {
    stop1.setAttribute('stop-color', '#f59e0b');
    stop2.setAttribute('stop-color', '#d97706');
  } else {
    stop1.setAttribute('stop-color', '#ef4444');
    stop2.setAttribute('stop-color', '#dc2626');
  }
}

// ── Update Stats Bar ──
function updateStats() {
  const username = App.getCurrentUser();
  const data = App.getHabitData(username);
  const streak = App.getStreak(username);
  const todayKey = App.getTodayKey();
  const todayEntry = data.find(e => e.date === todayKey);

  // Streak
  document.getElementById('streakCount').textContent = streak;

  // Today's score
  document.getElementById('todayScore').textContent = todayEntry ? `${todayEntry.score}%` : '--';

  // Total entries
  document.getElementById('totalEntries').textContent = data.length;

  // Average score
  const avg = data.length > 0
    ? Math.round(data.reduce((sum, e) => sum + e.score, 0) / data.length)
    : 0;
  document.getElementById('avgScore').textContent = data.length > 0 ? `${avg}%` : '--';

  // Streak fire animation
  const fireEl = document.getElementById('streakFire');
  if (fireEl) {
    fireEl.style.display = streak > 0 ? 'inline' : 'none';
  }
}

// ── Health Tips ──
function renderHealthTips() {
  const container = document.getElementById('healthTips');
  if (!container) return;

  // Show 3 random tips based on day
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const tips = [];
  for (let i = 0; i < 3; i++) {
    tips.push(HEALTH_TIPS[(dayOfYear + i) % HEALTH_TIPS.length]);
  }

  container.innerHTML = tips.map(t => `
    <div class="tip-card">
      <div class="tip-icon">${t.icon}</div>
      <div class="tip-content">
        <div class="tip-category">${t.category}</div>
        <div class="tip-text">${t.tip}</div>
      </div>
    </div>
  `).join('');
}

// ── Activity Heatmap (last 90 days) ──
function renderHeatmap() {
  const container = document.getElementById('heatmapGrid');
  if (!container) return;

  const username = App.getCurrentUser();
  const data = App.getHabitData(username);

  // Build lookup map
  const scoreMap = {};
  data.forEach(e => scoreMap[e.date] = e.score);

  const cells = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const score = scoreMap[key];

    let color = 'var(--bg-tertiary)';
    let title = `${App.formatDate(key)}: No data`;

    if (score !== undefined) {
      if (score >= 80) color = 'rgba(16,185,129,0.9)';
      else if (score >= 60) color = 'rgba(16,185,129,0.6)';
      else if (score >= 40) color = 'rgba(16,185,129,0.4)';
      else color = 'rgba(16,185,129,0.2)';
      title = `${App.formatDate(key)}: ${score}%`;
    }

    cells.push(`<div class="heatmap-cell" style="background:${color}" title="${title}"></div>`);
  }

  container.innerHTML = cells.join('');
}
