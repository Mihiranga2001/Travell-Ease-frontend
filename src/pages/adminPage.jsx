import {MdDashboard,MdOutlineRateReview,MdOutlinePendingActions,MdSettings,} from "react-icons/md";
import {FiUsers,FiMapPin,FiImage,FiBarChart2,} from "react-icons/fi";
import {FaHotel,FaCar,FaUserTie,FaRobot,} from "react-icons/fa";
import {LuClipboardList,} from "react-icons/lu";
import { Link } from "react-router-dom";

export default function AdminPage() {
  return (
    <div className="w-full min-h-screen bg-accent flex">
        <div className="w-[300px] bg-accent min-h-screen">
            <div className="w-full h-[100px] gap-10 pl-[10px] flex items-center text-primary">
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
        <div className="w-[calc(100%-300px)] min-h-screen max-h-full bg-primary border-[10px] rounded-3xl border-accent">
             Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellendus inventore quas beatae corrupti aliquid minima recusandae, accusantium iure nobis quos voluptate numquam. Placeat nam voluptatem ipsa quod voluptate numquam aspernatur beatae quo id eos eum sapiente, minus praesentium eius? Commodi, quia ipsa? Sapiente dignissimos sit voluptate mollitia ex cupiditate eos eius, enim eligendi natus esse blanditiis facere veniam error earum asperiores accusamus recusandae? Rem illum, alias maxime itaque corporis ipsam, cumque ab magni quos aspernatur soluta explicabo necessitatibus. Eos velit voluptate dolorem magnam dolorum cum exercitationem ratione nostrum atque possimus. Assumenda nesciunt quo blanditiis culpa minima amet reiciendis temporibus voluptate modi fugit voluptatibus nam maiores cupiditate, perspiciatis eius, dolore excepturi consequuntur delectus impedit molestias sunt. Dolore, vel modi ipsa dolorum ipsam, possimus ut vitae temporibus consequuntur hic corporis impedit ad reprehenderit provident aut officiis facilis totam dicta mollitia inventore? Debitis, amet? Ut, laudantium iure dolorem quasi voluptate in blanditiis dignissimos dolor? Quidem minus cumque ipsum animi, a expedita eaque fugit maiores, tempore, earum atque aut porro vel recusandae. Veritatis culpa ducimus vero, tempore exercitationem eligendi earum, dolorem nemo laboriosam et consequuntur dignissimos reprehenderit tempora. Vitae labore, cumque animi nisi cupiditate eius, repellat voluptatem deleniti error saepe velit beatae repudiandae obcaecati eos nobis possimus fugit sed ducimus suscipit. Cumque reprehenderit quis at qui accusamus velit eaque, minima quidem ut asperiores corporis in facere voluptate tenetur, quaerat id maiores sit rerum necessitatibus, natus eligendi illum facilis? Veritatis reprehenderit, perferendis est quo, quam magni mollitia dolorum ducimus iste ex nesciunt eum provident! Eligendi deserunt vitae voluptas eveniet ab esse. Dolorem corrupti aliquid eos laborum dolores pariatur repellendus rerum officiis sit vitae eaque, dicta qui eveniet ipsam debitis beatae id quas. Debitis molestias laboriosam, temporibus, unde dolorem soluta aliquam quidem corrupti officiis neque quis expedita ipsa aliquid, cupiditate sed labore. Saepe eum, iusto explicabo ad assumenda dolor nemo consequatur doloremque architecto voluptatum recusandae quisquam ex impedit perferendis perspiciatis, nam doloribus nostrum mollitia. Doloremque beatae adipisci aperiam eaque fuga impedit perferendis eveniet explicabo, nostrum facilis temporibus saepe nulla pariatur? Tenetur inventore aut tempora impedit, consectetur odit placeat dolorem! Voluptatibus similique, molestias quas saepe laborum porro nihil sunt quaerat, quae at iste ex doloremque. Fugit illum vero voluptatem. Totam soluta maiores quo, quibusdam commodi non recusandae dolorem, sed explicabo voluptatem reiciendis ipsam dignissimos consequatur magnam est libero eum autem eligendi nostrum, corrupti deserunt quis? Minus earum obcaecati cupiditate! Assumenda facilis, sapiente atque perferendis porro totam! Mollitia commodi in facere. Beatae, officiis exercitationem. Assumenda harum ad aut, corporis delectus officia est natus cumque nostrum tenetur exercitationem eius adipisci? Veritatis inventore quisquam repellendus dolore eaque voluptas eum, provident adipisci ipsam ratione. Fugiat enim aperiam cum dolorum nostrum veritatis, voluptates at blanditiis, unde eligendi, neque repudiandae? Explicabo labore aut fuga voluptate odio recusandae? Nesciunt aperiam vitae quod, explicabo alias quos, deleniti dignissimos sint eius architecto cumque. Libero cupiditate earum quae debitis quos. Adipisci beatae ea quis. Provident repellendus hic dolore. Ducimus, necessitatibus placeat excepturi voluptatibus fugit corporis quasi facere illo doloribus quo repellat amet laborum aut repellendus deleniti, ex aperiam voluptates dolore enim ut minus mollitia officia possimus impedit! Delectus et quaerat iusto quibusdam cum voluptatibus quae eius quod sunt minus. Error incidunt, ipsa excepturi doloremque expedita temporibus, quam ut explicabo ducimus quod neque tempore fuga placeat fugiat quisquam repudiandae. Voluptate harum voluptas necessitatibus aliquam quaerat adipisci repudiandae sunt amet similique sequi ipsam architecto consequatur, fugiat laudantium inventore perspiciatis aut! Vel, officia iste repellat, quo itaque odio nostrum, necessitatibus nihil facilis commodi atque consequatur nulla error minima perspiciatis tenetur. Illum, enim dolor! Adipisci perspiciatis est, tempora similique fugiat quisquam asperiores, placeat voluptate aperiam rem aliquam commodi inventore deleniti! Optio tempore, voluptatibus porro illum sit velit error quas vitae totam sequi quos aperiam iusto nemo, molestiae quidem architecto vero suscipit dolores corporis? Debitis ab veritatis ducimus, impedit fugit et nobis reprehenderit, harum repellat, esse explicabo mollitia cupiditate ipsa sint alias aliquam dolore est similique numquam laborum eius! Reprehenderit, sit quidem dignissimos veritatis soluta minus aspernatur quaerat rerum cumque molestiae provident commodi voluptatibus aliquid nemo recusandae porro vitae ducimus accusamus amet voluptatum ratione quia ipsam, autem temporibus? Quaerat quis rem qui non ab alias dolore aliquam vel tenetur perspiciatis, architecto nostrum laborum, est quam doloremque sequi tempora corporis. Consectetur iste dignissimos assumenda, quo animi at ipsum tenetur ratione eaque quasi tempora molestias porro beatae pariatur! Voluptate obcaecati dolorem delectus. Exercitationem, nulla illum reprehenderit laborum quod facilis atque, laboriosam sed quia nostrum inventore quis cum aperiam natus debitis temporibus! Id libero hic expedita tempore commodi fugiat ducimus illum ipsa cupiditate veritatis officia quisquam tempora a quam itaque vero vel, suscipit placeat repellat repellendus doloremque earum quidem eius totam. Neque optio repellat, quod obcaecati assumenda est distinctio debitis animi nesciunt vero adipisci repellendus voluptatem mollitia incidunt nulla, quibusdam aliquid molestiae vel. Molestiae, quasi perspiciatis corporis eos molestias aut aliquid asperiores quo minima numquam?
        </div>
    </div>
  );
}