import { groqChat } from "@/lib/groq";

export async function POST(req) {
  try {
    const { messages, subject, topic, interest } = await req.json();

    // Simple, relatable examples
    const chatExamples = {
      gaming: `Example: "Think of it like your game inventory. When you collect 5 health potions, you're storing them in a list. Each potion has a spot - potion 1, potion 2, etc. When you use one, the game checks your list and removes it. Simple!"`,
      
      music: `Example: "Think of it like your playlist. When you add songs, they go in order - song 1, song 2, song 3. When you hit play, the app goes through each song one by one. That's how it works!"`,
      
      football: `Example: "Think of it like your team lineup. You have 11 players in order - goalkeeper, defenders, midfielders, forwards. When the coach calls names, they go through the list one by one. Easy!"`,
      
      cooking: `Example: "Think of it like a recipe. You follow steps in order - chop onions, heat oil, add spices. You do each step one by one until you're done. That's the idea!"`,
      
      anime: `Example: "Think of it like your watch list. You add shows in order - show 1, show 2, show 3. When you watch, you go through each one. Simple as that!"`,
      
      movies: `Example: "Think of it like your Netflix queue. You add movies in order - movie 1, movie 2, movie 3. When you watch, you go through each one. That's how it works!"`
    };

    const example = chatExamples[interest] || `Use simple ${interest} examples`;

    const systemPrompt = `You are a friendly tutor helping someone learn ${subject} using ${interest} examples.

IMPORTANT: Keep answers SIMPLE and SHORT. No complex jargon!

Example style to follow:
${example}

Rules for EVERY response:
1. Use simple ${interest} examples (like "your game inventory", "your playlist", "team lineup")
2. Explain in 2-3 short sentences
3. Use everyday words - NO technical jargon
4. Use "like" and "think of it as" comparisons
5. Keep it under 100 words
6. Make it feel like explaining to a friend`;

    // Extract only the message content for the API
    const chatMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await groqChat(chatMessages, systemPrompt);

    return Response.json({
      response,
      success: true,
    });
  } catch (error) {
    console.error("Error in chatbot:", error);

    // Fallback response
    return Response.json({
      response:
        "I apologize, but I'm having trouble connecting right now. Could you please rephrase your question? I'm here to help you understand the concepts better!",
      success: false,
      error: error.message,
    });
  }
}

// Made with Bob
