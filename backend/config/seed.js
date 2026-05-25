const Exercise = require('../models/Exercise');
const Workout = require('../models/Workout');

const defaultExercises = [
  // Abs (6 exercises)
  {
    name: "Abdominal Crunches",
    category: "Abs",
    targetMuscle: "Rectus Abdominis",
    difficulty: "Beginner",
    benefits: ["Strengthens abdominal muscles", "Improves core stability", "Improves posture"],
    instructions: [
      "Lie on your back with knees bent and feet flat on the floor, hip-width apart.",
      "Place your hands gently behind your head, elbows flared out.",
      "Engage your core, exhale, and raise your upper body, keeping your lower back pressed to the floor.",
      "Pause at the top, then slowly lower back down while inhaling."
    ],
    commonMistakes: ["Pulling on your neck with your hands", "Raising the lower back off the floor", "Using momentum instead of core strength"],
    recommendedSets: 3,
    recommendedReps: "15-20"
  },
  {
    name: "Forearm Plank",
    category: "Abs",
    targetMuscle: "Transversus Abdominis",
    difficulty: "Intermediate",
    benefits: ["Core stability", "Reduces back pain", "Improves balance"],
    instructions: [
      "Place forearms on the floor, elbows aligned under shoulders, arms parallel.",
      "Extend legs straight behind you, toes tucked, lifting your hips to align with shoulders and ankles.",
      "Engage your core, glutes, and thighs. Do not let your lower back sag.",
      "Hold this position while breathing normally."
    ],
    commonMistakes: ["Arching or sagging the lower back", "Looking forward instead of down", "Forgetting to breathe"],
    recommendedSets: 3,
    recommendedReps: "30s-60s"
  },
  {
    name: "Hanging Leg Raise",
    category: "Abs",
    targetMuscle: "Lower Rectus Abdominis",
    difficulty: "Advanced",
    benefits: ["Deep core activation", "Improves grip strength", "Strengthens hip flexors"],
    instructions: [
      "Hang from a pull-up bar with a shoulder-width grip, body fully extended.",
      "Keeping your legs straight (or slightly bent), raise them until they are parallel to the floor.",
      "Slowly lower them back down to the starting position without swinging."
    ],
    commonMistakes: ["Swinging the body to get momentum", "Not engaging the shoulders", "Dropping legs too quickly"],
    recommendedSets: 3,
    recommendedReps: "10-12"
  },
  {
    name: "Russian Twists",
    category: "Abs",
    targetMuscle: "Obliques",
    difficulty: "Beginner",
    benefits: ["Improves rotational stability", "Strengthens side obliques", "Engages lower back core"],
    instructions: [
      "Sit on the floor, bend your knees, and lift your feet slightly off the ground, leaning back at a 45-degree angle.",
      "Clasp your hands together in front of your chest.",
      "Rotate your torso to the right, touching your hands to the floor next to your hip, then twist to the left."
    ],
    commonMistakes: ["Rounding the spine", "Moving only the arms instead of twisting the torso", "Moving too fast"],
    recommendedSets: 3,
    recommendedReps: "20 total"
  },
  {
    name: "Bicycle Crunches",
    category: "Abs",
    targetMuscle: "Rectus Abdominis & Obliques",
    difficulty: "Beginner",
    benefits: ["Simultaneously targets upper abs, lower abs, and obliques", "Improves coordination"],
    instructions: [
      "Lie flat on the floor with your lower back pressed to the ground, hands behind your head.",
      "Bring your knees in toward your chest and lift your shoulder blades off the ground.",
      "Straighten your right leg out while turning your upper body to the left, bringing your right elbow toward your left knee.",
      "Switch sides, moving in a continuous pedaling motion."
    ],
    commonMistakes: ["Pulling your neck", "Straining the lower back", "Rushing the movements"],
    recommendedSets: 3,
    recommendedReps: "20 total"
  },
  {
    name: "V-Ups",
    category: "Abs",
    targetMuscle: "Full Abdominals",
    difficulty: "Advanced",
    benefits: ["High intensity core workout", "Improves flexibility and coordination"],
    instructions: [
      "Lie flat on your back with arms extended overhead and legs straight.",
      "In one explosive movement, lift your legs and upper body off the floor, reaching your hands toward your toes to form a 'V' shape.",
      "Lower yourself back down with control to the starting position."
    ],
    commonMistakes: ["Using momentum instead of core compression", "Arching the back on the way down", "Bending knees too much"],
    recommendedSets: 3,
    recommendedReps: "10-12"
  },

  // Back (6 exercises)
  {
    name: "Bent-Over Dumbbell Row",
    category: "Back",
    targetMuscle: "Latissimus Dorsi",
    difficulty: "Intermediate",
    benefits: ["Improves posture", "Builds upper and mid-back depth", "Strengthens biceps and grip"],
    instructions: [
      "Hold a dumbbell in each hand, bend at your hips and knees, leaning your torso forward, keeping back flat.",
      "Let weights hang down. Pull weights to your waist while keeping elbows close to your ribs.",
      "Squeeze your shoulder blades at the top, then slowly lower weights back down."
    ],
    commonMistakes: ["Rounding the lower back", "Using momentum by jerking your upper body", "Flaring elbows out too wide"],
    recommendedSets: 3,
    recommendedReps: "10-12"
  },
  {
    name: "Pull-Up",
    category: "Back",
    targetMuscle: "Latissimus Dorsi & Rhomboids",
    difficulty: "Advanced",
    benefits: ["Develops wide upper back", "Excellent test of relative upper body strength", "Improves grip"],
    instructions: [
      "Grasp the pull-up bar with an overhand grip, slightly wider than shoulder-width.",
      "Pull your body up by driving your elbows down toward your ribs, keeping your core engaged.",
      "Continue pulling until your chin clears the bar, then lower with control."
    ],
    commonMistakes: ["Using leg swing (kipping)", "Incomplete range of motion", "Shrugging shoulders into the neck"],
    recommendedSets: 3,
    recommendedReps: "6-10"
  },
  {
    name: "Lat Pulldown",
    category: "Back",
    targetMuscle: "Latissimus Dorsi",
    difficulty: "Beginner",
    benefits: ["Strengthens lat muscles", "Good progression for pull-ups", "Aids shoulder stability"],
    instructions: [
      "Sit on the lat pulldown machine, adjusting the knee pad. Grasp the wide bar with an overhand grip.",
      "Pull the bar down toward your upper chest, drawing your shoulder blades down and back.",
      "Slowly return the bar to the starting position with arms fully extended."
    ],
    commonMistakes: ["Pulling the bar behind the neck", "Leaning back too far and using bodyweight", "Letting the bar snap back up"],
    recommendedSets: 4,
    recommendedReps: "10-12"
  },
  {
    name: "Barbell Deadlift",
    category: "Back",
    targetMuscle: "Erector Spinae & Gluteus Maximus",
    difficulty: "Advanced",
    benefits: ["Strengthens full posterior chain", "Boosts raw lifting power", "Builds thick spinal erectors"],
    instructions: [
      "Stand with feet hip-width apart, shins about an inch from the barbell.",
      "Hinge at the hips and bend knees to grip the bar with a flat back.",
      "Drive through your heels, keeping the bar close to your body as you stand upright.",
      "Hinge hips back and bend knees to lower the bar back to the floor with control."
    ],
    commonMistakes: ["Rounding the spine under load", "Keeping the bar too far forward", "Shrugging the shoulders at lock-out"],
    recommendedSets: 4,
    recommendedReps: "5"
  },
  {
    name: "Single-Arm Dumbbell Row",
    category: "Back",
    targetMuscle: "Rhomboids & Lower Lats",
    difficulty: "Intermediate",
    benefits: ["Corrects strength imbalances on sides", "Allows greater range of motion"],
    instructions: [
      "Place one knee and same-side hand flat on a flat bench. Keep back flat and parallel to floor.",
      "Grip a dumbbell in your free hand, letting it hang straight down.",
      "Pull the dumbbell up to your hip, drawing elbow back and squeezing shoulder blades.",
      "Slowly lower the dumbbell back down."
    ],
    commonMistakes: ["Twisting the torso to lift weight", "Rounding the back", "Letting elbow flare away from side"],
    recommendedSets: 3,
    recommendedReps: "10-12"
  },
  {
    name: "Face Pulls",
    category: "Back",
    targetMuscle: "Rear Deltoids & Upper Traps",
    difficulty: "Beginner",
    benefits: ["Corrects rounded shoulders", "Improves rotator cuff health", "Strengthens upper back"],
    instructions: [
      "Set a cable pulley machine at upper chest height with a rope attachment.",
      "Grasp the rope ends, step back to lift the weight stack, and hold arms straight.",
      "Pull the center of the rope toward your nose, flaring your elbows high and pulling the handles apart at the end."
    ],
    commonMistakes: ["Using too much weight", "Pulling too low toward chest", "Lowering elbows below shoulders"],
    recommendedSets: 3,
    recommendedReps: "15"
  },

  // Biceps (5 exercises)
  {
    name: "Dumbbell Bicep Curl",
    category: "Biceps",
    targetMuscle: "Biceps Brachii",
    difficulty: "Beginner",
    benefits: ["Isolates biceps", "Improves arm definition", "Increases grip strength"],
    instructions: [
      "Stand straight with a dumbbell in each hand, palms facing forward.",
      "Keep elbows close to your torso. Curl weights while contracting biceps.",
      "Continue raising weights until biceps are fully contracted and dumbbells are at shoulder level.",
      "Slowly lower dumbbells back to starting position."
    ],
    commonMistakes: ["Swinging the hips or back to lift weights", "Letting elbows drift forward", "Dropping the weight too quickly"],
    recommendedSets: 3,
    recommendedReps: "10-12"
  },
  {
    name: "Barbell Bicep Curl",
    category: "Biceps",
    targetMuscle: "Biceps Brachii (Short Head)",
    difficulty: "Intermediate",
    benefits: ["Allows heavier weight loads", "Increases overall biceps muscle volume"],
    instructions: [
      "Stand upright holding a barbell with an underhand grip, shoulder-width apart.",
      "Pin your elbows to your sides, curl the bar up toward your shoulders, keeping back straight.",
      "Squeeze at the top, then slowly lower it back down."
    ],
    commonMistakes: ["Swaying the torso for momentum", "Not completing the full extension", "Resting the bar at the top"],
    recommendedSets: 3,
    recommendedReps: "8-10"
  },
  {
    name: "Hammer Curl",
    category: "Biceps",
    targetMuscle: "Brachialis & Brachioradialis",
    difficulty: "Beginner",
    benefits: ["Builds bicep thickness", "Strengthens forearm flexors"],
    instructions: [
      "Stand upright holding dumbbells at your sides, palms facing each other (neutral grip).",
      "Keep elbows pinned. Curl dumbbells up without rotating your wrists.",
      "Squeeze at the top, then slowly lower dumbbells back down."
    ],
    commonMistakes: ["Rotating wrists during curl", "Elbows flaring forward", "Jerking the weights"],
    recommendedSets: 3,
    recommendedReps: "12"
  },
  {
    name: "Concentration Curl",
    category: "Biceps",
    targetMuscle: "Biceps Brachii Peak",
    difficulty: "Intermediate",
    benefits: ["Strict isolation of bicep peak", "Prevents cheating via elbow locking"],
    instructions: [
      "Sit on a flat bench. Rest your left elbow against the inside of your left thigh.",
      "Hold a dumbbell in your left hand with palm facing up.",
      "Curl the dumbbell toward your face, squeeze the bicep, then slowly extend elbow fully."
    ],
    commonMistakes: ["Resting elbow on top of thigh", "Using shoulder muscles to lift", "Incomplete extension"],
    recommendedSets: 3,
    recommendedReps: "12"
  },
  {
    name: "Preacher Curl",
    category: "Biceps",
    targetMuscle: "Lower Biceps",
    difficulty: "Intermediate",
    benefits: ["Forces strict bicep isolation", "Strengthens biceps at full stretch"],
    instructions: [
      "Sit at a preacher curl bench, resting your upper arms flat on the pad.",
      "Grasp an EZ bar or dumbbells with an underhand grip.",
      "Curl the bar toward your forehead with control, then lower it slowly until arms are straight."
    ],
    commonMistakes: ["Lifting hips off the seat", "Bouncing at the bottom of the stretch", "Using wrists to curl"],
    recommendedSets: 3,
    recommendedReps: "10"
  },

  // Triceps (4 exercises)
  {
    name: "Tricep Overhead Extension",
    category: "Triceps",
    targetMuscle: "Triceps Brachii (Long Head)",
    difficulty: "Beginner",
    benefits: ["Isolates triceps head", "Improves shoulder flexibility", "Supports pressing power"],
    instructions: [
      "Stand with feet shoulder-width apart. Hold a dumbbell with both hands overhead, arms extended.",
      "Keep your elbows close to your head. Slowly lower the weight behind your head.",
      "Lower until forearms touch your biceps, keeping upper arms stationary.",
      "Use triceps to lift the dumbbell back to the starting position."
    ],
    commonMistakes: ["Flaring elbows outward", "Arching the lower back", "Moving the upper arms instead of only the forearms"],
    recommendedSets: 3,
    recommendedReps: "12"
  },
  {
    name: "Tricep Pushdown",
    category: "Triceps",
    targetMuscle: "Triceps (Lateral Head)",
    difficulty: "Beginner",
    benefits: ["Isolates lateral head", "High constant cable tension", "Aids elbow lockout strength"],
    instructions: [
      "Attach a rope or bar to a high cable pulley. Stand facing the machine.",
      "Grasp the handle, pin your elbows to your rib cage, and bend arms at 90 degrees.",
      "Push the attachment down to fully extend your arms, parting rope ends at the bottom.",
      "Return slowly to the 90-degree starting point."
    ],
    commonMistakes: ["Allowing elbows to drift away from sides", "Leaning chest over the bar", "Using momentum"],
    recommendedSets: 3,
    recommendedReps: "12-15"
  },
  {
    name: "Close-Grip Push-up",
    category: "Triceps",
    targetMuscle: "Triceps & Inner Chest",
    difficulty: "Intermediate",
    benefits: ["No equipment bodyweight exercise", "Builds core and shoulder stabilization"],
    instructions: [
      "Set up in a push-up position, but place your hands close together under your chest (index fingers and thumbs touching to form a diamond).",
      "Lower your chest with control, keeping your elbows tucked tight to your ribs.",
      "Push back up to the starting position."
    ],
    commonMistakes: ["Sagging hips", "Elbows flaring out", "Hands placed too far forward"],
    recommendedSets: 3,
    recommendedReps: "10-12"
  },
  {
    name: "Bench Dips",
    category: "Triceps",
    targetMuscle: "Triceps Brachii",
    difficulty: "Beginner",
    benefits: ["Strengthens triceps using bodyweight", "Builds anterior deltoid strength"],
    instructions: [
      "Place your hands on the edge of a flat bench behind you, fingers facing forward.",
      "Extend your legs forward. Lower your hips by bending your elbows to 90 degrees.",
      "Push back up to extend arms fully."
    ],
    commonMistakes: ["Flaring elbows", "Lowering hips too far forward away from bench", "Shrugging shoulders"],
    recommendedSets: 3,
    recommendedReps: "12-15"
  },

  // Calf (2 exercises)
  {
    name: "Standing Calf Raise",
    category: "Calf",
    targetMuscle: "Gastrocnemius",
    difficulty: "Beginner",
    benefits: ["Improves ankle stability", "Builds calf shape and muscle", "Supports jump height"],
    instructions: [
      "Stand on the edge of a raised step on the balls of your feet, heels hanging off.",
      "Slowly lower your heels down to feel a deep stretch in the calf.",
      "Push up through your toes as high as possible, contracting the calf, then lower slowly."
    ],
    commonMistakes: ["Bouncing at the bottom", "Using knees to lift", "Incomplete contraction"],
    recommendedSets: 4,
    recommendedReps: "15-20"
  },
  {
    name: "Seated Calf Raise",
    category: "Calf",
    targetMuscle: "Soleus",
    difficulty: "Beginner",
    benefits: ["Isolates lower calf soleus muscle", "Supports running mechanics"],
    instructions: [
      "Sit on the calf raise machine, placing the weight pads on your thighs.",
      "Place balls of feet on the platform. Release safety bar.",
      "Lower heels to full extension, then press up dynamically onto your toes."
    ],
    commonMistakes: ["Rushing the negative phase", "Not holding the stretch", "Slipping off platform"],
    recommendedSets: 3,
    recommendedReps: "15"
  },

  // Chest (5 exercises)
  {
    name: "Barbell Bench Press",
    category: "Chest",
    targetMuscle: "Pectoralis Major",
    difficulty: "Intermediate",
    benefits: ["Builds chest muscle mass", "Improves upper body pushing power", "Engages triceps and anterior deltoids"],
    instructions: [
      "Lie flat on the bench, feet flat on the floor. Grip the barbell slightly wider than shoulder-width.",
      "Unrack the bar and hold it straight over your chest with arms locked.",
      "Inhale and lower the bar slowly to your mid-chest.",
      "Exhale and push the bar back up dynamically to the starting position."
    ],
    commonMistakes: ["Bouncing the bar off the chest", "Flaring elbows out too wide", "Arching the lower back excessively off the bench"],
    recommendedSets: 4,
    recommendedReps: "8-12"
  },
  {
    name: "Push-Up",
    category: "Chest",
    targetMuscle: "Pectoralis Major",
    difficulty: "Beginner",
    benefits: ["No equipment needed", "Builds upper body strength", "Engages core"],
    instructions: [
      "Start in a high plank position with hands slightly wider than shoulder-width.",
      "Lower your body by bending your elbows, keeping your core tight and body in a straight line.",
      "Lower until your chest nearly touches the floor.",
      "Push through your hands to return to the starting position."
    ],
    commonMistakes: ["Sagging hips", "Elbows flared out 90 degrees", "Incomplete range of motion"],
    recommendedSets: 3,
    recommendedReps: "12-15"
  },
  {
    name: "Incline Dumbbell Bench Press",
    category: "Chest",
    targetMuscle: "Pectoralis Major (Upper)",
    difficulty: "Intermediate",
    benefits: ["Builds upper chest fullness", "Reduces shoulder strain compared to barbell flat press"],
    instructions: [
      "Sit on an incline bench (about 30-45 degrees) holding dumbbells at your shoulders.",
      "Press the weights straight up over your upper chest, locking your arms.",
      "Slowly lower them back to your chest, feeling a stretch."
    ],
    commonMistakes: ["Clashing dumbbells at the top", "Benching at too steep of an angle (turns into shoulders)", "Too fast reps"],
    recommendedSets: 3,
    recommendedReps: "8-12"
  },
  {
    name: "Dumbbell Chest Fly",
    category: "Chest",
    targetMuscle: "Pectoralis Major (Outer/Inner)",
    difficulty: "Intermediate",
    benefits: ["Isolates chest without triceps", "Improves chest stretch and flexibility"],
    instructions: [
      "Lie flat on a bench holding dumbbells above your chest, palms facing each other.",
      "With a slight bend in your elbows, lower dumbbells out in a wide arc until chest is stretched.",
      "Squeeze your chest muscles to pull dumbbells back to the starting point."
    ],
    commonMistakes: ["Bending elbows too much (turns into press)", "Lowering weights too far (injures shoulders)", "Lifting head"],
    recommendedSets: 3,
    recommendedReps: "12"
  },
  {
    name: "Decline Press",
    category: "Chest",
    targetMuscle: "Pectoralis Major (Lower)",
    difficulty: "Intermediate",
    benefits: ["Targets lower chest", "Reduces shoulder activation", "Allows slightly heavier lifts"],
    instructions: [
      "Secure legs in a decline bench, lie back. Hold dumbbells or barbell over lower chest.",
      "Lower slowly to your lower chest, then press back up until arms are straight."
    ],
    commonMistakes: ["Letting bar drift over neck", "Short range of motion", "Violent pushing"],
    recommendedSets: 3,
    recommendedReps: "10"
  },

  // Forearms (3 exercises)
  {
    name: "Dumbbell Wrist Curl",
    category: "Forearms",
    targetMuscle: "Wrist Flexors",
    difficulty: "Beginner",
    benefits: ["Builds forearm muscle size", "Improves grip strength for pull-ups"],
    instructions: [
      "Sit on a bench, holding dumbbells with underhand grip. Rest your forearms on your thighs, wrists hanging off.",
      "Let dumbbells roll down to your fingers, then curl your wrists upward.",
      "Slowly lower and repeat."
    ],
    commonMistakes: ["Lifting forearms off thighs", "Using shoulders", "Too heavy weight"],
    recommendedSets: 3,
    recommendedReps: "15"
  },
  {
    name: "Reverse Dumbbell Wrist Curl",
    category: "Forearms",
    targetMuscle: "Wrist Extensors",
    difficulty: "Beginner",
    benefits: ["Balances forearm development", "Prevents tennis elbow injuries"],
    instructions: [
      "Sit on a bench, holding dumbbells with overhand grip (palms down).",
      "Rest forearms on thighs, wrists hanging off. Curl wrists upward.",
      "Lower slowly back down."
    ],
    commonMistakes: ["Lifting elbows", "Too fast movement", "Using excessive weight"],
    recommendedSets: 3,
    recommendedReps: "15"
  },
  {
    name: "Farmer's Carry",
    category: "Forearms",
    targetMuscle: "Forearms & Traps (Grip)",
    difficulty: "Beginner",
    benefits: ["Builds massive grip strength", "Engages core and posture muscles", "Burn calories"],
    instructions: [
      "Hold heavy dumbbells in each hand, standing tall.",
      "Pull shoulders back, engage core, and walk in a straight line with slow, controlled steps."
    ],
    commonMistakes: ["Slouching forward", "Choosing weights that are too light", "Letting weights swing"],
    recommendedSets: 3,
    recommendedReps: "30s-60s walk"
  },

  // Legs (6 exercises)
  {
    name: "Bodyweight Squat",
    category: "Legs",
    targetMuscle: "Quadriceps & Gluteus Maximus",
    difficulty: "Beginner",
    benefits: ["Increases lower body strength", "Improves hip mobility", "Burns high calories"],
    instructions: [
      "Stand with feet slightly wider than shoulder-width, toes pointed slightly out.",
      "Inhale and lower hips back and down, as if sitting in a chair, keeping chest upright.",
      "Lower until thighs are parallel to the floor (or lower if comfortable).",
      "Drive through your heels to stand back up, exhaling at the top."
    ],
    commonMistakes: ["Knees caving inward", "Heels lifting off the ground", "Rounding the lower back"],
    recommendedSets: 3,
    recommendedReps: "15-20"
  },
  {
    name: "Dumbbell Romanian Deadlift",
    category: "Legs",
    targetMuscle: "Hamstrings & Gluteus Maximus",
    difficulty: "Intermediate",
    benefits: ["Builds posterior chain strength", "Improves hamstring flexibility", "Protects lower back"],
    instructions: [
      "Stand straight holding dumbbells in front of your thighs.",
      "Hinge at your hips, sending them backwards as you lower dumbbells down your shins, keeping knees slightly bent.",
      "Keep your back flat and shoulder blades squeezed.",
      "Lower until you feel a stretch in hamstrings, then squeeze glutes and push hips forward to return to standing."
    ],
    commonMistakes: ["Rounding the back", "Bending knees too much (making it a squat)", "Keeping weights too far from legs"],
    recommendedSets: 3,
    recommendedReps: "10-12"
  },
  {
    name: "Walking Lunges",
    category: "Legs",
    targetMuscle: "Quadriceps & Glutes",
    difficulty: "Beginner",
    benefits: ["Improves balance and hip mobility", "Strengthens each leg unilaterally"],
    instructions: [
      "Stand tall, feet hip-width apart. Step forward with your right foot.",
      "Lower hips until your right thigh is parallel to floor and left knee nearly touches floor.",
      "Push through right heel and step forward with your left foot to repeat."
    ],
    commonMistakes: ["Knee crossing past toes", "Leaning too far forward", "Narrow stance (losing balance)"],
    recommendedSets: 3,
    recommendedReps: "10 steps per leg"
  },
  {
    name: "Leg Press",
    category: "Legs",
    targetMuscle: "Quadriceps",
    difficulty: "Beginner",
    benefits: ["Safely loads legs without spine loading", "Isolates quads and hamstrings"],
    instructions: [
      "Sit in the leg press machine, place feet shoulder-width on sled.",
      "Lower sled slowly by bending knees to 90 degrees.",
      "Press the sled away by extending legs, keeping knees slightly bent at lock."
    ],
    commonMistakes: ["Locking out knees completely", "Lowering too far (butt lifts off seat)", "Placing feet too low"],
    recommendedSets: 4,
    recommendedReps: "10-12"
  },
  {
    name: "Goblet Squat",
    category: "Legs",
    targetMuscle: "Quads & Core",
    difficulty: "Beginner",
    benefits: ["Easy to learn squat form", "High core loading", "Deep squat depth"],
    instructions: [
      "Hold a dumbbell vertically under your chin, hugging it with both hands.",
      "Stand with feet shoulder-width, squat down keeping torso upright, elbows inside knees at bottom.",
      "Press through heels to stand."
    ],
    commonMistakes: ["Torso collapsing forward", "Short range of motion", "Heels lifting"],
    recommendedSets: 3,
    recommendedReps: "12"
  },
  {
    name: "Bulgarian Split Squat",
    category: "Legs",
    targetMuscle: "Quads & Hamstrings (Glutes)",
    difficulty: "Advanced",
    benefits: ["Intense single-leg growth", "Fixes lower-body strength differences", "Deep hip stretch"],
    instructions: [
      "Stand a step away from a bench behind you. Rest top of left foot flat on bench.",
      "Lower hips until right thigh is parallel to floor, keeping chest up.",
      "Press through right heel to return to stand."
    ],
    commonMistakes: ["Knee buckling inward", "Torso leaning too far", "bench too high"],
    recommendedSets: 3,
    recommendedReps: "10 per leg"
  },

  // Shoulders (5 exercises)
  {
    name: "Dumbbell Shoulder Press",
    category: "Shoulders",
    targetMuscle: "Anterior Deltoid",
    difficulty: "Intermediate",
    benefits: ["Builds shoulder mass", "Improves overhead stability", "Engages triceps and upper chest"],
    instructions: [
      "Sit on an upright bench. Hold a dumbbell in each hand at shoulder level, palms facing forward.",
      "Exhale and press dumbbells straight up until arms are fully extended overhead.",
      "Hold for a second, then slowly lower dumbbells back to shoulder level."
    ],
    commonMistakes: ["Locking out elbows violently", "Arching back off the seat", "Not bringing dumbbells down to shoulder height"],
    recommendedSets: 3,
    recommendedReps: "8-10"
  },
  {
    name: "Dumbbell Lateral Raise",
    category: "Shoulders",
    targetMuscle: "Lateral Deltoid",
    difficulty: "Beginner",
    benefits: ["Builds shoulder width (3D shoulders)", "Isolates side deltoids"],
    instructions: [
      "Stand tall, holding dumbbells at your sides, palms facing in.",
      "With a slight bend in your elbows, raise the weights out to your sides until arms are parallel to floor.",
      "Slowly lower dumbbells back down."
    ],
    commonMistakes: ["Using too much weight and swinging hips", "Raising weights above shoulder level", "Keeping arms completely straight"],
    recommendedSets: 4,
    recommendedReps: "12-15"
  },
  {
    name: "Front Dumbbell Raise",
    category: "Shoulders",
    targetMuscle: "Anterior Deltoid",
    difficulty: "Beginner",
    benefits: ["Isolates front shoulder cap", "Supports pushing movements"],
    instructions: [
      "Stand holding dumbbells in front of your thighs, palms facing down.",
      "Keep arms straight, raise weights forward to shoulder height.",
      "Lower slowly down with control."
    ],
    commonMistakes: ["Using body swing", "Grip too tight", "Dropping weights too fast"],
    recommendedSets: 3,
    recommendedReps: "12"
  },
  {
    name: "Dumbbell Shrugs",
    category: "Shoulders",
    targetMuscle: "Trapezius",
    difficulty: "Beginner",
    benefits: ["Builds neck and upper back volume", "Supports collarbone posture"],
    instructions: [
      "Stand tall, holding heavy dumbbells at your sides.",
      "Shrug your shoulders straight up toward your ears as high as possible.",
      "Squeeze at the top, then slowly lower back down."
    ],
    commonMistakes: ["Rolling shoulders in circles", "Using arms to pull", "Straining neck forward"],
    recommendedSets: 3,
    recommendedReps: "15"
  },
  {
    name: "Overhead Barbell Press",
    category: "Shoulders",
    targetMuscle: "Full Deltoid Complex",
    difficulty: "Advanced",
    benefits: ["Builds core and shoulder strength", "High dynamic stabilization"],
    instructions: [
      "Stand holding barbell at collarbone level with shoulder-width grip.",
      "Brace core, squeeze glutes. Press the bar straight up overhead, moving head back slightly to clear the bar.",
      "Lock out at the top, then lower bar slowly back to collarbones."
    ],
    commonMistakes: ["Leaning back too far (arch spine)", "Incomplete range of motion", "Not bracing core"],
    recommendedSets: 4,
    recommendedReps: "6-8"
  },

  // Cardio (4 exercises)
  {
    name: "Burpee",
    category: "Cardio",
    targetMuscle: "Whole Body (Cardio / Strength)",
    difficulty: "Advanced",
    benefits: ["High cardiovascular burn", "Builds full-body explosive strength", "No equipment required"],
    instructions: [
      "Stand with feet shoulder-width apart. Drop into a squat position, placing hands on the floor.",
      "Jump your feet back to land in a push-up position, and lower your chest to the floor.",
      "Push up and jump your feet back under your chest into a squat.",
      "Explode upwards into a jump, reaching hands overhead."
    ],
    commonMistakes: ["Hips sagging in the plank", "Landing heavily on your knees", "Skipping the chest-to-floor phase"],
    recommendedSets: 3,
    recommendedReps: "10-12"
  },
  {
    name: "Mountain Climber",
    category: "Cardio",
    targetMuscle: "Abdominals & Hip Flexors",
    difficulty: "Beginner",
    benefits: ["High heart rate burner", "Engages core and shoulders", "Improves agility"],
    instructions: [
      "Start in a high plank position, hands under shoulders, core tight.",
      "Drive your right knee toward your chest. Instantly switch legs, pulling left knee in while extending right leg.",
      "Keep hips down and run your legs in place as fast as possible while maintaining form."
    ],
    commonMistakes: ["Bouncing hips up and down", "Not bringing knees fully under chest", "Leaning too far back behind shoulders"],
    recommendedSets: 3,
    recommendedReps: "30s-45s"
  },
  {
    name: "Jumping Jacks",
    category: "Cardio",
    targetMuscle: "Full Body Cardio",
    difficulty: "Beginner",
    benefits: ["Great dynamic warm-up", "Elevates heart rate", "Improves coordination"],
    instructions: [
      "Stand with feet together, arms at your sides.",
      "Jump up while spreading legs wide and clapping hands overhead.",
      "Jump again to return to feet together and arms at sides."
    ],
    commonMistakes: ["Landing flat-footed", "Half arm movements", "Bending knees excessively"],
    recommendedSets: 3,
    recommendedReps: "45s"
  },
  {
    name: "Jump Rope",
    category: "Cardio",
    targetMuscle: "Calves & Cardiovascular System",
    difficulty: "Intermediate",
    benefits: ["High caloric burn rate", "Improves foot speed and coordination", "Strengthens calves and ankles"],
    instructions: [
      "Hold handles of a jump rope behind you.",
      "Swing rope overhead, jump over it on the balls of your feet, keeping jumps low."
    ],
    commonMistakes: ["Jumping too high", "Using arms instead of wrists to spin", "Stiff legs"],
    recommendedSets: 3,
    recommendedReps: "60s"
  }
];

