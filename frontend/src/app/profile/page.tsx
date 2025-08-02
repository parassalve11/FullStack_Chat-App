"use client";

import { useAppData, user_service } from "@/context/appContext";
import { axiosIntance } from "@/lib/axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import { ArrowLeft, Save, User, UserCircle } from "lucide-react";
import axios from "axios";

export default function ProfilePage() {
  const { user, setUser, isAuth, logoutUser, loading } = useAppData();
  const [name, setName] = useState<string | undefined>("");
  const [isEdit, setIsEdit] = useState(false);
  const router = useRouter();

  const editHandler = () => {
    setIsEdit(!isEdit);
    setName(user?.name);
  };

  const submitHandler = async(e: any) => {
    e.preventDefault();
   const token = Cookies.get("token");

    try {
        
      const { data } = await axios.post(`${user_service}/users/update/user`,{name}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

     if(data?.token){
         Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
         path:"/"
      });
     }

      toast.success(data.message);
      setUser(data.user);
      setIsEdit(false);
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, loading, router]);

  if (loading) return <Loading />;
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/login")}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-2xl
             border border-gray-700"
          >
            <ArrowLeft className="size-5 text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl  font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400 mt-1">
              Mannage your account information
            </p>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 shadow-lg rounded-2xl">
          <div className="bg-gray-700 p-8 border-b  border-gray-600">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="size-20 rounded-full bg-gray-600 flex items-center justify-center ">
                  <UserCircle className="size-12 text-gray-300" />
                </div>
                <div
                  className="absolute -bottom-1 -right-1 size-6 bg-green-500 
                rounded-full border-2 border-gray-800"
                ></div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {user?.name || "User"}
                </h2>
                <p className="text-gray-300 text-sm">Active Now</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                Display Name
                </label>
                {isEdit ? (
                
                  <form onSubmit={submitHandler} className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-2xl
                         text-white placeholder-gray-400 "
                      />
                      <User className="absolute right-3 top-1/2  transform -translate-y-1/2 size-5 text-gray-400" />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700
                                    text-white font-semibold rounded-lg"
                      >
                        <Save className="w-4 h-4" /> Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={editHandler}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700
                                    text-white font-semibold rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    className="flex items-center justify-between p-4
                                bg-gray-700 rounded-1g border border-gray-600"
                  >
                    <span className="text-white font-medium text-1g">
                      {user?.name || "Not set"}
                    </span>
                    <button
                    type="button"
                      onClick={editHandler}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700
                                    text-white font-semibold rounded-lg"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
