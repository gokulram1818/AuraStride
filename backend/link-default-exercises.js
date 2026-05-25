require('dotenv').config();
const mongoose = require('mongoose');
const Exercise = require('./models/Exercise');

const defaultNames = [
  "Abdominal Crunches", "Forearm Plank", "Hanging Leg Raise", "Russian Twists",
  "Bicycle Crunches", "V-Ups", "Bent-Over Dumbbell Row", "Pull-Up", "Lat Pulldown",
  "Barbell Deadlift", "Single-Arm Dumbbell Row", "Face Pulls", "Dumbbell Bicep Curl",
  "Barbell Bicep Curl", "Hammer Curl", "Concentration Curl", "Preacher Curl",
  "Tricep Overhead Extension", "Tricep Pushdown", "Close-Grip Push-up", "Bench Dips",
  "Standing Calf Raise", "Seated Calf Raise", "Barbell Bench Press", "Push-Up",
  "Incline Dumbbell Bench Press", "Dumbbell Chest Fly", "Decline Press",
  "Dumbbell Wrist Curl", "Reverse Dumbbell Wrist Curl", "Farmer's Carry",
  "Bodyweight Squat", "Dumbbell Romanian Deadlift", "Walking Lunges", "Leg Press",
  "Goblet Squat", "Bulgarian Split Squat", "Dumbbell Shoulder Press", "Dumbbell Lateral Raise",
  "Front Dumbbell Raise", "Dumbbell Shrugs", "Overhead Barbell Press", "Burpee",
  "Mountain Climber", "Jumping Jacks", "Jump Rope"
];

const manualMappings = {
  "Abdominal Crunches": "abdominal crunch",
  "Forearm Plank": "plank",
  "Bodyweight Squat": "squat",
  "Jump Rope": "rope",
  "Tricep Overhead Extension": "overhead triceps extension",
  "Dumbbell Bicep Curl": "bicep curl",
  "Barbell Bicep Curl": "bicep curl",
  "Barbell Bench Press": "bench press",
  "Push-Up": "pushup",
  "Pull-Up": "pull-up",
  "Bent-Over Dumbbell Row": "dumbbell row",
  "Dumbbell Shoulder Press": "dumbbell press",
  "Dumbbell Romanian Deadlift": "romanian deadlift",
  "Burpee": "burpee",
  "Mountain Climber": "mountain climber"
};

async function linkExercises() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Reset apiId for all default exercises first to have a clean slate
    await Exercise.updateMany(
      { name: { $in: defaultNames } },
      { $set: { apiId: "" } }
    );
    console.log('Reset default exercises apiId');

    let linkedCount = 0;

    for (const name of defaultNames) {
      const defaultEx = await Exercise.findOne({ name });
      if (defaultEx) {
        // Find mapped name
        const mappedSearch = manualMappings[name] || name;
        
        // Find an exercise that matches the query and HAS a valid apiId
        const queryRegex = new RegExp(mappedSearch.toLowerCase().replace('s', ''), 'i');
        const match = await Exercise.findOne({
          name: { $regex: queryRegex, $ne: name, $nin: defaultNames }, // Exclude default list to prevent linking default to default
          apiId: { $exists: true, $ne: '', $ne: null }
        });

        if (match) {
          defaultEx.apiId = match.apiId;
          await defaultEx.save();
          console.log(`Linked "${name}" to "${match.name}" (apiId: ${match.apiId})`);
          linkedCount++;
        } else {
          // Try with first word
          const firstWord = name.split(' ')[0];
          const fallbackMatch = await Exercise.findOne({
            name: { $regex: new RegExp(firstWord, 'i'), $ne: name, $nin: defaultNames },
            apiId: { $exists: true, $ne: '', $ne: null }
          });
          if (fallbackMatch) {
            defaultEx.apiId = fallbackMatch.apiId;
            await defaultEx.save();
            console.log(`Linked "${name}" (fallback) to "${fallbackMatch.name}" (apiId: ${fallbackMatch.apiId})`);
            linkedCount++;
          } else {
            console.log(`Could not find match for "${name}"`);
          }
        }
      }
    }
    console.log(`Finished linking! Total linked: ${linkedCount}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

linkExercises();
