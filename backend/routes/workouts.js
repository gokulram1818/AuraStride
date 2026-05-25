const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const User = require('../models/User');
const WorkoutLog = require('../models/WorkoutLog');
const auth = require('../middleware/auth');

// @route   GET api/workouts/preplanned
// @desc    Get all preplanned workout programs
// @access  Private
router.get('/preplanned', auth, async (req, res) => {
  try {
    const programs = await Workout.find({ type: 'Preplanned' })
      .populate('schedule.exercises.exercise');
    res.json(programs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/workouts/select-program/:id
// @desc    Select a preplanned program as user's active workout plan
// @access  Private
router.post('/select-program/:id', auth, async (req, res) => {
  try {
    const program = await Workout.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ msg: 'Program not found' });
    }

    // Secure custom routine access
    if (program.type === 'Custom' && program.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Unauthorized to select this custom routine' });
    }

    const user = await User.findById(req.user.id);
    user.activeWorkoutProgram = program._id;
    await user.save();

    res.json({ msg: 'Active program updated', activeWorkoutProgram: program });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/workouts/custom
// @desc    Get all custom workouts created by the user
// @access  Private
router.get('/custom', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ type: 'Custom', creator: req.user.id })
      .populate('schedule.exercises.exercise');
    res.json(workouts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/workouts/custom
// @desc    Create a custom 7-day workout routine
// @access  Private
router.post('/custom', auth, async (req, res) => {
  const { name, difficulty, durationWeeks, description, schedule } = req.body;

  if (!name || !schedule || schedule.length === 0) {
    return res.status(400).json({ msg: 'Please provide name and schedule' });
  }

  try {
    const newWorkout = new Workout({
      name,
      type: 'Custom',
      creator: req.user.id,
      difficulty: difficulty || 'Beginner',
      durationWeeks: durationWeeks || 4,
      description: description || '',
      schedule
    });

    const savedWorkout = await newWorkout.save();
    
    // Auto-populate exercise details
    const populatedWorkout = await Workout.findById(savedWorkout._id)
      .populate('schedule.exercises.exercise');

    res.status(201).json(populatedWorkout);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/workouts/custom/:id
// @desc    Update a custom workout routine
// @access  Private
router.put('/custom/:id', auth, async (req, res) => {
  const { name, difficulty, durationWeeks, description, schedule } = req.body;

  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ msg: 'Workout not found' });
    }

    // Make sure user owns the custom workout
    if (workout.type !== 'Custom' || workout.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (name) workout.name = name;
    if (difficulty) workout.difficulty = difficulty;
    if (durationWeeks) workout.durationWeeks = durationWeeks;
    if (description) workout.description = description;
    if (schedule) workout.schedule = schedule;

    await workout.save();

    const populatedWorkout = await Workout.findById(workout._id)
      .populate('schedule.exercises.exercise');

    res.json(populatedWorkout);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/workouts/custom/:id
// @desc    Delete a custom workout routine
// @access  Private
router.delete('/custom/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ msg: 'Workout not found' });
    }

    // Make sure user owns the custom workout
    if (workout.type !== 'Custom' || workout.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Remove active association in User if this was active
    const user = await User.findById(req.user.id);
    if (user.activeWorkoutProgram && user.activeWorkoutProgram.toString() === workout._id.toString()) {
      user.activeWorkoutProgram = null;
      await user.save();
    }

    await Workout.deleteOne({ _id: workout._id });
    res.json({ msg: 'Workout removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/workouts/complete-session
// @desc    Log a completed workout day, calculate streaks and calories burned
// @access  Private
router.post('/complete-session', auth, async (req, res) => {
  const { workoutId, dayName, localDate } = req.body; // localDate format "YYYY-MM-DD"

  if (!workoutId || !dayName) {
    return res.status(400).json({ msg: 'Please provide workoutId and dayName' });
  }

  // Fallback to UTC date if localDate is not passed
  const targetDate = localDate || new Date().toISOString().split('T')[0];

  try {
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ msg: 'Workout program not found' });
    }

    // Estimate calories burned (e.g. 75 calories per exercise, or based on difficulty)
    let baseCal = 60;
    if (workout.difficulty === 'Intermediate') baseCal = 80;
    if (workout.difficulty === 'Advanced') baseCal = 100;
    
    const daySchedule = workout.schedule.find(s => s.day === dayName);
    const exerciseCount = daySchedule ? daySchedule.exercises.length : 3;
    const caloriesBurned = exerciseCount * baseCal;
    const durationMinutes = exerciseCount * 8; // approx 8 minutes per exercise

    // Create Workout Log
    const newLog = new WorkoutLog({
      user: req.user.id,
      workout: workoutId,
      day: dayName,
      date: targetDate,
      caloriesBurned,
      durationMinutes
    });
    await newLog.save();

    // Streak and Consistency calculation
    const user = await User.findById(req.user.id);
    const lastActive = user.lastActiveDate;
    
    let streakUpdated = user.streak;

    if (!lastActive) {
      // First workout ever
      streakUpdated = 1;
    } else {
      const lastDate = new Date(lastActive);
      const currentDate = new Date(targetDate);
      
      // Calculate difference in days
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Workout completed on the same day, streak doesn't change
        streakUpdated = user.streak || 1;
      } else if (diffDays === 1) {
        // Consecutive day
        streakUpdated = (user.streak || 0) + 1;
      } else {
        // Streak broken
        streakUpdated = 1;
      }
    }

    user.streak = streakUpdated;
    user.lastActiveDate = targetDate;
    await user.save();

    res.json({
      msg: 'Workout session logged',
      log: newLog,
      streak: streakUpdated,
      caloriesBurned,
      durationMinutes
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/workouts/complete-exercise
// @desc    Log a completed exercise, create or update today's workout log
// @access  Private
router.post('/complete-exercise', auth, async (req, res) => {
  const { workoutId, dayName, exerciseId, localDate } = req.body;

  if (!workoutId || !dayName || !exerciseId) {
    return res.status(400).json({ msg: 'Please provide workoutId, dayName, and exerciseId' });
  }

  const targetDate = localDate || new Date().toISOString().split('T')[0];

  try {
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ msg: 'Workout program not found' });
    }

    // Estimate calories for this single exercise
    let baseCal = 20;
    if (workout.difficulty === 'Intermediate') baseCal = 25;
    if (workout.difficulty === 'Advanced') baseCal = 30;
    
    const durationMinutes = 8; // approx 8 mins per exercise

    // Find if a log already exists for this user, workout, day, and date
    let log = await WorkoutLog.findOne({
      user: req.user.id,
      workout: workoutId,
      day: dayName,
      date: targetDate
    });

    if (log) {
      // If exercise is already logged as completed, just return it
      if (log.completedExercises.includes(exerciseId)) {
        return res.json({
          msg: 'Exercise already logged',
          log
        });
      }
      log.completedExercises.push(exerciseId);
      log.caloriesBurned += baseCal;
      log.durationMinutes += durationMinutes;
      await log.save();
    } else {
      // Create new log
      log = new WorkoutLog({
        user: req.user.id,
        workout: workoutId,
        day: dayName,
        date: targetDate,
        caloriesBurned: baseCal,
        durationMinutes,
        completedExercises: [exerciseId]
      });
      await log.save();
    }

    // Update user streak
    const user = await User.findById(req.user.id);
    const lastActive = user.lastActiveDate;
    let streakUpdated = user.streak || 0;

    if (!lastActive) {
      streakUpdated = 1;
    } else {
      const lastDate = new Date(lastActive);
      const currentDate = new Date(targetDate);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        streakUpdated = user.streak || 1;
      } else if (diffDays === 1) {
        streakUpdated = (user.streak || 0) + 1;
      } else {
        streakUpdated = 1;
      }
    }

    user.streak = streakUpdated;
    user.lastActiveDate = targetDate;
    await user.save();

    res.json({
      msg: 'Exercise logged successfully',
      log,
      streak: streakUpdated,
      caloriesBurned: log.caloriesBurned,
      durationMinutes: log.durationMinutes
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
