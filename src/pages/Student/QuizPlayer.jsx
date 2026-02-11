import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowLeft,
  BarChart3,
} from "lucide-react";

const QuizPlayer = ({ lessonId, courseId, onQuizComplete }) => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("accessToken");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [hasPreviousPass, setHasPreviousPass] = useState(false);

  // Use ref to track the previous lessonId
  const prevLessonIdRef = useRef(lessonId);

  // Timer effect
  useEffect(() => {
    let interval;
    if (quizStarted && !showResults && !reviewMode) {
      interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, showResults, reviewMode]);

  // Reset state when lessonId changes
  useEffect(() => {
    // Check if lessonId has actually changed
    if (prevLessonIdRef.current !== lessonId) {
      console.log(
        "Lesson ID changed from",
        prevLessonIdRef.current,
        "to",
        lessonId,
      );

      // Reset all state
      setQuizData(null);
      setCurrentQuestion(0);
      setAnswers([]);
      setTimeSpent(0);
      setLoading(true);
      setQuizStarted(false);
      setShowResults(false);
      setResults(null);
      setError(null);
      setShowSubmitConfirmation(false);
      setReviewMode(false);
      setHasPreviousPass(false);

      // Update ref
      prevLessonIdRef.current = lessonId;

      // Fetch new data
      fetchQuizData();
    } else if (!quizData) {
      // Initial load
      fetchQuizData();
    }
  }, [lessonId]);

  const fetchQuizData = async () => {
    if (!lessonId) {
      setError("No lesson ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching quiz data for lesson:", lessonId);

      const response = await axios.get(
        `${API_URL}/course-player/${courseId}/assessments/${lessonId}`,
        config,
      );

      console.log("Quiz data received:", response.data);
      setQuizData(response.data);

      // Check if user has already passed this quiz
      if (
        response.data.previous_attempt &&
        response.data.previous_attempt.score >= 55
      ) {
        setHasPreviousPass(true);
        setShowResults(true);
        // Fetch detailed results if available
        try {
          const resultsResponse = await axios.get(
            `${API_URL}/course-player/quiz-results/${response.data.previous_attempt.id}`,
            config,
          );
          setResults(resultsResponse.data);
        } catch (err) {
          console.log(
            "Could not fetch detailed results, creating basic results",
          );
          setResults({
            score: response.data.previous_attempt.score,
            correct_count: Math.round(
              (response.data.previous_attempt.score / 100) *
                response.data.total_questions,
            ),
            total_questions: response.data.total_questions,
            passed: response.data.previous_attempt.score >= 55,
            attempt_id: response.data.previous_attempt.id,
            time_taken: 0,
          });
        }
      }

      // Initialize answers array
      const initialAnswers = response.data.questions.map((question) => ({
        question_id: question.id,
        selected_option_id:
          question.previous_answer?.selected_option_id || null,
        answer_text: question.previous_answer?.answer_text || "",
        is_correct: question.previous_answer?.is_correct || false,
      }));
      setAnswers(initialAnswers);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      setError("Failed to load quiz. Please try again.");

      // If it's a 404, the backend endpoint might not exist yet
      if (error.response?.status === 404) {
        setError(
          "Quiz not found. The assessment endpoint might not be implemented yet.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimeSpent(0);
  };

  const handleSkipTest = async () => {
    try {
      // Skip to next lesson
      const nextRes = await axios.get(
        `${API_URL}/course-player/${courseId}/next`,
        config,
      );

      if (onQuizComplete && nextRes.data) {
        // Navigate to next lesson
        window.location.href = `/course/${courseId}/learn?lesson=${nextRes.data.id}`;
      } else if (onQuizComplete) {
        // No next lesson, just complete
        onQuizComplete();
      }
    } catch (error) {
      console.error("Error skipping test:", error);
      if (onQuizComplete) onQuizComplete();
    }
  };

  const handleAnswerSelect = (optionId, questionType) => {
    const newAnswers = [...answers];
    const currentQuestionId = quizData.questions[currentQuestion].id;
    const answerIndex = newAnswers.findIndex(
      (a) => a.question_id === currentQuestionId,
    );

    if (answerIndex !== -1) {
      if (questionType === "text") {
        // For text questions, we'll handle separately
        return;
      }
      newAnswers[answerIndex] = {
        ...newAnswers[answerIndex],
        selected_option_id: optionId,
      };
      setAnswers(newAnswers);
    }
  };

  const handleTextAnswerChange = (text) => {
    const newAnswers = [...answers];
    const currentQuestionId = quizData.questions[currentQuestion].id;
    const answerIndex = newAnswers.findIndex(
      (a) => a.question_id === currentQuestionId,
    );

    if (answerIndex !== -1) {
      newAnswers[answerIndex] = {
        ...newAnswers[answerIndex],
        answer_text: text,
      };
      setAnswers(newAnswers);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);
      const response = await axios.post(
        `${API_URL}/course-player/${courseId}/assessments/${lessonId}/submit`,
        {
          answers: answers,
          time_taken: timeSpent,
        },
        config,
      );

      setResults(response.data);
      setShowResults(true);
      setShowSubmitConfirmation(false);
      setReviewMode(false);

      // If passed, mark as completed but DON'T navigate away automatically
      if (response.data.passed && onQuizComplete) {
        // Call onQuizComplete to mark lesson as completed in the database
        // but stay on the results page
        onQuizComplete({
          certificateIssued: response.data.certificateIssued,
          certificateReason: response.data.certificateReason,
        });
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetakeQuiz = () => {
    setShowResults(false);
    setHasPreviousPass(false);
    setCurrentQuestion(0);
    setAnswers(
      quizData.questions.map((question) => ({
        question_id: question.id,
        selected_option_id: null,
        answer_text: "",
        is_correct: false,
      })),
    );
    setTimeSpent(0);
    setQuizStarted(true);
  };

  const handleContinueToNext = async () => {
    try {
      // Get next lesson
      const nextRes = await axios.get(
        `${API_URL}/course-player/${courseId}/next`,
        config,
      );

      if (nextRes.data) {
        // Navigate to next lesson
        window.location.href = `/course/${courseId}/learn?lesson=${nextRes.data.id}`;
      } else {
        // No next lesson, go to course overview
        window.location.href = `/student/learning`;
      }
    } catch (error) {
      console.error("Error getting next lesson:", error);
      window.location.href = `/student/learning`;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate answered questions
  const answeredQuestions = answers.filter(
    (a) => a.selected_option_id || (a.answer_text && a.answer_text.trim()),
  ).length;

  const totalQuestions = quizData?.questions.length || 0;

  // Confirmation Modal Component
  const SubmitConfirmationModal = () => {
    if (!showSubmitConfirmation) return null;

    const unansweredQuestions = totalQuestions - answeredQuestions;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          {/* Modal Header */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Are you sure you want to finish?
              </h3>
            </div>
            <p className="text-gray-600">
              You may still review the answers you have entered.
            </p>
          </div>

          {/* Stats */}
          <div className="p-6 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {answeredQuestions}
                </div>
                <div className="text-sm text-gray-600">Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {unansweredQuestions}
                </div>
                <div className="text-sm text-gray-600">Unanswered</div>
              </div>
            </div>

            {unansweredQuestions > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  You have {unansweredQuestions} unanswered question
                  {unansweredQuestions !== 1 ? "s" : ""}. Are you sure you want
                  to submit?
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 flex gap-3">
            <button
              onClick={() => {
                setShowSubmitConfirmation(false);
                setReviewMode(true);
                setCurrentQuestion(0);
              }}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Review Questions
            </button>
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Finish Test"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Quiz Results Component (Reusable)
  const QuizResultsScreen = ({ results, isPreviousPass = false }) => {
    const percentage = results.score;
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="h-full bg-white p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {isPreviousPass && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <p className="text-blue-700 font-medium">
                  You have already passed this quiz on{" "}
                  {new Date(
                    results.completed_at || Date.now(),
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {isPreviousPass ? "Quiz Results" : "Quiz Completed"}
            </h1>

            <div className="flex justify-center mb-8">
              <div className="relative">
                <svg width="180" height="180">
                  <circle
                    stroke="#e5e7eb"
                    fill="transparent"
                    strokeWidth="12"
                    r={radius}
                    cx="90"
                    cy="90"
                  />
                  <circle
                    stroke={results.passed ? "#10b981" : "#ef4444"}
                    fill="transparent"
                    strokeWidth="12"
                    strokeLinecap="round"
                    r={radius}
                    cx="90"
                    cy="90"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 90 90)"
                  />
                  <text
                    x="90"
                    y="100"
                    textAnchor="middle"
                    fontSize="32"
                    fontWeight="bold"
                    fill={results.passed ? "#10b981" : "#ef4444"}
                  >
                    {results.score}%
                  </text>
                </svg>
              </div>
            </div>

            <div className="mb-8">
              <div
                className={`inline-block px-6 py-2 rounded-full text-lg font-semibold ${
                  results.passed
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {results.passed ? "PASSED" : "FAILED"}
              </div>
              <p className="text-gray-600 mt-2">
                {results.correct_count} out of {results.total_questions}{" "}
                questions correct
              </p>
              <p className="text-gray-600">
                {!isPreviousPass &&
                  `Time taken: ${formatTime(results.time_taken || timeSpent)}`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.correct_count}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {results.total_questions - results.correct_count}
                </div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {results.total_questions}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              {!isPreviousPass && (
                <>
                  <button
                    onClick={handleRetakeQuiz}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Retake Test
                  </button>

                  <button
                    onClick={() => {
                      navigate(`/quiz-review/${results.attempt_id}`);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Review Questions
                  </button>
                </>
              )}

              <button
                onClick={handleContinueToNext}
                className={`px-6 py-3 rounded-lg font-medium ${
                  results.passed
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {results.passed ? "Continue" : "Skip to Next"}
              </button>

              {isPreviousPass && (
                <button
                  onClick={() => {
                    navigate(`/quiz-review/${results.attempt_id}`);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Review Questions
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-xs text-gray-500 mb-4">
            Lesson ID: {lessonId} | Course ID: {courseId}
          </div>
          <button
            onClick={fetchQuizData}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600">Quiz data not available</p>
          <button
            onClick={fetchQuizData}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If user has already passed, show results screen
  if (hasPreviousPass && results) {
    return <QuizResultsScreen results={results} isPreviousPass={true} />;
  }

  // If quiz is completed and results are available
  if (showResults && results) {
    return <QuizResultsScreen results={results} isPreviousPass={false} />;
  }

  // Quiz Intro Screen (only shown if not already passed and not started)
  if (!quizStarted && !hasPreviousPass) {
    return (
      <div className="h-full bg-white p-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {quizData.title || "Assessment"}
            </h1>

            {/* Quiz Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Quiz Progress
                </span>
                <span className="text-sm text-gray-500">
                  55% required to pass
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-300"
                  style={{ width: `${quizData.previous_attempt?.score || 0}%` }}
                />
              </div>
              {quizData.previous_attempt && (
                <p className="text-xs text-gray-500 mt-1 text-right">
                  Previous attempt: {quizData.previous_attempt.score}%
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {quizData.total_questions}
                  </div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">1</div>
                  <div className="text-sm text-gray-600">Hour</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">55%</div>
                  <div className="text-sm text-gray-600">Required</div>
                </div>
              </div>

              {quizData.instructions && (
                <div className="text-left mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Instructions:
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {quizData.instructions}
                  </p>
                </div>
              )}

              {quizData.previous_attempt && !hasPreviousPass && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
                  <p className="text-yellow-800">
                    You previously scored{" "}
                    <span className="font-bold">
                      {quizData.previous_attempt.score}%
                    </span>
                    on{" "}
                    {new Date(
                      quizData.previous_attempt.completed_at,
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleSkipTest}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Skip Test
              </button>
              <button
                onClick={handleStartQuiz}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
              >
                Begin Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz Screen (Normal or Review Mode)
  const question = quizData.questions[currentQuestion];
  const currentAnswer = answers.find((a) => a.question_id === question.id);

  return (
    <>
      <SubmitConfirmationModal />

      <div className="h-full bg-white flex flex-col">
        {/* Quiz Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {quizData.title}
              </h2>
              <p className="text-sm text-gray-600">
                {reviewMode ? "Review Mode - " : ""}
                Question {currentQuestion + 1} of {quizData.questions.length}
              </p>
            </div>
            {!reviewMode && (
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {formatTime(timeSpent)}
                </div>
                <div className="text-sm text-gray-600">Time elapsed</div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              {reviewMode && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Review Mode:</strong> You can review and change your
                    answers before submitting.
                  </p>
                </div>
              )}

              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {question.question_text}
              </h3>

              {question.question_type === "mcq" ||
              question.question_type === "truefalse" ? (
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        currentAnswer?.selected_option_id === option.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        handleAnswerSelect(option.id, question.question_type)
                      }
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                            currentAnswer?.selected_option_id === option.id
                              ? "border-purple-500 bg-purple-500"
                              : "border-gray-300"
                          }`}
                        >
                          {currentAnswer?.selected_option_id === option.id && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="text-gray-900">
                          {option.option_text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Text question
                <div>
                  <textarea
                    value={currentAnswer?.answer_text || ""}
                    onChange={(e) => handleTextAnswerChange(e.target.value)}
                    className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Type your answer here..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentQuestion === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              ← Previous
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {answeredQuestions} of {quizData.questions.length} answered
              </span>

              {reviewMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setReviewMode(false);
                      setShowSubmitConfirmation(false);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Back to Quiz
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Finish Test"}
                  </button>
                </div>
              ) : currentQuestion === quizData.questions.length - 1 ? (
                <button
                  onClick={() => setShowSubmitConfirmation(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizPlayer;
