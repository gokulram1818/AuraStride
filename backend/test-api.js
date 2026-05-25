const http = require('http');

const API_URL = 'http://localhost:5000/api';

const makeRequest = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, data: parsed });
          } else {
            reject({ statusCode: res.statusCode, error: parsed });
          }
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- STARTING AURASTRIDE API INTEGRATION TESTS ---');
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'password123';
  let token = null;
  let customWorkoutId = null;

  try {
    // 1. REGISTER
    console.log('\n[1] Registering a new user...');
    const regRes = await makeRequest('POST', '/auth/register', { email: testEmail, password: testPassword, username: 'Goku' });
    token = regRes.data.token;
    console.log(`Success: Registered user: ${regRes.data.user.username} with ID: ${regRes.data.user.id}`);

    // 2. LOGIN
    console.log('\n[2] Authenticating (Login)...');
    const logRes = await makeRequest('POST', '/auth/login', { email: testEmail, password: testPassword });
    console.log(`Success: Token received.`);

    // 3. SUBMIT SURVEY
    console.log('\n[3] Submitting onboarding survey (calculates BMI & recommends plan)...');
    const surveyData = {
      gender: 'Male',
      age: 24,
      height: 71, // 71 inches (approx 180 cm)
      weight: 187, // 187 lbs (approx 85 kg)
      heightUnit: 'inches',
      weightUnit: 'lbs',
      experienceLevel: 'Intermediate',
      goal: 'Weight Loss', // Goal weight loss recommends "Fat Loss Program"
      targetWeight: 165,
      targetTimelineWeeks: 8,
    };
    const surveyRes = await makeRequest('POST', '/auth/survey', surveyData, token);
    console.log(`Success: BMI computed as: ${surveyRes.data.user.bmi} (${surveyRes.data.user.bmi >= 25 ? 'Overweight' : 'Normal'})`);
    console.log(`Success: Recommended program assigned: ${surveyRes.data.recommendedProgram.name}`);

    // 4. GET PREPLANNED PLANS
    console.log('\n[4] Querying preplanned workout programs...');
    const plansRes = await makeRequest('GET', '/workouts/preplanned', null, token);
    console.log(`Success: Found ${plansRes.data.length} preplanned programs.`);

    // 5. CREATE CUSTOM ROUTINE
    console.log('\n[5] Creating a custom 7-day workout routine...');
    const customRoutine = {
      name: 'My Custom Strength Split',
      difficulty: 'Intermediate',
      durationWeeks: 6,
      description: 'Custom split targeting upper body push and lower body hinge',
      schedule: [
        {
          day: 'Monday',
          restDay: false,
          exercises: [
            {
              exercise: plansRes.data[0].schedule[0].exercises[0].exercise._id, // reuse seeded exercise ID
              sets: 4,
              reps: '10',
              weight: 25,
            },
          ],
        },
        { day: 'Tuesday', restDay: true, exercises: [] },
      ],
    };
    const customRes = await makeRequest('POST', '/workouts/custom', customRoutine, token);
    customWorkoutId = customRes.data._id;
    console.log(`Success: Custom workout created with name: ${customRes.data.name}`);

    // 6. LOG WORKOUT SESSION COMPLETION
    console.log('\n[6] Logging a completed workout day (Monday)...');
    const completeRes = await makeRequest(
      'POST',
      '/workouts/complete-session',
      {
        workoutId: customWorkoutId,
        dayName: 'Monday',
        localDate: new Date().toISOString().split('T')[0],
      },
      token
    );
    console.log(`Success: Session logged. Calories Burned today: ${completeRes.data.caloriesBurned} kcal`);
    console.log(`Success: Streak count: ${completeRes.data.streak}`);

    // 7. LOG A NEW WEIGHT ENTRY
    console.log('\n[7] Logging a new weight progress entry (weight decreases to 183 lbs)...');
    const weightRes = await makeRequest('POST', '/stats/weight', { weight: 183 }, token);
    console.log(`Success: Weight logged: ${weightRes.data.currentWeight} lbs. Updated BMI: ${weightRes.data.bmi}`);

    // 8. QUERY DASHBOARD ANALYTICS
    console.log('\n[8] Querying dashboard stats and analytics...');
    const dashRes = await makeRequest('GET', `/stats/dashboard?localDate=${new Date().toISOString().split('T')[0]}`, null, token);
    const unit = dashRes.data.weightUnit || 'lbs';
    console.log('\n--- DASHBOARD ANALYTICS RESULTS ---');
    console.log(`Streak: 🔥 ${dashRes.data.streak} days`);
    console.log(`Goal Status: ${dashRes.data.goal.name} (Goal Target: ${dashRes.data.weight.target}${unit})`);
    console.log(`Starting Weight: ${dashRes.data.weight.starting}${unit}`);
    console.log(`Current Weight: ${dashRes.data.weight.current}${unit}`);
    console.log(`Goal Completion: ${dashRes.data.goal.completionPercentage}%`);
    console.log(`Calories Burned Today: ${dashRes.data.today.caloriesBurned} kcal`);
    console.log(`Workout logs count this week: ${dashRes.data.weeklySummary.length}`);
    console.log('------------------------------------');

    console.log('\nAll API integration tests PASSED successfully!');
  } catch (err) {
    console.error('\nTest failed:');
    console.error(err);
    process.exit(1);
  }
};

runTests();
