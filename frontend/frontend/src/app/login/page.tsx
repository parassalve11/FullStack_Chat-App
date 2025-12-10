'use client'
import Loading from "@/components/Loading";
import { useAppData } from "@/context/appContext";
import { axiosIntance } from "@/lib/axios";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

function LoginPage() {
    const{isAuth,loading:userLoading} = useAppData();
    const[email,setEmail] = useState<string>("");
    const[loading , setLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = async(e:React.FormEvent<HTMLElement>):Promise<void> =>{
        e.preventDefault();
        try {
            setLoading(true)
            const{data} = await axiosIntance.post("/users/login",{email});
            
            router.push(`/verify?email=${email}`)
            toast.success(data.message)
            setLoading(false)
        } catch (error:any) {
            setLoading(false)
            toast.error(error?.response?.data?.message);
            
        }
    };

    if(isAuth) redirect("/chat");
    if(userLoading) return <Loading />
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-700 mx-auto rounded-lg flex items-center justify-center mb-6">
              <Mail size={40} className="text-white" />
            </div>
            <h1 className="text-4xl text-white font-bold mb-3">
              Welcome to Chat App
            </h1>
            <p className="text-sm text-gray-300">
              Enter you email to continue your journey
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-300 text-lg font-medium mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-4 bg-gray-700 border
                 border-gray-600 rounded-lg text-white placeholder-gray-300"
                 placeholder="Enter the Email"
                 value={email ?? ""}
                 onChange={(e:any) => setEmail(e.target.value)} 
                 required
              />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-semibold
             text-white px-4 py-4 rounded-2xl ">
                <div className="flex items-center justify-center gap-2">
                    <span className="">Send Verification code</span>
                   {loading ? <Loader2 className="animate-spin" /> : <ArrowRight className="text-white" />}
                </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
