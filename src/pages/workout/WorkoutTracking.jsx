import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  X, 
  Dumbbell, 
  Pencil, 
  Trash2, 
  Search, 
  Zap,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { workoutSchema } from '../../validators/trackingValidators';
import { addWorkout, editWorkout, deleteWorkout } from '../../store/slices/workoutSlice';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { 
  addWorkoutToFirebase, 
  updateWorkoutInFirebase, 
  deleteWorkoutFromFirebase 
} from '../../firebase/workoutService';
import { isFirebaseConfigured } from '../../firebase/config';
import './WorkoutTracking.css';

import chestImg from '../../assets/images/chest.jpg';
import backImg from '../../assets/images/back.jpg';
import shouldersImg from '../../assets/images/shoulders.jpg';
import bicepsImg from '../../assets/images/biceps.jpg';
import tricepsImg from '../../assets/images/triceps.jpg';
import legsImg from '../../assets/images/legs.jpg';
import absImg from '../../assets/images/abs.jpg';

const MUSCLE_GROUPS = [
  { id: 'chest', name: 'Chest', image: chestImg, color: '#3b82f6', description: 'Bench Press, Flyes, Push-Ups' },
  { id: 'back', name: 'Back', image: backImg, color: '#ef4444', description: 'Deadlifts, Pull-Ups, Lat Pulldowns' },
  { id: 'shoulders', name: 'Shoulders', image: shouldersImg, color: '#8b5cf6', description: 'Overhead Press, Lateral Raises' },
  { id: 'biceps', name: 'Biceps', image: bicepsImg, color: '#d946ef', description: 'Barbell Curls, Hammer Curls' },
  { id: 'triceps', name: 'Triceps', image: tricepsImg, color: '#f43f5e', description: 'Dips, Skull Crushers, Cable Pushdowns' },
  { id: 'legs', name: 'Legs', image: legsImg, color: '#f59e0b', description: 'Squats, Leg Press, Romanian Deadlifts' },
  { id: 'abs-cardio', name: 'Abs + Cardio', image: absImg, color: '#10b981', description: 'Planks, Crunches, HIIT Sessions' },
];

