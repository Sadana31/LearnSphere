import { groqChat } from "@/lib/groq";

export async function POST(req) {
  let subject, topic, interest, difficulty;
  
  try {
    const body = await req.json();
    subject = body.subject;
    topic = body.topic;
    interest = body.interest;
    difficulty = body.difficulty || "medium";

    // Interest-specific quiz context
    const interestQuizContext = {
      gaming: "Use gaming scenarios: optimizing netcode, reducing input lag, managing game state, handling multiplayer sync, asset loading, frame pacing, server tick rates, client prediction",
      music: "Use music production scenarios: reducing audio latency, managing buffer sizes, processing audio signals, handling MIDI timing, mixing multiple tracks, sample rate conversion",
      football: "Use football tactics: coordinating team movements, managing possession, executing formations, timing counter-attacks, defensive organization, passing patterns",
      cooking: "Use cooking scenarios: timing multiple dishes, managing heat zones, coordinating ingredients, flavor development, texture control, plating sequence",
      anime: "Use anime production: frame timing, scene transitions, animation flow, episode pacing, visual storytelling, production pipeline",
      movies: "Use filmmaking: shot sequencing, editing rhythm, scene transitions, visual effects timing, sound synchronization, post-production workflow"
    };

    const quizContext = interestQuizContext[interest] || `${interest} scenarios`;

    const systemPrompt = `You are an expert quiz creator for ${subject}. Create questions using SPECIFIC ${interest} terminology and scenarios.`;

    const userMessage = `Create a quiz question about "${topic}" in ${subject} for a ${interest} enthusiast.

CRITICAL: Frame the question using this ${interest} context: ${quizContext}

Requirements:
- Difficulty: ${difficulty}
- Question MUST use specific ${interest} terminology
- All options should reference ${interest} concepts
- Make it feel like a real ${interest} problem
- Test deep understanding, not memorization

Example for gaming + CPU Scheduling:
Question: "Your game engine runs physics at 50Hz (fixed timestep) and rendering at variable FPS. Which CPU scheduling algorithm best prevents physics lag spikes when rendering drops to 30 FPS?"
A: Round-robin with equal time slices (WRONG - doesn't prioritize)
B: Priority scheduling with physics thread at higher priority (CORRECT)
C: First-come-first-served (WRONG - no prioritization)
D: Shortest job first (WRONG - unpredictable timing)

Format as JSON:
{
  "question": "Question with ${interest} terms",
  "options": {
    "A": "Option with ${interest} reference",
    "B": "Option with ${interest} reference",
    "C": "Option with ${interest} reference",
    "D": "Option with ${interest} reference"
  },
  "correct": "B",
  "explanation": "Explanation using ${interest} terminology"
}`;

    const response = await groqChat(
      [{ role: "user", content: userMessage }],
      systemPrompt
    );

    // Try to parse JSON from response
    let quizData;
    try {
      // Extract JSON from response if it's wrapped in text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      // Fallback quiz if parsing fails
      quizData = {
        question: `How would you apply ${topic} in a real-world ${interest} scenario?`,
        options: {
          A: "By understanding the core principles and adapting them",
          B: "By memorizing all the details",
          C: "By ignoring the theoretical aspects",
          D: "By only focusing on one aspect",
        },
        correct: "A",
        explanation: `${topic} is best applied by understanding core principles and adapting them to specific contexts, especially in ${interest}.`,
      };
    }

    return Response.json({
      quiz: quizData,
      success: true,
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    
    // Fallback quiz (use already parsed values)
    return Response.json({
      quiz: {
        question: `What is the main purpose of ${topic} in ${subject}?`,
        options: {
          A: "To make systems more efficient and organized",
          B: "To make things more complicated",
          C: "To slow down processes",
          D: "To replace human decision-making",
        },
        correct: "A",
        explanation: `${topic} is designed to improve efficiency and organization in ${subject} systems.`,
      },
      success: false,
      error: "Using fallback quiz",
    });
  }
}

// Made with Bob
