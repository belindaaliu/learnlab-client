import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/Api";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import AdminAgentChat from "../../components/aiAgent/AdminAgentChat";
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

  const [activeTab, setActiveTab] = useState("overview"); // overview | courses | subscriptions
  const [range, setRange] = useState({ start: "", end: "" });
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = {};
      if (range.start && range.end) {
        params.start = range.start;
        params.end = range.end;
      }

      const res = await api.get("/admin/analytics", { params });
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error("Admin analytics fetch error:", err);
      setError("Failed to fetch fresh data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);

    try {
      const element = dashboardRef.current;

      // Slightly longer delay to ensure all Recharts tooltips/animations are gone
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#f8fafc",
        windowWidth: 1400,
        onclone: (clonedDoc) => {
          // Hide UI elements we don't want in a static report
          const idsToHide = ["ai-chat-button", "admin-agent-chat"];
          idsToHide.forEach((id) => {
            const el = clonedDoc.getElementById(id);
            if (el) el.style.display = "none";
          });

          const actions = clonedDoc.querySelectorAll(
            ".flex.gap-3, .flex.items-center.gap-2",
          );
          actions.forEach((el) => (el.style.display = "none"));

          const charts = clonedDoc.querySelectorAll(".recharts-wrapper");
          charts.forEach((chart) => {
            chart.style.opacity = "1";
            chart.style.visibility = "visible";
          });
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate image height based on the PDF width
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      const margin = 10; 

      // Page 1
      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        pdfWidth,
        imgHeight,
        undefined,
        "FAST",
      );
      heightLeft -= pdfHeight;

      // Additional Pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          0,
          position,
          pdfWidth,
          imgHeight,
          undefined,
          "FAST",
        );
        heightLeft -= pdfHeight;
      }

      pdf.save(
        `Analytics-Report-${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error)
    return (
      <div className="p-10 text-center text-red-500 font-medium">{error}</div>
    );

  const {
    courseAnalytics = { mostEnrolledCourses: [], dropOffCourses: [] },
    financialAnalytics = {
      currentMonthTotal: 0,
      revenueTrend: 0,
      refundPercentage: 0,
      projectedRevenue: 0,
      revenueByCategory: [],
      totalRevenue: 0,
      collectedCourseRevenue: 0,
      totalSubscriptionRevenue: 0,
      otherRevenue: 0,
      totalCourseRevenueCeiling: 0,
      instructorShare: 0,
      platformShare: 0,
      subscriptionRevenueByMonth: [],
      subscriptionPopularity: [],
      monthlyRevenueCompare: [],
    },
    engagementAnalytics = { quizStats: [], difficultQuestions: [] },
    userAnalytics = { mostActiveLearners: [] },
  } = data || {};

  const sourceSum =
    Number(financialAnalytics.collectedCourseRevenue || 0) +
    Number(financialAnalytics.totalSubscriptionRevenue || 0) +
    Number(financialAnalytics.otherRevenue || 0);

  const revenueMixData = [
    {
      label: "Courses (Collected)",
      total: Number(financialAnalytics.collectedCourseRevenue || 0),
    },
    {
      label: "Subscriptions (Collected)",
      total: Number(financialAnalytics.totalSubscriptionRevenue || 0),
    },
    {
      label: "Other (Collected)",
      total: Number(financialAnalytics.otherRevenue || 0),
    },
  ].filter((d) => d.total > 0);

  return (
    <div
      ref={dashboardRef}
      className="p-8 bg-slate-50 min-h-screen font-sans text-slate-900"
    >
      {/* HEADER: title + date range + tabs + buttons */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Analytics Intelligence
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Platform performance and behavioral metrics.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          {/* Date range filter */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="border rounded-lg px-3 py-1 text-sm"
              value={range.start}
              onChange={(e) =>
                setRange((prev) => ({ ...prev, start: e.target.value }))
              }
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              className="border rounded-lg px-3 py-1 text-sm"
              value={range.end}
              onChange={(e) =>
                setRange((prev) => ({ ...prev, end: e.target.value }))
              }
            />
            <button
              onClick={() => fetchData(true)}
              className="px-3 py-1 text-xs rounded-lg bg-slate-900 text-white"
            >
              Apply
            </button>
            <button
              onClick={() => {
                setRange({ start: "", end: "" });
                fetchData(true);
              }}
              className="px-3 py-1 text-xs rounded-lg border border-slate-300 text-slate-600"
            >
              Clear
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 transition-all disabled:opacity-70"
            >
              {isExporting ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Generating...</span>
                </>
              ) : (
                "Export PDF"
              )}
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
      </div>

      {/* Tabs */}
      <div className="inline-flex items-center rounded-full bg-slate-100 p-1 text-xs font-semibold mb-8">
        {["overview", "courses", "subscriptions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-full transition ${
              activeTab === tab
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            {tab === "overview"
              ? "Overview"
              : tab === "courses"
                ? "Courses"
                : "Subscriptions"}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <>
          {/* KPI SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1 mb-10">
            <KPICard
              title="Rolling 30-Day Revenue (Collected)"
              value={`$${(
                financialAnalytics.currentMonthTotal || 0
              ).toLocaleString()}`}
              icon={<DollarSign className="text-emerald-500" />}
              trend={`${financialAnalytics.revenueTrend.toFixed(
                1,
              )}% vs prev 30d`}
              color="bg-emerald-50"
            />
            <KPICard
              title="Projected Next 30 Days (Collected)"
              value={`$${Math.round(
                financialAnalytics.projectedRevenue || 0,
              ).toLocaleString()}`}
              icon={<Target className="text-blue-500" />}
              trend=""
              color="bg-blue-50"
            />
            <KPICard
              title="Refund Rate (All Time)"
              value={`${financialAnalytics.refundPercentage.toFixed(1)}%`}
              icon={<TrendingUp className="text-rose-500" />}
              trend="Refunds"
              color="bg-rose-50"
            />
            <KPICard
              title="Top Course Volume"
              value={courseAnalytics.mostEnrolledCourses[0]?.enrollments || 0}
              icon={<BookOpen className="text-indigo-500" />}
              trend="Most enrolled course"
              color="bg-indigo-50"
            />
            <KPICard
              title="Super Learners (Top Users)"
              value={userAnalytics.mostActiveLearners.length}
              icon={<Users className="text-emerald-500" />}
              trend="Retention"
              color="bg-emerald-50"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Enrollment Distribution */}
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
                      <linearGradient
                        id="barGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0.1}
                        />
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

            {/* Revenue Mix */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <PieIcon className="text-fuchsia-500" /> Revenue by Source
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Breakdown of collected revenue into courses, subscriptions, and
                other payments (payments with no course or subscription id).
              </p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueMixData}
                      innerRadius={0}
                      outerRadius="80%"
                      paddingAngle={4}
                      dataKey="total"
                      nameKey="label"
                    >
                      {revenueMixData.map((entry, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={COLORS[i % COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `$${Number(value).toLocaleString()}`
                      }
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
              <p className="text-[11px] text-slate-400 mt-2">
                Total collected: ${financialAnalytics.totalRevenue.toFixed(2)} ·
                Sum of sources: ${sourceSum.toFixed(2)}
              </p>
            </div>
          </div>
        </>
      )}

      {/* COURSES TAB */}
      {activeTab === "courses" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* TOP ROW: STRATEGIC COURSE KPIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard
              title="Total Revenue (Collected)"
              value={`$${(
                financialAnalytics.totalRevenue || 0
              ).toLocaleString()}`}
              icon={<DollarSign className="text-emerald-500" />}
              trend="All collected payments"
              color="bg-emerald-50"
            />
            <KPICard
              title="Course Revenue (Collected)"
              value={`$${(
                financialAnalytics.collectedCourseRevenue || 0
              ).toLocaleString()}`}
              icon={<BookOpen className="text-indigo-500" />}
              trend="From course purchases"
              color="bg-indigo-50"
            />
            <KPICard
              title="Instructor Payouts (85% of Collected)"
              value={`$${(
                financialAnalytics.instructorShare || 0
              ).toLocaleString()}`}
              icon={<Users className="text-blue-500" />}
              trend="85% of total collected"
              color="bg-blue-50"
            />
          </div>

          {/* MIDDLE ROW: CORE PERFORMANCE VS. COURSE LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Enrollment Performance Chart (8 columns) */}
            <div className="lg:col-span-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Course Enrollment Trend
                  </h2>
                  <p className="text-sm text-slate-500">
                    Enrollment counts for your most enrolled courses
                  </p>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={courseAnalytics.mostEnrolledCourses}>
                    <defs>
                      <linearGradient
                        id="colorEnroll"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
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
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                      }}
                      labelFormatter={(label) => `Course: ${label}`}
                      formatter={(value) => [
                        `${value} enrollments`,
                        "Enrollments",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="enrollments"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorEnroll)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Course Highlight Card (4 columns) */}
            <div className="lg:col-span-4 bg-slate-900 text-white p-8 rounded-3xl shadow-xl overflow-hidden relative">
              <div className="relative z-10 space-y-4">
                <h2 className="text-lg font-bold">Top Course Snapshot</h2>

                {courseAnalytics.mostEnrolledCourses[0] ? (
                  <>
                    <p className="text-xs text-slate-400">
                      Highest enrolled course from your analytics feed.
                    </p>
                    <div className="space-y-2">
                      <div className="text-sm font-semibold truncate">
                        {courseAnalytics.mostEnrolledCourses[0].title}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-extrabold text-emerald-400">
                          {courseAnalytics.mostEnrolledCourses[0].enrollments}{" "}
                          <span className="text-xs font-normal text-slate-300">
                            enrollments
                          </span>
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">
                    No enrollment data available yet.
                  </p>
                )}
              </div>

              <div className="absolute -right-10 -bottom-10 opacity-10">
                <TrendingUp size={200} />
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: STUDENT FRICTION & ENGAGEMENT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-sm">
              <ListCard
                title="Drop-off Hotspots"
                data={courseAnalytics.dropOffCourses}
                type="risk"
              />
            </div>
            <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-sm">
              <ListCard
                title="Most Active Learners"
                data={userAnalytics.mostActiveLearners}
                type="user"
              />
            </div>
            <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-sm">
              <ListCard
                title="Hardest Quiz Items"
                data={engagementAnalytics.difficultQuestions}
                type="question"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIPTIONS TAB */}
      {activeTab === "subscriptions" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Course Revenue (Collected, All-Time)"
              value={`$${(
                financialAnalytics.collectedCourseRevenue || 0
              ).toLocaleString()}`}
              icon={<BookOpen className="text-blue-500" />}
              trend=""
              color="bg-blue-50"
            />
            <KPICard
              title="Subscription Revenue (Collected, All-Time)"
              value={`$${(
                financialAnalytics.totalSubscriptionRevenue || 0
              ).toLocaleString()}`}
              icon={<DollarSign className="text-emerald-500" />}
              trend=""
              color="bg-emerald-50"
            />
            <KPICard
              title="Other Revenue (Collected)"
              value={`$${(
                financialAnalytics.otherRevenue || 0
              ).toLocaleString()}`}
              icon={<Zap className="text-amber-500" />}
              trend="Not linked to course or plan"
              color="bg-amber-50"
            />
            <KPICard
              title="Total Revenue (Collected, All-Time)"
              value={`$${(
                financialAnalytics.totalRevenue || 0
              ).toLocaleString()}`}
              icon={<TrendingUp className="text-indigo-500" />}
              trend="Courses + subscriptions + other"
              color="bg-indigo-50"
            />
          </div>

          {/* Stacked Course + Subscription Revenue per Month */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" /> Monthly Course vs
              Subscription Revenue (Last Months)
            </h2>
            <p className="text-xs text-slate-400 mb-2">
              Both bars represent collected revenue by source in recent months
              (other revenue not shown here).
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialAnalytics.monthlyRevenueCompare}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
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
                    formatter={(value) => `$${Number(value).toLocaleString()}`}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="courseRevenue"
                    name="Course Revenue (Collected)"
                    stackId="rev"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                  <Bar
                    dataKey="subscriptionRevenue"
                    name="Subscription Revenue (Collected)"
                    stackId="rev"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ListCard
              title="Popular Subscription Plans"
              data={financialAnalytics.subscriptionPopularity}
              type="plan"
            />
            <ListCard
              title="Super Learners"
              data={userAnalytics.mostActiveLearners}
              type="user"
            />
          </div>
        </>
      )}
      <AdminAgentChat range={range} activeTab={activeTab} />
    </div>
  );
};

// HELPER COMPONENTS
const KPICard = ({ title, value, icon, trend, color }) => (
  <div className="p-6 rounded-3xl border border-slate-100 shadow-sm bg-white">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
      {trend && (
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const ListCard = ({ title, data, type }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
    <h3 className="text-lg font-bold mb-6 text-slate-800">{title}</h3>
    <div className="space-y-4">
      {(!data || data.length === 0) && (
        <p className="text-sm text-slate-400 text-center py-4">
          No data available yet
        </p>
      )}

      {data &&
        data.slice(0, 5).map((item, i) => {
          const label =
            type === "user"
              ? item.name
              : type === "plan"
                ? item.plan_name
                : item.title || item.question_text;

          const valueLabel =
            type === "risk"
              ? `${item.incomplete} left`
              : type === "user"
                ? `${item.completed_lessons} pts`
                : type === "plan"
                  ? `${item.active_subscriptions} active`
                  : `${Math.round(item.correct_rate * 100)}%`;

          const href =
            type === "question" && item.course_id
              ? `/admin/courses/${item.course_id}`
              : null;

          return (
            <div
              key={i}
              className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors"
            >
              {href ? (
                <a
                  href={href}
                  className="text-sm font-medium text-slate-600 truncate w-2/3 hover:text-indigo-600 underline-offset-2 hover:underline"
                >
                  {label}
                </a>
              ) : (
                <span className="text-sm font-medium text-slate-600 flex-1 pr-4 break-words">
                  {label}
                </span>
              )}
              <span
                className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  type === "risk"
                    ? "text-rose-600 bg-rose-50"
                    : "text-indigo-600 bg-indigo-50"
                }`}
              >
                {valueLabel}
              </span>
            </div>
          );
        })}
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
