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
  
  // Calculate average calories consumed today vs goal
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(m => m.date === today);
  const todayCaloriesConsumed = todayMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
  
  // Calculate estimated calories burned today
  const todayWorkouts = workouts.filter(w => w.date === today);
  const todayCaloriesBurned = todayWorkouts.reduce((sum, w) => sum + (Number(w.duration) * 8 || 0), 0);

  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : '--';

  // Sort activities chronologically for the timeline
  const recentActivity = useMemo(() => {
    const combined = [
      ...workouts.map(w => ({ ...w, type: 'workout', timestamp: new Date(w.date).getTime() })),
      ...meals.map(m => ({ ...m, type: 'meal', timestamp: new Date(m.date).getTime() })),
      ...logs.map(l => ({ ...l, type: 'progress', timestamp: new Date(l.date).getTime() }))
    ];
    return combined.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);
  }, [workouts, meals, logs]);

  // Chart data
  const caloriesData = [
    { name: 'Mon', caloriesBurned: 300, caloriesConsumed: 2200 },
    { name: 'Tue', caloriesBurned: 450, caloriesConsumed: 2100 },
    { name: 'Wed', caloriesBurned: 180, caloriesConsumed: 2300 },
    { name: 'Thu', caloriesBurned: 500, caloriesConsumed: 2000 },
    { name: 'Fri', caloriesBurned: todayCaloriesBurned || 420, caloriesConsumed: todayCaloriesConsumed || 2400 },
    { name: 'Sat', caloriesBurned: 600, caloriesConsumed: 2600 },
    { name: 'Sun', caloriesBurned: 250, caloriesConsumed: 2100 },
  ];

  const workoutData = [
    { day: 'Mon', duration: 45 },
    { day: 'Tue', duration: 60 },
    { day: 'Wed', duration: 20 },
    { day: 'Thu', duration: 55 },
    { day: 'Fri', duration: 40 },
    { day: 'Sat', duration: 75 },
    { day: 'Sun', duration: 30 },
  ];

  const progressData = [
    { week: 'W1', weight: 75.0, target: 73.0 },
    { week: 'W2', weight: 74.5, target: 73.0 },
    { week: 'W3', weight: 74.1, target: 73.0 },
    { week: 'W4', weight: currentWeight !== '--' ? currentWeight : 73.5, target: 73.0 },
  ];

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
                <span className="stat-value">5</span>
                <span className="stat-sub">/ 7 Days</span>
              </div>
              <span className="stat-trend trend-positive">
                <TrendingUp size={12} /> 71% of target
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
                <span className="stat-value">{todayCaloriesBurned || 420}</span>
                <span className="stat-sub">kcal</span>
              </div>
              <span className="stat-trend trend-neutral">
                <Clock size={12} /> Active burn today
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
              <span className="stat-trend trend-positive">
                <Sparkles size={12} /> Keep the streak!
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
                <span className="stat-sub">kg</span>
              </div>
              <span className="stat-trend trend-neutral">
                Target: 73.0 kg
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
                  <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-secondary)', fontSize: 12}} axisLine={false} tickLine={false} />
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
                    <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-secondary)', fontSize: 11}} axisLine={false} tickLine={false} />
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
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={progressData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                    <XAxis dataKey="week" stroke="var(--text-muted)" tick={{fill: 'var(--text-secondary)', fontSize: 11}} axisLine={false} tickLine={false} />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="var(--text-muted)" tick={{fill: 'var(--text-secondary)', fontSize: 11}} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-highlight)', borderRadius: '10px', boxShadow: 'var(--shadow-card)', color: 'var(--text-primary)' }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Line type="monotone" name="Weight (kg)" dataKey="weight" stroke="var(--accent-secondary)" strokeWidth={3} dot={{r: 5, fill: 'var(--bg-surface)', stroke: 'var(--accent-secondary)', strokeWidth: 2}} activeDot={{r: 7}} />
                    <Line type="monotone" name="Goal (kg)" dataKey="target" stroke="var(--accent-success)" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
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
