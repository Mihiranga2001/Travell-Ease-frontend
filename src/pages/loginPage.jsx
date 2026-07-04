export default function LoginPage() {
    return (
        <div className="w-full h-screen bg-[url(/bg.jpg)] bg-center bg-cover bg-no-repeat flex">
            <div className="w-[50%] h-full flex justify-center items-center flex-col">
                <img src="/logo.png" alt="Smart AI Travel Platform Logo" className="w-[300px] h-[300px] mb-2 object-contain"/>
                <h1 className="text-5xl text-orange text-shadow-accent text-shadow-2xl text-center font-bold">Discover Smarter. Travel Better.</h1>
                <p className="text-[30px] text-primary text-center italic ">Plan trips, book hotels, rent vehicles, connect with travelers, and explore Sri Lanka with AI-powered travel recommendations.</p>

            </div>
            <div className="w-[50%] h-full flex justify-center items-center">
                <div className="w-[450px] h-[600px] backdrop-blur-lg shadow-2xl rounded-2xl">

                </div>
                
            </div>
        </div>
    );
}