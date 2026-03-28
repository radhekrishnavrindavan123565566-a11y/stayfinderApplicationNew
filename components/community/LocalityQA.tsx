"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Plus, ChevronDown, ChevronUp, ThumbsUp, Send } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Answer {
  _id: string;
  userId: { username: string; avatar?: string };
  answer: string;
  upvotes: number;
  createdAt: string;
}

interface Question {
  _id: string;
  question: string;
  askedBy: { username: string; avatar?: string };
  answers: Answer[];
  createdAt: string;
}

interface Props {
  city: string;
  locality: string;
}

export default function LocalityQA({ city, locality }: Props) {
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  const load = () => {
    axios.get(`/api/community/locality-qa?city=${encodeURIComponent(city)}&locality=${encodeURIComponent(locality)}`)
      .then(({ data }) => setQuestions(data.data.questions))
      .catch(() => {});
  };

  useEffect(() => { load(); }, [city, locality]);

  const askQuestion = async () => {
    if (!newQuestion.trim()) return;
    setSubmitting(true);
    try {
      await axios.post("/api/community/locality-qa", { city, locality, question: newQuestion }, authHeaders());
      toast.success("Question posted!");
      setNewQuestion("");
      load();
    } catch {
      toast.error("Failed to post question");
    } finally {
      setSubmitting(false);
    }
  };

  const postAnswer = async (questionId: string) => {
    const answer = answerInputs[questionId]?.trim();
    if (!answer) return;
    try {
      await axios.post("/api/community/locality-qa", { answerId: questionId, answer }, authHeaders());
      toast.success("Answer posted!");
      setAnswerInputs((p) => ({ ...p, [questionId]: "" }));
      load();
    } catch {
      toast.error("Failed to post answer");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-zinc-900 dark:text-white">Community Q&A</span>
          <span className="text-sm text-zinc-500">{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {/* Ask question */}
              {user && (
                <div className="flex gap-2 mb-4">
                  <input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                    placeholder="Ask something about this locality..."
                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-600 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={askQuestion}
                    disabled={submitting || !newQuestion.trim()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" /> Ask
                  </motion.button>
                </div>
              )}

              {questions.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-4">No questions yet. Be the first to ask!</p>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <motion.div
                      key={q._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border border-zinc-100 dark:border-zinc-700 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedQ(expandedQ === q._id ? null : q._id)}
                        className="w-full flex items-start justify-between p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">{q.question}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {q.askedBy.username} · {format(new Date(q.createdAt), "MMM d")} · {q.answers.length} answer{q.answers.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {expandedQ === q._id ? <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />}
                      </button>

                      <AnimatePresence>
                        {expandedQ === q._id && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-3">
                              {q.answers.map((a) => (
                                <div key={a._id} className="flex gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-500 flex-shrink-0 mt-0.5">
                                    {a.userId.username[0].toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{a.userId.username}</p>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{a.answer}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <ThumbsUp className="w-3 h-3 text-zinc-400" />
                                      <span className="text-xs text-zinc-400">{a.upvotes}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {user && (
                                <div className="flex gap-2 mt-2">
                                  <input
                                    value={answerInputs[q._id] || ""}
                                    onChange={(e) => setAnswerInputs((p) => ({ ...p, [q._id]: e.target.value }))}
                                    onKeyDown={(e) => e.key === "Enter" && postAnswer(q._id)}
                                    placeholder="Write an answer..."
                                    className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-600 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  />
                                  <button
                                    onClick={() => postAnswer(q._id)}
                                    className="p-1.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
