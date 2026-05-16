import { groqChat } from "@/lib/groq";

export async function POST(req) {
  let subject, topic, interest, step;
  
  try {
    const body = await req.json();
    subject = body.subject;
    topic = body.topic;
    interest = body.interest;
    step = body.step;

    // Concrete examples with SPECIFIC terminology
    const specificExamples = {
      gaming: `"Threads are like Unreal Engine's task graph system. Your main thread runs at 60 FPS (16.67ms frame budget), while worker threads handle async tasks like texture streaming from SSD at 5GB/s. It's like how Fortnite separates its physics tick (30Hz) from rendering (120 FPS on high-end PCs) - each thread gets its own CPU core time slice. When your GPU is rendering at 144 FPS but physics runs at 60Hz, the scheduler ensures no thread starves, just like how the engine prevents hitbox desync."`,
      
      music: `"Threads are like parallel processing chains in your DAW. Your main thread handles the master bus at 48kHz sample rate, while worker threads process individual tracks with VST plugins at 64-sample buffer size (1.33ms latency). It's like how Ableton Live separates MIDI input processing (running at MIDI clock 24 PPQ) from audio rendering (running at 96kHz for high-res mixing) - each thread gets CPU cycles without causing buffer underruns. When you're mixing 50 tracks with reverb tails extending 3 seconds, the scheduler prevents audio dropouts."`,
      
      football: `"Threads are like different phases of play in a 4-2-3-1 formation. Your main thread is the defensive midfielder controlling tempo at 70% possession, while worker threads handle pressing triggers in the final third. It's like how Barcelona's tiki-taka separates build-up play (6-second passing sequences) from counter-pressing (3-second defensive transition) - each phase gets its tactical focus without disrupting team shape. When your false 9 drops deep while inverted wingers cut inside, the system ensures no positional overlap."`,
      
      cooking: `"Threads are like managing multiple burners on a commercial range. Your main thread is the protein searing at 450°F on cast iron, while worker threads handle sides - one reducing sauce at 180°F (achieving nappe consistency in 8 minutes), another blanching vegetables at 212°F for 90 seconds. It's like how a chef separates mise en place prep (julienning at 2mm thickness) from final plating (achieving 145°F internal temp for medium-rare) - each task gets attention without burning anything. When your Maillard reaction needs 2 minutes per side while your beurre blanc needs constant whisking, timing is everything."`,
      
      anime: `"Threads are like different animation layers in production. Your main thread handles keyframes at 24fps, while worker threads process in-betweens (generating 12 frames between each key). It's like how a sakuga sequence separates character animation (running at full 24fps) from background panning (running at 8fps for that cinematic feel) - each layer gets render time without dropping frames. When your impact frames need 3-frame holds while speed lines animate at 12fps, the pipeline ensures smooth playback."`,
      
      movies: `"Threads are like parallel editing tracks in DaVinci Resolve. Your main thread handles video at 24fps in Rec.709 color space, while worker threads process audio stems - dialogue at -23 LUFS, music at -16 LUFS, foley at -20 LUFS. It's like how a colorist separates primary grading (adjusting lift/gamma/gain) from secondary windows (isolating skin tones at 30-60 IRE) - each process gets GPU/CPU time without dropping frames. When you're rendering 4K ProRes 422 HQ at 220 Mbps while applying film grain at 35mm emulation, the system prevents buffer starvation."`
    };

    const example = specificExamples[interest] || `Use ${interest} terms`;

    const systemPrompt = `You are a patient AI tutor who speaks ONLY in ${interest} technical language. NO generic analogies - use SPECIFIC ${interest} terms with numbers and measurements.`;

    const userMessage = `A ${interest} expert is learning "${topic}" in ${subject}.

They didn't understand: "${step.title}: ${step.content}"

Re-explain using DIFFERENT ${interest} terminology. Follow this example style:
${example}

RULES:
1. Use SPECIFIC numbers (like "60 FPS", "48kHz", "4-2-3-1", "450°F", "24fps", "Rec.709")
2. Use ACTUAL techniques (like "texture streaming", "buffer size", "pressing triggers", "Maillard reaction", "keyframes", "color grading")
3. NO generic words like "orchestra", "team", "recipe"
4. Make it MORE technical than before

Write 2-3 paragraphs using ONLY ${interest}-specific terminology!`;

    const explanation = await groqChat(
      [{ role: "user", content: userMessage }],
      systemPrompt
    );

    return Response.json({
      explanation,
      success: true,
    });
  } catch (error) {
    console.error("Error re-explaining:", error);

    // Fallback explanation
    const fallbackExplanation = `Let me explain ${step?.title} differently!\n\nThink of it this way: In ${interest}, you need to understand the fundamentals before you can master advanced techniques. The same applies here with ${topic}.\n\nImagine you're learning a new skill in ${interest} - you start with the basics, practice them, and gradually build up to more complex moves. That's exactly how ${topic} works in ${subject}!`;

    return Response.json({
      explanation: fallbackExplanation,
      success: false,
      error: "Using fallback explanation",
    });
  }
}

// Made with Bob
