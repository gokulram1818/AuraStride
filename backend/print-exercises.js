require('dotenv').config();
const mongoose = require('mongoose');
const Exercise = require('./models/Exercise');

const keywords = ["plank", "bicycle", "v-up", "v up", "row", "carry", "farmer", "lunge", "squat", "burpee", "climber", "jack", "crunches"];

async function search() {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const kw of keywords) {
    const results = await Exercise.find({ name: new RegExp(kw, 'i'), apiId: { $exists: true, $ne: '' } }).limit(3);
    console.log(`=== Matches for "${kw}" (Found ${await Exercise.countDocuments({ name: new RegExp(kw, 'i'), apiId: { $exists: true, $ne: '' } })}):`);
    results.forEach(r => console.log(`  - "${r.name}": "${r.apiId}"`));
  }
  process.exit(0);
}
search();
