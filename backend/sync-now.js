require('dotenv').config();
const mongoose = require('mongoose');
const Exercise = require('./models/Exercise');

const mapCategory = (bodyPart, target) => {
  const bp = bodyPart.toLowerCase();
  const tg = target.toLowerCase();

  if (bp === 'waist') return 'Abs';
  if (bp === 'back') return 'Back';
  if (bp === 'chest') return 'Chest';
  if (bp === 'lower arms') return 'Forearms';
  if (bp === 'lower legs') return 'Calf';
  if (bp === 'shoulders' || bp === 'neck') return 'Shoulders';
  if (bp === 'upper legs') return 'Legs';
  if (bp === 'cardio') return 'Cardio';
  if (bp === 'upper arms') {
    if (tg.includes('bicep') || tg.includes('brachialis')) {
      return 'Biceps';
    } else {
      return 'Triceps';
    }
  }
  return 'Full Body';
};

const getDifficulty = (name, equipment) => {
  const nm = name.toLowerCase();
  const eq = equipment.toLowerCase();
  if (eq === 'body weight' && !nm.includes('hanging') && !nm.includes('handstand')) {
    return 'Beginner';
  }
  if (nm.includes('handstand') || nm.includes('hanging') || nm.includes('one arm') || nm.includes('muscle up') || eq === 'kettlebell') {
    return 'Advanced';
  }
  return 'Intermediate';
};

const getBenefits = (category, targetMuscle) => {
  return [
    `Strengthens and tones the ${targetMuscle || category} muscle groups.`,
    `Improves functional strength and skeletal stability.`,
    `Supports better overall posture and athletic mobility.`
  ];
};

const getCommonMistakes = (category) => {
  if (category === 'Abs') return ['Rushing the repetitions', 'Straining the neck with hands', 'Arching the lower back off floor'];
  if (category === 'Back') return ['Rounding the lower spine', 'Using high-speed momentum', 'Incomplete range of contraction'];
  if (category === 'Chest') return ['Flaring elbows outward excessively', 'Bouncing barbell off chest bone', 'Lifting hip flexors off bench'];
  if (category === 'Legs') return ['Knees caving inward', 'Lifting heels off the ground', 'Rounding the lower back'];
  return ['Using improper form', 'Holding your breath', 'Lacking control on the eccentric phase'];
};

const runSync = async () => {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.error('RAPIDAPI_KEY is not configured in env variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for sync');

    const totalToSync = 350;
    const pageSize = 10;
    let syncedCount = 0;

    console.log(`Starting paginated ExerciseDB sync loop for total: ${totalToSync}...`);
    
    for (let offset = 0; offset < totalToSync; offset += pageSize) {
      console.log(`Fetching ExerciseDB page offset=${offset}, limit=${pageSize}...`);
      const response = await fetch(`https://exercisedb.p.rapidapi.com/exercises?offset=${offset}&limit=${pageSize}`, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`ExerciseDB API Error at offset ${offset}:`, errText);
        process.exit(1);
      }

      const data = await response.json();
      if (!data || data.length === 0) {
        console.log('No more exercises returned from API. Ending sync loop.');
        break;
      }

      for (const item of data) {
        const category = mapCategory(item.bodyPart, item.target);
        const name = item.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const targetMuscle = item.target.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const difficulty = getDifficulty(item.name, item.equipment);

        const instructions = Array.isArray(item.instructions) 
          ? item.instructions 
          : (item.instructions ? [item.instructions] : ['Follow standard guidelines for this exercise.']);

        const exerciseData = {
          name,
          category,
          targetMuscle,
          difficulty,
          apiId: item.id,
          gifUrl: '',
          equipment: item.equipment || '',
          bodyPart: item.bodyPart || '',
          benefits: getBenefits(category, targetMuscle),
          instructions,
          commonMistakes: getCommonMistakes(category),
          recommendedSets: 3,
          recommendedReps: '10-12'
        };

        await Exercise.findOneAndUpdate(
          { name: exerciseData.name },
          exerciseData,
          { upsert: true, new: true }
        );
        syncedCount++;
      }
    }

    console.log(`Sync completed successfully. ${syncedCount} exercises upserted.`);
    process.exit(0);
  } catch (err) {
    console.error('Error syncing:', err.message);
    process.exit(1);
  }
};

runSync();
