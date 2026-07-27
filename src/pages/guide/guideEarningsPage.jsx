import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCalendarCheck,
  FaMoneyBillWave,
  FaWallet,
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

export default function GuideEarningsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadEarnings() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/travel-guides/my/earnings`,
        getAuthConfig()
      );
      setData(
        extractObject(response.data, ["earnings", "data"])
      );
    } catch (error) {
      setData(null);
      toast.error(
        getApiErrorMessage(error, "Failed to load earnings")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEarnings();
  }, []);

  const summary = data?.summary || {};
  const monthly = Array.isArray(data?.monthly)
    ? data.monthly
    : [];
  const transactions = Array.isArray(data?.transactions)
    ? data.transactions
    : [];

  return (
    <div className="w-full min-h-screen bg-white p-[25px] pt-[75px] lg:pt-[25px] text-gray-800 overflow-y-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Earnings
          </h1>
          <p className="text-gray-500 mt-[5px]">
            View completed booking income and monthly totals.
          </p>
        </div>
        <button
          type="button"
          onClick={loadEarnings}
          disabled={loading}
          className="inline-flex items-center gap-[8px] border border-accent text-accent px-[18px] py-[10px] rounded-lg font-semibold hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <Stat title="Total Earnings" value={`Rs. ${formatCurrency(summary.totalEarnings)}`} icon={<FaMoneyBillWave />} color="bg-blue-600" />
        <Stat title="Paid Earnings" value={`Rs. ${formatCurrency(summary.paidEarnings)}`} icon={<FaWallet />} color="bg-green-600" />
        <Stat title="Pending Payment" value={`Rs. ${formatCurrency(summary.pendingEarnings)}`} icon={<FaWallet />} color="bg-orange" />
        <Stat title="Completed Bookings" value={summary.completedBookings || 0} icon={<FaCalendarCheck />} color="bg-purple-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[20px]">
        <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <h2 className="text-xl font-bold text-gray-800 mb-[18px]">
            Monthly Earnings
          </h2>
          {loading ? (
            <Empty text="Loading..." />
          ) : monthly.length === 0 ? (
            <Empty text="No monthly earnings data." />
          ) : (
            <div className="space-y-[12px]">
              {monthly.map((item) => (
                <div
                  key={item.month}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-[14px] py-[12px]"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {item.label || item.month}
                    </p>
                    <p className="text-xs text-gray-500 mt-[2px]">
                      {item.bookings || 0} completed booking(s)
                    </p>
                  </div>
                  <p className="font-bold text-accent">
                    Rs. {formatCurrency(item.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <h2 className="text-xl font-bold text-gray-800 mb-[18px]">
            Recent Earnings
          </h2>
          {loading ? (
            <Empty text="Loading..." />
          ) : transactions.length === 0 ? (
            <Empty text="No completed earning transactions." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-left">
                <thead>
                  <tr className="border-b text-xs text-gray-500">
                    <th className="py-[10px]">Traveler</th>
                    <th className="py-[10px]">Date</th>
                    <th className="py-[10px]">Payment</th>
                    <th className="py-[10px] text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item) => (
                    <tr key={item._id} className="border-b text-sm">
                      <td className="py-[12px]">
                        {item.travelerName || "Traveler"}
                      </td>
                      <td className="py-[12px] text-gray-500">
                        {item.completedDate || "Not available"}
                      </td>
                      <td className="py-[12px]">
                        {item.paymentStatus || "pending"}
                      </td>
                      <td className="py-[12px] text-right font-bold">
                        Rs. {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    <div className="min-h-[190px] flex items-center justify-center text-gray-500">
      {text}
    </div>
  );
}
