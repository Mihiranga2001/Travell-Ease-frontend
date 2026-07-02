import {MdDashboard,MdOutlineRateReview,MdOutlinePendingActions,MdSettings,} from "react-icons/md";
import {FiUsers,FiMapPin,FiImage,FiBarChart2,} from "react-icons/fi";
import {FaHotel,FaCar,FaUserTie,FaRobot,} from "react-icons/fa";
import {LuClipboardList,} from "react-icons/lu";
import { Link, Route, Routes } from "react-router-dom";

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
                <Route path="/" element={<h1>AdminDashboardPage</h1>} />

                <Route path="/users" element={<h1>AdminUsersPage</h1>} />

                <Route path="/places" element={<h1>AdminPlacesPage</h1>} />
                <Route path="/add-place" element={<h1>AdminAddPlacePage</h1>} />
                <Route path="/update-place" element={<h1>AdminUpdatePlacePage</h1>} />

                <Route path="/hotels" element={<h1>AdminHotelsPage</h1>} />
                <Route path="/add-hotel" element={<h1>AdminAddHotelPage</h1>} />
                <Route path="/update-hotel" element={<h1>AdminUpdateHotelPage</h1>} />

                <Route path="/vehicles" element={<h1>AdminVehiclesPage</h1>} />
                <Route path="/add-vehicle" element={<h1>AdminAddVehiclePage</h1>} />
                <Route path="/update-vehicle" element={<h1>AdminUpdateVehiclePage</h1>} />

                <Route path="/guides" element={<h1>AdminGuidesPage</h1>} />
                <Route path="/add-guide" element={<h1>AdminAddGuidePage</h1>} />
                <Route path="/update-guide" element={<h1>AdminUpdateGuidePage</h1>} />

                <Route path="/bookings" element={<h1>AdminBookingsPage</h1>} />

                <Route path="/media" element={<h1>AdminMediaApprovalPage</h1>} />

                <Route path="/reviews" element={<h1>AdminReviewsPage</h1>} />

                <Route path="/approvals" element={<h1>AdminApprovalsPage</h1>} />

                <Route path="/ai-monitoring" element={<h1>AdminAIMonitoringPage</h1>} />

                <Route path="/reports" element={<h1>AdminReportsPage</h1>} />

                <Route path="/settings" element={<h1>AdminSettingsPage</h1>} />
            </Routes>    
        </div>
    </div>
  );
}