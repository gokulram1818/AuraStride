const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'lbs'],
    default: 'kg'
  },
  heightUnit: {
    type: String,
    enum: ['cm', 'inches'],
    default: 'cm'
  },
  height: {
    type: Number, // in cm or inches depending on heightUnit
    default: null
  },
  weight: {
    type: Number, // in kg
    default: null
  },
  age: {
    type: Number,
    default: null
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', null],
    default: null
  },
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', null],
    default: null
  },
  goal: {
    type: String,
    enum: ['Weight Loss', 'Weight Gain', 'Muscle Gain', 'General Fitness', null],
    default: null
  },
  bmi: {
    type: Number,
    default: null
  },
  targetWeight: {
    type: Number,
    default: null
  },
  startingWeight: {
    type: Number,
    default: null
  },
  targetTimelineWeeks: {
    type: Number,
    default: null
  },
  activeWorkoutProgram: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    default: null
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: String, // format "YYYY-MM-DD"
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash passwords
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
