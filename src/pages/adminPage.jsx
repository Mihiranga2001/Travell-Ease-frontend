import {MdDashboard,MdOutlineRateReview,MdOutlinePendingActions,MdSettings,} from "react-icons/md";
import {FiUsers,FiMapPin,FiImage,FiBarChart2,} from "react-icons/fi";
import {FaHotel,FaCar,FaUserTie,FaRobot,} from "react-icons/fa";
import {LuClipboardList,} from "react-icons/lu";
import { Link, Route, Routes } from "react-router-dom";
import AdminDashboardPage from "./admin/adminDashboardPage";
import AdminUsersPage from "./admin/adminUsersPage";
import AdminTouristPlacesPage from "./admin/adminTouristPlacesPage";
import AdminHotelsPage from "./admin/adminHotelsPage";
import AdminVehiclesPage from "./admin/adminVehiclesPage";
import AdminTravelGuidesPage from "./admin/adminTravelGuidesPage";
import AdminBookingsPage from "./admin/adminBookingsPage";
import AdminMediaApprovalPage from "./admin/adminMediaApprovalPage";
import AdminReviewsPage from "./admin/adminReviewsPage";
import AdminApprovalsPage from "./admin/adminApprovalsPage";
import AdminAIMonitoringPage from "./admin/adminAIMonitoringPage";
import AdminReportsPage from "./admin/adminReportsPage";
import AdminSettingsPage from "./admin/adminSettingsPage";


export default function AdminPage() {
  return (
    <div className="w-full min-h-screen bg-accent flex">
        <div className="w-[250px] bg-accent min-h-screen">
            <div className="w-full h-[100px] gap-5 pl-[10px] flex items-center text-primary">
                <img src="/logo.png" className="h-[50px] w-[150px]"/>
                <h1 className="text-2xl text-center">Admin</h1>
            </div>
            <div className="w-full text-1.7xl text-primary flex flex-col gap-[10px] pl-[20px]">

                <Link to="/admin" className="w-full flex items-center h-[30px] gap-[5px]"><MdDashboard />Dashboard</Link>

                <Link to="/admin/users" className="w-full flex items-center h-[30px] gap-[5px]"> <FiUsers />Users</Link>

                <Link to="/admin/places" className="w-full flex items-center h-[30px] gap-[5px]"><FiMapPin />Tourist Places</Link>

                <Link to="/admin/hotels" className="w-full flex items-center h-[30px] gap-[5px]"><FaHotel />Hotels</Link>

                <Link to="/admin/vehicles" className="w-full flex items-center h-[30px] gap-[5px]"><FaCar />Vehicles</Link>

                <Link to="/admin/guides" className="w-full flex items-center h-[30px] gap-[5px]"><FaUserTie />Travel Guides</Link>

                <Link to="/admin/bookings" className="w-full flex items-center h-[30px] gap-[5px]"><LuClipboardList />Bookings</Link>

                <Link to="/admin/media" className="w-full flex items-center h-[30px] gap-[5px]"><FiImage />Media Approval</Link>

                <Link to="/admin/reviews" className="w-full flex items-center h-[30px] gap-[5px]"><MdOutlineRateReview />Reviews</Link>

                <Link to="/admin/approvals" className="w-full flex items-center h-[30px] gap-[5px]"><MdOutlinePendingActions />Approvals</Link>

                <Link to="/admin/ai-monitoring" className="w-full flex items-center h-[30px] gap-[5px]"><FaRobot />AI Monitoring</Link>

                <Link to="/admin/reports" className="w-full flex items-center h-[30px] gap-[5px]"><FiBarChart2 />Reports</Link>

                <Link to="/admin/settings" className="w-full flex items-center h-[30px] gap-[5px]"><MdSettings />Settings</Link>
                
            </div>

        </div>
        <div className="w-[calc(100%-250px)] min-h-screen max-h-full bg-primary border-[10px] rounded-3xl border-accent">
            <Routes>
                <Route path="/" element={<AdminDashboardPage/>} />

                <Route path="/users" element={<AdminUsersPage />} />

                <Route path="/places" element={<AdminTouristPlacesPage />} />

                <Route path="/hotels" element={<AdminHotelsPage />} />

                <Route path="/vehicles" element={<AdminVehiclesPage/>} />

                <Route path="/guides" element={<AdminTravelGuidesPage/>} />

                <Route path="/bookings" element={<AdminBookingsPage/>} />

                <Route path="/media" element={<AdminMediaApprovalPage/>} />

                <Route path="/reviews" element={<AdminReviewsPage/>} />

                <Route path="/approvals" element={<AdminApprovalsPage/>} />

                <Route path="/ai-monitoring" element={<AdminAIMonitoringPage/>} />

                <Route path="/reports" element={<AdminReportsPage/>} />

                <Route path="/settings" element={<AdminSettingsPage/>}/>
            </Routes>    
        </div>
    </div>
  );
}