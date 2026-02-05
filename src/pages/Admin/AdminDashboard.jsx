import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  Activity,
  UserPlus,
  BarChart3,
  PieChart as PieIcon,
  Download,
  Calendar,
  RefreshCcw,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "../../utils/Api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const dashboardRef = useRef(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.start) params.start = dateRange.start;
      if (dateRange.end) params.end = dateRange.end;
      const res = await api.get("/admin/dashboard-stats", { params });
      setData(res.data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const resetFilters = () => {
    setDateRange({ start: "", end: "" });
  };

  const downloadReport = async () => {
    if (!dashboardRef.current) return;

    try {
      const element = dashboardRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#f9fafb",
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`LearnLab_Report_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to generate PDF. Check console.");
    }
  };

  if (loading && !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <RefreshCcw className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const { metrics = {}, charts = {}, activity = {} } = data || {};

  return (
    <div
      ref={dashboardRef}
      className="p-8 min-h-screen bg-gray-50/50 overflow-x-hidden"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Platform Dashboard
          </h1>
          <p className="text-gray-500">Visual performance and growth metrics</p>
        </div>

        <div
          data-html2canvas-ignore
          className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 px-3">
            <Calendar size={16} className="text-gray-400" />
            <input
              type="date"
              className="text-sm bg-transparent outline-none"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((p) => ({ ...p, start: e.target.value }))
              }
            />
            <span className="text-gray-300">to</span>
            <input
              type="date"
              className="text-sm bg-transparent outline-none"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((p) => ({ ...p, end: e.target.value }))
              }
            />
            {(dateRange.start || dateRange.end) && (
              <button
                onClick={resetFilters}
                className="ml-2 text-xs text-red-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition shadow-md"
          >
            <Download size={18} />
            <span className="font-semibold">Export Visual Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          label="Revenue"
          value={`$${(metrics.totalRevenue || 0).toLocaleString()}`}
          icon={<DollarSign />}
          color="indigo"
        />
        <StatCard
          label="Students"
          value={metrics.totalStudents || 0}
          icon={<Users />}
          color="blue"
        />
        <StatCard
          label="Courses"
          value={metrics.totalCourses || 0}
          icon={<BookOpen />}
          color="orange"
        />
        <StatCard
          label="Enrollments"
          value={metrics.totalEnrollments || 0}
          icon={<Activity />}
          color="emerald"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="text-emerald-600" size={20} /> Revenue by
            Month
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenueByMonth}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar
                  dataKey="total"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PieIcon className="text-orange-500" size={20} /> Category Split
          </h2>
          <div className="h-72 w-full overflow-hidden">
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={
                    charts.popularCategories?.map((item) => ({
                      ...item,
                      total: Number(item.total),
                    })) || []
                  }
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="total"
                  nameKey="name"
                  paddingAngle={5}
                >
                  {charts.popularCategories?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Revenue & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="text-indigo-600" size={20} /> User Acquisition
          </h2>
          <div className="h-80 w-full overflow-hidden">
            <ResponsiveContainer width="99%" height="100%">
              <LineChart data={charts.usersByMonth}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#6366f1"
                  strokeWidth={4}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <UserPlus className="text-indigo-600" size={20} /> Recent Signups
          </h2>
          {/* Increased spacing and allowed for text wrapping */}
          <div className="space-y-6">
            {activity.latestUsers?.slice(0, 6).map((user) => (
              <div key={user.id} className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold uppercase text-xs">
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Removed truncate so full names show */}
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {user.first_name} {user.last_name}
                  </p>
                  {/* Added break-all for long emails to prevent bleeding */}
                  <p className="text-xs text-gray-500 break-all leading-normal">
                    {user.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className={`p-3 w-fit rounded-2xl ${styles[color]} mb-4`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        {label}
      </p>
      <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
    </div>
  );
};

export default AdminDashboard;
