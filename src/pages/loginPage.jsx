import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function LoginPage() {

    const[email,setEmail] = useState("")
    const[password,setPassword] = useState("")

    async function login(){
        console.log("Email: ",email);
        console.log("Password: ",password);

        try{
            const res = await axios.post("http://localhost:3000/users/login",{
                email : email,
                password : password,
            })

            console.log(res.data);
        }catch(err){
            console.log(err)
        }

    }

    return (
        <div className="w-full h-screen bg-[url(/bg.jpg)] bg-center bg-cover bg-no-repeat flex">
            <div className="w-[50%] h-full flex justify-center items-center flex-col">
                <img src="/logo.png" alt="Smart AI Travel Platform Logo" className="w-[300px] h-[300px] mb-[20px] object-contain"/>
                <h1 className="text-5xl text-orange text-shadow-accent text-shadow-2xl text-center font-bold">Discover Smarter. Travel Better.</h1>
                <p className="text-[30px] text-primary text-center italic ">Plan trips, book hotels, rent vehicles, connect with travelers, and explore Sri Lanka with AI-powered travel recommendations.</p>

            </div>
            <div className="w-[50%] h-full flex justify-center items-center">
                <div className="w-[450px] h-[600px] backdrop-blur-lg shadow-2xl rounded-2xl flex flex-col justify-center items-center p-[30px]">
                    <h1 className="text-3xl text-accent font-bold mb-[20px] text-shadow-primary text-center">Login</h1>
                    <input onChange={(e)=>{
                        setEmail(e.target.value)
                    }}
                        type="email"
                        placeholder="Your email"
                        className="w-full h-[50px] mb-[20px] rounded-lg border border-accent p-[10px] text-[20px] focus:outline-none focus:ring-2 focus:ring-orange"
                    />

                    <input onChange={(e)=>{
                        setPassword(e.target.value)
                    }}
                        type="password"
                        placeholder="Your password"
                        className="w-full h-[50px] rounded-lg border border-accent p-[10px] text-[20px] focus:outline-none focus:ring-2 focus:ring-orange"
                    />

                    <p className="text-white not-italic w-full mb-[20px] text-center">
                        Forgot your password?{" "}
                        <Link to="/forgot-password" className="text-orange italic">
                        Reset it here
                        </Link>
                    </p>

                    <button onClick={login}
                        type="submit"
                        className="w-full h-[50px] mb-[20px] bg-accent text-white font-bold text-[20px] rounded-lg border-[2px] border-accent hover:bg-transparent hover:text-accent">
                            Login
                    </button>

                    <button
                        type="button"
                        className="w-full h-[50px] bg-accent text-white font-bold text-[20px] rounded-lg border-[2px] border-accent hover:bg-transparent hover:text-accent">
                        Login with <FcGoogle className="inline ml-2 mb-1" />
                    </button>

                    <p className="text-primary not-italic mt-[20px] text-center">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-orange italic">
                        Register here
                    </Link>
                    </p>
                </div>
                
            </div>
        </div>
    );
}