const seedDatabase = async () => {
  try {
    console.log('Upserting standard default exercises to protect synced data...');
    for (const ex of defaultExercises) {
      await Exercise.findOneAndUpdate(
        { name: ex.name },
        { $setOnInsert: ex },
        { upsert: true, new: true }
      );
    }

    await Workout.deleteMany({ type: 'Preplanned' });
    console.log('Default exercises upserted and preplanned workouts cleared.');

    // Fetch exercises to link
    const absCrunch = await Exercise.findOne({ name: "Abdominal Crunches" });
    const plank = await Exercise.findOne({ name: "Forearm Plank" });
    const benchPress = await Exercise.findOne({ name: "Barbell Bench Press" });
    const pushup = await Exercise.findOne({ name: "Push-Up" });
    const bicepCurl = await Exercise.findOne({ name: "Dumbbell Bicep Curl" });
    const tricepExt = await Exercise.findOne({ name: "Tricep Overhead Extension" });
    const shoulderPress = await Exercise.findOne({ name: "Dumbbell Shoulder Press" });
    const dumbbellRow = await Exercise.findOne({ name: "Bent-Over Dumbbell Row" });
    const squat = await Exercise.findOne({ name: "Bodyweight Squat" });
    const deadlift = await Exercise.findOne({ name: "Dumbbell Romanian Deadlift" });
    const burpee = await Exercise.findOne({ name: "Burpee" });
    const mountainClimber = await Exercise.findOne({ name: "Mountain Climber" });

    const defaultWorkouts = [
      {
        name: "Summer Burn",
        type: "Preplanned",
        difficulty: "Beginner",
        durationWeeks: 4,
        description: "High-intensity cardio and core burner to tone up and feel active for the summer season.",
        schedule: [
          {
            day: "Monday",
            restDay: false,
            exercises: [
              { exercise: squat._id, sets: 3, reps: "15", weight: 0 },
              { exercise: pushup._id, sets: 3, reps: "12", weight: 0 },
              { exercise: mountainClimber._id, sets: 3, reps: "30s", weight: 0 },
              { exercise: absCrunch._id, sets: 3, reps: "15", weight: 0 }
            ]
          },
          { day: "Tuesday", restDay: true, exercises: [] },
          {
            day: "Wednesday",
            restDay: false,
            exercises: [
              { exercise: burpee._id, sets: 3, reps: "10", weight: 0 },
              { exercise: plank._id, sets: 3, reps: "45s", weight: 0 },
              { exercise: mountainClimber._id, sets: 3, reps: "45s", weight: 0 },
              { exercise: squat._id, sets: 3, reps: "20", weight: 0 }
            ]
          },
          { day: "Thursday", restDay: true, exercises: [] },
          {
            day: "Friday",
            restDay: false,
            exercises: [
              { exercise: pushup._id, sets: 3, reps: "15", weight: 0 },
              { exercise: absCrunch._id, sets: 3, reps: "20", weight: 0 },
              { exercise: plank._id, sets: 3, reps: "60s", weight: 0 },
              { exercise: burpee._id, sets: 3, reps: "8", weight: 0 }
            ]
          },
          { day: "Saturday", restDay: true, exercises: [] },
          { day: "Sunday", restDay: true, exercises: [] }
        ]
      },
      {
        name: "30-Day Workout Challenge",
        type: "Preplanned",
        difficulty: "Intermediate",
        durationWeeks: 4,
        description: "Complete full-body conditioning routine designed to push your strength and endurance boundaries daily.",
        schedule: [
          {
            day: "Monday",
            restDay: false,
            exercises: [
              { exercise: benchPress._id, sets: 3, reps: "10", weight: 20 },
              { exercise: squat._id, sets: 3, reps: "15", weight: 0 },
              { exercise: bicepCurl._id, sets: 3, reps: "12", weight: 8 },
              { exercise: absCrunch._id, sets: 3, reps: "15", weight: 0 }
            ]
          },
          {
            day: "Tuesday",
            restDay: false,
            exercises: [
              { exercise: mountainClimber._id, sets: 4, reps: "45s", weight: 0 },
              { exercise: burpee._id, sets: 3, reps: "12", weight: 0 },
              { exercise: plank._id, sets: 3, reps: "60s", weight: 0 }
            ]
          },
          {
            day: "Wednesday",
            restDay: false,
            exercises: [
              { exercise: dumbbellRow._id, sets: 3, reps: "12", weight: 12 },
              { exercise: deadlift._id, sets: 3, reps: "10", weight: 14 },
              { exercise: tricepExt._id, sets: 3, reps: "12", weight: 6 }
            ]
          },
          { day: "Thursday", restDay: true, exercises: [] },
          {
            day: "Friday",
            restDay: false,
            exercises: [
              { exercise: pushup._id, sets: 4, reps: "15", weight: 0 },
              { exercise: squat._id, sets: 3, reps: "20", weight: 0 },
              { exercise: shoulderPress._id, sets: 3, reps: "10", weight: 10 },
              { exercise: plank._id, sets: 3, reps: "60s", weight: 0 }
            ]
          },
          { day: "Saturday", restDay: true, exercises: [] },
          { day: "Sunday", restDay: true, exercises: [] }
        ]
      },
      {
        name: "90-Day Transformation",
        type: "Preplanned",
        difficulty: "Advanced",
        durationWeeks: 12,
        description: "Premium body restructuring system focusing on structural muscle development, tone, and power.",
        schedule: [
          {
            day: "Monday", // Push Day
            restDay: false,
            exercises: [
              { exercise: benchPress._id, sets: 4, reps: "8-10", weight: 30 },
              { exercise: shoulderPress._id, sets: 3, reps: "10", weight: 12 },
              { exercise: pushup._id, sets: 3, reps: "15", weight: 0 },
              { exercise: tricepExt._id, sets: 3, reps: "12", weight: 8 }
            ]
          },
          {
            day: "Tuesday", // Pull Day
            restDay: false,
            exercises: [
              { exercise: dumbbellRow._id, sets: 4, reps: "10", weight: 16 },
              { exercise: deadlift._id, sets: 3, reps: "10", weight: 20 },
              { exercise: bicepCurl._id, sets: 3, reps: "12", weight: 10 }
            ]
          },
          { day: "Wednesday", restDay: true, exercises: [] },
          {
            day: "Thursday", // Legs Day
            restDay: false,
            exercises: [
              { exercise: squat._id, sets: 4, reps: "15", weight: 15 },
              { exercise: deadlift._id, sets: 3, reps: "12", weight: 15 },
              { exercise: plank._id, sets: 3, reps: "60s", weight: 0 }
            ]
          },
          {
            day: "Friday", // Cardio & Core
            restDay: false,
            exercises: [
              { exercise: burpee._id, sets: 4, reps: "12", weight: 0 },
              { exercise: mountainClimber._id, sets: 4, reps: "60s", weight: 0 },
              { exercise: absCrunch._id, sets: 4, reps: "20", weight: 0 },
              { exercise: plank._id, sets: 3, reps: "60s", weight: 0 }
            ]
          },
          { day: "Saturday", restDay: true, exercises: [] },
          { day: "Sunday", restDay: true, exercises: [] }
        ]
      },
      {
        name: "Fat Loss Program",
        type: "Preplanned",
        difficulty: "Beginner",
        durationWeeks: 4,
        description: "Targeted calorie-burning program using high-intensity cardio intervals and bodyweight resistance circuits.",
        schedule: [
          {
            day: "Monday",
            restDay: false,
            exercises: [
              { exercise: mountainClimber._id, sets: 4, reps: "30s", weight: 0 },
              { exercise: squat._id, sets: 3, reps: "15", weight: 0 },
              { exercise: pushup._id, sets: 3, reps: "10", weight: 0 },
              { exercise: absCrunch._id, sets: 3, reps: "15", weight: 0 }
            ]
          },
          { day: "Tuesday", restDay: true, exercises: [] },
          {
            day: "Wednesday",
            restDay: false,
            exercises: [
              { exercise: burpee._id, sets: 3, reps: "8", weight: 0 },
              { exercise: plank._id, sets: 3, reps: "30s", weight: 0 },
              { exercise: mountainClimber._id, sets: 3, reps: "30s", weight: 0 }
            ]
          },
          { day: "Thursday", restDay: true, exercises: [] },
          {
            day: "Friday",
            restDay: false,
            exercises: [
              { exercise: squat._id, sets: 3, reps: "20", weight: 0 },
              { exercise: mountainClimber._id, sets: 3, reps: "45s", weight: 0 },
              { exercise: absCrunch._id, sets: 3, reps: "20", weight: 0 },
              { exercise: plank._id, sets: 3, reps: "45s", weight: 0 }
            ]
          },
          { day: "Saturday", restDay: true, exercises: [] },
          { day: "Sunday", restDay: true, exercises: [] }
        ]
      },
      {
        name: "Muscle Builder Program",
        type: "Preplanned",
        difficulty: "Advanced",
        durationWeeks: 8,
        description: "Hypertrophy-focused training program incorporating high volume progressive overload weights for muscle size.",
        schedule: [
          {
            day: "Monday", // Chest / Arms
            restDay: false,
            exercises: [
              { exercise: benchPress._id, sets: 4, reps: "8", weight: 40 },
              { exercise: pushup._id, sets: 3, reps: "15", weight: 0 },
              { exercise: bicepCurl._id, sets: 3, reps: "10", weight: 12 },
              { exercise: tricepExt._id, sets: 3, reps: "10", weight: 10 }
            ]
          },
          { day: "Tuesday", restDay: true, exercises: [] },
          {
            day: "Wednesday", // Back / Shoulders
            restDay: false,
            exercises: [
              { exercise: dumbbellRow._id, sets: 4, reps: "8", weight: 20 },
              { exercise: shoulderPress._id, sets: 4, reps: "8", weight: 14 },
              { exercise: plank._id, sets: 3, reps: "60s", weight: 0 }
            ]
          },
          { day: "Thursday", restDay: true, exercises: [] },
          {
            day: "Friday", // Legs / Core
            restDay: false,
            exercises: [
              { exercise: deadlift._id, sets: 4, reps: "8", weight: 30 },
              { exercise: squat._id, sets: 4, reps: "10", weight: 20 },
              { exercise: absCrunch._id, sets: 3, reps: "20", weight: 0 }
            ]
          },
          { day: "Saturday", restDay: true, exercises: [] },
          { day: "Sunday", restDay: true, exercises: [] }
        ]
      }
    ];

    const createdWorkouts = await Workout.insertMany(defaultWorkouts);
    console.log(`${createdWorkouts.length} preplanned workouts seeded.`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
