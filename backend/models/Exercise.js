const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Abs', 'Chest', 'Biceps', 'Triceps', 'Shoulders', 'Back', 'Legs', 'Calf', 'Forearms', 'Full Body', 'Cardio']
  },
  gifUrl: {
    type: String,
    default: ''
  },
  equipment: {
    type: String,
    default: ''
  },
  bodyPart: {
    type: String,
    default: ''
  },
  targetMuscle: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  benefits: {
    type: [String],
    default: []
  },
  instructions: {
    type: [String],
    required: true
  },
  commonMistakes: {
    type: [String],
    default: []
  },
  recommendedSets: {
    type: Number,
    default: 3
  },
  recommendedReps: {
    type: String,
    default: "12"
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  apiId: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
