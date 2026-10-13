/**
 * ProgressTracking.jsx
 * 
 * User Progress Tracking & Analytics.
 * 
 * Allows users to record body measurements, visualize their weight loss or muscle gain
 * progression over time with charts, and review chronological Improvement History Cards
 * that highlight their personal records, baseline changes, and milestone badges.
 * 
 * Linked to:
 * - src/App.jsx (Mounted at /progress)
 * - src/store/slices/progressSlice.js (Redux state for user progress measurements)
 */

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Plus, TrendingUp, TrendingDown, Award, Calendar, Flame, Scale, 
  Trash2, ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle2, History 
} from 'lucide-react';
import { progressSchema } from '../../validators/trackingValidators';
import { addProgressLog, deleteProgressLog } from '../../store/slices/progressSlice';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { 
  addProgressLogToFirebase, 
  deleteProgressLogFromFirebase 
} from '../../firebase/progressService';
import { isFirebaseConfigured } from '../../firebase/config';
import toast from 'react-hot-toast';
import './ProgressTracking.css';

const ProgressTracking = () => {
  const dispatch = useDispatch();
  const logs = useSelector((state) => state.progress.logs);
  const user = useSelector((state) => state.auth.user);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(progressSchema)
  });

  const onSubmit = async (data) => {
    try {
      const userMeta = {
        name: user?.name || 'Athlete',
        email: user?.email || ''
      };
      const newLog = { 
        ...data, 
        id: Date.now(),
        userName: userMeta.name,
        userEmail: userMeta.email,
        weight: parseFloat(data.weight),
        bodyFat: data.bodyFat ? parseFloat(data.bodyFat) : null
      };
      dispatch(addProgressLog(newLog));
      if (user?.uid && isFirebaseConfigured) {
        await addProgressLogToFirebase(user.uid, newLog, userMeta);
      }
      toast.success('Progress milestone saved!');
      reset();
    } catch (err) {
      console.error('Error logging progress:', err);
      toast.error('Could not sync progress to cloud.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this measurement log?')) {
      try {
        dispatch(deleteProgressLog(id));
        if (user?.uid && isFirebaseConfigured) {
          await deleteProgressLogFromFirebase(user.uid, id);
        }
        toast.success('Log removed');
      } catch (err) {
        console.error('Error deleting progress:', err);
        toast.error('Could not delete progress from cloud.');
      }
    }
  };

  // Sort chronologically for charts, and reverse for history cards
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [logs]);

  const reversedLogs = useMemo(() => {
    return [...sortedLogs].reverse();
  }, [sortedLogs]);

  // Overall Improvement Metrics
  const startingLog = sortedLogs.length > 0 ? sortedLogs[0] : null;
  const currentLog = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1] : null;
  const previousLog = sortedLogs.length > 1 ? sortedLogs[sortedLogs.length - 2] : currentLog;

  const totalWeightChange = (startingLog && currentLog) 
    ? Number((currentLog.weight - startingLog.weight).toFixed(1)) 
    : 0;
  
  const recentWeightChange = (currentLog && previousLog)
    ? Number((currentLog.weight - previousLog.weight).toFixed(1))
    : 0;

  const startingBodyFat = startingLog?.bodyFat || null;
  const currentBodyFat = currentLog?.bodyFat || null;
  const bodyFatChange = (startingBodyFat && currentBodyFat)
    ? Number((currentBodyFat - startingBodyFat).toFixed(1))
    : null;

  const lowestWeight = sortedLogs.length > 0 
    ? Math.min(...sortedLogs.map(l => l.weight)) 
    : null;

  return (
    <div className="progress-container" data-aos="fade-in">
      {/* Header */}
      <header className="progress-header">
        <h1>Weight & Progress Tracker</h1>
        <p>Log your weigh-ins, check your weight trends, and celebrate personal records.</p>
      </header>

      {/* Summary Improvement Metrics Grid */}
      <div className="progress-metrics-grid">
        <Card className="metric-card" data-aos="fade-up" data-aos-delay="0">
          <div className="metric-icon" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
            <Scale size={20} />
          </div>
          <div className="metric-body">
            <span className="metric-label">Current Weight</span>
            <div className="metric-value-wrap">
              <span className="metric-val">{currentLog ? currentLog.weight : '--'}</span>
              <span className="metric-unit">kg</span>
            </div>
            <span className="metric-sub">
              Baseline: {startingLog ? `${startingLog.weight} kg` : '--'}
            </span>
          </div>
        </Card>

        <Card className="metric-card" data-aos="fade-up" data-aos-delay="100">
          <div className="metric-icon" style={{ 
            background: 'var(--accent-tint)',
            color: 'var(--accent)'
          }}>
            {totalWeightChange <= 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
          </div>
          <div className="metric-body">
            <span className="metric-label">Weight Change</span>
            <div className="metric-value-wrap">
              <span className="metric-val" style={{ color: 'var(--ink)' }}>
                {totalWeightChange > 0 ? `+${totalWeightChange}` : totalWeightChange}
              </span>
              <span className="metric-unit">kg</span>
            </div>
            <span className="metric-sub">
              {totalWeightChange <= 0 ? 'Total weight reduction' : 'Total mass gained'}
            </span>
          </div>
        </Card>

        <Card className="metric-card" data-aos="fade-up" data-aos-delay="200">
          <div className="metric-icon" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
            <Flame size={20} />
          </div>
          <div className="metric-body">
            <span className="metric-label">Body Fat</span>
            <div className="metric-value-wrap">
              <span className="metric-val">
                {bodyFatChange !== null ? (bodyFatChange > 0 ? `+${bodyFatChange}%` : `${bodyFatChange}%`) : (currentBodyFat ? `${currentBodyFat}%` : '--')}
              </span>
            </div>
            <span className="metric-sub">
              {startingBodyFat ? `From ${startingBodyFat}% initial` : 'Log body fat to track'}
            </span>
          </div>
        </Card>

        <Card className="metric-card" data-aos="fade-up" data-aos-delay="300">
          <div className="metric-icon" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
            <Award size={20} />
          </div>
          <div className="metric-body">
            <span className="metric-label">Checkpoints</span>
            <div className="metric-value-wrap">
              <span className="metric-val">{sortedLogs.length}</span>
              <span className="metric-unit">logged</span>
            </div>
            <span className="metric-sub">
              {lowestWeight ? `Best Weight: ${lowestWeight} kg` : 'Consistency is key'}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Row: Log Form & Transformation Chart */}
      <div className="progress-content">
        {/* Log Measurement Form */}
        <div className="progress-form-section" data-aos="fade-right">
          <Card title="Log New Weigh-In" className="log-form-card">
            <form onSubmit={handleSubmit(onSubmit)} className="progress-form">
              <Input 
                label="Current Weight (kg)" 
                type="number" 
                step="0.1"
                placeholder="e.g. 78.5" 
                {...register('weight')}
                error={errors.weight?.message}
              />
              
              <Input 
                label="Body Fat (%) - Optional" 
                type="number" 
                step="0.1"
                placeholder="e.g. 18.2" 
                {...register('bodyFat')}
                error={errors.bodyFat?.message}
              />

              <Input 
                label="Measurement Date" 
                type="date" 
                defaultValue={new Date().toISOString().split('T')[0]}
                {...register('date')}
                error={errors.date?.message}
              />

              <Button type="submit" fullWidth style={{ marginTop: '1rem' }}>
                <Plus size={18} style={{ marginRight: '8px' }} />
                Record Weight
              </Button>
            </form>
          </Card>
          
          {sortedLogs.length > 1 && (
            <Card glow className="progress-summary-card" style={{ marginTop: '1.5rem' }}>
              <div className="summary-content">
                <div className="summary-badge">
                  <Sparkles size={16} />
                  <span>Latest Delta</span>
                </div>
                <h3>Latest Change</h3>
                <div className={`trend-indicator ${recentWeightChange <= 0 ? 'trend-down' : 'trend-up'}`}>
                  {recentWeightChange <= 0 ? <TrendingDown size={28} /> : <TrendingUp size={28} />}
                  <span>
                    {Math.abs(recentWeightChange)} kg {recentWeightChange <= 0 ? 'down' : 'up'}
                  </span>
                </div>
                <p className="trend-comparison">vs previous measurement</p>
              </div>
            </Card>
          )}
        </div>

        {/* Analytics Chart */}
        <div className="progress-list-section" data-aos="fade-left">
          <Card title="Weight Progression Trend" className="chart-card">
            {sortedLogs.length === 0 ? (
              <div className="empty-state">
                <Scale size={48} className="empty-icon" />
                <p>No progress data logged yet. Start recording your journey!</p>
              </div>
            ) : (
              <div style={{ width: '100%', height: 380 }}>
                <ResponsiveContainer>
                  <AreaChart data={sortedLogs} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="progressWeightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.10}/>
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.10}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="var(--ink-muted)" 
                      tick={{fill: 'var(--ink-muted)', fontSize: 12}}
                      tickFormatter={(val) => {
                        const date = new Date(val);
                        return isNaN(date.getTime()) ? val : `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={['dataMin - 2', 'dataMax + 2']}
                      stroke="var(--ink-muted)" 
                      tick={{fill: 'var(--ink-muted)', fontSize: 12}} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', boxShadow: 'var(--shadow-card)' }}
                      itemStyle={{ color: 'var(--ink)' }}
                      labelStyle={{ color: 'var(--ink-muted)', marginBottom: '5px' }}
                      formatter={(val, name) => [`${val} ${name === 'weight' ? 'kg' : '%'}`, name === 'weight' ? 'Weight' : 'Body Fat']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      name="weight"
                      stroke="var(--accent)" 
                      strokeWidth={2}
                      fill="url(#progressWeightGrad)"
                      dot={{ r: 4, fill: 'var(--surface)', stroke: 'var(--accent)', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* =========================================
          IMPROVEMENT HISTORY CARDS SECTION
          ========================================= */}
      <section className="history-cards-section" data-aos="fade-up">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <History size={24} className="section-icon-accent" />
            <div>
              <h2>Weigh-In History</h2>
              <p>A complete history of your weight check-ins and personal records.</p>
            </div>
          </div>
          <span className="badge-count">{reversedLogs.length} Records</span>
        </div>

        {reversedLogs.length === 0 ? (
          <div className="empty-history-state">
            <Calendar size={48} />
            <p>No history entries recorded yet. Add your first check-in above!</p>
          </div>
        ) : (
          <div className="history-cards-grid">
            {reversedLogs.map((log, index) => {
              // Calculate difference from first baseline and previous entry
              const prevInChronology = sortedLogs[sortedLogs.length - 1 - index - 1];
              const diffFromPrev = prevInChronology 
                ? Number((log.weight - prevInChronology.weight).toFixed(1)) 
                : 0;
              const diffFromBaseline = startingLog 
                ? Number((log.weight - startingLog.weight).toFixed(1)) 
                : 0;

              const isBest = log.weight === lowestWeight && sortedLogs.length > 1;

              return (
                <div key={log.id || index} className={`history-card glass-panel ${isBest ? 'highlight-pr' : ''}`}>
                  <div className="history-card-header">
                    <div className="history-date-box">
                      <Calendar size={15} />
                      <span>{log.date}</span>
                    </div>
                    {isBest && (
                      <span className="history-badge pr-badge">
                        <Award size={13} /> Peak Result
                      </span>
                    )}
                    <button 
                      className="history-delete-btn" 
                      onClick={() => handleDelete(log.id)}
                      title="Delete checkpoint"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="history-card-body">
                    <div className="history-main-stat">
                      <div className="weight-display">
                        <span className="weight-number">{log.weight}</span>
                        <span className="weight-unit">kg</span>
                      </div>
                      
                      {prevInChronology && (
                        <div className={`history-delta-badge ${diffFromPrev <= 0 ? 'delta-good' : 'delta-up'}`}>
                          {diffFromPrev <= 0 ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}
                          <span>{diffFromPrev > 0 ? `+${diffFromPrev}` : diffFromPrev} kg</span>
                        </div>
                      )}
                    </div>

                    <div className="history-sub-stats">
                      {log.bodyFat && (
                        <div className="sub-stat-item">
                          <span className="sub-stat-label">Body Fat</span>
                          <span className="sub-stat-value">{log.bodyFat}%</span>
                        </div>
                      )}
                      <div className="sub-stat-item">
                        <span className="sub-stat-label">Journey Delta</span>
                        <span className={`sub-stat-value ${diffFromBaseline <= 0 ? 'text-success' : 'text-warning'}`}>
                          {diffFromBaseline > 0 ? `+${diffFromBaseline}` : diffFromBaseline} kg
                        </span>
                      </div>
                      <div className="sub-stat-item">
                        <span className="sub-stat-label">Status</span>
                        <span className="sub-stat-value status-done">
                          <CheckCircle2 size={13} /> Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProgressTracking;
