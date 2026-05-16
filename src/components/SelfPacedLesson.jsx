"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SelfPacedLesson({
  topic,
  subject,
  interest,
  onComplete,
  onBack,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [lessonContent, setLessonContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadLesson();
  }, [topic, subject, interest]);

  const loadLesson = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.label,
          topic,
          interest,
        }),
      });

      const data = await res.json();
      setLessonContent(data.steps || []);
    } catch (error) {
      console.error("Error loading lesson:", error);
      // Fallback content
      setLessonContent([
        {
          title: "Introduction",
          content: `Let's learn about ${topic} in ${subject.label}!`,
          type: "intro",
        },
        {
          title: "Core Concept",
          content: `${topic} is an important concept that helps us understand how systems work.`,
          type: "concept",
        },
        {
          title: "Real-World Example",
          content: `Think of ${topic} like organizing a ${interest} event - everything needs to work together smoothly.`,
          type: "example",
        },
        {
          title: "Key Takeaway",
          content: `Remember: ${topic} is all about coordination and efficiency!`,
          type: "summary",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < lessonContent.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExplainAgain = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/explain-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.label,
          topic,
          interest,
          step: lessonContent[currentStep],
        }),
      });

      const data = await res.json();
      const updatedContent = [...lessonContent];
      updatedContent[currentStep] = {
        ...updatedContent[currentStep],
        content: data.explanation,
      };
      setLessonContent(updatedContent);
    } catch (error) {
      console.error("Error re-explaining:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { role: "user", content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
          subject: subject.label,
          topic,
          interest,
          context: lessonContent[currentStep],
        }),
      });

      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading && lessonContent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
        <p className="mt-6 text-white/60 text-lg">
          Preparing your personalized lesson...
        </p>
      </div>
    );
  }

  const currentContent = lessonContent[currentStep];
  const progress = ((currentStep + 1) / lessonContent.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">
            Step {currentStep + 1} of {lessonContent.length}
          </span>
          <span className="text-sm text-white/60">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-orange-500 to-cyan-500"
          />
        </div>
      </div>

      {/* Content Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl">{subject.emoji}</span>
            <div>
              <h2 className="text-3xl font-black text-white">
                {currentContent?.title}
              </h2>
              <p className="text-white/50">{topic}</p>
            </div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none mb-8">
            <p className="text-white/90 leading-relaxed text-lg whitespace-pre-wrap">
              {currentContent?.content}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleNext}
              className="flex-1 min-w-[200px] px-8 py-4 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all"
            >
              {currentStep < lessonContent.length - 1
                ? "I'm Ready, Next →"
                : "Complete Lesson ✓"}
            </button>

            <button
              onClick={handleExplainAgain}
              disabled={loading}
              className="px-8 py-4 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all disabled:opacity-50"
            >
              {loading ? "Loading..." : "Explain Again 🔄"}
            </button>

            <button
              onClick={() => setShowChatbot(!showChatbot)}
              className="px-8 py-4 bg-purple-500/20 border border-purple-500/40 rounded-2xl font-bold hover:bg-purple-500/30 transition-all"
            >
              {showChatbot ? "Hide Chat" : "Ask Question 💬"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Inline Chatbot */}
      <AnimatePresence>
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-purple-500/20 rounded-3xl p-6 mb-6 overflow-hidden"
          >
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <span>💬</span>
              Ask Me Anything
            </h3>

            <div className="max-h-[300px] overflow-y-auto mb-4 space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-white/50 text-center py-4">
                  Ask me anything about this step!
                </p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-orange-500 to-cyan-500 text-white"
                          : "bg-white/10 text-white/90 border border-white/10"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          className="w-2 h-2 bg-cyan-500 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
                placeholder="Type your question..."
                className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              <button
                onClick={handleAskQuestion}
                disabled={!chatInput.trim() || chatLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-4">
        {currentStep > 0 && (
          <button
            onClick={handlePrevious}
            className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all"
          >
            ← Previous Step
          </button>
        )}
        <button
          onClick={onBack}
          className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all ml-auto"
        >
          Back to Topics
        </button>
      </div>
    </div>
  );
}

// Made with Bob
