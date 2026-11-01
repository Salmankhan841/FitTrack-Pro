import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from 'recharts';
import { 
  Activity, 
  Flame, 
  Dumbbell, 
  Calendar, 
  Scale, 
  Plus, 
  TrendingUp, 
  Clock, 
  Sparkles 
} from 'lucide-react';
import Card from '../../components/common/Card';
import './Dashboard.css';

const Dashboard = () => {
  const user = useSelector(state => state.auth.user);
  const workouts = useSelector(state => state.workout.workouts);
  const meals = useSelector(state => state.nutrition.meals);
  const logs = useSelector(state => state.progress.logs);

  const totalWorkouts = workouts.length;
  
  // Calculate estimated calories burned today
  const today = new Date().toISOString().split('T')[0];
  const todayWorkouts = workouts.filter(w => w.date === today);
  const todayCaloriesBurned = todayWorkouts.reduce((sum, w) => sum + (Number(w.duration) * 8 || 0), 0);

  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : '--';

  // Last 7 days dynamic calculation for Calories & Workout charts
  const { caloriesData, workoutData, activeDaysThisWeek } = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({ dateStr, dayName });
    }

    const past7DateSet = new Set(days.map(d => d.dateStr));

    const cData = days.map(({ dateStr, dayName }) => {
      const dayMeals = meals.filter(m => m.date === dateStr);
      const consumed = dayMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
      const dayWorkouts = workouts.filter(w => w.date === dateStr);
      const burned = dayWorkouts.reduce((sum, w) => sum + (Number(w.duration) * 8 || 0), 0);
      return {
        name: dayName,
        date: dateStr,
        caloriesConsumed: consumed,
        caloriesBurned: burned
      };
    });

    const wData = days.map(({ dateStr, dayName }) => {
      const dayWorkouts = workouts.filter(w => w.date === dateStr);
      const duration = dayWorkouts.reduce((sum, w) => sum + (Number(w.duration) || 0), 0);
      return {
        day: dayName,
        date: dateStr,
        duration
      };
    });

    const uniqueActiveWorkoutDays = new Set(
      workouts
        .filter(w => past7DateSet.has(w.date))
        .map(w => w.date)
    ).size;

    return { 
      caloriesData: cData, 
      workoutData: wData,
      activeDaysThisWeek: uniqueActiveWorkoutDays 
    };
  }, [meals, workouts]);

  const progressData = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted.slice(-7).map((log, index) => {
      const dateObj = new Date(log.date);
      const label = isNaN(dateObj.getTime()) 
        ? `W${index + 1}` 
        : `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
      return {
        week: label,
        weight: Number(log.weight) || 0,
        target: 73.0
      };
    });
  }, [logs]);

  // Sort activities chronologically for the timeline
  const recentActivity = useMemo(() => {
    const combined = [
      ...workouts.map(w => ({ ...w, type: 'workout', timestamp: new Date(w.date).getTime() })),
      ...meals.map(m => ({ ...m, type: 'meal', timestamp: new Date(m.date).getTime() })),
      ...logs.map(l => ({ ...l, type: 'progress', timestamp: new Date(l.date).getTime() }))
    ];
    return combined.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);
  }, [workouts, meals, logs]);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="dashboard-container" data-aos="fade-in">
      {/* Welcome & Quick Actions Header */}
      <header className="dashboard-header">
        <div className="dashboard-welcome">
          <div className="dashboard-date-badge">
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
          <h1>Welcome back, <span className="welcome-name">{user?.name || 'Athlete'}</span></h1>
          <p>Here is your workout summary and nutrition balance for this week.</p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="dashboard-quick-actions">
          <Link to="/workouts" className="quick-action-btn primary">
            <Plus size={16} />
            <span>Log Workout</span>
          </Link>
          <Link to="/nutrition" className="quick-action-btn secondary">
            <Plus size={16} />
            <span>Log Meal</span>
          </Link>
          <Link to="/progress" className="quick-action-btn tertiary">
            <Plus size={16} />
            <span>Record Weight</span>
          </Link>
        </div>
      </header>
      
      {/* 4 Core Stat Metric Cards */}
      <div className="stats-grid">
        <Card glow className="stat-card" data-aos="fade-up" data-aos-delay="0">
          <div className="stat-card-inner">
            <div className="stat-icon-wrap icon-primary">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Weekly Consistency</span>
              <div className="stat-value-row">
                <span className="stat-value">{activeDaysThisWeek}</span>
                <span className="stat-sub">/ 7 Days</span>
              </div>
              <span className={`stat-trend ${activeDaysThisWeek > 0 ? 'trend-positive' : 'trend-neutral'}`}>
                {activeDaysThisWeek > 0 ? (
                  <>
                    <TrendingUp size={12} /> {Math.round((activeDaysThisWeek / 7) * 100)}% of target
                  </>
                ) : (
                  <>
                    <Clock size={12} /> 0% this week
                  </>
                )}
              </span>
            </div>
          </div>
        </Card>
        
        <Card glow className="stat-card" data-aos="fade-up" data-aos-delay="100">
          <div className="stat-card-inner">
            <div className="stat-icon-wrap icon-warning">
              <Flame size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Calories Burned</span>
              <div className="stat-value-row">
                <span className="stat-value">{todayCaloriesBurned}</span>
                <span className="stat-sub">kcal</span>
              </div>
              <span className={`stat-trend ${todayCaloriesBurned > 0 ? 'trend-positive' : 'trend-neutral'}`}>
                {todayCaloriesBurned > 0 ? (
                  <>
                    <Flame size={12} /> Active burn today
                  </>
                ) : (
                  <>
                    <Clock size={12} /> 0 kcal burned today
                  </>
                )}
              </span>
            </div>
          </div>
        </Card>
        
        <Card glow className="stat-card" data-aos="fade-up" data-aos-delay="200">
          <div className="stat-card-inner">
            <div className="stat-icon-wrap icon-success">
              <Dumbbell size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Workouts</span>
              <div className="stat-value-row">
                <span className="stat-value">{totalWorkouts}</span>
                <span className="stat-sub">Logged</span>
              </div>
              <span className={`stat-trend ${totalWorkouts > 0 ? 'trend-positive' : 'trend-neutral'}`}>
                {totalWorkouts > 0 ? (
                  <>
                    <Sparkles size={12} /> Keep the streak!
                  </>
                ) : (
                  <>
                    <Plus size={12} /> Start your first workout
                  </>
                )}
              </span>
            </div>
          </div>
        </Card>

        <Card glow className="stat-card" data-aos="fade-up" data-aos-delay="300">
          <div className="stat-card-inner">
            <div className="stat-icon-wrap icon-cyan">
              <Scale size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Current Weight</span>
              <div className="stat-value-row">
                <span className="stat-value">{currentWeight}</span>
                {currentWeight !== '--' && <span className="stat-sub">kg</span>}
              </div>
              <span className="stat-trend trend-neutral">
                {currentWeight !== '--' ? 'Target: 73.0 kg' : '0 kg recorded yet'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Dashboard Layout: Charts + Recent Activity */}
      <div className="dashboard-main-layout">
        {/* Left Column: Charts */}
        <div className="charts-column">
          <Card title="Calories: Burned vs. Consumed" subtitle="Energy balance over the last 7 days" className="chart-card full-width-chart" data-aos="fade-right">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={caloriesData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBurned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.75}/>
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-warning)" stopOpacity={0.75}/>
                      <stop offset="95%" stopColor="var(--accent-warning)" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-secondary)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    tick={{fill: 'var(--text-secondary)', fontSize: 12}} 
                    axisLine={false} 
                    tickLine={false}
                    domain={[0, (dataMax) => (dataMax > 0 ? Math.ceil(dataMax * 1.15) : 500)]}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-surface-elevated)', 
                      borderColor: 'var(--border-highlight)', 
                      borderRadius: '10px',
                      boxShadow: 'var(--shadow-card)',
                      color: 'var(--text-primary)'
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Area type="monotone" name="Consumed (kcal)" dataKey="caloriesConsumed" stroke="var(--accent-warning)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorConsumed)" />
                  <Area type="monotone" name="Burned (kcal)" dataKey="caloriesBurned" stroke="var(--accent-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBurned)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="secondary-charts">
            <Card title="Workout Duration" subtitle="Minutes per session" className="chart-card" data-aos="fade-up" data-aos-delay="100">
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={workoutData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--text-muted)" tick={{fill: 'var(--text-secondary)', fontSize: 11}} axisLine={false} tickLine={false} />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      tick={{fill: 'var(--text-secondary)', fontSize: 11}} 
                      axisLine={false} 
                      tickLine={false}
                      domain={[0, (dataMax) => (dataMax > 0 ? Math.ceil(dataMax * 1.2) : 60)]}
                    />
                    <RechartsTooltip 
                      cursor={{fill: 'var(--chart-cursor)'}}
                      contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-highlight)', borderRadius: '10px', boxShadow: 'var(--shadow-card)', color: 'var(--text-primary)' }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="duration" name="Duration (min)" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Weight Progression" subtitle="Weekly target tracking" className="chart-card" data-aos="fade-up" data-aos-delay="200">
              <div className="chart-wrapper">
                {progressData.length === 0 ? (
                  <div className="empty-chart-placeholder">
                    <Scale size={28} />
                    <span>0 weigh-ins logged</span>
                    <p>Record your body weight to unlock your progression trend line.</p>
                    <Link to="/progress" className="empty-chart-action">
                      <Plus size={14} /> Record Weight
                    </Link>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={progressData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis dataKey="week" stroke="var(--text-muted)" tick={{fill: 'var(--text-secondary)', fontSize: 11}} axisLine={false} tickLine={false} />
                      <YAxis 
                        domain={[(dataMin) => Math.max(0, Math.floor(dataMin - 2)), (dataMax) => Math.ceil(dataMax + 2)]} 
                        stroke="var(--text-muted)" 
                        tick={{fill: 'var(--text-secondary)', fontSize: 11}} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-highlight)', borderRadius: '10px', boxShadow: 'var(--shadow-card)', color: 'var(--text-primary)' }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                      />
                      <Line type="monotone" name="Weight (kg)" dataKey="weight" stroke="var(--accent-secondary)" strokeWidth={3} dot={{r: 5, fill: 'var(--bg-surface)', stroke: 'var(--accent-secondary)', strokeWidth: 2}} activeDot={{r: 7}} />
                      <Line type="monotone" name="Goal (kg)" dataKey="target" stroke="var(--accent-success)" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="activity-column" data-aos="fade-left">
          <Card title="Recent Activity" subtitle="Your latest workouts, meals, and weigh-ins" className="activity-card">
            {recentActivity.length === 0 ? (
              <div className="empty-activity">
                <div className="empty-icon-wrap">
                  <Calendar size={32} />
                </div>
                <h4>No recent activity</h4>
                <p>Start logging your workouts, meals, or weight measurements to see your timeline here.</p>
                <Link to="/workouts" className="empty-cta-btn">
                  <Plus size={16} /> Log First Workout
                </Link>
              </div>
            ) : (
              <div className="activity-timeline">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker">
                      <div className={`marker-dot ${activity.type}`}>
                        {activity.type === 'workout' && <Dumbbell size={15} />}
                        {activity.type === 'meal' && <Flame size={15} />}
                        {activity.type === 'progress' && <Scale size={15} />}
                      </div>
                      {index !== recentActivity.length - 1 && <div className="marker-line" />}
                    </div>

                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="activity-title">
                          {activity.type === 'workout' && (activity.exerciseName || 'Workout')}
                          {activity.type === 'meal' && (activity.mealName || 'Meal Log')}
                          {activity.type === 'progress' && 'Weight Check-In'}
                        </span>
                        <span className="timeline-date">{activity.date}</span>
                      </div>

                      <div className="timeline-details">
                        {activity.type === 'workout' && (
                          <div className="activity-pill-row">
                            <span className="pill pill-primary">{activity.sets} Sets</span>
                            <span className="pill pill-primary">{activity.reps} Reps</span>
                            {activity.weight > 0 && <span className="pill pill-accent">{activity.weight} kg</span>}
                          </div>
                        )}
                        {activity.type === 'meal' && (
                          <div className="activity-pill-row">
                            <span className="pill pill-warning">{activity.calories} kcal</span>
                            {activity.protein > 0 && <span className="pill pill-sub">P: {activity.protein}g</span>}
                            {activity.carbs > 0 && <span className="pill pill-sub">C: {activity.carbs}g</span>}
                          </div>
                        )}
                        {activity.type === 'progress' && (
                          <div className="activity-pill-row">
                            <span className="pill pill-cyan">{activity.weight} kg recorded</span>
                            {activity.bodyFat && <span className="pill pill-sub">{activity.bodyFat}% BF</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
