import { LuBoxes, LuClipboardList } from "react-icons/lu";
import { FiUsers } from "react-icons/fi";
import { MdOutlineRateReview } from "react-icons/md";
import { Link } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import AdminPlacesPage from "./adminPlacesPage";
import AdminOrdersPage from "./adminOrdersPage";
import AdminUsersPage from "./adminUsersPage";
import AdminReviewPage from "./adminReviewPage";

export default function AdminPage() {
  return(
       <div className="w-full min-h-screen flex bg-accent">
        <>
            <div className="w-[300px] bg-accent h-full">

                <div className="w-full h-[100px] flex items-center text-primary ">
                    <img src="/logo.png" className="h-full"/>
                    <h1 className="text-2xl">Admin</h1>
                </div>
                <div className="w-full h-[400px] text-white text-2xl flex flex-col pl-[20px] pt-[20px]">

                    <Link to="/admin" className="w-full flex items-center h-[50px] gap-[10px]"> <LuClipboardList />Orders</Link>
                    <Link to="/admin/products" className="w-full flex items-center h-[50px] gap-[10px]"> <LuBoxes />Products</Link>
                    <Link to="/admin/users" className="w-full flex items-center h-[50px] gap-[10px]"><FiUsers/>Users</Link>
                    <Link to="/admin/reviews" className="w-full flex items-center h-[50px] gap-[10px]"><MdOutlineRateReview />Reviews</Link>
                    
                    </div>
            </div>
            <div className="w-[calc(100%_-_300px)] h-full max-h-full bg-primary border-[10px] border-accent rounded-3xl overflow-y-scroll ">
            <Routes>
                <Route path="/" element={<AdminOrdersPage />}/>
                <Route path="/places" element={<AdminPlacesPage />}/>
                <Route path="/users" element={<AdminUsersPage/>}/>
                <Route path="/reviews" element={<AdminReviewPage/>}/>
            </Routes>
            </div>
            </>
            </div>

    );
}