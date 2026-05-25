require('dotenv').config();

const apiKey = process.env.RAPIDAPI_KEY;

async function searchName(query) {
  try {
    const response = await fetch(`https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(query)}`, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });
    if (response.ok) {
      const data = await response.json();
      console.log(`\n=== Matches for name query: "${query}" (Found ${data.length}) ===`);
      data.slice(0, 10).forEach(m => {
        console.log(`  - Name: "${m.name}", ID: "${m.id}", Target: "${m.target}", Equipment: "${m.equipment}"`);
      });
    } else {
      console.log(`Error searching for name "${query}": ${response.status}`);
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function run() {
  // Let's search for some exact exercises
  await searchName('abdominal crunch');
  await searchName('plank');
  await searchName('face');
  await searchName('incline chest press');
  await searchName('incline dumbbell press');
  await searchName('fly');
  await searchName('wrist curl');
  await searchName('farmers');
  await searchName('squat');
  await searchName('press');
  await searchName('pulldown');
}

run();