const WorkoutTracking = () => {
  const dispatch = useDispatch();
  const workouts = useSelector((state) => state.workout.workouts);
  const user = useSelector((state) => state.auth.user);
  
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(workoutSchema)
  });

  const handleOpenModal = (group, workoutToEdit = null) => {
    setSelectedGroup(group);
    if (workoutToEdit) {
      setEditingWorkoutId(workoutToEdit.id);
      reset({
        exerciseName: workoutToEdit.exerciseName,
        sets: workoutToEdit.sets.toString(),
        reps: workoutToEdit.reps.toString(),
        weight: workoutToEdit.weight.toString(),
        date: workoutToEdit.date,
        muscleGroup: group.name
      });
    } else {
      setEditingWorkoutId(null);
      reset({
        exerciseName: '',
        sets: '',
        reps: '',
        weight: '',
        date: new Date().toISOString().split('T')[0],
        muscleGroup: group.name
      });
    }
  };

  const handleCloseModal = () => {
    setSelectedGroup(null);
    setEditingWorkoutId(null);
  };

  const onSubmit = async (data) => {
    try {
      const userMeta = {
        name: user?.name || 'Athlete',
        email: user?.email || ''
      };

      if (editingWorkoutId) {
        const updatedWorkout = { 
          ...data, 
          id: editingWorkoutId,
          userName: userMeta.name,
          userEmail: userMeta.email
        };
        dispatch(editWorkout(updatedWorkout));
        if (user?.uid && isFirebaseConfigured) {
          await updateWorkoutInFirebase(user.uid, editingWorkoutId, updatedWorkout, userMeta);
        }
        toast.success('Exercise updated successfully!');
      } else {
        const newId = Date.now();
        const newWorkout = { 
          ...data, 
          id: newId,
          userName: userMeta.name,
          userEmail: userMeta.email
        };
        dispatch(addWorkout(newWorkout));
        if (user?.uid && isFirebaseConfigured) {
          await addWorkoutToFirebase(user.uid, newWorkout, userMeta);
        }
        toast.success('Exercise logged successfully!');
      }
      handleCloseModal();
    } catch (err) {
      console.error('Error logging workout:', err);
      toast.error('Could not sync workout to cloud.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        dispatch(deleteWorkout(id));
        if (user?.uid && isFirebaseConfigured) {
          await deleteWorkoutFromFirebase(user.uid, id);
        }
        toast.success('Exercise deleted.');
      } catch (err) {
        console.error('Error deleting workout:', err);
        toast.error('Could not delete workout from cloud.');
      }
    }
  };

  // Filtered workouts based on search query
  const filteredWorkouts = useMemo(() => {
    if (!searchQuery.trim()) return workouts;
    const lower = searchQuery.toLowerCase();
    return workouts.filter(w => 
      w.exerciseName.toLowerCase().includes(lower) || 
      w.muscleGroup.toLowerCase().includes(lower)
    );
  }, [workouts, searchQuery]);

  return (
    <div className="tracking-container" data-aos="fade-in">
      <header className="tracking-header">
        <div className="tracking-header-content">
          <h1>Workout Tracker</h1>
          <p>Choose a muscle group below to log your exercises, sets, reps, and weights.</p>
        </div>
      </header>

      {/* Muscle Group Showcase Grid */}
      <div className="muscle-grid">
        {MUSCLE_GROUPS.map((group, index) => {
          const groupCount = workouts.filter(w => w.muscleGroup === group.name).length;
          return (
            <div key={group.id} data-aos="fade-up" data-aos-delay={index * 40}>
              <Card 
                className="muscle-card custom-image-card" 
                glow 
                onClick={() => handleOpenModal(group)}
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(10, 11, 20, 0.95) 0%, rgba(10, 11, 20, 0.5) 55%, rgba(10, 11, 20, 0.2) 100%), url(${group.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderBottom: `3px solid ${group.color}`
                }}
              >
                <div className="muscle-card-content">
                  <div className="muscle-card-header">
                    <span className="muscle-count-badge" style={{ backgroundColor: `${group.color}25`, borderColor: `${group.color}50`, color: '#ffffff' }}>
                      {groupCount} Logged
                    </span>
                    <button className="add-btn-circle" title={`Log ${group.name}`}>
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="muscle-card-info">
                    <h3>{group.name}</h3>
                    <p className="muscle-desc">{group.description}</p>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Logged Exercises History Section */}
      <div className="tracking-list-section" data-aos="fade-up" data-aos-delay="150">
        <div className="history-section-header">
          <div className="history-header-left">
            <h2>Logged Exercises ({filteredWorkouts.length})</h2>
            <p>Review your exercises and total training volume.</p>
          </div>

          {/* Quick Search in Workouts */}
          <div className="exercise-search-wrap">
            <Search size={16} className="search-icon-inside" />
            <input 
              type="text" 
              placeholder="Search exercise..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="exercise-search-input"
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <Card className="list-card glass-panel">
          {filteredWorkouts.length === 0 ? (
            <div className="empty-state">
              <Dumbbell size={48} className="empty-icon" />
              <h3>{searchQuery ? 'No matching exercises found' : 'No exercises logged yet'}</h3>
              <p>{searchQuery ? 'Try another search keyword' : 'Select any muscle group card above to record your first set!'}</p>
            </div>
          ) : (
            <div className="grouped-workout-list">
              {Object.entries(
                filteredWorkouts.reduce((acc, workout) => {
                  if (!acc[workout.muscleGroup]) acc[workout.muscleGroup] = [];
                  acc[workout.muscleGroup].push(workout);
                  return acc;
                }, {})
              ).map(([muscleGroup, exercises], groupIndex) => {
                const groupInfo = MUSCLE_GROUPS.find(g => g.name === muscleGroup) || MUSCLE_GROUPS[0];
                return (
                  <div key={muscleGroup} className="muscle-group-block" data-aos="fade-up" data-aos-delay={groupIndex * 40}>
                    <div className="group-block-header" style={{ borderBottomColor: groupInfo.color || 'var(--border-color)' }}>
                      <div className="group-thumb">
                        <img src={groupInfo.image} alt={muscleGroup} />
                      </div>
                      <h3>{muscleGroup}</h3>
                      <span className="group-total-badge">{exercises.length} sets</span>
                    </div>

                    <div className="workout-list">
                      {exercises.map((workout) => {
                        const totalVolume = Number(workout.sets) * Number(workout.reps) * Number(workout.weight || 0);
                        return (
                          <div key={workout.id} className="workout-item">
                            <div className="workout-item-main">
                              <div className="workout-item-header">
                                <div className="workout-title-group">
                                  <h4>{workout.exerciseName}</h4>
                                  <span className="athlete-tag">
                                    <User size={11} /> {workout.userName || user?.name || 'Athlete'}
                                  </span>
                                </div>
                                <div className="workout-date">
                                  <Calendar size={13} />
                                  <span>{workout.date}</span>
                                </div>
                              </div>

                              <div className="workout-item-stats">
                                <span className="stat-pill">{workout.sets} Sets</span>
                                <span className="stat-pill highlight">{workout.reps} Reps</span>
                                <span className="stat-pill highlight">{workout.weight} kg</span>
                                {totalVolume > 0 && (
                                  <span className="stat-pill volume-pill">
                                    <Zap size={12} /> {totalVolume.toLocaleString()} kg Vol
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="workout-item-actions">
                              <button 
                                className="action-btn edit-btn" 
                                onClick={() => handleOpenModal(groupInfo, workout)}
                                title="Edit Exercise"
                              >
                                <Pencil size={15} />
                              </button>
                              <button 
                                className="action-btn delete-btn" 
                                onClick={() => handleDelete(workout.id)}
                                title="Delete Exercise"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedGroup && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={handleCloseModal} aria-label="Close Modal">
                <X size={20} />
              </button>
              
              <div className="modal-header">
                <h2>{editingWorkoutId ? 'Edit' : 'Log'} {selectedGroup.name} Exercise</h2>
                <p>Record your exercise details, sets, reps, and resistance weight.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="tracking-form">
                <input type="hidden" {...register('muscleGroup')} />
                
                <Input 
                  label="Exercise Name" 
                  placeholder="e.g. Incline Dumbbell Press, Romanian Deadlift" 
                  {...register('exerciseName')}
                  error={errors.exerciseName?.message}
                />
                
                <div className="form-row">
                  <Input 
                    label="Sets" 
                    type="number" 
                    placeholder="3" 
                    {...register('sets')}
                    error={errors.sets?.message}
                  />
                  <Input 
                    label="Reps / Set" 
                    type="number" 
                    placeholder="10" 
                    {...register('reps')}
                    error={errors.reps?.message}
                  />
                  <Input 
                    label="Weight (kg)" 
                    type="number" 
                    placeholder="60" 
                    {...register('weight')}
                    error={errors.weight?.message}
                  />
                </div>

                <Input 
                  label="Date" 
                  type="date" 
                  {...register('date')}
                  error={errors.date?.message}
                />

                <Button type="submit" fullWidth style={{ marginTop: '1rem' }}>
                  {editingWorkoutId ? 'Update Exercise' : 'Save Exercise'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutTracking;
