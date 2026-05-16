import { groqChat } from "@/lib/groq";

export async function POST(req) {
  let subject, topic, interest;
  
  try {
    const body = await req.json();
    subject = body.subject;
    topic = body.topic;
    interest = body.interest;

    const systemPrompt = `You are a friendly tutor specializing in ${subject}. Keep explanations SIMPLE and SHORT.

Your teaching style:
1. Use ${interest} analogies that anyone can understand
2. Use everyday language - NO jargon
3. Keep it under 200 words
4. Make it fun and relatable
5. Use "like" and "think of it as" comparisons

Your goal is to make ${topic} easy to understand using ${interest}.`;

    const userMessage = `Explain "${topic}" in ${subject} using simple ${interest} analogies.

Structure (keep SHORT):
1. Start with a ${interest} hook (1 sentence)
2. Explain the concept simply (2-3 sentences)
3. Give a ${interest} analogy (2-3 sentences)
4. Real-world example (1-2 sentences)
5. Key takeaway (1 sentence)

Keep it under 200 words total. Use simple, everyday language.`;

    const explanation = await groqChat(
      [{ role: "user", content: userMessage }],
      systemPrompt
    );

    return Response.json({
      explanation,
      success: true,
    });
  } catch (error) {
    console.error("Error generating explanation:", error);
    
    // Fallback explanation (use already parsed values)
    const fallbackExplanation = `# ${topic} in ${subject}

Let me explain ${topic} using ${interest} as an analogy!

## The Core Concept
${topic} is a fundamental concept in ${subject} that helps us understand how systems work together efficiently.

## The ${interest} Connection
Think of ${topic} like organizing a ${interest} event. Just as you need coordination, timing, and proper resource management in ${interest}, ${topic} requires similar principles in computer systems.

## Real-World Application
In practice, ${topic} is used everywhere - from the apps on your phone to large-scale systems. Understanding this concept helps you build better, more efficient solutions.

## Key Takeaway
Master ${topic} and you'll have a powerful tool in your ${subject} toolkit. It's all about understanding the patterns and applying them creatively!

💡 **Pro Tip**: Try to identify ${topic} patterns in your daily ${interest} activities - you'll be surprised how often they appear!`;

    return Response.json({
      explanation: fallbackExplanation,
      success: false,
      error: "Using fallback explanation",
    });
  }
}

// Made with Bob
