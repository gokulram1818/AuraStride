require('dotenv').config();

const apiKey = process.env.RAPIDAPI_KEY;

async function searchAndPrint(query, filterFn = null) {
  try {
    const response = await fetch(`https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(query)}`, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });
    if (response.ok) {
      let data = await response.json();
      if (filterFn) {
        data = data.filter(filterFn);
      }
      console.log(`=== Matches for Query "${query}": ${data.length}`);
      data.slice(0, 15).forEach(m => {
        console.log(`  - "${m.name}": ID "${m.id}" (Target: "${m.target}", Equipment: "${m.equipment}", BodyPart: "${m.bodyPart}")`);
      });
    } else {
      console.log(`Error searching for "${query}": ${response.status}`);
    }
  } catch (err) {
    console.log(`Network error for "${query}": ${err.message}`);
  }
}

async function run() {
  // 1. Standard bodyweight crunch
  await searchAndPrint('crunch', m => m.equipment === 'body weight');

  // 2. Standard forearm plank
  await searchAndPrint('plank', m => m.equipment === 'body weight');

  // 3. Face pull (cable)
  await searchAndPrint('face pull');
  await searchAndPrint('rope'); // in case it is "rope face pull"
  
  // 4. Lat pulldown
  await searchAndPrint('pulldown', m => m.name.includes('lat'));

  // 5. Bicep Curl
  await searchAndPrint('biceps curl', m => m.name === 'barbell biceps curl' || m.name === 'dumbbell biceps curl');

  // 6. Triceps extension
  await searchAndPrint('triceps extension', m => m.equipment === 'dumbbell' || m.name.includes('overhead'));

  // 7. Push up (close grip)
  await searchAndPrint('push-up', m => m.name.includes('close'));

  // 8. Bench Dip
  await searchAndPrint('dip', m => m.name.includes('bench') || m.name.includes('box'));

  // 9. Calf Raise
  await searchAndPrint('calf raise', m => m.equipment === 'body weight' || m.name.includes('standing'));

  // 10. Chest fly & Incline dumbbell bench press
  await searchAndPrint('fly', m => m.equipment === 'dumbbell');
  await searchAndPrint('incline dumbbell');
  await searchAndPrint('incline chest press');

  // 11. Wrist Curl
  await searchAndPrint('wrist curl', m => m.equipment === 'dumbbell');

  // 12. Farmer's carry
  await searchAndPrint('farmer');
  await searchAndPrint('carry');
  await searchAndPrint('walk');

  // 13. Squat
  await searchAndPrint('squat', m => m.equipment === 'body weight');

  // 14. Shoulder Press / Overhead Press
  await searchAndPrint('shoulder press');
  await searchAndPrint('overhead press');
}

run();
