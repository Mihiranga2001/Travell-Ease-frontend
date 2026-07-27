import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCalendarCheck,
  FaMoneyBillWave,
  FaStar,
  FaUserTie,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import {
  API_URL,
  axios,
  extractObject,
  formatCurrency,
  getApiErrorMessage,
  getAuthConfig,
} from "./guideApi";

export default function GuideReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadReport() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/travel-guides/my/reports`,
        getAuthConfig()
      );
      setReport(
        extractObject(response.data, ["report", "data"])
      );
    } catch (error) {
      setReport(null);
      toast.error(
        getApiErrorMessage(error, "Failed to load reports")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  const summary = report?.summary || {};
  const statuses = report?.bookingStatus || {};
  const monthly = Array.isArray(report?.monthly)
    ? report.monthly
    : [];

  const maximumBookings = Math.max(
    1,
    ...monthly.map((item) => Number(item.bookings || 0))
  );

  return (
    <div className="w-full min-h-screen bg-white p-[25px] pt-[75px] lg:pt-[25px] text-gray-800 overflow-y-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Reports
          </h1>
          <p className="text-gray-500 mt-[5px]">
            Review booking, rating and earnings performance.
          </p>
        </div>
        <button
          type="button"
          onClick={loadReport}
          disabled={loading}
          className="inline-flex items-center gap-[8px] border border-accent text-accent px-[18px] py-[10px] rounded-lg font-semibold hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <Stat title="Total Bookings" value={summary.totalBookings || 0} icon={<FaCalendarCheck />} color="bg-blue-600" />
        <Stat title="Completion Rate" value={`${Number(summary.completionRate || 0).toFixed(1)}%`} icon={<FaUserTie />} color="bg-green-600" />
        <Stat title="Average Rating" value={Number(summary.averageRating || 0).toFixed(1)} icon={<FaStar />} color="bg-orange" />
        <Stat title="Total Earnings" value={`Rs. ${formatCurrency(summary.totalEarnings)}`} icon={<FaMoneyBillWave />} color="bg-purple-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[20px]">
        <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <h2 className="text-xl font-bold text-gray-800 mb-[18px]">
            Booking Status
          </h2>
          {[
            ["Pending", statuses.pending || 0, "bg-orange"],
            ["Approved", statuses.approved || 0, "bg-green-600"],
            ["Completed", statuses.completed || 0, "bg-blue-600"],
            ["Rejected", statuses.rejected || 0, "bg-red-600"],
            ["Cancelled", statuses.cancelled || 0, "bg-gray-500"],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="flex items-center justify-between bg-gray-50 rounded-xl px-[14px] py-[11px] mb-[10px]"
            >
              <div className="flex items-center gap-[9px]">
                <span className={`w-[10px] h-[10px] rounded-full ${color}`} />
                <span className="text-sm text-gray-600">{label}</span>
              </div>
              <span className="font-bold">{value}</span>
            </div>
          ))}
        </section>

        <section className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <h2 className="text-xl font-bold text-gray-800 mb-[18px]">
            Monthly Booking Performance
          </h2>

          {loading ? (
            <Empty text="Loading report..." />
          ) : monthly.length === 0 ? (
            <Empty text="No monthly report data." />
          ) : (
            <div className="space-y-[15px]">
              {monthly.map((item) => (
                <div key={item.month}>
                  <div className="flex items-center justify-between gap-[10px] mb-[6px]">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.label || item.month}
                      </p>
                      <p className="text-xs text-gray-500">
                        Rs. {formatCurrency(item.earnings)} earnings
                      </p>
                    </div>
                    <p className="font-bold text-accent">
                      {item.bookings || 0} booking(s)
                    </p>
                  </div>
                  <div className="h-[12px] rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${Math.max(
                          4,
                          (Number(item.bookings || 0) /
                            maximumBookings) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-2xl font-bold mt-[6px]">{value}</h2>
      </div>
      <div className={`${color} w-[55px] h-[55px] rounded-full text-white text-2xl flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="min-h-[220px] flex items-center justify-center text-gray-500">
      {text}
    </div>
  );
}
