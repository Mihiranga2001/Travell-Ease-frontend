import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaRobot,
  FaSearch,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCloudRain,
  FaUsers,
  FaStar,
  FaImage,
  FaShieldAlt,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API_URL = "http://localhost:3000/api";

export default function AdminAIMonitoringPage() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedAlert, setSelectedAlert] = useState(null);

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async function loadAIAlerts() {
    try {
      setLoading(true);

      let response;

      try {
        response = await axios.get(`${API_URL}/ai-alerts/admin/all`, getAuthHeader());
      } catch {
        response = await axios.get(`${API_URL}/ai-alerts`, getAuthHeader());
      }

      const alertList = Array.isArray(response.data)
        ? response.data
        : response.data.alerts || response.data.aiAlerts || response.data.data || [];

      setAlerts(alertList);
      setFilteredAlerts(alertList);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load AI alerts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAIAlerts();
  }, []);

  useEffect(() => {
    let result = [...alerts];

    if (searchText.trim() !== "") {
      const search = searchText.toLowerCase();

      result = result.filter((alert) => {
        const title = alert.title || "";
        const description = alert.description || alert.message || "";
        const location = alert.location || alert.placeName || "";
        const type = getAlertType(alert);

        return (
          title.toLowerCase().includes(search) ||
          description.toLowerCase().includes(search) ||
          location.toLowerCase().includes(search) ||
          type.toLowerCase().includes(search)
        );
      });
    }

    if (typeFilter !== "all") {
      result = result.filter((alert) => getAlertType(alert) === typeFilter);
    }

    if (severityFilter !== "all") {
      result = result.filter((alert) => getSeverity(alert) === severityFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((alert) => getAlertStatus(alert) === statusFilter);
    }

    setFilteredAlerts(result);
  }, [searchText, typeFilter, severityFilter, statusFilter, alerts]);

  function getAlertType(alert) {
    return alert.alertType || alert.type || "safety";
  }

  function getSeverity(alert) {
    return alert.severity || alert.level || "medium";
  }

  function getAlertStatus(alert) {
    return alert.status || (alert.isResolved ? "resolved" : "active");
  }

  function getAlertTitle(alert) {
    return alert.title || "AI Alert";
  }

  function getAlertDescription(alert) {
    return alert.description || alert.message || "No description available";
  }

  function getLocation(alert) {
    return alert.location || alert.placeName || alert.city || "Not specified";
  }

  function getConfidence(alert) {
    return alert.confidence || alert.confidenceScore || alert.score || 0;
  }

  function getAlertIcon(type) {
    if (type === "fake_review") return <FaStar />;
    if (type === "sentiment") return <FaExclamationTriangle />;
    if (type === "image_recognition") return <FaImage />;
    if (type === "weather") return <FaCloudRain />;
    if (type === "crowd") return <FaUsers />;
    if (type === "safety") return <FaShieldAlt />;
    return <FaRobot />;
  }

  function getSeverityColor(severity) {
    if (severity === "high") return "bg-red-600";
    if (severity === "medium") return "bg-orange";
    if (severity === "low") return "bg-green-600";
    return "bg-gray-600";
  }

  function getStatusColor(status) {
    if (status === "resolved") return "bg-green-600";
    if (status === "dismissed") return "bg-gray-600";
    if (status === "active") return "bg-red-600";
    return "bg-orange";
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Not added";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleStatusChange(alert, newStatus) {
    try {
      await axios.put(
        `${API_URL}/ai-alerts/${alert._id}`,
        {
          status: newStatus,
          isResolved: newStatus === "resolved",
        },
        getAuthHeader()
      );

      toast.success("AI alert status updated");
      loadAIAlerts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update alert");
    }
  }

  async function handleResolveAlert(alert) {
    try {
      await axios.put(
        `${API_URL}/ai-alerts/${alert._id}`,
        {
          status: "resolved",
          isResolved: true,
        },
        getAuthHeader()
      );

      toast.success("AI alert resolved");
      loadAIAlerts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to resolve alert");
    }
  }

  async function handleDismissAlert(alert) {
    try {
      const confirmDismiss = window.confirm(
        "Are you sure you want to dismiss this AI alert?"
      );

      if (!confirmDismiss) return;

      await axios.put(
        `${API_URL}/ai-alerts/${alert._id}`,
        {
          status: "dismissed",
          isResolved: false,
        },
        getAuthHeader()
      );

      toast.success("AI alert dismissed");
      loadAIAlerts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to dismiss alert");
    }
  }

  async function handleDeleteAlert(alert) {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this AI alert?"
      );

      if (!confirmDelete) return;

      await axios.delete(`${API_URL}/ai-alerts/${alert._id}`, getAuthHeader());

      toast.success("AI alert deleted successfully");
      loadAIAlerts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete alert");
    }
  }

  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter((alert) => getAlertStatus(alert) === "active")
    .length;
  const resolvedAlerts = alerts.filter(
    (alert) => getAlertStatus(alert) === "resolved"
  ).length;
  const highRiskAlerts = alerts.filter((alert) => getSeverity(alert) === "high")
    .length;

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            AI Monitoring
          </h1>
          <p className="text-gray-500 mt-[5px]">
            Monitor AI alerts, fake review detection, sentiment analysis, image
            recognition, weather risks and safety warnings.
          </p>
        </div>

        <button
          onClick={loadAIAlerts}
          className="flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <AIStatCard
          title="Total AI Alerts"
          value={totalAlerts}
          icon={<FaRobot />}
          color="bg-blue-600"
        />

        <AIStatCard
          title="Active Alerts"
          value={activeAlerts}
          icon={<FaExclamationTriangle />}
          color="bg-red-600"
        />

        <AIStatCard
          title="Resolved Alerts"
          value={resolvedAlerts}
          icon={<FaCheckCircle />}
          color="bg-green-600"
        />

        <AIStatCard
          title="High Risk"
          value={highRiskAlerts}
          icon={<FaShieldAlt />}
          color="bg-orange"
        />
      </div>

      {/* AI Modules Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-[15px] mb-[25px]">
        <AIModuleCard title="Fake Reviews" icon={<FaStar />} />
        <AIModuleCard title="Sentiment" icon={<FaExclamationTriangle />} />
        <AIModuleCard title="Images" icon={<FaImage />} />
        <AIModuleCard title="Weather" icon={<FaCloudRain />} />
        <AIModuleCard title="Crowds" icon={<FaUsers />} />
        <AIModuleCard title="Safety" icon={<FaShieldAlt />} />
      </div>

      {/* Filters */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute top-[15px] left-[15px] text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, description, location or type"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All AI Alert Types</option>
            <option value="fake_review">Fake Review Detection</option>
            <option value="sentiment">Sentiment Analysis</option>
            <option value="image_recognition">Image Recognition</option>
            <option value="weather">Weather Alert</option>
            <option value="crowd">Crowded Location</option>
            <option value="safety">Safety Risk</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Severity Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex justify-between items-center mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              AI Alerts
            </h2>
            <p className="text-sm text-gray-500">
              Showing {filteredAlerts.length} alert(s)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="w-full min-h-[250px] flex justify-center items-center text-gray-500">
            Loading AI monitoring data...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="w-full min-h-[250px] flex flex-col justify-center items-center text-gray-500">
            <FaRobot className="text-5xl text-accent mb-[15px]" />
            <p className="font-semibold">No AI alerts found</p>
            <p className="text-sm">
              Fake reviews, safety warnings and AI risks will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1100px]">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-[12px]">Alert</th>
                  <th className="py-[12px]">Type</th>
                  <th className="py-[12px]">Location</th>
                  <th className="py-[12px]">Confidence</th>
                  <th className="py-[12px]">Severity</th>
                  <th className="py-[12px]">Status</th>
                  <th className="py-[12px]">Date</th>
                  <th className="py-[12px] text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAlerts.map((alert) => {
                  const type = getAlertType(alert);
                  const severity = getSeverity(alert);
                  const status = getAlertStatus(alert);

                  return (
                    <tr key={alert._id} className="border-b text-sm">
                      <td className="py-[14px]">
                        <div className="flex items-center gap-[12px]">
                          <div className="w-[45px] h-[45px] rounded-full bg-accent text-white flex items-center justify-center text-xl">
                            {getAlertIcon(type)}
                          </div>

                          <div className="max-w-[300px]">
                            <p className="font-bold text-gray-800">
                              {getAlertTitle(alert)}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-[3px]">
                              {getAlertDescription(alert)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-[14px] text-gray-600 capitalize">
                        {type.replace("_", " ")}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        {getLocation(alert)}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        {getConfidence(alert)}%
                      </td>

                      <td className="py-[14px]">
                        <span
                          className={`${getSeverityColor(
                            severity
                          )} px-[10px] py-[5px] rounded-full text-xs text-white capitalize`}
                        >
                          {severity}
                        </span>
                      </td>

                      <td className="py-[14px]">
                        <select
                          value={status}
                          onChange={(e) =>
                            handleStatusChange(alert, e.target.value)
                          }
                          className={`${getStatusColor(
                            status
                          )} px-[10px] py-[6px] rounded-lg text-xs text-white border-none outline-none capitalize`}
                        >
                          <option value="active">Active</option>
                          <option value="resolved">Resolved</option>
                          <option value="dismissed">Dismissed</option>
                        </select>
                      </td>

                      <td className="py-[14px] text-gray-600">
                        {formatDate(alert.createdAt || alert.date)}
                      </td>

                      <td className="py-[14px]">
                        <div className="flex justify-center gap-[8px]">
                          <button
                            onClick={() => setSelectedAlert(alert)}
                            className="w-[35px] h-[35px] rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
                            title="View Alert"
                          >
                            <FaEye />
                          </button>

                          {status !== "resolved" && (
                            <button
                              onClick={() => handleResolveAlert(alert)}
                              className="w-[35px] h-[35px] rounded-lg bg-green-600 hover:bg-green-700 flex items-center justify-center text-white"
                              title="Resolve Alert"
                            >
                              <FaCheckCircle />
                            </button>
                          )}

                          {status !== "dismissed" && (
                            <button
                              onClick={() => handleDismissAlert(alert)}
                              className="w-[35px] h-[35px] rounded-lg bg-orange hover:bg-orange/80 flex items-center justify-center text-white"
                              title="Dismiss Alert"
                            >
                              <FaTimesCircle />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteAlert(alert)}
                            className="w-[35px] h-[35px] rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center text-white"
                            title="Delete Alert"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-[20px]">
          <div className="w-full max-w-[750px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-[25px]">
            <div className="flex justify-between items-center mb-[20px]">
              <div>
                <h2 className="text-2xl font-bold text-accent">
                  AI Alert Details
                </h2>
                <p className="text-sm text-gray-500">
                  Review AI detected risk, confidence score and admin status.
                </p>
              </div>

              <button
                onClick={() => setSelectedAlert(null)}
                className="w-[35px] h-[35px] rounded-full bg-gray-200 hover:bg-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-[15px] bg-gray-50 border border-gray-200 rounded-xl p-[15px] mb-[20px]">
              <div className="w-[60px] h-[60px] rounded-full bg-accent text-white flex items-center justify-center text-2xl">
                {getAlertIcon(getAlertType(selectedAlert))}
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {getAlertTitle(selectedAlert)}
                </h3>
                <p className="text-sm text-gray-500 capitalize">
                  {getAlertType(selectedAlert).replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
              <DetailItem label="Alert ID" value={selectedAlert._id} />
              <DetailItem
                label="Alert Type"
                value={getAlertType(selectedAlert).replace("_", " ")}
              />
              <DetailItem label="Location" value={getLocation(selectedAlert)} />
              <DetailItem label="Severity" value={getSeverity(selectedAlert)} />
              <DetailItem label="Status" value={getAlertStatus(selectedAlert)} />
              <DetailItem
                label="Confidence"
                value={`${getConfidence(selectedAlert)}%`}
              />
              <DetailItem
                label="Created Date"
                value={formatDate(selectedAlert.createdAt || selectedAlert.date)}
              />
              <DetailItem
                label="Related Record"
                value={
                  selectedAlert.relatedId ||
                  selectedAlert.reviewId ||
                  selectedAlert.mediaId ||
                  "Not linked"
                }
              />
            </div>

            <div className="mt-[15px] border border-gray-200 rounded-lg p-[12px]">
              <p className="text-sm text-gray-500 mb-[5px]">Description</p>
              <p className="text-gray-800 leading-relaxed">
                {getAlertDescription(selectedAlert)}
              </p>
            </div>

            {selectedAlert.aiRecommendation && (
              <div className="mt-[15px] border border-blue-200 bg-blue-50 rounded-lg p-[12px]">
                <p className="text-sm text-blue-600 mb-[5px]">
                  AI Recommendation
                </p>
                <p className="text-blue-700">
                  {selectedAlert.aiRecommendation}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-[10px] mt-[20px]">
              {getAlertStatus(selectedAlert) !== "resolved" && (
                <button
                  onClick={() => {
                    handleResolveAlert(selectedAlert);
                    setSelectedAlert(null);
                  }}
                  className="px-[18px] py-[10px] rounded-lg bg-green-600 text-white font-semibold"
                >
                  Mark Resolved
                </button>
              )}

              {getAlertStatus(selectedAlert) !== "dismissed" && (
                <button
                  onClick={() => {
                    handleDismissAlert(selectedAlert);
                    setSelectedAlert(null);
                  }}
                  className="px-[18px] py-[10px] rounded-lg bg-orange text-white font-semibold"
                >
                  Dismiss
                </button>
              )}

              <button
                onClick={() => setSelectedAlert(null)}
                className="px-[18px] py-[10px] rounded-lg bg-gray-200 text-gray-700 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AIStatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-3xl font-bold text-gray-800 mt-[6px]">
          {value}
        </h2>
      </div>

      <div
        className={`${color} w-[55px] h-[55px] rounded-full flex items-center justify-center text-white text-2xl`}
      >
        {icon}
      </div>
    </div>
  );
}

function AIModuleCard({ title, icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-[15px] flex items-center gap-[12px]">
      <div className="w-[40px] h-[40px] rounded-full bg-accent text-white flex items-center justify-center text-lg">
        {icon}
      </div>

      <p className="font-semibold text-gray-700 text-sm">{title}</p>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="border border-gray-200 rounded-lg p-[12px]">
      <p className="text-sm text-gray-500 mb-[4px]">{label}</p>
      <p className="font-semibold text-gray-800 break-words capitalize">
        {value}
      </p>
    </div>
  );
}