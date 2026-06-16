// // components/family/JoinFamilyCard.jsx
// import React, { useState } from "react";
// import api from "../../utils/axios";
// import { useNavigate } from "react-router-dom";
// export default function JoinFamilyCard() {
//   const navigate = useNavigate();
//   const [invitationCode, setInvitationCode] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: "", text: "" });

//   const handleJoinFamily = async (e) => {
//     e.preventDefault();

//     if (!invitationCode.trim()) {
//       setMessage({ type: "error", text: "Please enter a valid invitation code" });
//       return;
//     }

//     try {
//       setLoading(true);
//       setMessage({ type: "", text: "" });

//       // Call backend to join family
//       const res = await api.post("/family/join-family", {
//         invitation_code: invitationCode.trim(),
//       });

//       setMessage({ type: "success", text: "Joined family successfully!" });
//       setInvitationCode("");
//       console.log("Joined family:", res.data.data);
//       navigate("/Dashboard")
//     } catch (err) {
//       console.error("Error joining family:", err);
//       const msg =
//         err.response?.data?.message || "Failed to join family. Try again.";
//       setMessage({ type: "error", text: msg });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-lg border border-purple-200 p-6 max-w-md mx-auto mt-6">
//       <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">
//         Join a Family
//       </h2>
//       <p className="text-gray-600 text-center mb-6">
//         Enter your family invitation code to join a family.
//       </p>

//       {message.text && (
//         <div
//           className={`text-center mb-4 px-4 py-2 rounded-lg ${
//             message.type === "error"
//               ? "bg-red-100 text-red-700 border border-red-300"
//               : "bg-green-100 text-green-700 border border-green-300"
//           }`}
//         >
//           {message.text}
//         </div>
//       )}

//       <form onSubmit={handleJoinFamily} className="space-y-4">
//         <div>
//           <label
//             htmlFor="invitationCode"
//             className="block text-sm font-semibold text-gray-700 mb-2"
//           >
//             Invitation Code
//           </label>
//           <input
//             id="invitationCode"
//             type="text"
//             value={invitationCode}
//             onChange={(e) => setInvitationCode(e.target.value)}
//             placeholder="e.g., FAM-APCGCX"
//             className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
//             required
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className={`w-full py-2 rounded-lg text-white font-semibold transition duration-200 ${
//             loading
//               ? "bg-purple-400 cursor-not-allowed"
//               : "bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:shadow-lg"
//           }`}
//         >
//           {loading ? "Joining..." : "Join Family"}
//         </button>
//       </form>
//     </div>
//   );
// }

import React, { useState } from "react";
import api from "../../utils/axios";
import { Key, Send, CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react";

export default function JoinFamilyCard() {
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    if (!invitationCode.trim()) {
      setResult({ type: "error", text: "Please enter a valid invitation code" });
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      await api.post("/family/join-family", { invitation_code: invitationCode.trim().toUpperCase() });
      setResult({
        type: "success",
        text: "Join request sent to the family admin! You'll be notified once they accept or decline.",
      });
      setInvitationCode("");
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send join request. Try again.";
      setResult({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Key size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Join a Family</h2>
              <p className="text-teal-100 text-sm mt-0.5">Use an invitation code to request entry</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* How it works */}
          {!submitted && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-teal-800 mb-2">How it works</p>
              <div className="space-y-2 text-sm text-teal-700">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">1</span>
                  <p>Enter the family invitation code shared by the admin</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">2</span>
                  <p>Your request is sent to the family admin for review</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">3</span>
                  <p>You'll receive a notification once they decide</p>
                </div>
              </div>
            </div>
          )}

          {/* Result feedback */}
          {result && (
            <div className={`flex items-start gap-3 p-4 rounded-xl mb-5 border ${result.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
              }`}>
              {result.type === "error"
                ? <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                : result.type === "pending"
                  ? <Clock size={18} className="flex-shrink-0 mt-0.5" />
                  : <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
              }
              <p className="text-sm font-medium">{result.text}</p>
            </div>
          )}

          {!submitted ? (
            <form onSubmit={handleJoinFamily} className="space-y-4">
              <div>
                <label htmlFor="invitationCode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Invitation Code
                </label>
                <input
                  id="invitationCode"
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  placeholder="e.g., FAM-APCGCX"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition tracking-wider"
                  required
                />
                <p className="text-xs text-gray-500 mt-1.5">Codes look like FAM-XXXXXX (case insensitive)</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:shadow-lg hover:shadow-teal-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending Request...</>
                ) : (
                  <><Send size={16} /> Send Join Request</>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={28} className="text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Request Sent!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your request is now with the family admin. Check your notifications for updates.
              </p>
              <button
                onClick={() => { setSubmitted(false); setResult(null); }}
                className="text-sm text-teal-600 font-semibold hover:underline"
              >
                Send another request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

