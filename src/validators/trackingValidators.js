import { z } from 'zod';

export const workoutSchema = z.object({
  exerciseName: z.string().min(2, 'Exercise name must be at least 2 characters'),
  muscleGroup: z.string().min(1, 'Muscle group is required'),
  sets: z.coerce.number().min(1, 'Sets must be at least 1'),
  reps: z.coerce.number().min(1, 'Reps must be at least 1'),
  weight: z.coerce.number().min(0, 'Weight cannot be negative'),
  date: z.string().min(1, 'Date is required'),
});

export const nutritionSchema = z.object({
  mealName: z.string().min(2, 'Meal name must be at least 2 characters'),
  calories: z.coerce.number().min(0, 'Calories cannot be negative'),
  protein: z.coerce.number().min(0).optional(),
  carbs: z.coerce.number().min(0).optional(),
  fats: z.coerce.number().min(0).optional(),
  date: z.string().min(1, 'Date is required'),
});

export const progressSchema = z.object({
  weight: z.coerce.number().min(1, 'Weight must be greater than 0'),
  bodyFat: z.coerce.number().min(1, 'Body fat must be greater than 0').max(100, 'Cannot exceed 100%').optional(),
  date: z.string().min(1, 'Date is required'),
});
