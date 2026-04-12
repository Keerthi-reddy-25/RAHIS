/* ============================================
   Sample Dataset — 365 Days of Realistic Habit Data
   Pre-loaded for demonstration & analytics
   ============================================ */

const SampleData = {

  // ── Demo User Credentials ──
  demoUser: {
    username: 'demo',
    password: 'demo123'
  },

  // ── Generate Date String (YYYY-MM-DD) for N days ago ──
  daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  },

  // ── Build Suggestions for an Entry ──
  buildSuggestions(sleep, stress, screenTime, exercise, workHours) {
    const suggestions = [];

    if (sleep < 6) {
      suggestions.push({ icon: '😴', text: 'You\'re not getting enough sleep. Aim for 7-9 hours for optimal health and cognitive function.' });
    } else if (sleep > 9) {
      suggestions.push({ icon: '⏰', text: 'Oversleeping can cause fatigue. Try to keep sleep between 7-9 hours.' });
    } else {
      suggestions.push({ icon: '🌙', text: 'Great sleep habits! Keep maintaining your 7-9 hour sleep schedule.' });
    }

    if (stress > 7) {
      suggestions.push({ icon: '🧘', text: 'Your stress level is high. Try meditation, deep breathing, or a relaxing walk to unwind.' });
    } else if (stress > 4) {
      suggestions.push({ icon: '💆', text: 'Moderate stress detected. Consider short breaks and mindfulness exercises during the day.' });
    }

    if (screenTime > 5) {
      suggestions.push({ icon: '📵', text: 'High screen time! Take regular breaks using the 20-20-20 rule and limit non-essential screen use.' });
    } else if (screenTime > 3) {
      suggestions.push({ icon: '👀', text: 'Screen time is moderate. Try to reduce to under 3 hours for non-work activities.' });
    }

    if (exercise === 'no') {
      suggestions.push({ icon: '🏃', text: 'No exercise today! Even a 15-minute walk or quick stretches can boost your mood and energy.' });
    } else {
      suggestions.push({ icon: '💪', text: 'Awesome! You exercised today. Consistency is the key to long-term health.' });
    }

    if (workHours > 10) {
      suggestions.push({ icon: '⚡', text: 'You\'re overworking. Take regular breaks to avoid burnout and maintain productivity.' });
    } else if (workHours < 2) {
      suggestions.push({ icon: '📚', text: 'Low work hours today. Set small goals to build momentum if you\'re feeling unmotivated.' });
    }

    return suggestions;
  },

  // ── Calculate Score (mirrors dashboard.js logic) ──
  calcScore(sleep, stress, screenTime, exercise, workHours) {
    let completed = 0;
    const total = 5;
    if (sleep >= 7 && sleep <= 9) completed++;
    else if (sleep >= 6) completed += 0.5;
    if (stress <= 4) completed++;
    else if (stress <= 6) completed += 0.5;
    if (screenTime <= 3) completed++;
    else if (screenTime <= 5) completed += 0.5;
    if (exercise === 'yes') completed++;
    if (workHours >= 4 && workHours <= 8) completed++;
    else if (workHours >= 2) completed += 0.5;
    return Math.round((completed / total) * 100);
  },

  // ── Seeded Random (deterministic per day) ──
  seededRandom(seed) {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  },

  // ── Generate 365 Days of Realistic Data ──
  //    Simulates a user's habit journey over a full year
  //    Phase 1 (Days 365-270): Struggling — poor habits
  //    Phase 2 (Days 270-180): Awareness — starting to improve
  //    Phase 3 (Days 180-90):  Building — developing consistency
  //    Phase 4 (Days 90-0):    Thriving — strong habit routines
  getFullDataset() {
    const entries = [];

    for (let i = 364; i >= 0; i--) {
      const r = this.seededRandom(i + 42);
      const r2 = this.seededRandom(i + 137);
      const r3 = this.seededRandom(i + 256);
      const dayOfWeek = new Date(new Date().setDate(new Date().getDate() - i)).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Skip some days randomly (more skips early on, fewer later) to simulate real usage
      const skipChance = i > 270 ? 0.35 : i > 180 ? 0.2 : i > 90 ? 0.08 : 0.02;
      if (r < skipChance) continue;

      // Phase-based habit quality
      let sleepBase, stressBase, screenBase, exerciseChance, workBase;

      if (i > 270) {
        // Phase 1: Struggling
        sleepBase = 5 + r * 2.5;
        stressBase = 5 + r2 * 4.5;
        screenBase = 4 + r3 * 4;
        exerciseChance = 0.2;
        workBase = 7 + r * 5;
      } else if (i > 180) {
        // Phase 2: Awareness
        sleepBase = 5.5 + r * 3;
        stressBase = 4 + r2 * 4;
        screenBase = 3 + r3 * 3.5;
        exerciseChance = 0.4;
        workBase = 6 + r * 4;
      } else if (i > 90) {
        // Phase 3: Building
        sleepBase = 6.5 + r * 2.5;
        stressBase = 3 + r2 * 3.5;
        screenBase = 2 + r3 * 3;
        exerciseChance = 0.6;
        workBase = 5.5 + r * 3.5;
      } else {
        // Phase 4: Thriving
        sleepBase = 7 + r * 2;
        stressBase = 2 + r2 * 3;
        screenBase = 1 + r3 * 2.5;
        exerciseChance = 0.8;
        workBase = 5 + r * 3;
      }

      // Weekend modifiers
      if (isWeekend) {
        sleepBase += 0.5;
        stressBase -= 1;
        screenBase += 1.5;
        workBase -= 3;
      }

      // Add occasional bad/great days for realism
      if (r2 > 0.92) { stressBase += 3; sleepBase -= 1.5; } // Bad day
      if (r3 > 0.93) { sleepBase += 1; stressBase -= 2; }   // Great day

      const sleep = Math.round(Math.max(3, Math.min(10, sleepBase)) * 2) / 2;
      const stress = Math.round(Math.max(1, Math.min(10, stressBase)));
      const screenTime = Math.round(Math.max(0.5, Math.min(10, screenBase)) * 2) / 2;
      const exercise = r3 < exerciseChance ? 'yes' : 'no';
      const workHours = Math.round(Math.max(0, Math.min(14, workBase)) * 2) / 2;

      const score = this.calcScore(sleep, stress, screenTime, exercise, workHours);

      entries.push({
        date: this.daysAgo(i),
        sleep,
        stress,
        screenTime,
        exercise,
        workHours,
        score,
        prediction: score >= 60 ? 'likely' : 'unlikely',
        suggestions: this.buildSuggestions(sleep, stress, screenTime, exercise, workHours)
      });
    }

    return entries;
  },

  // ── Seed localStorage with Sample Data ──
  seed() {
    const users = JSON.parse(localStorage.getItem('habitiq-users') || '{}');
    const habits = JSON.parse(localStorage.getItem('habitiq-habits') || '{}');

    // Create demo user if not exists
    if (!users[this.demoUser.username]) {
      users[this.demoUser.username] = {
        password: this.demoUser.password,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('habitiq-users', JSON.stringify(users));
    }

    // Seed habit data if demo user has no data
    if (!habits[this.demoUser.username] || habits[this.demoUser.username].length === 0) {
      habits[this.demoUser.username] = this.getFullDataset();
      localStorage.setItem('habitiq-habits', JSON.stringify(habits));
    }

    console.log('✅ Sample dataset loaded: 365 days of habit data for demo user');
  },

  // ── Force Reset & Reseed ──
  reset() {
    const habits = JSON.parse(localStorage.getItem('habitiq-habits') || '{}');
    habits[this.demoUser.username] = this.getFullDataset();
    localStorage.setItem('habitiq-habits', JSON.stringify(habits));
    console.log('🔄 Sample data reset complete');
    location.reload();
  },

  // ── Dataset Summary Statistics ──
  getSummary() {
    const data = this.getFullDataset();
    const n = data.length;

    return {
      totalDays: n,
      dateRange: `${data[0].date} to ${data[n - 1].date}`,
      avgSleep: (data.reduce((s, e) => s + e.sleep, 0) / n).toFixed(1),
      avgStress: (data.reduce((s, e) => s + e.stress, 0) / n).toFixed(1),
      avgScreenTime: (data.reduce((s, e) => s + e.screenTime, 0) / n).toFixed(1),
      exerciseRate: Math.round((data.filter(e => e.exercise === 'yes').length / n) * 100) + '%',
      avgWorkHours: (data.reduce((s, e) => s + e.workHours, 0) / n).toFixed(1),
      avgScore: Math.round(data.reduce((s, e) => s + e.score, 0) / n),
      bestDay: data.reduce((best, e) => e.score > best.score ? e : best, data[0]),
      worstDay: data.reduce((worst, e) => e.score < worst.score ? e : worst, data[0]),
      completionDistribution: {
        excellent: data.filter(e => e.score >= 80).length,
        good: data.filter(e => e.score >= 50 && e.score < 80).length,
        needsWork: data.filter(e => e.score < 50).length
      }
    };
  }
};

// Auto-seed on every page load
document.addEventListener('DOMContentLoaded', () => SampleData.seed());
