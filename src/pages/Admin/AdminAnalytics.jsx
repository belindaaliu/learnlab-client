import React, { useEffect, useState, useRef, useMemo } from "react";
import api from "../../utils/Api";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
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
  AreaChart,
  Area,
} from "recharts";
import {
  LoaderCircle,
  Award,
  AlertTriangle,
  PieChart as PieIcon,
  Zap,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  BookOpen,
} from "lucide-react";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f59e0b",
  "#10b981",
];

const AdminAnalytics = () => {
  const dashboardRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get("/admin/analytics");
      setData(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch fresh data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  <button onClick={fetchData} className="px-4 py-2 bg-indigo-600 ...">
    Refresh Data
  </button>;

  if (loading) return <LoadingSkeleton />;
  if (error)
    return (
      <div className="p-10 text-center text-red-500 font-medium">{error}</div>
    );

  const {
    courseAnalytics = { mostEnrolledCourses: [], dropOffCourses: [] },
    financialAnalytics = {
      currentTotal: 0,
      revenueTrend: 0,
      refundPercentage: 0,
      projectedRevenue: 0,
      revenueByCategory: [],
    },
    engagementAnalytics = { quizStats: [], difficultQuestions: [] },
    userAnalytics = { mostActiveLearners: [] },
  } = data || {};

  const handleExportPDF = async () => {
    const element = dashboardRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Analytics-Report.pdf");
  };

  return (
    <div
      ref={dashboardRef}
      className="p-8 bg-slate-50 min-h-screen font-sans text-slate-900"
    >
      {/* HEADER */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Analytics Intelligence
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Platform performance and behavioral metrics.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportPDF} className="px-4 py-2 bg-white ...">
            Export PDF
          </button>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : null}
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-1 mb-10">
        <KPICard
          title="Monthly Revenue"
          value={`$${(financialAnalytics.currentTotal || 0).toLocaleString()}`}
          icon={<DollarSign className="text-emerald-500" />}
          trendValue={financialAnalytics.revenueTrend}
          color="bg-emerald-50"
        />
        <KPICard
          title="Forecasted"
          value={`$${Math.round(financialAnalytics.projectedRevenue || 0).toLocaleString()}`}
          icon={<Target className="text-blue-500" />}
          trendValue={0}
          color="bg-blue-50"
        />
        <KPICard
          title="Refund Rate"
          value={`${financialAnalytics.refundPercentage.toFixed(1)}%`}
          icon={<TrendingUp className="text-rose-500" />}
          trend="High Risk"
          color="bg-rose-50"
        />
        <KPICard
          title="Avg Quiz Score"
          value={`${Math.round(engagementAnalytics.quizStats[0]?.avg_score || 0)}%`}
          icon={<Zap className="text-amber-500" />}
          trend="+2.4%"
          color="bg-amber-50"
        />
        <KPICard
          title="Top Course Volume"
          value={courseAnalytics.mostEnrolledCourses[0]?.enrollments || 0}
          icon={<BookOpen className="text-indigo-500" />}
          trend="Active"
          color="bg-indigo-50"
        />
        <KPICard
          title="Super Learners"
          value={userAnalytics.mostActiveLearners.length}
          icon={<Users className="text-emerald-500" />}
          trend="Retention"
          color="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Chart: Performance */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Award className="text-indigo-500" /> Enrollment Distribution
            </h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={courseAnalytics.mostEnrolledCourses}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="enrollments"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Revenue */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
            <PieIcon className="text-fuchsia-500" /> Revenue Share
          </h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialAnalytics.revenueByCategory.map((item) => ({
                    ...item,
                    total: Number(item.total), 
                  }))}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="total"
                  nameKey="category"
                >
                  {financialAnalytics.revenueByCategory.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={COLORS[i % COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FOOTER GRIDS: Lists and Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ListCard
          title="Difficult Questions"
          data={engagementAnalytics.difficultQuestions}
          type="question"
        />
        <ListCard
          title="Drop-off Risk"
          data={courseAnalytics.dropOffCourses}
          type="risk"
        />
        <ListCard
          title="Leaderboard"
          data={userAnalytics.mostActiveLearners}
          type="user"
        />
      </div>
    </div>
  );
};

// HELPER COMPONENTS
const KPICard = ({ title, value, icon, trend, color }) => (
  <div className={`p-6 rounded-3xl border border-slate-100 shadow-sm bg-white`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        {trend}
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const ListCard = ({ title, data, type }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
    <h3 className="text-lg font-bold mb-6 text-slate-800">{title}</h3>
    <div className="space-y-4">
      {/* Fallback for empty data */}
      {(!data || data.length === 0) && (
        <p className="text-sm text-slate-400 text-center py-4">
          No data available yet
        </p>
      )}

      {data &&
        data.slice(0, 5).map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors"
          >
            <span className="text-sm font-medium text-slate-600 truncate w-2/3">
              {type === "user" ? item.name : item.title || item.question_text}
            </span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-lg ${type === "risk" ? "text-rose-600 bg-rose-50" : "text-indigo-600 bg-indigo-50"}`}
            >
              {type === "risk"
                ? `${item.incomplete} left`
                : type === "user"
                  ? `${item.completed_lessons} pts`
                  : `${Math.round(item.correct_rate * 100)}%`}
            </span>
          </div>
        ))}
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="p-10 space-y-8 animate-pulse">
    <div className="h-10 bg-slate-200 rounded w-1/4"></div>
    <div className="grid grid-cols-4 gap-4">
      <div className="h-32 bg-slate-200 rounded-3xl shadow-sm"></div>
      <div className="h-32 bg-slate-200 rounded-3xl shadow-sm"></div>
      <div className="h-32 bg-slate-200 rounded-3xl shadow-sm"></div>
      <div className="h-32 bg-slate-200 rounded-3xl shadow-sm"></div>
    </div>
  </div>
);

export default AdminAnalytics;
