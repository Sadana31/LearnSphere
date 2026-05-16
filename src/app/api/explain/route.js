import { geminiChat } from "@/lib/gemini";

export async function POST(req) {
  let subject, topic, interest;
  
  try {
    const body = await req.json();
    subject = body.subject;
    topic = body.topic;
    interest = body.interest;

    const systemPrompt = `You are an expert AI tutor specializing in ${subject}. Your teaching style is:
1. Use analogies and examples related to ${interest} to make concepts relatable
2. Break down complex topics into simple, digestible explanations
3. Use storytelling and real-world scenarios
4. Be encouraging and enthusiastic
5. Include practical examples and applications
6. Use emojis sparingly to make content engaging

Your goal is to make ${topic} easy to understand by connecting it to ${interest}.`;

    const userMessage = `Explain "${topic}" in ${subject} using analogies and examples from ${interest}. 

Structure your explanation as follows:
1. Start with a relatable hook connecting to ${interest}
2. Explain the core concept in simple terms
3. Provide a detailed analogy using ${interest}
4. Give a real-world application example
5. End with a key takeaway

Make it engaging, clear, and memorable. Use around 300-400 words.`;

    const explanation = await geminiChat(
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
