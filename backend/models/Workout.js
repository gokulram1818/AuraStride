const mongoose = require('mongoose');

const WorkoutExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  sets: {
    type: Number,
    default: 3
  },
  reps: {
    type: String,
    default: "12"
  },
  weight: {
    type: String,
    default: "0"
  }
});

const DayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true // e.g., "Monday", "Tuesday", or "Day 1"
  },
  restDay: {
    type: Boolean,
    default: false
  },
  exercises: [WorkoutExerciseSchema]
});

const WorkoutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Preplanned', 'Custom']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for official preplanned programs
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  durationWeeks: {
    type: Number,
    default: 4
  },
  description: {
    type: String,
    default: ""
  },
  schedule: [DayScheduleSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Workout', WorkoutSchema);
