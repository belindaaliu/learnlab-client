import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  PieChart,
  BarChart3,
  Activity,
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  Search,
  PlayCircle,
  FileText,
  HelpCircle,
  Zap,
  Target,
  Percent,
  Star
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import "jspdf-autotable";
import html2canvas from "html2canvas";
import { useRef } from "react";
import toast from "react-hot-toast";

export default function StudentProgressDetail() {
  const { courseId, studentId } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("accessToken");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [detailedProgress, setDetailedProgress] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [activity, setActivity] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activityDays, setActivityDays] = useState(30);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const menuRef = useRef(null);


    // ========== CLOSE EXPORT MENU WHEN CLICKING OUTSIDE ==========
    useEffect(() => {
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowExportMenu(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
    }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch summary data
        const summaryRes = await axios.get(
          `${API_URL}/instructor/courses/${courseId}/students/${studentId}/progress`,
          config
        );
        setSummary(summaryRes.data);

        // Fetch detailed lesson progress
        const lessonsRes = await axios.get(
          `${API_URL}/instructor/courses/${courseId}/students/${studentId}/progress/lessons`,
          config
        );
        setDetailedProgress(lessonsRes.data);

        // Expand all sections by default
        const defaultExpanded = new Set();
        lessonsRes.data?.forEach(section => {
          if (section.id !== "standalone") {
            defaultExpanded.add(section.id);
          }
        });
        setExpandedSections(defaultExpanded);

        // Fetch quiz history
        const quizRes = await axios.get(
          `${API_URL}/instructor/courses/${courseId}/students/${studentId}/progress/quizzes`,
          config
        );
        setQuizHistory(quizRes.data);

        // Fetch activity
        const activityRes = await axios.get(
          `${API_URL}/instructor/courses/${courseId}/students/${studentId}/progress/activity?days=${activityDays}`,
          config
        );
        setActivity(activityRes.data);

      } catch (error) {
        console.error("Error fetching student progress:", error);
        if (error.response?.status === 403) {
          toast.error("You don't have permission to view this student's progress");
          navigate(`/instructor/courses/${courseId}/students`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, studentId, activityDays]);

  const handleContactStudent = () => {
  // Navigate to messages page and pass student info in state
  navigate('/instructor/messages', {
    state: {
      startConversation: true,
      recipient: {
        id: summary?.student.id,
        name: summary?.student.name,
        email: summary?.student.email,
        photo: summary?.student.photo,
        role: 'student'
      }
    }
  });
};

// ========== EXPORT AS PDF ==========
const exportAsPDF = async () => {
  if (!summary) return;
  
  setExporting(true);
  
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text("Student Progress Report", pageWidth / 2, 20, { align: "center" });
    
    // Course and Student Info
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Course: ${summary.course.title}`, 20, 40);
    doc.text(`Student: ${summary.student.name}`, 20, 50);
    doc.text(`Email: ${summary.student.email}`, 20, 60);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 70);
    
    // Progress Statistics
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Progress Overview", 20, 90);
    
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`• Completion: ${summary.progress.completion_percentage}% (${summary.progress.completed_lessons}/${summary.progress.total_lessons} lessons)`, 25, 105);
    doc.text(`• Avg. Daily Progress: ${summary.progress.avg_progress_per_day}%`, 25, 115);
    doc.text(`• Quiz Average: ${summary.quizzes.average_score}%`, 25, 125);
    doc.text(`• Pass Rate: ${summary.quizzes.pass_rate}% (${summary.quizzes.passed_quizzes}/${summary.quizzes.total_attempts} passed)`, 25, 135);
    doc.text(`• Days Enrolled: ${summary.enrollment.days_enrolled} days`, 25, 145);
    
    let yPosition = 165;
    
    // Quiz History Table
    if (quizHistory && quizHistory.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Quiz Attempt History", 20, yPosition);
      yPosition += 10;
      
      const tableColumn = ["Quiz", "Date", "Score", "Result", "Time"];
      const tableRows = [];
      
      quizHistory.slice(0, 10).forEach((attempt) => {
        const quizData = [
          attempt.quiz_title,
          formatDate(attempt.completed_at),
          `${attempt.score}% (${attempt.correct_answers}/${attempt.total_questions})`,
          attempt.passed ? "Passed" : "Failed",
          formatTime(attempt.time_taken)
        ];
        tableRows.push(quizData);
      });
      
        autoTable(doc, {
        startY: yPosition + 5,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] },
      });
      
      yPosition = doc.lastAutoTable.finalY + 20;
    } else {
      yPosition += 20;
    }
    
    // Recent Activity
    if (summary.recent_activity && summary.recent_activity.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Recent Activity", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      summary.recent_activity.slice(0, 5).forEach((activity, index) => {
        doc.text(`• ${activity.lesson_title} - Completed ${formatDate(activity.completed_at)}`, 25, yPosition + (index * 7));
      });
    }
    
    // Save PDF
    doc.save(`${summary.student.name}_${summary.course.title}_Progress_Report.pdf`);
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate PDF report");
  } finally {
    setExporting(false);
  }
};

// ========== EXPORT AS CSV ==========
const exportAsCSV = () => {
  if (!summary) return;
  
  setExporting(true);
  
  try {
    // Create CSV content
    let csvContent = "Student Progress Report\n";
    csvContent += `Course,${summary.course.title}\n`;
    csvContent += `Student,${summary.student.name}\n`;
    csvContent += `Email,${summary.student.email}\n`;
    csvContent += `Report Date,${new Date().toLocaleDateString()}\n`;
    csvContent += `\n`;
    
    // Progress Overview
    csvContent += "PROGRESS OVERVIEW\n";
    csvContent += `Completion Percentage,${summary.progress.completion_percentage}%\n`;
    csvContent += `Completed Lessons,${summary.progress.completed_lessons}\n`;
    csvContent += `Total Lessons,${summary.progress.total_lessons}\n`;
    csvContent += `Avg Daily Progress,${summary.progress.avg_progress_per_day}%\n`;
    csvContent += `Quiz Average,${summary.quizzes.average_score}%\n`;
    csvContent += `Pass Rate,${summary.quizzes.pass_rate}%\n`;
    csvContent += `Quizzes Passed,${summary.quizzes.passed_quizzes}\n`;
    csvContent += `Total Quiz Attempts,${summary.quizzes.total_attempts}\n`;
    csvContent += `Days Enrolled,${summary.enrollment.days_enrolled}\n`;
    csvContent += `Last Active,${formatDate(summary.last_active)}\n`;
    csvContent += `\n`;
    
    // Quiz History
    if (quizHistory && quizHistory.length > 0) {
      csvContent += "QUIZ ATTEMPT HISTORY\n";
      csvContent += "Quiz Title,Date,Score,Correct/Total,Result,Time Taken\n";
      
      quizHistory.forEach((attempt) => {
        csvContent += `"${attempt.quiz_title}",${formatDate(attempt.completed_at)},${attempt.score}%,${attempt.correct_answers}/${attempt.total_questions},${attempt.passed ? 'Passed' : 'Failed'},${formatTime(attempt.time_taken)}\n`;
      });
      csvContent += `\n`;
    }
    
    // Recent Activity
    if (summary.recent_activity && summary.recent_activity.length > 0) {
      csvContent += "RECENT ACTIVITY\n";
      csvContent += "Lesson,Type,Completed At\n";
      
      summary.recent_activity.slice(0, 10).forEach((activity) => {
        csvContent += `"${activity.lesson_title}",${activity.lesson_type},${formatDate(activity.completed_at)}\n`;
      });
    }
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${summary.student.name}_${summary.course.title}_Progress_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error("Error generating CSV:", error);
    toast.error("Failed to generate CSV report");
  } finally {
    setExporting(false);
  }
};



  // Toggle section expansion
  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Get lesson icon
  const getLessonIcon = (type) => {
    switch (type) {
      case "video":
        return <PlayCircle className="w-4 h-4 text-blue-400" />;
      case "note":
        return <FileText className="w-4 h-4 text-yellow-400" />;
      case "assessment":
        return <HelpCircle className="w-4 h-4 text-red-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-400" />;
    }
  };

  // Format time
  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter lessons based on search and type
  const filterLessons = (lessons) => {
    if (!lessons) return [];
    
    return lessons.filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || lesson.type === filterType;
      return matchesSearch && matchesType;
    });
  };

  // Progress Circle Component
  const ProgressCircle = ({ percentage, size = 80, strokeWidth = 6 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <svg width={size} height={size}>
        <circle
          stroke="#e2e8f0"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={percentage >= 70 ? "#10b981" : percentage >= 40 ? "#f59e0b" : "#ef4444"}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2}
          y={size / 2 + 5}
          textAnchor="middle"
          fontSize={size * 0.2}
          fill="#1e293b"
          fontWeight="bold"
        >
          {Math.round(percentage)}%
        </text>
      </svg>
    );
  };

  // Stat Card Component
  const StatCard = ({ icon: Icon, label, value, sublabel, color = "purple" }) => {
    const colorClasses = {
      purple: "bg-purple-50 text-purple-600",
      green: "bg-green-50 text-green-600",
      blue: "bg-blue-50 text-blue-600",
      yellow: "bg-yellow-50 text-yellow-600",
      red: "bg-red-50 text-red-600",
      gray: "bg-gray-50 text-gray-600"
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {sublabel && (
              <p className="text-xs text-gray-500 mt-1">{sublabel}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student progress...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Progress Not Found</h2>
          <p className="text-gray-600 mb-6">The student may not be enrolled in this course.</p>
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}/students`)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Students
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/instructor/courses/${courseId}/students`)}
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
                  <Link to={`/instructor/courses/${courseId}/students`} className="hover:text-purple-600">
                    Students
                  </Link>
                  <span>›</span>
                  <span className="text-gray-900">Progress</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.student.name}
                </h1>
                <p className="text-sm text-gray-500">
                  Progress in {summary.course.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 relative" ref={menuRef}>
            {/* Export Dropdown Button */}
            <div className="relative">
                <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                >
                {exporting ? (
                    <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    Generating...
                    </>
                ) : (
                    <>
                    <Download className="w-4 h-4" />
                    Export Report
                    </>
                )}
                </button>
                
                {/* Export Options Dropdown */}
                {showExportMenu && !exporting && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                    <button
                        onClick={() => {
                        exportAsPDF();
                        setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        Export as PDF
                    </button>
                    <button
                        onClick={() => {
                        exportAsCSV();
                        setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                    >
                        <BarChart3 className="w-4 h-4" />
                        Export as CSV
                    </button>
                    </div>
                </div>
                )}
            </div>
            
            <button 
                onClick={handleContactStudent}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
                <Mail className="w-4 h-4" />
                Contact Student
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
              {summary.student.photo ? (
                <img
                  src={summary.student.photo}
                  alt={summary.student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-purple-600" />
              )}
            </div>
            
            <div className="flex-1 grid grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Student Name
                </p>
                <p className="font-semibold text-gray-900">{summary.student.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <p className="text-gray-900">{summary.student.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Enrolled
                </p>
                <p className="text-gray-900">{formatDate(summary.enrollment.date)}</p>
                <p className="text-xs text-gray-500">
                  {summary.enrollment.days_enrolled} days ago
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Last Active
                </p>
                <p className="text-gray-900">{formatDate(summary.last_active)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Target}
            label="Completion"
            value={`${summary.progress.completion_percentage}%`}
            sublabel={`${summary.progress.completed_lessons} of ${summary.progress.total_lessons} lessons`}
            color={summary.progress.completion_percentage >= 70 ? "green" : summary.progress.completion_percentage >= 40 ? "yellow" : "red"}
          />
          <StatCard
            icon={TrendingUp}
            label="Avg. Daily Progress"
            value={`${summary.progress.avg_progress_per_day}%`}
            sublabel="per day since enrollment"
            color="blue"
          />
          <StatCard
            icon={Award}
            label="Quiz Performance"
            value={`${summary.quizzes.average_score}%`}
            sublabel={`${summary.quizzes.passed_quizzes}/${summary.quizzes.total_attempts} passed`}
            color={summary.quizzes.average_score >= 70 ? "green" : summary.quizzes.average_score >= 55 ? "yellow" : "red"}
          />
          <StatCard
            icon={Activity}
            label="Total Activity"
            value={activity?.total_activities || 0}
            sublabel="actions in last 30 days"
            color="purple"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition ${
                activeTab === "overview"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <PieChart className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("lessons")}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition ${
                activeTab === "lessons"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Lesson Progress
            </button>
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition ${
                activeTab === "quizzes"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <HelpCircle className="w-4 h-4 inline mr-2" />
              Quiz History
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition ${
                activeTab === "activity"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Activity Log
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Progress Circle */}
              <div className="flex items-center gap-12">
                <div className="text-center">
                  <ProgressCircle percentage={summary.progress.completion_percentage} size={120} strokeWidth={8} />
                  <p className="mt-2 text-sm text-gray-500">Overall Progress</p>
                </div>
                
                <div className="flex-1 grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Lessons Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summary.progress.completed_lessons}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        / {summary.progress.total_lessons}
                      </span>
                    </p>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${summary.progress.completion_percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Quiz Performance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summary.quizzes.pass_rate}%
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        pass rate
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {summary.quizzes.passed_quizzes} of {summary.quizzes.total_attempts} quizzes passed
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Activity Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {summary.recent_activity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg">
                        {activity.lesson_type === 'video' && <PlayCircle className="w-4 h-4 text-blue-500" />}
                        {activity.lesson_type === 'note' && <FileText className="w-4 h-4 text-yellow-500" />}
                        {activity.lesson_type === 'assessment' && <HelpCircle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.lesson_title}</p>
                        <p className="text-xs text-gray-500">
                          Completed {formatDate(activity.completed_at)}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LESSONS TAB */}
          {activeTab === "lessons" && (
            <div>
              {/* Filters */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search lessons..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="video">Video</option>
                    <option value="note">Note</option>
                    <option value="assessment">Quiz</option>
                  </select>
                </div>
                
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">
                    {summary.progress.completed_lessons}
                  </span> completed,{" "}
                  <span className="font-medium text-gray-900">
                    {summary.progress.total_lessons - summary.progress.completed_lessons}
                  </span> remaining
                </div>
              </div>

              {/* Lessons List */}
              <div className="space-y-4">
                {detailedProgress.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No lessons found</p>
                  </div>
                ) : (
                  detailedProgress.map((section) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Section Header */}
                      <div 
                        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="flex items-center gap-2">
                          {section.type === "section" && (
                            expandedSections.has(section.id) ? 
                              <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                              <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                          <span className="font-semibold text-gray-900">{section.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            {section.children?.filter(l => l.progress.is_completed).length || 0}/
                            {section.children?.length || 0} completed
                          </span>
                          {section.children && section.children.length > 0 && (
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-600 rounded-full"
                                style={{ 
                                  width: `${(section.children.filter(l => l.progress.is_completed).length / section.children.length) * 100}%` 
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section Children */}
                      {expandedSections.has(section.id) && section.children && (
                        <div className="divide-y divide-gray-100">
                          {filterLessons(section.children).map((lesson) => (
                            <div key={lesson.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="relative">
                                  {getLessonIcon(lesson.type)}
                                  {lesson.progress.is_completed && (
                                    <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-green-500 bg-white rounded-full" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${
                                    lesson.progress.is_completed ? "text-gray-500 line-through" : "text-gray-900"
                                  }`}>
                                    {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                                      {lesson.type}
                                    </span>
                                    {lesson.duration_seconds && (
                                      <span className="text-xs text-gray-500">
                                        {formatTime(lesson.duration_seconds)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                {lesson.progress.is_completed ? (
                                  <div>
                                    <span className="text-xs text-green-600 font-medium">Completed</span>
                                    <p className="text-xs text-gray-500">
                                      {lesson.progress.completed_at && formatDate(lesson.progress.completed_at)}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">Not started</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* QUIZZES TAB */}
          {activeTab === "quizzes" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Attempt History</h3>
              
              {quizHistory.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No quiz attempts yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quiz
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time Taken
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Result
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quizHistory.map((attempt) => (
                        <tr key={attempt.attempt_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">{attempt.quiz_title}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-900">{formatDate(attempt.completed_at)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-semibold ${
                              attempt.score >= 70 ? "text-green-600" : 
                              attempt.score >= 55 ? "text-yellow-600" : "text-red-600"
                            }`}>
                              {attempt.score}%
                            </span>
                            <p className="text-xs text-gray-500">
                              {attempt.correct_answers}/{attempt.total_questions}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-900">
                              {attempt.time_taken ? formatTime(attempt.time_taken) : "N/A"}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            {attempt.passed ? (
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Passed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                <XCircle className="w-3 h-3 mr-1" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => navigate(`/instructor/quiz-review/${attempt.attempt_id}`)}
                              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === "activity" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
                
                <select
                  value={activityDays}
                  onChange={(e) => setActivityDays(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>

              {!activity || Object.keys(activity.grouped_activities).length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No activity found in this period</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(activity.grouped_activities).map(([date, activities]) => (
                    <div key={date}>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">{date}</h4>
                      <div className="space-y-2">
                        {activities.map((act) => (
                          <div key={act.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`p-2 rounded-lg ${
                              act.type === 'lesson_completion' ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                              {act.type === 'lesson_completion' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <HelpCircle className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{act.title}</p>
                              <p className="text-xs text-gray-500">
                                {act.type === 'quiz_attempt' && (
                                  <>Score: {act.score}% - {act.passed ? 'Passed' : 'Failed'}</>
                                )}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(act.timestamp).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}