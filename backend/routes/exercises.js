const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const auth = require('../middleware/auth');

// Helpers for ExerciseDB mapping
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

const mapExerciseGifUrl = (exercise, req) => {
  const obj = exercise.toObject ? exercise.toObject() : exercise;
  if (obj.apiId) {
    const protocol = req.secure ? 'https' : 'http';
    const host = req.get('host');
    obj.gifUrl = `${protocol}://${host}/api/exercises/${obj._id}/image`;
  }
  return obj;
};

// @route   GET api/exercises
// @desc    Get all exercises (with optional filters)
// @access  Private
router.get('/', auth, async (req, res) => {
  const { category, difficulty } = req.query;
  let query = {};

  if (category) {
    query.category = category;
  }
  if (difficulty) {
    query.difficulty = difficulty;
  }

  try {
    const exercises = await Exercise.find(query);
    const mapped = exercises.map(ex => mapExerciseGifUrl(ex, req));
    res.json(mapped);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/exercises/:id/image
// @desc    Proxy the exercise animation GIF securely from ExerciseDB
// @access  Public
router.get('/:id/image', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise || !exercise.apiId) {
      return res.status(404).json({ msg: 'Exercise or image not found' });
    }

    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({ msg: 'RAPIDAPI_KEY is not configured on the server' });
    }

    const response = await fetch(`https://exercisedb.p.rapidapi.com/image?exerciseId=${exercise.apiId}&resolution=360`, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Error fetching exercise GIF from ExerciseDB: ${response.status}`, errText);
      return res.status(response.status).send('Failed to retrieve image');
    }

    res.setHeader('Content-Type', 'image/gif');
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err) {
    console.error('Proxy image error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/exercises/:id
// @desc    Get exercise by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ msg: 'Exercise not found' });
    }
    res.json(mapExerciseGifUrl(exercise, req));
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Exercise not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/exercises/sync
// @desc    Sync exercises from RapidAPI ExerciseDB (using pagination loop)
// @access  Private
router.post('/sync', auth, async (req, res) => {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ msg: 'RAPIDAPI_KEY is not configured in env variables' });
  }

  // Allow optional limit in query, default to 150 (cap at 500)
  const totalToSync = Math.min(parseInt(req.query.limit) || 150, 500);
  const pageSize = 10;
  let syncedCount = 0;

  try {
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
        return res.status(response.status).json({ 
          msg: 'Error during sync loop from ExerciseDB API', 
          syncedSoFar: syncedCount,
          error: errText 
        });
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
    res.json({ msg: 'Sync completed successfully', syncedCount });
  } catch (err) {
    console.error('Error syncing exercises:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/exercises
// @desc    Create a custom exercise on the fly
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, category } = req.body;
  if (!name || !category) {
    return res.status(400).json({ msg: 'Please provide name and category' });
  }

  try {
    // Check if exercise with same name exists (case-insensitive)
    let exercise = await Exercise.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (exercise) {
      return res.json(exercise);
    }

    exercise = new Exercise({
      name: name.trim(),
      category: category,
      targetMuscle: category,
      difficulty: 'Intermediate',
      benefits: ['Custom user exercise.'],
      instructions: ['Perform according to your fitness plan.'],
      commonMistakes: ['Avoid poor posture.'],
      recommendedSets: 3,
      recommendedReps: '10-12',
      isCustom: true
    });

    await exercise.save();
    res.status(201).json(exercise);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
