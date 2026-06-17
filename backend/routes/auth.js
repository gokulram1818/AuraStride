const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token valid for 30 days
  });
};

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  // Basic email structure validation
  const emailParts = email.split('@');
  if (emailParts.length !== 2) {
    return res.status(400).json({ msg: 'Please enter a valid email address' });
  }
  const domain = emailParts[1].toLowerCase();

  // Disposable domain blocklist
  const disposableDomains = [
    'mailinator.com', 'yopmail.com', 'tempmail.com', 'temp-mail.org', 
    '10minutemail.com', 'guerrillamail.com', 'sharklasers.com', 
    'dispostable.com', 'getairmail.com', 'burnermail.io', 
    'trashmail.com', 'tempmailo.com', 'maildrop.cc', 'mohmal.com', 
    'temp-mail.io'
  ];

  if (disposableDomains.includes(domain)) {
    return res.status(400).json({ msg: 'Temporary/disposable email addresses are not permitted. Please use a permanent email address.' });
  }

  try {
    // Check for existing user
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      email,
      password,
      username
    });

    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profileCompleted: user.profileCompleted
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    
    // Fully populate the activeWorkoutProgram and its schedule exercises
    const populatedUser = await User.findById(user._id)
      .populate({
        path: 'activeWorkoutProgram',
        populate: {
          path: 'schedule.exercises.exercise'
        }
      });

    res.json({
      token,
      user: {
        id: populatedUser._id,
        email: populatedUser.email,
        username: populatedUser.username,
        profileCompleted: populatedUser.profileCompleted,
        goal: populatedUser.goal,
        experienceLevel: populatedUser.experienceLevel,
        activeWorkoutProgram: populatedUser.activeWorkoutProgram
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get user data
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'activeWorkoutProgram',
        populate: {
          path: 'schedule.exercises.exercise'
        }
      });
    if (!user) {
      return res.status(401).json({ msg: 'User not found, authorization denied' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/survey
// @desc    Submit user onboarding details, calculate BMI, recommend a program
// @access  Private
router.post('/survey', auth, async (req, res) => {
  const { height, weight, age, gender, experienceLevel, goal, targetWeight, targetTimelineWeeks, heightUnit, weightUnit } = req.body;

  if (!height || !weight || !age || !gender || !experienceLevel || !goal) {
    return res.status(400).json({ msg: 'Please complete all required fields' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Store preferred units
    user.heightUnit = heightUnit || 'cm';
    user.weightUnit = weightUnit || 'kg';

    // Calculate BMI with units conversion
    const weightInKg = (user.weightUnit === 'lbs') ? (weight * 0.453592) : weight;
    const heightInMeters = (user.heightUnit === 'inches') ? ((height * 2.54) / 100) : (height / 100);
    const bmi = parseFloat((weightInKg / (heightInMeters * heightInMeters)).toFixed(1));

    // Recommend Workout Program based on Goal and experience
    let recommendedProgramName = 'Summer Burn';
    if (goal === 'Weight Loss') {
      recommendedProgramName = 'Fat Loss Program';
    } else if (goal === 'Muscle Gain') {
      recommendedProgramName = 'Muscle Builder Program';
    } else if (goal === 'Weight Gain') {
      recommendedProgramName = '30-Day Workout Challenge';
    } else if (goal === 'General Fitness') {
      recommendedProgramName = 'Summer Burn';
    }

    // Find the workout program ID
    const program = await Workout.findOne({ name: recommendedProgramName, type: 'Preplanned' });
    const programId = program ? program._id : null;

    // Update user profile
    user.height = height;
    user.weight = weight;
    user.age = age;
    user.gender = gender;
    user.experienceLevel = experienceLevel;
    user.goal = goal;
    user.bmi = bmi;
    user.targetWeight = targetWeight || weight;
    user.targetTimelineWeeks = targetTimelineWeeks || 8;
    user.startingWeight = weight;
    user.profileCompleted = true;
    
    if (programId) {
      user.activeWorkoutProgram = programId;
    }

    await user.save();

    // Respond with updated user and recommendations
    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate({
        path: 'activeWorkoutProgram',
        populate: {
          path: 'schedule.exercises.exercise'
        }
      });

    res.json({
      msg: 'Survey saved successfully',
      user: populatedUser,
      recommendedProgram: program
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/profile
// @desc    Update profile info (height, weight, targetWeight, timeline)
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { height, weight, targetWeight, targetTimelineWeeks, age, experienceLevel, goal, username, heightUnit, weightUnit } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (username) user.username = username;
    if (heightUnit) user.heightUnit = heightUnit;
    if (weightUnit) user.weightUnit = weightUnit;
    if (height) user.height = height;
    if (weight) user.weight = weight;
    
    // Recalculate BMI using current values and units
    const h = user.height;
    const w = user.weight;
    const hUnit = user.heightUnit;
    const wUnit = user.weightUnit;
    if (h && w) {
      const wInKg = (wUnit === 'lbs') ? (w * 0.453592) : w;
      const hInM = (hUnit === 'inches') ? ((h * 2.54) / 100) : (h / 100);
      user.bmi = parseFloat((wInKg / (hInM * hInM)).toFixed(1));
    }

    if (targetWeight) user.targetWeight = targetWeight;
    if (targetTimelineWeeks) user.targetTimelineWeeks = targetTimelineWeeks;
    if (age) user.age = age;
    if (experienceLevel) user.experienceLevel = experienceLevel;
    if (goal) user.goal = goal;

    await user.save();
    
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate({
        path: 'activeWorkoutProgram',
        populate: {
          path: 'schedule.exercises.exercise'
        }
      });

    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
