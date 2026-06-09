import { useState } from "react";

export default function Test(){

    const[count,setcount] = useState(0)
    return (
        <div className = "w-full h-full flex justify-center items-center">
            <div className = "w-[400px] h-[400px] shadow-2xl flex justify-center items-center">
                <button onClick ={
                    () =>{
                        setcount(count+1)
                    }
                } className ="h-[30px] w-[30px] bg-red-500 text-white">
                    +
                </button>
                <h1 className= "h-[50px] w-[50px] text-center"> {count} </h1>

                <button onClick ={
                    () =>{
                        setcount(count-1)
                    }
                } className ="h-[30px] w-[30px] bg-blue-500 text-white">
                    -
                </button>
            </div>
        </div>
    )
    
}