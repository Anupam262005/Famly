
// import React, { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { motion } from "framer-motion";
// import { toast } from "react-toastify";
// import api from "../../utils/axios";
// import { useAuth } from "../../utils/authContext";
// import { UserPlus, LogIn } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const AuthCard = () => {
//   const [mode, setMode] = useState("signin"); // "signin" | "signup"
//   const [loading, setLoading] = useState(false);

//   const { login } = useAuth();
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [pendingEmail, setPendingEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [resendCooldown, setResendCooldown] = useState(0);

//   const navigate = useNavigate()
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm();

//   useEffect(() => {
//     if (resendCooldown <= 0) return;

//     const timer = setInterval(() => {
//       setResendCooldown((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [resendCooldown]);


//   const onSubmit = async (data) => {
//     setLoading(true);
//     try {
//       if (mode === "signin") {
//         const res = await api.post("/user/login", data);
//         console.log(res.data.data)
//         await login(res.data.data);
//         toast.success("Welcome back! Successfully signed in.");
//       } else {
//         if (data.password !== data.confirmPassword) {
//           toast.error("Passwords do not match!");
//           return;
//         }

//         const formData = new FormData();
//         Object.entries(data).forEach(([key, value]) => {
//           if (key !== 'confirmPassword') {
//             if (key === 'profilePhoto' && value.length > 0) {
//               formData.append(key, value[0]);  // Adding the first file from profilePhoto
//             } else {
//               formData.append(key, value);  // Append other fields normally
//             }
//           }
//         });

//         await api.post(
//           "/user/send-signup-otp",
//           formData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );

//         setPendingEmail(data.email);
//         setShowOtpModal(true);

//         toast.success(
//           "Verification code sent to your email."
//         );

//         // Don't login or navigate yet.
//         return;
//       }
//       if (mode === "signin") {
//         reset();
//         navigate("/");
//       }
//     } catch (err) {
//       console.error(err);
//       const errorMessage = err.response?.data?.message || "Something went wrong";
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOtp = async () => {
//     if (!otp.trim()) {
//       toast.error("Please enter OTP");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await api.post(
//         "/user/verify-signup-otp",
//         {
//           email: pendingEmail,
//           otp,
//         }
//       );

//       await login(res.data.data);

//       toast.success(
//         "Account created successfully! Welcome to FAMLY."
//       );

//       setShowOtpModal(false);
//       setOtp("");
//       setPendingEmail("");
//       setResendCooldown(0);

//       reset();
//       navigate("/");
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message ||
//         "OTP verification failed";

//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendOtp = async () => {
//     if (resendCooldown > 0) return;

//     try {
//       await api.post(
//         "/user/resend-signup-otp",
//         {
//           email: pendingEmail,
//         }
//       );

//       toast.success("A new OTP has been sent.");
//       setResendCooldown(30);
//     } catch (err) {
//       toast.error(
//         err.response?.data?.message ||
//         "Unable to resend OTP"
//       );
//     }
//   };




//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="w-full max-w-md bg-white/60 backdrop-blur-md border border-purple-100 rounded-2xl p-6 shadow-md"
//     >
//       <h2 className="text-center text-2xl font-semibold text-purple-700">
//         Welcome to FAMLY
//       </h2>
//       <p className="text-center text-sm text-purple-500 mb-4">
//         Sign in to your account or create a new one
//       </p>

//       {/* Tabs */}
//       <div className="flex mb-6 bg-purple-100 rounded-full p-1" >
//         <button
//           onClick={() => setMode("signin")}
//           className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-all ${mode === "signin"
//             ? "bg-white shadow text-purple-700 font-semibold"
//             : "text-purple-500"
//             }`}
//         >
//           <LogIn className="w-4 h-4" />
//           Sign In
//         </button>
//         <button
//           onClick={() => setMode("signup")}
//           className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-all ${mode === "signup"
//             ? "bg-white shadow text-purple-700 font-semibold"
//             : "text-purple-500"
//             }`}
//         >
//           <UserPlus className="w-4 h-4" />
//           Create Account
//         </button>
//       </div>



//       {/* Form */}
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         {mode === "signup" && (
//           <>
//             <div>
//               <label className="text-sm text-purple-700 font-medium">
//                 Full Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 {...register("fullname", { required: true })}
//                 placeholder="Enter your full name"
//                 className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//                 autoComplete="name"
//               />
//               {errors.fullname && (
//                 <span className="text-xs text-red-500">Full name required</span>
//               )}
//             </div>

//             <div>
//               <label className="text-sm text-purple-700 font-medium">
//                 Username <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 {...register("username", {
//                   required: "Username is required",
//                   pattern: {
//                     value: /^[a-zA-Z0-9_]+$/,
//                     message: "Username can only contain letters, numbers, and underscores (no spaces)",
//                   },
//                 })}
//                 placeholder="Choose a unique username"
//                 className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//                 autoComplete="username"
//               />
//               {errors.username && (
//                 <span className="text-xs text-red-500">{errors.username.message}</span>
//               )}
//             </div>

//             <div>
//               <label className="text-sm text-purple-700 font-medium">
//                 Email Address <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="email"
//                 {...register("email", {
//                   required: "Email is required",
//                   pattern: {
//                     value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
//                     message: "Email must end with @gmail.com",
//                   },
//                 })}
//                 placeholder="your@email.com"
//                 className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//                 autoComplete="email"
//               />
//               {errors.email && (
//                 <span className="text-xs text-red-500">{errors.email.message}</span>
//               )}
//             </div>

//             <div>
//               <label className="text-sm text-purple-700 font-medium">
//                 Phone Number <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="tel"
//                 {...register("phone_no", {
//                   required: "Phone number is required",
//                   pattern: {
//                     value: /^[0-9]{10}$/,
//                     message: "Phone number must be exactly 10 digits",
//                   },
//                 })}
//                 placeholder="+91 955 123 4567"
//                 className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//                 autoComplete="tel"
//               />
//               {errors.phone_no && (
//                 <span className="text-xs text-red-500">{errors.phone_no.message}</span>
//               )}
//             </div>

//             <div className="flex gap-3">
//               <div className="flex-1">
//                 <label className="text-sm text-purple-700 font-medium">
//                   Date of Birth <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   {...register("dob", { required: true })}
//                   className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//                   autoComplete="bday"
//                 />
//                 {errors.dob && (
//                   <span className="text-xs text-red-500">Date of birth required</span>
//                 )}
//               </div>
//               <div className="flex-1">
//                 <label className="text-sm text-purple-700 font-medium">
//                   Gender <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   {...register("gender", { required: true })}
//                   className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//                   autoComplete="sex"
//                 >
//                   <option value="">Select gender</option>
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>
//                 </select>
//                 {errors.gender && (
//                   <span className="text-xs text-red-500">Gender required</span>
//                 )}
//               </div>
//             </div>

//             <div>
//               <label className="text-sm text-purple-700 font-medium">
//                 Profile Photo <span className="text-xs text-purple-400">(Optional)</span>
//               </label>
//               <input
//                 type="file"
//                 {...register("profilePhoto")}
//                 className="w-full mt-1 px-3 py-2 border rounded-md file:mr-3 file:py-1 file:px-3 file:bg-purple-100 file:border-none"
//                 accept="image/*"
//               />
//             </div>
//           </>
//         )}

//         {/* Signin or Signup common fields */}
//         {mode === "signin" && (
//           <div>
//             <label className="text-sm text-purple-700 font-medium">
//               Email, Phone, or Username
//             </label>
//             <input
//               type="text"
//               {...register("identifier", { required: true })}
//               placeholder="Email, phone, or username"
//               className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//               autoComplete="username"
//             />
//             {errors.identifier && (
//               <span className="text-xs text-red-500">Email, phone, or username required</span>
//             )}
//             <p className="text-xs text-purple-400 mt-1">
//               You can use your email address, phone number, or username
//             </p>
//           </div>
//         )}

//         <div>
//           <label className="text-sm text-purple-700 font-medium">
//             Password <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="password"
//             {...register("password", { required: true })}
//             placeholder={mode === "signin" ? "Enter your password" : "Create a secure password"}
//             className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//             autoComplete={mode === "signin" ? "current-password" : "new-password"}
//           />
//           {errors.password && (
//             <span className="text-xs text-red-500">Password required</span>
//           )}
//         </div>

//         {mode === "signup" && (
//           <div>
//             <label className="text-sm text-purple-700 font-medium">
//               Confirm Password <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="password"
//               {...register("confirmPassword", { required: true })}
//               placeholder="Confirm your password"
//               className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//               autoComplete="new-password"
//             />
//             {errors.confirmPassword && (
//               <span className="text-xs text-red-500">Please confirm your password</span>
//             )}
//           </div>
//         )}

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white py-2 rounded-md font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? "Processing..." : (
//             <>
//               {mode === "signin" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
//               {mode === "signin" ? "Sign In" : "Create Account"}
//             </>
//           )}
//         </button>
//       </form>

//       <div className="border-t mt-6 pt-3 text-center text-xs text-purple-400">
//         100% Free Forever
//       </div>
//       <p className="text-center text-xs text-purple-400 mt-2">
//         By creating an account, you agree to preserve and share your family's precious
//         memories with love.
//       </p>

//       {showOtpModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
//           <div className="w-[90%] max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-purple-100">
//             <h3 className="text-xl font-semibold text-center text-purple-700">
//               Verify Email
//             </h3>

//             <p className="text-sm text-center text-purple-500 mt-2 mb-4">
//               We've sent a verification code to
//               <br />
//               <span className="font-medium text-purple-700">
//                 {pendingEmail}
//               </span>
//             </p>

//             <input
//               type="text"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               placeholder="Enter 6-digit OTP"
//               maxLength={6}
//               inputMode="numeric"
//               pattern="[0-9]*"
//               className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none text-center tracking-[0.3em]"
//             />

//             <button
//               onClick={handleVerifyOtp}
//               disabled={loading}
//               className="w-full mt-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white py-2 rounded-md font-medium hover:opacity-90 transition-all"
//             >
//               {loading
//                 ? "Verifying..."
//                 : "Verify & Create Account"}
//             </button>

//             <button
//               type="button"
//               disabled={resendCooldown > 0}
//               onClick={handleResendOtp}
//               className="w-full mt-2 text-sm text-purple-600 hover:underline disabled:text-gray-400 disabled:no-underline"
//             >
//               {resendCooldown > 0
//                 ? `Resend OTP in ${resendCooldown}s`
//                 : "Resend OTP"}
//             </button>

//             <button
//               type="button"
//               disabled={loading}
//               onClick={() => {
//                 setShowOtpModal(false);
//                 setOtp("");
//                 setPendingEmail("");
//                 setResendCooldown(0);
//               }}
//               className="w-full mt-2 text-xs text-gray-500"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//     </motion.div>
//   );
// };

// export default AuthCard;

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import api from "../../utils/axios";
import { useAuth } from "../../utils/authContext";
import { UserPlus, LogIn, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AuthCard = () => {
  const [mode, setMode] = useState("signin");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (mode === "signin") {
        const res = await api.post("/user/login", data);
        await login(res.data.data);
        toast.success("Welcome back! Successfully signed in.");
      } else {
        if (data.password !== data.confirmPassword) {
          toast.error("Passwords do not match!");
          return;
        }
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key !== "confirmPassword") {
            if (key === "profilePhoto" && value.length > 0) {
              formData.append(key, value[0]);
            } else {
              formData.append(key, value);
            }
          }
        });
        await api.post("/user/send-signup-otp", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setPendingEmail(data.email);
        setShowOtpModal(true);
        toast.success("Verification code sent to your email.");
        return;
      }
      if (mode === "signin") { reset(); navigate("/"); }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) { toast.error("Please enter OTP"); return; }
    setLoading(true);
    try {
      const res = await api.post("/user/verify-signup-otp", { email: pendingEmail, otp });
      await login(res.data.data);
      toast.success("Account created successfully! Welcome to FAMLY.");
      setShowOtpModal(false); setOtp(""); setPendingEmail(""); setResendCooldown(0);
      reset(); navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      await api.post("/user/resend-signup-otp", { email: pendingEmail });
      toast.success("A new OTP has been sent.");
      setResendCooldown(30);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to resend OTP");
    }
  };

  const inputClass = (hasError) =>
    `w-full mt-1 px-4 py-2.5 border rounded-xl text-sm transition-all duration-200 outline-none bg-white/80 placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent ${hasError ? "border-red-400 bg-red-50/50" : "border-purple-200 hover:border-purple-300"
    }`;

  const labelClass = "block text-sm font-medium text-purple-700 mb-1";

  return (
    <>
      <style>{`
        .auth-wrapper {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          pointer-events: none;
          z-index: 10;
        }

        .auth-card {
          pointer-events: all;
          width: 100%;
          max-width: 560px;
          /* Fixed height: fills most of the viewport but never overflows */
          height: min(82vh, 720px);
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.90);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(196, 160, 255, 0.35);
          border-radius: 28px;
          box-shadow:
            0 8px 40px rgba(139, 92, 246, 0.18),
            0 2px 8px rgba(139, 92, 246, 0.10);
          overflow: hidden;
        }

        /* Sticky header area (title + tabs) */
        .auth-card-header {
          flex-shrink: 0;
          padding: 36px 36px 0;
        }

        /* Scrollable body */
        .auth-card-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 36px 28px;
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.25) transparent;
        }

        .auth-card-body::-webkit-scrollbar {
          width: 4px;
        }
        .auth-card-body::-webkit-scrollbar-track {
          background: transparent;
        }
        .auth-card-body::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 99px;
        }

        @media (max-width: 600px) {
          .auth-wrapper {
            padding: 16px 12px;
          }
          .auth-card {
            max-width: 100%;
            height: min(88vh, 680px);
            border-radius: 22px;
          }
          .auth-card-header {
            padding: 24px 20px 0;
          }
          .auth-card-body {
            padding: 16px 20px 20px;
          }
        }

        .tab-bar {
          display: flex;
          background: rgba(237, 233, 254, 0.8);
          border-radius: 999px;
          padding: 4px;
          margin-bottom: 24px;
          gap: 4px;
        }

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 12px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.25s ease;
          background: transparent;
          color: #7c3aed99;
        }

        .tab-btn.active {
          background: #ffffff;
          color: #6d28d9;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(109, 40, 217, 0.15);
        }

        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 380px) {
          .field-row {
            grid-template-columns: 1fr;
          }
        }

        .password-wrapper {
          position: relative;
        }

        .password-wrapper input {
          padding-right: 44px;
        }

        .eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #a78bfa;
          padding: 2px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .eye-btn:hover { color: #7c3aed; }

        .submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 16px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
          box-shadow: 0 4px 14px rgba(109, 40, 217, 0.35);
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(109, 40, 217, 0.45);
        }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .file-input {
          width: 100%;
          margin-top: 4px;
          padding: 8px 12px;
          border: 1px dashed rgba(139, 92, 246, 0.4);
          border-radius: 12px;
          font-size: 13px;
          background: rgba(237, 233, 254, 0.3);
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .file-input:hover { border-color: #8b5cf6; }

        .file-input::file-selector-button {
          margin-right: 10px;
          padding: 4px 12px;
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          color: #6d28d9;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .file-input::file-selector-button:hover {
          background: rgba(139, 92, 246, 0.2);
        }

        .select-input {
          width: 100%;
          margin-top: 4px;
          padding: 10px 14px;
          border: 1px solid #e0d4fe;
          border-radius: 12px;
          font-size: 14px;
          background: rgba(255,255,255,0.85);
          color: #4c1d95;
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .select-input:focus {
          border-color: transparent;
          box-shadow: 0 0 0 2px #c4b5fd;
        }

        .error-msg {
          font-size: 11px;
          color: #ef4444;
          margin-top: 3px;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .divider {
          border: none;
          border-top: 1px solid rgba(196, 160, 255, 0.25);
          margin: 20px 0 14px;
        }

        .footer-text {
          text-align: center;
          font-size: 11px;
          color: #a78bfa;
          line-height: 1.5;
        }

        /* OTP Modal */
        .otp-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(76, 29, 149, 0.25);
          backdrop-filter: blur(8px);
          padding: 16px;
        }

        .otp-card {
          width: 100%;
          max-width: 360px;
          background: #fff;
          border-radius: 24px;
          padding: 32px 28px;
          box-shadow: 0 20px 60px rgba(109, 40, 217, 0.2);
          border: 1px solid rgba(196, 160, 255, 0.3);
        }

        .otp-input {
          width: 100%;
          padding: 14px;
          border: 2px solid #e0d4fe;
          border-radius: 14px;
          font-size: 22px;
          text-align: center;
          letter-spacing: 0.5em;
          outline: none;
          color: #4c1d95;
          font-weight: 700;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .otp-input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }

        .resend-btn {
          width: 100%;
          margin-top: 10px;
          padding: 8px;
          background: none;
          border: none;
          font-size: 13px;
          color: #7c3aed;
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .resend-btn:disabled { color: #c4b5fd; cursor: default; }
        .resend-btn:not(:disabled):hover { text-decoration: underline; }

        .cancel-btn {
          width: 100%;
          margin-top: 6px;
          padding: 8px;
          background: none;
          border: none;
          font-size: 12px;
          color: #9ca3af;
          cursor: pointer;
          transition: color 0.2s;
        }

        .cancel-btn:hover { color: #6b7280; }
      `}</style>

      <div className="auth-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="auth-card"
        >
          {/* Sticky Header */}
          <div className="auth-card-header">
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#5b21b6", margin: "0 0 4px" }}>
                Welcome to FAMLY
              </h2>
              <p style={{ fontSize: "13px", color: "#a78bfa", margin: 0 }}>
                Sign in or create a new account
              </p>
            </div>

            {/* Tabs */}
            <div className="tab-bar">
              <button className={`tab-btn ${mode === "signin" ? "active" : ""}`} onClick={() => setMode("signin")}>
                <LogIn size={15} /> Sign In
              </button>
              <button className={`tab-btn ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>
                <UserPlus size={15} /> Create Account
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="auth-card-body">
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {mode === "signup" && (
                <>
                  <div>
                    <label className={labelClass}>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
                    <input
                      type="text"
                      {...register("fullname", { required: true })}
                      placeholder="Enter your full name"
                      className={inputClass(errors.fullname)}
                      autoComplete="name"
                    />
                    {errors.fullname && <p className="error-msg">Full name is required</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Username <span style={{ color: "#ef4444" }}>*</span></label>
                    <input
                      type="text"
                      {...register("username", {
                        required: "Username is required",
                        pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Letters, numbers, and underscores only" },
                      })}
                      placeholder="Choose a unique username"
                      className={inputClass(errors.username)}
                      autoComplete="username"
                    />
                    {errors.username && <p className="error-msg">{errors.username.message}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Email Address <span style={{ color: "#ef4444" }}>*</span></label>
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/, message: "Must be a @gmail.com address" },
                      })}
                      placeholder="your@gmail.com"
                      className={inputClass(errors.email)}
                      autoComplete="email"
                    />
                    {errors.email && <p className="error-msg">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Phone Number <span style={{ color: "#ef4444" }}>*</span></label>
                    <input
                      type="tel"
                      {...register("phone_no", {
                        required: "Phone number is required",
                        pattern: { value: /^[0-9]{10}$/, message: "Must be exactly 10 digits" },
                      })}
                      placeholder="10-digit mobile number"
                      className={inputClass(errors.phone_no)}
                      autoComplete="tel"
                    />
                    {errors.phone_no && <p className="error-msg">{errors.phone_no.message}</p>}
                  </div>

                  <div className="field-row">
                    <div>
                      <label className={labelClass}>Date of Birth <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="date"
                        {...register("dob", { required: true })}
                        className={inputClass(errors.dob)}
                        autoComplete="bday"
                      />
                      {errors.dob && <p className="error-msg">Required</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Gender <span style={{ color: "#ef4444" }}>*</span></label>
                      <select {...register("gender", { required: true })} className="select-input" autoComplete="sex">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      {errors.gender && <p className="error-msg">Required</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Profile Photo{" "}
                      <span style={{ fontSize: "11px", color: "#c4b5fd", fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input
                      type="file"
                      {...register("profilePhoto")}
                      className="file-input"
                      accept="image/*"
                    />
                  </div>
                </>
              )}

              {mode === "signin" && (
                <div>
                  <label className={labelClass}>Email, Phone, or Username</label>
                  <input
                    type="text"
                    {...register("identifier", { required: true })}
                    placeholder="Email, phone, or username"
                    className={inputClass(errors.identifier)}
                    autoComplete="username"
                  />
                  {errors.identifier && <p className="error-msg">This field is required</p>}
                  <p style={{ fontSize: "11px", color: "#c4b5fd", marginTop: "4px" }}>
                    You can use your email, phone number, or username
                  </p>
                </div>
              )}

              <div>
                <label className={labelClass}>Password <span style={{ color: "#ef4444" }}>*</span></label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", { required: true })}
                    placeholder={mode === "signin" ? "Enter your password" : "Create a strong password"}
                    className={inputClass(errors.password)}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="error-msg">Password is required</p>}
              </div>

              {mode === "signup" && (
                <div>
                  <label className={labelClass}>Confirm Password <span style={{ color: "#ef4444" }}>*</span></label>
                  <div className="password-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword", { required: true })}
                      placeholder="Re-enter your password"
                      className={inputClass(errors.confirmPassword)}
                      autoComplete="new-password"
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="error-msg">Please confirm your password</p>}
                </div>
              )}

              <button type="submit" disabled={loading} className="submit-btn" style={{ marginTop: "4px" }}>
                {loading ? (
                  "Processing…"
                ) : (
                  <>
                    {mode === "signin" ? <LogIn size={16} /> : <UserPlus size={16} />}
                    {mode === "signin" ? "Sign In" : "Create Account"}
                  </>
                )}
              </button>
            </form>

            <hr className="divider" />
            <p className="footer-text">
              100% Free Forever
              <br />
              By signing up, you agree to preserve and share your family's precious memories with love.
            </p>
          </div>{/* end auth-card-body */}
        </motion.div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="otp-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="otp-card"
          >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px", fontSize: "22px"
              }}>✉️</div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#5b21b6", margin: "0 0 6px" }}>
                Verify your email
              </h3>
              <p style={{ fontSize: "13px", color: "#a78bfa", margin: 0, lineHeight: 1.5 }}>
                We sent a 6-digit code to<br />
                <strong style={{ color: "#6d28d9" }}>{pendingEmail}</strong>
              </p>
            </div>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
              className="otp-input"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="submit-btn"
              style={{ marginTop: "16px" }}
            >
              {loading ? "Verifying…" : "Verify & Create Account"}
            </button>

            <button type="button" disabled={resendCooldown > 0} onClick={handleResendOtp} className="resend-btn">
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => { setShowOtpModal(false); setOtp(""); setPendingEmail(""); setResendCooldown(0); }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default AuthCard;
