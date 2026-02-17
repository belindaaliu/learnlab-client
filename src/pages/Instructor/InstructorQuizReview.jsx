import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  Calendar,
  Award,
  User,
  BookOpen,
  Check,
  X
} from "lucide-react";
import toast from 'react-hot-toast';

export default function InstructorQuizReview() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("accessToken");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [student, setStudent] = useState(null);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    fetchQuizAttempt();
  }, [attemptId]);

  const fetchQuizAttempt = async () => {
    try {
      setLoading(true);
      
      // Fetch quiz attempt details
      const response = await axios.get(
        `${API_URL}/instructor/quiz-review/${attemptId}`,
        config
      );
      
      setAttempt(response.data);
      setStudent(response.data.student);
      setCourse(response.data.course);
      
    } catch (error) {
      console.error("Error fetching quiz attempt:", error);
      if (error.response?.status === 403) {
        toast.error("You don't have permission to view this quiz attempt");
        navigate("/instructor/courses");
      }else {
        toast.error("Failed to load quiz details. Please try again.");}
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz review...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Attempt Not Found</h2>
          <p className="text-gray-600 mb-6">The quiz attempt you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link to="/instructor/dashboard" className="hover:text-purple-600">
                  Dashboard
                </Link>
                <span>›</span>
                <Link to="/instructor/courses" className="hover:text-purple-600">
                  Courses
                </Link>
                <span>›</span>
                {course && (
                  <>
                    <Link 
                      to={`/instructor/courses/${course.id}/students`} 
                      className="hover:text-purple-600"
                    >
                      {course.title}
                    </Link>
                    <span>›</span>
                  </>
                )}
                {student && (
                  <>
                    <Link 
                      to={`/instructor/courses/${course?.id}/students/${student.id}/progress`}
                      className="hover:text-purple-600"
                    >
                      {student.name}
                    </Link>
                    <span>›</span>
                  </>
                )}
                <span className="text-gray-900">Quiz Review</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                {attempt.quiz_title}
              </h1>
              <p className="text-sm text-gray-500">
                Reviewing attempt from {formatDate(attempt.completed_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student & Quiz Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-2 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                {student?.photo ? (
                  <img
                    src={student.photo}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-purple-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Student</p>
                <p className="font-semibold text-gray-900">{student?.name}</p>
                <p className="text-xs text-gray-500">{student?.email}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Award className="w-4 h-4" />
                Score
              </p>
              <p className={`text-2xl font-bold ${
                attempt.passed ? 'text-green-600' : 'text-red-600'
              }`}>
                {attempt.score}%
              </p>
              <p className="text-xs text-gray-500">
                {attempt.correct_answers}/{attempt.total_questions} correct
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Time Taken
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {formatTime(attempt.time_taken)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Completed
              </p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(attempt.completed_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Results Summary Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Results Summary</h3>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 font-medium">Correct</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-700">{attempt.correct_answers}</p>
              <p className="text-xs text-green-600 mt-1">
                {Math.round((attempt.correct_answers / attempt.total_questions) * 100)}% of total
              </p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-700 font-medium">Incorrect</span>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-700">
                {attempt.total_questions - attempt.correct_answers}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {Math.round(((attempt.total_questions - attempt.correct_answers) / attempt.total_questions) * 100)}% of total
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 font-medium">Passing Score</span>
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-700">55%</p>
              <p className="text-xs text-blue-600 mt-1">
                {attempt.passed ? 'Student passed' : 'Student failed'}
              </p>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Question Review</h3>
            <p className="text-sm text-gray-500 mt-1">
              Review each question and the student's answer
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {attempt.questions?.map((question, index) => (
              <div key={question.id} className="p-6 hover:bg-gray-50">
                <div className="flex gap-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {question.is_correct ? (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                  </div>
                  
                  {/* Question Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-base font-medium text-gray-900">
                        Question {index + 1}: {question.question_text}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                        {question.question_type === 'mcq' ? 'Multiple Choice' : 
                         question.question_type === 'truefalse' ? 'True/False' : 'Text Answer'}
                      </span>
                    </div>
                    
                    {/* Student's Answer */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-1">Student's Answer:</p>
                      {question.user_answer ? (
                        <p className={`text-sm ${
                          question.is_correct ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {question.user_answer.selected_option_text || 
                           question.user_answer.answer_text || 
                           'No answer provided'}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No answer provided</p>
                      )}
                    </div>
                    
                    {/* Correct Answer (if wrong) */}
                    {!question.is_correct && question.correct_options && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs font-medium text-green-700 mb-1">Correct Answer:</p>
                        <p className="text-sm text-green-700">
                          {question.correct_options.map(opt => opt.option_text).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Back to Student Progress
          </button>
          <button
            onClick={() => student && course && 
              navigate(`/instructor/courses/${course.id}/students/${student.id}/progress`)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            View Full Progress
          </button>
        </div>
      </div>
    </div>
  );
}