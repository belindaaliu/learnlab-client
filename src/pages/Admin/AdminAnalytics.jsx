import React, { useEffect, useState } from "react";
import api from "../../utils/Api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Award,
  AlertTriangle,
  PieChart as PieIcon,
  Zap,
  Target,
} from "lucide-react";

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#f59e0b",
    "#10b981",
  ];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/admin/analytics")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load analytics. Check server logs.");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500 animate-pulse">
        Crunching platform data...
      </div>
    );
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!data) return null;

  // Add default empty arrays to prevent "cannot map of undefined" errors
  const {
    courseAnalytics = { mostEnrolledCourses: [], dropOffCourses: [] },
    financialAnalytics = { revenueByCategory: [], refundPercentage: 0 },
    engagementAnalytics = { quizStats: [] },
    userAnalytics = { mostActiveLearners: [] },
  } = data;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Platform Insights</h1>
        <p className="text-gray-500">
          Deep dive into user behavior and course performance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Most Enrolled - Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Award className="text-amber-500" /> Top Performing Courses
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={courseAnalytics.mostEnrolledCourses}
                layout="vertical"
                margin={{ left: 40 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="title"
                  type="category"
                  width={120}
                  tick={{ fontSize: 11, fill: "#475569" }}
                  axisLine={false}
                />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar
                  dataKey="enrollments"
                  fill="#6366f1"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <PieIcon className="text-indigo-600" /> Revenue Share
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialAnalytics.revenueByCategory}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="total"
                  nameKey="category"
                >
                  {financialAnalytics.revenueByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-indigo-50 rounded-xl">
            <p className="text-xs text-indigo-700 font-medium">Refund Rate</p>
            <p className="text-xl font-bold text-indigo-900">
              {financialAnalytics.refundPercentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quiz Engagement */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" /> Quiz Stats
          </h2>
          <div className="space-y-4">
            {engagementAnalytics.quizStats.slice(0, 5).map((quiz, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
              >
                <span className="text-xs font-semibold text-gray-700 truncate w-32">
                  {quiz.title}
                </span>
                <div className="text-right">
                  <div className="text-sm font-bold text-indigo-600">
                    {Math.round(quiz.avg_score)}%{" "}
                    <span className="text-[10px] text-gray-400 font-normal">
                      Score
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {quiz.attempts} attempts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drop-off Risk */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-rose-600">
            <AlertTriangle size={20} /> Drop-off Risk
          </h2>
          <div className="space-y-5">
            {courseAnalytics.dropOffCourses.slice(0, 4).map((course, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="truncate w-40">{course.title}</span>
                  <span className="text-rose-500">
                    {course.incomplete} left
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-rose-400 h-1.5 rounded-full"
                    style={{
                      width: `${(course.incomplete / course.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Learners */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Target size={20} className="text-emerald-500" /> Most Active
          </h2>
          <div className="space-y-3">
            {userAnalytics.mostActiveLearners.map((learner, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold text-gray-300">
                    #{i + 1}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {learner.name}
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  {learner.completed_lessons} lessons
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
