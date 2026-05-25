const run = async () => {
  const apiKey = '46bf5616d7msh0e6548bb85ac4b7p1b21c8jsn200dd99a6245';
  try {
    console.log('Fetching Page 1 (offset=0, limit=10)...');
    const res1 = await fetch('https://exercisedb.p.rapidapi.com/exercises?offset=0&limit=10', {
      headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com' }
    });
    const data1 = await res1.json();
    console.log(`Page 1 count: ${data1.length}`);
    if (data1.length > 0) {
      console.log('Page 1 first exercise:', data1[0].name);
    }

    console.log('\nFetching Page 2 (offset=10, limit=10)...');
    const res2 = await fetch('https://exercisedb.p.rapidapi.com/exercises?offset=10&limit=10', {
      headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com' }
    });
    const data2 = await res2.json();
    console.log(`Page 2 count: ${data2.length}`);
    if (data2.length > 0) {
      console.log('Page 2 first exercise:', data2[0].name);
    }
  } catch (err) {
    console.error('Error fetching:', err);
  }
};
run();
