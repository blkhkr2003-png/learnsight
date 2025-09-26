// scripts/seed-demo.ts
import admin, { adminDb } from "@/lib/firebase-admin";
import type { QuestionDoc, Fundamental } from "@/types";

async function seedQuestions() {
  const now = admin.firestore.Timestamp.now();

  // Helper to create fundamentals object
  const f = (fundamentals: Partial<Record<Fundamental, number>>) =>
    fundamentals;

  // Your question list (no "id" yet)
  const rawQuestions: Omit<QuestionDoc, "id">[] = [
    // ---------------- Listening (Revised for Text) ----------------
    {
      question:
        "Read the sentence: 'She finally found her keys right where she had left them, under a pile of mail.' Which word receives the most natural emphasis?",
      difficulty: 1,
      choices: ["finally", "keys", "right", "mail"],
      correctChoice: 2,
      fundamentals: f({ listening: 1 }),
    },
    {
      question:
        "Read the following sentence: 'After months of relentless work, she finally held the award, her hands trembling slightly.' What emotion is conveyed?",
      difficulty: 1,
      choices: ["Anger", "Indifference", "Overwhelming Joy", "Disappointment"],
      correctChoice: 2,
      fundamentals: f({ listening: 1, retention: 0.4 }),
    },
    {
      question:
        "In the sentence, 'I *specifically* told you to buy the blue one,' which concept is emphasized most?",
      difficulty: 2,
      choices: [
        "The person being told",
        "The instruction's precision",
        "The color of the item",
        "The act of buying",
      ],
      correctChoice: 1,
      fundamentals: f({ listening: 1, grasping: 0.5 }),
    },
    {
      question:
        "Read the description: 'The band featured a lead guitarist, a powerful drummer keeping the beat, and a nimble-fingered pianist playing a melody.' How many different instruments are mentioned?",
      difficulty: 2,
      choices: ["1", "2", "3", "4"],
      correctChoice: 2,
      fundamentals: f({ listening: 1, application: 0.3 }),
    },
    {
      question:
        "A story describes a lonely old man who befriends a stray cat, finding a new sense of purpose in caring for it. What is the main theme?",
      difficulty: 3,
      choices: [
        "The importance of companionship",
        "The dangers of stray animals",
        "The pursuit of wealth",
        "The struggle against nature",
      ],
      correctChoice: 0,
      fundamentals: f({ listening: 1, retention: 0.3 }),
    },
    {
      question:
        "In a debate about implementing a four-day work week, which argument is the strongest?",
      difficulty: 3,
      choices: [
        "'It just feels like a better idea.'",
        "'Studies show it boosts productivity and employee well-being.'",
        "'My friend's company did it and they like it.'",
        "'We should do it because our competitor might.'",
      ],
      correctChoice: 1,
      fundamentals: f({ listening: 1, grasping: 0.4 }),
    },
    {
      question:
        "When asked if he liked his coworker's overly ambitious project proposal, Mark said, 'Well, it's certainly... detailed.' What is the implied meaning?",
      difficulty: 4,
      choices: [
        "He is genuinely impressed by the detail.",
        "He thinks it is excellent work.",
        "He finds it overly complex or tedious.",
        "He wants to be the project lead.",
      ],
      correctChoice: 2,
      fundamentals: f({ listening: 1, application: 0.5 }),
    },
    {
      question:
        "A passage describes the following events: 1. The alarm clock rang. 2. He got out of bed. 3. He made coffee. 4. The sun rose. What is the most logical sequence?",
      difficulty: 4,
      choices: ["1, 2, 3, 4", "4, 1, 2, 3", "3, 2, 1, 4", "2, 3, 4, 1"],
      correctChoice: 0,
      fundamentals: f({ listening: 1, retention: 0.3 }),
    },
    {
      question:
        "Read the excerpt: 'This new recycling program will not only reduce landfill waste by 60% but also create local jobs. We urge every citizen to vote 'Yes' on Proposition 5.' What is the author's primary purpose?",
      difficulty: 5,
      choices: ["To inform", "To persuade", "To entertain", "To critique"],
      correctChoice: 1,
      fundamentals: f({ listening: 1, grasping: 0.4, application: 0.2 }),
    },
    {
      question:
        "The text states: 'The ground is wet, the sky is full of dark clouds, and most people on the street are carrying umbrellas.' Which statement is a logical inference?",
      difficulty: 5,
      choices: [
        "It is currently sunny.",
        "A parade is about to start.",
        "It has recently rained or is about to rain.",
        "It is the middle of winter.",
      ],
      correctChoice: 2,
      fundamentals: f({ listening: 1, retention: 0.5 }),
    },

    // ---------------- Grasping ----------------
    {
      question: "Analyze the pattern: 2, 4, 8, 16, __. Predict the next value.",
      difficulty: 1,
      choices: ["32", "24", "48", "20"],
      correctChoice: 0,
      fundamentals: f({ grasping: 1 }),
    },
    {
      question:
        "Identify the logical inconsistency: 'All birds can fly. Since penguins are birds, they must be able to soar in the sky.'",
      difficulty: 1,
      choices: [
        "The claim that penguins are birds.",
        "The conclusion that penguins can fly.",
        "The premise that all birds can fly.",
        "The use of the word 'soar'.",
      ],
      correctChoice: 2,
      fundamentals: f({ grasping: 1, retention: 0.3 }),
    },
    {
      question: "Solve the equation: 7x - 4 = 31.",
      difficulty: 2,
      choices: ["3", "4", "6", "5"],
      correctChoice: 3,
      fundamentals: f({ grasping: 1, application: 0.4 }),
    },
    {
      question: "Which shape has four equal sides and four right angles?",
      difficulty: 2,
      choices: ["Rhombus", "Square", "Rectangle", "Trapezoid"],
      correctChoice: 1,
      fundamentals: f({ grasping: 1, retention: 0.2 }),
    },
    {
      question:
        "Determine the missing number in the sequence: 3, 6, 9, __, 15.",
      difficulty: 3,
      choices: ["10", "11", "12", "13"],
      correctChoice: 2,
      fundamentals: f({ grasping: 1, application: 0.3 }),
    },
    {
      question:
        "Evaluate the argument: 'All men are mortal. Socrates is a man. Therefore, Socrates is mortal.' Is the reasoning valid or invalid?",
      difficulty: 3,
      choices: ["Valid", "Invalid", "Cannot determine", "Partially valid"],
      correctChoice: 0,
      fundamentals: f({ grasping: 1 }),
    },
    {
      question: "Which of the following statements is a logical contradiction?",
      difficulty: 4,
      choices: [
        "The car is red and fast.",
        "He is a tall short man.",
        "She is either at home or at work.",
        "If it rains, the ground gets wet.",
      ],
      correctChoice: 1,
      fundamentals: f({ grasping: 1, retention: 0.2 }),
    },
    {
      question:
        "Dataset A shows ice cream sales peak in summer. Dataset B shows scarf sales peak in winter. What trend can be identified?",
      difficulty: 4,
      choices: [
        "Product sales are often linked to seasons.",
        "Ice cream is more popular than scarves.",
        "All products sell better in the summer.",
        "This data correlation is random.",
      ],
      correctChoice: 0,
      fundamentals: f({ grasping: 1, application: 0.3 }),
    },
    {
      question:
        "Consider the sequence: O, T, T, F, F, S, S, E, __. What is the hidden rule that generates this pattern?",
      difficulty: 5,
      choices: [
        "Alternating vowels and consonants.",
        "The first letter of prime numbers.",
        "The first letter of numbers (One, Two, Three...).",
        "The first letter of days of the week.",
      ],
      correctChoice: 2,
      fundamentals: f({ grasping: 1, application: 0.5 }),
    },
    {
      question:
        "Premise 1: If you study hard, you will pass the exam. Premise 2: You studied hard. What is the most logical conclusion?",
      difficulty: 5,
      choices: [
        "You will pass the exam.",
        "You will fail the exam.",
        "You might not take the exam.",
        "The exam will be easy.",
      ],
      correctChoice: 0,
      fundamentals: f({ grasping: 1, retention: 0.3 }),
    },

    // ---------------- Retention ----------------
    {
      question:
        "From a lecture on the Roman Empire, what was the primary reason given for the construction of Hadrian's Wall?",
      difficulty: 1,
      choices: [
        "A decorative monument",
        "To defend against northern tribes",
        "A trade route marker",
        "An aqueduct system",
      ],
      correctChoice: 1,
      fundamentals: f({ retention: 1 }),
    },
    {
      question:
        "In the story of 'The Tortoise and the Hare', what is the key fact that leads to the tortoise's victory?",
      difficulty: 1,
      choices: [
        "The tortoise's slow and steady pace",
        "The hare getting lost",
        "The tortoise finding a shortcut",
        "The finish line was moved closer",
      ],
      correctChoice: 0,
      fundamentals: f({ retention: 1 }),
    },
    {
      question:
        "In biology, what is the correct definition of 'photosynthesis'?",
      difficulty: 2,
      choices: [
        "The process of cellular division.",
        "The breakdown of food for energy.",
        "The process of animal respiration.",
        "The process plants use to convert light into chemical energy.",
      ],
      correctChoice: 3,
      fundamentals: f({ retention: 1, grasping: 0.2 }),
    },
    {
      question:
        "Which sequence of American historical events is in the correct chronological order?",
      difficulty: 2,
      choices: [
        "Civil War -> Revolutionary War -> WWI",
        "Revolutionary War -> Civil War -> WWI",
        "WWI -> Civil War -> Revolutionary War",
        "Civil War -> WWI -> Revolutionary War",
      ],
      correctChoice: 1,
      fundamentals: f({ retention: 1, listening: 0.3 }),
    },
    {
      question:
        "A paragraph discusses market saturation, increased competition, and declining profit margins in the smartphone industry. What is the main idea?",
      difficulty: 3,
      choices: [
        "The industry is facing significant growth challenges.",
        "Smartphones are becoming cheaper to manufacture.",
        "There are not enough smartphone brands.",
        "Technology is no longer advancing.",
      ],
      correctChoice: 0,
      fundamentals: f({ retention: 1, application: 0.2 }),
    },
    {
      question:
        "An argument stated: 'While solar power is a clean energy source, its dependency on weather and high initial installation cost are non-trivial concerns.' What detail is mentioned as a drawback?",
      difficulty: 3,
      choices: [
        "It is not actually a clean energy source.",
        "It is too expensive for everyone.",
        "The installation cost is a significant concern.",
        "It causes frequent power outages.",
      ],
      correctChoice: 2,
      fundamentals: f({ retention: 1, grasping: 0.3 }),
    },
    {
      question: "What is the correct first step in the scientific method?",
      difficulty: 4,
      choices: [
        "Forming a hypothesis",
        "Making an observation and asking a question",
        "Conducting an experiment",
        "Analyzing data",
      ],
      correctChoice: 1,
      fundamentals: f({ retention: 1, application: 0.4 }),
    },
    {
      question:
        "A table shows: City A, Pop: 2M; City B, Pop: 5M; City C, Pop: 1.5M. According to the data, which city has the largest population?",
      difficulty: 4,
      choices: ["City B", "City A", "City C", "All are equal"],
      correctChoice: 0,
      fundamentals: f({ retention: 1, grasping: 0.2 }),
    },
    {
      question:
        "An experiment concluded that plants given fertilizer grew, on average, 30% taller than those without. What was the main conclusion?",
      difficulty: 5,
      choices: [
        "Fertilizer has no effect on plant growth.",
        "All plants require fertilizer to live.",
        "Fertilizer is bad for the environment.",
        "Fertilizer significantly promotes plant height.",
      ],
      correctChoice: 3,
      fundamentals: f({ retention: 1, application: 0.5 }),
    },
    {
      question:
        "In physics, what fundamental relationship does Einstein's equation $E=mc^2$ establish?",
      difficulty: 5,
      choices: [
        "The relationship between energy and velocity",
        "The relationship between mass and gravity",
        "The equivalence of energy and mass",
        "The relationship between light and time",
      ],
      correctChoice: 2,
      fundamentals: f({ retention: 1, grasping: 0.3 }),
    },

    // ---------------- Application ----------------
    {
      question:
        "You have a budget of $100 for groceries, but your list totals $120. Which is the best application of problem-solving?",
      difficulty: 1,
      choices: [
        "Prioritize essential items to fit the budget.",
        "Buy everything and hope your card is not declined.",
        "Don't buy any groceries.",
        "Ask the store manager for a 20% discount.",
      ],
      correctChoice: 0,
      fundamentals: f({ application: 1 }),
    },
    {
      question:
        "You see an unconscious person on the street. After ensuring the area is safe, what is the correct first-aid procedure to apply next?",
      difficulty: 1,
      choices: [
        "Start chest compressions immediately.",
        "Check for responsiveness and call for emergency help.",
        "Try to give them a drink of water.",
        "Leave them alone to rest.",
      ],
      correctChoice: 1,
      fundamentals: f({ application: 1, grasping: 0.3 }),
    },
    {
      question:
        "You want to run a 5k race in three months but have no running experience. Which plan is the best application of gradual progression?",
      difficulty: 2,
      choices: [
        "Run 5k every day starting tomorrow.",
        "Run as far as you can once a week.",
        "Start with a mix of walking and running, slowly increasing running time.",
        "Only practice running the day before the race.",
      ],
      correctChoice: 2,
      fundamentals: f({ application: 1, retention: 0.2 }),
    },
    {
      question:
        "Data shows that website traffic spikes by 300% every day between 6 PM and 8 PM. How should a company apply this conclusion?",
      difficulty: 2,
      choices: [
        "Focus marketing and new content releases just before this period.",
        "Schedule important server maintenance during this peak period.",
        "Ignore the data as a random anomaly.",
        "Shut down the website after 8 PM.",
      ],
      correctChoice: 0,
      fundamentals: f({ application: 1, grasping: 0.4 }),
    },
    {
      question:
        "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
      difficulty: 3,
      choices: ["100 minutes", "5 minutes", "20 minutes", "500 minutes"],
      correctChoice: 1,
      fundamentals: f({ application: 1, retention: 0.3 }),
    },
    {
      question:
        "Applying the principle of osmosis, what is the predicted outcome if you place a freshwater plant into a glass of saltwater?",
      difficulty: 3,
      choices: [
        "The plant will thrive and grow larger.",
        "The plant will convert the salt to food.",
        "The plant will wilt as water leaves its cells.",
        "The salt will be ejected by the plant's roots.",
      ],
      correctChoice: 2,
      fundamentals: f({ application: 1, grasping: 0.2 }),
    },
    {
      question:
        "You invest $1,000 in an account with a 10% annual simple interest rate. Applying the formula ($I = P \times R \times T$), how much interest will you have earned after 2 years?",
      difficulty: 4,
      choices: ["$100", "$200", "$1,200", "$20"],
      correctChoice: 1,
      fundamentals: f({ application: 1, retention: 0.4 }),
    },
    {
      question:
        "You are troubleshooting a lamp that won't turn on. You have already confirmed the lightbulb works. What is the most logical next step to apply?",
      difficulty: 4,
      choices: [
        "Buy a new lamp immediately.",
        "Take the lamp apart.",
        "Check that the lamp is plugged into a working power outlet.",
        "Change the lampshade.",
      ],
      correctChoice: 2,
      fundamentals: f({ application: 1, grasping: 0.3 }),
    },
    {
      question:
        "A company plans to automate a workflow. Applying a cost-benefit analysis, what is the most critical factor to evaluate?",
      difficulty: 5,
      choices: [
        "The long-term return on investment (ROI) versus the initial cost.",
        "The aesthetic design of the new equipment.",
        "How the technology will look in marketing brochures.",
        "Whether the CEO personally understands the technology.",
      ],
      correctChoice: 0,
      fundamentals: f({ application: 1, retention: 0.5, grasping: 0.3 }),
    },
    {
      question:
        "A city is experiencing major traffic congestion. Applying principles of urban planning, which solution is most likely to have a sustainable, long-term impact?",
      difficulty: 5,
      choices: [
        "Building one more lane on every highway.",
        "Making all downtown parking free.",
        "Synchronizing traffic lights.",
        "Investing in a robust and efficient public transportation system.",
      ],
      correctChoice: 3,
      fundamentals: f({ application: 1, grasping: 0.4 }),
    },

    // ---------------- Extra 10 Questions (Revised) ----------------
    {
      question:
        "Compare the tone of 'Your request has been denied' with 'At this time, we are unable to approve your request.' What is the primary difference?",
      difficulty: 2,
      choices: [
        "The first is more direct; the second is more polite and indirect.",
        "They are identical in tone and meaning.",
        "The first is positive; the second is negative.",
        "The second implies the decision will change soon.",
      ],
      correctChoice: 0,
      fundamentals: f({ listening: 1, retention: 0.2 }),
    },
    {
      question:
        "If A is greater than B, and B is greater than C, what can you predict about the relationship between A and C based on multi-step reasoning?",
      difficulty: 3,
      choices: [
        "A is less than C",
        "A is greater than C",
        "A is equal to C",
        "No relationship can be determined",
      ],
      correctChoice: 1,
      fundamentals: f({ grasping: 1, application: 0.4 }),
    },
    {
      question:
        "The argument is: 'This new video game will be the most successful one ever because it has the most realistic graphics.' What is the hidden assumption?",
      difficulty: 3,
      choices: [
        "The game is not expensive.",
        "The game has a compelling story.",
        "Realistic graphics are the most important factor for success.",
        "The game is available on all consoles.",
      ],
      correctChoice: 2,
      fundamentals: f({ retention: 1, grasping: 0.3 }),
    },
    {
      question:
        "You learned that to calculate the area of a rectangle, you multiply length by width. How would you apply this method to find the area of a square room that is 10 feet on one side?",
      difficulty: 4,
      choices: [
        "Multiply 10 by 10.",
        "Multiply 10 by 4.",
        "Add 10 and 10.",
        "Divide 10 by 2.",
      ],
      correctChoice: 0,
      fundamentals: f({ application: 1, listening: 0.3 }),
    },
    {
      question:
        "Read the sentence: 'Despite his generally cheerful demeanor, a brief flicker of sadness crossed his face when he mentioned his old neighborhood.' What subtle detail is revealed?",
      difficulty: 4,
      choices: [
        "He is always a very happy person.",
        "He has a complex or sad memory associated with his old neighborhood.",
        "He dislikes talking about his past.",
        "He no longer has a neighborhood.",
      ],
      correctChoice: 1,
      fundamentals: f({ retention: 1, grasping: 0.2 }),
    },
    {
      question:
        "A project is behind schedule. The best solution must prioritize long-term team morale over meeting the original deadline at all costs. Which solution is best?",
      difficulty: 5,
      choices: [
        "Mandatory overtime for the next month.",
        "Cut key features to rush the release.",
        "Negotiate a new, realistic deadline with the client.",
        "Cancel the project entirely.",
      ],
      correctChoice: 2,
      fundamentals: f({ application: 1, retention: 0.3 }),
    },
    {
      question:
        "A company's sales data shows a sharp increase every November and December, followed by a slump in January. How would you interpret this data pattern?",
      difficulty: 5,
      choices: [
        "The company's products are likely seasonal or related to holiday shopping.",
        "The company's marketing is failing in January.",
        "The data from January is likely inaccurate.",
        "People have more disposable income in the summer.",
      ],
      correctChoice: 0,
      fundamentals: f({ grasping: 1, listening: 0.2 }),
    },
    {
      question:
        "Which of the following statements demonstrates the strongest reasoning?",
      difficulty: 5,
      choices: [
        "'I believe this is true because it just feels right.'",
        "'This policy is effective because a recent, large-scale study showed a 40% improvement.'",
        "'Everyone I know agrees with this, so it must be correct.'",
        "'I saw it in a headline on the internet, so it's a fact.'",
      ],
      correctChoice: 1,
      fundamentals: f({ grasping: 1, retention: 0.3 }),
    },
    {
      question:
        "After a new factory opened in a town, local river pollution increased. The factory was found to be discharging chemicals into the river. What is the most likely cause-effect relationship?",
      difficulty: 4,
      choices: [
        "The pollution caused the factory to open.",
        "The factory's discharge is the cause of the increased pollution.",
        "The town's residents caused the pollution.",
        "The two events are an unrelated coincidence.",
      ],
      correctChoice: 1,
      fundamentals: f({ application: 1, retention: 0.2 }),
    },
    {
      question:
        "A company plans to launch a new luxury car (high price). The target country is entering a recession (low consumer spending), and a competitor just launched a similar, cheaper model. Predict the most likely outcome.",
      difficulty: 5,
      choices: [
        "The car will be extremely successful.",
        "The car will sell moderately well.",
        "The competitor's car will be discontinued.",
        "The car will likely fail due to price, economic conditions, and competition.",
      ],
      correctChoice: 3,
      fundamentals: f({ grasping: 1, application: 0.4 }),
    },
  ];

  // Create questions individually
  const questionIds: string[] = [];

  for (const q of rawQuestions) {
    // Make a new doc id for each question
    const docRef = adminDb.collection("questions").doc();
    await docRef.set({
      ...q,
      createdAt: now,
      updatedAt: now,
    });
    questionIds.push(docRef.id);
  }

  // Create a paper doc referencing them
  await adminDb.collection("papers").doc("demoPaper").set({
    title: "Demo Questions Paper",
    questionIds,
    createdAt: now,
    updatedAt: now,
  });

  console.log(
    `Seeded ${questionIds.length} questions and created demoPaper with all question IDs`
  );
}

seedQuestions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
