const express = require('express');
const router = express.Router();
const WeightLog = require('../models/WeightLog');
const WorkoutLog = require('../models/WorkoutLog');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/stats/weight
// @desc    Get all weight logs for the user
// @access  Private
router.get('/weight', auth, async (req, res) => {
  try {
    const logs = await WeightLog.find({ user: req.user.id }).sort({ date: 1 });
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/stats/weight
// @desc    Log a new weight entry, updating the User's current weight
// @access  Private
router.post('/weight', auth, async (req, res) => {
  const { weight, date } = req.body;

  if (!weight) {
    return res.status(400).json({ msg: 'Please provide weight' });
  }

  try {
    const newLog = new WeightLog({
      user: req.user.id,
      weight,
      date: date ? new Date(date) : new Date()
    });

    await newLog.save();

    // Also update current weight on the User model
    const user = await User.findById(req.user.id);
    user.weight = weight;
    
    // Recalculate BMI with updated weight
    if (user.height) {
      const wUnit = user.weightUnit || 'kg';
      const hUnit = user.heightUnit || 'cm';
      const wInKg = (wUnit === 'lbs') ? (weight * 0.453592) : weight;
      const hInM = (hUnit === 'inches') ? ((user.height * 2.54) / 100) : (user.height / 100);
      user.bmi = parseFloat((wInKg / (hInM * hInM)).toFixed(1));
    }
    
    // Set starting weight if not set
    if (!user.startingWeight) {
      user.startingWeight = weight;
    }
    
    await user.save();

    res.status(201).json({
      log: newLog,
      currentWeight: user.weight,
      bmi: user.bmi
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/stats/weight/:id
// @desc    Delete a weight entry
// @access  Private
router.delete('/weight/:id', auth, async (req, res) => {
  try {
    const log = await WeightLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ msg: 'Weight log not found' });
    }

    if (log.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await WeightLog.deleteOne({ _id: log._id });

    // Update current weight in User profile to the last remaining entry, if any
    const latestLog = await WeightLog.findOne({ user: req.user.id }).sort({ date: -1 });
    const user = await User.findById(req.user.id);
    if (latestLog) {
      user.weight = latestLog.weight;
      if (user.height) {
        const wUnit = user.weightUnit || 'kg';
        const hUnit = user.heightUnit || 'cm';
        const wInKg = (wUnit === 'lbs') ? (latestLog.weight * 0.453592) : latestLog.weight;
        const hInM = (hUnit === 'inches') ? ((user.height * 2.54) / 100) : (user.height / 100);
        user.bmi = parseFloat((wInKg / (hInM * hInM)).toFixed(1));
      }
    }
    await user.save();

    res.json({ msg: 'Weight log deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/stats/dashboard
// @desc    Get aggregated fitness analytics and weekly insights
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  const { localDate } = req.query; // format "YYYY-MM-DD"
  const todayStr = localDate || new Date().toISOString().split('T')[0];

  try {
    const user = await User.findById(req.user.id).populate({
      path: 'activeWorkoutProgram',
      populate: {
        path: 'schedule.exercises.exercise'
      }
    });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // 1. Calories Burned Today
    const todayLogs = await WorkoutLog.find({
      user: req.user.id,
      date: todayStr
    });
    const caloriesBurnedToday = todayLogs.reduce((total, log) => total + log.caloriesBurned, 0);
    const durationMinutesToday = todayLogs.reduce((total, log) => total + log.durationMinutes, 0);

    // 2. Goal completion percentage calculation
    let completionPercentage = 0;
    const startW = user.startingWeight || user.weight;
    const currentW = user.weight;
    const targetW = user.targetWeight;

    if (startW && currentW && targetW) {
      if (user.goal === 'Weight Loss') {
        const totalToLose = startW - targetW;
        const lostSoFar = startW - currentW;
        if (totalToLose > 0) {
          completionPercentage = Math.max(0, Math.min(100, Math.round((lostSoFar / totalToLose) * 100)));
        } else {
          completionPercentage = currentW <= targetW ? 100 : 0;
        }
      } else if (user.goal === 'Muscle Gain' || user.goal === 'Weight Gain') {
        const totalToGain = targetW - startW;
        const gainedSoFar = currentW - startW;
        if (totalToGain > 0) {
          completionPercentage = Math.max(0, Math.min(100, Math.round((gainedSoFar / totalToGain) * 100)));
        } else {
          completionPercentage = currentW >= targetW ? 100 : 0;
        }
      } else {
        // General Fitness: based on workout frequency
        const completedWorkoutsCount = await WorkoutLog.countDocuments({ user: req.user.id });
        // Let's assume a target of 12 workouts per month for 100% completion in a cycle
        completionPercentage = Math.min(100, Math.round((completedWorkoutsCount / 12) * 100));
      }
    }

    // 3. Weekly Activity Summary (Current Week starting Monday)
    let current = new Date();
    if (localDate) {
      const [y, m, d] = localDate.split('-').map(Number);
      current = new Date(y, m - 1, d);
    }
    const currentDay = current.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = current.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const startOfWeekStr = monday.toISOString().split('T')[0];

    // Retrieve workout logs from start of this week
    const weeklyLogs = await WorkoutLog.find({
      user: req.user.id,
      date: { $gte: startOfWeekStr }
    }).sort({ date: 1 });

    // Format weekly activity for graph visualization
    const weeklySummary = weeklyLogs.map(log => {
      const [y, m, d] = log.date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()];

      return {
        date: log.date,
        day: log.day,
        weekday,
        calories: log.caloriesBurned,
        duration: log.durationMinutes,
        workoutName: log.workout ? "Workout Complete" : "",
        completedExercises: log.completedExercises || []
      };
    });

    // 4. Weight stats
    const weightLogs = await WeightLog.find({ user: req.user.id }).sort({ date: 1 });
    const weightProgress = weightLogs.map(l => ({
      date: l.date.toISOString().split('T')[0],
      weight: l.weight
    }));

    res.json({
      streak: user.streak,
      bmi: user.bmi,
      weightUnit: user.weightUnit || 'kg',
      heightUnit: user.heightUnit || 'cm',
      weight: {
        starting: startW,
        current: currentW,
        target: targetW,
        progress: weightProgress
      },
      goal: {
        name: user.goal,
        timelineWeeks: user.targetTimelineWeeks,
        completionPercentage
      },
      today: {
        caloriesBurned: caloriesBurnedToday,
        durationMinutes: durationMinutesToday
      },
      weeklySummary,
      activeWorkoutProgram: user.activeWorkoutProgram
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
