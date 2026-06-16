

// import React, { useState } from "react";
// import api from "../../utils/axios";

// export default function AddMemberCard({ familyId }) {
//   const [username, setUsername] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: "", text: "" });

//   const handleAddMember = async (e) => {
//     e.preventDefault();

//     if (!username.trim()) {
//       setMessage({ type: "error", text: "Please enter a valid username" });
//       return;
//     }

//     try {
//       setLoading(true);
//       setMessage({ type: "", text: "" });

//       const res = await api.post(`/family/add-member/${familyId}`, {
//         username: username.trim(),
//       });

//       setMessage({ type: "success", text: "Member added successfully!" });
//       setUsername("");
//       console.log("Member added:", res.data);
//     } catch (err) {
//       console.error("Error adding member:", err);
//       const message =
//         err.response?.data?.message || "Failed to add member. Try again.";
//       setMessage({ type: "error", text: message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-lg border border-purple-200 p-8 max-w-lg mx-auto">
//       <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">
//         Add New Member
//       </h2>
//       <p className="text-gray-600 text-center mb-6">
//         Add an existing user to this family by entering their username.
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

//       <form onSubmit={handleAddMember} className="space-y-4">
//         <div>
//           <label
//             htmlFor="username"
//             className="block text-sm font-semibold text-gray-700 mb-2"
//           >
//             Enter Username
//           </label>
//           <input
//             id="username"
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             placeholder="e.g., john_doe"
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
//           {loading ? "Adding..." : "Add Member"}
//         </button>
//       </form>
//     </div>
//   );
// }

import React, { useState } from "react";
import api from "../../utils/axios";
import { UserPlus, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function AddMemberCard({ familyId, onSuccess }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { type: "success"|"error", text: "" }

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setResult({ type: "error", text: "Please enter a valid username" });
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      await api.post(`/family/add-member/${familyId}`, { username: username.trim() });
      setResult({
        type: "success",
        text: `Invitation sent! The user will receive a notification to accept or decline.`,
      });
      setUsername("");
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send invitation. Try again.";
      setResult({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Add Family Member</h2>
              <p className="text-purple-100 text-sm mt-0.5">Send an invitation to join</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
            <Send size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              An invitation notification will be sent to the user. They must <strong>accept</strong> to officially join the family.
            </p>
          </div>

          {/* Result feedback */}
          {result && (
            <div className={`flex items-start gap-3 p-4 rounded-xl mb-5 border ${result.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
              }`}>
              {result.type === "error"
                ? <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                : <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
              }
              <p className="text-sm font-medium">{result.text}</p>
            </div>
          )}

          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., john_doe"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                required
              />
              <p className="text-xs text-gray-500 mt-1.5">Enter the exact username of the person you want to invite.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:shadow-lg hover:shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Sending Invitation...</>
              ) : (
                <><Send size={16} /> Send Invitation</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
