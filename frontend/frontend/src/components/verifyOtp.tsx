

"use client";
import { axiosIntance } from "@/lib/axios";
import { ArrowLeft, ArrowRight, Loader2, Lock } from "lucide-react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import React, { useEffect, useRef, useState } from "react";
import { useAppData } from "@/context/appContext";
import Loading from "./Loading";
import toast from "react-hot-toast";

function VerifyOtp() {
    const{isAuth,setIsAuth,setUser,loading:userLoading ,fetchChats , fetchAllUsers} = useAppData();
  const [loading, setLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<Array<HTMLInputElement>>([]);
  const router = useRouter();


  const searchParams = useSearchParams();

  const email: string = searchParams.get("email") || "";

  const handleInputChange = (index: number, value: string): void => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
      setError("")

    if (value && index < 5) {
      inputRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);

    if (digits.length === 6) {
      const newOtp = digits.split("");
      setOtp(newOtp);
      inputRef.current[5].focus();
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLElement>
  ): Promise<void> => {
    e.preventDefault();
    const otpString = otp.join("");

    if(otpString.length !== 6){
      setError("Please enter all 6 digits")
    };

    setError("")

    try {
      setLoading(true)
      const{data} = await axiosIntance.post('/users/verify',{
        email,
        otp:otpString
      });

      toast.success(data.message);
      Cookies.set("token",data.token ,{
        expires:15,
        secure:false,
        path:"/"
      })
      setOtp(["","","","","",""]);
      inputRef.current[0]?.focus()
      setLoading(false);
      setUser(data.user);
      setIsAuth(true);
      fetchChats();
      fetchAllUsers();
    } catch (error:any) {
      setError(error.response.data.message);
      setLoading(false)
    }
  };


  const handleResendOtp  = async () => {
    try {
      setResendLoading(true)
      const{data} = await axiosIntance.post('/users/login',{
        email
      });

      toast.success(data.message);
     setTimer(60)
     setError("")
      setResendLoading(false)
    } catch (error:any) {
      setError(error.response.data.message);
      setResendLoading(false)
    }
  }
  
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  
if(isAuth) redirect('/chat');
if(userLoading) return <Loading />
  return (
    <div>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
            <div className="text-center mb-8 relative">
              <button className="absolute top-0 left-0 p-2  bg-gray-700 rounded-2xl text-white " onClick={() => router.push('/login')}>
                <ArrowLeft  />
                <p className="text-xs"></p>
              </button>
              <div className="w-20 h-20 bg-blue-700 mx-auto rounded-lg flex items-center justify-center mb-6">
                <Lock size={40} className="text-white" />
              </div>
              <h1 className="text-4xl text-white font-bold mb-3">
                Verify your Email
              </h1>
              <p className=" text-gray-300">
                we have send 6 digit code to your email
              </p>
              <p className="font-medium text-blue-300 underline">{email}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-300 text-sm font-medium mb-2 text-center"
                >
                  Enter your 6-digit OTP
                </label>

                <div className="flex items-center justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el: HTMLInputElement) => {
                        inputRef.current[index] = el;
                      }}
                      value={digit}
                      maxLength={1}
                      type="text"
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-12 rounded-2xl text-white bg-gray-700 broder-2 border-gray-600 text-center font-bold text-xl"
                    />
                  ))}
                </div>
              </div>
              {error && <div className=" border-red-700 rounded-2xl p-3">
                <p className="text-center text-red-300 text-sm">{error}</p>
                </div>}
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 font-semibold
             text-white px-4 py-4 rounded-2xl "
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="">Verify</span>
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ArrowRight className="text-white" />
                  )}
                </div>
              </button>
            </form>
            <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm font-medium">Din't receive the Otp?</p>
                    {
                      timer > 0 ? (
                        <p className="text-gray-400 text-sm font-medium">Resend otp in {timer} seconds</p>
                      ):(
                        <button onClick={handleResendOtp} className="text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50" disabled={resendLoading}>
                          {resendLoading ? "Sending" : "Resend Otp"}
                        </button>
                      )
                    }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
