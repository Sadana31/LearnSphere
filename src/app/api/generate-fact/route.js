import { groqChat } from "@/lib/groq";

export async function POST(req) {
  try {
    const { topic, type } = await req.json(); // type: 'subject' or 'interest'

    const systemPrompt = `You are a fun fact generator. Create ONE interesting, mind-blowing fact that's easy to understand.

Rules:
1. Keep it SHORT - max 25 words
2. Make it FASCINATING and surprising
3. Use simple, everyday language
4. Include a specific number or detail
5. Make it sound exciting!`;

    const userMessage = type === 'subject'
      ? `Generate ONE amazing fact about ${topic} that will blow someone's mind. Make it short, specific, and exciting!`
      : `Generate ONE cool fact about how ${topic} relates to technology or science. Make it short and fascinating!`;

    const response = await groqChat(
      [{ role: "user", content: userMessage }],
      systemPrompt
    );

    // Clean up the response
    let fact = response.trim();
    
    // Remove quotes if present
    fact = fact.replace(/^["']|["']$/g, '');
    
    // Remove "Did you know" or similar prefixes
    fact = fact.replace(/^(Did you know that |Fun fact: |Interesting: )/i, '');
    
    // Ensure it ends with punctuation
    if (!/[.!?]$/.test(fact)) {
      fact += '!';
    }

    return Response.json({
      fact,
      success: true
    });
  } catch (error) {
    console.error("Error generating fact:", error);
    
    // Fallback facts
    const fallbacks = [
      "Your brain processes information faster than the fastest computer!",
      "There are more possible chess games than atoms in the universe!",
      "A single ray of light takes 8 minutes to travel from the Sun to Earth!",
      "Your smartphone has more computing power than NASA had in 1969!",
      "The human eye can distinguish about 10 million different colors!"
    ];
    
    return Response.json({
      fact: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      success: false,
      error: error.message
    });
  }
}

// Made with Bob
