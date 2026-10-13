import React, { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Apple, 
  Plus, 
  Calendar, 
  Flame, 
  Beef, 
  Wheat, 
  Droplet, 
  Trash2, 
  Pencil, 
  X, 
  Award,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { nutritionSchema } from '../../validators/trackingValidators';
import { addMeal, editMeal, deleteMeal, setDailyGoal, setLastCongratulatedDate } from '../../store/slices/nutritionSlice';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { 
  addMealToFirebase, 
  updateMealInFirebase, 
  deleteMealFromFirebase, 
  saveDailyGoalsToFirebase 
} from '../../firebase/nutritionService';
import { isFirebaseConfigured } from '../../firebase/config';
import './NutritionTracking.css';

const NutritionTracking = () => {
  const dispatch = useDispatch();
  const { meals, dailyGoal, lastCongratulatedDate } = useSelector((state) => state.nutrition);
  const user = useSelector((state) => state.auth.user);
  
  const [editingMealId, setEditingMealId] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoals, setTempGoals] = useState({
    calories: dailyGoal.calories || 2500,
    protein: dailyGoal.protein || 150,
    carbs: dailyGoal.carbs || 300,
    fats: dailyGoal.fats || 70
  });
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(nutritionSchema)
  });

  const today = new Date().toISOString().split('T')[0];
  
  const dailyTotals = useMemo(() => {
    return meals
      .filter(meal => meal.date === today)
      .reduce((acc, meal) => ({
        calories: acc.calories + (Number(meal.calories) || 0),
        protein: acc.protein + (Number(meal.protein) || 0),
        carbs: acc.carbs + (Number(meal.carbs) || 0),
        fats: acc.fats + (Number(meal.fats) || 0),
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [meals, today]);

  const targetCalories = dailyGoal.calories || 2500;
  const progressPercentage = Math.min(Math.round((dailyTotals.calories / targetCalories) * 100), 100);

  // Check for goal achievement
  useEffect(() => {
    if (dailyTotals.calories >= targetCalories && dailyTotals.calories > 0 && lastCongratulatedDate !== today) {
      setShowCongratsModal(true);
      dispatch(setLastCongratulatedDate(today));
    }
  }, [dailyTotals.calories, targetCalories, lastCongratulatedDate, today, dispatch]);

  const onSubmit = async (data) => {
    try {
      const userMeta = {
        name: user?.name || 'Athlete',
        email: user?.email || ''
      };

      if (editingMealId) {
        const updatedMeal = { 
          ...data, 
          id: editingMealId,
          userName: userMeta.name,
          userEmail: userMeta.email
        };
        dispatch(editMeal(updatedMeal));
        if (user?.uid && isFirebaseConfigured) {
          await updateMealInFirebase(user.uid, editingMealId, updatedMeal, userMeta);
        }
        toast.success('Meal updated successfully!');
        setEditingMealId(null);
      } else {
        const newId = Date.now();
        const newMeal = { 
          ...data, 
          id: newId,
          userName: userMeta.name,
          userEmail: userMeta.email
        };
        dispatch(addMeal(newMeal));
        if (user?.uid && isFirebaseConfigured) {
          await addMealToFirebase(user.uid, newMeal, userMeta);
        }
        toast.success('Meal logged successfully!');
      }
      reset();
    } catch (err) {
      console.error('Error logging meal:', err);
      toast.error('Could not sync meal to cloud.');
    }
  };

  const handleEdit = (meal) => {
    setEditingMealId(meal.id);
    reset({
      mealName: meal.mealName,
      calories: meal.calories.toString(),
      protein: meal.protein?.toString() || '',
      carbs: meal.carbs?.toString() || '',
      fats: meal.fats?.toString() || '',
      date: meal.date
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        dispatch(deleteMeal(id));
        if (user?.uid && isFirebaseConfigured) {
          await deleteMealFromFirebase(user.uid, id);
        }
        toast.success('Meal deleted.');
        if (editingMealId === id) {
          setEditingMealId(null);
          reset();
        }
      } catch (err) {
        console.error('Error deleting meal:', err);
        toast.error('Could not delete meal from cloud.');
      }
    }
  };

  const saveNewGoals = async (e) => {
    e.preventDefault();
    const newGoals = {
      calories: Number(tempGoals.calories) || 2500,
      protein: Number(tempGoals.protein) || 150,
      carbs: Number(tempGoals.carbs) || 300,
      fats: Number(tempGoals.fats) || 70
    };
    
    if (newGoals.calories > 0) {
      try {
        const userMeta = {
          name: user?.name || 'Athlete',
          email: user?.email || ''
        };
        dispatch(setDailyGoal(newGoals));
        if (user?.uid && isFirebaseConfigured) {
          await saveDailyGoalsToFirebase(user.uid, newGoals, userMeta);
        }
        setShowGoalModal(false);
        toast.success('Daily nutrition targets updated!');
      } catch (err) {
        console.error('Error saving goals:', err);
        toast.error('Could not sync goals to cloud.');
      }
    } else {
      toast.error('Calorie goal must be greater than 0');
    }
  };

  return (
    <div className="nutrition-container" data-aos="fade-in">
      <header className="nutrition-header">
        <div className="nutrition-header-text">
          <h1>Nutrition & Meals</h1>
          <p>Log your meals, check your daily calories, and hit your protein targets.</p>
        </div>
      </header>

      {/* Top Banner: Today's Macro Goals & Progress */}
      <div className="daily-summary-card glass-panel" data-aos="fade-up">
        <div className="summary-header">
          <div className="summary-title-wrap">
            <Apple size={22} className="summary-title-icon" />
            <div>
              <h3>Today's Nutrition Summary</h3>
              <span className="summary-date-sub">{today}</span>
            </div>
          </div>

          <button 
            className="edit-goal-pill" 
            onClick={() => {
              setTempGoals(dailyGoal);
              setShowGoalModal(true);
            }}
          >
            <Pencil size={14} />
            <span>Edit Targets</span>
          </button>
        </div>

        {/* 4 Macro KPI Cards */}
        <div className="macro-overview-grid">
          <div className="macro-stat-box calories">
            <div className="macro-icon-wrap cal-icon">
              <Flame size={20} />
            </div>
            <div className="macro-details">
              <span className="macro-label">CALORIES</span>
              <div className="macro-value-line">
                <span className="macro-val">{dailyTotals.calories}</span>
                <span className="macro-target">/ {targetCalories} kcal</span>
              </div>
            </div>
          </div>

          <div className="macro-stat-box protein">
            <div className="macro-icon-wrap protein-icon">
              <Beef size={20} />
            </div>
            <div className="macro-details">
              <span className="macro-label">PROTEIN</span>
              <div className="macro-value-line">
                <span className="macro-val">{dailyTotals.protein}g</span>
                <span className="macro-target">/ {dailyGoal.protein || 150}g</span>
              </div>
            </div>
          </div>

          <div className="macro-stat-box carbs">
            <div className="macro-icon-wrap carbs-icon">
              <Wheat size={20} />
            </div>
            <div className="macro-details">
              <span className="macro-label">CARBS</span>
              <div className="macro-value-line">
                <span className="macro-val">{dailyTotals.carbs}g</span>
                <span className="macro-target">/ {dailyGoal.carbs || 300}g</span>
              </div>
            </div>
          </div>

          <div className="macro-stat-box fats">
            <div className="macro-icon-wrap fats-icon">
              <Droplet size={20} />
            </div>
            <div className="macro-details">
              <span className="macro-label">FATS</span>
              <div className="macro-value-line">
                <span className="macro-val">{dailyTotals.fats}g</span>
                <span className="macro-target">/ {dailyGoal.fats || 70}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar with Percentage Tag */}
        <div className="progress-section">
          <div className="progress-labels">
            <span>Calorie Goal Progress</span>
            <span className="percentage-text">{progressPercentage}%</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${progressPercentage}%`, 
                background: progressPercentage >= 100 
                  ? 'linear-gradient(90deg, var(--accent-success), #34d399)' 
                  : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' 
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content: Form + Meals List */}
      <div className="nutrition-content">
        {/* Left Section: Meal Form */}
        <div className="nutrition-form-section" data-aos="fade-right">
          <Card title={editingMealId ? "Edit Meal Entry" : "Log New Meal"} subtitle="Record food item & macro breakdown">
            <form onSubmit={handleSubmit(onSubmit)} className="tracking-form">
              <Input 
                label="Meal Description" 
                placeholder="e.g. Oatmeal with Whey & Berries, Grilled Salmon" 
                {...register('mealName')}
                error={errors.mealName?.message}
              />
              
              <Input 
                label="Calories (kcal)" 
                type="number" 
                placeholder="550" 
                {...register('calories')}
                error={errors.calories?.message}
              />

              <div className="form-row">
                <Input 
                  label="Protein (g)" 
                  type="number" 
                  placeholder="35" 
                  {...register('protein')}
                />
                <Input 
                  label="Carbs (g)" 
                  type="number" 
                  placeholder="50" 
                  {...register('carbs')}
                />
              </div>

              <div className="form-row">
                <Input 
                  label="Fats (g)" 
                  type="number" 
                  placeholder="15" 
                  {...register('fats')}
                />
                <Input 
                  label="Date" 
                  type="date" 
                  defaultValue={today}
                  {...register('date')}
                  error={errors.date?.message}
                />
              </div>

              <Button type="submit" fullWidth style={{ marginTop: '0.75rem' }}>
                {editingMealId ? (
                  <>
                    <Pencil size={17} />
                    Update Meal
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Log Meal
                  </>
                )}
              </Button>

              {editingMealId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  fullWidth 
                  style={{ marginTop: '0.5rem' }}
                  onClick={() => {
                    setEditingMealId(null);
                    reset();
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </form>
          </Card>
        </div>

        {/* Right Section: Recent Meals List */}
        <div className="nutrition-list-section" data-aos="fade-left">
          <Card title={`Meal History (${meals.length})`} subtitle="Your logged fuel throughout the day" className="list-card">
            {meals.length === 0 ? (
              <div className="empty-state">
                <Apple size={48} className="empty-icon" />
                <h3>No meals logged yet</h3>
                <p>Track your calories and macros to fuel your performance.</p>
              </div>
            ) : (
              <div className="nutrition-list">
                {meals.map(meal => (
                  <div key={meal.id} className="nutrition-item">
                    <div className="nutrition-item-main">
                      <div className="nutrition-item-header">
                        <div className="meal-title-group">
                          <h4>{meal.mealName}</h4>
                          <span className="athlete-tag">
                            <User size={11} /> {meal.userName || user?.name || 'Athlete'}
                          </span>
                        </div>
                        <div className="nutrition-date">
                          <Calendar size={13} />
                          <span>{meal.date}</span>
                        </div>
                      </div>

                      <div className="nutrition-item-stats">
                        <span className="macro-pill highlight-calories">
                          <Flame size={12} />
                          {meal.calories} kcal
                        </span>
                        <span className="macro-pill highlight-protein">
                          P: {meal.protein || 0}g
                        </span>
                        <span className="macro-pill highlight-carbs">
                          C: {meal.carbs || 0}g
                        </span>
                        <span className="macro-pill highlight-fats">
                          F: {meal.fats || 0}g
                        </span>
                      </div>
                    </div>

                    <div className="workout-item-actions">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEdit(meal)}
                        title="Edit Meal"
                      >
                        <Pencil size={15} />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDelete(meal.id)}
                        title="Delete Meal"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Goal Edit Modal Dialog */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGoalModal(false)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setShowGoalModal(false)}>
                <X size={20} />
              </button>

              <div className="modal-header">
                <h2>Set Daily Macro Targets</h2>
                <p>Customize your target nutrition numbers for caloric balance.</p>
              </div>

              <form onSubmit={saveNewGoals}>
                <Input 
                  label="Daily Calories Goal (kcal)" 
                  type="number"
                  value={tempGoals.calories}
                  onChange={(e) => setTempGoals({...tempGoals, calories: e.target.value})}
                />

                <div className="form-row">
                  <Input 
                    label="Protein Goal (g)" 
                    type="number"
                    value={tempGoals.protein}
                    onChange={(e) => setTempGoals({...tempGoals, protein: e.target.value})}
                  />
                  <Input 
                    label="Carbs Goal (g)" 
                    type="number"
                    value={tempGoals.carbs}
                    onChange={(e) => setTempGoals({...tempGoals, carbs: e.target.value})}
                  />
                  <Input 
                    label="Fats Goal (g)" 
                    type="number"
                    value={tempGoals.fats}
                    onChange={(e) => setTempGoals({...tempGoals, fats: e.target.value})}
                  />
                </div>

                <Button type="submit" fullWidth style={{ marginTop: '1rem' }}>
                  Save Nutrition Targets
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Achievement Celebration Modal */}
      <AnimatePresence>
        {showCongratsModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCongratsModal(false)}
          >
            <motion.div 
              className="modal-content text-center"
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="congrats-icon-wrap">
                <Award size={48} />
              </div>
              <h2 className="congrats-title">Daily Goal Crushed!</h2>
              <p className="congrats-desc">
                Outstanding work! You've achieved your daily target of {targetCalories} kcal. Fueling consistency is key to long-term gains.
              </p>
              <Button fullWidth onClick={() => setShowCongratsModal(false)}>
                Continue Training
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NutritionTracking;
