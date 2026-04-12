/* ============================================
   Kaggle Dataset Loader & Processor
   Source: Modeled after Kaggle's
   "Sleep, Screen Time and Stress Analysis"
   Dataset: 175 records, 25 users, 18 features
   ============================================ */

const KaggleData = {

  _cache: null,

  // ── Load & Parse CSV ──
  async load() {
    if (this._cache) return this._cache;

    try {
      const response = await fetch('data/kaggle_habits_dataset.csv');
      if (!response.ok) throw new Error('CSV not found');
      const text = await response.text();
      this._cache = this.parseCSV(text);
      return this._cache;
    } catch (err) {
      console.warn('⚠️ Could not load CSV, using embedded dataset');
      this._cache = this.getEmbeddedData();
      return this._cache;
    }
  },

  // ── Parse CSV Text to Array of Objects ──
  parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const row = {};
      headers.forEach((h, idx) => {
        const val = values[idx];
        // Auto-convert numbers
        if (['sleep_hours', 'sleep_quality', 'stress_level', 'screen_time_hours',
             'exercise_duration_min', 'work_study_hours', 'caffeine_intake_mg',
             'water_intake_liters', 'mood_score', 'heart_rate_bpm',
             'daily_steps', 'habit_score', 'age'].includes(h)) {
          row[h] = parseFloat(val);
        } else {
          row[h] = val;
        }
      });
      data.push(row);
    }

    return data;
  },

  // ── Embedded Fallback (subset of CSV, for GitHub Pages flat-file issues) ──
  getEmbeddedData() {
    return [
      {user_id:"U001",date:"2026-03-01",age:21,gender:"Female",sleep_hours:7.5,sleep_quality:8,stress_level:3,screen_time_hours:2.5,exercise:"Yes",exercise_duration_min:45,work_study_hours:6.5,caffeine_intake_mg:120,water_intake_liters:2.5,mood_score:8,heart_rate_bpm:72,daily_steps:8500,habit_score:80,prediction:"Likely"},
      {user_id:"U001",date:"2026-03-02",age:21,gender:"Female",sleep_hours:6.0,sleep_quality:5,stress_level:6,screen_time_hours:5.0,exercise:"No",exercise_duration_min:0,work_study_hours:8.0,caffeine_intake_mg:200,water_intake_liters:1.5,mood_score:5,heart_rate_bpm:78,daily_steps:4200,habit_score:40,prediction:"Unlikely"},
      {user_id:"U001",date:"2026-03-03",age:21,gender:"Female",sleep_hours:7.0,sleep_quality:7,stress_level:4,screen_time_hours:3.5,exercise:"Yes",exercise_duration_min:30,work_study_hours:7.0,caffeine_intake_mg:150,water_intake_liters:2.0,mood_score:7,heart_rate_bpm:74,daily_steps:7200,habit_score:70,prediction:"Likely"},
      {user_id:"U001",date:"2026-03-04",age:21,gender:"Female",sleep_hours:8.0,sleep_quality:9,stress_level:2,screen_time_hours:2.0,exercise:"Yes",exercise_duration_min:60,work_study_hours:6.0,caffeine_intake_mg:80,water_intake_liters:3.0,mood_score:9,heart_rate_bpm:68,daily_steps:10200,habit_score:90,prediction:"Likely"},
      {user_id:"U002",date:"2026-03-01",age:24,gender:"Male",sleep_hours:6.0,sleep_quality:5,stress_level:7,screen_time_hours:6.0,exercise:"No",exercise_duration_min:0,work_study_hours:10.0,caffeine_intake_mg:300,water_intake_liters:1.5,mood_score:4,heart_rate_bpm:80,daily_steps:3500,habit_score:30,prediction:"Unlikely"},
      {user_id:"U002",date:"2026-03-04",age:24,gender:"Male",sleep_hours:7.0,sleep_quality:7,stress_level:5,screen_time_hours:4.5,exercise:"Yes",exercise_duration_min:40,work_study_hours:8.0,caffeine_intake_mg:200,water_intake_liters:2.0,mood_score:6,heart_rate_bpm:74,daily_steps:7000,habit_score:60,prediction:"Likely"},
      {user_id:"U002",date:"2026-03-07",age:24,gender:"Male",sleep_hours:8.0,sleep_quality:8,stress_level:3,screen_time_hours:2.5,exercise:"Yes",exercise_duration_min:55,work_study_hours:6.5,caffeine_intake_mg:100,water_intake_liters:2.5,mood_score:8,heart_rate_bpm:70,daily_steps:9000,habit_score:90,prediction:"Likely"},
      {user_id:"U003",date:"2026-03-01",age:19,gender:"Female",sleep_hours:8.0,sleep_quality:8,stress_level:3,screen_time_hours:3.0,exercise:"Yes",exercise_duration_min:40,work_study_hours:5.0,caffeine_intake_mg:50,water_intake_liters:2.0,mood_score:8,heart_rate_bpm:70,daily_steps:7800,habit_score:80,prediction:"Likely"},
      {user_id:"U003",date:"2026-03-03",age:19,gender:"Female",sleep_hours:9.0,sleep_quality:9,stress_level:2,screen_time_hours:2.0,exercise:"Yes",exercise_duration_min:60,work_study_hours:4.5,caffeine_intake_mg:30,water_intake_liters:3.0,mood_score:9,heart_rate_bpm:65,daily_steps:11000,habit_score:100,prediction:"Likely"},
      {user_id:"U004",date:"2026-03-01",age:28,gender:"Male",sleep_hours:5.0,sleep_quality:3,stress_level:8,screen_time_hours:7.5,exercise:"No",exercise_duration_min:0,work_study_hours:12.0,caffeine_intake_mg:400,water_intake_liters:1.0,mood_score:3,heart_rate_bpm:88,daily_steps:2200,habit_score:10,prediction:"Unlikely"},
      {user_id:"U004",date:"2026-03-05",age:28,gender:"Male",sleep_hours:7.0,sleep_quality:7,stress_level:5,screen_time_hours:4.5,exercise:"Yes",exercise_duration_min:30,work_study_hours:8.0,caffeine_intake_mg:200,water_intake_liters:2.0,mood_score:6,heart_rate_bpm:75,daily_steps:6500,habit_score:60,prediction:"Likely"},
      {user_id:"U005",date:"2026-03-01",age:22,gender:"Female",sleep_hours:7.0,sleep_quality:7,stress_level:5,screen_time_hours:4.0,exercise:"Yes",exercise_duration_min:30,work_study_hours:7.0,caffeine_intake_mg:150,water_intake_liters:2.0,mood_score:6,heart_rate_bpm:74,daily_steps:6800,habit_score:60,prediction:"Likely"},
      {user_id:"U005",date:"2026-03-04",age:22,gender:"Female",sleep_hours:8.0,sleep_quality:8,stress_level:2,screen_time_hours:2.0,exercise:"Yes",exercise_duration_min:50,work_study_hours:6.0,caffeine_intake_mg:80,water_intake_liters:3.0,mood_score:9,heart_rate_bpm:68,daily_steps:9500,habit_score:90,prediction:"Likely"},
      {user_id:"U008",date:"2026-03-03",age:30,gender:"Male",sleep_hours:5.0,sleep_quality:3,stress_level:9,screen_time_hours:8.0,exercise:"No",exercise_duration_min:0,work_study_hours:12.0,caffeine_intake_mg:400,water_intake_liters:0.8,mood_score:2,heart_rate_bpm:90,daily_steps:1800,habit_score:10,prediction:"Unlikely"},
      {user_id:"U008",date:"2026-03-07",age:30,gender:"Male",sleep_hours:7.5,sleep_quality:8,stress_level:3,screen_time_hours:3.0,exercise:"Yes",exercise_duration_min:45,work_study_hours:7.0,caffeine_intake_mg:120,water_intake_liters:2.5,mood_score:8,heart_rate_bpm:70,daily_steps:8800,habit_score:80,prediction:"Likely"},
      {user_id:"U010",date:"2026-03-06",age:25,gender:"Male",sleep_hours:8.0,sleep_quality:9,stress_level:2,screen_time_hours:2.0,exercise:"Yes",exercise_duration_min:50,work_study_hours:6.0,caffeine_intake_mg:80,water_intake_liters:3.0,mood_score:9,heart_rate_bpm:67,daily_steps:9800,habit_score:90,prediction:"Likely"},
      {user_id:"U013",date:"2026-03-10",age:20,gender:"Female",sleep_hours:9.0,sleep_quality:9,stress_level:1,screen_time_hours:1.0,exercise:"Yes",exercise_duration_min:60,work_study_hours:4.0,caffeine_intake_mg:20,water_intake_liters:3.5,mood_score:10,heart_rate_bpm:64,daily_steps:12000,habit_score:100,prediction:"Likely"},
      {user_id:"U020",date:"2026-03-22",age:31,gender:"Male",sleep_hours:5.0,sleep_quality:3,stress_level:9,screen_time_hours:8.0,exercise:"No",exercise_duration_min:0,work_study_hours:12.0,caffeine_intake_mg:420,water_intake_liters:0.8,mood_score:2,heart_rate_bpm:91,daily_steps:1800,habit_score:10,prediction:"Unlikely"},
      {user_id:"U020",date:"2026-03-28",age:31,gender:"Male",sleep_hours:8.0,sleep_quality:8,stress_level:2,screen_time_hours:2.0,exercise:"Yes",exercise_duration_min:55,work_study_hours:6.0,caffeine_intake_mg:80,water_intake_liters:3.0,mood_score:9,heart_rate_bpm:67,daily_steps:9800,habit_score:90,prediction:"Likely"},
      {user_id:"U025",date:"2026-04-08",age:22,gender:"Female",sleep_hours:8.0,sleep_quality:9,stress_level:2,screen_time_hours:1.5,exercise:"Yes",exercise_duration_min:55,work_study_hours:5.5,caffeine_intake_mg:60,water_intake_liters:3.0,mood_score:9,heart_rate_bpm:66,daily_steps:10000,habit_score:100,prediction:"Likely"},
    ];
  },

  // ══════════════════════════════════════
  //  STATISTICAL ANALYSIS FUNCTIONS
  // ══════════════════════════════════════

  // ── Overall Summary Stats ──
  getSummary(data) {
    const n = data.length;
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const uniqueUsers = [...new Set(data.map(d => d.user_id))].length;

    return {
      totalRecords: n,
      totalUsers: uniqueUsers,
      dateRange: {
        from: data.reduce((min, d) => d.date < min ? d.date : min, data[0].date),
        to: data.reduce((max, d) => d.date > max ? d.date : max, data[0].date)
      },
      averages: {
        sleep: +avg(data.map(d => d.sleep_hours)).toFixed(1),
        stress: +avg(data.map(d => d.stress_level)).toFixed(1),
        screenTime: +avg(data.map(d => d.screen_time_hours)).toFixed(1),
        workHours: +avg(data.map(d => d.work_study_hours)).toFixed(1),
        habitScore: Math.round(avg(data.map(d => d.habit_score))),
        mood: +avg(data.map(d => d.mood_score)).toFixed(1),
        heartRate: Math.round(avg(data.map(d => d.heart_rate_bpm))),
        steps: Math.round(avg(data.map(d => d.daily_steps))),
        caffeine: Math.round(avg(data.map(d => d.caffeine_intake_mg))),
        water: +avg(data.map(d => d.water_intake_liters)).toFixed(1),
      },
      exerciseRate: Math.round((data.filter(d => d.exercise === 'Yes').length / n) * 100),
      likelyRate: Math.round((data.filter(d => d.prediction === 'Likely').length / n) * 100),
    };
  },

  // ── Gender-based Comparison ──
  getGenderComparison(data) {
    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const males = data.filter(d => d.gender === 'Male');
    const females = data.filter(d => d.gender === 'Female');

    const compute = (subset) => ({
      count: subset.length,
      avgSleep: +avg(subset.map(d => d.sleep_hours)).toFixed(1),
      avgStress: +avg(subset.map(d => d.stress_level)).toFixed(1),
      avgScreen: +avg(subset.map(d => d.screen_time_hours)).toFixed(1),
      avgScore: Math.round(avg(subset.map(d => d.habit_score))),
      exerciseRate: Math.round((subset.filter(d => d.exercise === 'Yes').length / subset.length) * 100),
    });

    return { male: compute(males), female: compute(females) };
  },

  // ── Score Distribution ──
  getScoreDistribution(data) {
    return {
      excellent: data.filter(d => d.habit_score >= 80).length,
      good: data.filter(d => d.habit_score >= 50 && d.habit_score < 80).length,
      needsWork: data.filter(d => d.habit_score < 50).length,
    };
  },

  // ── Correlation: Sleep vs Stress ──
  getSleepStressCorrelation(data) {
    const groups = {};
    data.forEach(d => {
      const sleepBucket = Math.round(d.sleep_hours);
      if (!groups[sleepBucket]) groups[sleepBucket] = [];
      groups[sleepBucket].push(d.stress_level);
    });

    return Object.entries(groups)
      .map(([sleep, stresses]) => ({
        sleepHours: +sleep,
        avgStress: +(stresses.reduce((a, b) => a + b, 0) / stresses.length).toFixed(1),
        count: stresses.length
      }))
      .sort((a, b) => a.sleepHours - b.sleepHours);
  },

  // ── Screen Time Impact on Mood ──
  getScreenTimeMoodImpact(data) {
    const groups = { '0-2h': [], '2-4h': [], '4-6h': [], '6+h': [] };

    data.forEach(d => {
      if (d.screen_time_hours <= 2) groups['0-2h'].push(d);
      else if (d.screen_time_hours <= 4) groups['2-4h'].push(d);
      else if (d.screen_time_hours <= 6) groups['4-6h'].push(d);
      else groups['6+h'].push(d);
    });

    return Object.entries(groups).map(([range, entries]) => ({
      range,
      avgMood: entries.length ? +(entries.reduce((s, e) => s + e.mood_score, 0) / entries.length).toFixed(1) : 0,
      avgScore: entries.length ? Math.round(entries.reduce((s, e) => s + e.habit_score, 0) / entries.length) : 0,
      count: entries.length
    }));
  },

  // ── Age Group Analysis ──
  getAgeGroupAnalysis(data) {
    const groups = { '18-20': [], '21-25': [], '26-30': [], '31+': [] };

    data.forEach(d => {
      if (d.age <= 20) groups['18-20'].push(d);
      else if (d.age <= 25) groups['21-25'].push(d);
      else if (d.age <= 30) groups['26-30'].push(d);
      else groups['31+'].push(d);
    });

    return Object.entries(groups).map(([range, entries]) => {
      const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      return {
        range,
        count: entries.length,
        avgScore: entries.length ? Math.round(avg(entries.map(e => e.habit_score))) : 0,
        avgSleep: entries.length ? +avg(entries.map(e => e.sleep_hours)).toFixed(1) : 0,
        avgStress: entries.length ? +avg(entries.map(e => e.stress_level)).toFixed(1) : 0,
        exerciseRate: entries.length ? Math.round((entries.filter(e => e.exercise === 'Yes').length / entries.length) * 100) : 0,
      };
    });
  },

  // ── Top Performers vs Strugglers ──
  getPerformanceComparison(data) {
    const sorted = [...data].sort((a, b) => b.habit_score - a.habit_score);
    const top20 = sorted.slice(0, Math.ceil(data.length * 0.2));
    const bottom20 = sorted.slice(-Math.ceil(data.length * 0.2));
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

    return {
      topPerformers: {
        avgSleep: +avg(top20.map(d => d.sleep_hours)).toFixed(1),
        avgStress: +avg(top20.map(d => d.stress_level)).toFixed(1),
        avgScreen: +avg(top20.map(d => d.screen_time_hours)).toFixed(1),
        avgSteps: Math.round(avg(top20.map(d => d.daily_steps))),
        avgCaffeine: Math.round(avg(top20.map(d => d.caffeine_intake_mg))),
        avgWater: +avg(top20.map(d => d.water_intake_liters)).toFixed(1),
      },
      strugglers: {
        avgSleep: +avg(bottom20.map(d => d.sleep_hours)).toFixed(1),
        avgStress: +avg(bottom20.map(d => d.stress_level)).toFixed(1),
        avgScreen: +avg(bottom20.map(d => d.screen_time_hours)).toFixed(1),
        avgSteps: Math.round(avg(bottom20.map(d => d.daily_steps))),
        avgCaffeine: Math.round(avg(bottom20.map(d => d.caffeine_intake_mg))),
        avgWater: +avg(bottom20.map(d => d.water_intake_liters)).toFixed(1),
      }
    };
  }
};
