"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function ExplanationCard({
  topic,
  explanation,
  loading,
  subject,
  onMarkComplete,
  onNext,
  isCompleted,
}) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const loadQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const interest = localStorage.getItem("interest") || "general topics";
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.label,
          topic,
          interest,
          difficulty: "medium",
        }),
      });
      const data = await res.json();
      setQuizData(data.quiz);
    } catch (error) {
      console.error("Error loading quiz:", error);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleQuizStart = () => {
    setShowQuiz(true);
    if (!quizData) {
      loadQuiz();
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    if (selectedAnswer === quizData.correct) {
      onMarkComplete();
    }
  };

  const handleQuizReset = () => {
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setShowQuiz(false);
    setQuizData(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
        <p className="mt-6 text-white/60 text-lg">
          Generating personalized explanation...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Topic Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{subject.emoji}</span>
          <div>
            <h2 className="text-4xl font-black">{topic}</h2>
            <p className="text-white/50 text-lg">{subject.label}</p>
          </div>
        </div>
      </div>

      {/* Explanation Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-6"
      >
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="whitespace-pre-wrap text-white/90 leading-relaxed">
            {explanation}
          </div>
        </div>
      </motion.div>

      {/* Interactive Practice Section */}
      {!showQuiz ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-500/10 to-cyan-500/10 backdrop-blur-md border border-orange-500/20 rounded-3xl p-8 mb-6"
        >
          <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
            <span>🎯</span>
            Test Your Understanding
          </h3>
          <p className="text-white/70 mb-6">
            Ready to check if you've grasped the concept? Take a quick AI-generated quiz!
          </p>
          <button
            onClick={handleQuizStart}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all"
          >
            Start Quiz →
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-purple-500/20 rounded-3xl p-8 mb-6"
        >
          <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
            <span>💡</span>
            Quiz Time
          </h3>

          {loadingQuiz ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
              />
              <p className="ml-4 text-white/60">Generating quiz question...</p>
            </div>
          ) : quizData ? (
            <>
              <p className="text-white/90 mb-6 text-lg font-medium">
                {quizData.question}
              </p>

              <div className="space-y-3 mb-6">
                {Object.entries(quizData.options).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => !quizSubmitted && setSelectedAnswer(key)}
                    disabled={quizSubmitted}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      quizSubmitted
                        ? key === quizData.correct
                          ? "bg-green-500/20 border-green-500 text-white"
                          : key === selectedAnswer
                          ? "bg-red-500/20 border-red-500 text-white"
                          : "bg-white/5 border-white/10 text-white/50"
                        : selectedAnswer === key
                        ? "bg-purple-500/20 border-purple-500 text-white"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30"
                    }`}
                  >
                    <span className="font-bold mr-3">{key}.</span>
                    {value}
                  </button>
                ))}
              </div>

              {quizSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-2xl mb-6 ${
                    selectedAnswer === quizData.correct
                      ? "bg-green-500/20 border-2 border-green-500/40"
                      : "bg-red-500/20 border-2 border-red-500/40"
                  }`}
                >
                  <p className="text-white font-bold text-lg mb-2">
                    {selectedAnswer === quizData.correct
                      ? "🎉 Correct! Well done!"
                      : "❌ Not quite right"}
                  </p>
                  <p className="text-white/90">{quizData.explanation}</p>
                </motion.div>
              )}

              <div className="flex gap-4">
                {!quizSubmitted ? (
                  <>
                    <button
                      onClick={handleQuizSubmit}
                      disabled={!selectedAnswer}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all"
                    >
                      Submit Answer
                    </button>
                    <button
                      onClick={handleQuizReset}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all"
                    >
                      Skip
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleQuizReset}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all"
                  >
                    Try Another Question
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-white/60 text-center py-8">
              Failed to load quiz. Please try again.
            </p>
          )}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onNext}
          className="flex-1 px-8 py-5 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-2xl font-bold text-lg hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] transition-all"
        >
          {isCompleted ? "Choose Another Topic" : "Next Topic"} →
        </button>
        
        {!isCompleted && (
          <button
            onClick={onMarkComplete}
            className="px-8 py-5 bg-white/10 border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
          >
            Mark Complete ✓
          </button>
        )}
      </div>

      {/* Key Takeaways */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl"
      >
        <h4 className="text-lg font-bold mb-3 text-cyan-400">💡 Pro Tip</h4>
        <p className="text-white/70">
          Use the AI chatbot (top right) to ask follow-up questions about {topic} or request more examples!
        </p>
      </motion.div>
    </motion.div>
  );
}

// Made with Bob
