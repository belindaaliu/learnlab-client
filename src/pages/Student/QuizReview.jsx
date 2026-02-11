import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, HelpCircle, BookOpen, ClipboardCheck } from "lucide-react";

const QuizReview = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("accessToken");
  
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(0);

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/course-player/quiz-results/${attemptId}`,
        config
      );
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching quiz results:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading review...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Results not found</p>
        </div>
      </div>
    );
  }

  const question = results.questions[activeQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Course and Quiz Info */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col space-y-4">
            {/* Top row: Back button and score */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
                
                {/* Score Display */}
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  results.passed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  Score: {results.score}%
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {results.correct_count} out of {results.total_questions} correct
                </div>
                <div className="text-xs text-gray-500">
                  {results.passed ? 'PASSED' : 'NOT PASSED'} • {results.passing_score}% required
                </div>
              </div>
            </div>

            {/* Course and Quiz Info */}
            <div className="border-t pt-4">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ClipboardCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{results.course_title || 'Course'}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {results.quiz_title || 'Quiz Review'}
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Review your answers and learn from your mistakes
                  </p>
                </div>
                
                {results.course_id && (
                  <button
                    onClick={() => navigate(`/course/${results.course_id}/learn`)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                  >
                    Return to Course
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your component remains the same */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Questions</h3>
                <span className="text-sm text-gray-600">
                  {activeQuestion + 1} of {results.questions.length}
                </span>
              </div>
              <div className="space-y-2">
                {results.questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestion(index)}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition ${
                      activeQuestion === index
                        ? 'bg-purple-50 border border-purple-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center">
                      {q.user_answer?.is_correct ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      ) : q.user_answer ? (
                        <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      ) : (
                        <HelpCircle className="w-5 h-5 text-gray-400 mr-2" />
                      )}
                      <span className="text-gray-700">Question {index + 1}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      q.user_answer?.is_correct
                        ? 'bg-green-100 text-green-800'
                        : q.user_answer
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {q.user_answer?.is_correct ? 'Correct' : q.user_answer ? 'Incorrect' : 'Not answered'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Question Header */}
              <div className={`p-6 border-b ${
                question.user_answer?.is_correct
                  ? 'bg-green-50 border-green-200'
                  : question.user_answer
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question {activeQuestion + 1}
                    </h3>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                      question.user_answer?.is_correct
                        ? 'bg-green-100 text-green-800'
                        : question.user_answer
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {question.user_answer?.is_correct ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Correct
                        </>
                      ) : question.user_answer ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          Incorrect
                        </>
                      ) : (
                        <>
                          <HelpCircle className="w-4 h-4" />
                          Not answered
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Points: {question.user_answer?.is_correct ? '1' : '0'}
                  </div>
                </div>
                <p className="text-gray-900 text-lg">{question.question_text}</p>
              </div>

              {/* Answers */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Correct Answer(s) */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Correct Answer{question.correct_options.length > 1 ? 's' : ''}
                    </h4>
                    <div className="space-y-2">
                      {question.correct_options.map(option => (
                        <div
                          key={option.id}
                          className="p-4 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <p className="text-green-800">{option.option_text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* User's Answer */}
                  {question.user_answer && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        {question.user_answer.is_correct ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Your Answer (Correct)
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-500" />
                            Your Answer
                          </>
                        )}
                      </h4>
                      <div className={`p-4 rounded-lg ${
                        question.user_answer.is_correct
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        {question.question_type === 'text' ? (
                          <p className="text-gray-900">{question.user_answer.answer_text}</p>
                        ) : (
                          <p className="text-gray-900">{question.user_answer.selected_option_text}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Explanation (if available) */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
                    <p className="text-blue-800">
                      {question.user_answer?.is_correct 
                        ? "Great job! You selected the correct answer."
                        : "Review this question to understand why the correct answer is important for this topic."
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="border-t p-4 bg-gray-50">
                <div className="flex justify-between">
                  <button
                    onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
                    disabled={activeQuestion === 0}
                    className="px-4 py-2 text-gray-700 disabled:opacity-50 hover:bg-white rounded-lg transition"
                  >
                    ← Previous Question
                  </button>
                  <button
                    onClick={() => setActiveQuestion(prev => 
                      Math.min(results.questions.length - 1, prev + 1)
                    )}
                    disabled={activeQuestion === results.questions.length - 1}
                    className="px-4 py-2 text-gray-700 disabled:opacity-50 hover:bg-white rounded-lg transition"
                  >
                    Next Question →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizReview;